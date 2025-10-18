import puppeteer from "puppeteer-extra";
import type { Browser, Page } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";

dotenv.config();
puppeteer.use(StealthPlugin());

interface Product {
  name: string;
  image: string;
  currentPrice: string;
  originalPrice: string;
  discountRate?: string;
  link: string;
  platform: string;
  rating?: string;
  soldCount?: string;
}


const runningRequests = new Map<string, boolean>();


const randomDelay = (min: number, max: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));


const humanMouseMovement = async (page: Page): Promise<void> => {
  await page.mouse.move(Math.random() * 1200, Math.random() * 800);
};


const scrollRandomly = async (page: Page): Promise<void> => {
  const scrolls = Math.floor(Math.random() * 4) + 2; 
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, Math.random() * 400 + 200);
    });
    await randomDelay(1000, 3000); 
  }
};


const scrapeLazada = async (page: Page): Promise<Product[]> => {
  console.log("🔍 Starting Lazada scraping...");

  const lazadaUrls = [
    "https://www.lazada.com.ph/catalog/?q=apparel",
    "https://www.lazada.com.ph/tag/apparel/",
    "https://www.lazada.com.ph/categories/fashion-womens/",
    "https://www.lazada.com.ph/categories/fashion-mens/",
  ];

  for (const url of lazadaUrls) {
    try {
      console.log(`🌐 Visiting: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      await randomDelay(3000, 6000);
      await humanMouseMovement(page);
      await scrollRandomly(page);
      await randomDelay(2000, 4000);

      
      const selector = ".Bm3ON, [data-qa-locator='product-item'], .cRjKsc, .buTCk";
      await page.waitForSelector(selector, { timeout: 10000 });

      const products = await page.evaluate((selector: string) => {
        const items: Product[] = [];
        const elements = document.querySelectorAll(selector);

        elements.forEach((el, i) => {
          if (i >= 20) return;

          const nameEl =
            el.querySelector(".RfADt a") ||
            el.querySelector("[data-qa-locator='product-name']") ||
            el.querySelector("a[title]");
          const name = nameEl?.textContent?.trim() || "";
          let link = (nameEl as HTMLAnchorElement)?.href || "";

          if (link && !link.startsWith("http")) {
            link = link.startsWith("//") ? `https:${link}` : `https://www.lazada.com.ph${link}`;
          }

          const imgEl = el.querySelector("img") as HTMLImageElement | null;
          let image = imgEl?.src || imgEl?.getAttribute("data-src") || "";
          if (image.includes("_80x80")) {
            image = image.replace("_80x80", "_200x200");
          }

          const priceEl =
            el.querySelector(".ooOxS") || el.querySelector("[data-qa-locator='product-price']");
          const currentPrice = priceEl?.textContent?.trim() || "";

          const originalEl = el.querySelector(".WNoq3, del, .original-price");
          const originalPrice = originalEl?.textContent?.trim() || currentPrice;

          const discountEl = el.querySelector(".IcOsH, [data-qa-locator='product-discount']");
          const discountRate = discountEl?.textContent?.trim() || "";

          const ratingEl = el.querySelector(".mdmmT, .rating");
          const rating = ratingEl?.textContent?.trim() || "";

          const soldEl = el.querySelector("._1cEkb, .sold-count");
          const soldCount = soldEl?.textContent?.trim() || "";

          if (name && image && link) {
            items.push({
              name,
              image,
              currentPrice,
              originalPrice,
              discountRate,
              link,
              platform: "Lazada",
              rating,
              soldCount,
            });
          }
        });

        return items;
      }, selector);

      if (products.length > 0) {
        console.log(`Lazada: Found ${products.length} products`);
        return products;
      }
    } catch (err) {
      console.log(`Failed for URL ${url}:`, (err as Error).message);
      await randomDelay(2000, 5000); 
      continue;
    }
  }

  console.log("No Lazada products scraped");
  return [];
};

// API handler (Lazada only)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestKey = req.url + JSON.stringify(req.query);
  if (runningRequests.has(requestKey)) {
    return res.status(429).json({ error: "Request already in progress" });
  }
  runningRequests.set(requestKey, true);

  let browser: Browser | undefined;
  try {
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = Math.floor(Math.random() * 1000000);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        `--proxy-server=http=brd.superproxy.io:${port}`,
        "--window-size=1366,768",
      ],
    });

    const page = await browser.newPage();
    await page.authenticate({
      username: `${username}-session-${session_id}`,
      password,
    });

    const lazadaProducts = await scrapeLazada(page);

    res.status(200).json(
      lazadaProducts
    );
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  } finally {
    runningRequests.delete(requestKey);
    if (browser) await browser.close();
  }
}
