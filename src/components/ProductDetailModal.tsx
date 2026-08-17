import React, { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingBag, 
  Star, 
  Zap, 
  Truck, 
  Share2, 
  Check, 
  Copy, 
  MessageCircle, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  ThumbsUp, 
  Send, 
  Package, 
  Phone,
  Tag,
  Clock,
  Sparkles,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { Product, getProductStockStatus } from '../types';
import { getDefaultVariantsForProduct, ProductVariant } from '../lib/commerceApi';
import { ProductImageViewer } from './ProductImageViewer';

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface ProductDetailModalProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, event?: MouseEvent, variant?: ProductVariant) => void;
  onQuickBuy: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  showToast: (message: string, type: 'success' | 'info' | 'remove') => void;
  whatsappNumber?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts,
  onClose,
  onAddToCart,
  onQuickBuy,
  onSelectProduct,
  showToast,
  whatsappNumber = '923295147517'
}) => {
  if (!product) return null;

  const variants = getDefaultVariantsForProduct(product);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews' | 'policy'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Review state
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'r1',
      name: 'Muhammad Farhan',
      rating: 5,
      date: '2 days ago',
      comment: 'Received parcel in Islamabad within 48 hours. Excellent build quality and original item!',
      verified: true
    },
    {
      id: 'r2',
      name: 'Ayesha Malik',
      rating: 5,
      date: '1 week ago',
      comment: 'Super fast Cash on Delivery dispatch. Product is exactly as described in images.',
      verified: true
    },
    {
      id: 'r3',
      name: 'Tariq Mehmood',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Good product for wholesale price. Packaging was secure.',
      verified: true
    }
  ]);

  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Reset selected variant & media whenever active product changes
  useEffect(() => {
    if (product) {
      const v = getDefaultVariantsForProduct(product);
      setSelectedVariantId(v[0]?.id || '');
      setQuantity(1);
      setCurrentMediaIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id]);

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
  const unitPrice = selectedVariant ? selectedVariant.price : product.price;
  const totalPrice = unitPrice * quantity;
  const originalPrice = Math.round(unitPrice * 1.25);
  
  const stockInfo = getProductStockStatus(product);
  const maxAvailableStock = stockInfo.stock > 0 ? stockInfo.stock : 1;

  // Media items calculation
  const mediaItems: { type: 'image' | 'video'; url: string }[] = [];
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => mediaItems.push({ type: 'image', url: img }));
  } else if (product.image) {
    mediaItems.push({ type: 'image', url: product.image });
  }
  if (product.video) {
    mediaItems.push({ type: 'video', url: product.video });
  }

  // Weight & Courier Delivery estimation
  const totalWeightGrams = (product.weight || 300) * quantity;
  const estimatedDeliveryFee = totalWeightGrams <= 500 ? 250 : totalWeightGrams <= 1000 ? 400 : 400 + Math.ceil((totalWeightGrams - 1000) / 500) * 150;

  // Share & Link handlers
  const uniqueProductUrl = `${window.location.origin}${window.location.pathname}#product/${product.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(uniqueProductUrl);
    setCopiedLink(true);
    showToast(`Product link copied to clipboard!`, 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const whatsappMessage = `Hi KCC Shop! I am interested in ordering:\n📦 *Product:* ${product.name}\n🏷️ *Variant:* ${selectedVariant?.name || 'Standard'}\n🔢 *Quantity:* ${quantity}\n💰 *Price:* Rs.${totalPrice}\n\nLink: ${uniqueProductUrl}`;
  const whatsappShareUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Handle Review Submit
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newReviewComment.trim()) {
      showToast('Please provide your name and review message.', 'remove');
      return;
    }
    setIsSubmittingReview(true);
    const newEntry: ReviewItem = {
      id: `rev_${Date.now()}`,
      name: newReviewerName.trim(),
      rating: newReviewRating,
      date: 'Just now',
      comment: newReviewComment.trim(),
      verified: true
    };
    setReviews([newEntry, ...reviews]);
    setNewReviewerName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setIsSubmittingReview(false);
    showToast('Thank you! Your product review has been submitted.', 'success');
  };

  // Related products (same category or top sellers, excluding current)
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.isTopSeller))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-start p-2 sm:p-4 md:p-6 animate-fadeIn">
      {/* Container Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden my-auto border border-black/10 relative flex flex-col max-h-[92vh]"
      >
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-black/5 flex items-center justify-between gap-4">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold text-brand-gray whitespace-nowrap">
            <button 
              onClick={onClose}
              className="hover:text-brand-primary transition-colors flex items-center gap-1 font-bold"
            >
              Shop
            </button>
            <ChevronRight size={14} className="opacity-40 shrink-0" />
            <span className="text-brand-gray/80 hidden sm:inline">{product.category}</span>
            <ChevronRight size={14} className="opacity-40 hidden sm:inline shrink-0" />
            <span className="text-brand-dark font-bold line-clamp-1 max-w-[180px] sm:max-w-xs">{product.name}</span>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-full bg-brand-light hover:bg-brand-primary/10 text-brand-dark hover:text-brand-primary transition-all border border-black/5 flex items-center gap-1.5 text-xs font-bold"
              title="Copy Unique Product URL"
            >
              {copiedLink ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              <span className="hidden md:inline">{copiedLink ? 'Link Copied!' : 'Share Product URL'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-brand-light hover:bg-gray-200 text-brand-dark transition-colors border border-black/5"
              title="Close Product Details"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 md:p-8 space-y-8 flex-grow">
          {/* Main Product Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Gallery & Media Viewer (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative">
                {/* Badges Overlay on Stage */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
                  {stockInfo.isLow && !stockInfo.isOut && (
                    <span className="bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse border border-amber-300">
                      <AlertTriangle size={12} className="fill-white/20" /> Low Stock: Only {stockInfo.stock} Units Left
                    </span>
                  )}
                  {stockInfo.isOut && (
                    <span className="bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-red-400">
                      <AlertCircle size={12} /> Out of Stock
                    </span>
                  )}
                  {product.isHot && (
                    <span className="bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Zap size={12} fill="currentColor" /> Hot Demand Item
                    </span>
                  )}
                  {product.isTopSeller && (
                    <span className="bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> Top Wholesale Seller
                    </span>
                  )}
                </div>

                {/* Upgraded Mobile Pinch-to-Zoom & Pan Gallery Image Viewer */}
                <ProductImageViewer
                  mediaItems={mediaItems}
                  currentIndex={currentMediaIndex}
                  onIndexChange={setCurrentMediaIndex}
                  productName={product.name}
                  allowFullscreen={true}
                />
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-brand-light/60 border border-black/5 flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="text-[11px] font-bold text-brand-dark">3-Day Replacement</h5>
                    <p className="text-[10px] text-brand-gray">Defect Guarantee</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-brand-light/60 border border-black/5 flex items-center gap-2.5">
                  <Truck size={20} className="text-brand-primary shrink-0" />
                  <div>
                    <h5 className="text-[11px] font-bold text-brand-dark">Cash On Delivery</h5>
                    <p className="text-[10px] text-brand-gray">All Pakistan Dispatch</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Product Meta, Variants & Purchasing Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="px-3.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-extrabold uppercase tracking-widest border border-brand-primary/20">
                  {product.category}
                </span>

                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'} className="stroke-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-900">{product.rating || 4.8} / 5.0</span>
                  <span className="text-[10px] text-amber-700 font-semibold">({reviews.length} Verified Reviews)</span>
                </div>
              </div>

              {/* Title & SKU */}
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-brand-dark leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-xs font-medium text-brand-gray flex-wrap">
                  <span>SKU: <strong className="text-brand-dark font-mono">{product.sku || `KCC-${product.id}`}</strong></span>
                  <span>•</span>
                  {stockInfo.isOut ? (
                    <span className="text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      <AlertCircle size={14} /> Out of Stock (0 units left)
                    </span>
                  ) : stockInfo.isLow ? (
                    <span className="text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 animate-pulse">
                      <AlertTriangle size={14} className="text-amber-600" /> Low Stock: Only {stockInfo.stock} units remaining!
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Check size={14} /> In Stock ({stockInfo.stock} units ready for dispatch)
                    </span>
                  )}
                </div>
              </div>

              {/* Low Stock Urgency Banner */}
              {stockInfo.isLow && !stockInfo.isOut && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm mt-0.5">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-2">
                      Limited Stock Warning
                      <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.2 rounded-full uppercase">Only {stockInfo.stock} Left</span>
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5 leading-snug">
                      High demand for this item! Place your Cash on Delivery order now before our warehouse inventory sells out.
                    </p>
                  </div>
                </div>
              )}

              {/* Price & Savings Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-light via-blue-50/40 to-emerald-50/40 border border-black/5 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-gray block mb-1">Wholesale Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-display font-black text-brand-primary font-mono">
                      Rs.{unitPrice.toLocaleString()}
                    </span>
                    <span className="text-base font-semibold text-brand-gray/60 line-through font-mono">
                      Rs.{originalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Save 20% OFF
                  </span>
                  {product.discountNote && (
                    <span className="text-[11px] font-bold text-brand-primary mt-1">
                      🏷️ {product.discountNote}
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Selector (If available) */}
              {variants.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-brand-dark">
                    <span>Select Pack / Option:</span>
                    <span className="text-brand-primary">{selectedVariant?.name}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {variants.map(variant => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex justify-between items-center ${
                          selectedVariantId === variant.id
                            ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 font-bold text-brand-dark shadow-sm'
                            : 'border-black/10 bg-white hover:border-black/20 text-brand-gray'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs">{variant.name}</span>
                          {variant.sku && <span className="text-[10px] text-brand-gray font-mono">{variant.sku}</span>}
                        </div>
                        <span className="text-xs font-bold font-mono text-brand-primary">
                          Rs.{variant.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Weight Breakdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-brand-light/50 border border-black/5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">Quantity:</span>
                  <div className="flex items-center bg-white rounded-xl border border-black/10 p-1 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={stockInfo.isOut}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light text-brand-dark font-bold text-base transition-colors disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold font-mono text-sm">{stockInfo.isOut ? 0 : quantity}</span>
                    <button
                      onClick={() => {
                        if (stockInfo.stock > 0 && quantity >= stockInfo.stock) {
                          showToast(`Only ${stockInfo.stock} units available in stock!`, 'info');
                          return;
                        }
                        setQuantity(quantity + 1);
                      }}
                      disabled={stockInfo.isOut || (stockInfo.stock > 0 && quantity >= stockInfo.stock)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-light text-brand-dark font-bold text-base transition-colors disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  {stockInfo.isLow && !stockInfo.isOut && (
                    <span className="text-[10px] text-amber-700 font-bold">Max: {stockInfo.stock}</span>
                  )}
                </div>

                <div className="text-right text-xs">
                  <div className="font-bold text-brand-dark">
                    Total Weight: <span className="font-mono text-brand-primary">{totalWeightGrams}g</span>
                  </div>
                  <div className="text-[11px] text-brand-gray">
                    Est. Shipping Fee: <strong className="font-mono text-brand-dark">Rs.{estimatedDeliveryFee}</strong>
                  </div>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                {stockInfo.isOut ? (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
                    <p className="text-sm font-bold text-red-700 mb-2">This product is currently out of stock.</p>
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all inline-block"
                    >
                      <MessageCircle size={18} className="inline fill-current stroke-none" /> Contact on WhatsApp for Restock Alert
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Add to Cart */}
                    <button
                      onClick={(e) => {
                        onAddToCart(product, quantity, e, selectedVariant);
                        showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');
                      }}
                      className="btn-primary py-4 justify-center text-sm font-bold uppercase tracking-wider gap-2 shadow-lg shadow-brand-primary/20"
                    >
                      <ShoppingBag size={18} /> Add to Cart
                    </button>

                    {/* Buy Now / Quick Order */}
                    <button
                      onClick={() => {
                        onQuickBuy(product, selectedVariant, quantity);
                        onClose();
                      }}
                      className="py-4 px-6 bg-brand-dark hover:bg-black text-white rounded-2xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-98"
                    >
                      <span>Instant Buy Now</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {/* Direct WhatsApp Order */}
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
                >
                  <MessageCircle size={18} className="fill-current stroke-none" />
                  <span>Order Directly via WhatsApp (+{whatsappNumber})</span>
                </a>
              </div>
            </div>
          </div>

          {/* Details Tabs Section */}
          <div className="border-t border-black/10 pt-8 space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-black/10 pb-3 overflow-x-auto">
              {[
                { id: 'overview', label: 'Description & Features' },
                { id: 'specs', label: 'Technical Specifications' },
                { id: 'reviews', label: `Customer Reviews (${reviews.length})` },
                { id: 'policy', label: 'Shipping & Returns' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-brand-light text-brand-gray hover:text-brand-dark'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Panes */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-brand-dark leading-relaxed animate-fadeIn">
                <h3 className="text-xl font-display font-bold">Product Summary</h3>
                <p className="text-sm text-brand-gray text-justify leading-relaxed">
                  {product.description}
                </p>

                <div className="bg-brand-light/60 p-5 rounded-2xl border border-black/5 space-y-3 mt-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-primary flex items-center gap-2">
                    <Sparkles size={16} /> Key Product Highlights
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-medium text-brand-gray">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      Original Wholesale Import Quality
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      Fast USB / Rechargeable Powered Operation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      Compact, Lightweight ({product.weight}g) & Portable
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      Tested & Inspected Before Dispatch
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="animate-fadeIn space-y-4">
                <h3 className="text-xl font-display font-bold">Specifications & Packaging</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="p-4 rounded-xl bg-brand-light border border-black/5 flex justify-between items-center">
                    <span className="text-brand-gray">Product Weight</span>
                    <span className="font-bold text-brand-dark font-mono">{product.weight} Grams</span>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-light border border-black/5 flex justify-between items-center">
                    <span className="text-brand-gray">Store Category</span>
                    <span className="font-bold text-brand-dark">{product.category}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-light border border-black/5 flex justify-between items-center">
                    <span className="text-brand-gray">Item ID / Code</span>
                    <span className="font-bold text-brand-dark font-mono">KCC-PROD-{product.id}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-light border border-black/5 flex justify-between items-center">
                    <span className="text-brand-gray">Dispatched From</span>
                    <span className="font-bold text-brand-dark">Islamabad Warehouse, Pakistan</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-fadeIn space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-brand-light/50 p-6 rounded-2xl border border-black/5">
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">Customer Feedback</h3>
                    <p className="text-xs text-brand-gray">Verified buyer ratings from customers across Pakistan.</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-4xl font-display font-black text-brand-dark font-mono">{product.rating || 4.8}</span>
                      <div>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill="currentColor" />
                          ))}
                        </div>
                        <span className="text-[11px] text-brand-gray font-bold">Based on {reviews.length} reviews</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="p-4 rounded-2xl border border-black/5 bg-white space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-brand-dark">{rev.name}</span>
                          {rev.verified && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Check size={10} /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-brand-gray">{rev.date}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} className="stroke-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs text-brand-gray leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Write Review Form */}
                <div className="bg-brand-light p-6 rounded-2xl border border-black/5 space-y-4">
                  <h4 className="font-bold text-sm text-brand-dark uppercase tracking-wider">Leave a Verified Review</h4>
                  <form onSubmit={handleAddReview} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-brand-gray mb-1">Your Full Name</label>
                        <input
                          type="text"
                          value={newReviewerName}
                          onChange={(e) => setNewReviewerName(e.target.value)}
                          placeholder="e.g. Usman Ali"
                          className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-gray mb-1">Star Rating</label>
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                          <option value={3}>⭐⭐⭐ (3 Stars)</option>
                          <option value={2}>⭐⭐ (2 Stars)</option>
                          <option value={1}>⭐ (1 Star)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-gray mb-1">Your Feedback Comment</label>
                      <textarea
                        rows={3}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Write your experience with this product..."
                        className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
                    >
                      <Send size={14} /> Submit Review
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="animate-fadeIn space-y-4 text-xs text-brand-gray leading-relaxed">
                <h3 className="text-xl font-display font-bold text-brand-dark">Shipping & Return Terms</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-900 space-y-1">
                    <strong className="block font-bold">1. Delivery Timeframe</strong>
                    <p>Islamabad / Rawalpindi orders delivered within 24-48 hours. Major cities across Pakistan delivered in 2-4 business days via courier.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-900 space-y-1">
                    <strong className="block font-bold">2. Defect Replacement Guarantee</strong>
                    <p>Claims for broken or malfunctioning products must be submitted via WhatsApp (+{whatsappNumber}) within 3 days of delivery with an unboxing video.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-black/10 pt-8 space-y-4">
              <h3 className="text-xl font-display font-bold text-brand-dark">Related Items You Might Like</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                    }}
                    className="p-3 bg-brand-light/60 rounded-2xl border border-black/5 hover:border-brand-primary/30 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-white mb-2">
                      <img src={rel.image} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-brand-dark line-clamp-1">{rel.name}</h5>
                      <p className="text-xs font-mono font-bold text-brand-primary mt-1">Rs.{rel.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
