import dotenv from 'dotenv';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';
dotenv.config();

puppeteer.use(StealthPlugin());

export async function scrapeProduct(url: string) {
  if (!url) return;

  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = Math.floor(Math.random() * 1000000);
  const proxyHost = 'brd.superproxy.io';

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--proxy-server=http=${proxyHost}:${port}`],
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

    const title = await page.$eval('h1', (el: { textContent: string; }) => el.textContent?.trim() || '');

    let productData = {
      title,
      currentPrice: '',
      originalPrice: '',
      discount: '',
      imageURL: '',
    };

    // Lazada
    if (url.includes('lazada.')) {
      const lazadaPrices = await page.evaluate(() => {
        const currentPrice = document.querySelector('.pdp-price_type_normal')?.textContent?.trim() || '';
        const originalPrice = document.querySelector('.pdp-price_type_deleted')?.textContent?.trim() || '';
        const discount = document.querySelector('.pdp-product-price__discount')?.textContent?.trim() || '';
        return { currentPrice, originalPrice, discount };
      });

      const imageUrl = await page.evaluate(() => {
        return document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      });

      productData = {
        title,
        currentPrice: lazadaPrices.currentPrice,
        originalPrice: lazadaPrices.originalPrice,
        discount: lazadaPrices.discount,
        imageURL: imageUrl,
      };
    }

    // Amazon
    if (url.includes('amazon.')) {
      const { currentPrice, discountRate, normalPrice } = await page.evaluate(() => {
        const priceSymbol = document.querySelector('.a-price-symbol')?.textContent?.trim() || '$';
        const priceWhole = document.querySelector('.a-price-whole')?.textContent?.replace(/[^\d]/g, '') || '0';
        const priceFraction = document.querySelector('.a-price-fraction')?.textContent?.trim() || '00';
        const rawTypicalPrice = document.querySelector('span.a-size-small.aok-offscreen')?.textContent?.trim() || '';
        const match = rawTypicalPrice.match(/\$[\d.,]+/);
        const typicalPrice = match ? match[0] : '';
        const discount = document.querySelector('.savingsPercentage')?.textContent?.trim() || '';

        return {
          currentPrice: `${priceSymbol}${priceWhole}.${priceFraction}`,
          discountRate: discount,
          normalPrice: typicalPrice,
        };
      });

      const imageUrl = await page.evaluate(() => {
        const img = document.querySelector('#landingImage') as HTMLImageElement;
        return img?.getAttribute('data-old-hires') || img?.src || '';
      });

      productData = {
        title,
        currentPrice,
        originalPrice: normalPrice,
        discount: discountRate,
        imageURL: imageUrl,
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
