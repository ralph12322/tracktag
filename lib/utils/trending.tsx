// trending.ts
let trendingCache: null = null;
let trendingPromise: Promise<any> | null = null;

const getTrendingProducts = async () => {
  if (trendingCache) return trendingCache;

  if (trendingPromise) return trendingPromise;

  trendingPromise = fetch("/api/admin/trending", { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => {
      const products = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];

      trendingCache = products;
      sessionStorage.setItem("trendingProducts", JSON.stringify(products));
      trendingPromise = null;
      return products;
    })
    .catch((err) => {
      console.error("Error fetching trending:", err);
      trendingPromise = null;
      return [];
    });

  return trendingPromise;
};

export default getTrendingProducts;
