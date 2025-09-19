import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import type { Browser, Page } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

dotenv.config();
puppeteer.use(StealthPlugin());

// --- Helper functions ---
function cleanPrice(price: string) {
  if (!price) return "";
  const matches = price.match(/\d+[.,]?\d*/g);
  return matches ? matches[0] : price;
}

function normalizePrice(price: string) {
  if (!price) return "";
  return price.replace(/[^\d.]/g, "");
}

function cleanDiscount(discount: string) {
  if (!discount) return "0%";
  const match = discount.match(/-?\d+%/);
  return match ? match[0] : discount;
}

// --- Anti-detection helpers ---
const randomDelay = (min: number, max: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));

const humanMouseMovement = async (page: Page): Promise<void> => {
  await page.mouse.move(Math.random() * 1200, Math.random() * 800);
};

const scrollRandomly = async (page: Page): Promise<void> => {
  const scrolls = Math.floor(Math.random() * 3) + 1; // 1-3 scrolls
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, Math.random() * 300 + 100);
    });
    await randomDelay(500, 1500);
  }
};

// --- Fetch with retry for Cheerio ---
async function fetchHTML(url: string, options: any, retries = 2): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await axios.get(url, options);
      return res.data;
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`Fetch attempt ${i + 1} failed, retrying...`);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  return "";
}

// --- Puppeteer scraping for Lazada ---
// --- Puppeteer scraping for Lazada (enhanced with JSON extraction) ---
async function scrapeLazadaWithPuppeteer(url: string) {
  let browser: Browser | undefined;

  try {
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 33335;
    const session_id = Math.floor(Math.random() * 1000000);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        `--proxy-server=http=brd.superproxy.io:${port}`,
        "--window-size=1366,768",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled"
      ],
    });

    const page = await browser.newPage();

    page.on("console", (msg) => console.log("🔍 Page log:", msg.text()));
    await page.setViewport({ width: 1366, height: 768 });

    await page.authenticate({
      username: `${username}-session-${session_id}`,
      password,
    });

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "max-age=0",
    });

    // Override navigator.webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    console.log(`🌐 Loading Lazada product: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    await randomDelay(2000, 4000);
    await humanMouseMovement(page);
    await randomDelay(1000, 2000);
    await scrollRandomly(page);
    await randomDelay(1500, 3000);

    // --- Try JSON extraction first ---
    let productData: any = null;
    try {
      const jsonData = await page.evaluate(() => {
        const script = Array.from(document.querySelectorAll('script'))
          .find(s => s.textContent?.includes('__NEXT_DATA__'));
        return script ? JSON.parse(script.textContent!) : null;
      });

      if (jsonData) {
        const product =
          jsonData.props?.pageProps?.product ||
          jsonData.props?.apolloState ||
          jsonData?.props?.pageProps;

        productData = {
          title: product?.name || document.title,
          currentPrice: product?.price?.displayPrice || "",
          originalPrice: product?.price?.originalPrice || "",
          discount: product?.price?.discount || "",
          imageUrl: product?.images?.[0] || "",
        };

        console.log("✅ Lazada product extracted from JSON!");
      }
    } catch (err) {
      console.warn("⚠️ JSON extraction failed, falling back to DOM scraping...");
    }

    // --- Fallback: DOM scraping if JSON fails ---
    if (!productData) {
      try {
        await page.waitForSelector(".pdp-v2-product-price-content-salePrice-amount", { timeout: 10000 });
      } catch {
        await page.waitForSelector('[class*="price"], [data-qa-locator*="price"], .pdp-price', { timeout: 5000 });
      }

      productData = await page.evaluate(() => {
        const pageTitle = document.title;

        const title =
          document.querySelector("h1.pdp-mod-product-badge-title")?.textContent?.trim() ||
          document.querySelector("h1[data-qa-locator='product-title']")?.textContent?.trim() ||
          document.querySelector(".pdp-mod-product-badge-title")?.textContent?.trim() ||
          document.querySelector("h1")?.textContent?.trim() ||
          pageTitle;

        const currentPriceEl =
          document.querySelector(".pdp-v2-product-price-content-salePrice-amount") ||
          document.querySelector("[data-qa-locator='product-price']") ||
          document.querySelector(".pdp-price_color_orange") ||
          document.querySelector('[class*="salePrice"]') ||
          document.querySelector('[class*="price"][class*="current"]');
        const currentPrice = currentPriceEl?.textContent?.trim() || "";

        const originalPriceEl =
          document.querySelector(".pdp-v2-product-price-content-originalPrice-amount") ||
          document.querySelector(".pdp-price_type_deleted") ||
          document.querySelector('[class*="originalPrice"]') ||
          document.querySelector("del") ||
          document.querySelector('[class*="price"][class*="original"]');
        const originalPrice = originalPriceEl?.textContent?.trim() || "";

        const discountEl =
          document.querySelector(".pdp-v2-product-price-content-originalPrice-discount") ||
          document.querySelector(".pdp-discount-rate") ||
          document.querySelector('[class*="discount"]') ||
          document.querySelector('[class*="save"]');
        const discount = discountEl?.textContent?.trim() || "";

        const imageEl =
          document.querySelector(".gallery-preview-panel-v2__image") as HTMLImageElement ||
          document.querySelector(".pdp-mod-common-image") as HTMLImageElement ||
          document.querySelector('[data-qa-locator="product-image"]') as HTMLImageElement ||
          document.querySelector(".pdp-product-image") as HTMLImageElement ||
          document.querySelector('img[class*="gallery"]') as HTMLImageElement;

        let imageUrl = imageEl?.src || imageEl?.getAttribute("data-src") || document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";

        if (imageUrl && imageUrl.includes("_720x720q80")) {
          imageUrl = imageUrl.replace("_720x720q80", "_2000x2000q80");
        }

        return { title, currentPrice, originalPrice, discount, imageUrl };
      });
    }

    await browser.close();

    return {
      title: productData.title,
      currentPrice: cleanPrice(productData.currentPrice) || "Price not available",
      currentPriceValue: parseFloat(normalizePrice(productData.currentPrice)) || null,
      originalPrice: cleanPrice(productData.originalPrice) || "N/A",
      originalPriceValue: parseFloat(normalizePrice(productData.originalPrice)) || null,
      discount: cleanDiscount(productData.discount) || "0%",
      imageUrl: productData.imageUrl,
      url,
      platform: "Lazada",
      status: "success",
    };
  } catch (err: any) {
    if (browser) await browser.close();
    console.error("Puppeteer Lazada scraping failed:", err.message);

    return {
      title: "Error",
      currentPrice: "Price not available",
      currentPriceValue: null,
      originalPrice: "N/A",
      originalPriceValue: null,
      discount: "0%",
      imageUrl: "",
      url,
      platform: "Lazada",
      status: "error",
      error: err.message,
    };
  }
}


// --- Main scraper function ---
export async function scrapeProduct(url: string) {
  // Lazada
  if (url.includes("lazada.")) {
    console.log("🤖 Using Puppeteer for Lazada...");
    return await scrapeLazadaWithPuppeteer(url);
  }

  // Amazon
  let html: string | null = null;
  try {
    html = await fetchHTML(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 20000,
    });
  } catch (err) {
    console.error("Amazon scraping failed:", err);
    return {
      title: "Error",
      currentPrice: "Price not available",
      currentPriceValue: null,
      originalPrice: "N/A",
      originalPriceValue: null,
      discount: "0%",
      imageUrl: "",
      url,
      platform: "Amazon",
      status: "error",
      error: (err as Error).message,
    };
  }

  const $ = cheerio.load(html || "");
  const title =
    $("#productTitle").text().trim() ||
    $("h1").first().text().trim() ||
    $('[data-testid="product-title"]').text().trim() ||
    $(".product-title").text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() ||
    "Title not found";

  const priceSymbol = $(".a-price-symbol").first().text().trim() || "$";
  const priceWhole = $(".a-price-whole").first().text().replace(/[^\d]/g, "") || "0";
  const priceFraction = $(".a-price-fraction").first().text().trim() || "00";

  const currentPrice =
    $(".a-price.priceToPay .a-offscreen").text().trim() ||
    `${priceSymbol}${priceWhole}.${priceFraction}`;
  const originalPrice =
    $(".a-price.a-text-price .a-offscreen").first().text().trim() ||
    $("span.a-color-secondary .a-offscreen").first().text().trim();
  const discount =
    $(".savingsPercentage").first().text().trim() ||
    $(".percent-off").first().text().trim() ||
    "0%";

  const imageUrl =
    $("#landingImage").attr("data-old-hires") ||
    $("#landingImage").attr("src") ||
    $('meta[property="og:image"]').attr("content") ||
    "";

  const productData = {
    title,
    currentPrice: currentPrice || "Price not available",
    currentPriceValue: parseFloat(normalizePrice(currentPrice)) || null,
    originalPrice: originalPrice || "N/A",
    originalPriceValue: parseFloat(normalizePrice(originalPrice)) || null,
    discount,
    imageUrl,
    url,
    platform: "Amazon",
    status: "success",
  };

  console.log("✅ Scraped product data:", productData);
  return productData;
}
