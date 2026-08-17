import { Product, PRODUCTS } from '../types';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  image?: string;
  inStock: boolean;
  sku?: string;
  attributes?: Record<string, string>;
}

export interface EnhancedProduct extends Product {
  variants: ProductVariant[];
  specifications?: Record<string, string>;
  vendor?: string;
  sku?: string;
  inStock?: boolean;
}

export interface CartLineItem {
  id: string; // unique cart line id
  productId: string;
  productName: string;
  productImage: string;
  variantId: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  weightGrams: number;
}

export interface CommerceCart {
  id: string;
  items: CartLineItem[];
  subtotal: number;
  totalWeightGrams: number;
  deliveryFee: number;
  discount: number;
  appliedCoupon?: string;
  total: number;
  checkoutUrl?: string;
}

export interface CommerceStatus {
  activeEngine: 'local' | 'shopify' | 'woocommerce';
  isConfigured: boolean;
  storeDomain?: string;
  message: string;
}

// Generate default variants for static/local products
export function getDefaultVariantsForProduct(product: Product): ProductVariant[] {
  if (product.category === 'Gadgets') {
    return [
      { id: `${product.id}-v1`, name: 'Standard Edition - Black', price: product.price, inStock: true, sku: `KCC-GAD-${product.id}-BLK` },
      { id: `${product.id}-v2`, name: 'Pro Edition (Extra Battery) - Silver', price: Math.round(product.price * 1.25), inStock: true, sku: `KCC-GAD-${product.id}-SLV` },
      { id: `${product.id}-v3`, name: 'Wholesale Pack of 5', price: Math.round(product.price * 4.2), inStock: true, sku: `KCC-GAD-${product.id}-PK5` },
    ];
  } else if (product.category === 'Kitchen') {
    return [
      { id: `${product.id}-v1`, name: 'Standard Pack (1 Unit)', price: product.price, inStock: true, sku: `KCC-KIT-${product.id}-STD` },
      { id: `${product.id}-v2`, name: 'Family Combo Pack (2 Units)', price: Math.round(product.price * 1.85), inStock: true, sku: `KCC-KIT-${product.id}-DUO` },
    ];
  } else {
    return [
      { id: `${product.id}-v1`, name: 'Standard Wholesale Rate', price: product.price, inStock: true, sku: `KCC-HM-${product.id}-STD` },
      { id: `${product.id}-v2`, name: 'Heavy Duty / Commercial Edition', price: Math.round(product.price * 1.35), inStock: true, sku: `KCC-HM-${product.id}-HD` },
    ];
  }
}

// Check active engine configuration
export function getCommerceConfigStatus(): CommerceStatus {
  const shopifyDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
  const shopifyToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
  const wooUrl = import.meta.env.VITE_WOOCOMMERCE_API_URL;

  if (shopifyDomain && shopifyToken) {
    return {
      activeEngine: 'shopify',
      isConfigured: true,
      storeDomain: shopifyDomain,
      message: `Connected to Shopify Storefront API (${shopifyDomain})`
    };
  }

  if (wooUrl) {
    return {
      activeEngine: 'woocommerce',
      isConfigured: true,
      storeDomain: wooUrl,
      message: `Connected to WooCommerce REST API (${wooUrl})`
    };
  }

  return {
    activeEngine: 'local',
    isConfigured: true,
    storeDomain: 'Local KCC Engine',
    message: 'Operating on Local Catalog Engine with Shopify & WooCommerce API readiness.'
  };
}

/**
 * Reusable function to fetch products
 */
export async function fetchProducts(options?: {
  category?: string;
  query?: string;
  limit?: number;
}): Promise<{ products: EnhancedProduct[]; engine: string; error?: string }> {
  const status = getCommerceConfigStatus();

  // If Shopify Storefront API configured
  if (status.activeEngine === 'shopify') {
    try {
      const shopifyDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
      const shopifyToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

      const gqlQuery = `
        query getProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                images(first: 3) {
                  edges { node { url } }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price { amount }
                      availableForSale
                      sku
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': shopifyToken,
        },
        body: JSON.stringify({ query: gqlQuery, variables: { first: options?.limit || 20 } }),
      });

      if (response.ok) {
        const json = await response.json();
        const shopifyProducts: EnhancedProduct[] = json.data.products.edges.map((edge: any) => {
          const node = edge.node;
          const variants: ProductVariant[] = node.variants.edges.map((vEdge: any) => ({
            id: vEdge.node.id,
            name: vEdge.node.title,
            price: parseFloat(vEdge.node.price.amount),
            inStock: vEdge.node.availableForSale,
            sku: vEdge.node.sku,
          }));

          const firstPrice = variants[0]?.price || 1000;
          return {
            id: node.id,
            name: node.title,
            description: node.description || 'Imported Shopify Product',
            price: firstPrice,
            image: node.images.edges[0]?.node?.url || 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=800',
            images: node.images.edges.map((iEdge: any) => iEdge.node.url),
            category: 'Gadgets',
            weight: 350,
            rating: 4.8,
            variants,
            inStock: true
          };
        });

        return { products: shopifyProducts, engine: 'shopify' };
      }
    } catch (err: any) {
      console.warn('Shopify Storefront fetch failed, falling back to local engine:', err);
    }
  }

  // If WooCommerce REST API configured
  if (status.activeEngine === 'woocommerce') {
    try {
      const res = await fetch('/api/commerce/woocommerce/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          return { products: data.products, engine: 'woocommerce' };
        }
      }
    } catch (err: any) {
      console.warn('WooCommerce API fetch failed, falling back to local engine:', err);
    }
  }

  // Local fallback with synthetic delay for realistic loading test
  await new Promise((r) => setTimeout(r, 150));

  let catalogList: EnhancedProduct[] = PRODUCTS.map((p) => ({
    ...p,
    variants: getDefaultVariantsForProduct(p),
    specifications: {
      'Warranty': '7 Days Replacement Guarantee',
      'Origin': 'Imported B2B Wholesale Stock',
      'Material': 'High Grade ABS & Alloy',
      'Weight': `${p.weight}g`,
      'Shipping': 'Courier Delivery across Pakistan'
    }
  }));

  if (options?.category && options.category !== 'All') {
    catalogList = catalogList.filter((p) => p.category === options.category);
  }

  if (options?.query) {
    const q = options.query.toLowerCase();
    catalogList = catalogList.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  return { products: catalogList, engine: 'local' };
}

/**
 * Reusable function to fetch a single product by ID
 */
export async function fetchProductById(id: string, allProducts?: EnhancedProduct[]): Promise<EnhancedProduct | null> {
  const catalog = allProducts || (await fetchProducts()).products;
  const found = catalog.find((p) => p.id === id);
  return found || null;
}

/**
 * Reusable function to fetch variants for a given product
 */
export async function fetchProductVariants(productId: string, allProducts?: EnhancedProduct[]): Promise<ProductVariant[]> {
  const prod = await fetchProductById(productId, allProducts);
  if (!prod) return [];
  return prod.variants && prod.variants.length > 0 ? prod.variants : getDefaultVariantsForProduct(prod);
}

/**
 * Reusable function to create/re-calculate a cart
 */
export function createCart(
  items: CartLineItem[],
  couponCode?: string,
  deliveryFee500g = 250,
  deliveryFee1kg = 400
): CommerceCart {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const totalWeightGrams = items.reduce((acc, item) => acc + item.weightGrams * item.quantity, 0);

  // Weight-based shipping logic
  let deliveryFee = 0;
  if (items.length > 0) {
    if (totalWeightGrams <= 500) {
      deliveryFee = deliveryFee500g;
    } else if (totalWeightGrams <= 1000) {
      deliveryFee = deliveryFee1kg;
    } else {
      // Every additional 500g + Rs.150
      const extraHalfKgs = Math.ceil((totalWeightGrams - 1000) / 500);
      deliveryFee = deliveryFee1kg + extraHalfKgs * 150;
    }
  }

  // Coupon Discount
  let discount = 0;
  const cleanCoupon = couponCode?.trim().toUpperCase();
  if (cleanCoupon === 'KCC10') {
    discount = Math.round(subtotal * 0.1); // 10% Off
  } else if (cleanCoupon === 'WHOLESALE') {
    discount = subtotal >= 2000 ? 300 : 150;
  } else if (cleanCoupon === 'FREESHIP') {
    discount = deliveryFee;
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);

  return {
    id: `cart_${Date.now()}`,
    items,
    subtotal,
    totalWeightGrams,
    deliveryFee,
    discount,
    appliedCoupon: cleanCoupon && discount > 0 ? cleanCoupon : undefined,
    total,
    checkoutUrl: `/checkout?cartId=cart_${Date.now()}`
  };
}

/**
 * Reusable function to update cart
 */
export function updateCart(
  existingCart: CommerceCart,
  updatedItems: CartLineItem[],
  couponCode?: string
): CommerceCart {
  return createCart(updatedItems, couponCode || existingCart.appliedCoupon);
}

/**
 * Reusable function to generate Checkout URL
 */
export async function getCheckoutUrl(
  cart: CommerceCart,
  shippingDetails?: { name: string; phone: string; address: string; city: string }
): Promise<{ checkoutUrl: string; provider: string }> {
  const status = getCommerceConfigStatus();

  // If Shopify Storefront API configured
  if (status.activeEngine === 'shopify') {
    try {
      const res = await fetch('/api/commerce/checkout/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, shippingDetails })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.checkoutUrl) {
          return { checkoutUrl: data.checkoutUrl, provider: 'Shopify Checkout' };
        }
      }
    } catch (e) {
      console.warn('Shopify checkout generation error, using store checkout:', e);
    }
  }

  // Default KCC Store direct checkout generator
  const orderRef = `KCC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const itemSummary = cart.items.map(i => `${i.productName} (${i.variantName}) x${i.quantity}`).join(', ');
  const whatsappMsg = encodeURIComponent(
    `🛍️ *NEW KCC STORE ORDER #${orderRef}*\n\n` +
    `*Customer:* ${shippingDetails?.name || 'Valued Customer'}\n` +
    `*Phone:* ${shippingDetails?.phone || 'N/A'}\n` +
    `*Delivery Address:* ${shippingDetails?.address || ''}, ${shippingDetails?.city || ''}\n\n` +
    `*Items Ordered:*\n${itemSummary}\n\n` +
    `*Subtotal:* Rs.${cart.subtotal.toLocaleString()}\n` +
    `*Delivery Fee:* Rs.${cart.deliveryFee.toLocaleString()} (${cart.totalWeightGrams}g)\n` +
    (cart.discount > 0 ? `*Discount:* -Rs.${cart.discount.toLocaleString()}\n` : '') +
    `*TOTAL PAYABLE:* Rs.${cart.total.toLocaleString()}\n\n` +
    `Please confirm my order dispatch!`
  );

  return {
    checkoutUrl: `https://wa.me/923001234567?text=${whatsappMsg}`,
    provider: 'KCC Direct Courier & WhatsApp Checkout'
  };
}
