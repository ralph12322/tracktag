// lib/scraper/index.ts
import dotenv from 'dotenv';
dotenv.config();
import Sentiment from 'sentiment';
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

const sentiment = new Sentiment();

type ProductData = {
  title: string;
  currentPrice: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
  isActive: Boolean;
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

/** Auto login to Lazada and save cookies (with 2Captcha support) */
async function loginAndGetCookies(page: any) {
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


const VERDICTS = {
  GOOD: 'good',
  OKAY: 'pwede na',
  BAD: 'bad'
} as const;

function analyzeSentiment(texts: string[]) {
  if (texts.length === 0) return VERDICTS.BAD; // Handle empty case

  const totalScore = texts.reduce((sum, t) => sum + sentiment.analyze(t).score, 0);
  const averageScore = totalScore / texts.length; // KEY FIX

  const verdict = averageScore >= 1.5  // Adjusted thresholds
    ? VERDICTS.GOOD
    : averageScore >= 0.5
      ? VERDICTS.OKAY
      : VERDICTS.BAD;

  return verdict;
}

// ---------------------- Main scraper ----------------------
export async function scrapeProduct(url: string): Promise<ProductData | null> {
  if (!url) return null;

  const proxyHost = process.env.BRIGHTDATA_PROXY_HOST || 'brd.superproxy.io';
  const proxyPort = process.env.BRIGHTDATA_PROXY_PORT || '33335';
  const username = String(process.env.BRIGHT_DATA_USERNAME || '');
  const password = String(process.env.BRIGHT_DATA_PASSWORD || '');
  const sessionId = Math.floor(Math.random() * 1000000);
  const headlessEnv = process.env.HEADLESS === 'true' ? true : false;

  const proxyUsername = username ? `${username}-session-${sessionId}` : `${username}-session-${sessionId}`;

  let browser: any = null;

  try {
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--proxy-server=http=${proxyHost}:${proxyPort}`,
    ];

    browser = await puppeteer.launch({ headless: headlessEnv, args });
    const page = await browser.newPage();

    if (username && password) {
      await page.authenticate({
        username: proxyUsername,
        password,
      });
    }

    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';
    await page.setUserAgent(ua);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-PH,en;q=0.9' });
    page.setDefaultNavigationTimeout(180000);

    // --------------- Lazada Logic ---------------
    if (url.includes('lazada.')) {
      try {
        let cookies = loadLazadaCookiesFromFile();

        // Step 1: load cookies or log in if missing
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

        // Step 2: visit product page
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 });
        await delay(8000);

        // Step 3: check if redirected to login
        if (page.url().includes('/user/login')) {
          console.warn('⚠️ Lazada redirected to login — refreshing cookies...');
          const newCookies = await loginAndGetCookies(page);
          await page.setCookie(...newCookies);
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 });
          await delay(8000);
        }


        // Step 5: Wait for product content
        try {
          await page.waitForSelector('.pdp-mod-product-badge-title, h1', { timeout: 30000 });
        } catch {
          await delay(3000);
        }

        // Step 6: extract data
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
            getText('.pdp-v2-product-price-content-salePrice-amount') ||
            getText('.pdp-price_type_normal') ||
            getText('[data-testid="product-price"]');
          const originalPrice =
            getText('.pdp-v2-product-price-content-originalPrice-amount') ||
            getText('.pdp-price_type_deleted');
          const discount =
            getText('.pdp-v2-product-price-content-originalPrice-discount') ||
            getText('.pdp-product-price__discount');
          return { currentPrice, originalPrice, discount };
        });

        const imageUrl = await page.evaluate(() => {
          const meta = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
          const img = (document.querySelector('.gallery-preview-panel__image') as HTMLImageElement)?.src;
          const fallback = (document.querySelector('img') as HTMLImageElement)?.src;
          return meta || img || fallback || '';
        });

        // Step: Click the "Reviews" tab to load them
        try {
          const reviewsTabHandle = await page.evaluateHandle(() => {
            const links = Array.from(document.querySelectorAll("a, button, div"));
            return links.find(el => /reviews?|ratings?/i.test(el.textContent || '')) || null;
          });
          if (reviewsTabHandle) {
            await (reviewsTabHandle as any).click();
            console.log("✅ Clicked the Reviews tab");
            await delay(4000);
          } else {
            console.warn("⚠️ Reviews tab not found, proceeding without clicking");
          }

          await delay(4000);
          await page.waitForSelector(".pdp-review", { timeout: 10000 }).catch(() => {
            console.warn("⚠️ No reviews section appeared, fallback to existing content");
          });


        } catch (err) {
          console.warn("⚠️ Failed to click reviews tab:", err);
        }

        // Step 7: Scroll to load reviews
        await page.evaluate(async () => {
          await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 500;
            const timer = setInterval(() => {
              window.scrollBy(0, distance);
              totalHeight += distance;

              if (totalHeight >= document.body.scrollHeight) {
                clearInterval(timer);
                resolve();
              }
            }, 300);
          });
        });

        await delay(5000); // give reviews time to load

        // Step 8: Extract reviews based on actual Lazada HTML structure
        const reviews = await page.evaluate(() => {
          const results: { user: string; review: string; stars: number }[] = [];

          // Lazada uses .item class for each review
          const reviewContainers = document.querySelectorAll('.item');

          if (reviewContainers.length === 0) {
            console.warn('No review containers found with .item selector');
            return results;
          }

          console.log(`Found ${reviewContainers.length} review items`);

          reviewContainers.forEach((item, index) => {
            if (index >= 10) return; // limit to 10 reviews

            try {
              // Extract username from .reviewer span
              const reviewerEl = item.querySelector('.reviewer');
              const user = reviewerEl?.textContent?.trim() || 'Anonymous';

              // Extract star rating by counting img.star elements
              const starImages = item.querySelectorAll('img.star');
              const stars = starImages.length;

              // Extract review content from .item-content-main-content-reviews
              const reviewsSection = item.querySelector('.item-content-main-content-reviews');
              let reviewText = '';

              if (reviewsSection) {
                // Get all review items (Comfort, Absorbency, Fit, etc.)
                const reviewItems = reviewsSection.querySelectorAll('.item-content-main-content-reviews-item');
                const reviewParts: string[] = [];

                reviewItems.forEach(reviewItem => {
                  const attribute = reviewItem.querySelector('.review-attribute')?.textContent?.trim() || '';
                  const value = reviewItem.querySelector('span:not(.review-attribute)')?.textContent?.trim() || '';

                  if (attribute && value) {
                    reviewParts.push(`${attribute} ${value}`);
                  }
                });

                reviewText = reviewParts.join(', ');
              }

              // If no structured review, try getting text from .item-content
              if (!reviewText) {
                const contentEl = item.querySelector('.item-content-main-content');
                reviewText = contentEl?.textContent?.trim() || 'No review text';

                // Clean up unwanted parts
                reviewText = reviewText
                  .replace(/Size:\s*\w+/gi, '')
                  .replace(/Size2:\s*NO_NAME_\d+/gi, '')
                  .replace(/Helpful\(\d+\)/gi, '')
                  .replace(/\s+/g, ' ')
                  .trim();
              }

              // Only add if we have actual review text
              if (reviewText && reviewText.length > 10) {
                results.push({
                  user,
                  review: reviewText,
                  stars: Math.min(stars, 5) // ensure max 5 stars
                });
              }
            } catch (err) {
              console.warn(`Error extracting review ${index}:`, err);
            }
          });

          return results;
        });

        const analysis = analyzeSentiment(reviews.map((r: { review: any; }) => r.review));



        const productData: ProductData & { reviews: any[]; analysis: string } = {
          title,
          currentPrice: lazadaPrices.currentPrice || '',
          originalPrice: lazadaPrices.originalPrice || '',
          discount: lazadaPrices.discount || '',
          imageUrl: imageUrl || '',
          url,
          isActive: false,
          platform: 'Lazada',
          reviews,
          analysis,
        };

        await browser.close();
        console.log(productData);
        return productData;

      } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message || error}`);
      } finally {
        if (browser) {
          try {
            await browser.close();
          } catch { }
        }
      }
    }

    // --------------- Amazon Logic (Enhanced with Reviews) ---------------
    if (url.includes('amazon.')) {
      try {
        // Force USD currency by setting cookies and visiting currency preference page
        await page.goto('https://www.amazon.com/', { waitUntil: 'networkidle2', timeout: 30000 });

        // Set currency preference cookie
        await page.setCookie({
          name: 'i18n-prefs',
          value: 'USD',
          domain: '.amazon.com'
        });

        await delay(1000);

        // Now navigate to the actual product page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 180000 });
        await delay(5000);

        // Extract product title
        const title = await page.evaluate(() => {
          const selectors = ['#productTitle', 'h1', 'span#productTitle'];
          for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el?.textContent?.trim()) {
              return el.textContent.trim();
            }
          }
          return '';
        });

        // Enhanced price extraction with multiple methods
        let { currentPrice, discountRate, normalPrice } = await page.evaluate(() => {
          let currentPrice = '';

          // Method 1: Try multiple selectors for current price (prioritized order)
          const priceSelectors = [
            // Most specific selectors first
            '.priceToPay .a-offscreen',
            'span.a-price[data-a-size="xl"] .a-offscreen',
            '.reinventPricePriceToPayMargin .a-offscreen',
            '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
            '#corePrice_feature_div .a-price .a-offscreen',
            '#priceblock_ourprice',
            '#priceblock_dealprice',
            '.a-price.aok-align-center .a-offscreen',
          ];

          const foundPrices = new Set();

          for (const selector of priceSelectors) {
            const el = document.querySelector(selector);
            if (el?.textContent?.trim()) {
              const price = el.textContent.trim();
              // Skip if we've seen this exact price before (avoids duplicates)
              if (!foundPrices.has(price)) {
                foundPrices.add(price);
                currentPrice = price;
                break;
              }
            }
          }

          // Method 2: Try visible price components if offscreen not found
          if (!currentPrice) {
            const priceWhole = document.querySelector('.priceToPay .a-price-whole');
            const priceFraction = document.querySelector('.priceToPay .a-price-fraction');
            const priceSymbol = document.querySelector('.priceToPay .a-price-symbol');

            if (priceWhole && priceFraction) {
              const symbol = priceSymbol?.textContent?.trim() || '$';
              const whole = priceWhole.textContent?.replace('.', '').trim() || '';
              const fraction = priceFraction.textContent?.trim() || '';
              if (whole && fraction) {
                currentPrice = `${symbol}${whole}.${fraction}`;
              }
            }
          }

          // Method 3: Try any a-price with offscreen as last resort
          if (!currentPrice) {
            const priceSpans = Array.from(document.querySelectorAll('span.a-price'));
            for (const span of priceSpans) {
              const offscreen = span.querySelector('.a-offscreen');
              if (offscreen?.textContent?.trim()) {
                const price = offscreen.textContent.trim();
                if (price && price.includes('$') && !foundPrices.has(price)) {
                  currentPrice = price;
                  break;
                }
              }
            }
          }

          // Method 4: Regex pattern in body text as absolute fallback
          if (!currentPrice) {
            const pricePattern = /\$\d+\.\d{2}/;
            const bodyText = document.body.innerText;
            const match = bodyText.match(pricePattern);
            if (match) {
              currentPrice = match[0];
            }
          }

          // Discount extraction
          let discountRate = '';
          const discountSelectors = [
            '.savingsPercentage',
            '.a-badge-percentage',
            'span.a-size-large.a-color-price.savingPriceOverride',
            '.a-badge-label-text',
          ];

          for (const selector of discountSelectors) {
            const el = document.querySelector(selector);
            if (el?.textContent?.trim()) {
              discountRate = el.textContent.trim();
              break;
            }
          }

          if (!discountRate) {
            const discountMatch = document.body.innerText.match(/-\d+%/);
            if (discountMatch) {
              discountRate = discountMatch[0];
            }
          }

          // Original/List price extraction
          let normalPrice = '';
          const normalPriceSelectors = [
            'span.a-price.a-text-price .a-offscreen',
            '.a-text-strike .a-offscreen',
            '#priceblock_saleprice',
            'span.a-size-small.aok-offscreen',
            '.basisPrice .a-offscreen',
          ];

          for (const selector of normalPriceSelectors) {
            const el = document.querySelector(selector);
            if (el?.textContent?.trim()) {
              normalPrice = el.textContent.trim();
              break;
            }
          }

          return { currentPrice, discountRate, normalPrice };
        });

        // Try structured data if price still empty
        if (!currentPrice || currentPrice.trim() === '') {
          console.log('⚠️ Attempting to extract price from structured data...');

          const structuredPrice = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
            for (const script of scripts) {
              try {
                const data = JSON.parse(script.textContent || '');
                if (data.offers?.price) {
                  return `$${data.offers.price}`;
                }
                if (data.offers?.lowPrice) {
                  return `$${data.offers.lowPrice}`;
                }
              } catch (e) {
                // Continue to next script
              }
            }
            return '';
          });

          if (structuredPrice) {
            currentPrice = structuredPrice;
            console.log('✅ Extracted price from structured data:', currentPrice);
          }
        }

        // CRITICAL: Validate price exists
        if (!currentPrice || currentPrice.trim() === '') {
          console.error('❌ Failed to extract Amazon price after all attempts');
          console.error('Title found:', title);
          await browser.close();
          throw new Error('Unable to extract product price from Amazon page. The page structure may have changed or the product is unavailable.');
        }

        // Normalize currency (handle PHP, USD, etc)
        if (currentPrice) {
          currentPrice = currentPrice.trim();
          // If it's PHP, you might want to convert or flag it
          if (currentPrice.includes('PHP')) {
            console.warn('⚠️ Price detected in PHP, not USD:', currentPrice);
            // Optional: You could convert PHP to USD or skip this product
          }
        }

        console.log('✅ Amazon Prices extracted:', { currentPrice, discountRate, normalPrice });

        // Extract image
        const imageUrl = await page.evaluate(() => {
          const selectors = [
            '#landingImage',
            '#imgBlkFront',
            '#main-image',
            'img[data-old-hires]',
          ];

          for (const selector of selectors) {
            const img = document.querySelector(selector) as HTMLImageElement;
            if (img) {
              return img.getAttribute('data-old-hires') ||
                img.getAttribute('src') ||
                img.getAttribute('data-a-dynamic-image') || '';
            }
          }

          // Fallback to meta tag
          const meta = document.querySelector('meta[property="og:image"]');
          return meta?.getAttribute('content') || '';
        });

        // Navigate to reviews section
        try {
          const reviewsLinkClicked = await page.evaluate(() => {
            const reviewLinks = Array.from(document.querySelectorAll('a'));
            const reviewLink = reviewLinks.find(link =>
              /see all reviews|customer reviews/i.test(link.textContent || '')
            );
            if (reviewLink) {
              (reviewLink as HTMLElement).click();
              return true;
            }
            return false;
          });

          if (reviewsLinkClicked) {
            console.log("✅ Clicked Amazon reviews link");
            await delay(3000);
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {
              console.log("Navigation to reviews page...");
            });
          } else {
            console.warn("⚠️ Reviews link not found, scrolling to reviews section");

            await page.evaluate(() => {
              const reviewSection = document.querySelector('#reviewsMedley, #reviews, [data-hook="reviews-medley"]');
              if (reviewSection) {
                reviewSection.scrollIntoView({ behavior: 'smooth' });
              }
            });
          }

          await delay(3000);
        } catch (err) {
          console.warn("⚠️ Failed to navigate to reviews:", err);
        }

        // Scroll to load more reviews
        await page.evaluate(async () => {
          await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 500;
            const timer = setInterval(() => {
              window.scrollBy(0, distance);
              totalHeight += distance;

              if (totalHeight >= document.body.scrollHeight) {
                clearInterval(timer);
                resolve();
              }
            }, 300);
          });
        });

        await delay(3000);

        // Extract reviews
        const reviews = await page.evaluate(() => {
          const results: { user: string; review: string; stars: number }[] = [];

          const reviewContainers = document.querySelectorAll(
            '[data-hook="review"], .review, .a-section.review'
          );

          if (reviewContainers.length === 0) {
            console.warn('No Amazon review containers found');
            return results;
          }

          console.log(`Found ${reviewContainers.length} Amazon review items`);

          reviewContainers.forEach((item, index) => {
            if (index >= 10) return; // limit to 10 reviews

            try {
              // Extract username
              let user = 'Anonymous';
              const userSelectors = [
                '[data-hook="review-author"]',
                '.a-profile-name',
                '.review-byline .a-profile-name'
              ];

              for (const selector of userSelectors) {
                const userEl = item.querySelector(selector);
                if (userEl?.textContent?.trim()) {
                  user = userEl.textContent.trim();
                  break;
                }
              }

              // Extract star rating
              let stars = 0;
              const starSelectors = [
                '[data-hook="review-star-rating"]',
                '.review-rating',
                'i[data-hook="review-star-rating"]'
              ];

              for (const selector of starSelectors) {
                const starEl = item.querySelector(selector);
                if (starEl) {
                  const starText = starEl.textContent || starEl.getAttribute('class') || '';
                  const match = starText.match(/(\d+(?:\.\d+)?)/);
                  if (match) {
                    stars = Math.round(parseFloat(match[1]));
                    break;
                  }
                }
              }

              // Extract review text
              let reviewText = '';
              const reviewSelectors = [
                'span[data-hook="review-body"] span',
                '[data-hook="review-body"]',
                '.review-text-content span',
                '.review-text'
              ];

              for (const selector of reviewSelectors) {
                const reviewEl = item.querySelector(selector);
                if (reviewEl?.textContent?.trim()) {
                  reviewText = reviewEl.textContent.trim();
                  break;
                }
              }

              // Clean up review text
              if (reviewText) {
                reviewText = reviewText
                  .replace(/Read more/gi, '')
                  .replace(/\s+/g, ' ')
                  .trim();
              }

              // Only add if we have actual review text
              if (reviewText && reviewText.length > 10) {
                results.push({
                  user,
                  review: reviewText,
                  stars: Math.min(Math.max(stars, 0), 5)
                });
              }
            } catch (err) {
              console.warn(`Error extracting Amazon review ${index}:`, err);
            }
          });

          return results;
        });

        console.log(`📊 Extracted ${reviews.length} Amazon reviews`);
        if (reviews.length > 0) {
          console.log('Sample Amazon review:', {
            user: reviews[0].user,
            reviewPreview: reviews[0].review.substring(0, 80) + '...',
            stars: reviews[0].stars
          });
        }

        // Analyze sentiment
        const analysis = analyzeSentiment(reviews.map((r: { review: any; }) => r.review));

        const productData: ProductData & { reviews: any[]; analysis: string } = {
          title,
          currentPrice,
          originalPrice: normalPrice,
          discount: discountRate,
          imageUrl,
          isActive: false,
          url,
          platform: 'Amazon',
          reviews,
          analysis,
        };

        await browser.close();
        console.log('✅ Successfully scraped Amazon product:', {
          title: productData.title.substring(0, 50) + '...',
          currentPrice: productData.currentPrice,
          reviewCount: reviews.length
        });

        return productData;

      } catch (err: any) {
        if (browser) {
          try {
            await browser.close();
          } catch { }
        }
        throw new Error(`Amazon scrape failed: ${err.message || err}`);
      }
    }

    // --------------- Generic fallback ---------------
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
    const title = await page.title();

    const productData: ProductData = {
      title,
      currentPrice: '',
      originalPrice: '',
      discount: '',
      imageUrl: '',
      isActive: false,
      url,
      platform: '',
    };

    await browser.close();
    return productData;
  } catch (error: any) {
    if (browser) {
      try {
        await browser.close();
      } catch { }
    }
    throw new Error(`Failed to scrape product: ${error.message || error}`);
  }
}