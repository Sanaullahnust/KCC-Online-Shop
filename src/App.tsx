/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Hammer, 
  Smartphone, 
  ChefHat, 
  Phone, 
  MapPin, 
  Clock, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Pause,
  Play,
  Star, 
  ArrowRight,
  Facebook,
  Instagram,
  Gift,
  CheckCircle,
  Truck,
  ShieldCheck,
  Send,
  Plus,
  Search,
  Twitter,
  MessageCircle,
  Trash2,
  Sparkles,
  Info,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  AlertTriangle,
  FileText,
  Lock,
  Eye,
  EyeOff,
  User,
  PlusCircle,
  LogOut,
  Package,
  BarChart3,
  Edit3,
  Code,
  Copy,
  Download,
  ExternalLink,
  Filter,
  Tag,
  Sliders,
  Settings,
  MessageSquare,
  Globe,
  PhoneCall,
  Save,
  Megaphone,
  Layout,
  HelpCircle,
  Inbox,
  Users,
  Shield,
  Key,
  CheckSquare,
  Square,
  Zap,
  DollarSign,
  Percent,
  Building2,
  TrendingUp,
  RefreshCw,
  Layers,
  UploadCloud
} from "lucide-react";
import { useState, useEffect, useMemo, MouseEvent, FormEvent } from "react";
import { 
  PRODUCTS, 
  DEALS, 
  TESTIMONIALS, 
  Product, 
  StoreSettings, 
  DEFAULT_STORE_SETTINGS, 
  Deal, 
  Testimonial,
  ContactSubmission,
  AdminUser,
  AdminTab,
  DEFAULT_SUPER_ADMIN,
  INITIAL_CONTACT_SUBMISSIONS,
  DropshipSupplier,
  DropshipPresetItem,
  DropshipOrder,
  DropshipSettings,
  DEFAULT_DROPSHIP_SUPPLIERS,
  DEFAULT_DROPSHIP_PRESETS,
  DEFAULT_DROPSHIP_ORDERS,
  DEFAULT_DROPSHIP_SETTINGS
} from "./types";

import { CommerceEngineBadge } from "./components/CommerceEngineBadge";
import { ProductCard } from "./components/ProductCard";
import { CheckoutModal } from "./components/CheckoutModal";
import { ShippingPolicyPage } from "./components/ShippingPolicyPage";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { ProductVariant } from "./lib/commerceApi";
import { compressAndResizeImage, formatBytes, compressDataUrl } from "./lib/imageCompressor";
import { downloadWordPressThemeZip } from "./lib/wordpressThemeGenerator";

import logoHeaderUrl from "./assets/images/regenerated_image_1779113340147.jpg";
import heroBgUrl from "./assets/images/kcc_hero_kitchen_tools_1779111645990.png";
import logoFooterUrl from "./assets/images/regenerated_image_1779113341445.jpg";

const WHATSAPP_NUMBER = "+923295147517";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`;

const StarRating = ({ rating, className = "" }: { rating: number, className?: string }) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} title={`${rating} Stars`}>
      {[...Array(5)].map((_, i) => {
        const fillPercentage = Math.max(0, Math.min(1, rating - i)) * 100;
        return (
          <div key={i} className="relative text-brand-secondary">
            <Star size={14} className="text-gray-200" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
              <Star size={14} fill="currentColor" />
            </div>
          </div>
        );
      })}
      <span className="text-xs font-bold text-brand-dark ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

const ShareButtons = ({ product, className = "" }: { product: Product, className?: string }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
  const shareText = `Check out ${product.name} (Rs.${product.price}) at KCC Wholesale Shop!`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const copyLink = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-center justify-between gap-2 flex-wrap ${className}`}>
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E] transition-all text-xs font-bold shadow-sm active:scale-95"
        title="Share this product on WhatsApp"
      >
        <MessageCircle size={14} className="fill-current stroke-none" />
        <span>Share via WhatsApp</span>
      </a>

      <div className="flex gap-1.5 items-center">
        <button 
          onClick={copyLink} 
          className="px-2.5 py-1.5 rounded-xl bg-brand-light border border-black/5 text-[10px] font-bold text-brand-dark hover:bg-black/5 transition-colors"
          title="Copy Link"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <a 
          href={facebookUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={(e) => e.stopPropagation()} 
          className="w-7 h-7 rounded-xl bg-brand-light border border-black/5 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors" 
          title="Share on Facebook"
        >
          <Facebook size={12} fill="currentColor" className="stroke-none" />
        </a>
        <a 
          href={twitterUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={(e) => e.stopPropagation()} 
          className="w-7 h-7 rounded-xl bg-brand-light border border-black/5 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors" 
          title="Share on Twitter"
        >
          <Twitter size={12} fill="currentColor" className="stroke-none" />
        </a>
      </div>
    </div>
  );
};

export default function App() {
  const getPageFromUrl = (): 'home' | 'products' | 'return-policy' | 'shipping-policy' | 'privacy-policy' | 'terms' | 'admin' => {
    try {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === 'admin' || path.includes('/admin')) return 'admin';
      if (hash === 'products' || hash === 'shop' || path.includes('/products') || path.includes('/shop')) return 'products';
      if (hash === 'return-policy' || path.includes('/return-policy') || path.includes('/refund')) return 'return-policy';
      if (hash === 'shipping-policy' || path.includes('/shipping-policy') || path.includes('/shipping')) return 'shipping-policy';
      if (hash === 'privacy-policy' || path.includes('/privacy')) return 'privacy-policy';
      if (hash === 'terms' || path.includes('/terms')) return 'terms';
    } catch (e) {
      console.error(e);
    }
    return 'home';
  };

  const [currentPage, setCurrentPageState] = useState<'home' | 'products' | 'return-policy' | 'shipping-policy' | 'privacy-policy' | 'terms' | 'admin'>(getPageFromUrl);

  const setCurrentPage = (page: 'home' | 'products' | 'return-policy' | 'shipping-policy' | 'privacy-policy' | 'terms' | 'admin') => {
    setCurrentPageState(page);
    try {
      if (window.location.hash !== `#${page}`) {
        window.history.pushState(null, '', `#${page}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const page = getPageFromUrl();
      setCurrentPageState(page);
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
  
  // Persistent Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kcc_products_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('kcc_products_v3', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Persistent Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('kcc_store_settings_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('kcc_store_settings_v1', JSON.stringify(storeSettings));
    } catch (e) {
      console.error(e);
    }
  }, [storeSettings]);

  // Persistent Deals State
  const [deals, setDeals] = useState<Deal[]>(() => {
    try {
      const saved = localStorage.getItem('kcc_deals_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('kcc_deals_v1', JSON.stringify(deals));
    } catch (e) {
      console.error(e);
    }
  }, [deals]);

  // Persistent Testimonials State
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try {
      const saved = localStorage.getItem('kcc_testimonials_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return TESTIMONIALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('kcc_testimonials_v1', JSON.stringify(testimonials));
    } catch (e) {
      console.error(e);
    }
  }, [testimonials]);

  // Persistent Contact Form Submissions State (Only Viewable by Admins)
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('kcc_contact_submissions_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CONTACT_SUBMISSIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('kcc_contact_submissions_v1', JSON.stringify(contactSubmissions));
    } catch (e) {
      console.error(e);
    }
  }, [contactSubmissions]);

  // Persistent Admin Users State for Role-Based Access Control
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('kcc_admin_users_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [DEFAULT_SUPER_ADMIN];
  });

  useEffect(() => {
    try {
      localStorage.setItem('kcc_admin_users_v1', JSON.stringify(adminUsers));
    } catch (e) {
      console.error(e);
    }
  }, [adminUsers]);

  // Active Admin User Session
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('kcc_current_admin_user_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    if (localStorage.getItem('kcc_admin_session') === 'true') {
      return DEFAULT_SUPER_ADMIN;
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentAdminUser) {
        localStorage.setItem('kcc_current_admin_user_v1', JSON.stringify(currentAdminUser));
        localStorage.setItem('kcc_admin_session', 'true');
      } else {
        localStorage.removeItem('kcc_current_admin_user_v1');
        localStorage.setItem('kcc_admin_session', 'false');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentAdminUser]);

  // Admin Panel Active Tab State & Modals
  const [adminTab, setAdminTab] = useState<AdminTab>('products');
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [contactSubmissionSearch, setContactSubmissionSearch] = useState('');
  const [contactSubmissionStatusFilter, setContactSubmissionStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');

  // WhatsApp Order & Tracking Generator State
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [newOrderCustomerName, setNewOrderCustomerName] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderSubject, setNewOrderSubject] = useState('WhatsApp Order');
  const [newOrderMessage, setNewOrderMessage] = useState('');
  const [newOrderCourier, setNewOrderCourier] = useState('TCS Express');

  const generateSimulatedTrackingNumber = (courier: string = 'TCS Express') => {
    const prefixMap: Record<string, string> = {
      'TCS Express': 'TCS',
      'Leopard Courier': 'LCS',
      'Trax Logistics': 'TRX',
      'PostEx COD': 'PEX',
      'CallCourier': 'CC',
      'M&P Courier': 'MNP'
    };
    const prefix = prefixMap[courier] || 'TRK';
    const randomNum = Math.floor(100000000 + Math.random() * 900000000);
    return `${prefix}-${randomNum}`;
  };

  // Contact Form Inputs for Visitor
  const [contactName, setContactName] = useState('');
  const [contactPhoneEmail, setContactPhoneEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccessMessage, setContactSuccessMessage] = useState(false);

  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('kcc_admin_session') === 'true';
  });
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return localStorage.getItem('kcc_admin_session') === 'true';
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.setItem('kcc_admin_session', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForGallery, setSelectedProductForGallery] = useState<Product | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hot Deals Auto Slider State
  const [activeDealIndex, setActiveDealIndex] = useState(0);
  const [dealsAutoPlay, setDealsAutoPlay] = useState(true);
  const [dealsSlideDirection, setDealsSlideDirection] = useState<'left' | 'right'>('right');

  // WordPress 404 Fix Modal State
  const [showWpFixModal, setShowWpFixModal] = useState(false);

  // Dropshipping Integration State
  const [dropshipSubTab, setDropshipSubTab] = useState<'presets' | 'extractor' | 'suppliers' | 'rfq' | 'orders' | 'settings'>('presets');
  const [dropshipSuppliers, setDropshipSuppliers] = useState<DropshipSupplier[]>(() => {
    const saved = localStorage.getItem('kcc_dropship_suppliers');
    return saved ? JSON.parse(saved) : DEFAULT_DROPSHIP_SUPPLIERS;
  });
  const [dropshipPresets, setDropshipPresets] = useState<DropshipPresetItem[]>(() => {
    const saved = localStorage.getItem('kcc_dropship_presets');
    return saved ? JSON.parse(saved) : DEFAULT_DROPSHIP_PRESETS;
  });
  const [dropshipOrders, setDropshipOrders] = useState<DropshipOrder[]>(() => {
    const saved = localStorage.getItem('kcc_dropship_orders');
    return saved ? JSON.parse(saved) : DEFAULT_DROPSHIP_ORDERS;
  });
  const [dropshipSettings, setDropshipSettings] = useState<DropshipSettings>(() => {
    const saved = localStorage.getItem('kcc_dropship_settings');
    return saved ? JSON.parse(saved) : DEFAULT_DROPSHIP_SETTINGS;
  });
  const [importedPresetIds, setImportedPresetIds] = useState<string[]>(['ds-1']);
  const [dropshipPlatformFilter, setDropshipPlatformFilter] = useState<string>('All');

  // Custom Product Extractor Form State
  const [extUrl, setExtUrl] = useState('');
  const [extTitle, setExtTitle] = useState('Smart Automatic Water Dispenser 1200mAh');
  const [extCategory, setExtCategory] = useState<'Home Improvement' | 'Gadgets' | 'Kitchen'>('Gadgets');
  const [extCostUsd, setExtCostUsd] = useState<number>(2.80);
  const [extImage, setExtImage] = useState('https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=800');
  const [extSupplier, setExtSupplier] = useState('Shenzhen Smart Home Factory');
  const [extPlatform, setExtPlatform] = useState<'Alibaba' | 'AliExpress' | 'CJ Dropshipping' | 'DHgate'>('Alibaba');
  const [extMarkupPercent, setExtMarkupPercent] = useState<number>(85);
  const [extMoq, setExtMoq] = useState<number>(1);
  const [extWeight, setExtWeight] = useState<number>(350);

  // RFQ Generator State
  const [rfqProdName, setRfqProdName] = useState('Smart Temperature Display Water Flask 500ml');
  const [rfqCategory, setRfqCategory] = useState('Kitchen');
  const [rfqQty, setRfqQty] = useState<number>(100);
  const [rfqTargetUsd, setRfqTargetUsd] = useState<number>(2.10);
  const [rfqCustomLogo, setRfqCustomLogo] = useState<boolean>(true);
  const [rfqPort, setRfqPort] = useState('Karachi / Lahore, Pakistan');

  useEffect(() => {
    localStorage.setItem('kcc_dropship_suppliers', JSON.stringify(dropshipSuppliers));
  }, [dropshipSuppliers]);

  useEffect(() => {
    localStorage.setItem('kcc_dropship_presets', JSON.stringify(dropshipPresets));
  }, [dropshipPresets]);

  useEffect(() => {
    localStorage.setItem('kcc_dropship_orders', JSON.stringify(dropshipOrders));
  }, [dropshipOrders]);

  useEffect(() => {
    localStorage.setItem('kcc_dropship_settings', JSON.stringify(dropshipSettings));
  }, [dropshipSettings]);

  const handleImportPresetToCatalog = (item: DropshipPresetItem) => {
    const existing = products.find(p => p.name.toLowerCase() === item.title.toLowerCase());
    if (existing) {
      showToast(`"${item.title}" is already in your storefront catalog!`, "info");
      return;
    }

    const newProd: Product = {
      id: `ds_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: item.title,
      description: `${item.description} (Sourced via ${item.platform} Dropshipping - Supplier: ${item.supplierName})`,
      price: item.suggestedRetailPkr,
      image: item.image,
      category: item.category,
      weight: item.weight,
      rating: item.supplierRating,
      isHot: true,
      isTopSeller: true,
      discountNote: 'Wholesale Rate'
    };

    setProducts(prev => [newProd, ...prev]);
    setImportedPresetIds(prev => [...prev, item.id]);
    showToast(`Successfully imported "${item.title}" to store catalog!`, "success");
  };

  const handleImportCustomExtractedProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!extTitle.trim()) {
      showToast("Please enter a product title", "remove");
      return;
    }
    const costInPkr = Math.round(extCostUsd * dropshipSettings.usdExchangeRate);
    const retailPrice = Math.round(costInPkr * (1 + extMarkupPercent / 100));

    const newProd: Product = {
      id: `ext_${Date.now()}`,
      name: extTitle,
      description: `Imported from ${extPlatform} (${extSupplier}). Supplier Cost: $${extCostUsd.toFixed(2)} USD. B2B Wholesale Quality.`,
      price: retailPrice,
      image: extImage || 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=800',
      category: extCategory,
      weight: extWeight,
      rating: 4.8,
      isHot: true,
      isTopSeller: true,
      discountNote: `Wholesale B2B Rate`
    };

    setProducts(prev => [newProd, ...prev]);
    showToast(`Custom product "${extTitle}" imported to storefront catalog at Rs.${retailPrice.toLocaleString()}!`, "success");
    setExtTitle('');
    setExtUrl('');
  };

  // Automatic slide transition effect for Hot Deals (4 seconds per slide)
  useEffect(() => {
    if (!dealsAutoPlay || deals.length <= 1) return;
    const interval = setInterval(() => {
      setDealsSlideDirection('right');
      setActiveDealIndex((prev) => (prev + 1) % deals.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [dealsAutoPlay, deals.length]);

  const handlePrevDeal = () => {
    if (deals.length <= 1) return;
    setDealsSlideDirection('left');
    setActiveDealIndex((prev) => (prev - 1 + deals.length) % deals.length);
  };

  const handleNextDeal = () => {
    if (deals.length <= 1) return;
    setDealsSlideDirection('right');
    setActiveDealIndex((prev) => (prev + 1) % deals.length);
  };
  const [cart, setCart] = useState<{product: Product, variant?: ProductVariant, quantity: number}[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>(Object.fromEntries(PRODUCTS.map(p => [p.id, 1])));
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Home Improvement' | 'Gadgets' | 'Kitchen'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Advanced States for improved Cart UI and interactive feedback
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'remove' } | null>(null);
  const [cartBadgePulse, setCartBadgePulse] = useState(false);
  const [lastUpdatedItemId, setLastUpdatedItemId] = useState<string | null>(null);

  // Show Toast Notification Helper
  const showToast = (message: string, type: 'success' | 'info' | 'remove') => {
    setToast({ message, type });
  };

  // Contact Form Submission Handler
  const handleContactFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhoneEmail.trim() || !contactMessage.trim()) {
      showToast("Please fill in your name, phone/email, and message.", "remove");
      return;
    }

    const newSubmission: ContactSubmission = {
      id: `msg_${Date.now()}`,
      name: contactName.trim(),
      emailOrPhone: contactPhoneEmail.trim(),
      subject: contactSubject.trim() || 'General Store Inquiry',
      message: contactMessage.trim(),
      createdAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'unread'
    };

    setContactSubmissions(prev => [newSubmission, ...prev]);
    setContactName('');
    setContactPhoneEmail('');
    setContactSubject('');
    setContactMessage('');
    setContactSuccessMessage(true);
    showToast("Your message has been saved & sent to Store Admin!", "success");
    setTimeout(() => setContactSuccessMessage(false), 7000);
  };

  // Admin Login Handler with Multi-Admin Support
  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    const inputUser = adminUsernameInput.trim().toLowerCase();
    const inputPass = adminPasswordInput.trim();

    let matchedUser = adminUsers.find(
      u => u.username.toLowerCase() === inputUser && u.password === inputPass
    );

    // Fallback for default superadmin if not found in array
    if (!matchedUser && inputUser === DEFAULT_SUPER_ADMIN.username.toLowerCase() && inputPass === DEFAULT_SUPER_ADMIN.password) {
      matchedUser = DEFAULT_SUPER_ADMIN;
    }

    if (matchedUser) {
      setCurrentAdminUser(matchedUser);
      setIsAdminLoggedIn(true);
      setIsAdminMode(true);
      setShowLoginModal(false);
      setAdminUsernameInput('');
      setAdminPasswordInput('');
      setLoginError(null);

      if (!matchedUser.allowedTabs.includes(adminTab)) {
        setAdminTab(matchedUser.allowedTabs[0] || 'products');
      }

      showToast(`Welcome back, ${matchedUser.name}! (${matchedUser.role === 'superadmin' ? 'Superadmin' : 'Sub-Admin'})`, "success");
      setCurrentPage('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoginError("Invalid username or password. Please try again.");
    }
  };

  const handleAdminLogout = () => {
    setCurrentAdminUser(null);
    setIsAdminLoggedIn(false);
    setIsAdminMode(false);
    showToast("Admin session ended.", "info");
    if (currentPage === 'admin') {
      setCurrentPage('home');
    }
  };

  const handleToggleTopSeller = (productId: string) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const updated = !p.isTopSeller;
        showToast(updated ? `Marked "${p.name}" as Top Seller` : `Removed "${p.name}" from Top Sellers`, "info");
        return { ...p, isTopSeller: updated };
      }
      return p;
    }));
  };

  const activeWhatsappNumber = storeSettings.whatsappNumber || "923001234567";
  const activeWhatsappLink = `https://wa.me/${activeWhatsappNumber.replace(/[^0-9]/g, '')}`;

  const handleSaveStoreSettings = (e: FormEvent) => {
    e.preventDefault();
    showToast("Store settings & content updated successfully!", "success");
  };

  const handleSaveDeal = (e: FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;
    const exists = deals.some(d => d.id === editingDeal.id);
    if (exists) {
      setDeals(deals.map(d => d.id === editingDeal.id ? editingDeal : d));
      showToast(`Updated deal "${editingDeal.title}"`, "success");
    } else {
      setDeals([editingDeal, ...deals]);
      showToast(`Created new deal "${editingDeal.title}"`, "success");
    }
    setEditingDeal(null);
  };

  const handleDeleteDeal = (dealId: string) => {
    if (window.confirm("Are you sure you want to delete this deal offer?")) {
      setDeals(deals.filter(d => d.id !== dealId));
      showToast("Deal offer removed.", "remove");
    }
  };

  const handleSaveTestimonial = (e: FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    const exists = testimonials.some(t => t.id === editingTestimonial.id);
    if (exists) {
      setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial : t));
      showToast(`Updated review by "${editingTestimonial.name}"`, "success");
    } else {
      setTestimonials([editingTestimonial, ...testimonials]);
      showToast(`Added new review by "${editingTestimonial.name}"`, "success");
    }
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer review?")) {
      setTestimonials(testimonials.filter(t => t.id !== id));
      showToast("Review deleted.", "remove");
    }
  };

  const handleResetAllWebsiteContent = () => {
    if (window.confirm("Are you sure you want to reset ALL website content (products, store info, hero banner, deals, reviews, policy texts) back to default settings?")) {
      setProducts(PRODUCTS);
      setStoreSettings(DEFAULT_STORE_SETTINGS);
      setDeals(DEALS);
      setTestimonials(TESTIMONIALS);
      try {
        localStorage.removeItem('kcc_products_v3');
        localStorage.removeItem('kcc_store_settings_v1');
        localStorage.removeItem('kcc_deals_v1');
        localStorage.removeItem('kcc_testimonials_v1');
      } catch (e) {
        console.error(e);
      }
      showToast("All website content reset to default settings.", "success");
    }
  };

  const handleResetCatalog = () => {
    if (window.confirm("Are you sure you want to reset all products back to the store default catalog?")) {
      setProducts(PRODUCTS);
      try {
        localStorage.removeItem('kcc_products_v3');
      } catch (e) {
        console.error(e);
      }
      showToast("Store catalog reset to default products.", "success");
    }
  };

  const handleAddNewProductClick = () => {
    if (!isAdminLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: '',
      description: '',
      price: 1000,
      category: 'Gadgets',
      weight: 250,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800',
      images: [],
      discountNote: 'Wholesale Special',
      isTopSeller: false,
      isHot: false
    };
    setEditingProduct(newProduct);
  };

  const handleDeleteProduct = (productId: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdminLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const targetProduct = products.find(p => p.id === productId);
    if (window.confirm(`Are you sure you want to delete "${targetProduct?.name || 'this product'}"?`)) {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      showToast("Product removed from catalog.", "remove");
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-open product gallery if shared link includes ?product=ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    if (productId) {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setSelectedProductForGallery(foundProduct);
      }
    }
  }, [products]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Cart Badge Pulse Animation Trigger
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  useEffect(() => {
    if (cartItemCount > 0) {
      setCartBadgePulse(true);
      const timer = setTimeout(() => setCartBadgePulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  // Clear quantity update highlight
  useEffect(() => {
    if (lastUpdatedItemId) {
      const timer = setTimeout(() => setLastUpdatedItemId(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [lastUpdatedItemId]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  const [flyingItems, setFlyingItems] = useState<{ id: string, image: string, startX: number, startY: number }[]>([]);

  const addToCart = (product: Product, quantity: number, event?: MouseEvent, variant?: ProductVariant) => {
    setCart(prev => {
      const variantKey = variant ? `${product.id}_${variant.id}` : product.id;
      const existingIndex = prev.findIndex(item => {
        const itemKey = item.variant ? `${item.product.id}_${item.variant.id}` : item.product.id;
        return itemKey === variantKey;
      });

      if (existingIndex > -1) {
        return prev.map((item, idx) => 
          idx === existingIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, variant, quantity }];
    });
    setLastUpdatedItemId(product.id);
    const vMsg = variant ? ` (${variant.name})` : '';
    showToast(`Added ${quantity}x "${product.name}"${vMsg} to cart!`, 'success');

    if (event) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const id = Date.now().toString() + Math.random();
      const newFlyingItem = {
        id,
        image: product.image,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2
      };
      setFlyingItems(prev => [...prev, newFlyingItem]);
      setTimeout(() => {
        setFlyingItems(prev => prev.filter(item => item.id !== id));
      }, 800);
    }
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty !== item.quantity) {
          setLastUpdatedItemId(productId);
          const msg = delta > 0 ? `Increased "${item.product.name}" quantity` : `Decreased "${item.product.name}" quantity`;
          showToast(msg, 'info');
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = cart.find(item => item.product.id === productId);
    if (itemToRemove) {
      showToast(`Removed "${itemToRemove.product.name}" from cart`, 'remove');
    }
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Delivery breakdown and dynamic computations
  const cartTotalWeight = cart.reduce((acc, item) => acc + ((item.product.weight || 0) * item.quantity), 0);
  
  const deliveryCharge = useMemo(() => {
    if (cart.length === 0 || shippingMethod === 'pickup') return 0;
    if (cartTotalWeight <= 500) return 250;
    if (cartTotalWeight <= 1000) return 400;
    // Above 1000g, dynamic stepping: base 400 for first 1kg, plus Rs. 150 per extra 500g (or portion thereof)
    return 400 + Math.ceil((cartTotalWeight - 1000) / 500) * 150;
  }, [cart, cartTotalWeight, shippingMethod]);

  const cartGrandTotal = cartTotal + deliveryCharge;

  const getProductIdFromUrl = (): string | null => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#product/')) return hash.replace('#product/', '');
      if (hash.startsWith('#product-')) return hash.replace('#product-', '');
      if (hash.startsWith('#p/')) return hash.replace('#p/', '');

      const params = new URLSearchParams(window.location.search);
      const prodParam = params.get('product') || params.get('p');
      if (prodParam) return prodParam;
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductDetails(product);
    try {
      const targetHash = `#product/${product.id}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseProductDetails = () => {
    setSelectedProductDetails(null);
    try {
      if (window.location.hash.includes('product')) {
        const fallbackHash = currentPage === 'products' ? '#products' : '#home';
        window.history.pushState(null, '', fallbackHash);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const syncProductFromUrl = () => {
      const prodId = getProductIdFromUrl();
      if (prodId) {
        const found = products.find(p => p.id === prodId || String(p.id) === String(prodId));
        if (found) {
          setSelectedProductDetails(found);
          return;
        }
      }
      setSelectedProductDetails(null);
    };

    syncProductFromUrl();

    const handleLocationChange = () => {
      const page = getPageFromUrl();
      setCurrentPageState(page);
      syncProductFromUrl();
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [products]);

  const openGallery = (product: Product, index: number = 0) => {
    handleSelectProduct(product);
    setCurrentImageIndex(index);
  };

  const getProductMedia = (product: Product | null) => {
    if (!product) return [];
    let items: { type: 'image' | 'video', url: string }[] = [];
    if (product.images && product.images.length > 0) {
      items = product.images.map(img => ({ type: 'image', url: img }));
    } else {
      items = [{ type: 'image', url: product.image }];
    }
    if (product.video) {
        items.push({ type: 'video', url: product.video });
    }
    return items;
  };

  const nextImage = () => {
    if (!selectedProductForGallery) return;
    const media = getProductMedia(selectedProductForGallery);
    setCurrentImageIndex((currentImageIndex + 1) % media.length);
  };

  const prevImage = () => {
    if (!selectedProductForGallery) return;
    const media = getProductMedia(selectedProductForGallery);
    setCurrentImageIndex((currentImageIndex - 1 + media.length) % media.length);
  };

  const generateCartOrderLink = () => {
    let text = `Hi KCC! I want to place an order:\n\n`;
    cart.forEach(item => {
      text += `• ${item.quantity}x ${item.product.name} (Rs.${item.product.price}) = Rs.${item.product.price * item.quantity}\n`;
    });
    text += `\n-----------------------------\n`;
    text += `Subtotal: Rs.${cartTotal}\n`;
    text += `Total Weight: ${cartTotalWeight >= 1000 ? `${(cartTotalWeight / 1000).toFixed(2)} kg` : `${cartTotalWeight} g`}\n`;
    
    if (shippingMethod === 'delivery') {
      text += `Postage/Delivery: Rs.${deliveryCharge}\n`;
      text += `Grand Total: Rs.${cartGrandTotal}\n`;
      text += `Delivery Option: Home Delivery\n`;
    } else {
      text += `Postage/Delivery: Rs.0 (Self Pickup)\n`;
      text += `Grand Total: Rs.${cartTotal}\n`;
      text += `Delivery Option: Self Pickup (at Store Address)\n`;
    }
    
    text += `Store: KCC Wholesale Shop`;
    return `${activeWhatsappLink}?text=${encodeURIComponent(text)}`;
  };

  const generateOrderLink = (item: string, price: number, quantity: number = 1) => {
    const text = `Hi KCC! I want to order ${quantity}x ${item} - Total: Rs.${price * quantity}`;
    return `${activeWhatsappLink}?text=${encodeURIComponent(text)}`;
  };

  const navLinks = [
    { name: "Home", action: () => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { name: "Products", action: () => { setCurrentPage('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { name: "Deals", href: "#deals" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Info Bar */}
      <div className="bg-brand-dark text-white py-2 px-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] flex justify-center items-center gap-3 z-[60]">
        <span className="text-center">{storeSettings.topBarText}</span>
      </div>
      {/* Sticky Navbar */}
      <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white md:bg-transparent py-4'}`}>
        <div className="container-custom flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="h-12 w-12 overflow-hidden rounded-xl bg-white shadow-sm border border-black/5 p-1">
              <img 
                src={logoHeaderUrl} 
                alt="KCC Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-xl tracking-tight text-brand-dark">KCC <span className="text-brand-primary text-xs block -mt-1 uppercase tracking-widest font-black opacity-80">Online Shop</span></span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                className="font-medium text-brand-dark hover:text-brand-primary transition-colors"
                onClick={() => {
                  if (link.action) link.action();
                  if (link.href) {
                    setCurrentPage('home');
                    setTimeout(() => document.getElementById(link.href?.replace('#', '') || '')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }
                }}
              >
                {link.name}
              </button>
            ))}
            <motion.button 
              onClick={() => setIsCartOpen(true)}
              animate={cartBadgePulse ? { scale: [1, 1.3, 0.9, 1.15, 1], rotate: [0, -10, 10, -5, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="relative p-2 text-brand-dark hover:text-brand-primary transition-colors focus:outline-none"
            >
              <ShoppingBag size={24} />
              {cartItemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>
            <a 
              href={WHATSAPP_LINK}
              className="btn-primary py-2 px-6 text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Order via WhatsApp
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <motion.button 
              onClick={() => setIsCartOpen(true)}
              animate={cartBadgePulse ? { scale: [1, 1.3, 0.9, 1.15, 1], rotate: [0, -10, 10, -5, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="relative p-2 text-brand-dark hover:text-brand-primary transition-colors focus:outline-none"
            >
              <ShoppingBag size={24} />
              {cartItemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>
            <button className="text-brand-dark" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button 
                    key={link.name} 
                    className="text-left font-medium text-lg py-2"
                    onClick={() => {
                      if (link.action) link.action();
                      setIsMenuOpen(false);
                      if (link.href) {
                        setCurrentPage('home');
                        setTimeout(() => document.getElementById(link.href?.replace('#', '') || '')?.scrollIntoView({ behavior: 'smooth' }), 100);
                      }
                    }}
                  >
                    {link.name}
                  </button>
                ))}
                <a href={WHATSAPP_LINK} className="btn-primary justify-center">WhatsApp Now</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow">
        {currentPage === 'home' ? (
          <>
            {/* Hero Section */}
            <section className="relative h-[80vh] md:h-[90vh] flex items-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  src={storeSettings.heroBgImage || heroBgUrl} 
                  alt="KCC Hero" 
                  className="w-full h-full object-cover brightness-50"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="container-custom relative z-10 text-white">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-3xl"
                >
                  <div className="inline-flex items-center gap-2 bg-brand-secondary text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-md">
                    <Sparkles size={14} /> {storeSettings.heroBadgeText}
                  </div>
                  <h1 className="text-4xl md:text-7xl font-display font-extrabold leading-tight mb-6">
                    {storeSettings.heroHeadline}
                  </h1>
                  <p className="text-xl md:text-2xl font-light mb-10 opacity-90 leading-relaxed">
                    {storeSettings.heroSubheading}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setCurrentPage('products')}
                      className="btn-secondary h-14 justify-center text-lg shadow-lg group"
                    >
                      Shop Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a 
                      href={activeWhatsappLink}
                      className="btn-primary h-14 justify-center text-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chat with Us
                    </a>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Why Choose Us */}
            <section id="about" className="section-padding bg-brand-light">
              <div className="container-custom text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Store Policies & Features</h2>
                <div className="w-24 h-1 bg-brand-primary mx-auto"></div>
                <p className="mt-6 text-brand-gray max-w-2xl mx-auto">All our products are offered at <strong>Wholesale Prices</strong> and can be physically collected from our branches.</p>
              </div>
              <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { icon: <Gift className="text-brand-primary" />, title: "Wholesale Prices", desc: "Get market-leading wholesale rates on single items and bulk orders." },
                  { icon: <ShieldCheck className="text-brand-primary" />, title: "Multiple Pickup Locations", desc: "Collect physically from KCC site or Kaka Khel Super Store Madni Market G-11/3 Islamabad." },
                  { icon: <Truck className="text-brand-primary" />, title: "Home Delivery", desc: "Standardized weight-based delivery charges for convenience." },
                  { icon: <CheckCircle className="text-brand-primary" />, title: "Trusted All Over Pakistan", desc: "Serving customers throughout Pakistan with pride." }
                ].map((item, id) => (
                  <motion.div 
                    key={id}
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 text-center"
                  >
                    <div className="bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-brand-gray text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Top Sellers */}
            <section className="section-padding overflow-hidden">
              <div className="container-custom flex justify-between items-end mb-12">
                <div>
                  <span className="text-brand-primary font-bold tracking-widest uppercase text-sm">Most Wanted</span>
                  <h2 className="text-3xl md:text-5xl font-display font-bold">Top Sellers</h2>
                </div>
                <button 
                  onClick={() => setCurrentPage('products')}
                  className="hidden md:flex items-center gap-2 text-brand-primary font-semibold hover:underline"
                >
                  View All Products <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="container-custom grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.filter(p => p.isTopSeller).map((product) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="group relative bg-white rounded-3xl overflow-hidden border border-black/5 shadow-lg flex flex-col"
                  >
                    {(isAdminLoggedIn || isAdminMode) && (
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }} 
                          className="bg-brand-primary text-white px-2.5 py-1.5 rounded-lg shadow-md text-[10px] font-bold uppercase tracking-wider hover:bg-brand-secondary transition-colors flex items-center gap-1"
                        >
                          <Edit3 size={10} /> Edit
                        </button>
                        <button 
                          onClick={(e) => handleDeleteProduct(product.id, e)} 
                          className="bg-red-600 text-white p-1.5 rounded-lg shadow-md text-[10px] hover:bg-red-700 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                    <div className="relative aspect-square overflow-hidden bg-brand-light cursor-zoom-in" onClick={() => openGallery(product)}>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                        <StarRating rating={product.rating} />
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold mb-2 cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSelectProduct(product)}>{product.name}</h3>
                      {product.discountNote && (
                        <div className="mb-2">
                          <span className="inline-block bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-brand-secondary/20">
                            {product.discountNote}
                          </span>
                        </div>
                      )}
                      <p className="text-brand-gray text-sm mb-4 line-clamp-2 italic">“Best for home – durable & reliable”</p>
                      <div className="mb-4 mt-auto">
                        <ShareButtons product={product} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-display font-extrabold text-brand-primary">Rs.{product.price}</span>
                        <button 
                          onClick={(e) => addToCart(product, 1, e)}
                          className="bg-brand-primary text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md transform active:scale-95 text-sm font-bold tracking-wide uppercase flex items-center gap-2"
                          title="Shop Now"
                        >
                          Shop Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Hot Deals */}
            <section id="deals" className="section-padding bg-brand-dark text-white overflow-hidden relative">
              <div className="container-custom mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles size={14} /> Limited Time Offers
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-3">
                    Hot Deals & <span className="text-brand-secondary">Bundles</span>
                  </h2>
                  <p className="text-brand-gray max-w-2xl text-sm md:text-base">
                    Exclusive wholesale bundles automatically updated! Grab these offers before stock runs out.
                  </p>
                </div>

                {deals.length > 1 && (
                  <div className="flex items-center gap-3">
                    {/* Pause / Play Auto-slide Toggle */}
                    <button
                      onClick={() => setDealsAutoPlay(!dealsAutoPlay)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        dealsAutoPlay
                          ? 'bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                      title={dealsAutoPlay ? "Pause Auto-sliding" : "Start Auto-sliding"}
                    >
                      {dealsAutoPlay ? (
                        <>
                          <Pause size={14} /> <span className="hidden sm:inline">Auto-slide On</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} /> <span className="hidden sm:inline">Paused</span>
                        </>
                      )}
                    </button>

                    {/* Prev / Next buttons */}
                    <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={handlePrevDeal}
                        className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer active:scale-95"
                        title="Previous Deal"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-xs font-mono font-bold px-2 text-brand-gray">
                        {String(activeDealIndex + 1).padStart(2, '0')} / {String(deals.length).padStart(2, '0')}
                      </span>
                      <button
                        onClick={handleNextDeal}
                        className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer active:scale-95"
                        title="Next Deal"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Slider Viewport Container */}
              <div 
                className="container-custom relative"
                onMouseEnter={() => setDealsAutoPlay(false)}
                onMouseLeave={() => setDealsAutoPlay(true)}
              >
                {/* Auto-play Timer Progress Bar */}
                {deals.length > 1 && dealsAutoPlay && (
                  <div className="w-full bg-white/10 h-1 rounded-full mb-6 overflow-hidden">
                    <motion.div
                      key={activeDealIndex}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4, ease: "linear" }}
                      className="bg-brand-secondary h-full rounded-full"
                    />
                  </div>
                )}

                {deals.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-800/50 rounded-[2rem] border border-white/5">
                    <Sparkles size={40} className="mx-auto text-brand-secondary/60 mb-3" />
                    <p className="text-brand-gray font-medium">No active deals right now. Check back soon!</p>
                  </div>
                ) : (
                  <div className="overflow-hidden py-2">
                    <AnimatePresence mode="wait" custom={dealsSlideDirection}>
                      <motion.div
                        key={activeDealIndex}
                        custom={dealsSlideDirection}
                        initial={{ opacity: 0, x: dealsSlideDirection === 'right' ? 60 : -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: dealsSlideDirection === 'right' ? -60 : 60 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        {[
                          deals[activeDealIndex % deals.length],
                          ...(deals.length > 1 ? [deals[(activeDealIndex + 1) % deals.length]] : [])
                        ].filter(Boolean).map((deal) => (
                          <motion.div 
                            key={deal.id}
                            whileHover={{ scale: 1.02 }}
                            className="relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col justify-between group"
                          >
                            <div className="absolute -top-4 -right-10 transform rotate-12 bg-brand-secondary px-12 py-3 font-bold text-white shadow-xl text-sm tracking-wider uppercase">
                              {deal.discount}
                            </div>
                            <div>
                              <div className="inline-block px-3 py-1 rounded-full bg-white/5 text-brand-secondary text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10">
                                Verified Wholesale Bundle
                              </div>
                              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 group-hover:text-brand-secondary transition-colors">{deal.title}</h3>
                              <p className="text-brand-gray mb-8 text-base md:text-lg leading-relaxed">{deal.desc}</p>
                            </div>
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-brand-gray tracking-wider">Bundle Price</span>
                                <div className="text-2xl md:text-3xl font-display font-extrabold text-brand-secondary">{deal.price}</div>
                              </div>
                              <a 
                                href={`${activeWhatsappLink}?text=${encodeURIComponent(`Hi KCC! I want to grab the ${deal.title} deal - ${deal.price}`)}`}
                                className="btn-secondary px-8 md:px-10 shadow-orange-500/20 shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span>Grab Deal</span>
                                <ChevronRight size={16} />
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                {/* Pagination Dots */}
                {deals.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {deals.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDealsSlideDirection(idx > activeDealIndex ? 'right' : 'left');
                          setActiveDealIndex(idx);
                        }}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          idx === activeDealIndex
                            ? 'w-8 h-2.5 bg-brand-secondary shadow-lg shadow-brand-secondary/30'
                            : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/50'
                        }`}
                        title={`Go to deal slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Shipping Info Section */}
            <section className="section-padding bg-white">
              <div className="container-custom">
                <div className="bg-brand-primary/5 rounded-[3rem] p-10 md:p-16 border border-brand-primary/10">
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-grow">
                      <div className="bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full inline-block mb-6">
                        Shipping Rates
                      </div>
                      <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-brand-dark">Fair & Transparent <span className="text-brand-primary">Delivery</span></h2>
                      <p className="text-lg text-brand-gray mb-8">We offer fast delivery across Pakistan. Charges are based on the total weight of your package to keep it affordable for you.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                          <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-2">Up to 500 Grams</p>
                          <p className="text-2xl font-display font-black text-brand-primary">Rs. {storeSettings.deliveryFee500g} <span className="text-xs text-brand-gray font-normal">Charges</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                          <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-2">Up to 1000 Grams (1kg)</p>
                          <p className="text-2xl font-display font-black text-brand-primary">Rs. {storeSettings.deliveryFee1kg} <span className="text-xs text-brand-gray font-normal">Charges</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-1/3 flex justify-center">
                      <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center bg-brand-primary rounded-full shadow-2xl">
                         <Truck className="text-white w-24 h-24 md:w-32 md:h-32" />
                         <div className="absolute -bottom-4 bg-brand-secondary text-white px-6 py-2 rounded-full font-bold shadow-lg">Fast Delivery</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="section-padding">
              <div className="container-custom text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Customer Stories</h2>
              </div>
              <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonials.map((t) => (
                    <div key={t.id} className="bg-brand-light p-8 rounded-3xl relative">
                      <div className="flex text-brand-secondary mb-4 gap-1">
                        {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                      </div>
                      <p className="text-lg italic text-brand-dark mb-6">"{t.review}"</p>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-brand-primary">{t.name}</h4>
                        {t.location && <span className="text-xs font-medium text-brand-gray">{t.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Gallery Section */}
            <section className="section-padding bg-white">
              <div className="container-custom mb-12 flex justify-between items-center">
                <h2 className="text-3xl md:text-5xl font-display font-bold">Product Gallery</h2>
              </div>
              <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.slice(0, 8).map((p, idx) => (
                  <motion.div 
                    key={p.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => openGallery(p)}
                    className="aspect-square bg-brand-light rounded-2xl overflow-hidden cursor-pointer shadow-sm group"
                  >
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover brightness-95 group-hover:brightness-100 transition-all"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Bulk Orders */}
            <section className="section-padding bg-brand-primary text-white">
              <div className="container-custom text-center">
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Bulk Orders & Contractor Supplies</h2>
                <p className="text-xl opacity-90 max-w-3xl mx-auto mb-10 leading-relaxed">
                  Working on a construction or renovation project? We provide special pricing for bulk orders of power tools, home fixtures, and electrical gadgets.
                </p>
                <a 
                  href={`${WHATSAPP_LINK}?text=${encodeURIComponent("Hi KCC! I want to inquire about bulk orders for a project.")}`}
                  className="bg-white text-brand-primary px-12 py-4 rounded-full font-bold text-xl hover:bg-brand-light transition-colors shadow-xl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get A Quote
                </a>
              </div>
            </section>

            {/* Map & Contact Form */}
            <section id="contact" className="section-padding bg-brand-light/30">
              <div className="container-custom grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Contact Info */}
                <div className="lg:col-span-5">
                  <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-8">Get In <span className="text-brand-primary">Touch</span></h2>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-brand-primary/10 p-3 rounded-xl shrink-0"><MapPin className="text-brand-primary" /></div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">Our Store Locations</h4>
                        <p className="text-sm text-brand-gray leading-relaxed">
                          Main Branch: KCC Wholesale Shop, Jail Chowk, Karak<br/>
                          Islamabad Branch: Kaka Khel Super Store, Madni Market G-11/3, Islamabad
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-brand-primary/10 p-3 rounded-xl shrink-0"><Phone className="text-brand-primary" /></div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">Call / WhatsApp</h4>
                        <a href={`tel:${WHATSAPP_NUMBER}`} className="text-sm font-semibold text-brand-gray hover:text-brand-primary">+92 329 5147517</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-brand-primary/10 p-3 rounded-xl shrink-0"><Clock className="text-brand-primary" /></div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">Store Working Hours</h4>
                        <p className="text-sm text-brand-gray">Monday – Sunday: 10 AM – 10 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-black/10 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-brand-dark mb-1">Need Immediate Assistance?</h5>
                      <p className="text-xs text-brand-gray">Chat directly with KCC Wholesale Support team.</p>
                    </div>
                    <a 
                      href={`${WHATSAPP_LINK}?text=${encodeURIComponent("Hi KCC! I have an inquiry about products.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-emerald-700 transition-colors shrink-0"
                    >
                      <MessageCircle size={16} /> WhatsApp Support
                    </a>
                  </div>
                </div>

                {/* Direct Contact Form */}
                <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-black/5 relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                      <Send size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-display text-brand-dark">Send Us a Direct Message</h3>
                      <p className="text-xs text-brand-gray font-medium">Messages are saved securely & forwarded directly to KCC Store Admin.</p>
                    </div>
                  </div>

                  {contactSuccessMessage ? (
                    <div className="p-8 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center space-y-3">
                      <CheckCircle className="mx-auto text-emerald-600" size={42} />
                      <h4 className="font-bold text-xl">Message Sent Successfully!</h4>
                      <p className="text-xs max-w-md mx-auto leading-relaxed">
                        Thank you! Your contact submission has been saved directly inside the KCC Store Admin Panel. Our manager will review your query and contact you shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactFormSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Your Full Name *</label>
                          <input 
                            type="text" 
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="e.g. Usman Farooq"
                            className="w-full bg-brand-light border border-black/10 rounded-xl p-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Mobile No / Email *</label>
                          <input 
                            type="text" 
                            value={contactPhoneEmail}
                            onChange={(e) => setContactPhoneEmail(e.target.value)}
                            placeholder="e.g. 0300-1234567 or email"
                            className="w-full bg-brand-light border border-black/10 rounded-xl p-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Subject / Inquiry Title</label>
                        <input 
                          type="text" 
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="e.g. Wholesale price quote or stock availability"
                          className="w-full bg-brand-light border border-black/10 rounded-xl p-3.5 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Your Message *</label>
                        <textarea 
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Write your detailed inquiry here..."
                          className="w-full bg-brand-light border border-black/10 rounded-xl p-3.5 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                          required
                        />
                      </div>

                      <button 
                        type="submit"
                        className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-wider justify-center shadow-lg shadow-brand-primary/20"
                      >
                        <Send size={16} /> Submit Message to Admin
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>

            {/* Newsletter */}
            <section className="py-20 bg-brand-light">
              <div className="container-custom max-w-4xl bg-white p-12 md:p-20 rounded-[3rem] shadow-xl text-center border-t-8 border-brand-primary">
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Never Miss a Deal!</h2>
                <p className="text-brand-gray mb-10 text-lg">Sign up for our newsletter to receive the latest gadget arrivals and exclusive tool discounts.</p>
                <form className="flex flex-col md:row gap-4 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
                  <div className="flex-grow flex bg-brand-light p-2 rounded-2xl border border-black/5 items-center">
                    <Send className="mx-4 text-brand-gray" size={20} />
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="bg-transparent border-none outline-none flex-grow p-2"
                    />
                  </div>
                  <button className="btn-primary h-14 justify-center">Subscribe Now</button>
                </form>
              </div>
            </section>
          </>
        ) : currentPage === 'products' ? (
          /* Products Page */
          <div className="section-padding min-h-screen">
            <div className="container-custom mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-6xl font-display font-extrabold mb-2">Our <span className="text-brand-primary">Store Items</span></h1>
                <p className="text-brand-gray text-sm md:text-base font-medium">Browse wholesale prices on tools, gadgets, and kitchen essentials.</p>
              </div>

              {(isAdminLoggedIn || isAdminMode) && (
                <button 
                  onClick={handleAddNewProductClick}
                  className="btn-primary py-3.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all"
                >
                  <PlusCircle size={18} />
                  <span>+ Upload Product</span>
                </button>
              )}
            </div>

            <div className="container-custom mb-12">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search for products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-light border border-black/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-dark"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {['All', 'Home Improvement', 'Gadgets', 'Kitchen'].map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat as any)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm text-sm ${selectedCategory === cat ? 'bg-brand-primary text-white scale-105' : 'bg-white text-brand-gray hover:bg-brand-light'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="container-custom grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onQuickBuy={(p, v) => {
                    addToCart(p, 1, undefined, v);
                    setIsCartOpen(true);
                  }}
                  onOpenGallery={openGallery}
                  onDeleteProduct={handleDeleteProduct}
                  isAdminLoggedIn={isAdminLoggedIn || isAdminMode}
                />
              )) : (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-brand-light w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-brand-gray" size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No products found</h3>
                  <p className="text-brand-gray">Try adjusting your search or category filters.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                    className="mt-6 text-brand-primary font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : currentPage === 'admin' ? (
          /* Full Content Admin Panel */
          <div className="section-padding min-h-screen bg-brand-light/40">
            <div className="container-custom">
              {/* Admin Header Banner */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-black/5 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                      <User size={16} /> Authenticated Admin Workspace
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display font-black text-brand-dark mb-2">
                      KCC Store Content Admin Panel
                    </h1>
                    <p className="text-brand-gray text-sm md:text-base font-medium max-w-xl">
                      Full control over every aspect of your store: products, contact numbers, banner headline, hot deals, customer reviews, and legal policies.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => { setCurrentPage('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="px-5 py-3.5 bg-brand-light hover:bg-gray-200 text-brand-dark border border-black/10 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                    >
                      <Package size={16} />
                      <span>View Storefront</span>
                    </button>
                    <button 
                      onClick={handleResetAllWebsiteContent}
                      className="px-5 py-3.5 bg-white hover:bg-gray-100 text-brand-dark border border-black/10 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                      title="Reset all store content to factory defaults"
                    >
                      <RotateCcw size={16} />
                      <span>Reset All Content</span>
                    </button>
                    <button 
                      onClick={handleAdminLogout}
                      className="px-5 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Navigation Tabs */}
              <div className="flex flex-wrap gap-2 mb-8 bg-white p-3 rounded-2xl border border-black/5 shadow-md">
                {[
                  { id: 'products', label: '📦 Products Catalog', count: products.length },
                  { id: 'contact-messages', label: '📩 Contact Messages', count: contactSubmissions.filter(s => s.status === 'unread').length },
                  { id: 'store-info', label: '⚙️ Store Info & Shipping' },
                  { id: 'hero', label: '🎨 Hero Banner' },
                  { id: 'deals', label: '🏷️ Hot Deals', count: deals.length },
                  { id: 'testimonials', label: '💬 Customer Reviews', count: testimonials.length },
                  { id: 'policies', label: '📜 Policy Pages' },
                  { id: 'user-management', label: '👥 Admin Users & Rights', count: adminUsers.length },
                  { id: 'dropshipping', label: '🌐 B2B Dropshipping Hub', count: dropshipPresets.length },
                  { id: 'wordpress', label: '🌐 WP Theme (.ZIP) & Integration' },
                ]
                .filter(tab => !currentAdminUser || currentAdminUser.role === 'superadmin' || currentAdminUser.allowedTabs.includes(tab.id as AdminTab))
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                      adminTab === tab.id
                        ? 'bg-brand-primary text-white shadow-md scale-105'
                        : 'bg-brand-light/60 text-brand-gray hover:bg-brand-light hover:text-brand-dark'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        tab.id === 'contact-messages' && tab.count > 0 
                          ? 'bg-red-500 text-white font-black animate-pulse' 
                          : adminTab === tab.id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-black/10 text-brand-dark'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* TAB 1: Products Catalog */}
              {adminTab === 'products' && (
                <div className="space-y-8">
                  {/* Overview Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                        <Package size={28} />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-gray block">Total Products</span>
                        <span className="text-3xl font-display font-black text-brand-dark">{products.length}</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Tag size={28} />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-gray block">Categories</span>
                        <span className="text-3xl font-display font-black text-brand-dark">
                          {new Set(products.map(p => p.category)).size}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Star size={28} />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-gray block">Top Sellers</span>
                        <span className="text-3xl font-display font-black text-brand-dark">
                          {products.filter(p => p.isTopSeller).length}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                        <BarChart3 size={28} />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-gray block">Store Value</span>
                        <span className="text-2xl font-display font-black text-brand-dark">
                          Rs.{products.reduce((acc, p) => acc + p.price, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Products Management List */}
                  <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-6">
                      <div>
                        <h2 className="text-2xl font-display font-bold text-brand-dark">Product Catalog</h2>
                        <p className="text-xs text-brand-gray mt-1">Manage your store inventory, edit prices, upload photos/videos, or mark items as Top Sellers.</p>
                      </div>

                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" size={16} />
                          <input 
                            type="text" 
                            placeholder="Search catalog..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-brand-light border border-black/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20 w-48 md:w-64"
                          />
                        </div>
                        
                        <select 
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as any)}
                          className="bg-brand-light border border-black/10 rounded-xl py-2.5 px-3 text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value="All">All Categories</option>
                          <option value="Home Improvement">Home Improvement</option>
                          <option value="Gadgets">Gadgets</option>
                          <option value="Kitchen">Kitchen</option>
                        </select>

                        <button 
                          onClick={handleAddNewProductClick}
                          className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <PlusCircle size={14} /> Upload Product
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <div 
                          key={product.id}
                          className="bg-brand-light/30 border border-black/10 rounded-2xl p-5 flex flex-col justify-between hover:border-brand-primary/40 transition-all shadow-sm group"
                        >
                          <div>
                            <div className="flex gap-4 items-start mb-4">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-black/10 shrink-0 relative shadow-inner">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                {product.isTopSeller && (
                                  <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-black uppercase px-1 rounded shadow-sm">
                                    Top
                                  </span>
                                )}
                              </div>
                              <div className="flex-grow">
                                <span className="inline-block bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1">
                                  {product.category}
                                </span>
                                <h3 className="font-bold text-sm text-brand-dark leading-snug line-clamp-2">{product.name}</h3>
                                <div className="flex items-center gap-3 mt-2 text-xs">
                                  <span className="font-display font-black text-brand-primary">Rs.{product.price}</span>
                                  <span className="text-brand-gray/70">• {product.weight}g</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-brand-gray line-clamp-2 mb-4 italic">"{product.description}"</p>
                          </div>

                          <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                            <button 
                              onClick={() => handleToggleTopSeller(product.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${product.isTopSeller ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-600 hover:bg-amber-50'}`}
                              title="Toggle Top Seller badge"
                            >
                              <Star size={12} className={product.isTopSeller ? 'fill-amber-500 text-amber-500' : ''} />
                              <span>{product.isTopSeller ? 'Top Seller' : 'Make Top'}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingProduct(product)}
                                className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Edit3 size={12} /> Edit
                              </button>
                              <button 
                                onClick={(e) => handleDeleteProduct(product.id, e)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition-colors"
                                title="Delete product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Store Info & Shipping Rates */}
              {adminTab === 'store-info' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5">
                  <div className="mb-8 border-b pb-6">
                    <h2 className="text-2xl font-display font-bold text-brand-dark">Store Settings & Contact Numbers</h2>
                    <p className="text-xs text-brand-gray mt-1">Update phone numbers, WhatsApp order links, physical store location, and standardized shipping charges.</p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    showToast("Store settings saved successfully!", "success");
                  }} className="space-y-6 max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">WhatsApp Order Number</label>
                        <input 
                          type="text" 
                          value={storeSettings.whatsappNumber}
                          onChange={(e) => setStoreSettings({...storeSettings, whatsappNumber: e.target.value})}
                          placeholder="e.g. +92 329 5147517"
                          className="w-full border border-black/10 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-brand-primary"
                        />
                        <span className="text-[10px] text-brand-gray mt-1 block">Used for order links and customer chat buttons.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Contact Call Phone Number</label>
                        <input 
                          type="text" 
                          value={storeSettings.phone}
                          onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                          placeholder="e.g. +92 329 5147517"
                          className="w-full border border-black/10 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Top Announcement Bar Text</label>
                      <input 
                        type="text" 
                        value={storeSettings.topBarText}
                        onChange={(e) => setStoreSettings({...storeSettings, topBarText: e.target.value})}
                        placeholder="e.g. All items on Wholesale Price • Store Collection & Delivery"
                        className="w-full border border-black/10 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Physical Store Address</label>
                      <textarea 
                        rows={2}
                        value={storeSettings.address}
                        onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                        placeholder="Store physical location address..."
                        className="w-full border border-black/10 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div className="pt-4 border-t border-black/5">
                      <h3 className="text-lg font-bold text-brand-dark mb-4">Standard Delivery Rates (PKR)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Delivery Fee (Up to 500g)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-brand-gray text-xs">Rs.</span>
                            <input 
                              type="number" 
                              value={storeSettings.deliveryFee500g}
                              onChange={(e) => setStoreSettings({...storeSettings, deliveryFee500g: Number(e.target.value)})}
                              className="w-full border border-black/10 rounded-xl py-3 pl-10 pr-3 text-sm font-bold focus:outline-none focus:border-brand-primary"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Delivery Fee (Up to 1000g / 1kg)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-brand-gray text-xs">Rs.</span>
                            <input 
                              type="number" 
                              value={storeSettings.deliveryFee1kg}
                              onChange={(e) => setStoreSettings({...storeSettings, deliveryFee1kg: Number(e.target.value)})}
                              className="w-full border border-black/10 rounded-xl py-3 pl-10 pr-3 text-sm font-bold focus:outline-none focus:border-brand-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider shadow-lg"
                      >
                        Save Store Info
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: Hero Banner Customizer */}
              {adminTab === 'hero' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5">
                  <div className="mb-8 border-b pb-6">
                    <h2 className="text-2xl font-display font-bold text-brand-dark">Homepage Hero Banner Customizer</h2>
                    <p className="text-xs text-brand-gray mt-1">Customize the main headline, description badge, and hero background image.</p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    showToast("Hero banner updated successfully!", "success");
                  }} className="space-y-6 max-w-3xl">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Top Hero Badge Text</label>
                      <input 
                        type="text" 
                        value={storeSettings.heroBadgeText}
                        onChange={(e) => setStoreSettings({...storeSettings, heroBadgeText: e.target.value})}
                        placeholder="e.g. Direct Wholesale Prices"
                        className="w-full border border-black/10 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Main Headline</label>
                      <input 
                        type="text" 
                        value={storeSettings.heroHeadline}
                        onChange={(e) => setStoreSettings({...storeSettings, heroHeadline: e.target.value})}
                        placeholder="e.g. KCC Wholesale Online Shop"
                        className="w-full border border-black/10 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Subheading / Description</label>
                      <textarea 
                        rows={3}
                        value={storeSettings.heroSubheading}
                        onChange={(e) => setStoreSettings({...storeSettings, heroSubheading: e.target.value})}
                        placeholder="Enter hero banner description text..."
                        className="w-full border border-black/10 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Hero Background Image</label>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-3">
                        <div className="w-36 h-20 rounded-xl overflow-hidden bg-black/10 border border-black/10 relative shrink-0">
                          <img src={storeSettings.heroBgImage || heroBgUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow w-full space-y-2">
                          <label className="cursor-pointer bg-brand-primary hover:bg-brand-secondary text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm">
                            <Upload size={14} /> Upload Banner File
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  showToast("Auto-compressing hero banner...", "info");
                                  try {
                                    const res = await compressAndResizeImage(file, { maxWidth: 1600, maxHeight: 1200, quality: 0.85 });
                                    setStoreSettings({...storeSettings, heroBgImage: res.dataUrl});
                                    showToast(`⚡ Compressed banner! ${formatBytes(res.originalSizeBytes)} → ${formatBytes(res.compressedSizeBytes)} (-${res.savingsPercentage}%)`, "success");
                                  } catch {
                                    showToast("Failed to compress hero banner image.", "remove");
                                  }
                                }
                              }}
                            />
                          </label>
                          <input 
                            type="text" 
                            value={storeSettings.heroBgImage || ''}
                            onChange={(e) => setStoreSettings({...storeSettings, heroBgImage: e.target.value})}
                            placeholder="... or paste Image URL https://..."
                            className="w-full border border-black/10 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-brand-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider shadow-lg"
                      >
                        Save Hero Banner
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: Hot Deals & Bundles */}
              {adminTab === 'deals' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-6">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-brand-dark">Hot Deals & Promotional Bundles</h2>
                      <p className="text-xs text-brand-gray mt-1">Add, edit, or remove limited-time special offer cards shown on the homepage.</p>
                    </div>

                    <button 
                      onClick={() => setEditingDeal({ id: `deal-${Date.now()}`, title: '', discount: 'SPECIAL OFFER', desc: '', price: 'Rs. ' })}
                      className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-colors"
                    >
                      <PlusCircle size={16} /> + Add New Deal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {deals.map((deal) => (
                      <div key={deal.id} className="bg-brand-dark text-white p-6 rounded-3xl relative flex flex-col justify-between border border-white/10">
                        <div>
                          <span className="inline-block bg-brand-secondary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3">
                            {deal.discount}
                          </span>
                          <h3 className="text-xl font-bold font-display mb-2">{deal.title}</h3>
                          <p className="text-xs text-brand-gray mb-6 leading-relaxed">{deal.desc}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <span className="text-lg font-bold text-brand-secondary">{deal.price}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditingDeal(deal)}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteDeal(deal.id)}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg transition-colors"
                              title="Delete deal"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Customer Reviews / Testimonials */}
              {adminTab === 'testimonials' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-6">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-brand-dark">Customer Reviews & Testimonials</h2>
                      <p className="text-xs text-brand-gray mt-1">Manage real customer reviews, star ratings, and buyer feedback shown on the homepage.</p>
                    </div>

                    <button 
                      onClick={() => setEditingTestimonial({ id: `testi-${Date.now()}`, name: '', review: '', rating: 5, location: 'Verified Customer' })}
                      className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-colors"
                    >
                      <PlusCircle size={16} /> + Add Customer Review
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((item) => (
                      <div key={item.id} className="bg-brand-light p-6 rounded-3xl flex flex-col justify-between border border-black/5">
                        <div>
                          <div className="flex text-amber-500 mb-3 gap-1">
                            {[...Array(item.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                          </div>
                          <p className="text-xs italic text-brand-dark mb-4 leading-relaxed">"{item.review}"</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-black/5">
                          <div>
                            <h4 className="font-bold text-xs text-brand-primary">{item.name}</h4>
                            {item.location && <span className="text-[10px] text-brand-gray font-medium">{item.location}</span>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => setEditingTestimonial(item)}
                              className="p-1.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-lg text-xs font-bold transition-colors"
                              title="Edit review"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTestimonial(item.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition-colors"
                              title="Delete review"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: Policy Pages Text Customizer */}
              {adminTab === 'policies' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5">
                  <div className="mb-8 border-b pb-6">
                    <h2 className="text-2xl font-display font-bold text-brand-dark">Store Policies Customizer</h2>
                    <p className="text-xs text-brand-gray mt-1">Edit policy text for Return & Refund Policy, Privacy Policy, and Terms & Conditions.</p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    showToast("Policy pages updated successfully!", "success");
                  }} className="space-y-6 max-w-4xl">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Return & Refund Policy Summary</label>
                      <textarea 
                        rows={4}
                        value={storeSettings.returnPolicyText}
                        onChange={(e) => setStoreSettings({...storeSettings, returnPolicyText: e.target.value})}
                        className="w-full border border-black/10 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-brand-primary leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Privacy & Data Security Policy Text</label>
                      <textarea 
                        rows={4}
                        value={storeSettings.privacyPolicyText}
                        onChange={(e) => setStoreSettings({...storeSettings, privacyPolicyText: e.target.value})}
                        className="w-full border border-black/10 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-brand-primary leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">Terms & Conditions Text</label>
                      <textarea 
                        rows={4}
                        value={storeSettings.termsText}
                        onChange={(e) => setStoreSettings({...storeSettings, termsText: e.target.value})}
                        className="w-full border border-black/10 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-brand-primary leading-relaxed"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider shadow-lg"
                      >
                        Save All Policies
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 7: Contact Form Messages Inbox (Admin Only) */}
              {adminTab === 'contact-messages' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-display font-bold text-brand-dark">Contact Form & WhatsApp Orders Inbox</h2>
                        <span className="px-3 py-1 bg-red-500 text-white font-bold text-xs rounded-full shadow-sm">
                          {contactSubmissions.filter(m => m.status === 'unread').length} Unread
                        </span>
                      </div>
                      <p className="text-xs text-brand-gray mt-1">Direct customer inquiries & WhatsApp order submissions. Generate & store simulated tracking numbers for courier dispatches.</p>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                      <button 
                        onClick={() => setShowAddOrderModal(true)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus size={15} /> Log WhatsApp Order
                      </button>

                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search customer, phone, tracking..." 
                          value={contactSubmissionSearch}
                          onChange={(e) => setContactSubmissionSearch(e.target.value)}
                          className="bg-brand-light border border-black/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20 w-52 md:w-64"
                        />
                      </div>

                      <select 
                        value={contactSubmissionStatusFilter}
                        onChange={(e) => setContactSubmissionStatusFilter(e.target.value as any)}
                        className="bg-brand-light border border-black/10 rounded-xl py-2.5 px-3 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="unread">Unread Only</option>
                        <option value="read">Read Only</option>
                        <option value="replied">Replied Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="space-y-4">
                    {contactSubmissions
                      .filter(sub => {
                        if (contactSubmissionStatusFilter !== 'all' && sub.status !== contactSubmissionStatusFilter) return false;
                        if (contactSubmissionSearch) {
                          const query = contactSubmissionSearch.toLowerCase();
                          return (
                            sub.name.toLowerCase().includes(query) ||
                            sub.emailOrPhone.toLowerCase().includes(query) ||
                            sub.subject.toLowerCase().includes(query) ||
                            sub.message.toLowerCase().includes(query) ||
                            (sub.trackingNumber && sub.trackingNumber.toLowerCase().includes(query)) ||
                            (sub.courierName && sub.courierName.toLowerCase().includes(query))
                          );
                        }
                        return true;
                      })
                      .map((sub) => (
                        <div 
                          key={sub.id} 
                          className={`p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            sub.status === 'unread' 
                              ? 'bg-red-50/50 border-red-200' 
                              : sub.status === 'replied' 
                                ? 'bg-emerald-50/30 border-emerald-200' 
                                : 'bg-brand-light/40 border-black/5'
                          }`}
                        >
                          <div className="flex items-start gap-4 flex-grow min-w-0">
                            <div className={`p-3 rounded-xl flex-shrink-0 ${
                              sub.status === 'unread' ? 'bg-red-500 text-white' : sub.status === 'replied' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-brand-dark'
                            }`}>
                              <Inbox size={20} />
                            </div>
                            <div className="min-w-0 flex-grow space-y-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="font-bold text-sm md:text-base text-brand-dark">{sub.name}</h4>
                                <span className="text-xs text-brand-primary font-bold font-mono bg-white px-2 py-0.5 rounded border border-black/5">
                                  {sub.emailOrPhone}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  sub.status === 'unread' ? 'bg-red-100 text-red-700' : sub.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {sub.status}
                                </span>
                                {sub.orderType && (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {sub.orderType}
                                  </span>
                                )}
                                {sub.trackingNumber && (
                                  <span className="text-[10px] font-bold font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1 shadow-xs">
                                    <Truck size={12} className="text-blue-600" />
                                    <span>{sub.courierName || 'Courier'}: {sub.trackingNumber}</span>
                                  </span>
                                )}
                                <span className="text-[10px] text-brand-gray ml-auto">{sub.createdAt}</span>
                              </div>
                              <h5 className="text-xs font-bold text-brand-dark">{sub.subject}</h5>
                              <p className="text-xs text-brand-gray line-clamp-2 leading-relaxed">{sub.message}</p>
                              {sub.notes && (
                                <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200/50">
                                  <strong>Admin Note:</strong> {sub.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                            {!sub.trackingNumber ? (
                              <button
                                onClick={() => {
                                  const trk = generateSimulatedTrackingNumber('TCS Express');
                                  const estDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                  const updated = contactSubmissions.map(s => s.id === sub.id ? { 
                                    ...s, 
                                    trackingNumber: trk, 
                                    courierName: 'TCS Express', 
                                    estimatedDeliveryDate: estDate, 
                                    orderType: s.orderType || 'WhatsApp Order', 
                                    status: 'replied' as const 
                                  } : s);
                                  setContactSubmissions(updated);
                                  showToast(`Generated TCS Tracking #${trk}!`, "success");
                                }}
                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                                title="Generate simulated tracking number"
                              >
                                <Truck size={14} /> + Tracking
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`${sub.courierName || 'Courier'}: ${sub.trackingNumber}`);
                                  showToast(`Tracking #${sub.trackingNumber} copied!`, "success");
                                }}
                                className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                                title="Copy tracking number"
                              >
                                <Copy size={13} /> {sub.trackingNumber}
                              </button>
                            )}

                            <button 
                              onClick={() => setSelectedSubmission(sub)}
                              className="px-3.5 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-secondary transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Eye size={14} /> Details
                            </button>
                            <a 
                              href={`https://wa.me/${sub.emailOrPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                sub.trackingNumber 
                                  ? `Hi ${sub.name}! Your KCC Shop order "${sub.subject}" has been dispatched via ${sub.courierName || 'Courier'}. Tracking Number: ${sub.trackingNumber}. Estimated Delivery: ${sub.estimatedDeliveryDate || '2-3 days'}. Thank you!`
                                  : `Hi ${sub.name}! Thank you for contacting KCC Store regarding "${sub.subject}". How can we help you?`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                setContactSubmissions(contactSubmissions.map(s => s.id === sub.id ? { ...s, status: 'replied' } : s));
                              }}
                              className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <MessageCircle size={14} /> WhatsApp
                            </a>
                            <button 
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this submission?")) {
                                  setContactSubmissions(contactSubmissions.filter(s => s.id !== sub.id));
                                  showToast("Submission deleted.", "remove");
                                }
                              }}
                              className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                              title="Delete submission"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                    {contactSubmissions.length === 0 && (
                      <div className="text-center py-16 bg-brand-light/30 rounded-3xl">
                        <Inbox size={48} className="mx-auto text-brand-gray mb-3" />
                        <h4 className="font-bold text-lg text-brand-dark">No Submissions Found</h4>
                        <p className="text-xs text-brand-gray">When visitors submit the contact form, messages will appear here for admin review.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 9: WordPress Website Integration & Embed Portal */}
              {adminTab === 'wordpress' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5 space-y-8">
                  {/* Banner Header */}
                  <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-brand-dark p-6 md:p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                          <Globe size={14} /> WordPress CMS Integration
                        </div>
                        <h2 className="text-2xl md:text-4xl font-display font-extrabold mb-2">
                          Download & Install KCC Store on WordPress
                        </h2>
                        <p className="text-blue-100/80 text-xs md:text-sm max-w-2xl leading-relaxed">
                          Download the complete website as a standalone, ready-to-install WordPress Theme (.ZIP) or embed it using shortcodes, iFrames, and standalone hosting.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button 
                          onClick={async () => {
                            showToast("Preparing WordPress Theme ZIP package...", "info");
                            try {
                              const filename = await downloadWordPressThemeZip({
                                products,
                                storeSettings,
                                deals,
                                testimonials
                              });
                              showToast(`🎉 Downloaded ${filename}! Ready to install in WordPress.`, "success");
                            } catch (err: any) {
                              console.error(err);
                              showToast("Failed to generate WordPress theme ZIP.", "remove");
                            }
                          }}
                          className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-zinc-950 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl hover:scale-105 cursor-pointer"
                        >
                          <Download size={16} /> Download WP Theme (.ZIP)
                        </button>

                        <a 
                          href={window.location.href}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="self-start md:self-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-white/20 shrink-0"
                        >
                          <ExternalLink size={14} /> Preview Store
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 🌟 FEATURED: Complete Downloadable WordPress Theme (.ZIP) Package */}
                  <div className="bg-gradient-to-br from-amber-500/10 via-brand-light/60 to-emerald-500/10 border-2 border-brand-primary/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-md relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-emerald-600/10 text-emerald-700 border border-emerald-600/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                          <Zap size={14} /> Official WordPress Theme Package (v1.0.1 - White Screen Fixed)
                        </div>
                        <h3 className="text-2xl font-black text-brand-dark tracking-tight">
                          Install Complete Website as a Native WordPress Theme
                        </h3>
                        <p className="text-xs sm:text-sm text-brand-gray leading-relaxed">
                          Download a single, complete <code className="bg-brand-primary/10 text-brand-primary font-bold px-1.5 py-0.5 rounded">.zip</code> archive containing all WordPress theme templates (<code className="bg-black/5 px-1 py-0.5 rounded text-[11px]">style.css</code>, <code className="bg-black/5 px-1 py-0.5 rounded text-[11px]">functions.php</code>, <code className="bg-black/5 px-1 py-0.5 rounded text-[11px]">front-page.php</code>, <code className="bg-black/5 px-1 py-0.5 rounded text-[11px]">header.php</code>, <code className="bg-black/5 px-1 py-0.5 rounded text-[11px]">footer.php</code>, <code className="bg-black/5 px-1 py-0.5 rounded text-[11px]">page.php</code>, <code className="bg-black/5 px-1 py-0.5 rounded text-[11px]">404.php</code>), server-rendered product catalog, WhatsApp checkout, and WordPress Admin Settings Panel.
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 p-3 rounded-2xl text-xs space-y-1">
                          <div className="font-extrabold flex items-center gap-1.5">
                            <span>✅</span> Blank White Page Issue Resolved:
                          </div>
                          <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                            The theme now uses server-side PHP HTML rendering so all products, images, and WhatsApp buttons render instantly without depending on client-side JavaScript execution. All PHP template files have been hardened against parse errors.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                        <button
                          onClick={async () => {
                            showToast("Packaging all store assets into theme zip...", "info");
                            try {
                              const filename = await downloadWordPressThemeZip({
                                products,
                                storeSettings,
                                deals,
                                testimonials
                              });
                              showToast(`🎉 Success! Downloaded ${filename}`, "success");
                            } catch (err: any) {
                              console.error(err);
                              showToast("Error creating WordPress theme zip file", "remove");
                            }
                          }}
                          className="px-8 py-4 bg-brand-primary hover:bg-brand-secondary text-white rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
                        >
                          <Download size={18} /> Download Theme ZIP Now
                        </button>
                        <span className="text-[10px] text-center text-brand-gray font-medium">
                          📦 Ready for <strong>Appearance &gt; Themes &gt; Upload Theme</strong>
                        </span>
                      </div>
                    </div>

                    {/* Features Included Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-black/5">
                      <div className="bg-white/80 p-3 rounded-2xl border border-black/5 text-center">
                        <span className="text-emerald-600 font-extrabold text-xs block">✅ 1-Click WhatsApp</span>
                        <span className="text-[10px] text-brand-gray">Direct customer checkout</span>
                      </div>
                      <div className="bg-white/80 p-3 rounded-2xl border border-black/5 text-center">
                        <span className="text-emerald-600 font-extrabold text-xs block">✅ Zero SQL Required</span>
                        <span className="text-[10px] text-brand-gray">Instant plug & play setup</span>
                      </div>
                      <div className="bg-white/80 p-3 rounded-2xl border border-black/5 text-center">
                        <span className="text-emerald-600 font-extrabold text-xs block">✅ WP Admin Settings</span>
                        <span className="text-[10px] text-brand-gray">Appearance &gt; KCC Settings</span>
                      </div>
                      <div className="bg-white/80 p-3 rounded-2xl border border-black/5 text-center">
                        <span className="text-emerald-600 font-extrabold text-xs block">✅ Shortcode [kcc_store]</span>
                        <span className="text-[10px] text-brand-gray">Works with Elementor/Gutenberg</span>
                      </div>
                    </div>

                    {/* 4-Step Installation Walkthrough */}
                    <div className="bg-white p-5 md:p-6 rounded-2xl border border-black/5 space-y-4">
                      <h4 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                        <span>📋</span> How to Install this Theme in WordPress (30-Second Guide):
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div className="bg-brand-light/30 p-4 rounded-xl space-y-1.5 border border-black/5">
                          <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-black flex items-center justify-center">1</span>
                          <div className="font-bold text-brand-dark">Download .ZIP</div>
                          <p className="text-brand-gray text-[11px] leading-relaxed">Click the download button to get <code className="text-brand-primary font-bold">kcc-store-theme.zip</code>.</p>
                        </div>

                        <div className="bg-brand-light/30 p-4 rounded-xl space-y-1.5 border border-black/5">
                          <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-black flex items-center justify-center">2</span>
                          <div className="font-bold text-brand-dark">Upload in WP</div>
                          <p className="text-brand-gray text-[11px] leading-relaxed">In WP Admin, go to <strong>Appearance &gt; Themes &gt; Add New &gt; Upload Theme</strong>.</p>
                        </div>

                        <div className="bg-brand-light/30 p-4 rounded-xl space-y-1.5 border border-black/5">
                          <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-black flex items-center justify-center">3</span>
                          <div className="font-bold text-brand-dark">Install & Activate</div>
                          <p className="text-brand-gray text-[11px] leading-relaxed">Select the zip file, click <strong>Install Now</strong>, then click <strong>Activate</strong>.</p>
                        </div>

                        <div className="bg-brand-light/30 p-4 rounded-xl space-y-1.5 border border-black/5">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">4</span>
                          <div className="font-bold text-brand-dark">Store Live!</div>
                          <p className="text-brand-gray text-[11px] leading-relaxed">Your entire store is active! Configure WhatsApp number in <strong>Appearance &gt; KCC Store</strong>.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Integration Methods Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* METHOD 1: Responsive Gutenberg / Elementor iFrame Code */}
                    <div className="bg-brand-light/50 border border-black/10 rounded-3xl p-6 flex flex-col justify-between space-y-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-7 h-7 rounded-full bg-brand-primary text-white text-xs font-black flex items-center justify-center">1</span>
                          <h3 className="font-bold text-lg text-brand-dark">Quick WordPress iFrame Embed Code</h3>
                        </div>
                        <p className="text-xs text-brand-gray leading-relaxed mb-4">
                          Copy & paste this snippet directly into any <strong>Custom HTML Block</strong> in WordPress Gutenberg, Elementor, Divi, or WPBakery.
                        </p>

                        <div className="relative bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-zinc-700 shadow-inner">
                          <pre className="whitespace-pre-wrap break-all leading-relaxed">
{`<iframe
  src="${window.location.origin}"
  width="100%"
  height="900"
  style="border:none; width:100%; min-height:100vh; border-radius:16px;"
  allow="geolocation; camera; microphone; payment"
></iframe>`}
                          </pre>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const code = `<iframe src="${window.location.origin}" width="100%" height="900" style="border:none; width:100%; min-height:100vh; border-radius:16px;" allow="geolocation; camera; microphone; payment"></iframe>`;
                          navigator.clipboard.writeText(code);
                          showToast("WordPress iFrame HTML snippet copied to clipboard!", "success");
                        }}
                        className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Copy size={16} /> Copy WordPress iFrame HTML Code
                      </button>
                    </div>

                    {/* METHOD 2: Custom WordPress Shortcode Plugin Code */}
                    <div className="bg-brand-light/50 border border-black/10 rounded-3xl p-6 flex flex-col justify-between space-y-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">2</span>
                          <h3 className="font-bold text-lg text-brand-dark">WordPress Shortcode Plugin ([kcc_store])</h3>
                        </div>
                        <p className="text-xs text-brand-gray leading-relaxed mb-4">
                          Use this PHP snippet in your theme's <code className="bg-black/5 px-1.5 py-0.5 rounded text-brand-primary font-bold">functions.php</code> or create a custom plugin to enable <code className="bg-black/5 px-1.5 py-0.5 rounded text-brand-primary font-bold">[kcc_store]</code> anywhere in WordPress!
                        </p>

                        <div className="relative bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs max-h-48 overflow-y-auto border border-zinc-700 shadow-inner">
                          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
{`<?php
/**
 * Plugin Name: KCC Online Store Embed
 * Description: Seamlessly embeds KCC Online Shop into any WordPress page via shortcode [kcc_store]
 * Version: 1.0.0
 */

function kcc_online_store_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '900px',
    ), $atts, 'kcc_store');

    $store_url = "${window.location.origin}";

    return '<div className="kcc-store-container" style="width:100%; overflow:hidden;">' .
           '<iframe src="' . esc_url($store_url) . '" width="100%" height="' . esc_attr($atts['height']) . '" style="border:none; width:100%; min-height:100vh; border-radius:12px;" allow="geolocation; camera; microphone; payment"></iframe>' .
           '</div>';
}
add_shortcode('kcc_store', 'kcc_online_store_shortcode');
`}
                          </pre>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            const phpCode = `<?php
/**
 * Plugin Name: KCC Online Store Embed
 * Description: Seamlessly embeds KCC Online Shop into any WordPress page via shortcode [kcc_store]
 * Version: 1.0.0
 */

function kcc_online_store_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '900px',
    ), $atts, 'kcc_store');

    $store_url = "${window.location.origin}";

    return '<div className="kcc-store-container" style="width:100%; overflow:hidden;">' .
           '<iframe src="' . esc_url($store_url) . '" width="100%" height="' . esc_attr($atts['height']) . '" style="border:none; width:100%; min-height:100vh; border-radius:12px;" allow="geolocation; camera; microphone; payment"></iframe>' .
           '</div>';
}
add_shortcode('kcc_store', 'kcc_online_store_shortcode');`;
                            navigator.clipboard.writeText(phpCode);
                            showToast("WordPress Plugin PHP code copied to clipboard!", "success");
                          }}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                          <Code size={16} /> Copy WordPress Plugin Code
                        </button>

                        <button
                          onClick={() => {
                            const phpCode = `<?php
/**
 * Plugin Name: KCC Online Store Embed
 * Description: Seamlessly embeds KCC Online Shop into any WordPress page via shortcode [kcc_store]
 * Version: 1.0.0
 */

function kcc_online_store_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '900px',
    ), $atts, 'kcc_store');

    $store_url = "${window.location.origin}";

    return '<div className="kcc-store-container" style="width:100%; overflow:hidden;">' .
           '<iframe src="' . esc_url($store_url) . '" width="100%" height="' . esc_attr($atts['height']) . '" style="border:none; width:100%; min-height:100vh; border-radius:12px;" allow="geolocation; camera; microphone; payment"></iframe>' .
           '</div>';
}
add_shortcode('kcc_store', 'kcc_online_store_shortcode');`;
                            const blob = new Blob([phpCode], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'kcc-store-embed.php';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            showToast("Downloaded kcc-store-embed.php plugin file!", "success");
                          }}
                          className="py-3 px-5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                          <Download size={16} /> Download .php
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* METHOD 3: Full WordPress Hosting Folder Setup Guide */}
                  <div className="bg-brand-light/30 border border-black/10 rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                      <div className="p-3 bg-brand-primary text-white rounded-2xl">
                        <Code size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-brand-dark">How to host this app directly on WordPress cPanel / Hostinger</h3>
                        <p className="text-xs text-brand-gray">Step-by-step guide to run KCC Store inside your WordPress domain URL (e.g. <code>yourdomain.com/shop</code>)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-brand-dark">
                      <div className="bg-white p-5 rounded-2xl border border-black/5 space-y-2 shadow-sm">
                        <div className="font-bold text-brand-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-black flex items-center justify-center">1</span>
                          <span>Export Static Build</span>
                        </div>
                        <p className="text-brand-gray leading-relaxed">
                          In AI Studio top right menu, click <strong>Export / Download ZIP</strong>. Run <code className="bg-gray-100 px-1 rounded">npm run build</code> to produce the standalone static files in <code className="bg-gray-100 px-1 rounded">dist/</code>.
                        </p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-black/5 space-y-2 shadow-sm">
                        <div className="font-bold text-brand-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-black flex items-center justify-center">2</span>
                          <span>Upload to cPanel / Hosting</span>
                        </div>
                        <p className="text-brand-gray leading-relaxed">
                          In your cPanel File Manager, navigate to <code className="bg-gray-100 px-1 rounded">public_html/</code>, create a new folder named <code className="bg-gray-100 px-1 rounded">shop</code>, and upload all files from <code className="bg-gray-100 px-1 rounded">dist/</code> inside it.
                        </p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-black/5 space-y-2 shadow-sm">
                        <div className="font-bold text-brand-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-black flex items-center justify-center">3</span>
                          <span>Access via WordPress</span>
                        </div>
                        <p className="text-brand-gray leading-relaxed">
                          Your KCC Store will now instantly open on <code className="bg-gray-100 px-1 rounded">yourdomain.com/shop</code> right alongside your WordPress website!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 🚨 SPECIAL SECTION: Fixing "kcconline.shop / This Page Does Not Exist" (404 Issue) */}
                  <div className="bg-gradient-to-br from-red-500/10 via-amber-500/5 to-white border-2 border-red-500/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-600 text-white rounded-2xl shadow-md shrink-0">
                        <Globe size={24} />
                      </div>
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                          Troubleshooting Guide & Server Fixes
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark">
                          Fixing <code className="bg-red-100/80 px-2 py-0.5 rounded text-red-800 font-mono">kcconline.shop / This Page Does Not Exist</code> (404 Error)
                        </h3>
                        <p className="text-xs text-brand-gray leading-relaxed max-w-3xl">
                          If visiting <code className="font-semibold text-brand-dark">kcconline.shop</code> shows <em>"This Page Does Not Exist"</em>, this occurs because WordPress or your hosting server (cPanel/Apache/Nginx) tries to find a default WordPress page instead of routing traffic to the Single Page App (SPA). Download or copy the pre-configured rewrite files below to fix it immediately!
                        </p>
                      </div>
                    </div>

                    {/* Downloadable Fixes & Config Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Fix 1: Apache .htaccess file */}
                      <div className="bg-white p-5 rounded-2xl border border-black/10 space-y-3 flex flex-col justify-between shadow-sm">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">For cPanel / Apache</span>
                          <h4 className="font-bold text-sm text-brand-dark mt-2">Download .htaccess File</h4>
                          <p className="text-[11px] text-brand-gray leading-relaxed mt-1">
                            Upload this file to your <code className="bg-gray-100 px-1 rounded">public_html</code> or <code className="bg-gray-100 px-1 rounded">/shop</code> folder in cPanel File Manager to direct all routes to index.html.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const htaccessContent = `# Apache / cPanel / WordPress SPA Rewrite Rule for KCC Online Store
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>`;
                            const blob = new Blob([htaccessContent], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = '.htaccess';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            showToast("Downloaded .htaccess rewrite file for cPanel!", "success");
                          }}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                          <Download size={14} /> Download .htaccess
                        </button>
                      </div>

                      {/* Fix 2: WordPress index.php fallback */}
                      <div className="bg-white p-5 rounded-2xl border border-black/10 space-y-3 flex flex-col justify-between shadow-sm">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">For WP Directory Install</span>
                          <h4 className="font-bold text-sm text-brand-dark mt-2">Download WP index.php</h4>
                          <p className="text-[11px] text-brand-gray leading-relaxed mt-1">
                            Place this inside your <code className="bg-gray-100 px-1 rounded">public_html/shop</code> directory to prevent WordPress from throwing 404 on subfolder requests.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const phpFallback = `<?php
/**
 * KCC Online Store - WordPress Subfolder & SPA Entry Fallback
 */
if (file_exists(__DIR__ . '/index.html')) {
    include __DIR__ . '/index.html';
    exit;
}
?>`;
                            const blob = new Blob([phpFallback], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'index.php';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            showToast("Downloaded index.php WordPress fallback file!", "success");
                          }}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                          <Download size={14} /> Download index.php
                        </button>
                      </div>

                      {/* Fix 3: Nginx rewrite snippet */}
                      <div className="bg-white p-5 rounded-2xl border border-black/10 space-y-3 flex flex-col justify-between shadow-sm">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-700 bg-zinc-100 px-2 py-1 rounded">For Nginx Servers</span>
                          <h4 className="font-bold text-sm text-brand-dark mt-2">Copy Nginx try_files</h4>
                          <p className="text-[11px] text-brand-gray leading-relaxed mt-1">
                            Add <code className="bg-gray-100 px-1 rounded">try_files $uri $uri/ /index.html;</code> to your Nginx server block to handle SPA client routing.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const nginxSnippet = `location / {\n    try_files $uri $uri/ /index.html;\n}`;
                            navigator.clipboard.writeText(nginxSnippet);
                            showToast("Copied Nginx try_files rewrite rule to clipboard!", "success");
                          }}
                          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                          <Copy size={14} /> Copy Nginx Rule
                        </button>
                      </div>
                    </div>

                    {/* WordPress Permalinks Checklist */}
                    <div className="bg-white p-5 rounded-2xl border border-black/5 space-y-3">
                      <h4 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-600" /> WordPress Permalinks 1-Minute Fix:
                      </h4>
                      <ol className="list-decimal list-inside text-xs text-brand-gray space-y-1.5 leading-relaxed">
                        <li>Log into your WordPress Dashboard at <code className="bg-gray-100 px-1 rounded">kcconline.shop/wp-admin</code></li>
                        <li>Navigate to <strong>Settings</strong> ➔ <strong>Permalinks</strong></li>
                        <li>Select <strong>"Post Name"</strong> (or re-click <strong>"Save Changes"</strong>) to regenerate WordPress rewrite rules automatically.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
              {adminTab === 'user-management' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-display font-bold text-brand-dark">Multi-Admin Rights Management</h2>
                        <span className="px-3 py-1 bg-brand-primary text-white font-bold text-xs rounded-full">
                          {adminUsers.length} Users
                        </span>
                      </div>
                      <p className="text-xs text-brand-gray mt-1">Create multiple admin accounts with customized access rights limited to specific tabs, categories, or discount limits.</p>
                    </div>

                    {(currentAdminUser?.role === 'superadmin' || currentAdminUser?.canManageUsers) && (
                      <button 
                        onClick={() => setEditingUser({
                          id: `usr_${Date.now()}`,
                          username: '',
                          password: '',
                          name: '',
                          role: 'subadmin',
                          allowedTabs: ['products', 'contact-messages'],
                          allowedCategories: [],
                          maxDiscountPercent: 20,
                          canDeleteProducts: false,
                          canManageUsers: false,
                          createdAt: new Date().toISOString().split('T')[0]
                        })}
                        className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-colors"
                      >
                        <Users size={16} /> + Add New Admin User
                      </button>
                    )}
                  </div>

                  {/* Users Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminUsers.map((usr) => (
                      <div key={usr.id} className="bg-brand-light/50 border border-black/10 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${usr.role === 'superadmin' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
                              <Shield size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-brand-dark">{usr.name}</h3>
                              <p className="text-xs text-brand-gray font-mono">@{usr.username}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            usr.role === 'superadmin' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {usr.role === 'superadmin' ? 'Superadmin' : 'Sub-Admin'}
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px] text-brand-gray block mb-1">Allowed Panel Tabs:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {usr.allowedTabs.map(tab => (
                                <span key={tab} className="bg-white border text-brand-dark px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                                  {tab}
                                </span>
                              ))}
                            </div>
                          </div>

                          {usr.allowedCategories && usr.allowedCategories.length > 0 && (
                            <div>
                              <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px] text-brand-gray block mb-1">Restricted Category Scope:</span>
                              <span className="text-[11px] font-bold text-brand-primary">{usr.allowedCategories.join(', ')}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-brand-gray font-medium border-t border-black/5">
                            <span>Max Discount Limit: <strong className="text-brand-dark">{usr.maxDiscountPercent || 100}%</strong></span>
                            <span>Can Delete Products: <strong className="text-brand-dark">{usr.canDeleteProducts ? 'Yes' : 'No'}</strong></span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-black/5">
                          <span className="text-[10px] text-brand-gray">Created: {usr.createdAt}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingUser(usr)}
                              className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Edit Rights
                            </button>
                            {usr.id !== DEFAULT_SUPER_ADMIN.id && (
                              <button 
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete admin user "${usr.name}"?`)) {
                                    const updatedUsers = adminUsers.filter(u => u.id !== usr.id);
                                    setAdminUsers(updatedUsers);
                                    try {
                                      localStorage.setItem('kcc_admin_users_v1', JSON.stringify(updatedUsers));
                                    } catch (e) {
                                      console.error(e);
                                    }
                                    showToast(`Admin account "${usr.username}" deleted.`, "remove");
                                  }
                                }}
                                className="p-1.5 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors"
                                title="Delete user"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 10: B2B Dropshipping & Factory Sourcing Hub */}
              {adminTab === 'dropshipping' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-black/5 space-y-8">
                  {/* Top Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-display font-bold text-brand-dark flex items-center gap-2">
                          <Globe className="text-brand-primary" size={26} />
                          <span>B2B Dropshipping & Factory Sourcing Hub</span>
                        </h2>
                        <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-sm">
                          Alibaba & AliExpress Live
                        </span>
                      </div>
                      <p className="text-xs text-brand-gray mt-1">
                        Source high-margin products directly from Alibaba, AliExpress, CJ Dropshipping, and Made-in-China. Import items into KCC Store catalog with 1 click.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="bg-brand-light px-4 py-2 rounded-xl border border-black/10 flex items-center gap-2 text-xs font-bold text-brand-dark">
                        <DollarSign size={14} className="text-emerald-600" />
                        <span>1 USD = Rs.{dropshipSettings.usdExchangeRate} PKR</span>
                      </div>
                      <div className="bg-brand-light px-4 py-2 rounded-xl border border-black/10 flex items-center gap-2 text-xs font-bold text-brand-dark">
                        <Percent size={14} className="text-brand-primary" />
                        <span>Avg Profit Margin: {dropshipSettings.defaultMarkupPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Overview Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Layers size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/60 block">Sourced Products</span>
                        <span className="text-2xl font-black text-indigo-950">{dropshipPresets.length} Catalog Presets</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <TrendingUp size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/60 block">Avg Unit Profit</span>
                        <span className="text-2xl font-black text-emerald-950">
                          Rs.{Math.round(dropshipPresets.reduce((acc, p) => acc + p.estimatedProfitPkr, 0) / dropshipPresets.length).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Building2 size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/60 block">B2B Verified Suppliers</span>
                        <span className="text-2xl font-black text-amber-950">{dropshipSuppliers.length} Direct Portals</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Truck size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900/60 block">Active Dropship Orders</span>
                        <span className="text-2xl font-black text-blue-950">{dropshipOrders.length} Synced Orders</span>
                      </div>
                    </div>
                  </div>

                  {/* Dropshipping Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-black/10 pb-4">
                    {[
                      { id: 'presets', label: '📦 One-Click Catalog Importer', icon: Zap },
                      { id: 'extractor', label: '🔗 Custom URL / ID Extractor', icon: ExternalLink },
                      { id: 'suppliers', label: '🏭 B2B Platforms & Suppliers', icon: Building2 },
                      { id: 'rfq', label: '📝 B2B RFQ Quote Generator', icon: FileText },
                      { id: 'orders', label: '🚚 Supplier Order Tracker', icon: Truck },
                      { id: 'settings', label: '⚙️ API & Currency Exchange', icon: Settings },
                    ].map((st) => {
                      const Icon = st.icon;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setDropshipSubTab(st.id as any)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            dropshipSubTab === st.id
                              ? 'bg-zinc-900 text-white shadow-md'
                              : 'bg-brand-light text-brand-gray hover:bg-black/5 hover:text-brand-dark'
                          }`}
                        >
                          <Icon size={14} />
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SUBTAB 1: One-Click Catalog Importer (Curated Presets) */}
                  {dropshipSubTab === 'presets' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-light/50 p-4 rounded-2xl border border-black/5">
                        <div>
                          <h3 className="font-bold text-sm text-brand-dark">Curated High-Profit Dropship Products</h3>
                          <p className="text-xs text-brand-gray">Click "Import to Store Catalog" on any item to instantly add it to your live storefront inventory.</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-gray">Platform:</span>
                          <select
                            value={dropshipPlatformFilter}
                            onChange={(e) => setDropshipPlatformFilter(e.target.value)}
                            className="bg-white border border-black/10 rounded-xl py-1.5 px-3 text-xs font-bold outline-none cursor-pointer"
                          >
                            <option value="All">All Platforms</option>
                            <option value="Alibaba">Alibaba</option>
                            <option value="AliExpress">AliExpress</option>
                            <option value="CJ Dropshipping">CJ Dropshipping</option>
                            <option value="DHgate">DHgate</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dropshipPresets
                          .filter(item => dropshipPlatformFilter === 'All' || item.platform === dropshipPlatformFilter)
                          .map((item) => {
                            const isImported = products.some(p => p.name.toLowerCase() === item.title.toLowerCase()) || importedPresetIds.includes(item.id);
                            return (
                              <div key={item.id} className="bg-white border border-black/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
                                <div>
                                  <div className="relative h-48 overflow-hidden bg-gray-100">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    <span className="absolute top-3 left-3 bg-zinc-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                      <Globe size={12} className="text-amber-400" /> {item.platform}
                                    </span>
                                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                                      {Math.round(((item.suggestedRetailPkr - item.costPkr) / item.costPkr) * 100)}% Margin
                                    </span>
                                  </div>

                                  <div className="p-5 space-y-3">
                                    <div className="flex items-center justify-between text-[11px] text-brand-gray">
                                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{item.category}</span>
                                      <span className="flex items-center gap-1 font-bold"><Star size={12} className="fill-amber-400 text-amber-400" /> {item.supplierRating}</span>
                                    </div>

                                    <h4 className="font-bold text-sm text-brand-dark line-clamp-2 leading-snug">{item.title}</h4>
                                    <p className="text-[11px] text-brand-gray line-clamp-2">{item.description}</p>

                                    {/* Cost Breakdown Box */}
                                    <div className="bg-brand-light p-3 rounded-2xl space-y-1.5 text-xs">
                                      <div className="flex justify-between items-center text-brand-gray">
                                        <span>Supplier Unit Cost:</span>
                                        <span className="font-bold text-brand-dark">${item.costUsd.toFixed(2)} USD (Rs.{item.costPkr.toLocaleString()})</span>
                                      </div>
                                      <div className="flex justify-between items-center text-brand-gray">
                                        <span>Suggested Retail Price:</span>
                                        <span className="font-bold text-brand-primary">Rs.{item.suggestedRetailPkr.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between items-center pt-1.5 border-t border-black/10 font-black text-emerald-700">
                                        <span>Estimated Net Profit:</span>
                                        <span className="text-sm">+Rs.{item.estimatedProfitPkr.toLocaleString()}</span>
                                      </div>
                                    </div>

                                    <div className="text-[10px] text-brand-gray flex justify-between items-center pt-1">
                                      <span>MOQ: <strong>{item.moq} Units</strong></span>
                                      <span>Shipping: <strong>{item.shippingMethod}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-5 pt-0">
                                  <button
                                    onClick={() => handleImportPresetToCatalog(item)}
                                    disabled={isImported}
                                    className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                                      isImported
                                        ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                                        : 'bg-brand-primary hover:bg-brand-secondary text-white cursor-pointer'
                                    }`}
                                  >
                                    {isImported ? (
                                      <>
                                        <CheckCircle size={16} /> Imported in Storefront
                                      </>
                                    ) : (
                                      <>
                                        <PlusCircle size={16} /> Import to Store Catalog
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: Custom URL / Product ID Extractor */}
                  {dropshipSubTab === 'extractor' && (
                    <div className="bg-brand-light/30 p-6 md:p-8 rounded-3xl border border-black/10 space-y-6">
                      <div className="flex items-center gap-3 border-b border-black/10 pb-4">
                        <div className="p-3 bg-zinc-900 text-white rounded-2xl">
                          <ExternalLink size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-brand-dark">Import Product from Alibaba / AliExpress URL</h3>
                          <p className="text-xs text-brand-gray">Paste any product URL or fill out product specs to calculate margins and import directly to KCC Shop.</p>
                        </div>
                      </div>

                      <form onSubmit={handleImportCustomExtractedProduct} className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">Alibaba / AliExpress / CJ Product URL</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={extUrl}
                              onChange={(e) => setExtUrl(e.target.value)}
                              placeholder="e.g. https://www.aliexpress.com/item/100500123456789.html"
                              className="flex-grow bg-white border border-black/10 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (extUrl) {
                                  showToast("Simulating product metadata extraction...", "info");
                                  setTimeout(() => {
                                    setExtTitle("High Precision Digital Electronic Kitchen Weight Scale 5kg");
                                    setExtCostUsd(3.40);
                                    setExtSupplier("Guangzhou Precision Tech Co.");
                                    setExtPlatform("AliExpress");
                                    setExtImage("https://images.unsplash.com/photo-1590212151175-e58edd96185c?q=80&w=800");
                                    showToast("Product metadata successfully fetched!", "success");
                                  }, 800);
                                } else {
                                  showToast("Please enter a valid URL first", "remove");
                                }
                              }}
                              className="py-3 px-5 bg-zinc-900 text-white font-bold text-xs rounded-xl hover:bg-black transition-all flex items-center gap-1.5"
                            >
                              <RefreshCw size={14} /> Fetch Info
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Product Title *</label>
                            <input
                              type="text"
                              value={extTitle}
                              onChange={(e) => setExtTitle(e.target.value)}
                              className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Platform Source</label>
                            <select
                              value={extPlatform}
                              onChange={(e) => setExtPlatform(e.target.value as any)}
                              className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer"
                            >
                              <option value="Alibaba">Alibaba.com</option>
                              <option value="AliExpress">AliExpress.com</option>
                              <option value="CJ Dropshipping">CJ Dropshipping</option>
                              <option value="DHgate">DHgate</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Category</label>
                            <select
                              value={extCategory}
                              onChange={(e) => setExtCategory(e.target.value as any)}
                              className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer"
                            >
                              <option value="Gadgets">Gadgets</option>
                              <option value="Home Improvement">Home Improvement</option>
                              <option value="Kitchen">Kitchen</option>
                            </select>
                          </div>
                        </div>

                        {/* Financials & Markup Calculator */}
                        <div className="bg-white p-5 rounded-2xl border border-black/10 space-y-4 shadow-sm">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                            <TrendingUp size={16} /> Automated Profit Calculator (USD to PKR)
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <label className="block text-brand-gray mb-1">Supplier Cost ($ USD)</label>
                              <input
                                type="number"
                                step="0.10"
                                value={extCostUsd}
                                onChange={(e) => setExtCostUsd(parseFloat(e.target.value) || 0)}
                                className="w-full bg-brand-light border border-black/10 rounded-xl p-2.5 font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-brand-gray mb-1">Unit Cost in PKR (@ Rs.{dropshipSettings.usdExchangeRate})</label>
                              <div className="w-full bg-gray-100 border border-black/5 rounded-xl p-2.5 font-black text-brand-dark">
                                Rs.{Math.round(extCostUsd * dropshipSettings.usdExchangeRate).toLocaleString()}
                              </div>
                            </div>

                            <div>
                              <label className="block text-brand-gray mb-1">Markup Percentage (%)</label>
                              <input
                                type="number"
                                value={extMarkupPercent}
                                onChange={(e) => setExtMarkupPercent(parseInt(e.target.value) || 0)}
                                className="w-full bg-brand-light border border-black/10 rounded-xl p-2.5 font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-brand-gray mb-1">Calculated Store Price (PKR)</label>
                              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 font-black text-emerald-800 text-sm">
                                Rs.{Math.round((extCostUsd * dropshipSettings.usdExchangeRate) * (1 + extMarkupPercent / 100)).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Image URL</label>
                            <input
                              type="text"
                              value={extImage}
                              onChange={(e) => setExtImage(e.target.value)}
                              placeholder="Image web link..."
                              className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-medium outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Supplier Name</label>
                            <input
                              type="text"
                              value={extSupplier}
                              onChange={(e) => setExtSupplier(e.target.value)}
                              className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-medium outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-wider justify-center shadow-lg"
                        >
                          <PlusCircle size={18} /> Import Custom Item to Storefront Catalog
                        </button>
                      </form>
                    </div>
                  )}

                  {/* SUBTAB 3: B2B Platforms Directory */}
                  {dropshipSubTab === 'suppliers' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dropshipSuppliers.map((sup) => (
                          <div key={sup.id} className="bg-white border border-black/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center gap-3">
                                  <img src={sup.logo} alt={sup.name} className="w-12 h-12 rounded-2xl object-cover border border-black/10 shadow-sm" />
                                  <div>
                                    <h4 className="font-bold text-sm text-brand-dark">{sup.name}</h4>
                                    <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{sup.platform}</span>
                                  </div>
                                </div>
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <Star size={12} className="fill-amber-500 text-amber-500" /> {sup.rating}
                                </span>
                              </div>

                              <p className="text-xs text-brand-gray mt-3 leading-relaxed">{sup.description}</p>

                              <div className="grid grid-cols-2 gap-3 mt-4 text-[11px] bg-brand-light p-3 rounded-2xl">
                                <div>
                                  <span className="text-brand-gray block text-[10px]">Orders Fulfilled:</span>
                                  <strong className="text-brand-dark">{sup.ordersFulfilled.toLocaleString()}+</strong>
                                </div>
                                <div>
                                  <span className="text-brand-gray block text-[10px]">Shipping Time:</span>
                                  <strong className="text-brand-dark">{sup.avgShippingDays}</strong>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 flex gap-2">
                              <a
                                href={sup.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                              >
                                <ExternalLink size={14} /> Visit {sup.platform} Portal
                              </a>
                              <button
                                onClick={() => {
                                  setDropshipSubTab('rfq');
                                  showToast(`Opened B2B RFQ Generator for ${sup.name}`, "info");
                                }}
                                className="py-2.5 px-4 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-xl text-xs font-bold uppercase transition-all"
                              >
                                Send RFQ
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 4: B2B RFQ (Request for Quotation) Generator */}
                  {dropshipSubTab === 'rfq' && (
                    <div className="bg-brand-light/30 p-6 md:p-8 rounded-3xl border border-black/10 space-y-6">
                      <div className="flex items-center gap-3 border-b border-black/10 pb-4">
                        <div className="p-3 bg-brand-primary text-white rounded-2xl">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-brand-dark">Alibaba & B2B Wholesale RFQ Generator</h3>
                          <p className="text-xs text-brand-gray">Generate a formal B2B Request for Quotation (RFQ) to send to suppliers on Alibaba or Made-in-China for bulk discount rates.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Form */}
                        <div className="space-y-4 bg-white p-5 rounded-2xl border border-black/10">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Product Name</label>
                            <input
                              type="text"
                              value={rfqProdName}
                              onChange={(e) => setRfqProdName(e.target.value)}
                              className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-medium outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Quantity Needed</label>
                              <input
                                type="number"
                                value={rfqQty}
                                onChange={(e) => setRfqQty(parseInt(e.target.value) || 1)}
                                className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-medium outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Target Price ($ USD)</label>
                              <input
                                type="number"
                                step="0.10"
                                value={rfqTargetUsd}
                                onChange={(e) => setRfqTargetUsd(parseFloat(e.target.value) || 0)}
                                className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-medium outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Custom Logo & Box</label>
                              <select
                                value={rfqCustomLogo ? 'yes' : 'no'}
                                onChange={(e) => setRfqCustomLogo(e.target.value === 'yes')}
                                className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer"
                              >
                                <option value="yes">Yes (OEM Brand Logo)</option>
                                <option value="no">No (Standard Neutral Packaging)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Destination City/Port</label>
                              <input
                                type="text"
                                value={rfqPort}
                                onChange={(e) => setRfqPort(e.target.value)}
                                className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-medium outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right Generated Text */}
                        <div className="bg-zinc-900 text-zinc-200 p-6 rounded-2xl border border-zinc-800 space-y-4 flex flex-col justify-between font-mono text-xs">
                          <div>
                            <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2 mb-3">
                              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-400">Generated B2B Supplier RFQ Text</span>
                              <span>Ready to Send</span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed text-[11px] text-zinc-300">
{`Dear Sales Manager,

We are KCC Online Shop, a leading wholesale distributor based in Pakistan (${rfqPort}).
We are interested in sourcing your "${rfqProdName}".

Order Details:
- Target Initial Order Quantity: ${rfqQty} units
- Target Unit Price: $${rfqTargetUsd.toFixed(2)} USD / unit
- Branding Requirement: ${rfqCustomLogo ? 'Custom OEM Logo Printing on Box' : 'Neutral Wholesale Box'}
- Destination Port: ${rfqPort}

Please provide your best FOB / DDP quote, unit lead time, and sample availability.

Best Regards,
KCC Shop Sourcing Team
WhatsApp: ${WHATSAPP_NUMBER}`}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              const text = `Dear Sales Manager,

We are KCC Online Shop, a leading wholesale distributor based in Pakistan (${rfqPort}).
We are interested in sourcing your "${rfqProdName}".

Order Details:
- Target Initial Order Quantity: ${rfqQty} units
- Target Unit Price: $${rfqTargetUsd.toFixed(2)} USD / unit
- Branding Requirement: ${rfqCustomLogo ? 'Custom OEM Logo Printing on Box' : 'Neutral Wholesale Box'}
- Destination Port: ${rfqPort}

Please provide your best FOB / DDP quote, unit lead time, and sample availability.

Best Regards,
KCC Shop Sourcing Team
WhatsApp: ${WHATSAPP_NUMBER}`;
                              navigator.clipboard.writeText(text);
                              showToast("RFQ text copied to clipboard! Paste directly into Alibaba Chat.", "success");
                            }}
                            className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                          >
                            <Copy size={16} /> Copy RFQ Message
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 5: Supplier Orders & Auto Fulfillment */}
                  {dropshipSubTab === 'orders' && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm">
                        <div className="p-4 bg-brand-light border-b border-black/10 font-bold text-xs text-brand-dark flex justify-between items-center">
                          <span>Active Dropshipping Customer Orders ({dropshipOrders.length})</span>
                          <span className="text-emerald-700 font-extrabold">Total Profit: Rs.{dropshipOrders.reduce((acc, o) => acc + o.estimatedProfit, 0).toLocaleString()}</span>
                        </div>

                        <div className="divide-y divide-black/5">
                          {dropshipOrders.map((ord) => (
                            <div key={ord.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-brand-light/30 transition-all text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-brand-primary">{ord.id}</span>
                                  <span className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px] font-bold">{ord.platform}</span>
                                  <span className="text-brand-gray text-[10px]">{ord.date}</span>
                                </div>
                                <h4 className="font-bold text-brand-dark text-sm">{ord.productName} (x{ord.quantity})</h4>
                                <p className="text-brand-gray">Customer: <strong>{ord.customerName}</strong> | Supplier: <strong>{ord.supplierName}</strong></p>
                              </div>

                              <div className="flex flex-wrap items-center gap-4">
                                <div className="text-right">
                                  <div className="text-brand-gray text-[10px]">Customer Paid: <strong className="text-brand-dark">Rs.{ord.customerPrice.toLocaleString()}</strong></div>
                                  <div className="text-emerald-600 font-bold text-xs">Profit: +Rs.{ord.estimatedProfit.toLocaleString()}</div>
                                </div>

                                <div className="bg-brand-light p-2 rounded-xl text-[11px] font-mono">
                                  <div>Tracking: <strong>{ord.trackingNumber}</strong></div>
                                  <div className="text-brand-gray text-[10px]">{ord.courier}</div>
                                </div>

                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'In Transit'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ord.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 6: API Credentials & Exchange Rates */}
                  {dropshipSubTab === 'settings' && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-black/10 space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="font-bold text-lg text-brand-dark">API Keys & Currency Rate Settings</h3>
                        <p className="text-xs text-brand-gray">Configure automatic currency exchange rates and B2B API integrations for AliExpress and CJ Dropshipping.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div>
                          <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">USD to PKR Exchange Rate</label>
                          <input
                            type="number"
                            value={dropshipSettings.usdExchangeRate}
                            onChange={(e) => setDropshipSettings({...dropshipSettings, usdExchangeRate: parseFloat(e.target.value) || 280})}
                            className="w-full bg-brand-light border border-black/10 rounded-xl p-3 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">Default Profit Markup (%)</label>
                          <input
                            type="number"
                            value={dropshipSettings.defaultMarkupPercent}
                            onChange={(e) => setDropshipSettings({...dropshipSettings, defaultMarkupPercent: parseInt(e.target.value) || 80})}
                            className="w-full bg-brand-light border border-black/10 rounded-xl p-3 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">AliExpress Dropshipping App Key</label>
                          <input
                            type="text"
                            value={dropshipSettings.aliExpressAppKey}
                            onChange={(e) => setDropshipSettings({...dropshipSettings, aliExpressAppKey: e.target.value})}
                            className="w-full bg-brand-light border border-black/10 rounded-xl p-3 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-brand-dark mb-1">CJ Dropshipping Access Token</label>
                          <input
                            type="password"
                            value={dropshipSettings.cjAccessToken}
                            onChange={(e) => setDropshipSettings({...dropshipSettings, cjAccessToken: e.target.value})}
                            className="w-full bg-brand-light border border-black/10 rounded-xl p-3 font-mono"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => showToast("Dropshipping settings saved successfully!", "success")}
                          className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider"
                        >
                          Save Settings
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : currentPage === 'return-policy' ? (
          /* Return Policy Page */
          <div className="section-padding min-h-screen bg-brand-light/30">
            <div className="container-custom max-w-5xl">
              {/* Header Banner */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-black/5 mb-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    <ShieldCheck size={16} /> KCC Shop Protection Guarantee
                  </div>
                  <h1 className="text-3xl md:text-5xl font-display font-black text-brand-dark mb-4">
                    Return & Refund Policy
                  </h1>
                  <p className="text-brand-gray max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
                    Please read our store return policy carefully before placing an order. We strive to provide transparent policies and genuine support for all orders.
                  </p>
                </div>
              </div>

              {/* Key Rules Highlight Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                    <Clock size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mb-2">3-Day Claim Window</h3>
                  <p className="text-xs text-brand-gray leading-relaxed font-medium">
                    All return or damage claims must be reported within <strong className="text-brand-dark">3 days</strong> of receiving your delivery. Claims filed after 3 days will not be processed.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mb-4">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mb-2">Faulty / Damaged Only</h3>
                  <p className="text-xs text-brand-gray leading-relaxed font-medium">
                    Return claims are accepted <strong className="text-brand-dark">strictly if the product is faulty or damaged</strong> upon unboxing. We do not accept returns for change of mind.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                    <Truck size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mb-2">Shipping Cost by Purchaser</h3>
                  <p className="text-xs text-brand-gray leading-relaxed font-medium">
                    All return shipping and courier dispatch costs <strong className="text-brand-dark">must be borne entirely by the purchaser</strong> (customer). Initial delivery fees are non-refundable.
                  </p>
                </div>
              </div>

              {/* Policy Details */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-black/5 space-y-10">
                {/* Section 1 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">1</span>
                    Eligibility & Conditions for Claims
                  </h2>
                  <ul className="space-y-3 text-sm text-brand-gray leading-relaxed pl-2 font-medium">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Faulty or Damaged Product:</strong> Claims are strictly limited to items that arrive broken, malfunctioning, or damaged during transit.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span><strong>3-Day Deadline:</strong> You must notify KCC Customer Support on WhatsApp within <strong>3 calendar days</strong> from the date of parcel delivery.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Original Box & Accessories:</strong> The returned item must be shipped back with its original packaging, cables, manuals, and accessories intact.</span>
                    </li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">2</span>
                    Shipping Cost Responsibility
                  </h2>
                  <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl mb-4">
                    <p className="text-xs md:text-sm text-amber-900 font-bold leading-relaxed">
                      ⚠️ Return Shipping Policy: All shipping and courier expenses for sending the faulty item back to our store will be borne by the purchaser. KCC Online Shop does not pay for or reimburse return postage charges.
                    </p>
                  </div>
                  <ul className="space-y-3 text-sm text-brand-gray leading-relaxed pl-2 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span>The customer must send the approved return item back using a reputable courier service with tracking details provided to our support team.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span>Initial delivery fees charged on the original order are non-refundable.</span>
                    </li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">3</span>
                    How to File a Return Claim
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-brand-light/50 rounded-2xl border border-black/5">
                      <div className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-1">Step 1: Capture Proof</div>
                      <p className="text-xs text-brand-gray leading-relaxed font-medium">Take clear photos or a short video showing the fault/damage on the unboxed item.</p>
                    </div>
                    <div className="p-4 bg-brand-light/50 rounded-2xl border border-black/5">
                      <div className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-1">Step 2: WhatsApp Support</div>
                      <p className="text-xs text-brand-gray leading-relaxed font-medium">Send your order details and proof to <strong>+92 329 5147517</strong> within 3 days of delivery.</p>
                    </div>
                    <div className="p-4 bg-brand-light/50 rounded-2xl border border-black/5">
                      <div className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-1">Step 3: Ship Item Back</div>
                      <p className="text-xs text-brand-gray leading-relaxed font-medium">Once approved, dispatch the parcel back via courier to our store address (at purchaser expense).</p>
                    </div>
                    <div className="p-4 bg-brand-light/50 rounded-2xl border border-black/5">
                      <div className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-1">Step 4: Replacement or Refund</div>
                      <p className="text-xs text-brand-gray leading-relaxed font-medium">After inspecting the returned item, a fresh replacement unit or refund will be issued.</p>
                    </div>
                  </div>
                </div>

                {/* Section 4 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">4</span>
                    Non-Claimable Situations
                  </h2>
                  <ul className="space-y-2 text-xs md:text-sm text-brand-gray leading-relaxed pl-2 font-medium">
                    <li className="flex items-center gap-2 text-red-600/80 font-bold">
                      <X size={16} className="flex-shrink-0" /> Claims filed after the 3-day post-delivery limit.
                    </li>
                    <li className="flex items-center gap-2 text-red-600/80 font-bold">
                      <X size={16} className="flex-shrink-0" /> Items damaged due to improper handling, voltage fluctuations, or physical abuse after delivery.
                    </li>
                    <li className="flex items-center gap-2 text-red-600/80 font-bold">
                      <X size={16} className="flex-shrink-0" /> Missing original box, packing, or missing component accessories.
                    </li>
                    <li className="flex items-center gap-2 text-red-600/80 font-bold">
                      <X size={16} className="flex-shrink-0" /> Change of mind or incorrect item selected by customer.
                    </li>
                  </ul>
                </div>

                {/* Support Contact Box */}
                <div className="bg-brand-dark text-white p-8 rounded-3xl text-center flex flex-col items-center">
                  <RotateCcw size={36} className="text-brand-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">Need Assistance with a Claim?</h3>
                  <p className="text-xs md:text-sm opacity-80 max-w-md mb-6 leading-relaxed">
                    Our team is here to assist with any genuine product fault or damage issue reported within 3 days.
                  </p>
                  <a 
                    href={`https://wa.me/923295147517?text=${encodeURIComponent("Hi KCC! I have a return claim query regarding a faulty or damaged product.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-3.5 px-8 text-sm"
                  >
                    Contact WhatsApp Support (+92 329 5147517)
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : currentPage === 'shipping-policy' ? (
          /* Shipping Policy Page */
          <ShippingPolicyPage />
        ) : currentPage === 'privacy-policy' ? (
          /* Privacy Policy Page */
          <div className="section-padding min-h-screen bg-brand-light/30">
            <div className="container-custom max-w-5xl">
              {/* Header Banner */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-black/5 mb-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    <Lock size={16} /> Safe & Confidential Shopping
                  </div>
                  <h1 className="text-3xl md:text-5xl font-display font-black text-brand-dark mb-4">
                    Privacy & Data Policy
                  </h1>
                  <p className="text-brand-gray max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
                    At KCC Online Wholesale Shop, we treat your personal information with absolute confidentiality and care. Learn how we handle your data for orders and customer service.
                  </p>
                </div>
              </div>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mb-2">No Third-Party Sharing</h3>
                  <p className="text-xs text-brand-gray leading-relaxed font-medium">
                    Your phone number, delivery address, and personal name are strictly used for order dispatch and <strong className="text-brand-dark">never sold or rented</strong> to external advertisers.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                    <Lock size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mb-2">Zero Payment Credentials</h3>
                  <p className="text-xs text-brand-gray leading-relaxed font-medium">
                    We process orders via <strong className="text-brand-dark">Cash on Delivery (COD) & WhatsApp verification</strong>. We never store credit cards or sensitive financial details.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                    <Eye size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mb-2">Transparent Tracking</h3>
                  <p className="text-xs text-brand-gray leading-relaxed font-medium">
                    We use standard Google Analytics (gtag.js) to understand website performance and improve user experience on our online catalog.
                  </p>
                </div>
              </div>

              {/* Policy Content */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-black/5 space-y-10">
                {/* Section 1 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">1</span>
                    Information We Collect
                  </h2>
                  <p className="text-sm text-brand-gray leading-relaxed font-medium mb-3">
                    When you browse our catalog or place an order via WhatsApp or Cash on Delivery, we collect minimal personal details necessary to fulfill your purchases:
                  </p>
                  <ul className="space-y-2 text-sm text-brand-gray leading-relaxed pl-2 font-medium">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Contact Details:</strong> Your name, active mobile/WhatsApp phone number, and city/complete delivery address.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Order Items:</strong> Product IDs, selected quantities, chosen delivery method (Courier dispatch or Store pickup).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Technical Usage Data:</strong> Standard browser telemetry, device type, and page interactions analyzed via Google Tag (G-JP23B7THNS).</span>
                    </li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">2</span>
                    How We Use Your Information
                  </h2>
                  <p className="text-sm text-brand-gray leading-relaxed font-medium mb-3">
                    Your information is utilized solely for legitimate commerce operations:
                  </p>
                  <ul className="space-y-2 text-sm text-brand-gray leading-relaxed pl-2 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span>Processing and confirming your wholesale orders via WhatsApp or phone call.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span>Handing over parcel shipping labels to authorized domestic courier services for door-to-door delivery.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span>Assisting you with 3-day damage/fault return claims and customer care inquiries.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span>Optimizing website layout and loading speeds based on general traffic metrics.</span>
                    </li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">3</span>
                    Data Sharing & Third-Party Services
                  </h2>
                  <p className="text-sm text-brand-gray leading-relaxed font-medium mb-3">
                    We value your trust and maintain strict privacy boundaries:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-brand-light/50 rounded-2xl border border-black/5">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">Logistics Partners</div>
                      <p className="text-xs text-brand-gray leading-relaxed font-medium">We share recipient name, contact number, and delivery address with courier providers solely to deliver your package.</p>
                    </div>
                    <div className="p-4 bg-brand-light/50 rounded-2xl border border-black/5">
                      <div className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-1">Google Tag Analytics</div>
                      <p className="text-xs text-brand-gray leading-relaxed font-medium">We integrate Google Tag (gtag.js) for anonymous web statistics. No personal identity files are passed to Google.</p>
                    </div>
                  </div>
                </div>

                {/* Section 4 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">4</span>
                    Your Data Rights & Inquiries
                  </h2>
                  <p className="text-sm text-brand-gray leading-relaxed font-medium">
                    You have full right to request deletion or modification of your contact history from our customer register at any time. Simply contact KCC Online Shop support on WhatsApp (+92 329 5147517) and we will honor your request promptly.
                  </p>
                </div>

                {/* Support Box */}
                <div className="bg-brand-dark text-white p-8 rounded-3xl text-center flex flex-col items-center">
                  <Lock size={36} className="text-emerald-400 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Have Questions About Your Privacy?</h3>
                  <p className="text-xs md:text-sm opacity-80 max-w-md mb-6 leading-relaxed">
                    Our team is available on WhatsApp to answer any privacy or order data inquiries.
                  </p>
                  <a 
                    href={`https://wa.me/923295147517?text=${encodeURIComponent("Hi KCC! I have a question regarding your privacy policy.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-3.5 px-8 text-sm"
                  >
                    Ask Support on WhatsApp (+92 329 5147517)
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Terms & Conditions Page */
          <div className="section-padding min-h-screen bg-brand-light/30">
            <div className="container-custom max-w-5xl">
              {/* Header Banner */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-black/5 mb-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    <FileText size={16} /> Official Store Policy
                  </div>
                  <h1 className="text-3xl md:text-5xl font-display font-black text-brand-dark mb-4">
                    Terms & Conditions
                  </h1>
                  <p className="text-brand-gray max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
                    Welcome to KCC Online Wholesale Shop. By placing an order or using our online store catalog, you agree to comply with the terms and conditions outlined below.
                  </p>
                </div>
              </div>

              {/* Terms Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mb-2">WhatsApp Order Confirmation</h3>
                  <p className="text-xs text-brand-gray leading-relaxed font-medium">
                    Orders placed on our site are verified via WhatsApp call/message before courier dispatch to ensure correct items and complete delivery addresses.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                    <Truck size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mb-2">Nationwide COD Delivery</h3>
                  <p className="text-xs text-brand-gray leading-relaxed font-medium">
                    We offer Cash on Delivery (COD) across Pakistan. Delivery typically takes 3 to 5 business days depending on city location.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mb-2">3-Day Return Claim Rule</h3>
                  <p className="text-xs text-brand-gray leading-relaxed font-medium">
                    Return claims are valid strictly for faulty/damaged products within 3 days of delivery. Return courier charges are borne by the purchaser.
                  </p>
                </div>
              </div>

              {/* Detailed Articles */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-black/5 space-y-10">
                {/* Article 1 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">1</span>
                    Order Acceptance & Pricing
                  </h2>
                  <ul className="space-y-3 text-sm text-brand-gray leading-relaxed pl-2 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Product Pricing:</strong> All prices are displayed in Pakistani Rupees (Rs. / PKR). Prices and quantity discounts are subject to change based on stock availability and wholesale rates.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Stock Availability:</strong> In the rare event an item is out of stock after order submission, our team will inform you via WhatsApp prior to dispatch.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Wholesale & Quantity Discounts:</strong> Quantity-based tier discounts apply automatically as listed on individual product cards.</span>
                    </li>
                  </ul>
                </div>

                {/* Article 2 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">2</span>
                    Shipping & Handover Protocol
                  </h2>
                  <ul className="space-y-3 text-sm text-brand-gray leading-relaxed pl-2 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Dispatch Time:</strong> Confirmed orders are processed and handed over to third-party courier services within 24 to 48 hours.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Recipient Responsibilities:</strong> The customer must ensure an accurate address and active contact number for courier rider calls.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Refusal at Doorstep:</strong> Repeated unconfirmed order refusals upon courier delivery may lead to account blacklisting for future Cash on Delivery orders.</span>
                    </li>
                  </ul>
                </div>

                {/* Article 3 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">3</span>
                    Returns, Damages & Customer Duties
                  </h2>
                  <ul className="space-y-3 text-sm text-brand-gray leading-relaxed pl-2 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>3-Day Defect Window:</strong> Return claims must be initiated on WhatsApp (+92 329 5147517) within 3 calendar days of parcel delivery.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Return Shipping Expense:</strong> Shipping costs for dispatching items back to KCC Shop are to be paid entirely by the customer (purchaser).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Scope of Claim:</strong> Returns are honored solely for defective or transit-damaged goods. Change-of-mind returns are not permitted.</span>
                    </li>
                  </ul>
                </div>

                {/* Article 4 */}
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">4</span>
                    Limitation of Liability & Store Conduct
                  </h2>
                  <p className="text-sm text-brand-gray leading-relaxed font-medium">
                    KCC Online Shop is committed to quality assurance and fair trade practices. We reserve the right to decline or cancel orders deemed suspicious or fraudulent. For bulk wholesale trade inquiries, customized store terms can be arranged via official WhatsApp support.
                  </p>
                </div>

                {/* Support Box */}
                <div className="bg-brand-dark text-white p-8 rounded-3xl text-center flex flex-col items-center">
                  <FileText size={36} className="text-brand-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">Questions Regarding Store Terms?</h3>
                  <p className="text-xs md:text-sm opacity-80 max-w-md mb-6 leading-relaxed">
                    Our customer support team is available on WhatsApp to assist with order terms, bulk deals, or store inquiries.
                  </p>
                  <a 
                    href={`https://wa.me/923295147517?text=${encodeURIComponent("Hi KCC! I have a question regarding your store Terms & Conditions.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-3.5 px-8 text-sm"
                  >
                    Contact KCC Support on WhatsApp (+92 329 5147517)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full max-w-md bg-white z-[80] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-brand-light">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary p-2 rounded-lg text-white">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-black text-brand-dark">Your Cart</h2>
                    <p className="text-xs font-bold text-brand-gray uppercase tracking-widest">{cartItemCount} Items</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-primary/10 text-brand-dark transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6">
                {cart.length > 0 ? (
                  <div className="flex flex-col gap-5">
                    {cart.map((item) => {
                      const isHighlighted = lastUpdatedItemId === item.product.id;
                      return (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            backgroundColor: isHighlighted ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0)'
                          }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={item.product.id} 
                          className={`flex gap-4 p-3 rounded-2xl border transition-all duration-300 group ${
                            isHighlighted 
                              ? 'border-brand-primary/30 shadow-md ring-2 ring-brand-primary/10' 
                              : 'border-black/5 hover:border-black/10 hover:bg-brand-light/35'
                          }`}
                        >
                          <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-brand-light border border-black/5 flex-shrink-0 relative">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                            {isHighlighted && (
                              <div className="absolute inset-0 bg-brand-primary/10 backdrop-blur-[0.5px] flex items-center justify-center">
                                <span className="bg-brand-primary text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-md animate-bounce">
                                  Updated
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col flex-grow min-w-0">
                            <h4 className="font-bold text-brand-dark line-clamp-1 text-sm md:text-base">{item.product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-brand-primary font-display font-black text-sm">Rs.{item.product.price}</p>
                              <span className="text-[10px] text-brand-gray font-semibold px-1.5 py-0.5 bg-brand-light rounded-md">
                                {item.product.weight}g
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-auto pt-2">
                              <div className="flex items-center bg-brand-light rounded-lg p-1 border text-xs">
                                <button 
                                  onClick={() => updateCartQuantity(item.product.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors font-bold text-sm focus:outline-none"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-bold font-mono text-xs">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQuantity(item.product.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors font-bold text-sm focus:outline-none"
                                >
                                  +
                                </button>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-brand-gray font-bold font-mono">
                                  Rs.{item.product.price * item.quantity}
                                </span>
                                <button 
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                                  title="Remove Item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-12">
                    <div className="bg-brand-light w-24 h-24 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag size={40} className="text-brand-gray" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Cart is empty</h3>
                    <p className="text-sm text-brand-gray">Start adding some amazing products to your cart!</p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t bg-brand-light rounded-t-[2.5rem] shadow-xl">
                  {/* Shipping Method Selector */}
                  <div className="px-1 py-1 bg-brand-dark/[0.04] rounded-xl flex gap-1 border border-black/5 mb-4">
                    <button
                      onClick={() => setShippingMethod('delivery')}
                      className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all focus:outline-none ${
                        shippingMethod === 'delivery' 
                          ? 'bg-white text-brand-dark shadow-sm scale-[1.02] border-black/5 border' 
                          : 'text-brand-gray hover:text-brand-dark'
                      }`}
                    >
                      <Truck size={14} className={shippingMethod === 'delivery' ? 'text-brand-primary animate-pulse' : 'text-brand-gray'} /> Home Delivery
                    </button>
                    <button
                      onClick={() => setShippingMethod('pickup')}
                      className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all focus:outline-none ${
                        shippingMethod === 'pickup' 
                          ? 'bg-white text-brand-dark shadow-sm scale-[1.02] border-black/5 border' 
                          : 'text-brand-gray hover:text-brand-dark'
                      }`}
                    >
                      <MapPin size={14} className={shippingMethod === 'pickup' ? 'text-brand-secondary' : 'text-brand-gray'} /> Self Pickup
                    </button>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="flex flex-col gap-2.5 mb-5 bg-white p-4 rounded-2xl border border-black/[0.04] shadow-sm">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center text-brand-gray text-[11px] font-bold uppercase tracking-wider">
                      <span>Items Subtotal</span>
                      <span className="text-brand-dark font-mono font-bold">Rs.{cartTotal}</span>
                    </div>

                    {/* Total Weight */}
                    <div className="flex justify-between items-center text-brand-gray text-[11px] font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">Total Weight</span>
                      <span className="text-brand-dark font-mono font-bold">
                        {cartTotalWeight >= 1000 ? `${(cartTotalWeight / 1000).toFixed(2)} kg` : `${cartTotalWeight} g`}
                      </span>
                    </div>

                    {/* Delivery Rate */}
                    <div className="flex justify-between items-start text-brand-gray text-[11px] font-bold uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span>Delivery Rate</span>
                        {shippingMethod === 'delivery' && (
                          <span className="text-[9px] text-brand-gray/60 font-medium normal-case tracking-normal">
                            {cartTotalWeight <= 500 
                              ? 'Within 500g (Rs. 250 fee)' 
                              : cartTotalWeight <= 1000 
                                ? 'Within 1kg (Rs. 400 fee)' 
                                : 'Bulk packaging rates apply'}
                          </span>
                        )}
                        {shippingMethod === 'pickup' && (
                          <span className="text-[9px] text-brand-secondary/80 font-bold normal-case tracking-normal">
                            Collect at KCC Store / Islamabad Branch
                          </span>
                        )}
                      </div>
                      <span className={`font-mono font-bold ${shippingMethod === 'pickup' ? 'text-emerald-600' : 'text-brand-dark'}`}>
                        {shippingMethod === 'pickup' ? 'Rs.0 (Free)' : `Rs.${deliveryCharge}`}
                      </span>
                    </div>

                    <div className="h-px bg-black/5 my-1"></div>

                    {/* Total Pay */}
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-brand-dark font-display font-black text-sm uppercase tracking-wider">Total Amount</span>
                        <span className="text-[10px] text-brand-gray font-medium">Wholesale Prices Apply</span>
                      </div>
                      <motion.span 
                        key={shippingMethod === 'pickup' ? cartTotal : cartGrandTotal}
                        initial={{ scale: 0.9, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-brand-primary font-display font-black text-xl font-mono"
                      >
                        Rs.{shippingMethod === 'pickup' ? cartTotal : cartGrandTotal}
                      </motion.span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutModalOpen(true);
                      }}
                      className="btn-primary w-full h-14 justify-center text-base shadow-xl shadow-brand-primary/20 gap-3"
                    >
                      Proceed to Checkout <ArrowRight size={18} />
                    </button>
                    <a 
                      href={generateCartOrderLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200/60 flex items-center justify-center gap-1.5"
                    >
                      <span>Direct Order via WhatsApp</span>
                    </a>
                  </div>
                  <p className="text-[9px] text-center mt-3 font-bold text-brand-gray uppercase tracking-widest leading-relaxed">
                    Headless Commerce Integrated • Standard Wholesale Rates Apply
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Interactive Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 15 }}
            style={{ originY: 1 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[99] max-w-sm w-full mx-auto md:mx-0"
          >
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-brand-dark border-emerald-500/25 text-white shadow-emerald-500/5' 
                : toast.type === 'remove'
                  ? 'bg-brand-dark border-red-500/25 text-white shadow-red-500/5'
                  : 'bg-brand-dark border-brand-primary/25 text-white shadow-brand-primary/5'
            }`}>
              <div className="flex-shrink-0 bg-white/10 p-2 rounded-xl">
                {toast.type === 'success' ? (
                  <CheckCircle size={18} className="text-emerald-400" />
                ) : toast.type === 'remove' ? (
                  <X size={18} className="text-red-400 font-black" />
                ) : (
                  <Info size={18} className="text-brand-primary" />
                )}
              </div>
              <p className="font-semibold text-xs flex-grow pr-2">{toast.message}</p>
              <button 
                onClick={() => setToast(null)}
                className="text-white/40 hover:text-white transition-colors focus:outline-none"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flying Cart Items Animation */}
      {flyingItems.map(item => (
        <motion.img
          key={item.id}
          src={item.image}
          initial={{ 
            opacity: 1, 
            scale: 0.5, 
            x: item.startX - 30, // center 60x60 image
            y: item.startY - 30, 
            position: 'fixed' as const, 
            top: 0, 
            left: 0, 
            zIndex: 9999 
          }}
          animate={{ 
            opacity: 0, 
            scale: 0.1, 
            x: window.innerWidth - (window.innerWidth < 768 ? 60 : 80), // Approx cart icon position
            y: 20 
          }}
          transition={{ duration: 0.7, type: 'tween', ease: 'easeInOut' }}
          className="rounded-full shadow-2xl pointer-events-none object-cover border-2 border-brand-primary bg-white"
          style={{ width: '60px', height: '60px' }}
        />
      ))}

      {/* Lightbox / Gallery */}
      <AnimatePresence>
        {selectedProductForGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
          >
            <button 
              onClick={() => setSelectedProductForGallery(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
            >
              <X size={40} strokeWidth={1} />
            </button>

            <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
              {getProductMedia(selectedProductForGallery).length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-0 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-4 rounded-full transition-all z-[110]"
                  >
                    <ChevronRight className="rotate-180" size={32} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-0 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-4 rounded-full transition-all z-[110]"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}

              <motion.div 
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full h-full flex items-center justify-center"
              >
                {getProductMedia(selectedProductForGallery)[currentImageIndex]?.type === 'video' ? (
                  <video 
                    src={getProductMedia(selectedProductForGallery)[currentImageIndex].url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                  />
                ) : (
                  <img 
                    src={getProductMedia(selectedProductForGallery)[currentImageIndex]?.url} 
                    alt={selectedProductForGallery.name} 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                )}
              </motion.div>
              
              <div className="absolute -bottom-28 md:-bottom-24 left-0 right-0 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white text-lg md:text-xl font-display font-bold">{selectedProductForGallery.name}</h3>
                  <span className="text-brand-secondary text-base md:text-lg font-mono font-extrabold bg-white/10 px-3 py-0.5 rounded-full backdrop-blur-md">
                    Rs.{selectedProductForGallery.price}
                  </span>
                </div>
                
                <div className="flex justify-center gap-2 mb-3">
                  {getProductMedia(selectedProductForGallery).map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-8 bg-brand-primary' : 'w-2 bg-white/20'}`}
                    />
                  ))}
                </div>

                <div className="bg-white/10 backdrop-blur-md p-2 md:px-5 md:py-2.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 flex-wrap justify-center">
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out ${selectedProductForGallery.name} (Rs.${selectedProductForGallery.price}) at KCC Wholesale Shop! ${window.location.origin}${window.location.pathname}?product=${selectedProductForGallery.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
                    title="Share product link via WhatsApp"
                  >
                    <MessageCircle size={16} className="fill-current stroke-none" />
                    <span>Share via WhatsApp</span>
                  </a>

                  <button 
                    onClick={(e) => addToCart(selectedProductForGallery, 1, e)}
                    className="bg-brand-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>

                  <div className="h-4 w-px bg-white/20 hidden sm:block"></div>

                  <ShareButtons product={selectedProductForGallery} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 flex flex-col gap-3 md:gap-4 max-h-[calc(100vh-2rem)] overflow-visible pb-[env(safe-area-inset-bottom,0px)] pr-[env(safe-area-inset-right,0px)] pointer-events-auto">
        <a 
          href={`tel:${activeWhatsappNumber}`}
          className="bg-white text-brand-primary w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform ring-4 ring-brand-primary/5 active:scale-95 shrink-0"
          title="Call Us"
        >
          <Phone size={20} className="md:w-6 md:h-6" />
        </a>
        <a 
          href={activeWhatsappLink}
          className="bg-green-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center hover:rotate-12 transition-all p-2.5 md:p-3 active:scale-95 shrink-0"
          title="WhatsApp Chat"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.411 0 .01 5.399.007 12.039c0 2.122.554 4.197 1.606 6.048L0 24l6.117-1.605a11.802 11.802 0 005.925 1.585h.005c6.637 0 12.038-5.402 12.042-12.042a11.82 11.82 0 00-3.48-8.513z" />
          </svg>
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t pt-20 pb-8 overflow-hidden">
        <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-sm border border-black/5 p-2">
                <img 
                  src={logoFooterUrl} 
                  alt="KCC Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display font-bold text-2xl tracking-tighter">KCC <span className="text-brand-primary text-sm block uppercase tracking-[0.2em] font-black opacity-80">Online Shop</span></span>
              </div>
            </div>
            <p className="text-brand-gray text-sm mb-8 leading-relaxed">
              Your one-stop shop for high-quality home improvement tools, kitchen gadgets, and innovative products.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors"><Instagram size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-brand-dark">Shop Pages</h4>
            <ul className="flex flex-col gap-4 text-brand-gray font-medium">
              <li><button onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-brand-primary">Home</button></li>
              <li><button onClick={() => { setCurrentPage('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-brand-primary">All Products</button></li>
              <li><button onClick={() => { setCurrentPage('return-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-brand-primary">Return & Refund Policy</button></li>
              <li><button onClick={() => { setCurrentPage('shipping-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-brand-primary">Shipping Policy</button></li>
              <li><button onClick={() => { setCurrentPage('privacy-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-brand-primary">Privacy Policy</button></li>
              <li><button onClick={() => { setCurrentPage('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-brand-primary">Terms & Conditions</button></li>
              <li><button onClick={() => { setCurrentPage('home'); setTimeout(() => document.getElementById('deals')?.scrollIntoView(), 100); }} className="hover:text-brand-primary">Hot Deals</button></li>
              <li><button onClick={() => { setCurrentPage('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView(), 100); }} className="hover:text-brand-primary">About Us</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-brand-dark">Categories</h4>
            <ul className="flex flex-col gap-4 text-brand-gray font-medium">
              <li><button onClick={() => { setCurrentPage('products'); setSelectedCategory('Home Improvement'); }} className="hover:text-brand-primary">Home Improvement</button></li>
              <li><button onClick={() => { setCurrentPage('products'); setSelectedCategory('Gadgets'); }} className="hover:text-brand-primary">Smart Gadgets</button></li>
              <li><button onClick={() => { setCurrentPage('products'); setSelectedCategory('Kitchen'); }} className="hover:text-brand-primary">Kitchen Essentials</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-brand-dark">Opening Hours</h4>
            <ul className="flex flex-col gap-4 text-brand-gray font-medium">
              <li className="flex justify-between"><span>Mon - Sun</span> <span>10 AM - 10 PM</span></li>
              <li className="text-[10px] uppercase tracking-tighter opacity-50 mt-4">Visit our physical store for in-person shopping</li>
            </ul>
          </div>
        </div>

        <div className="container-custom pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-brand-gray">
          <div className="flex items-center gap-2 flex-wrap">
            <span>&copy; {new Date().getFullYear()} KCC Online Shop. All Rights Reserved.</span>
            {isAdminLoggedIn ? (
              <div className="inline-flex items-center gap-2 ml-2 normal-case">
                <button 
                  onClick={() => { setCurrentPage('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                  className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer bg-brand-primary/10 px-2 py-0.5 rounded-md border border-brand-primary/20"
                >
                  Admin Panel
                </button>
                <button 
                  onClick={handleAdminLogout} 
                  className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="text-[10px] text-brand-gray/30 hover:text-brand-gray/80 transition-opacity font-normal cursor-pointer ml-1 normal-case"
                title="Store Management Login"
              >
                • Admin
              </button>
            )}
          </div>
          <div className="flex gap-8 flex-wrap">
            <button onClick={() => { setCurrentPage('return-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer hover:text-brand-primary">Return Policy</button>
            <button onClick={() => { setCurrentPage('shipping-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer hover:text-brand-primary">Shipping Policy</button>
            <button onClick={() => { setCurrentPage('privacy-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer hover:text-brand-primary">Privacy Policy</button>
            <button onClick={() => { setCurrentPage('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer hover:text-brand-primary">Terms & Conditions</button>
          </div>
        </div>
      </footer>

      {/* Admin Edit / Upload Product Modal */}
      {(isAdminLoggedIn || isAdminMode) && editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b flex justify-between items-center bg-brand-light/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-brand-dark">
                    {products.some(p => p.id === editingProduct.id) ? 'Edit Product Details' : 'Upload New Store Product'}
                  </h2>
                  <p className="text-[10px] text-brand-gray">Fill out details below to publish changes live to store catalog.</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors border shadow-sm"  
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editingProduct.name.trim()) {
                  showToast("Please enter a valid product name", "remove");
                  return;
                }
                const exists = products.some(p => p.id === editingProduct.id);
                if (exists) {
                  setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
                  showToast(`Updated "${editingProduct.name}"`, "success");
                } else {
                  setProducts([editingProduct, ...products]);
                  showToast(`Successfully uploaded "${editingProduct.name}"`, "success");
                }
                setEditingProduct(null);
              }} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-gray mb-1">Product Title / Name</label>
                  <input 
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    placeholder="e.g. Smart Wireless Air Pump"
                    className="w-full border border-black/10 rounded-xl p-3 focus:outline-none focus:border-brand-primary transition-colors text-sm font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-gray mb-1">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value as any})}
                      className="w-full border border-black/10 rounded-xl p-3 focus:outline-none focus:border-brand-primary transition-colors text-sm font-semibold bg-white cursor-pointer"
                    >
                      <option value="Home Improvement">Home Improvement</option>
                      <option value="Gadgets">Gadgets</option>
                      <option value="Kitchen">Kitchen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-gray mb-1">Star Rating (1 - 5)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="1"
                      max="5"
                      value={editingProduct.rating}
                      onChange={(e) => setEditingProduct({...editingProduct, rating: Number(e.target.value)})}
                      className="w-full border border-black/10 rounded-xl p-3 focus:outline-none focus:border-brand-primary transition-colors text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Product Images Section */}
                <div className="bg-brand-light/40 rounded-2xl p-4 border border-black/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b pb-2 mb-1 border-black/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-dark block">Product Media</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <Zap size={11} className="text-emerald-600 fill-emerald-600" /> Auto-Compression Active (Max 1200px WebP/JPEG)
                    </span>
                  </div>
                  
                  {/* Current Main Cover Preview */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-black/10 flex-shrink-0 flex items-center justify-center relative shadow-inner">
                      {editingProduct.image ? (
                        <img src={editingProduct.image} alt="Cover Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-brand-gray/50 text-xs">No image</span>
                      )}
                    </div>
                    <div className="flex-grow w-full flex flex-col gap-2">
                      <span className="text-xs font-bold text-brand-gray uppercase tracking-wider">Main Cover Image</span>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-brand-primary hover:bg-brand-secondary text-white text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                          <Upload size={14} />
                          Upload File
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                showToast("Auto-compressing product image...", "info");
                                try {
                                  const res = await compressAndResizeImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });
                                  setEditingProduct({...editingProduct, image: res.dataUrl});
                                  showToast(`⚡ Compressed cover image! ${formatBytes(res.originalSizeBytes)} → ${formatBytes(res.compressedSizeBytes)} (-${res.savingsPercentage}%)`, "success");
                                } catch {
                                  showToast("Failed to compress image file.", "remove");
                                }
                              }
                            }}
                          />
                        </label>
                        <span className="text-xs text-brand-gray">or paste URL below</span>
                      </div>
                      <input 
                        type="text" 
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                        className="w-full border border-black/10 bg-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-primary transition-colors font-mono"
                        placeholder="Image URL https://..."
                        required
                      />
                    </div>
                  </div>

                  {/* Secondary Gallery management */}
                  <div className="mt-2 border-t pt-4 border-black/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-brand-gray uppercase tracking-wider">Gallery Images ({(editingProduct.images || []).length})</span>
                    </div>

                    {/* Thumbnails of gallery */}
                    <div className="flex flex-wrap gap-2.5 mb-3">
                      {(editingProduct.images || []).map((imgUrl, index) => (
                        <div key={index} className="relative group/thumb w-14 h-14 rounded-xl overflow-hidden bg-white border border-black/10 flex-shrink-0 shadow-sm">
                          <img src={imgUrl} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = (editingProduct.images || []).filter((_, i) => i !== index);
                              setEditingProduct({...editingProduct, images: newImages});
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-all scale-75"
                            title="Remove image"
                          >
                            <X size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const oMain = editingProduct.image;
                              const oImages = [...(editingProduct.images || [])];
                              oImages[index] = oMain;
                              setEditingProduct({
                                ...editingProduct,
                                image: imgUrl,
                                images: oImages
                              });
                            }}
                            className="absolute bottom-0 inset-x-0 bg-brand-dark/85 hover:bg-brand-primary text-[8px] text-white py-0.5 text-center font-bold uppercase tracking-wider opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                          >
                            Use Cover
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add gallery image controllers */}
                    <div className="flex gap-2 items-center">
                      <label className="cursor-pointer bg-white hover:bg-black/5 text-brand-dark text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0 border border-black/10 shadow-sm">
                        <Plus size={14} />
                        Add Files
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          className="hidden" 
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              showToast(`Auto-compressing ${files.length} gallery image(s)...`, "info");
                              try {
                                const results = await Promise.all(files.map((file: File) => compressAndResizeImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 })));
                                const list = editingProduct.images || [];
                                const compressedUrls = results.map(r => r.dataUrl);
                                setEditingProduct({
                                  ...editingProduct,
                                  images: [...list, ...compressedUrls]
                                });
                                const totalOriginal = results.reduce((acc, r) => acc + r.originalSizeBytes, 0);
                                const totalCompressed = results.reduce((acc, r) => acc + r.compressedSizeBytes, 0);
                                const savedBytes = totalOriginal - totalCompressed;
                                showToast(`⚡ Compressed ${files.length} gallery image(s)! Saved ${formatBytes(savedBytes)}`, "success");
                              } catch {
                                showToast("Failed to compress gallery image files.", "remove");
                              }
                            }
                          }}
                        />
                      </label>
                      <input 
                        type="text" 
                        placeholder="... or paste URL and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              const list = editingProduct.images || [];
                              setEditingProduct({
                                ...editingProduct,
                                images: [...list, val]
                              });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        className="flex-grow border border-black/10 bg-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-primary transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Video Section */}
                  <div className="mt-2 border-t pt-4 border-black/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-brand-gray uppercase tracking-wider">Product Demonstration Video</span>
                    </div>
                    {editingProduct.video && (
                      <div className="relative group/thumb w-32 h-20 mb-3 rounded-xl overflow-hidden bg-black border border-black/10 flex-shrink-0 shadow-sm">
                        <video src={editingProduct.video} className="w-full h-full object-cover" controls />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({...editingProduct, video: undefined});
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-all scale-75 z-10"
                          title="Remove video"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <label className="cursor-pointer bg-white hover:bg-black/5 text-brand-dark text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0 border border-black/10 shadow-sm">
                        <Plus size={14} />
                        Upload Video
                        <input 
                          type="file" 
                          accept="video/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingProduct({
                                  ...editingProduct,
                                  video: reader.result as string
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <input 
                        type="text" 
                        value={editingProduct.video || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, video: e.target.value})}
                        placeholder="... or paste Video URL"
                        className="flex-grow border border-black/10 bg-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-primary transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-gray mb-1">Description</label>
                  <textarea 
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows={4}
                    placeholder="Provide full details about this store item..."
                    className="w-full border border-black/10 rounded-xl p-3 focus:outline-none focus:border-brand-primary transition-colors resize-none text-sm leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-gray mb-1">Price (Rs.)</label>
                    <input 
                      type="number" 
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      className="w-full border border-black/10 rounded-xl p-3 focus:outline-none focus:border-brand-primary transition-colors text-sm font-semibold"
                      min={0}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-gray mb-1">Weight (grams)</label>
                    <input 
                      type="number" 
                      value={editingProduct.weight || 0}
                      onChange={(e) => setEditingProduct({...editingProduct, weight: Number(e.target.value)})}
                      className="w-full border border-black/10 rounded-xl p-3 focus:outline-none focus:border-brand-primary transition-colors text-sm font-semibold"
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-gray mb-1">Discount Note / Promo Tag (Optional)</label>
                  <input 
                    type="text" 
                    value={editingProduct.discountNote || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, discountNote: e.target.value})}
                    className="w-full border border-black/10 rounded-xl p-3 focus:outline-none focus:border-brand-primary transition-colors text-sm"
                    placeholder="e.g. Discount On Quantity / Hot Wholesale Offer"
                  />
                </div>

                <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <input 
                    type="checkbox"
                    id="isTopSeller"
                    checked={!!editingProduct.isTopSeller}
                    onChange={(e) => setEditingProduct({...editingProduct, isTopSeller: e.target.checked})}
                    className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary cursor-pointer"
                  />
                  <label htmlFor="isTopSeller" className="text-xs font-bold text-amber-900 cursor-pointer">
                    Feature in "Top Sellers" homepage showcase section
                  </label>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end gap-3 pb-2">
                  <button type="button" onClick={() => setEditingProduct(null)} className="px-5 py-2.5 rounded-xl text-brand-gray text-xs font-bold uppercase tracking-wider hover:bg-black/5 transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-secondary transition-colors shadow-sm">
                    {products.some(p => p.id === editingProduct.id) ? 'Save Product Changes' : 'Publish New Product'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-black/10"
          >
            <div className="p-6 md:p-8 bg-brand-dark text-white relative flex flex-col items-center text-center">
              <button 
                onClick={() => { setShowLoginModal(false); setLoginError(null); }}
                className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/20 text-brand-primary border border-brand-primary/30 flex items-center justify-center mb-4 shadow-inner">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-display font-bold">Admin Portal Login</h2>
              <p className="text-xs text-white/70 mt-1 max-w-xs">
                Log in to edit products, update prices, or upload new inventory items.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="p-6 md:p-8 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" size={18} />
                  <input 
                    type="text" 
                    value={adminUsernameInput}
                    onChange={(e) => setAdminUsernameInput(e.target.value)}
                    placeholder="Enter admin username" 
                    className="w-full bg-brand-light border border-black/10 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-gray mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" size={18} />
                  <input 
                    type="password" 
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter admin password" 
                    className="w-full bg-brand-light border border-black/10 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
                    required
                  />
                </div>
              </div>

              {loginError ? (
                <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              ) : (
                <div className="bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/10 text-[11px] text-brand-gray leading-relaxed flex items-center gap-2">
                  <ShieldCheck size={18} className="text-brand-primary shrink-0" />
                  <span>Authorized store personnel login portal.</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowLoginModal(false); setLoginError(null); }}
                  className="flex-1 py-3 rounded-xl text-brand-gray font-bold text-xs uppercase tracking-wider hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-3 justify-center text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  Sign In
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Admin Edit / Add Deal Modal */}
      {(isAdminLoggedIn || isAdminMode) && editingDeal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b flex justify-between items-center bg-brand-light/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
                  <Tag size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-brand-dark">
                    {deals.some(d => d.id === editingDeal.id) ? 'Edit Promotional Deal' : 'Add New Hot Deal'}
                  </h2>
                  <p className="text-[10px] text-brand-gray">Customize offer title, discount badge, and pricing.</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingDeal(null)}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors border shadow-sm"  
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editingDeal.title.trim()) return;
              const exists = deals.some(d => d.id === editingDeal.id);
              if (exists) {
                setDeals(deals.map(d => d.id === editingDeal.id ? editingDeal : d));
                showToast(`Updated deal "${editingDeal.title}"`, "success");
              } else {
                setDeals([...deals, editingDeal]);
                showToast(`Added deal "${editingDeal.title}"`, "success");
              }
              setEditingDeal(null);
            }} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Deal Title / Bundle Name</label>
                <input 
                  type="text" 
                  value={editingDeal.title}
                  onChange={(e) => setEditingDeal({...editingDeal, title: e.target.value})}
                  placeholder="e.g. Household Mega Saver Pack"
                  className="w-full border border-black/10 rounded-xl p-3 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Discount Tag Badge</label>
                <input 
                  type="text" 
                  value={editingDeal.discount}
                  onChange={(e) => setEditingDeal({...editingDeal, discount: e.target.value})}
                  placeholder="e.g. SAVE 25% OFF"
                  className="w-full border border-black/10 rounded-xl p-3 text-sm font-bold text-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Price Offer Text</label>
                <input 
                  type="text" 
                  value={editingDeal.price}
                  onChange={(e) => setEditingDeal({...editingDeal, price: e.target.value})}
                  placeholder="e.g. Rs. 2,999 (Was Rs. 3,800)"
                  className="w-full border border-black/10 rounded-xl p-3 text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Deal Description / Included Items</label>
                <textarea 
                  rows={3}
                  value={editingDeal.desc}
                  onChange={(e) => setEditingDeal({...editingDeal, desc: e.target.value})}
                  placeholder="Describe items included in this deal..."
                  className="w-full border border-black/10 rounded-xl p-3 text-xs font-medium"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingDeal(null)}
                  className="flex-1 py-3 rounded-xl border text-brand-gray font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-3 text-xs font-bold uppercase"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Admin Edit / Add Testimonial Modal */}
      {(isAdminLoggedIn || isAdminMode) && editingTestimonial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b flex justify-between items-center bg-brand-light/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
                  <Star size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-brand-dark">
                    {testimonials.some(t => t.id === editingTestimonial.id) ? 'Edit Customer Review' : 'Add New Customer Review'}
                  </h2>
                  <p className="text-[10px] text-brand-gray">Customer name, star rating, and review text.</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingTestimonial(null)}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors border shadow-sm"  
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editingTestimonial.name.trim() || !editingTestimonial.review.trim()) return;
              const exists = testimonials.some(t => t.id === editingTestimonial.id);
              if (exists) {
                setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial : t));
                showToast(`Updated review from "${editingTestimonial.name}"`, "success");
              } else {
                setTestimonials([...testimonials, editingTestimonial]);
                showToast(`Added review from "${editingTestimonial.name}"`, "success");
              }
              setEditingTestimonial(null);
            }} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Customer Name</label>
                <input 
                  type="text" 
                  value={editingTestimonial.name}
                  onChange={(e) => setEditingTestimonial({...editingTestimonial, name: e.target.value})}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full border border-black/10 rounded-xl p-3 text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Star Rating (1 - 5)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="5"
                    value={editingTestimonial.rating}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, rating: Number(e.target.value)})}
                    className="w-full border border-black/10 rounded-xl p-3 text-sm font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Location Tag</label>
                  <input 
                    type="text" 
                    value={editingTestimonial.location || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, location: e.target.value})}
                    placeholder="e.g. Lahore / Verified Buyer"
                    className="w-full border border-black/10 rounded-xl p-3 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Review Feedback Text</label>
                <textarea 
                  rows={4}
                  value={editingTestimonial.review}
                  onChange={(e) => setEditingTestimonial({...editingTestimonial, review: e.target.value})}
                  placeholder="Customer feedback..."
                  className="w-full border border-black/10 rounded-xl p-3 text-xs font-medium"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingTestimonial(null)}
                  className="flex-1 py-3 rounded-xl border text-brand-gray font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-3 text-xs font-bold uppercase"
                >
                  Save Review
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Contact Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-black/10"
          >
            <div className="p-6 border-b flex justify-between items-center bg-brand-light/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-primary text-white rounded-xl">
                  <Inbox size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-brand-dark">Contact Submission Details</h3>
                  <p className="text-xs text-brand-gray">Received: {selectedSubmission.createdAt}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors border shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4 bg-brand-light/30 p-4 rounded-2xl border border-black/5 text-xs">
                <div>
                  <span className="font-bold text-brand-gray uppercase text-[10px] block">Customer Name</span>
                  <span className="font-bold text-brand-dark text-sm">{selectedSubmission.name}</span>
                </div>
                <div>
                  <span className="font-bold text-brand-gray uppercase text-[10px] block">Contact Number / Email</span>
                  <span className="font-bold text-brand-primary text-sm font-mono">{selectedSubmission.emailOrPhone}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-brand-gray uppercase text-[10px] block mb-1">Subject / Inquiry</span>
                <p className="font-bold text-brand-dark text-sm bg-white p-3 rounded-xl border border-black/10">{selectedSubmission.subject}</p>
              </div>

              <div>
                <span className="font-bold text-brand-gray uppercase text-[10px] block mb-1">Full Message</span>
                <div className="p-4 bg-brand-light/50 rounded-2xl border border-black/10 text-xs leading-relaxed font-medium text-brand-dark whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Update Message Status</label>
                <div className="flex gap-2">
                  {(['unread', 'read', 'replied'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        const updated = contactSubmissions.map(s => s.id === selectedSubmission.id ? { ...s, status: st } : s);
                        setContactSubmissions(updated);
                        setSelectedSubmission({ ...selectedSubmission, status: st });
                        showToast(`Status updated to ${st}`, "info");
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        selectedSubmission.status === st 
                          ? st === 'unread' ? 'bg-red-500 text-white border-red-500' : st === 'replied' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-brand-gray border-black/10 hover:bg-brand-light'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Private Admin Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Private Admin Notes</label>
                <textarea 
                  rows={2}
                  value={selectedSubmission.notes || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedSubmission({ ...selectedSubmission, notes: val });
                    setContactSubmissions(contactSubmissions.map(s => s.id === selectedSubmission.id ? { ...s, notes: val } : s));
                  }}
                  placeholder="e.g. Quoted Rs. 1,500/pc for 20 units via phone call on 8th Aug"
                  className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              {/* Simulated Courier Tracking Control */}
              <div className="bg-brand-light/70 p-4 rounded-2xl border border-black/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-brand-primary" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-brand-dark">
                      Simulated Order Tracking Number
                    </h4>
                  </div>
                  {selectedSubmission.trackingNumber && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Dispatched
                    </span>
                  )}
                </div>

                {selectedSubmission.trackingNumber ? (
                  <div className="bg-white p-3.5 rounded-xl border border-black/10 space-y-3 shadow-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-brand-gray font-bold uppercase block">Courier Partner</span>
                        <span className="text-xs font-bold text-brand-dark">{selectedSubmission.courierName || 'TCS Express'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-brand-gray font-bold uppercase block">Tracking Number</span>
                        <span className="text-xs font-mono font-bold text-brand-primary bg-brand-light px-2 py-0.5 rounded border border-black/5">
                          {selectedSubmission.trackingNumber}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-brand-gray font-bold uppercase block">Est. Delivery</span>
                        <span className="text-xs font-semibold text-emerald-700">{selectedSubmission.estimatedDeliveryDate || '2-3 Business Days'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${selectedSubmission.courierName || 'Courier'}: ${selectedSubmission.trackingNumber}`);
                          showToast("Tracking number copied to clipboard!", "success");
                        }}
                        className="flex-1 py-2 bg-brand-light hover:bg-gray-200 text-brand-dark rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Copy size={14} /> Copy Tracking #
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const courier = selectedSubmission.courierName || 'TCS Express';
                          const trk = generateSimulatedTrackingNumber(courier);
                          const updatedSub = { ...selectedSubmission, trackingNumber: trk };
                          setSelectedSubmission(updatedSub);
                          setContactSubmissions(contactSubmissions.map(s => s.id === selectedSubmission.id ? updatedSub : s));
                          showToast(`Regenerated ${courier} tracking #${trk}!`, "info");
                        }}
                        className="py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Regenerate new tracking number"
                      >
                        <RefreshCw size={14} /> Regenerate
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const updatedSub = { ...selectedSubmission, trackingNumber: undefined, courierName: undefined };
                          setSelectedSubmission(updatedSub);
                          setContactSubmissions(contactSubmissions.map(s => s.id === selectedSubmission.id ? updatedSub : s));
                          showToast("Tracking number removed.", "info");
                        }}
                        className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Remove tracking number"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-3.5 rounded-xl border border-black/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-brand-gray mb-1">Select Courier Company</label>
                        <select
                          id="modal-courier-select"
                          defaultValue="TCS Express"
                          className="w-full bg-brand-light border border-black/10 rounded-xl p-2.5 text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value="TCS Express">TCS Express</option>
                          <option value="Leopard Courier">Leopard Courier</option>
                          <option value="Trax Logistics">Trax Logistics</option>
                          <option value="PostEx COD">PostEx COD</option>
                          <option value="CallCourier">CallCourier</option>
                          <option value="M&P Courier">M&P Courier</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const selectEl = document.getElementById('modal-courier-select') as HTMLSelectElement;
                            const courier = selectEl ? selectEl.value : 'TCS Express';
                            const trk = generateSimulatedTrackingNumber(courier);
                            const estDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            const updatedSub: ContactSubmission = {
                              ...selectedSubmission,
                              trackingNumber: trk,
                              courierName: courier,
                              estimatedDeliveryDate: estDate,
                              orderType: selectedSubmission.orderType || 'WhatsApp Order',
                              status: 'replied'
                            };
                            setSelectedSubmission(updatedSub);
                            setContactSubmissions(contactSubmissions.map(s => s.id === selectedSubmission.id ? updatedSub : s));
                            showToast(`Generated tracking #${trk} via ${courier}!`, "success");
                          }}
                          className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Zap size={14} /> Generate Simulated Tracking #
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex gap-3 pt-2">
                <a 
                  href={`https://wa.me/${selectedSubmission.emailOrPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    selectedSubmission.trackingNumber 
                      ? `Hi ${selectedSubmission.name}! Your KCC Shop order "${selectedSubmission.subject}" has been dispatched via ${selectedSubmission.courierName || 'Courier'}. Tracking Number: ${selectedSubmission.trackingNumber}. Estimated Delivery: ${selectedSubmission.estimatedDeliveryDate || '2-3 business days'}. Thank you for shopping with us!`
                      : `Hi ${selectedSubmission.name}! Thank you for reaching out to KCC Store regarding "${selectedSubmission.subject}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    const updated = contactSubmissions.map(s => s.id === selectedSubmission.id ? { ...s, status: 'replied' as const } : s);
                    setContactSubmissions(updated);
                  }}
                  className="flex-1 btn-primary py-3 justify-center text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
                  <MessageCircle size={16} /> WhatsApp Customer
                </a>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-3 bg-brand-light hover:bg-gray-200 text-brand-dark rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal to Log New WhatsApp Order with Auto Tracking Generation */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-black/10"
          >
            <div className="p-6 border-b flex justify-between items-center bg-brand-light/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-brand-dark">Log WhatsApp Order</h3>
                  <p className="text-xs text-brand-gray">Store offline WhatsApp order & generate simulated tracking number.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddOrderModal(false)}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors border shadow-sm cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newOrderCustomerName.trim() || !newOrderPhone.trim()) {
                  showToast("Please enter Customer Name and Phone Number.", "remove");
                  return;
                }
                const trk = generateSimulatedTrackingNumber(newOrderCourier);
                const estDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

                const newSub: ContactSubmission = {
                  id: `wa_${Date.now()}`,
                  name: newOrderCustomerName.trim(),
                  emailOrPhone: newOrderPhone.trim(),
                  subject: newOrderSubject.trim() || 'WhatsApp Order',
                  message: newOrderMessage.trim() || 'WhatsApp order confirmed with Cash on Delivery (COD).',
                  createdAt: nowStr,
                  status: 'replied',
                  orderType: 'WhatsApp Order',
                  trackingNumber: trk,
                  courierName: newOrderCourier,
                  estimatedDeliveryDate: estDate,
                  notes: `Auto-generated tracking #${trk} via ${newOrderCourier}.`
                };

                setContactSubmissions([newSub, ...contactSubmissions]);
                showToast(`Created WhatsApp order for ${newOrderCustomerName} with tracking #${trk}!`, "success");
                setShowAddOrderModal(false);
                setNewOrderCustomerName('');
                setNewOrderPhone('');
                setNewOrderSubject('WhatsApp Order');
                setNewOrderMessage('');
              }}
              className="p-6 space-y-4 overflow-y-auto max-h-[75vh]"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={newOrderCustomerName}
                  onChange={(e) => setNewOrderCustomerName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="text"
                  value={newOrderPhone}
                  onChange={(e) => setNewOrderPhone(e.target.value)}
                  placeholder="e.g. 0321-7788990"
                  className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-medium font-mono outline-none focus:ring-2 focus:ring-brand-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                  Order Title / Products
                </label>
                <input
                  type="text"
                  value={newOrderSubject}
                  onChange={(e) => setNewOrderSubject(e.target.value)}
                  placeholder="e.g. WhatsApp Order - 1x Arc Lighter + 2x Water Dispenser"
                  className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                  Courier Company
                </label>
                <select
                  value={newOrderCourier}
                  onChange={(e) => setNewOrderCourier(e.target.value)}
                  className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="TCS Express">TCS Express</option>
                  <option value="Leopard Courier">Leopard Courier</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="PostEx COD">PostEx COD</option>
                  <option value="CallCourier">CallCourier</option>
                  <option value="M&P Courier">M&P Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                  Order Details / Delivery Address
                </label>
                <textarea
                  rows={3}
                  value={newOrderMessage}
                  onChange={(e) => setNewOrderMessage(e.target.value)}
                  placeholder="e.g. House #42, Street 5, F-10/2 Islamabad. Total Rs. 3,200 COD."
                  className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(false)}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-brand-gray font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-3 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Truck size={15} /> Save & Generate Tracking
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Admin User Rights Configurator Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-black/10"
          >
            <div className="p-6 border-b flex justify-between items-center bg-brand-light/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-primary text-white rounded-xl">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-brand-dark">
                    {adminUsers.some(u => u.id === editingUser.id) ? `Edit Admin Account: ${editingUser.username}` : 'Create New Sub-Admin Account'}
                  </h3>
                  <p className="text-xs text-brand-gray">Set customized access rights for specific pages, categories, and discounts.</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors border shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editingUser.username.trim() || !editingUser.password.trim() || !editingUser.name.trim()) {
                showToast("Please fill in Name, Username, and Password.", "remove");
                return;
              }
              const exists = adminUsers.some(u => u.id === editingUser.id);
              let updatedUsers: AdminUser[];
              if (exists) {
                updatedUsers = adminUsers.map(u => u.id === editingUser.id ? editingUser : u);
                showToast(`Updated rights for admin "${editingUser.username}"`, "success");
              } else {
                updatedUsers = [...adminUsers, editingUser];
                showToast(`Created new admin account "${editingUser.username}"`, "success");
              }
              setAdminUsers(updatedUsers);
              try {
                localStorage.setItem('kcc_admin_users_v1', JSON.stringify(updatedUsers));
              } catch (e) {
                console.error(e);
              }
              setEditingUser(null);
            }} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Full Name / Label *</label>
                  <input 
                    type="text" 
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    placeholder="e.g. Usman Ali (Inventory Manager)"
                    className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Account Role *</label>
                  <select 
                    value={editingUser.role}
                    onChange={(e) => {
                      const newRole = e.target.value as 'superadmin' | 'subadmin';
                      setEditingUser({
                        ...editingUser,
                        role: newRole,
                        allowedTabs: newRole === 'superadmin' 
                          ? ['products', 'contact-messages', 'store-info', 'hero', 'deals', 'testimonials', 'policies', 'user-management'] 
                          : editingUser.allowedTabs
                      });
                    }}
                    className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="subadmin">Sub-Admin (Restricted Rights)</option>
                    <option value="superadmin">Superadmin (Unrestricted Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Login Username *</label>
                  <input 
                    type="text" 
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g. usman_kcc"
                    className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">Account Password *</label>
                  <input 
                    type="text" 
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="e.g. usman1234"
                    className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Tab Permissions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">
                  Accessible Admin Panel Tabs
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-brand-light/40 p-3 rounded-2xl border border-black/5">
                  {[
                    { id: 'products', label: '📦 Products' },
                    { id: 'contact-messages', label: '📩 Contact Messages' },
                    { id: 'store-info', label: '⚙️ Store Info' },
                    { id: 'hero', label: '🎨 Hero Banner' },
                    { id: 'deals', label: '🏷️ Deals' },
                    { id: 'testimonials', label: '💬 Reviews' },
                    { id: 'policies', label: '📜 Policies' },
                    { id: 'user-management', label: '👥 User Rights' },
                  ].map(tab => {
                    const isChecked = editingUser.allowedTabs.includes(tab.id as AdminTab);
                    return (
                      <label 
                        key={tab.id}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                          isChecked ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-white border-black/5 text-brand-gray'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingUser({ ...editingUser, allowedTabs: [...editingUser.allowedTabs, tab.id as AdminTab] });
                            } else {
                              setEditingUser({ ...editingUser, allowedTabs: editingUser.allowedTabs.filter(t => t !== tab.id) });
                            }
                          }}
                          className="w-4 h-4 text-brand-primary rounded"
                        />
                        <span>{tab.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Category Scope & Discount Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                    Category Rights Scope
                  </label>
                  <p className="text-[10px] text-brand-gray mb-2">Select allowed categories (leave unselected for All Categories).</p>
                  <div className="space-y-1.5 bg-brand-light/30 p-3 rounded-xl border border-black/5">
                    {['Home Improvement', 'Gadgets', 'Kitchen'].map(cat => {
                      const hasCat = editingUser.allowedCategories?.includes(cat);
                      return (
                        <label key={cat} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={!!hasCat}
                            onChange={(e) => {
                              const currentCats = editingUser.allowedCategories || [];
                              if (e.target.checked) {
                                setEditingUser({ ...editingUser, allowedCategories: [...currentCats, cat] });
                              } else {
                                setEditingUser({ ...editingUser, allowedCategories: currentCats.filter(c => c !== cat) });
                              }
                            }}
                            className="w-3.5 h-3.5 text-brand-primary rounded"
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                    Max Discount Authority (%)
                  </label>
                  <p className="text-[10px] text-brand-gray mb-2">Maximum percentage discount this sub-admin can apply.</p>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={editingUser.maxDiscountPercent || 20}
                    onChange={(e) => setEditingUser({ ...editingUser, maxDiscountPercent: Number(e.target.value) })}
                    className="w-full bg-brand-light border border-black/10 rounded-xl p-3 text-xs font-bold"
                  />
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-dark cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={!!editingUser.canDeleteProducts}
                        onChange={(e) => setEditingUser({ ...editingUser, canDeleteProducts: e.target.checked })}
                        className="w-4 h-4 text-brand-primary rounded"
                      />
                      <span>Allow deleting store products</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-black/10">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-brand-gray font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-3 text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save Admin Rights
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* WordPress kcconline.shop 404 Resolution Modal */}
      {showWpFixModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border border-black/10"
          >
            <div className="p-6 md:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-brand-dark text-white flex justify-between items-start relative">
              <div className="space-y-1 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-widest mb-2">
                  <Globe size={14} /> kcconline.shop Domain Setup
                </div>
                <h3 className="text-2xl font-display font-extrabold">
                  Fixing "kcconline.shop / This Page Does Not Exist"
                </h3>
                <p className="text-xs text-blue-100/80 max-w-xl leading-relaxed">
                  Connect your React store to your WordPress domain in 60 seconds with our official plugin or embed code.
                </p>
              </div>
              <button 
                onClick={() => setShowWpFixModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* Option 1: 1-Click WP Plugin */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">1</span>
                    <h4 className="font-bold text-sm text-brand-dark">Method 1: Upload WordPress Plugin (Easiest)</h4>
                  </div>
                  <p className="text-xs text-brand-gray leading-relaxed pl-8">
                    Download <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-bold">kcc-store-wordpress-plugin.php</code>, then go to <strong>kcconline.shop/wp-admin ➔ Plugins ➔ Add New ➔ Upload Plugin</strong> and click <strong>Activate</strong>!
                  </p>
                </div>
                <button
                  onClick={() => {
                    const phpPlugin = `<?php
/**
 * Plugin Name: KCC Online Store for kcconline.shop
 * Plugin URI: https://kcconline.shop
 * Description: Connects and embeds the KCC Online Store directly on kcconline.shop, replacing the 404 page.
 * Version: 1.0.0
 * Author: KCC Online Store
 */

if (!defined('ABSPATH')) exit;

function kcc_store_embed_shortcode($atts) {
    $atts = shortcode_atts(array('height' => '100vh'), $atts, 'kcc_store');
    $app_url = 'https://ais-pre-3pbo2tysnrihvn7i4j7pap-18868251111.asia-southeast1.run.app';
    return '<div style="width:100%; min-height:100vh; overflow:hidden;"><iframe src="' . esc_url($app_url) . '" width="100%" height="900" style="border:none; width:100%; min-height:100vh; display:block; border-radius:12px;" allow="geolocation; camera; microphone; payment"></iframe></div>';
}
add_shortcode('kcc_store', 'kcc_store_embed_shortcode');

function kcc_store_override_homepage($template) {
    if (is_404() || is_front_page()) {
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>KCC Online Store - Wholesale & Retail</title>
            <style>html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0f172a; } iframe { width: 100%; height: 100vh; border: none; display: block; }</style>
        </head>
        <body>
            <iframe src="https://ais-pre-3pbo2tysnrihvn7i4j7pap-18868251111.asia-southeast1.run.app" allow="geolocation; camera; microphone; payment"></iframe>
        </body>
        </html>
        <?php
        exit;
    }
    return $template;
}
add_filter('template_include', 'kcc_store_override_homepage');`;
                    const blob = new Blob([phpPlugin], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'kcc-store-wordpress-plugin.php';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast("Downloaded kcc-store-wordpress-plugin.php!", "success");
                  }}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
                >
                  <Download size={16} /> Download WP Plugin
                </button>
              </div>

              {/* Option 2: Gutenberg Custom HTML iframe */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">2</span>
                    <h4 className="font-bold text-sm text-brand-dark">Method 2: Gutenberg / Elementor HTML iFrame</h4>
                  </div>
                  <p className="text-xs text-brand-gray leading-relaxed pl-8">
                    In WordPress Page Editor, add a <strong>Custom HTML block</strong> and paste this snippet.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const snippet = `<iframe src="https://ais-pre-3pbo2tysnrihvn7i4j7pap-18868251111.asia-southeast1.run.app" width="100%" height="900" style="border:none; width:100%; min-height:100vh; border-radius:12px;" allow="geolocation; camera; microphone; payment"></iframe>`;
                    navigator.clipboard.writeText(snippet);
                    showToast("Copied iFrame snippet to clipboard!", "success");
                  }}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
                >
                  <Copy size={16} /> Copy HTML Snippet
                </button>
              </div>

              {/* Option 3: Direct cPanel / Hostinger Upload */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-white text-xs font-black flex items-center justify-center">3</span>
                  <h4 className="font-bold text-sm text-brand-dark">Method 3: Upload Static Files to kcconline.shop cPanel</h4>
                </div>
                <p className="text-xs text-brand-gray leading-relaxed pl-8">
                  Export project ZIP from top-right AI Studio menu, run <code className="bg-gray-200 px-1 rounded font-mono">npm run build</code>, and upload contents of <code className="bg-gray-200 px-1 rounded font-mono">dist/</code> directly into your cPanel <code className="bg-gray-200 px-1 rounded font-mono">public_html</code> folder!
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setShowWpFixModal(false)}
                className="px-6 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Product Detail Modal with Unique Shareable URL */}
      <AnimatePresence>
        {selectedProductDetails && (
          <ProductDetailModal
            product={selectedProductDetails}
            allProducts={products}
            onClose={handleCloseProductDetails}
            onAddToCart={addToCart}
            onQuickBuy={(p, v, qty) => {
              addToCart(p, qty || 1, undefined, v);
              setIsCartOpen(true);
            }}
            onSelectProduct={handleSelectProduct}
            showToast={showToast}
            whatsappNumber={storeSettings.whatsappNumber?.replace(/[^0-9]/g, '') || '923295147517'}
          />
        )}
      </AnimatePresence>

      {/* Headless Commerce Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        activeWhatsappLink={storeSettings.whatsappNumber ? `https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}` : 'https://wa.me/923001234567'}
        onClearCart={() => setCart([])}
        showToast={showToast}
      />
    </div>
  );
} 

