import puppeteer from "puppeteer-extra";
import type { Browser, Page } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";
import * as fs from 'fs';
import axios from 'axios';

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

/** Delay helper function */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function loadLazadaCookiesFromFile(cookieFile?: string) {
  const defaultPath = cookieFile || process.env.LAZADA_COOKIES_FILE || './secrets/lazada_cookies.json';
  if (!fs.existsSync(defaultPath)) {
    console.warn(`Lazada cookie file not found at ${defaultPath}`);
    return [];
  }

  try {
    const raw = fs.readFileSync(defaultPath, 'utf8');
    const arr = JSON.parse(raw) as Array<any>;
    const cookies = arr.map((c) => {
      const cookie: any = {
        name: c.name,
        value: c.value,
        domain: c.domain || '.lazada.com.ph',
        path: c.path || '/',
        httpOnly: !!c.httpOnly,
        secure: !!c.secure,
      };
      const expires = c.expirationDate || c.expiry || c.expires;
      if (expires && typeof expires === 'number') cookie.expires = Math.floor(expires);
      return cookie;
    });
    return cookies;
  } catch (err) {
    console.warn('Failed to parse lazada cookies file:', err);
    return [];
  }
}

/** 2Captcha solver */
async function solveRecaptcha(sitekey: string, pageurl: string): Promise<string> {
  const API_KEY = process.env.TWO_CAPTCHA_API_KEY;
  if (!API_KEY) throw new Error('Missing TWO_CAPTCHA_API_KEY');

  const submitUrl = `http://2captcha.com/in.php?key=${API_KEY}&method=userrecaptcha&googlekey=${sitekey}&pageurl=${encodeURIComponent(pageurl)}&json=1`;
  const res = await axios.get(submitUrl);
  const requestId = res.data.request;

  for (let i = 0; i < 20; i++) {
    await delay(5000);
    const result = await axios.get(`http://2captcha.com/res.php?key=${API_KEY}&action=get&id=${requestId}&json=1`);
    if (result.data.status === 1) {
      return result.data.request;
    } else if (result.data.request !== 'CAPCHA_NOT_READY') {
      throw new Error(`2Captcha Error: ${result.data.request}`);
    }
  }

  throw new Error('Captcha solve timeout');
}

/** Auto login to Lazada and save cookies (with 2Captcha support) */
async function loginAndGetCookies(page: Page) {
  console.log('🔐 Logging into Lazada...');

  await page.goto('https://member.lazada.com.ph/user/login', { waitUntil: 'networkidle2' });

  // Wait for login form
  await page.waitForSelector('input#account', { timeout: 30000 });

  // Check if CAPTCHA appears before typing credentials
  const recaptchaFrame = page.frames().find((f: any) => f.url().includes('api2/anchor'));
  if (recaptchaFrame) {
    console.warn('⚠️ CAPTCHA detected on login page, solving with 2Captcha...');
    const sitekeyMatch = recaptchaFrame.url().match(/k=([0-9A-Za-z-_]+)/);
    if (sitekeyMatch) {
      const sitekey = sitekeyMatch[1];
      const token = await solveRecaptcha(sitekey, 'https://member.lazada.com.ph/user/login');

      // Inject the solved token into the page
      await page.evaluate((token: string) => {
        const textarea = document.createElement('textarea');
        textarea.name = 'g-recaptcha-response';
        textarea.value = token;
        textarea.style.display = 'none';
        document.body.appendChild(textarea);
      }, token);

      console.log('✅ CAPTCHA solved and token injected.');
    }
  }

  // Fill credentials (from .env)
  await page.type('input#account', process.env.LAZADA_EMAIL || '', { delay: 100 });
  await page.type('input#password', process.env.LAZADA_PASSWORD || '', { delay: 100 });

  await Promise.all([
    page.click('button.next-btn-primary'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
  ]);

  // Check if still on login page (failed login or CAPTCHA again)
  if (page.url().includes('/user/login')) {
    throw new Error('Login failed or CAPTCHA unresolved');
  }

  // Save cookies
  const cookies = await page.cookies();
  if (!fs.existsSync('./secrets')) fs.mkdirSync('./secrets');
  fs.writeFileSync('./secrets/lazada_cookies.json', JSON.stringify(cookies, null, 2));

  console.log(`✅ Logged in and saved ${cookies.length} cookies.`);
  return cookies;
}

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

  // Load and inject cookies
  let cookies = loadLazadaCookiesFromFile();
  
  if (cookies.length) {
    try {
      await page.setCookie(...cookies);
      console.log(`✅ Injected ${cookies.length} Lazada cookies`);
    } catch (e) {
      console.warn('Failed to set cookies:', e);
    }
  } else {
    console.log('⚠️ No Lazada cookies found, logging in...');
    cookies = await loginAndGetCookies(page);
    await page.setCookie(...cookies);
  }

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

      // Check if redirected to login
      if (page.url().includes('/user/login')) {
        console.warn('⚠️ Lazada redirected to login — refreshing cookies...');
        const newCookies = await loginAndGetCookies(page);
        await page.setCookie(...newCookies);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      }

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
        console.log(`✅ Lazada: Found ${products.length} products`);
        return products;
      }
    } catch (err) {
      console.log(`Failed for URL ${url}:`, (err as Error).message);
      await randomDelay(2000, 5000); 
      continue;
    }
  }

  console.log("⚠️ No Lazada products scraped");
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

    // Set user agent and headers
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';
    await page.setUserAgent(ua);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-PH,en;q=0.9' });
    page.setDefaultNavigationTimeout(180000);

    const lazadaProducts = await scrapeLazada(page);

    res.status(200).json(lazadaProducts);
  } catch (err) {
    console.error('❌ Scraper error:', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  } finally {
    runningRequests.delete(requestKey);
    if (browser) await browser.close();
  }
}