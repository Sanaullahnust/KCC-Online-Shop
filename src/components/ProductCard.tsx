import { useState, MouseEvent } from 'react';
import { ShoppingBag, Star, Zap, Share2, Check, ArrowRight, Layers, Tag, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Product } from '../types';
import { getDefaultVariantsForProduct, ProductVariant } from '../lib/commerceApi';

export interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product, quantity: number, event?: MouseEvent, variant?: ProductVariant) => void;
  onQuickBuy?: (product: Product, variant?: ProductVariant) => void;
  onOpenGallery?: (product: Product, index?: number) => void;
  onDeleteProduct?: (productId: string, e?: MouseEvent) => void;
  isAdminLoggedIn?: boolean;
}

// Generate smart, attractive marketing tags based on product attributes
function getProductTags(product: Product): { label: string; bg: string; text: string; icon?: any }[] {
  const tags: { label: string; bg: string; text: string; icon?: any }[] = [];
  const nameLower = product.name.toLowerCase();
  const descLower = product.description.toLowerCase();

  // Top badges
  if (product.isHot) {
    tags.push({ label: 'Hot Trending', bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600', icon: Zap });
  }
  if (product.isTopSeller) {
    tags.push({ label: 'Top Seller', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-700', icon: Star });
  }

  // Feature-based tags
  if (nameLower.includes('rechargeable') || descLower.includes('rechargeable') || nameLower.includes('usb')) {
    tags.push({ label: 'USB Rechargeable', bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-700', icon: Sparkles });
  }
  if (nameLower.includes('remote') || descLower.includes('remote')) {
    tags.push({ label: 'With Remote', bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-700' });
  }
  if (nameLower.includes('water') || nameLower.includes('pump') || nameLower.includes('cooler') || nameLower.includes('fan')) {
    tags.push({ label: 'Instant Cooling / Flow', bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-700' });
  }
  if (product.category === 'Home Improvement') {
    tags.push({ label: 'Heavy Duty', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-700', icon: ShieldCheck });
  }
  if (product.category === 'Kitchen') {
    tags.push({ label: 'Kitchen Essential', bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-700' });
  }
  if (product.category === 'Gadgets' && tags.length < 2) {
    tags.push({ label: 'Smart Gadget', bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-700' });
  }

  // Always ensure at least 2 attractive guarantee/feature tags
  if (tags.length < 2) {
    tags.push({ label: 'Wholesale Verified', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-700', icon: ShieldCheck });
  }

  return tags.slice(0, 3);
}

export function ProductCard({
  product,
  onAddToCart,
  onQuickBuy,
  onOpenGallery,
  onDeleteProduct,
  isAdminLoggedIn = false,
}: ProductCardProps) {
  const variants = getDefaultVariantsForProduct(product);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || '');
  const [copied, setCopied] = useState(false);

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const attractiveTags = getProductTags(product);

  const handleCopyShareLink = (e: MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onOpenGallery && onOpenGallery(product)}
      className="bg-white rounded-3xl p-4 md:p-5 border border-black/5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
    >
      {/* Top Image Box */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-light mb-4 border border-black/5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {product.isHot && (
            <span className="bg-red-600 text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Zap size={11} fill="currentColor" /> Hot Item
            </span>
          )}
          {product.isTopSeller && (
            <span className="bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Star size={11} fill="currentColor" /> Top Seller
            </span>
          )}
          {product.discountNote && (
            <span className="bg-brand-dark text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              {product.discountNote}
            </span>
          )}
        </div>

        {/* Admin Delete Button */}
        {isAdminLoggedIn && onDeleteProduct && (
          <button
            onClick={(e) => onDeleteProduct(product.id, e)}
            className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 z-20 cursor-pointer text-[10px] font-bold"
            title="Delete Product"
          >
            ✕
          </button>
        )}

        {/* Share Button Overlay */}
        <button
          onClick={handleCopyShareLink}
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-brand-dark p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 z-10 cursor-pointer"
          title="Copy Link to Share"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
        </button>
      </div>

      {/* Content Details */}
      <div className="flex flex-col flex-grow">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between text-[11px] text-brand-gray font-semibold mb-2">
          <span className="px-2.5 py-0.5 rounded-md bg-brand-light text-brand-dark font-bold text-[10px] uppercase tracking-wider">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
            <Star size={12} fill="currentColor" />
            <span>{product.rating || 4.9}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-brand-dark text-base md:text-lg line-clamp-2 mb-2 group-hover:text-brand-primary transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-brand-gray line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        {/* Attractive Feature Tags Pill Strip */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {attractiveTags.map((tag, idx) => {
            const IconComponent = tag.icon;
            return (
              <span 
                key={idx}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide border ${tag.bg} ${tag.text}`}
              >
                {IconComponent && <IconComponent size={10} className="shrink-0" />}
                <span>{tag.label}</span>
              </span>
            );
          })}
        </div>

        {/* Variant Choice Selection */}
        {variants.length > 0 && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-gray mb-1 flex items-center gap-1">
              <Layers size={10} className="text-brand-primary" /> Variant:
            </label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full bg-brand-light/80 border border-black/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-brand-dark outline-none cursor-pointer hover:border-brand-primary/40 transition-colors"
            >
              {variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} - Rs.{v.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price Row (Cleaned: Stock & Weight removed from listing) */}
        <div className="mt-auto pt-2 flex items-baseline justify-between border-t border-black/5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl md:text-2xl font-display font-black text-brand-primary font-mono">
              Rs.{activePrice.toLocaleString()}
            </span>
            {selectedVariant && selectedVariant.price !== product.price && (
              <span className="text-[10px] text-brand-gray line-through font-mono">
                Rs.{product.price.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            <Truck size={11} /> COD Available
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => onAddToCart(product, 1, e, selectedVariant)}
          className="w-full bg-brand-light hover:bg-black/10 text-brand-dark py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-black/5 cursor-pointer"
        >
          <ShoppingBag size={14} /> Add Cart
        </button>

        <button
          onClick={() => {
            onAddToCart(product, 1, undefined, selectedVariant);
            if (onQuickBuy) onQuickBuy(product, selectedVariant);
          }}
          className="w-full btn-primary py-2.5 px-3 text-xs font-extrabold flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
        >
          Buy Now <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
