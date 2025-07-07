import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
import puppeteer from 'puppeteer';
import chromium from 'chrome-aws-lambda';

export async function scrapeProduct(url: string) {
  if (!url) return;

  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = Math.floor(Math.random() * 1000000);
  const proxyHost = 'brd.superproxy.io';

  try {

    const browser = await puppeteer.launch({
      headless: 'new' as any,
      executablePath: await chromium.executablePath,
      dumpio: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
        '--no-first-run',
        '--disable-dev-tools',
        '--no-default-browser-check',
        `--proxy-server=http=${proxyHost}:${port}`,
      ],
    });


    const page = await browser.newPage();

    await page.authenticate({
      username: `${username}-session-${session_id}`,
      password: password,
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // CAPTCHA Handling
    const frames = page.frames();
    let sitekey = '';
    let recaptchaFrame = null;

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
      const token = await solveRecaptcha(sitekey, url);

      await page.evaluate((token: any) => {
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

      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) form.submit();
      });

      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
      console.log('No reCAPTCHA found');
    }

    const title = await page.$eval('h1', (el => el.textContent?.trim() || ''));

    let productData = {
      title,
      currentPrice: '',
      originalPrice: '',
      discount: '',
      imageUrl: '',
      url
    };

    // Lazada
    if (url.includes('lazada.')) {

      await page.waitForSelector('.pdp-price_type_normal', { timeout: 10000 });
      const lazadaPrices = await page.evaluate(() => {
        const currentPrice = document.querySelector('.pdp-price_type_normal')?.textContent?.trim() || '';
        const originalPrice = document.querySelector('.pdp-price_type_deleted')?.textContent?.trim() || '';
        const discount = document.querySelector('.pdp-product-price__discount')?.textContent?.trim() || '';
        return { currentPrice, originalPrice, discount };
      });

      const imageUrl = await page.evaluate(() => {
        const metaTag = document.querySelector('meta[property="og:image"]');
        return metaTag ? metaTag.getAttribute('content') : '';
      });

      productData = {
        title: title || '',
        currentPrice: lazadaPrices.currentPrice,
        originalPrice: lazadaPrices.originalPrice,
        discount: lazadaPrices.discount,
        imageUrl: imageUrl || '',
        url
      };

      const html = await page.content();
      require('fs').writeFileSync('lazada-debug.html', html);
      console.log("Lazada Image URL:", productData.imageUrl);
    }



    // Amazon
    if (url.includes('amazon.')) {
      const { currentPrice, discountRate, normalPrice } = await page.evaluate(() => {
        const extractText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || '';

        // Fallbacks using regex on entire page text
        const fullText = document.body.innerText;
        const priceRegex = /\$[\d,.]+/g;
        const allPrices = fullText.match(priceRegex) || [];

        // Extract current price from visible DOM
        const priceWhole = document.querySelector('.a-price-whole')?.textContent?.replace(/[^\d]/g, '') || '';
        const priceFraction = document.querySelector('.a-price-fraction')?.textContent?.trim() || '';
        const currentPrice = priceWhole ? `$${priceWhole}.${priceFraction || '00'}` : allPrices[0] || '';

        // Extract discount from .savingsPercentage or fallback to % regex
        const discountRate = extractText('.savingsPercentage') || (fullText.match(/-\d+%/)?.[0] || '');

        // Extract normal/original price from typical price span or second match in price list
        const rawTypicalPrice = extractText('span.a-size-small.aok-offscreen');
        const typicalPriceMatch = rawTypicalPrice.match(/\$[\d,.]+/)?.[0] || allPrices.find((p) => p !== currentPrice) || '';


        return {
          currentPrice,
          discountRate,
          normalPrice: typicalPriceMatch,
        };
      });

      const imageUrl = await page.evaluate(() => {
        const img = document.querySelector('#landingImage') as HTMLImageElement;
        return img?.getAttribute('data-old-hires') || img?.src || '';
      });

      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes("Enter the characters you see below") || bodyText.includes("Sorry, we just need to make sure you're not a robot")) {
        throw new Error("Blocked by Amazon CAPTCHA");
      }


      productData = {
        title,
        currentPrice,
        originalPrice: normalPrice,
        discount: discountRate,
        imageUrl: imageUrl,
        url
      };
    }


    await browser.close();
    return productData;
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}

async function solveRecaptcha(sitekey: string, pageurl: string): Promise<string> {
  const API_KEY = process.env.TWO_CAPTCHA_API_KEY;
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
