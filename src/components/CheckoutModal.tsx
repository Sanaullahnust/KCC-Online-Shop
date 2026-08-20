import { useState, FormEvent } from 'react';
import { X, ShoppingBag, Truck, MapPin, CheckCircle, CreditCard, ArrowRight, Sparkles, AlertCircle, Building, Phone, User, ShieldCheck, Tag, AlertTriangle, Copy, Check, Image as ImageIcon, Globe, Clock, QrCode } from 'lucide-react';
import { Product, getProductStockStatus, StoreSettings, SHIPPING_COUNTRIES, ShippingCountry } from '../types';
import { ProductVariant, getCheckoutUrl, createCart, getCommerceConfigStatus } from '../lib/commerceApi';
import { PaymentQrCodeSection } from './PaymentQrCodeSection';

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
  storeSettings?: StoreSettings;
  onUpdateStoreSettings?: (newSettings: StoreSettings) => void;
  isAdmin?: boolean;
  initialCountry?: string;
  initialShippingMethod?: 'delivery' | 'pickup';
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  activeWhatsappLink,
  onClearCart,
  showToast,
  storeSettings,
  onUpdateStoreSettings,
  isAdmin = true,
  initialCountry = 'Pakistan',
  initialShippingMethod = 'delivery'
}: CheckoutModalProps) {
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>(initialShippingMethod);
  const [shippingCountry, setShippingCountry] = useState<string>(initialCountry);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'shopify'>('bank');
  const [paymentViewTab, setPaymentViewTab] = useState<'qr' | 'manual'>('qr');
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  // Account details resolution
  const bankName = storeSettings?.bankName || 'Meezan Bank Ltd / Bank Alfalah';
  const accountTitle = storeSettings?.bankAccountTitle || 'KCC Online Wholesale Shop';
  const accountNumber = storeSettings?.bankAccountNumber || '01020105829102';
  const iban = storeSettings?.bankIban || 'PK36MEZN0001020105829102';
  const easypaisaNumber = storeSettings?.easypaisaNumber || storeSettings?.storePhone || '03295147517';
  const easypaisaTitle = storeSettings?.easypaisaTitle || 'KCC Store';
  const jazzcashNumber = storeSettings?.jazzcashNumber || storeSettings?.storePhone || '03295147517';
  const jazzcashTitle = storeSettings?.jazzcashTitle || 'KCC Store';
  const raastId = storeSettings?.raastId || storeSettings?.storePhone || '03295147517';

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

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
  const countryData = SHIPPING_COUNTRIES.find(c => c.name === shippingCountry) || SHIPPING_COUNTRIES[0];
  if (shippingMethod === 'delivery' && !appliedCoupon?.isFreeShipping) {
    if (countryData.isDomestic) {
      const fee500g = storeSettings?.deliveryFee500g || countryData.fee500g || 250;
      const fee1kg = storeSettings?.deliveryFee1kg || countryData.fee1kg || 400;
      if (totalWeightGrams <= 500) {
        deliveryCharge = fee500g;
      } else if (totalWeightGrams <= 1000) {
        deliveryCharge = fee1kg;
      } else {
        deliveryCharge = fee1kg + Math.ceil((totalWeightGrams - 1000) / 500) * (countryData.extra500g || 150);
      }
    } else {
      if (totalWeightGrams <= 500) {
        deliveryCharge = countryData.fee500g;
      } else if (totalWeightGrams <= 1000) {
        deliveryCharge = countryData.fee1kg;
      } else {
        deliveryCharge = countryData.fee1kg + Math.ceil((totalWeightGrams - 1000) / 500) * countryData.extra500g;
      }
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
          showToast('Order details verified! Please share transfer screenshot on WhatsApp.', 'info');
          setOrderSuccess(true);
        }
      } catch (err) {
        console.error(err);
        setOrderSuccess(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Direct Bank Transfer / Mobile Wallet confirmation
      setTimeout(() => {
        setIsSubmitting(false);
        setOrderSuccess(true);
        showToast('Order created! Please share your payment screenshot on WhatsApp.', 'success');
      }, 500);
    }
  };

  const generateWhatsappMessageUrl = () => {
    let msg = `🛒 *NEW STORE ORDER - KCC ONLINE SHOP*\n\n`;
    msg += `*Customer Details:*\n`;
    msg += `• Name: ${name}\n`;
    msg += `• Phone: ${phone}\n`;
    msg += `• Shipping Method: ${shippingMethod === 'delivery' ? `Home Courier Delivery (${shippingCountry})` : 'Self Store Pickup'}\n`;
    if (shippingMethod === 'delivery') {
      msg += `• Destination Country: ${shippingCountry}\n`;
      msg += `• City: ${city}\n`;
      msg += `• Delivery Address: ${address}\n`;
      msg += `• Estimated Delivery: ${shippingCountry === 'Pakistan' ? '2-3 business days in Pakistan' : `10-12 working days outside Pakistan internationally selected country (${shippingCountry})`}\n`;
    }
    msg += `• Payment Method: Advance Payment Transfer (Bank / EasyPaisa / JazzCash / Raast)\n`;
    msg += `• Payment Status: Transfer Completed\n`;
    msg += `📸 *Payment Screenshot:* [Attached below in this WhatsApp chat for immediate verification]\n`;
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
    msg += `Postage/Delivery Fee: Rs.${deliveryCharge.toLocaleString()} (${shippingCountry})\n`;
    msg += `*Grand Total Paid: Rs.${grandTotal.toLocaleString()}*\n\n`;
    msg += `Kindly verify my payment transfer screenshot and dispatch the order timely. Thank you!`;

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
          <div className="p-6 md:p-8 space-y-6 text-center max-h-[80vh] overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-brand-dark">Order Ready! Share Screenshot on WhatsApp</h3>
              <p className="text-xs text-brand-gray max-w-lg mx-auto leading-relaxed">
                Thank you, <strong>{name}</strong>! Your order has been registered for <strong>Rs.{grandTotal.toLocaleString()}</strong>.
                To confirm payment and ensure <span className="text-emerald-700 font-bold">timely parcel dispatch</span>, please transfer the total amount and share your payment transfer screenshot in our WhatsApp chat.
              </p>
            </div>

            {/* Payment & QR Codes in Success Screen */}
            <div className="space-y-3">
              <PaymentQrCodeSection 
                storeSettings={storeSettings}
                payableAmount={grandTotal}
                onUpdateStoreSettings={onUpdateStoreSettings}
                isAdmin={isAdmin}
                showToast={showToast}
              />

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5 text-left">
                <ImageIcon size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <span><strong>Step 2 (Dispatch Verification):</strong> Scan the QR code or transfer to any account above. Then click the WhatsApp button below to attach your payment receipt / screenshot. Your parcel will be verified and dispatched timely!</span>
              </div>
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
                className="btn-primary py-4 text-sm font-extrabold justify-center bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 gap-2 cursor-pointer text-white"
              >
                Send Order & Share Screenshot on WhatsApp 📸 <ArrowRight size={18} />
              </a>

              <button
                onClick={() => {
                  onClearCart();
                  onClose();
                }}
                className="py-3 text-xs font-bold text-brand-gray hover:text-brand-dark uppercase tracking-wider cursor-pointer"
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

              {shippingMethod === 'delivery' && (
                <div className="mt-3 space-y-2">
                  <div className="p-3 bg-white rounded-2xl border border-black/10 flex items-center gap-2.5">
                    <Globe size={16} className="text-brand-primary shrink-0" />
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold uppercase text-brand-gray mb-0.5">Destination Country</label>
                      <select
                        value={shippingCountry}
                        onChange={(e) => setShippingCountry(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-brand-dark outline-none cursor-pointer"
                      >
                        {SHIPPING_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name} {c.isDomestic ? '(Pakistan Domestic: 2-3 Days)' : '(International Express: 10-12 Days)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clear Delivery Timeline Notice Banner */}
                  <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/90 rounded-2xl text-emerald-950 text-xs flex items-start gap-2.5 shadow-2xs">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <Clock size={15} />
                    </div>
                    <div className="space-y-1 text-left flex-1 min-w-0">
                      <p className="font-extrabold text-emerald-950 leading-snug">
                        Estimated delivery: 2-3 business days in Pakistan and 10-12 working days outside Pakistan internationally selected country
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold pt-0.5">
                        <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-zinc-800">
                          📍 Selected: <strong>{shippingCountry}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md font-extrabold">
                          ⏱️ {shippingCountry === 'Pakistan' ? '2-3 Business Days' : '10-12 Working Days'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark">
                3. Payment Method & Verification
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'bank'
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-black/10 text-brand-gray hover:bg-brand-light'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold text-emerald-900">
                    <Building size={16} className="text-emerald-600" /> Advance Bank / Digital Transfer
                  </div>
                  <span className="text-[10px] font-normal text-emerald-700">Meezan Bank, EasyPaisa, JazzCash, Raast</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('shopify')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'shopify'
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm ring-2 ring-brand-primary/20'
                      : 'bg-white border-black/10 text-brand-gray hover:bg-brand-light'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold">
                    <CreditCard size={16} /> Online Checkout
                  </div>
                  <span className="text-[10px] font-normal text-brand-gray">Shopify Storefront API</span>
                </button>
              </div>

              {/* Bank Accounts & QR Codes when Bank Transfer is selected */}
              {paymentMethod === 'bank' && (
                <div className="space-y-3">
                  {/* View switch tabs */}
                  <div className="flex items-center justify-between bg-zinc-100 p-1 rounded-xl border border-black/5">
                    <button
                      type="button"
                      onClick={() => setPaymentViewTab('qr')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentViewTab === 'qr'
                          ? 'bg-white text-emerald-900 shadow-xs font-extrabold'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <QrCode size={14} className="text-emerald-600" />
                      <span>Scan Payment QR Codes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentViewTab('manual')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentViewTab === 'manual'
                          ? 'bg-white text-zinc-900 shadow-xs font-extrabold'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <Building size={14} className="text-zinc-600" />
                      <span>Account Digits & IBAN</span>
                    </button>
                  </div>

                  {paymentViewTab === 'qr' ? (
                    <PaymentQrCodeSection 
                      storeSettings={storeSettings}
                      payableAmount={grandTotal}
                      onUpdateStoreSettings={onUpdateStoreSettings}
                      isAdmin={isAdmin}
                      showToast={showToast}
                    />
                  ) : (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                        <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                          <Building size={14} className="text-emerald-700" /> Official Bank & Wallet Accounts
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                          Amount: Rs.{grandTotal.toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {/* Bank Al Habib info */}
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-brand-gray uppercase">
                            <span>Bank AL Habib</span>
                            <span className="text-blue-700 font-extrabold">Bank</span>
                          </div>
                          <p className="font-bold text-brand-dark text-xs">{storeSettings?.bankAlHabibTitle || 'KCC Wholesale Traders'}</p>
                          <div className="flex items-center justify-between font-mono font-bold text-blue-700 pt-0.5">
                            <span className="text-xs">Acc: {storeSettings?.bankAlHabibAccountNumber || '1029-0981-002341-01-9'}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(storeSettings?.bankAlHabibAccountNumber || '1029-0981-002341-01-9', 'Bank AL Habib Account Number', 'form_bahl')}
                              className="p-1 hover:bg-blue-50 rounded text-brand-gray hover:text-blue-700 transition-colors"
                              title="Copy Bank AL Habib Account"
                            >
                              {copiedKey === 'form_bahl' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          </div>
                          <div className="flex items-center justify-between font-mono text-[10px] text-zinc-600">
                            <span className="truncate pr-1">IBAN: {storeSettings?.bankAlHabibIban || 'PK45BAHL1029098100234101'}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(storeSettings?.bankAlHabibIban || 'PK45BAHL1029098100234101', 'Bank AL Habib IBAN', 'form_bahliban')}
                              className="p-1 hover:bg-blue-50 rounded text-brand-gray hover:text-blue-700 transition-colors"
                              title="Copy Bank AL Habib IBAN"
                            >
                              {copiedKey === 'form_bahliban' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>

                        {/* Meezan Bank info */}
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-brand-gray uppercase">
                            <span>{bankName}</span>
                            <span className="text-emerald-700 font-extrabold">Bank</span>
                          </div>
                          <p className="font-bold text-brand-dark text-xs">{accountTitle}</p>
                          <div className="flex items-center justify-between font-mono font-bold text-emerald-700 pt-0.5">
                            <span className="text-xs">Acc: {accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(accountNumber, 'Account Number', 'form_acc')}
                              className="p-1 hover:bg-emerald-50 rounded text-brand-gray hover:text-emerald-700 transition-colors"
                              title="Copy Account Number"
                            >
                              {copiedKey === 'form_acc' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          </div>
                          <div className="flex items-center justify-between font-mono text-[10px] text-zinc-600">
                            <span className="truncate pr-1">IBAN: {iban}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(iban, 'IBAN', 'form_iban')}
                              className="p-1 hover:bg-emerald-50 rounded text-brand-gray hover:text-emerald-700 transition-colors"
                              title="Copy IBAN"
                            >
                              {copiedKey === 'form_iban' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>

                        {/* Mobile Wallet Easypaisa */}
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-brand-gray uppercase">
                            <span>EasyPaisa</span>
                            <span className="text-emerald-700 font-extrabold">Wallet</span>
                          </div>
                          <p className="font-bold text-brand-dark text-xs">{easypaisaTitle}</p>
                          <div className="flex items-center justify-between font-mono font-bold text-emerald-700 pt-0.5">
                            <span className="text-xs">{easypaisaNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(easypaisaNumber, 'EasyPaisa Number', 'form_ep')}
                              className="p-1 hover:bg-emerald-50 rounded text-brand-gray hover:text-emerald-700 transition-colors"
                              title="Copy EasyPaisa Number"
                            >
                              {copiedKey === 'form_ep' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>

                        {/* Mobile Wallet JazzCash & Raast */}
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-brand-gray uppercase">
                            <span>JazzCash & Raast</span>
                            <span className="text-red-700 font-extrabold">Wallet</span>
                          </div>
                          <p className="font-bold text-brand-dark text-xs">{jazzcashTitle}</p>
                          <div className="flex items-center justify-between font-mono font-bold text-red-700 pt-0.5">
                            <span className="text-xs">{jazzcashNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(jazzcashNumber, 'JazzCash Number', 'form_jc')}
                              className="p-1 hover:bg-red-50 rounded text-brand-gray hover:text-red-700 transition-colors"
                              title="Copy JazzCash Number"
                            >
                              {copiedKey === 'form_jc' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          </div>
                          <p className="text-[10px] text-brand-gray">Raast ID: <strong className="font-mono text-brand-dark">{raastId}</strong></p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Screenshot requirement warning banner */}
                  <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 leading-relaxed">
                    <ImageIcon size={17} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-amber-950 mb-0.5">📸 WhatsApp Payment Screenshot Required for Dispatch:</strong>
                      Please complete your payment transfer by scanning the QR code or copying the account details above, and share the screenshot in the WhatsApp chat after placing the order. Your order will be packed and dispatched timely upon verification.
                    </div>
                  </div>
                </div>
              )}
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
                  <span className="font-mono">-Rs.${discountAmount.toLocaleString()}</span>
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
