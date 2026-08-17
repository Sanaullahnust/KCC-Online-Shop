import { useState } from 'react';
import { Zap, ShoppingBag, Globe, CheckCircle2, Info, X, Key, Layers, ArrowUpRight } from 'lucide-react';
import { getCommerceConfigStatus, CommerceStatus } from '../lib/commerceApi';

interface CommerceEngineBadgeProps {
  onOpenDetails?: () => void;
  className?: string;
}

export function CommerceEngineBadge({ className = '' }: CommerceEngineBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const status: CommerceStatus = getCommerceConfigStatus();

  const getEngineColor = () => {
    switch (status.activeEngine) {
      case 'shopify':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
      case 'woocommerce':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
      default:
        return 'bg-blue-500/10 text-blue-800 border-blue-500/30';
    }
  };

  const getEngineLabel = () => {
    switch (status.activeEngine) {
      case 'shopify':
        return 'Shopify Storefront API';
      case 'woocommerce':
        return 'WooCommerce REST API';
      default:
        return 'KCC Local Catalog';
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-extrabold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer shadow-sm ${getEngineColor()} ${className}`}
        title="Click to inspect Commerce Engine Integration Status"
      >
        <Zap size={13} className="animate-pulse text-current" />
        <span>{getEngineLabel()}</span>
        <Info size={11} className="opacity-60 ml-0.5" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-black/10 animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-gradient-to-r from-brand-dark via-zinc-900 to-black text-white flex justify-between items-start">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-extrabold uppercase tracking-widest">
                  <Layers size={12} /> Integration Layer
                </div>
                <h3 className="text-xl font-display font-extrabold">Commerce Integration Status</h3>
                <p className="text-xs text-white/70">Connected Engine: <strong>{getEngineLabel()}</strong></p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-brand-dark max-h-[75vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-900 mb-1">Status: {status.message}</h4>
                  <p className="text-emerald-800 leading-relaxed">
                    Our headless architecture abstracts Shopify Storefront API and WooCommerce REST API. All private API keys and tokens remain strictly server-side.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-brand-gray text-[10px]">Environment Variables Mapping</h4>
                <div className="bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-[11px] space-y-2 overflow-x-auto border border-zinc-800">
                  <div><span className="text-emerald-400"># Shopify Public Client Variables</span></div>
                  <div>VITE_SHOPIFY_STORE_DOMAIN={import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || 'kcconline.myshopify.com'}</div>
                  <div>VITE_SHOPIFY_STOREFRONT_TOKEN={import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN ? '••••••••' : 'placeholder_token'}</div>
                  <div className="pt-2"><span className="text-purple-400"># WooCommerce Server-Side Variables</span></div>
                  <div>VITE_WOOCOMMERCE_API_URL={import.meta.env.VITE_WOOCOMMERCE_API_URL || 'https://kcconline.shop'}</div>
                  <div>WOOCOMMERCE_CONSUMER_KEY=(Server Side Only)</div>
                  <div>WOOCOMMERCE_CONSUMER_SECRET=(Server Side Only)</div>
                </div>
              </div>

              <div className="bg-brand-light p-4 rounded-2xl border border-black/5 space-y-2">
                <h4 className="font-bold text-brand-dark flex items-center gap-1.5">
                  <Key size={14} className="text-brand-primary" /> Security Guarantee
                </h4>
                <p className="text-brand-gray leading-relaxed text-[11px]">
                  Private API credentials and keys are proxy-routed through our backend server (<code className="bg-white px-1.5 py-0.5 rounded border border-black/10">server.ts</code>). No secret keys are exposed in client-side JS bundles.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-brand-dark hover:bg-black text-white font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
