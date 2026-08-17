import { useState, MouseEvent } from 'react';
import { ShoppingBag, Star, Zap, Share2, Check, ArrowRight, Layers, Tag, AlertTriangle, AlertCircle, Package } from 'lucide-react';
import { Product, getProductStockStatus } from '../types';
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
  
  const stockInfo = getProductStockStatus(product);

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

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {/* Low Stock Highlight Badge */}
          {stockInfo.isLow && !stockInfo.isOut && (
            <span className="bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse border border-amber-300">
              <AlertTriangle size={11} className="fill-white/20" /> Low Stock ({stockInfo.stock} Left)
            </span>
          )}
          {/* Out of Stock Badge */}
          {stockInfo.isOut && (
            <span className="bg-red-600 text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-red-400">
              <AlertCircle size={11} /> Out of Stock
            </span>
          )}
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
        <div className="flex items-center justify-between text-[11px] text-brand-gray font-semibold mb-1">
          <span className="px-2 py-0.5 rounded-md bg-brand-light text-brand-dark font-bold text-[10px] uppercase tracking-wider">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
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

        {/* Low stock urgency alert banner on card */}
        {stockInfo.isLow && !stockInfo.isOut && (
          <div className="mb-2.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <AlertTriangle size={12} className="text-amber-600 shrink-0" />
              <span>Only {stockInfo.stock} units left in stock</span>
            </span>
            <span className="text-[9px] uppercase tracking-wider text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded font-black">
              Hurry
            </span>
          </div>
        )}

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

        {/* Price & Weight Row */}
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
          <div className="flex items-center gap-1.5">
            {product.weight && (
              <span className="text-[10px] font-bold text-brand-gray bg-brand-light px-2 py-0.5 rounded-md">
                {product.weight}g
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-2" onClick={(e) => e.stopPropagation()}>
        {stockInfo.isOut ? (
          <button
            disabled
            className="col-span-2 w-full bg-gray-100 text-gray-400 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 border border-black/5 cursor-not-allowed"
          >
            <AlertCircle size={14} /> Sold Out / Out of Stock
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
