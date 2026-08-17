import { useState, FormEvent } from 'react';
import { X, ShoppingBag, Truck, MapPin, CheckCircle, CreditCard, ArrowRight, Sparkles, AlertCircle, Building, Phone, User, ShieldCheck, Tag, AlertTriangle } from 'lucide-react';
import { Product, getProductStockStatus } from '../types';
import { ProductVariant, getCheckoutUrl, createCart, getCommerceConfigStatus } from '../lib/commerceApi';

export interface CartEntry {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartEntry[];
  activeWhatsappLink: string;
  onClearCart: () => void;
  showToast: (message: string, type: 'success' | 'info' | 'remove') => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  activeWhatsappLink,
  onClearCart,
  showToast,
}: CheckoutModalProps) {
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'shopify'>('cod');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number; isFreeShipping?: boolean } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (!isOpen) return null;

  // Items Subtotal calculation
  const itemsSubtotal = cart.reduce((acc, item) => {
    const unitPrice = item.variant ? item.variant.price : item.product.price;
    return acc + unitPrice * item.quantity;
  }, 0);

  // Total Weight
  const totalWeightGrams = cart.reduce((acc, item) => {
    return acc + (item.product.weight || 250) * item.quantity;
  }, 0);

  // Delivery Charge computation
  let deliveryCharge = 0;
  if (shippingMethod === 'delivery' && !appliedCoupon?.isFreeShipping) {
    if (totalWeightGrams <= 500) {
      deliveryCharge = 250;
    } else if (totalWeightGrams <= 1000) {
      deliveryCharge = 400;
    } else {
      deliveryCharge = 400 + Math.ceil((totalWeightGrams - 1000) / 500) * 150;
    }
  }

  // Discount Calculation
  const discountAmount = appliedCoupon?.discountPercent
    ? Math.round((itemsSubtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const grandTotal = Math.max(0, itemsSubtotal - discountAmount + deliveryCharge);

  const handleApplyCoupon = (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'KCC10') {
      setAppliedCoupon({ code: 'KCC10', discountPercent: 10 });
      showToast('10% Coupon Discount Applied!', 'success');
    } else if (cleanCode === 'WHOLESALE' || cleanCode === 'BULK15') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 15 });
      showToast('15% Wholesale Discount Applied!', 'success');
    } else if (cleanCode === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', discountPercent: 0, isFreeShipping: true });
      showToast('Free Shipping Coupon Applied!', 'success');
    } else {
      showToast('Invalid Coupon Code. Try KCC10 or WHOLESALE', 'remove');
    }
  };

  const handleConfirmCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || (shippingMethod === 'delivery' && (!address.trim() || !city.trim()))) {
      showToast('Please complete all required contact and shipping details.', 'remove');
      return;
    }

    // Check for out of stock items
    const outOfStockItem = cart.find(item => {
      const st = getProductStockStatus(item.product);
      return st.isOut;
    });
    if (outOfStockItem) {
      showToast(`Cannot proceed: "${outOfStockItem.product.name}" is currently out of stock. Please remove it from your cart.`, 'remove');
      return;
    }

    setIsSubmitting(true);

    if (paymentMethod === 'shopify') {
      try {
        const lineItems = cart.map(item => ({
          id: `line_${item.product.id}_${item.variant?.id || 'std'}`,
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          variantId: item.variant?.id || item.product.id,
          variantName: item.variant?.name || 'Standard',
          unitPrice: item.variant?.price || item.product.price,
          quantity: item.quantity,
          weightGrams: item.product.weight || 250,
        }));
        const commerceCart = createCart(lineItems, appliedCoupon?.code);
        const response = await getCheckoutUrl(commerceCart, { name, phone, address, city });
        if (response.checkoutUrl) {
          setGeneratedUrl(response.checkoutUrl);
          setOrderSuccess(true);
          showToast('Shopify Storefront Checkout Created!', 'success');
        } else {
          showToast('Falling back to direct WhatsApp Order Confirmation.', 'info');
          setOrderSuccess(true);
        }
      } catch (err) {
        console.error(err);
        setOrderSuccess(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Direct COD or Bank Transfer confirmation
      setTimeout(() => {
        setIsSubmitting(false);
        setOrderSuccess(true);
        showToast('Order details verified! Click to confirm on WhatsApp.', 'success');
      }, 600);
    }
  };

  const generateWhatsappMessageUrl = () => {
    let msg = `🛒 *NEW STORE ORDER - KCC ONLINE SHOP*\n\n`;
    msg += `*Customer Details:*\n`;
    msg += `• Name: ${name}\n`;
    msg += `• Phone: ${phone}\n`;
    msg += `• Shipping Method: ${shippingMethod === 'delivery' ? 'Home Courier Delivery' : 'Self Store Pickup'}\n`;
    if (shippingMethod === 'delivery') {
      msg += `• City: ${city}\n`;
      msg += `• Delivery Address: ${address}\n`;
    }
    msg += `• Payment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : paymentMethod === 'bank' ? 'Bank Transfer' : 'Online Storefront'}\n`;
    if (notes.trim()) {
      msg += `• Customer Notes: ${notes}\n`;
    }

    msg += `\n*Order Items Summary:*\n`;
    cart.forEach(item => {
      const vName = item.variant ? item.variant.name : 'Standard';
      const unitP = item.variant ? item.variant.price : item.product.price;
      msg += `• ${item.quantity}x ${item.product.name} [${vName}] = Rs.${(unitP * item.quantity).toLocaleString()}\n`;
    });

    msg += `\n*Billing Breakdown:*\n`;
    msg += `Subtotal: Rs.${itemsSubtotal.toLocaleString()}\n`;
    msg += `Total Weight: ${totalWeightGrams >= 1000 ? `${(totalWeightGrams / 1000).toFixed(2)} kg` : `${totalWeightGrams} g`}\n`;
    if (discountAmount > 0) {
      msg += `Coupon Discount (${appliedCoupon?.code}): -Rs.${discountAmount.toLocaleString()}\n`;
    }
    msg += `Postage/Delivery Fee: Rs.${deliveryCharge.toLocaleString()}\n`;
    msg += `*Grand Total Payable: Rs.${grandTotal.toLocaleString()}*\n\n`;
    msg += `Please confirm my order dispatch. Thank you!`;

    return `${activeWhatsappLink}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-black/10 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-brand-dark via-zinc-900 to-brand-dark text-white flex justify-between items-center relative">
          <div className="space-y-1 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-primary/20 text-brand-secondary border border-brand-primary/30 text-[10px] font-extrabold uppercase tracking-widest">
              <ShieldCheck size={13} /> Headless Commerce Checkout
            </div>
            <h3 className="text-2xl font-display font-extrabold">Complete Your Order</h3>
            <p className="text-xs text-white/70">{cart.length} Product Line Items • Total: Rs.{grandTotal.toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer z-10"
          >
            <X size={20} />
          </button>
        </div>

        {orderSuccess ? (
          /* Success Screen */
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-brand-dark">Order Verification Ready!</h3>
              <p className="text-xs text-brand-gray max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{name}</strong>! Click below to send your structured order details to KCC Support on WhatsApp for instant confirmation and dispatch.
              </p>
            </div>

            {generatedUrl && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-left space-y-2">
                <span className="text-[10px] font-black uppercase text-blue-900 block">Shopify Storefront Link:</span>
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono font-bold text-blue-600 underline break-all flex items-center gap-1"
                >
                  {generatedUrl} <ArrowRight size={12} />
                </a>
              </div>
            )}

            <div className="flex flex-col gap-3 max-w-md mx-auto pt-2">
              <a
                href={generateWhatsappMessageUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  onClearCart();
                  onClose();
                }}
                className="btn-primary py-4 text-sm font-extrabold justify-center bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 gap-2 cursor-pointer"
              >
                Confirm & Send Order via WhatsApp <ArrowRight size={18} />
              </a>

              <button
                onClick={() => {
                  onClearCart();
                  onClose();
                }}
                className="py-3 text-xs font-bold text-brand-gray hover:text-brand-dark uppercase tracking-wider"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleConfirmCheckout} className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Cart Items Preview & Stock Alerts */}
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark">
                Selected Items ({cart.reduce((s, i) => s + i.quantity, 0)} Units)
              </label>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {cart.map((item, idx) => {
                  const stockStatus = getProductStockStatus(item.product);
                  const unitPrice = item.variant ? item.variant.price : item.product.price;
                  return (
                    <div key={idx} className="p-2.5 rounded-2xl bg-brand-light/60 border border-black/5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={item.product.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-black/10 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-brand-dark truncate">{item.product.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-brand-gray">
                            <span>Qty: <strong className="font-mono text-brand-dark">{item.quantity}</strong></span>
                            {item.variant && <span>• {item.variant.name}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-brand-primary block">
                          Rs.{(unitPrice * item.quantity).toLocaleString()}
                        </span>
                        {stockStatus.isOut ? (
                          <span className="text-[10px] text-red-600 font-extrabold flex items-center gap-1 justify-end">
                            <AlertCircle size={11} /> Out of Stock
                          </span>
                        ) : stockStatus.isLow ? (
                          <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1 justify-end">
                            <AlertTriangle size={11} /> Only {stockStatus.stock} left
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            ✓ In Stock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Method Toggle */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark mb-2">
                1. Delivery Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShippingMethod('delivery')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    shippingMethod === 'delivery'
                      ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                      : 'bg-brand-light text-brand-gray border-black/10 hover:bg-black/5'
                  }`}
                >
                  <Truck size={16} /> Home Courier Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setShippingMethod('pickup')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    shippingMethod === 'pickup'
                      ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                      : 'bg-brand-light text-brand-gray border-black/10 hover:bg-black/5'
                  }`}
                >
                  <MapPin size={16} /> Store Self Pickup (Free)
                </button>
              </div>
            </div>

            {/* Customer Shipping Form */}
            <div className="space-y-4">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark">
                2. Shipping & Contact Info
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-brand-gray mb-1">Full Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-3.5 text-brand-gray" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Muhammad Ali"
                      className="w-full bg-brand-light border border-black/10 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-brand-gray mb-1">Mobile / WhatsApp Number *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3.5 text-brand-gray" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0300 1234567"
                      className="w-full bg-brand-light border border-black/10 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20 font-mono"
                    />
                  </div>
                </div>
              </div>

              {shippingMethod === 'delivery' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold uppercase text-brand-gray mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lahore / Karachi"
                      className="w-full bg-brand-light border border-black/10 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-brand-gray mb-1">Complete Street Address *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Shop #, Street name, Area"
                      className="w-full bg-brand-light border border-black/10 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="p-4 bg-brand-light/60 rounded-2xl border border-black/5 space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                <Tag size={14} className="text-brand-primary" /> Promo / Wholesale Coupon
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter KCC10 or WHOLESALE"
                  className="flex-grow bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-brand-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle size={12} /> Active Coupon: <strong>{appliedCoupon.code}</strong> {appliedCoupon.discountPercent > 0 ? `(${appliedCoupon.discountPercent}% Off)` : '(Free Shipping)'}
                </p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark mb-2">
                3. Payment Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm ring-1 ring-brand-primary'
                      : 'bg-white border-black/10 text-brand-gray hover:bg-brand-light'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold">
                    <Truck size={14} /> Cash on Delivery
                  </div>
                  <span className="text-[10px] font-normal text-brand-gray">Pay upon delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'bank'
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm ring-1 ring-brand-primary'
                      : 'bg-white border-black/10 text-brand-gray hover:bg-brand-light'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold">
                    <Building size={14} /> Bank Transfer / EasyPaisa
                  </div>
                  <span className="text-[10px] font-normal text-brand-gray">Direct account transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('shopify')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'shopify'
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm ring-1 ring-brand-primary'
                      : 'bg-white border-black/10 text-brand-gray hover:bg-brand-light'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold">
                    <CreditCard size={14} /> Online Checkout
                  </div>
                  <span className="text-[10px] font-normal text-brand-gray">Shopify Storefront API</span>
                </button>
              </div>
            </div>

            {/* Summary Breakdown Box */}
            <div className="bg-brand-light p-4 rounded-2xl border border-black/5 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-brand-gray">
                <span>Items Subtotal:</span>
                <span className="font-mono text-brand-dark">Rs.{itemsSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-gray">
                <span>Total Weight:</span>
                <span className="font-mono text-brand-dark">{totalWeightGrams >= 1000 ? `${(totalWeightGrams / 1000).toFixed(2)} kg` : `${totalWeightGrams} g`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-Rs.{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-gray">
                <span>Postage / Delivery Charge:</span>
                <span className="font-mono text-brand-dark">{deliveryCharge === 0 ? 'Free' : `Rs.${deliveryCharge.toLocaleString()}`}</span>
              </div>
              <div className="h-px bg-black/10 my-1"></div>
              <div className="flex justify-between text-brand-dark font-extrabold text-sm">
                <span>Grand Total Payable:</span>
                <span className="font-mono text-brand-primary text-base">Rs.{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full h-14 justify-center text-base shadow-xl shadow-brand-primary/20 gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">Generating Order...</span>
                ) : (
                  <>
                    Proceed to Order Confirmation <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
