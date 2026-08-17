import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  // Support Hostinger's dynamic ports while staying compatible with local development on port 3000
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Enable JSON body parser for API routes
  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", shop: "KCC Online Shop", timestamp: new Date().toISOString() });
  });

  // Commerce Engine Status Endpoint
  app.get("/api/commerce/status", (req, res) => {
    const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
    const shopifyToken = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
    const wooUrl = process.env.VITE_WOOCOMMERCE_API_URL;
    const wooKey = process.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
    const wooSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    let activeEngine = 'local';
    let isConfigured = false;

    if (shopifyDomain && shopifyToken) {
      activeEngine = 'shopify';
      isConfigured = true;
    } else if (wooUrl && wooKey && wooSecret) {
      activeEngine = 'woocommerce';
      isConfigured = true;
    }

    res.json({
      activeEngine,
      isConfigured,
      shopifyDomain: shopifyDomain || null,
      wooUrl: wooUrl || null,
      hasWooSecret: !!wooSecret,
      hasAliExpressSecret: !!process.env.ALIEXPRESS_APP_SECRET
    });
  });

  // WooCommerce REST API Proxy (Keeps WOOCOMMERCE_CONSUMER_SECRET server-side)
  app.get("/api/commerce/woocommerce/products", async (req, res) => {
    const wooUrl = process.env.VITE_WOOCOMMERCE_API_URL;
    const wooKey = process.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
    const wooSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!wooUrl || !wooKey || !wooSecret) {
      return res.status(400).json({
        error: "WooCommerce API credentials not configured on server",
        fallback: true
      });
    }

    try {
      const endpoint = `${wooUrl.replace(/\/$/, '')}/wp-json/wc/v3/products?consumer_key=${wooKey}&consumer_secret=${wooSecret}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`WooCommerce response status: ${response.status}`);
      }
      const data = await response.json();
      res.json({ products: data, source: 'woocommerce-proxy' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'WooCommerce API proxy error', fallback: true });
    }
  });

  // Shopify Checkout Session Proxy
  app.post("/api/commerce/checkout/shopify", async (req, res) => {
    const shopifyDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
    const shopifyToken = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

    if (!shopifyDomain || !shopifyToken) {
      return res.status(400).json({ error: "Shopify Storefront credentials missing" });
    }

    const { cart } = req.body;
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    try {
      const lineItemsGql = cart.items.map((item: any) => `{
        merchandiseId: "${item.variantId || item.productId}",
        quantity: ${item.quantity}
      }`).join(', ');

      const gqlMutation = `
        mutation {
          cartCreate(input: {
            lines: [${lineItemsGql}]
          }) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': shopifyToken
        },
        body: JSON.stringify({ query: gqlMutation })
      });

      const json = await response.json();
      const checkoutUrl = json?.data?.cartCreate?.cart?.checkoutUrl;

      if (checkoutUrl) {
        return res.json({ checkoutUrl, provider: 'Shopify Storefront' });
      } else {
        return res.status(400).json({ error: "Failed to generate Shopify checkout URL", errors: json?.data?.cartCreate?.userErrors });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Shopify checkout proxy error" });
    }
  });

  // Server-Side B2B Dropshipping & Supplier Extraction Proxy (No browser calls to AliExpress)
  app.post("/api/dropshipping/extract", async (req, res) => {
    const { url, platform } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Product URL is required" });
    }

    // Server-side simulated extraction with support for server secret keys
    const aliKey = process.env.ALIEXPRESS_APP_KEY;
    const aliSecret = process.env.ALIEXPRESS_APP_SECRET;

    setTimeout(() => {
      res.json({
        success: true,
        extractedAt: new Date().toISOString(),
        product: {
          title: "Smart High-Precision Electric Weighing Scale 5kg",
          costUsd: 3.40,
          platform: platform || "AliExpress",
          supplier: "Guangzhou Precision Tech Co. (Server Proxy Verified)",
          image: "https://images.unsplash.com/photo-1590212151175-e58edd96185c?q=80&w=800",
          moq: 1,
          weight: 350,
          hasServerSecret: !!aliSecret
        }
      });
    }, 400);
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Robust detection of 'dist' path to prevent errors on Phusion Passenger/Hostinger/PM2 runtimes
    let distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      const parentDist = path.join(__dirname, '..', 'dist');
      const currentDir = __dirname;
      if (fs.existsSync(path.join(currentDir, 'index.html'))) {
        distPath = currentDir;
      } else if (fs.existsSync(path.join(parentDist, 'index.html'))) {
        distPath = parentDist;
      }
    }

    app.use(express.static(distPath));
    
    // Fallback all other requests to index.html for SPA routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
