import dotenv from 'dotenv';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';
dotenv.config();

puppeteer.use(StealthPlugin());

// Random delay function with human-like variance
function randomDelay(min = 1000, max = 3000) {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Progressive delay between attempts (gets longer each retry)
function getBackoffDelay(attempt: number, baseDelay = 2000) {
  const exponentialBackoff = Math.pow(2, attempt) * baseDelay;
  const jitter = Math.random() * 1000; // Add randomness
  return exponentialBackoff + jitter;
}

// Enhanced human behavior simulation
async function enhancedHumanBehavior(page : any) {
  // Initial pause to "read" the page
  console.log('Simulating page reading...');
  await randomDelay(2000, 4000);

  // Random mouse movements (more realistic)
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * 1200;
    const y = Math.random() * 800;
    await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
    await randomDelay(200, 800);
  }

  // Scroll behavior - more human-like
  console.log('Simulating scrolling behavior...');
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let scrolled = 0;
      const maxScroll = Math.min(document.body.scrollHeight, 2000);
      
      const scroll = () => {
        const distance = Math.random() * 200 + 100;
        window.scrollBy(0, distance);
        scrolled += distance;

        if (scrolled >= maxScroll) {
          // Scroll back up a bit (human-like)
          window.scrollBy(0, -Math.random() * 300);
          setTimeout(resolve, 500 + Math.random() * 1000);
        } else {
          // Random pause between scrolls
          setTimeout(scroll, Math.random() * 800 + 300);
        }
      };
      
      scroll();
    });
  });

  // Final pause before scraping
  console.log('Final pause before scraping...');
  await randomDelay(1500, 3000);
}

export async function scrapeProduct(url: string, retries = 3) {
  if (!url) return;

  for (let attempt = 1; attempt <= retries; attempt++) {
    let browser;
    try {
      console.log(`Attempt ${attempt} to scrape ${url}`);
      
      // INITIAL DELAY - Wait before even starting browser
      if (attempt > 1) {
        const retryDelay = getBackoffDelay(attempt);
        console.log(`Waiting ${Math.round(retryDelay)}ms before retry ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        // First attempt - random initial delay
        console.log('Initial startup delay...');
        await randomDelay(1000, 3000);
      }

      const username = String(process.env.BRIGHT_DATA_USERNAME);
      const password = String(process.env.BRIGHT_DATA_PASSWORD);
      const port = 22225;
      const session_id = Math.floor(Math.random() * 1000000000); // More randomness
      const proxyHost = 'brd.superproxy.io';

      browser = await puppeteer.launch({
        headless: true, // Changed to true for better stealth
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled',
          `--proxy-server=http=${proxyHost}:${port}`,
        ],
      });

      const page = await browser.newPage();

      // DELAY after browser setup
      console.log('Browser setup complete, waiting...');
      await randomDelay(500, 1500);

      // Enhanced stealth settings
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
      
      await page.authenticate({
        username: `${username}-session-${session_id}`,
        password: password,
      });

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
      );

      // DELAY before navigation - more realistic
      console.log('Preparing to navigate...');
      const initialDelay = Math.random() * 3000 + 2000; // 2-5 seconds
      await new Promise(resolve => setTimeout(resolve, initialDelay));

      console.log('Navigating to page...');
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });

      // DELAY after page load - let everything settle
      console.log('Page loaded, letting content settle...');
      await randomDelay(3000, 5000);

      // Debug: check what page we landed on
      const pageTitle = await page.title();
      const pageUrl = await page.url();
      console.log('Landed on page:', pageTitle, pageUrl);

      // Check for CAPTCHA or blocking
      const isBlocked = await page.evaluate(() => {
        return document.title.includes('CAPTCHA') || 
               document.title.includes('Bot') ||
               document.title.includes('Access Denied') ||
               document.body.textContent.includes('captcha') ||
               document.body.textContent.includes('robot') ||
               document.querySelector('iframe[src*="recaptcha"]') ||
               document.querySelector('form[action*="captcha"]');
      });

      if (isBlocked) {
        console.log('Blocking or CAPTCHA detected');
        await handleCaptcha(page, url);
        // Extra delay after captcha handling
        await randomDelay(5000, 8000);
      }

      // ENHANCED human behavior simulation
      await enhancedHumanBehavior(page);

      // Wait for product content with multiple selectors
      console.log('Waiting for product elements...');
      try {
        await Promise.race([
          page.waitForSelector('.pdp-product-title', { timeout: 8000 }),
          page.waitForSelector('h1', { timeout: 8000 }),
          page.waitForSelector('[data-spm="product-name"]', { timeout: 8000 }),
          page.waitForSelector('.pdp-mod-product-badge-title', { timeout: 8000 }),
          new Promise(resolve => setTimeout(resolve, 5000))
        ]);
      } catch (error) {
        console.log('Waiting for product elements timed out, proceeding anyway');
      }

      // FINAL DELAY before actual scraping
      console.log('Starting data extraction...');
      await randomDelay(1000, 2000);

      // More robust title extraction
      const title = await page.evaluate(() => {
        const titleSelectors = [
          'h1',
          '[data-testid="product-title"]',
          '.product-title',
          '.pdp-mod-product-badge-title',
          '#productTitle',
          '.product-name',
          '.pdp-product-title',
          '[data-spm="product-name"]',
          'title'
        ];

        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            return element.textContent.trim();
          }
        }

        // Fallback to meta title
        const metaTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                         document.querySelector('meta[name="title"]')?.getAttribute('content');
        if (metaTitle) return metaTitle;

        const pageTitle = document.querySelector('title')?.textContent;
        if (pageTitle) return pageTitle;

        return 'Title not found';
      });

      let productData = {
        title,
        currentPrice: '',
        originalPrice: '',
        discount: '',
        imageUrl: '',
        url: url,
        platform: '',
        status: 'success'
      };

      // Lazada scraping with updated selectors
      if (url.includes('lazada.')) {
        console.log('Detected Lazada platform');

        try {
          await Promise.race([
            page.waitForSelector('.pdp-v2-product-price-content', { timeout: 5000 }),
            page.waitForSelector('.pdp-v2-product-price-content-salePrice', { timeout: 5000 }),
            page.waitForSelector('.pdp-price_color_orange', { timeout: 5000 }),
            page.waitForSelector('.pdp-product-price', { timeout: 5000 }),
            page.waitForSelector('.pdp-v2-price-wrapper', { timeout: 5000 }),
            new Promise(resolve => setTimeout(resolve, 4000))
          ]);
        } catch (e) {
          console.log('Lazada price elements not found immediately, continuing...');
        }

        const lazadaData = await page.evaluate(() => {
          // Multiple selector variations - mobile first, then desktop fallbacks
          const currentPriceSelectors = [
            // Mobile version selectors (priority)
            '.pdp-v2-product-price-content-salePrice-amount',
            '.pdp-v2-product-price-content-salePrice',
            // Desktop fallback selectors (your original ones)
            '.pdp-price_color_orange',
            '.pdp-product-price span',
            '[data-spm="price"]',
            '.pdp-mod-product-price span',
            '.pdp-v2-price-wrapper',
            '.pdp-price'
          ];

          const originalPriceSelectors = [
            // Mobile version selectors (priority)
            '.pdp-v2-product-price-content-originalPrice-amount',
            '.pdp-v2-product-price-content-originalPrice',
            // Desktop fallback selectors (your original ones)
            '.pdp-price_price_original',
            '.pdp-product-price__original',
            '.pdp-price_type_deleted',
            '.original-price',
            '.pdp-price .original'
          ];

          const discountSelectors = [
            // Mobile version selectors (priority)  
            '.pdp-v2-product-price-content-originalPrice-discount',
            // Desktop fallback selectors (your original ones)
            '.pdp-product-price__discount',
            '.pdp-discount-rate',
            '.discount-percentage',
            '.pdp-price__discount'
          ];

          const imageSelectors = [
            'meta[property="og:image"]',
            'meta[name="og:image"]',
            '.gallery-preview-panel__image',
            '.pdp-mod-common-image',
            'img[data-spm="image"]'
          ];

          let currentPrice = '';
          let originalPrice = '';
          let discount = '';
          let imageUrl = '';

          // Current price
          for (const selector of currentPriceSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              let price = element.textContent.trim().replace(/\s+/g, ' ');

              // Special handling for mobile version where currency is separate
              if (selector === '.pdp-v2-product-price-content-salePrice-amount') {
                const currencyElement = document.querySelector('.pdp-v2-product-price-content-salePrice-sign');
                const currency = currencyElement ? currencyElement.textContent.trim() : '₱';
                currentPrice = currency + price;
              } else {
                currentPrice = price;
              }
              break;
            }
          }

          // Original price
          for (const selector of originalPriceSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              originalPrice = element.textContent.trim().replace(/\s+/g, ' ');
              break;
            }
          }

          // Discount
          for (const selector of discountSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              discount = element.textContent.trim();
              break;
            }
          }

          // Image URL
          for (const selector of imageSelectors) {
            if (selector.startsWith('meta')) {
              const element = document.querySelector(selector);
              if (element) {
                imageUrl = element.getAttribute('content') || '';
                if (imageUrl) break;
              }
            } else {
              const element = document.querySelector(selector);
              if (element) {
                imageUrl = (element as HTMLImageElement).src || '';
                if (imageUrl) break;
              }
            }
          }

          return { currentPrice, originalPrice, discount, imageUrl };
        });

        console.log('Lazada scraped data:', lazadaData);

        productData = {
          title,
          currentPrice: lazadaData.currentPrice || 'Price not available',
          originalPrice: lazadaData.originalPrice || 'N/A',
          discount: lazadaData.discount || '0%',
          imageUrl: lazadaData.imageUrl,
          url: url,
          platform: 'Lazada',
          status: 'success'
        };
      }

      // Amazon
      if (url.includes('amazon.')) {
        console.log('Detected Amazon platform');

        try {
          await Promise.race([
            page.waitForSelector('.a-price', { timeout: 5000 }),
            page.waitForSelector('#priceblock_dealprice', { timeout: 5000 }),
            page.waitForSelector('#priceblock_ourprice', { timeout: 5000 }),
            new Promise(resolve => setTimeout(resolve, 4000))
          ]);
        } catch (e) {
          console.log('Amazon price elements not found immediately, continuing...');
        }

        const amazonData = await page.evaluate(() => {
          const priceSymbol = document.querySelector('.a-price-symbol')?.textContent?.trim() || '$';
          const priceWhole = document.querySelector('.a-price-whole')?.textContent?.replace(/[^\d]/g, '') || '0';
          const priceFraction = document.querySelector('.a-price-fraction')?.textContent?.trim() || '00';

          const originalPriceSelectors = [
            'span.a-size-small.aok-offscreen',
            '.a-price.a-text-price .a-offscreen',
            '[data-a-color="secondary"] .a-price .a-offscreen',
            '.basisPrice'
          ];

          let rawTypicalPrice = '';
          for (const selector of originalPriceSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              rawTypicalPrice = element.textContent.trim();
              break;
            }
          }

          const match = rawTypicalPrice.match(/\$[\d.,]+/);
          const typicalPrice = match ? match[0] : '';

          const discountSelectors = [
            '.savingsPercentage',
            '.percent-off',
            '.a-badge-text'
          ];

          let discount = '';
          for (const selector of discountSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              discount = element.textContent.trim();
              break;
            }
          }

          let imageUrl = '';
          const img = document.querySelector('#landingImage') as HTMLImageElement;
          if (img) {
            imageUrl = img.getAttribute('data-old-hires') || img.src || '';
          }

          if (!imageUrl) {
            const metaImage = document.querySelector('meta[property="og:image"]');
            if (metaImage) {
              imageUrl = metaImage.getAttribute('content') || '';
            }
          }

          return {
            currentPrice: `${priceSymbol}${priceWhole}.${priceFraction}`,
            discountRate: discount,
            normalPrice: typicalPrice,
            imageUrl: imageUrl
          };
        });

        productData = {
          title,
          currentPrice: amazonData.currentPrice || 'Price not available',
          originalPrice: amazonData.normalPrice || 'N/A',
          discount: amazonData.discountRate || '0%',
          imageUrl: amazonData.imageUrl,
          url: url,
          platform: 'Amazon',
          status: 'success'
        };
      }

      console.log('Scraped product data:', productData);
      return productData;

    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt === retries) {
        // Return error data instead of throwing
        return {
          title: 'Error',
          currentPrice: 'Price not available',
          originalPrice: 'N/A',
          discount: '0%',
          imageUrl: '',
          url: url,
          platform: 'Unknown',
          status: 'error',
          error: error.message
        };
      }

      // Enhanced backoff with more randomness
      const backoffTime = getBackoffDelay(attempt, 3000);
      console.log(`Enhanced backoff: waiting ${Math.round(backoffTime)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));

    } finally {
      if (browser) {
        console.log('Closing browser...');
        await browser.close();
        // Small delay after closing browser
        await randomDelay(500, 1000);
      }
    }
  }
}

async function handleCaptcha(page: any, url: string) {
  console.log('Handling CAPTCHA...');

  const frames = page.frames();
  let sitekey = '';
  let recaptchaFrame = null;

  for (const frame of frames) {
    if (frame.url().includes('api2/anchor') || frame.url().includes('recaptcha')) {
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
    try {
      const token = await solveRecaptcha(sitekey, url);

      await page.evaluate((token: string) => {
        const injectToken = (doc: Document) => {
          let textarea = doc.getElementById('g-recaptcha-response') as HTMLTextAreaElement | null;
          if (!textarea) {
            textarea = doc.createElement('textarea');
            textarea.id = 'g-recaptcha-response';
            textarea.name = 'g-recaptcha-response';
            textarea.style.display = 'none';
            doc.body.appendChild(textarea);
          }
          textarea.value = token;
        };

        injectToken(document);

        Array.from(window.frames).forEach((frame: Window) => {
          try {
            injectToken(frame.document);
          } catch (e) { }
        });
      }, token);

      // Wait a bit and try to continue
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (captchaError) {
      console.error('CAPTCHA solving failed:', captchaError);
    }
  } else {
    console.log('No reCAPTCHA found, but blocking detected');
  }
}

async function solveRecaptcha(sitekey: string, pageurl: string): Promise<string> {
  const API_KEY = process.env.TWO_CAPTCHA_API_KEY;
  if (!API_KEY) {
    throw new Error('2Captcha API key not found');
  }

  const submitUrl = `http://2captcha.com/in.php?key=${API_KEY}&method=userrecaptcha&googlekey=${sitekey}&pageurl=${pageurl}&json=1`;

  const res = await axios.get(submitUrl);
  const requestId = res.data.request;

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const result = await axios.get(`http://2captcha.com/res.php?key=${API_KEY}&action=get&id=${requestId}&json=1`);
    if (result.data.status === 1) {
      return result.data.request;
    } else if (result.data.request !== 'CAPCHA_NOT_READY') {
      throw new Error(`2Captcha Error: ${result.data.request}`);
    }
  }

  throw new Error('Captcha solve timeout');
}