// lib/scraper/index.ts

import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import axios from 'axios';

export async function scrapeProduct(url: string) {
  if (!url) return;

  try {
    const isDev = process.env.NODE_ENV !== 'production';
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath || '/usr/bin/chromium-browser',
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const title = await page.$eval('h1', el => el.textContent?.trim() || '');

    let productData = {
      title,
      currentPrice: '',
      originalPrice: '',
      discount: '',
      imageUrl: '',
      url,
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
        url,
      };
    }

    // Amazon
    if (url.includes('amazon.')) {
      const { currentPrice, discountRate, normalPrice } = await page.evaluate(() => {
        const extractText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || '';

        const fullText = document.body.innerText;
        const priceRegex = /\$[\d,.]+/g;
        const allPrices = fullText.match(priceRegex) || [];

        const priceWhole = document.querySelector('.a-price-whole')?.textContent?.replace(/[^\d]/g, '') || '';
        const priceFraction = document.querySelector('.a-price-fraction')?.textContent?.trim() || '';
        const currentPrice = priceWhole ? `$${priceWhole}.${priceFraction || '00'}` : allPrices[0] || '';

        const discountRate = extractText('.savingsPercentage') || (fullText.match(/-\d+%/)?.[0] || '');

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

      productData = {
        title,
        currentPrice,
        originalPrice: normalPrice,
        discount: discountRate,
        imageUrl,
        url,
      };
    }

    await browser.close();
    return productData;
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}
