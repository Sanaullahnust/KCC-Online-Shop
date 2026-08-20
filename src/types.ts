export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  video?: string;
  category: 'Home Improvement' | 'Gadgets' | 'Kitchen';
  weight: number; // weight in grams
  rating: number;
  isHot?: boolean;
  isTopSeller?: boolean;
  discountNote?: string;
  stock?: number; // quantity in warehouse / inventory
  lowStockThreshold?: number; // threshold below which item is marked as low stock (default 5)
  sku?: string; // Stock Keeping Unit / Item Code
  trackInventory?: boolean;
}

export function getProductStockStatus(product: Product) {
  const stock = typeof product.stock === 'number' ? product.stock : 15;
  const threshold = typeof product.lowStockThreshold === 'number' ? product.lowStockThreshold : 5;
  
  if (stock <= 0) {
    return {
      status: 'out_of_stock' as const,
      stock: 0,
      threshold,
      label: 'Out of Stock',
      shortLabel: 'Out of Stock',
      badgeClass: 'bg-red-600 text-white',
      isLow: true,
      isOut: true,
    };
  }
  if (stock <= threshold) {
    return {
      status: 'low_stock' as const,
      stock,
      threshold,
      label: `Low Stock: Only ${stock} left`,
      shortLabel: `Low Stock (${stock})`,
      badgeClass: 'bg-amber-500 text-white',
      isLow: true,
      isOut: false,
    };
  }
  return {
    status: 'in_stock' as const,
    stock,
    threshold,
    label: `In Stock (${stock} units)`,
    shortLabel: `${stock} in stock`,
    badgeClass: 'bg-emerald-600 text-white',
    isLow: false,
    isOut: false,
  };
}

import electricLighterImg from "./assets/images/regenerated_image_1780400575356.jpg";
import eagleLampImg from "./assets/images/regenerated_image_1780418764588.jpg";
import miniFanImg from "./assets/images/regenerated_image_1780479328385.jpg";
import waterPumpImg from "./assets/images/regenerated_image_1780400572965.jpg";
import arcticAirImg from "./assets/images/regenerated_image_1780479517983.jpg";
import neckCoolerImg from "./assets/images/regenerated_image_1780480995169.jpg";

export const PRODUCTS: Product[] = [
  {
    id: '0',
    name: 'Touch Screen Automatic Rechargeable Water Pump',
    description: 'Electric water dispenser with touch screen control. Easy to use and highly efficient.',
    price: 1200,
    discountNote: 'Discount On Quantity',
    category: 'Gadgets',
    image: waterPumpImg,
    weight: 350,
    rating: 4.8,
    isTopSeller: true,
    isHot: true,
    stock: 14,
    lowStockThreshold: 5,
    sku: 'KCC-WTR-001'
  },
  {
    id: '1',
    name: 'Electric Rechargeable Arc Lighter',
    description: 'Windproof USB rechargeable lighter – ideal for Pakistan weather and outdoor use.',
    price: 250,
    discountNote: 'Discount on Quantity',
    image: electricLighterImg,
    images: [
      electricLighterImg
    ],
    category: 'Gadgets',
    weight: 120, // 120g
    rating: 4.8,
    isTopSeller: true,
    stock: 3, // Low stock demo
    lowStockThreshold: 5,
    sku: 'KCC-LGT-002'
  },
  {
    id: '2',
    name: 'Eagle Wall Lamp',
    description: 'Box Packing. With Remote.',
    price: 1900,
    discountNote: 'Discount On Quantity',
    image: eagleLampImg,
    images: [
      eagleLampImg
    ],
    category: 'Home Improvement',
    weight: 1400, // 1.4kg
    rating: 4.9,
    isTopSeller: true,
    stock: 18,
    lowStockThreshold: 5,
    sku: 'KCC-LMP-003'
  },
  {
    id: '3',
    name: 'Mini Cooling Fan',
    description: 'Portable USB mini cooling fan. Quiet and powerful.',
    price: 2000,
    discountNote: 'Discount On Quantity',
    image: miniFanImg,
    category: 'Gadgets',
    weight: 250, // 250g
    rating: 4.7,
    isTopSeller: true,
    stock: 4, // Low stock demo
    lowStockThreshold: 5,
    sku: 'KCC-FAN-004'
  },
  {
    id: '4',
    name: 'Arctic Air Ultra Instant Air Cooler',
    description: 'The Arctic Air Ultra Instant Air Cooler is a compact, personal cooling device that delivers refreshing cool air in seconds. Featuring advanced hydro-chill technology and a quiet fan, it cools, humidifies, and purifies the air around you. Perfect for bedrooms, desks, dorms, or travel use.',
    price: 2150,
    discountNote: 'Discount On Quantity',
    image: arcticAirImg,
    category: 'Home Improvement',
    weight: 950, // 950g
    rating: 4.5,
    stock: 2, // Low stock demo
    lowStockThreshold: 5,
    sku: 'KCC-CLR-005'
  },
  {
    id: '5',
    name: 'USB Gadget Charger',
    description: 'Multi-port fast charging station for all your devices.',
    price: 450,
    discountNote: 'Discount on Quantity',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800',
    category: 'Gadgets',
    weight: 150, // 150g
    rating: 4.6,
    stock: 25,
    lowStockThreshold: 5,
    sku: 'KCC-CHG-006'
  },
  {
    id: '6',
    name: 'Bladeless Neck Cooler',
    description: 'Bladeless neck cooler for instant cooling—quiet, hands-free & portable.',
    price: 800,
    discountNote: 'Discount on Quantity',
    image: neckCoolerImg,
    category: 'Gadgets',
    weight: 250, // 250g
    rating: 4.4,
    stock: 3, // Low stock demo
    lowStockThreshold: 5,
    sku: 'KCC-NCK-007'
  },
  {
    id: '7',
    name: 'LED Work Light',
    description: 'Portable super bright LED lamp for construction or emergency.',
    price: 650,
    discountNote: 'Discount on Quantity',
    image: 'https://images.unsplash.com/photo-1513506490282-4d4716ee38cd?q=80&w=800',
    category: 'Home Improvement',
    weight: 350, // 350g
    rating: 4.8,
    stock: 12,
    lowStockThreshold: 5,
    sku: 'KCC-LGT-008'
  },
  {
    id: '8',
    name: 'Waterproof Tool Bag',
    description: 'Large capacity 16-inch heavy duty tool organizer.',
    price: 1100,
    discountNote: 'Discount on Quantity',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=800',
    category: 'Home Improvement',
    weight: 780, // 780g
    rating: 4.7,
    stock: 8,
    lowStockThreshold: 5,
    sku: 'KCC-BAG-009'
  },
  {
    id: '9',
    name: 'Mini Bluetooth Printer',
    description: 'Inkless thermal pocket printer for notes and labels.',
    price: 1800,
    discountNote: 'Discount on Quantity',
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=800',
    category: 'Gadgets',
    weight: 180, // 180g
    rating: 4.5,
    stock: 0, // Out of stock demo
    lowStockThreshold: 5,
    sku: 'KCC-PRT-010'
  },
  {
    id: '10',
    name: 'USB Desk Fan',
    description: 'Quiet powerful cooling fan with adjustable speed.',
    price: 550,
    discountNote: 'Discount on Quantity',
    image: 'https://images.unsplash.com/photo-1622144783734-ef87532d559c?q=80&w=800',
    category: 'Gadgets',
    weight: 280, // 280g
    rating: 4.3,
    stock: 6,
    lowStockThreshold: 5,
    sku: 'KCC-DFN-011'
  }
];

export interface ContactSubmission {
  id: string;
  name: string;
  emailOrPhone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
  notes?: string;
  trackingNumber?: string;
  courierName?: string;
  orderType?: 'WhatsApp Order' | 'Contact Form' | 'Inquiry';
  estimatedDeliveryDate?: string;
  replyHistory?: {
    date: string;
    channel: 'whatsapp' | 'email';
    message: string;
    sender?: string;
  }[];
}

export interface CsvImportLog {
  id: string;
  timestamp: string;
  fileName: string;
  importMode: 'append' | 'replace';
  totalRowsProcessed: number;
  productsAddedCount: number;
  productsUpdatedCount?: number;
  errorsCount: number;
  status: 'success' | 'partial' | 'failed';
  errors: {
    rowNumber: number;
    productName?: string;
    sku?: string;
    errorReason: string;
  }[];
  importedProductNames: string[];
}

export type AdminTab = 'products' | 'import-logs' | 'contact-messages' | 'store-info' | 'hero' | 'deals' | 'testimonials' | 'policies' | 'user-management' | 'wordpress' | 'dropshipping';

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'superadmin' | 'subadmin';
  allowedTabs: AdminTab[];
  allowedCategories?: string[]; // e.g. ['Kitchen', 'Gadgets'] or empty for all
  maxDiscountPercent?: number; // e.g. 30
  canDeleteProducts?: boolean;
  canManageUsers?: boolean;
  createdAt: string;
}

export const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 'u-superadmin',
  username: 'admin',
  password: 'kccadmin2024',
  name: 'Main Admin (Superadmin)',
  role: 'superadmin',
  allowedTabs: ['products', 'import-logs', 'contact-messages', 'store-info', 'hero', 'deals', 'testimonials', 'policies', 'user-management', 'wordpress', 'dropshipping'],
  allowedCategories: [], // All categories
  maxDiscountPercent: 100,
  canDeleteProducts: true,
  canManageUsers: true,
  createdAt: '2026-01-01'
};

export interface DropshipSupplier {
  id: string;
  name: string;
  platform: 'HHC Dropshipping' | 'Alibaba' | 'AliExpress' | 'CJ Dropshipping' | 'Made-in-China' | 'DHgate' | '1688';
  rating: number;
  ordersFulfilled: number;
  avgShippingDays: string;
  badge: string;
  logo: string;
  url: string;
  description: string;
}

export interface DropshipPresetItem {
  id: string;
  title: string;
  platform: 'HHC Dropshipping' | 'Alibaba' | 'AliExpress' | 'CJ Dropshipping' | 'DHgate';
  supplierName: string;
  supplierRating: number;
  costUsd: number;
  costPkr: number;
  suggestedRetailPkr: number;
  estimatedProfitPkr: number;
  moq: number;
  category: 'Home Improvement' | 'Gadgets' | 'Kitchen';
  weight: number;
  image: string;
  shippingMethod: string;
  description: string;
}

export interface DropshipOrder {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  customerPrice: number;
  supplierCostPkr: number;
  estimatedProfit: number;
  supplierName: string;
  platform: string;
  trackingNumber: string;
  courier: string;
  status: 'Pending Dispatch' | 'In Transit' | 'Customs Clearance' | 'Delivered' | 'Cancelled';
  date: string;
}

export interface DropshipSettings {
  usdExchangeRate: number; // e.g. 280 PKR
  defaultMarkupPercent: number; // e.g. 80%
  aliExpressAppKey: string;
  aliExpressSecret: string;
  cjAccessToken: string;
  alibabaOpenKey: string;
  autoFulfillOrders: boolean;
  notifyLowStock: boolean;
}

export const INITIAL_CONTACT_SUBMISSIONS: ContactSubmission[] = [
  {
    id: 'msg-1',
    name: 'Muhammad Farhan',
    emailOrPhone: '0301-9876543',
    subject: 'Wholesale Bulk Discount Inquiry',
    message: 'AOA, I want to order 50 units of the Rechargeable Arc Lighter for my shop in Rawalpindi. What is the wholesale bulk rate?',
    createdAt: '2026-08-08 14:32',
    status: 'unread',
    orderType: 'Inquiry'
  },
  {
    id: 'msg-2',
    name: 'Amina Sheikh',
    emailOrPhone: '0321-8899112',
    subject: 'WhatsApp Order - 2x Water Dispenser Pump',
    message: 'Confirmed order placed via WhatsApp for 2x Touch Screen Water Pump (Rs. 2,900 Advance Payment Transfer verified).',
    createdAt: '2026-08-07 10:15',
    status: 'replied',
    orderType: 'WhatsApp Order',
    trackingNumber: 'TCS-928401928',
    courierName: 'TCS Express',
    estimatedDeliveryDate: '2026-08-14',
    notes: 'Payment screenshot verified on WhatsApp. Dispatched via TCS Express.'
  }
];

export interface Deal {
  id: string;
  title: string;
  discount: string;
  desc: string;
  price: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  review: string;
  rating: number;
  location?: string;
}

export interface StoreSettings {
  topBarText: string;
  storePhone: string;
  whatsappNumber: string;
  storeAddress: string;
  deliveryFee500g: number;
  deliveryFee1kg: number;
  heroBadgeText: string;
  heroHeadline: string;
  heroSubheading: string;
  heroBgImage: string;
  returnPolicyText: string;
  privacyPolicyText: string;
  termsText: string;
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  bankQr?: string;
  bankAlHabibTitle?: string;
  bankAlHabibAccountNumber?: string;
  bankAlHabibIban?: string;
  bankAlHabibQr?: string;
  easypaisaNumber?: string;
  easypaisaTitle?: string;
  easypaisaQr?: string;
  jazzcashNumber?: string;
  jazzcashTitle?: string;
  jazzcashQr?: string;
  raastId?: string;
  raastQr?: string;
  paymentInstructions?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  topBarText: 'All items on Wholesale Price • Store Collection & Delivery • Rs.250 (500g) / Rs.400 (1kg)',
  storePhone: '03295147517',
  whatsappNumber: '923295147517',
  storeAddress: 'KCC Wholesale Shop, Main Bazar, City Center, Pakistan',
  deliveryFee500g: 250,
  deliveryFee1kg: 400,
  heroBadgeText: 'Wholesale Rates Guaranteed',
  heroHeadline: 'Imported & Domestic Goods at Wholesale Prices',
  heroSubheading: 'Get top quality home improvement tools, kitchenware, and smart gadgets delivered directly across Pakistan at wholesale prices.',
  heroBgImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200',
  returnPolicyText: 'At KCC Store, we want you to be 100% satisfied with your wholesale purchase. If you receive a damaged or incorrect product, you can request an exchange or return within 7 days of delivery. Please inspect your goods upon store pickup or courier arrival.',
  privacyPolicyText: 'We respect your privacy. KCC Store only collects essential customer information required for shipping, order updates, and customer support. We do not sell or share your personal data with third parties.',
  termsText: 'By placing an order on KCC Store, you agree to our wholesale terms. Prices are subject to availability. Shipping rates are calculated based on weight (Rs.250 per 500g or Rs.400 per 1kg). Payment is accepted strictly via Advance Bank Transfer / EasyPaisa / JazzCash / Raast. Buyers must share their payment transfer screenshot on WhatsApp to confirm and dispatch the order timely.',
  bankName: 'Meezan Bank Ltd',
  bankAccountTitle: 'KCC Online Wholesale Shop',
  bankAccountNumber: '01020105829102',
  bankIban: 'PK36MEZN0001020105829102',
  bankQr: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=PK36MEZN0001020105829102&margin=10',
  bankAlHabibTitle: 'KCC Wholesale Traders',
  bankAlHabibAccountNumber: '1029-0981-002341-01-9',
  bankAlHabibIban: 'PK45BAHL1029098100234101',
  bankAlHabibQr: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=PK45BAHL1029098100234101&margin=10',
  easypaisaNumber: '03295147517',
  easypaisaTitle: 'KCC Store',
  easypaisaQr: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=03295147517-EASYPAISA-KCC&margin=10',
  jazzcashNumber: '03295147517',
  jazzcashTitle: 'KCC Store',
  jazzcashQr: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=03295147517-JAZZCASH-KCC&margin=10',
  raastId: '03295147517',
  raastQr: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=03295147517-RAAST-KCC&margin=10',
  paymentInstructions: 'Please scan the Payment QR Code or transfer to the account details above. Share your payment transaction screenshot on WhatsApp to verify and dispatch your order timely.'
};

export interface ShippingCountry {
  code: string;
  name: string;
  flag: string;
  isDomestic: boolean;
  eta: string;
  fee500g: number;
  fee1kg: number;
  extra500g: number;
}

export const SHIPPING_COUNTRIES: ShippingCountry[] = [
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', isDomestic: true, eta: '2-3 business days in Pakistan', fee500g: 250, fee1kg: 400, extra500g: 150 },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 3500, fee1kg: 4800, extra500g: 1200 },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 3800, fee1kg: 5200, extra500g: 1300 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 4500, fee1kg: 6200, extra500g: 1500 },
  { code: 'US', name: 'United States', flag: '🇺🇸', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 4800, fee1kg: 6800, extra500g: 1600 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 4900, fee1kg: 6900, extra500g: 1650 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 5200, fee1kg: 7200, extra500g: 1700 },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 3600, fee1kg: 4900, extra500g: 1250 },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 3700, fee1kg: 5000, extra500g: 1250 },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 3700, fee1kg: 5000, extra500g: 1250 },
  { code: 'DE', name: 'Germany / Europe', flag: '🇩🇪', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 4600, fee1kg: 6400, extra500g: 1550 },
  { code: 'INTL', name: 'Other International Country', flag: '🌐', isDomestic: false, eta: '10-12 working days outside Pakistan', fee500g: 5000, fee1kg: 7000, extra500g: 1600 },
];

export const DEALS: Deal[] = [
  {
    id: 'd1',
    title: 'Kitchen Starter Kit',
    discount: '20% OFF',
    desc: 'Blender + Knife Set + Storage Jars',
    price: 'Rs. 4500'
  },
  {
    id: 'd2',
    title: 'Gadget Combo',
    discount: 'SAVE Rs. 500',
    desc: 'Arc Lighter + USB Fan + Charger',
    price: 'Rs. 2000'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ahmed K.',
    review: 'Best electric lighter! Fast delivery and amazing quality.',
    rating: 5,
    location: 'Lahore'
  },
  {
    id: 't2',
    name: 'Sara M.',
    review: 'The kitchen blender is powerful and easy to clean. Best shop in Pakistan!',
    rating: 5,
    location: 'Karachi'
  },
  {
    id: 't3',
    name: 'Zia Khan',
    review: 'Affordable power tools. Highly recommended for home projects.',
    rating: 4,
    location: 'Islamabad'
  }
]; 

export const DEFAULT_DROPSHIP_SUPPLIERS: DropshipSupplier[] = [
  {
    id: 'sup-hhc',
    name: 'HHC Dropshipping Pakistan Direct Hub',
    platform: 'HHC Dropshipping',
    rating: 4.95,
    ordersFulfilled: 120000,
    avgShippingDays: '2-4 Days Domestic Tracked Dispatch (TCS/Trax/Leopards)',
    badge: 'Verified Pakistani Supplier #1',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=200',
    url: 'https://hhcdropshipping.com/',
    description: 'Premier Pakistani wholesale dropshipping portal offering fast tracked delivery across 250+ cities, instant PKR pricing, and high-margin trending winning products.'
  },
  {
    id: 'sup-1',
    name: 'Shenzhen TechGlow Wholesale Ltd.',
    platform: 'Alibaba',
    rating: 4.9,
    ordersFulfilled: 14500,
    avgShippingDays: '5-9 Days Air Freight',
    badge: 'Verified Gold Supplier',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=200',
    url: 'https://www.alibaba.com',
    description: 'Direct manufacturer of smart gadgets, USB rechargeable devices, LED work lights, and water pumps with Trade Assurance protection.'
  },
  {
    id: 'sup-2',
    name: 'AliExpress Choice Official Direct Store',
    platform: 'AliExpress',
    rating: 4.8,
    ordersFulfilled: 89000,
    avgShippingDays: '7-12 Days Choice Shipping',
    badge: 'Top Rated Brand',
    logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=200',
    url: 'https://www.aliexpress.com',
    description: 'Zero MOQ automated dropshipping provider with ePacket tracking and automated order dispatch.'
  },
  {
    id: 'sup-3',
    name: 'CJ Dropshipping Global Fulfillment Hub',
    platform: 'CJ Dropshipping',
    rating: 4.7,
    ordersFulfilled: 42000,
    avgShippingDays: '4-8 Days Air Express',
    badge: 'Custom Logo & POD',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=200',
    url: 'https://cjdropshipping.com',
    description: 'Fast global fulfillment, custom branded box packaging, quality control inspection before shipping.'
  },
  {
    id: 'sup-4',
    name: 'Guangzhou Home Master B2B Factory',
    platform: 'Made-in-China',
    rating: 4.9,
    ordersFulfilled: 28000,
    avgShippingDays: '10-15 Days Bulk Freight',
    badge: 'Verified Manufacturer',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=200',
    url: 'https://www.made-in-china.com',
    description: 'Industrial tools, heavy kitchenware, power machinery, and factory bulk quotes.'
  }
];

export const DEFAULT_DROPSHIP_PRESETS: DropshipPresetItem[] = [
  {
    id: 'ds-hhc-1',
    title: 'Electric Sonic 5-in-1 Handheld Kitchen & Bathroom Cleaning Brush',
    platform: 'HHC Dropshipping',
    supplierName: 'HHC Dropshipping Pakistan Direct Hub',
    supplierRating: 4.95,
    costUsd: 3.18,
    costPkr: 890,
    suggestedRetailPkr: 1850,
    estimatedProfitPkr: 960,
    moq: 1,
    category: 'Kitchen',
    weight: 380,
    image: 'https://images.unsplash.com/photo-1585670270608-410a56f8f537?q=80&w=800',
    shippingMethod: 'Local Pakistan Tracked Dispatch (Trax / Leopards / TCS)',
    description: 'Rechargeable cordless power scrubber with 5 brush heads. Best seller for dishwashing, gas stove grease removal, bathroom tiles, and car seats.'
  },
  {
    id: 'ds-hhc-2',
    title: 'Reusable Food-Grade Non-Stick Silicone Air Fryer Liner Pot',
    platform: 'HHC Dropshipping',
    supplierName: 'HHC Dropshipping Pakistan Direct Hub',
    supplierRating: 4.9,
    costUsd: 1.14,
    costPkr: 320,
    suggestedRetailPkr: 750,
    estimatedProfitPkr: 430,
    moq: 1,
    category: 'Kitchen',
    weight: 180,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800',
    shippingMethod: 'Local Pakistan Tracked Dispatch (Trax / Leopards / TCS)',
    description: 'Heat resistant 240°C reusable silicone basket for air fryers and microwaves. Non-stick easy wash design.'
  },
  {
    id: 'ds-1',
    title: 'Smart Solar Motion Sensor Security Lamp 100 LED',
    platform: 'Alibaba',
    supplierName: 'Shenzhen TechGlow Wholesale Ltd.',
    supplierRating: 4.9,
    costUsd: 2.30,
    costPkr: 644,
    suggestedRetailPkr: 1450,
    estimatedProfitPkr: 806,
    moq: 5,
    category: 'Home Improvement',
    weight: 320,
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800',
    shippingMethod: 'Alibaba Trade Assurance Air',
    description: 'High brightness 100 LED solar outdoor wall lamp with PIR motion detector. Waterproof IP65, solar powered.'
  },
  {
    id: 'ds-2',
    title: 'Ultra-Portable Rechargeable Mini Handheld Vacuum Cleaner',
    platform: 'AliExpress',
    supplierName: 'AliExpress Choice Official Direct Store',
    supplierRating: 4.8,
    costUsd: 3.20,
    costPkr: 896,
    suggestedRetailPkr: 1850,
    estimatedProfitPkr: 954,
    moq: 1,
    category: 'Gadgets',
    weight: 410,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800',
    shippingMethod: 'AliExpress Selection Standard',
    description: 'Wireless 9000Pa strong suction car & keyboard vacuum cleaner. USB Type-C rechargeable with dual nozzles.'
  },
  {
    id: 'ds-3',
    title: 'Wireless Smart Neck & Shoulder Kneading Massager',
    platform: 'CJ Dropshipping',
    supplierName: 'CJ Dropshipping Global Hub',
    supplierRating: 4.7,
    costUsd: 4.50,
    costPkr: 1260,
    suggestedRetailPkr: 2600,
    estimatedProfitPkr: 1340,
    moq: 1,
    category: 'Gadgets',
    weight: 480,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800',
    shippingMethod: 'CJ Packet Fast Express',
    description: '3D deep tissue neck heating therapy massager. 6 massage modes for instant muscle relaxation.'
  },
  {
    id: 'ds-4',
    title: 'Multi-angle 3D Laser Level Meter with Tripod',
    platform: 'Alibaba',
    supplierName: 'Guangzhou Home Master B2B Factory',
    supplierRating: 4.9,
    costUsd: 8.00,
    costPkr: 2240,
    suggestedRetailPkr: 4500,
    estimatedProfitPkr: 2260,
    moq: 2,
    category: 'Home Improvement',
    weight: 1100,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
    shippingMethod: 'Air Express Freight',
    description: '12-line green beam self-leveling laser tool with rechargeable battery & 360-degree rotary tripod base.'
  },
  {
    id: 'ds-5',
    title: 'Automatic USB Rechargeable Electric Wine Opener',
    platform: 'AliExpress',
    supplierName: 'AliExpress Choice Official Direct Store',
    supplierRating: 4.8,
    costUsd: 2.70,
    costPkr: 756,
    suggestedRetailPkr: 1650,
    estimatedProfitPkr: 894,
    moq: 1,
    category: 'Kitchen',
    weight: 290,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800',
    shippingMethod: 'AliExpress Choice 7-Day',
    description: 'One-touch stainless steel corkscrew set with foil cutter and LED indicator light.'
  },
  {
    id: 'ds-6',
    title: 'High Pressure Water Jet Sprinkler Nozzle Attachment',
    platform: 'DHgate',
    supplierName: 'DHgate Wholesale Direct',
    supplierRating: 4.6,
    costUsd: 1.60,
    costPkr: 448,
    suggestedRetailPkr: 1050,
    estimatedProfitPkr: 602,
    moq: 5,
    category: 'Home Improvement',
    weight: 210,
    image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=800',
    shippingMethod: 'ePacket Direct',
    description: 'Heavy duty brass hose wand power washer nozzle for car washing and garden cleaning.'
  }
];

export const DEFAULT_DROPSHIP_ORDERS: DropshipOrder[] = [
  {
    id: 'DSO-8821',
    customerName: 'Usman Ali (Lahore)',
    productName: 'Smart Solar Motion Sensor Security Lamp 100 LED',
    quantity: 2,
    customerPrice: 2900,
    supplierCostPkr: 1288,
    estimatedProfit: 1612,
    supplierName: 'Shenzhen TechGlow Wholesale Ltd.',
    platform: 'Alibaba',
    trackingNumber: 'ALB-981248012-PK',
    courier: 'DHL Air Freight',
    status: 'In Transit',
    date: '2026-08-11'
  },
  {
    id: 'DSO-8822',
    customerName: 'Fatima Tariq (Karachi)',
    productName: 'Ultra-Portable Rechargeable Mini Vacuum Cleaner',
    quantity: 1,
    customerPrice: 1850,
    supplierCostPkr: 896,
    estimatedProfit: 954,
    supplierName: 'AliExpress Choice Direct',
    platform: 'AliExpress',
    trackingNumber: 'AE-301294821-CN',
    courier: 'ePacket Express',
    status: 'Customs Clearance',
    date: '2026-08-10'
  },
  {
    id: 'DSO-8823',
    customerName: 'Kamran Sheikh (Islamabad)',
    productName: 'Wireless Smart Neck & Shoulder Kneading Massager',
    quantity: 1,
    customerPrice: 2600,
    supplierCostPkr: 1260,
    estimatedProfit: 1340,
    supplierName: 'CJ Dropshipping Global Hub',
    platform: 'CJ Dropshipping',
    trackingNumber: 'CJPK-77182902-XP',
    courier: 'CJ Packet Air',
    status: 'Delivered',
    date: '2026-08-08'
  }
];

export const DEFAULT_DROPSHIP_SETTINGS: DropshipSettings = {
  usdExchangeRate: 280,
  defaultMarkupPercent: 80,
  aliExpressAppKey: '502910482',
  aliExpressSecret: '••••••••••••••••',
  cjAccessToken: 'cj_token_live_9812049182049',
  alibabaOpenKey: 'alb_open_8820194820',
  autoFulfillOrders: true,
  notifyLowStock: true
};
