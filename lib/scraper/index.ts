// lib/scraper/index.ts
import dotenv from 'dotenv';
dotenv.config();

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import axios from 'axios';

const pluginStealth = StealthPlugin();
puppeteer.use(pluginStealth);

/**
 * Environment variables expected:
 * BRIGHT_DATA_USERNAME - full proxy username from Bright Data (zone username)
 * BRIGHT_DATA_PASSWORD - proxy password
 * BRIGHTDATA_PROXY_HOST - default 'brd.superproxy.io'
 * BRIGHTDATA_PROXY_PORT - default '33335'
 * LAZADA_COOKIES_FILE  - path to JSON file of Lazada cookies (array)
 * TWO_CAPTCHA_API_KEY  - (optional) for solveRecaptcha
 * HEADLESS             - 'true' or 'false' (optional)
 */

type ProductData = {
  title: string;
  currentPrice: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
  url: string;
  platform: string;
};

// ---------------------- Helpers ----------------------
function getEnvVar(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

/** Delay helper function to replace page.waitForTimeout */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Load lazada cookies JSON and convert to Puppeteer Cookie format */
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

/** 2Captcha solver (left as you had it) */
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

// ---------------------- Main scraper ----------------------
export async function scrapeProduct(url: string): Promise<ProductData | null> {
  if (!url) return null;

  // Proxy config (from env)
  const proxyHost = process.env.BRIGHTDATA_PROXY_HOST || 'brd.superproxy.io';
  const proxyPort = process.env.BRIGHTDATA_PROXY_PORT || '33335';
  const username = String(process.env.BRIGHT_DATA_USERNAME || '');
  const password = String(process.env.BRIGHT_DATA_PASSWORD || '');
  const sessionId = Math.floor(Math.random() * 1000000);
  const headlessEnv = process.env.HEADLESS === 'true' ? true : false;

  // Build proxy auth username (attach session to isolate)
  const proxyUsername = username ? `${username}-session-${sessionId}` : `${username}-session-${sessionId}`;

  let browser: any = null;
  try {
    // Launch browser with proxy
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--proxy-server=http=${proxyHost}:${proxyPort}`,
    ];
    browser = await puppeteer.launch({
      headless: headlessEnv,
      args,
    });

    const page = await browser.newPage();

    // Authenticate proxy (Bright Data)
    if (username && password) {
      await page.authenticate({
        username: proxyUsername,
        password,
      });
    }

    // Common UA & headers (try to match cookie origin UA)
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';
    await page.setUserAgent(ua);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-PH,en;q=0.9' });

    // Increase navigation timeout
    page.setDefaultNavigationTimeout(180000); // 3 minutes

    // ---------------- Lazada logic (inject cookies before navigation) ----------------
    if (url.includes('lazada.')) {
      try {
        // Load cookies if file provided
        const puppeteerCookies = loadLazadaCookiesFromFile();
        if (puppeteerCookies.length) {
          try {
            await page.setCookie(...puppeteerCookies);
            console.log(`✅ Injected ${puppeteerCookies.length} Lazada cookies`);
          } catch (e) {
            console.warn('Failed to set cookies on page:', e);
          }
        } else {
          console.log('No Lazada cookies loaded (file missing or empty).');
        }

        // Navigate and wait
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 });

        // extra wait to allow SPA hydration - FIXED
        await delay(8000);

        // screenshot + save HTML for debugging
        try {
          await page.screenshot({ path: 'lazada-proxy-screenshot.png', fullPage: true });
        } catch (e) {
          console.warn('Screenshot failed:', e);
        }

        const html = await page.content();
        try {
          fs.writeFileSync('lazada-cookies-debug.html', html, 'utf-8');
        } catch (e) { /* ignore */ }

        console.log('HTML snippet:', (html || '').slice(0, 600));

        // Detect reCAPTCHA frame (if any) - you can solve if desired
        const frames = page.frames();
        let sitekey = '';
        let recaptchaFrame: any = null;
        for (const frame of frames) {
          if (frame.url().includes('api2/anchor')) {
            recaptchaFrame = frame;
            const content = await frame.content();
            const match = content.match(/k=([0-9A-Za-z-_]+)/);
            if (match) {
              sitekey = match[1];
            }
            break;
          }
        }

        if (recaptchaFrame && sitekey) {
          console.log('reCAPTCHA detected with sitekey:', sitekey);
          // optionally solve using 2captcha:
          // const token = await solveRecaptcha(sitekey, url);
          // inject token if you want (not implemented here automatically)
        }

        // Wait for known product selector or fallback to extra wait
        try {
          await page.waitForSelector('.pdp-mod-product-badge-title, h1', { timeout: 30000 });
        } catch (e) {
          // Not found; proceed and attempt extraction anyway after a pause - FIXED
          await delay(3000);
        }

        // Extract fields from rendered DOM
        const title = await page.evaluate(() => {
          return (
            (document.querySelector('.pdp-mod-product-badge-title') as HTMLElement)?.innerText?.trim() ||
            (document.querySelector('h1') as HTMLElement)?.innerText?.trim() ||
            (document.querySelector('title') as HTMLTitleElement)?.innerText?.trim() ||
            ''
          );
        });

        const lazadaPrices = await page.evaluate(() => {
          const getText = (s: string) => (document.querySelector(s) as HTMLElement)?.innerText?.trim() || '';
          const currentPrice =
            (document.querySelector('.pdp-v2-product-price-content-salePrice-amount') as HTMLElement)?.innerText?.trim() ||
            (document.querySelector('.pdp-price_type_normal') as HTMLElement)?.innerText?.trim() ||
            getText('[data-testid="product-price"]') ||
            '';
          const originalPrice =
            (document.querySelector('.pdp-v2-product-price-content-originalPrice-amount') as HTMLElement)?.innerText?.trim() ||
            (document.querySelector('.pdp-price_type_deleted') as HTMLElement)?.innerText?.trim() ||
            '';
          const discount =
            (document.querySelector('.pdp-v2-product-price-content-originalPrice-discount') as HTMLElement)?.innerText?.trim() ||
            (document.querySelector('.pdp-product-price__discount') as HTMLElement)?.innerText?.trim() ||
            '';
          return { currentPrice, originalPrice, discount };
        });

        const imageUrl = await page.evaluate(() => {
          const meta = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
          const img = (document.querySelector('.gallery-preview-panel__image') as HTMLImageElement)?.getAttribute('src');
          const fallback = (document.querySelector('img') as HTMLImageElement)?.src || '';
          return meta || img || fallback || '';
        });

        const productData: ProductData = {
          title: title || '',
          currentPrice: lazadaPrices.currentPrice || '',
          originalPrice: lazadaPrices.originalPrice || '',
          discount: lazadaPrices.discount || '',
          imageUrl: imageUrl || '',
          url,
          platform: 'Lazada',
        };

        await browser.close();
        return productData;
      } catch (err: any) {
        if (browser) {
          try { await browser.close(); } catch (e) { /* ignore */ }
        }
        throw new Error(`Lazada (proxy + cookies) scrape failed: ${err.message || err}`);
      }
    }

    // ---------------- Amazon logic: left intact ----------------
    if (url.includes('amazon.')) {
      try {
        // We will reuse the same 'page' and proxy auth (if set)
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 180000 });

        const title = await page.$eval('h1', (el: { textContent: string; }) => el.textContent?.trim() || '');

        const { currentPrice, discountRate, normalPrice } = await page.evaluate(() => {
          const extractText = (selector: string) => (document.querySelector(selector) as HTMLElement)?.textContent?.trim() || '';

          const fullText = document.body.innerText || '';
          const priceRegex = /\$[\d,.]+/g;
          const allPrices = fullText.match(priceRegex) || [];

          const priceWhole = (document.querySelector('.a-price-whole') as HTMLElement)?.textContent?.replace(/[^\d]/g, '') || '';
          const priceFraction = (document.querySelector('.a-price-fraction') as HTMLElement)?.textContent?.trim() || '';
          const currentPrice = priceWhole ? `$${priceWhole}.${priceFraction || '00'}` : (allPrices[0] || '');

          const discountRate = extractText('.savingsPercentage') || (fullText.match(/-\d+%/)?.[0] || '');

          const rawTypicalPrice = extractText('span.a-size-small.aok-offscreen');
          const typicalPriceMatch = rawTypicalPrice.match(/\$[\d,.]+/)?.[0] || allPrices.find((p) => p !== currentPrice) || '';

          return { currentPrice, discountRate, normalPrice: typicalPriceMatch };
        });

        const imageUrl = await page.evaluate(() => {
          const img = document.querySelector('#landingImage') as HTMLImageElement;
          return img?.getAttribute('data-old-hires') || img?.src || '';
        });

        const productData: ProductData = {
          title,
          currentPrice,
          originalPrice: normalPrice,
          discount: discountRate,
          imageUrl: imageUrl,
          url,
          platform: 'Amazon',
        };

        await browser.close();
        return productData;
      } catch (error: any) {
        if (browser) {
          try { await browser.close(); } catch (e) { /* ignore */ }
        }
        throw new Error(`Amazon scrape failed: ${error.message || error}`);
      }
    }

    // ---------------- Generic fallback (other domains) ----------------
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
      const title = await page.title();

      const productData: ProductData = {
        title: title || '',
        currentPrice: '',
        originalPrice: '',
        discount: '',
        imageUrl: '',
        url,
        platform: '',
      };

      await browser.close();
      return productData;
    } catch (err: any) {
      if (browser) {
        try { await browser.close(); } catch (e) { /* ignore */ }
      }
      throw new Error(`Generic scrape failed: ${err.message || err}`);
    }
  } catch (error: any) {
    try { if (browser) await browser.close(); } catch (e) { /* ignore */ }
    throw new Error(`Failed to scrape product: ${error.message || error}`);
  }
}