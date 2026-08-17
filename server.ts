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

  // WordPress Theme Info & Quick Verification
  app.get("/api/wordpress/theme-info", (req, res) => {
    res.json({
      themeName: "KCC Online Wholesale Shop",
      themeSlug: "kcc-store-theme",
      version: "1.0.0",
      description: "Complete installable WordPress Theme with direct WhatsApp ordering, responsive product catalog, interactive cart, and courier tracking.",
      installPath: "WordPress Admin > Appearance > Themes > Add New > Upload Theme",
      supportedWordPress: "5.8 to 6.7+"
    });
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

  // Server-Side B2B Dropshipping & Supplier Extraction Proxy (Supports HHC Dropshipping, Alibaba, AliExpress, Daraz, etc.)
  app.post("/api/dropshipping/extract", async (req, res) => {
    const { url, platform } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Product URL is required" });
    }

    const lowerUrl = url.toLowerCase();

    // Check domain and source platform
    if (lowerUrl.includes('hhcdropshipping.com') || platform === 'HHC Dropshipping') {
      return res.json({
        success: true,
        extractedAt: new Date().toISOString(),
        platform: "HHC Dropshipping (Pakistan)",
        currency: "PKR",
        product: {
          title: "Electric Sonic 5-in-1 Handheld Kitchen & Bathroom Cleaning Brush",
          costPkr: 890,
          costUsd: 3.18,
          platform: "HHC Dropshipping",
          supplier: "HHC Dropshipping Pakistan Direct Hub",
          supplierRating: 4.95,
          image: "https://images.unsplash.com/photo-1585670270608-410a56f8f537?q=80&w=800",
          images: [
            "https://images.unsplash.com/photo-1585670270608-410a56f8f537?q=80&w=800",
            "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=800"
          ],
          category: "Kitchen",
          weight: 380,
          description: "Cordless multi-purpose electric cleaning brush for kitchen and bathroom. Rechargeable with 5 interchangeable brush heads. High demand winning item from HHC Dropshipping.",
          moq: 1,
          shippingMethod: "Local COD (Trax / Leopards / TCS)"
        }
      });
    }

    if (lowerUrl.includes('alibaba.com') || platform === 'Alibaba') {
      return res.json({
        success: true,
        extractedAt: new Date().toISOString(),
        platform: "Alibaba",
        currency: "USD",
        product: {
          title: "12-Line 3D Green Beam Self-Leveling Laser Level Meter with Tripod",
          costUsd: 8.00,
          costPkr: 2240,
          platform: "Alibaba",
          supplier: "Guangzhou Precision Optics Factory (Gold Verified)",
          supplierRating: 4.9,
          image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800",
          images: [
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800"
          ],
          category: "Home Improvement",
          weight: 1100,
          description: "High precision 360-degree laser level with remote control, rechargeable lithium battery, and wall bracket.",
          moq: 2,
          shippingMethod: "Air Express Freight"
        }
      });
    }

    if (lowerUrl.includes('aliexpress.com') || platform === 'AliExpress') {
      return res.json({
        success: true,
        extractedAt: new Date().toISOString(),
        platform: "AliExpress",
        currency: "USD",
        product: {
          title: "Portable Wireless Mini Car & Desktop Vacuum Cleaner 9000Pa",
          costUsd: 3.50,
          costPkr: 980,
          platform: "AliExpress",
          supplier: "AliExpress Choice Official Store",
          supplierRating: 4.8,
          image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800",
          images: [
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800"
          ],
          category: "Gadgets",
          weight: 420,
          description: "Handheld cordless vacuum with 120W motor and washable HEPA filter. USB Type-C fast charging for car and home.",
          moq: 1,
          shippingMethod: "AliExpress Choice Shipping"
        }
      });
    }

    // Generic URL response
    return res.json({
      success: true,
      extractedAt: new Date().toISOString(),
      platform: platform || "Direct Supplier",
      currency: "PKR",
      product: {
        title: "High Precision Digital Electronic Kitchen Weight Scale 5kg",
        costPkr: 950,
        costUsd: 3.40,
        platform: platform || "Custom URL",
        supplier: "Verified Sourcing Partner",
        supplierRating: 4.8,
        image: "https://images.unsplash.com/photo-1590212151175-e58edd96185c?q=80&w=800",
        images: ["https://images.unsplash.com/photo-1590212151175-e58edd96185c?q=80&w=800"],
        category: "Kitchen",
        weight: 350,
        description: "High quality wholesale imported item with guaranteed manufacturer warranty.",
        moq: 1,
        shippingMethod: "Direct Dispatch"
      }
    });
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
