import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import dotenv from "dotenv";

dotenv.config();
puppeteer.use(StealthPlugin());

export default async function handler(req: any, res: any) {
  try {
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = Math.floor(Math.random() * 1000000);
    const proxyHost = "brd.superproxy.io";

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        `--proxy-server=http=${proxyHost}:${port}`,
      ],
    });

    const page = await browser.newPage();
    await page.authenticate({
      username: `${username}-session-${session_id}`,
      password,
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
    );

    // 🔥 Amazon Trending Apparel - FIXED IMAGE EXTRACTION
    await page.goto("https://www.amazon.com/s?k=apparel", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for products to load
    await page.waitForSelector(".s-main-slot .s-result-item", {
      timeout: 15000,
    });

    const amazonProducts = await page.evaluate(() => {
      const items: {
        name: string;
        image: string;
        currentPrice: string;
        originalPrice: string;
        discountRate?: string;
        link: string;
        platform: string;
      }[] = [];

      document.querySelectorAll(".s-main-slot .s-result-item").forEach((el, i) => {
        if (i >= 20) return;

        const name = el.querySelector("h2 a span")?.textContent?.trim() || "";
        
        // 🔧 IMPROVED IMAGE EXTRACTION FOR AMAZON
        let image = "";
        const imgElement = el.querySelector("img.s-image") as HTMLImageElement;
        if (imgElement) {
          // Try src first, then data-src, then srcset
          image = imgElement.src || 
                  imgElement.getAttribute("data-src") || 
                  imgElement.getAttribute("srcset")?.split(" ")[0] || "";
          
          // If image is a data URL or placeholder, try to get the high-res version
          if (image && !image.startsWith("data:") && !image.includes("1x1_transparent")) {
            // Amazon images often have size parameters, let's get a decent size
            if (image.includes("._")) {
              image = image.replace(/\._.*?_/, "._AC_SL300_");
            }
          }
        }
        
        const link =
          "https://www.amazon.com" +
          (el.querySelector("h2 a")?.getAttribute("href") || "");

        const priceSymbol = el.querySelector(".a-price-symbol")?.textContent?.trim() || "$";
        const priceWhole =
          el.querySelector(".a-price-whole")?.textContent?.replace(/[^\d]/g, "") || "";
        const priceFraction =
          el.querySelector(".a-price-fraction")?.textContent?.trim() || "00";

        let currentPrice = "";
        if (priceWhole) currentPrice = `${priceSymbol}${priceWhole}.${priceFraction}`;

        const originalPriceRaw =
          el.querySelector(".a-text-price .a-offscreen")?.textContent?.trim() || "";
        const discountRate = el.querySelector(".savingsPercentage")?.textContent?.trim() || "";

        let originalPrice = originalPriceRaw || currentPrice || "—";
        if (!originalPrice && currentPrice) originalPrice = currentPrice;
        if (!currentPrice && originalPriceRaw) currentPrice = originalPriceRaw;

        if (name && image) {
          items.push({
            name,
            image,
            currentPrice,
            originalPrice,
            discountRate: discountRate || undefined,
            link,
            platform: "Amazon",
          });
        }
      });

      return items;
    });

    // 🔥 Lazada Trending Apparel - IMPROVED APPROACH
    await page.goto("https://www.lazada.com.ph/catalog/?q=apparel", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for products and try multiple selectors as Lazada updates their classes frequently
    await page.waitForSelector(".Bm3ON, [data-qa-locator='product-item'], .cRjKsc", { timeout: 15000 });

    const lazadaProducts = await page.evaluate(() => {
      const items: {
        name: string;
        image: string;
        currentPrice: string;
        originalPrice: string;
        discountRate?: string;
        link: string;
        platform: string;
      }[] = [];

      // Try multiple selectors as Lazada changes their classes
      const productSelectors = [".Bm3ON", "[data-qa-locator='product-item']", ".cRjKsc"];
      let products: NodeListOf<Element> | null = null;
      
      for (const selector of productSelectors) {
        products = document.querySelectorAll(selector);
        if (products.length > 0) break;
      }

      if (!products) return items;

      products.forEach((el, i) => {
        if (i >= 20) return;

        // Try multiple selectors for product name
        const nameSelectors = [".RfADt a", "[data-qa-locator='product-name']", ".c16H9d a"];
        let name = "";
        let link = "";
        
        for (const selector of nameSelectors) {
          const nameEl = el.querySelector(selector);
          if (nameEl) {
            name = nameEl.textContent?.trim() || "";
            link = (nameEl as HTMLAnchorElement)?.href || "";
            if (name && link) break;
          }
        }

        // Try multiple selectors for prices
        const currentPriceSelectors = [".ooOxS", "[data-qa-locator='product-price']", ".c13VH6"];
        const originalPriceSelectors = [".WNoq3", ".c13VH6.c1hkC1", ".c13VH6 del"];
        const discountSelectors = [".IcOsH", "[data-qa-locator='product-discount']", ".c16H9d .c13VH6"];

        let currentPrice = "";
        let originalPrice = "";
        let discountRate = "";

        for (const selector of currentPriceSelectors) {
          const priceEl = el.querySelector(selector);
          if (priceEl) {
            currentPrice = priceEl.textContent?.trim() || "";
            if (currentPrice) break;
          }
        }

        for (const selector of originalPriceSelectors) {
          const priceEl = el.querySelector(selector);
          if (priceEl) {
            originalPrice = priceEl.textContent?.trim() || "";
            if (originalPrice) break;
          }
        }

        for (const selector of discountSelectors) {
          const discountEl = el.querySelector(selector);
          if (discountEl) {
            discountRate = discountEl.textContent?.trim() || "";
            if (discountRate) break;
          }
        }

        // 🔧 IMPROVED IMAGE EXTRACTION FOR LAZADA
        let image = "";
        const imgSelectors = ["img", ".c1ZqIE img", "[data-qa-locator='product-image']"];
        
        for (const selector of imgSelectors) {
          const imgElement = el.querySelector(selector) as HTMLImageElement;
          if (imgElement) {
            image = imgElement.src || 
                   imgElement.getAttribute("data-src") || 
                   imgElement.getAttribute("data-original") ||
                   imgElement.getAttribute("srcset")?.split(" ")[0] || "";
            
            // Skip placeholder or loading images
            if (image && !image.includes("placeholder") && !image.includes("loading") && !image.startsWith("data:")) {
              break;
            }
          }
        }

        if (name && link) {
          items.push({
            name,
            image, // We'll still get og:image as fallback, but this should work better
            currentPrice,
            originalPrice,
            discountRate: discountRate || undefined,
            link,
            platform: "Lazada",
          });
        }
      });

      return items;
    });

    // 👇 IMPROVED: Get og:image for Lazada products (with better error handling)
    for (let i = 0; i < lazadaProducts.length; i++) {
      const product = lazadaProducts[i];
      let productPage;
      
      try {
        productPage = await browser.newPage();
        
        // Set a shorter timeout for individual pages
        await productPage.goto(product.link, { 
          waitUntil: "domcontentloaded", 
          timeout: 10000 
        });
        
        // Try to get og:image
        const ogImage = await productPage.$eval(
          'meta[property="og:image"]',
          (el) => el.getAttribute("content") || ""
        ).catch(() => "");
        
        // If we got an og:image and our current image is empty or bad, use og:image
        if (ogImage && (!product.image || product.image.includes("placeholder"))) {
          product.image = ogImage;
        }
        
        await productPage.close();
        
        // Add a small delay to avoid overwhelming the server
        if (i < lazadaProducts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (err) {
        if (err && typeof err === "object" && "message" in err) {
          console.error(`Failed to fetch og:image for ${product.name}:`, (err as { message?: string }).message);
        } else {
          console.error(`Failed to fetch og:image for ${product.name}:`, err);
        }
        if (productPage) {
          try {
            await productPage.close();
          } catch (closeErr) {
            if (closeErr && typeof closeErr === "object" && "message" in closeErr) {
              console.error("Failed to close page:", (closeErr as { message?: string }).message);
            } else {
              console.error("Failed to close page:", closeErr);
            }
          }
        }
      }
    }

    await browser.close();

    // Filter out products with empty images (optional)
    const amazonFiltered = amazonProducts.filter(p => p.image && p.image.trim() !== "");
    const lazadaFiltered = lazadaProducts.filter(p => p.image && p.image.trim() !== "");
    
    const combined = [...amazonFiltered, ...lazadaFiltered];
    
    console.log(`✅ Scraped ${combined.length} products with images`);
    
    res.status(200).json(combined);
    
  } catch (err) {
    console.error("❌ Trending scraper error:", err);
    res.status(500).json({ error: "Failed to fetch trending products" });
  }
}