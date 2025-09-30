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
  const scrolls = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, Math.random() * 300 + 100);
    });
    await randomDelay(500, 1500);
  }
};

// --- Enhanced scrolling function ---
const deepScroll = async (page: Page): Promise<void> => {
  console.log("🔄 Performing deep scroll to trigger lazy-loaded content...");
  try {
    await page.evaluate(async () => {
      await new Promise<void>(resolve => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 300);
      });
    });
  } catch (err) {
    console.warn("⚠️ Deep scroll failed:", err);
  }
};

// --- Session management ---
let stickySession: number | null = null;
let sessionUseCount = 0;
const MAX_SESSION_USES = 5;

function getSessionId(useSticky = true): number {
  if (useSticky && stickySession && sessionUseCount < MAX_SESSION_USES) {
    sessionUseCount++;
    console.log(`🔄 Reusing sticky session: ${stickySession} (use #${sessionUseCount})`);
    return stickySession;
  }
  
  const newSession = Math.floor(Math.random() * 1000000);
  if (useSticky) {
    stickySession = newSession;
    sessionUseCount = 1;
    console.log(`🆕 Created new sticky session: ${newSession}`);
  } else {
    console.log(`🎲 Using one-time session: ${newSession}`);
  }
  
  return newSession;
}

// --- IMPROVED: Extract product data with better error handling ---
async function extractProductData(page: Page): Promise<any> {
  // Wait for page to be fully loaded
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 }).catch(() => {});
  
  // Wait specifically for price elements to appear
  console.log("⏳ Waiting for price elements...");
  try {
    await page.waitForSelector(".pdp-v2-product-price-content-salePrice-amount", { timeout: 15000 });
    console.log("✅ Price element found!");
  } catch (err) {
    console.warn("⚠️ Price selector timeout, trying alternative selectors...");
    await page.waitForSelector('[class*="price"]', { timeout: 5000 }).catch(() => {});
  }
  
  // Try JSON extraction first
  try {
    const jsonData = await page.evaluate(() => {
      try {
        const script = Array.from(document.querySelectorAll('script'))
          .find(s => s.textContent?.includes('__NEXT_DATA__'));
        return script ? JSON.parse(script.textContent!) : null;
      } catch {
        return null;
      }
    });

    if (jsonData) {
      const product =
        jsonData.props?.pageProps?.product ||
        jsonData.props?.apolloState ||
        jsonData?.props?.pageProps;

      if (product?.name || product?.price) {
        console.log("✅ Extracted from JSON!");
        return {
          title: product?.name || "",
          currentPrice: product?.price?.displayPrice || "",
          originalPrice: product?.price?.originalPrice || "",
          discount: product?.price?.discount || "",
          imageUrl: product?.images?.[0] || "",
          source: "json"
        };
      }
    }
  } catch (err) {
    console.warn("⚠️ JSON extraction failed:", err);
  }

  // DOM extraction with better selectors
  try {
    const productData = await page.evaluate(() => {
      // Helper function to safely get text
      const getText = (selector: string): string => {
        try {
          const el = document.querySelector(selector);
          const text = el?.textContent?.trim() || "";
          if (text) console.log(`✓ Found text for ${selector}:`, text);
          return text;
        } catch {
          return "";
        }
      };

      // Helper to get attribute
      const getAttr = (selector: string, attr: string): string => {
        try {
          const el = document.querySelector(selector);
          return el?.getAttribute(attr) || "";
        } catch {
          return "";
        }
      };

      // Title extraction
      const title = 
        getText("h1.pdp-mod-product-badge-title") ||
        getText("h1[data-qa-locator='product-title']") ||
        getText(".pdp-mod-product-badge-title") ||
        getText("h1") ||
        getAttr('meta[property="og:title"]', 'content') ||
        document.title;

      console.log('🔍 Attempting price extraction...');
      
      // Price extraction - direct targeting based on your HTML structure
      const currentPriceSign = getText(".pdp-v2-product-price-content-salePrice-sign");
      const currentPriceAmount = getText(".pdp-v2-product-price-content-salePrice-amount");
      
      console.log('Price sign:', currentPriceSign);
      console.log('Price amount:', currentPriceAmount);
      
      const currentPrice = currentPriceSign && currentPriceAmount 
        ? `${currentPriceSign}${currentPriceAmount}` 
        : (getText(".pdp-v2-product-price-content-salePrice-amount") ||
           getText("[data-qa-locator='product-price']") ||
           getText(".pdp-price_color_orange") ||
           getText('[class*="salePrice"]') ||
           getText(".pdp-product-price"));

      const originalPrice = 
        getText(".pdp-v2-product-price-content-originalPrice-amount") ||
        getText(".pdp-price_type_deleted") ||
        getText('[class*="originalPrice"]') ||
        getText("del");

      const discount = 
        getText(".pdp-v2-product-price-content-originalPrice-discount") ||
        getText(".pdp-discount-rate") ||
        getText('[class*="discount"]');

      console.log('Final extracted prices:', { currentPrice, originalPrice, discount });

      // Image extraction
      const imgEl = document.querySelector(".gallery-preview-panel-v2__image") as HTMLImageElement ||
                    document.querySelector(".pdp-mod-common-image") as HTMLImageElement ||
                    document.querySelector('[data-qa-locator="product-image"]') as HTMLImageElement;
      
      let imageUrl = imgEl?.src || 
                     imgEl?.getAttribute("data-src") || 
                     getAttr('meta[property="og:image"]', 'content');

      // Upgrade image quality
      if (imageUrl && imageUrl.includes("_720x720q80")) {
        imageUrl = imageUrl.replace("_720x720q80", "_2000x2000q80");
      }

      return { title, currentPrice, originalPrice, discount, imageUrl, source: "dom" };
    });

    console.log("✅ Extracted from DOM:", productData);
    return productData;
  } catch (err) {
    console.error("❌ DOM extraction failed:", err);
    throw new Error("Failed to extract product data from DOM");
  }
}

// --- Enhanced Puppeteer scraping for Lazada ---
async function scrapeLazadaWithPuppeteer(url: string, useSticky = true, maxRetries = 3) {
  let browser: Browser | undefined;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const username = String(process.env.BRIGHT_DATA_USERNAME);
      const password = String(process.env.BRIGHT_DATA_PASSWORD);
      const port = 33335;
      const session_id = getSessionId(useSticky);

      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
          `--proxy-server=http=brd.superproxy.io:${port}`,
          "--window-size=1920,1080",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });

      const page = await browser.newPage();

      // Suppress console logs except errors
      page.on("console", (msg) => {
        if (msg.type() === 'error') {
          console.log("🔍 Page error:", msg.text());
        } else if (msg.text().includes('✓') || msg.text().includes('🔍') || msg.text().includes('Price')) {
          // Show our debug logs
          console.log("🔍 Page log:", msg.text());
        }
      });

      // Intercept and allow blocked requests
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        // Allow all requests, don't block anything
        request.continue();
      });

      await page.setViewport({ width: 1920, height: 1080 });

      await page.authenticate({
        username: `${username}-session-${session_id}`,
        password,
      });

      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Upgrade-Insecure-Requests": "1",
      });

      // Anti-detection
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      });

      console.log(`🌐 Loading Lazada product: ${url} (Attempt ${attempt + 1})`);
      
      // Navigate with better error handling
      await page.goto(url, { 
        waitUntil: "domcontentloaded", 
        timeout: 45000 
      });

      // Wait for initial load
      await randomDelay(5000, 7000); // Increased from 3-5s
      
      // Human-like behavior
      await humanMouseMovement(page);
      await randomDelay(1000, 2000);
      await scrollRandomly(page);
      await randomDelay(2000, 3000); // Increased

      // Wait for product content
      console.log("⏳ Waiting for product data...");
      await Promise.race([
        page.waitForSelector("h1", { timeout: 20000 }),
        page.waitForSelector('[class*="price"]', { timeout: 20000 }),
        randomDelay(20000, 20000)
      ]).catch(() => console.warn("⚠️ Selector timeout, proceeding anyway..."));

      // Deep scroll
      await deepScroll(page);
      await randomDelay(3000, 4000); // Increased from 2-3s

      // Take a screenshot for debugging
      console.log("📸 Taking screenshot for debugging...");
      await page.screenshot({ path: 'lazada-debug.png', fullPage: false });

      // Try to get raw HTML and parse with Cheerio as fallback
      const htmlContent = await page.content();
      console.log("🔍 Checking for price in raw HTML with Cheerio...");
      
      const $html = cheerio.load(htmlContent);
      const htmlPrice = $html('.pdp-v2-product-price-content-salePrice-amount').text().trim();
      const htmlOrigPrice = $html('.pdp-v2-product-price-content-originalPrice-amount').text().trim();
      const htmlDiscount = $html('.pdp-v2-product-price-content-originalPrice-discount').text().trim();
      
      if (htmlPrice) {
        console.log("✅ Found in HTML via Cheerio - Price:", htmlPrice, "Original:", htmlOrigPrice, "Discount:", htmlDiscount);
      } else {
        console.log("❌ No price found in HTML via Cheerio");
      }

      // Extract data with retries
      let productData: any = null;
      let extractAttempt = 0;
      const maxExtractRetries = 2;

      while (!productData && extractAttempt <= maxExtractRetries) {
        try {
          productData = await extractProductData(page);
          
          // Validate extraction - check if we have either title or price
          if (!productData.title && !productData.currentPrice) {
            if (extractAttempt < maxExtractRetries) {
              console.warn(`⚠️ No data extracted, retrying... (${extractAttempt + 1}/${maxExtractRetries})`);
              await randomDelay(2000, 3000);
              await scrollRandomly(page);
              productData = null;
            }
          } else if (productData.title && !productData.currentPrice) {
            console.warn("⚠️ Title found but price missing - proceeding anyway");
            // Don't null out productData, we'll use what we have
            break;
          } else {
            // We have both title and price
            break;
          }
        } catch (err) {
          console.error(`❌ Extract attempt ${extractAttempt + 1} failed:`, err);
        }
        extractAttempt++;
      }

      await browser.close();

      // Final validation
      if (!productData || !productData.title || productData.title === "Error") {
        throw new Error("Failed to extract meaningful product data");
      }

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
      if (browser) {
        await browser.close().catch(() => {});
      }
      
      attempt++;
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      
      if (attempt <= maxRetries) {
        console.log(`🔄 Retrying... (${attempt}/${maxRetries})`);
        // Force new session on retry
        stickySession = null;
        sessionUseCount = 0;
        await randomDelay(5000, 8000);
      } else {
        console.error("❌ All retry attempts exhausted");
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
  }

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
    error: "Max retries exceeded",
  };
}

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

// --- Main scraper function ---
export async function scrapeProduct(url: string) {
  // Lazada
  if (url.includes("lazada.")) {
    console.log("🤖 Using Enhanced Puppeteer for Lazada...");
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

// --- Utility functions ---
export function resetSession() {
  stickySession = null;
  sessionUseCount = 0;
  console.log("🔄 Session reset");
}

export function getSessionInfo() {
  return {
    currentSession: stickySession,
    useCount: sessionUseCount,
    maxUses: MAX_SESSION_USES
  };
}