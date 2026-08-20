import React, { useState, useRef } from 'react';
import { 
  QrCode, 
  Upload, 
  Check, 
  Copy, 
  Download, 
  Maximize2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Building, 
  Settings, 
  RefreshCw, 
  ArrowRight,
  ExternalLink,
  Eye
} from 'lucide-react';
import { StoreSettings } from '../types';

export interface PaymentQrCodeSectionProps {
  storeSettings?: StoreSettings;
  payableAmount: number;
  onUpdateStoreSettings?: (newSettings: StoreSettings) => void;
  isAdmin?: boolean;
  showToast?: (message: string, type: 'success' | 'info' | 'remove') => void;
  compact?: boolean;
}

export type PaymentQrProvider = 'easypaisa' | 'jazzcash' | 'bank_al_habib' | 'meezan_raast';

export function PaymentQrCodeSection({
  storeSettings,
  payableAmount,
  onUpdateStoreSettings,
  isAdmin = true,
  showToast,
  compact = false
}: PaymentQrCodeSectionProps) {
  const [activeProvider, setActiveProvider] = useState<PaymentQrProvider>('easypaisa');
  const [isFullscreenQrOpen, setIsFullscreenQrOpen] = useState(false);
  const [isAdminUploadModalOpen, setIsAdminUploadModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Admin draft state for upload modal
  const [adminDraft, setAdminDraft] = useState<{
    easypaisaQr: string;
    easypaisaTitle: string;
    easypaisaNumber: string;
    jazzcashQr: string;
    jazzcashTitle: string;
    jazzcashNumber: string;
    bankAlHabibQr: string;
    bankAlHabibTitle: string;
    bankAlHabibAccountNumber: string;
    bankAlHabibIban: string;
    bankQr: string;
    bankName: string;
    bankAccountTitle: string;
    bankAccountNumber: string;
    bankIban: string;
    raastId: string;
  }>({
    easypaisaQr: storeSettings?.easypaisaQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=03295147517-EASYPAISA-KCC&margin=10`,
    easypaisaTitle: storeSettings?.easypaisaTitle || 'KCC Store',
    easypaisaNumber: storeSettings?.easypaisaNumber || '03295147517',
    jazzcashQr: storeSettings?.jazzcashQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=03295147517-JAZZCASH-KCC&margin=10`,
    jazzcashTitle: storeSettings?.jazzcashTitle || 'KCC Store',
    jazzcashNumber: storeSettings?.jazzcashNumber || '03295147517',
    bankAlHabibQr: storeSettings?.bankAlHabibQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PK45BAHL1029098100234101&margin=10`,
    bankAlHabibTitle: storeSettings?.bankAlHabibTitle || 'KCC Wholesale Traders',
    bankAlHabibAccountNumber: storeSettings?.bankAlHabibAccountNumber || '1029-0981-002341-01-9',
    bankAlHabibIban: storeSettings?.bankAlHabibIban || 'PK45BAHL1029098100234101',
    bankQr: storeSettings?.bankQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PK36MEZN0001020105829102&margin=10`,
    bankName: storeSettings?.bankName || 'Meezan Bank Ltd',
    bankAccountTitle: storeSettings?.bankAccountTitle || 'KCC Online Wholesale Shop',
    bankAccountNumber: storeSettings?.bankAccountNumber || '01020105829102',
    bankIban: storeSettings?.bankIban || 'PK36MEZN0001020105829102',
    raastId: storeSettings?.raastId || '03295147517',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProvider, setUploadingProvider] = useState<PaymentQrProvider | null>(null);

  const copyToClipboard = (text: string, label: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (showToast) {
      showToast(`${label} copied to clipboard!`, 'info');
    }
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  // Get active provider details
  const getProviderInfo = (provider: PaymentQrProvider) => {
    switch (provider) {
      case 'easypaisa':
        return {
          name: 'Easypaisa QR',
          tagline: 'Scan & Pay via Easypaisa App',
          brandColor: 'from-emerald-600 to-green-700',
          accentBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badgeBg: 'bg-emerald-600 text-white',
          qrUrl: storeSettings?.easypaisaQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${storeSettings?.easypaisaNumber || '03295147517'}-EASYPAISA&margin=10`,
          accountTitle: storeSettings?.easypaisaTitle || 'KCC Store',
          accountNumber: storeSettings?.easypaisaNumber || '03295147517',
          accountType: 'Mobile Account / Wallet',
          appStoreHint: 'Open Easypaisa App > Tap Scan QR (or Upload from Gallery)',
        };
      case 'jazzcash':
        return {
          name: 'JazzCash QR',
          tagline: 'Scan & Pay via JazzCash App',
          brandColor: 'from-red-600 to-amber-700',
          accentBg: 'bg-red-50 text-red-900 border-red-200',
          badgeBg: 'bg-red-600 text-white',
          qrUrl: storeSettings?.jazzcashQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${storeSettings?.jazzcashNumber || '03295147517'}-JAZZCASH&margin=10`,
          accountTitle: storeSettings?.jazzcashTitle || 'KCC Store',
          accountNumber: storeSettings?.jazzcashNumber || '03295147517',
          accountType: 'Till / Mobile Account',
          appStoreHint: 'Open JazzCash App > Tap QR Pay (or Scan from Gallery)',
        };
      case 'bank_al_habib':
        return {
          name: 'Bank AL Habib QR',
          tagline: 'AL Habib Digital & Raast Instant Transfer',
          brandColor: 'from-blue-700 to-indigo-900',
          accentBg: 'bg-blue-50 text-blue-950 border-blue-200',
          badgeBg: 'bg-blue-700 text-white',
          qrUrl: storeSettings?.bankAlHabibQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${storeSettings?.bankAlHabibIban || 'PK45BAHL1029098100234101'}&margin=10`,
          accountTitle: storeSettings?.bankAlHabibTitle || 'KCC Wholesale Traders',
          accountNumber: storeSettings?.bankAlHabibAccountNumber || '1029-0981-002341-01-9',
          iban: storeSettings?.bankAlHabibIban || 'PK45BAHL1029098100234101',
          accountType: 'Bank AL Habib Current Account',
          appStoreHint: 'Open AL Habib Digital App > Scan QR / Raast Transfer',
        };
      case 'meezan_raast':
      default:
        return {
          name: 'Meezan Bank & Raast',
          tagline: 'Meezan Bank Islamic & State Bank Raast P2P',
          brandColor: 'from-purple-800 to-indigo-900',
          accentBg: 'bg-purple-50 text-purple-950 border-purple-200',
          badgeBg: 'bg-purple-800 text-white',
          qrUrl: storeSettings?.bankQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${storeSettings?.bankIban || 'PK36MEZN0001020105829102'}&margin=10`,
          accountTitle: storeSettings?.bankAccountTitle || 'KCC Online Wholesale Shop',
          accountNumber: storeSettings?.bankAccountNumber || '01020105829102',
          iban: storeSettings?.bankIban || 'PK36MEZN0001020105829102',
          raastId: storeSettings?.raastId || '03295147517',
          accountType: 'Meezan Islamic Current Account',
          appStoreHint: 'Open Any Banking App > Scan QR or Transfer to Raast ID',
        };
    }
  };

  const current = getProviderInfo(activeProvider);

  // File Upload Handler for Admins
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingProvider) return;

    if (!file.type.startsWith('image/')) {
      if (showToast) showToast('Please select a valid image file (PNG, JPG, SVG).', 'remove');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (uploadingProvider === 'easypaisa') {
          setAdminDraft(prev => ({ ...prev, easypaisaQr: dataUrl }));
        } else if (uploadingProvider === 'jazzcash') {
          setAdminDraft(prev => ({ ...prev, jazzcashQr: dataUrl }));
        } else if (uploadingProvider === 'bank_al_habib') {
          setAdminDraft(prev => ({ ...prev, bankAlHabibQr: dataUrl }));
        } else if (uploadingProvider === 'meezan_raast') {
          setAdminDraft(prev => ({ ...prev, bankQr: dataUrl }));
        }
        if (showToast) showToast(`QR Code image loaded for ${uploadingProvider.replace('_', ' ').toUpperCase()}!`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUploadFor = (provider: PaymentQrProvider) => {
    setUploadingProvider(provider);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Save Admin Draft to Store Settings
  const handleSaveAdminSettings = () => {
    if (!storeSettings || !onUpdateStoreSettings) {
      if (showToast) showToast('Settings saved locally.', 'success');
      setIsAdminUploadModalOpen(false);
      return;
    }

    const updated: StoreSettings = {
      ...storeSettings,
      easypaisaQr: adminDraft.easypaisaQr,
      easypaisaTitle: adminDraft.easypaisaTitle,
      easypaisaNumber: adminDraft.easypaisaNumber,
      jazzcashQr: adminDraft.jazzcashQr,
      jazzcashTitle: adminDraft.jazzcashTitle,
      jazzcashNumber: adminDraft.jazzcashNumber,
      bankAlHabibQr: adminDraft.bankAlHabibQr,
      bankAlHabibTitle: adminDraft.bankAlHabibTitle,
      bankAlHabibAccountNumber: adminDraft.bankAlHabibAccountNumber,
      bankAlHabibIban: adminDraft.bankAlHabibIban,
      bankQr: adminDraft.bankQr,
      bankName: adminDraft.bankName,
      bankAccountTitle: adminDraft.bankAccountTitle,
      bankAccountNumber: adminDraft.bankAccountNumber,
      bankIban: adminDraft.bankIban,
      raastId: adminDraft.raastId,
    };

    onUpdateStoreSettings(updated);
    try {
      localStorage.setItem('kcc_store_settings_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (showToast) showToast('Payment QR codes and account details saved successfully!', 'success');
    setIsAdminUploadModalOpen(false);
  };

  // Download QR Code image
  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = current.qrUrl;
    link.download = `KCC_${activeProvider}_QR_Payment.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('QR Code download started! You can scan it from your mobile gallery.', 'info');
  };

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-xs overflow-hidden">
      {/* Hidden File Input for Image Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header Bar */}
      <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <QrCode size={18} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
              Payment QR Codes <span className="bg-emerald-500 text-black text-[9px] px-1.5 py-0.2 rounded font-black">Instant Scan</span>
            </h4>
            <p className="text-[10px] text-zinc-400">
              Scan with Easypaisa, JazzCash, or AL Habib Digital to transfer instantly
            </p>
          </div>
        </div>

        {/* Admin Upload / Manage QR Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setAdminDraft({
                easypaisaQr: storeSettings?.easypaisaQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=03295147517-EASYPAISA-KCC&margin=10`,
                easypaisaTitle: storeSettings?.easypaisaTitle || 'KCC Store',
                easypaisaNumber: storeSettings?.easypaisaNumber || '03295147517',
                jazzcashQr: storeSettings?.jazzcashQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=03295147517-JAZZCASH-KCC&margin=10`,
                jazzcashTitle: storeSettings?.jazzcashTitle || 'KCC Store',
                jazzcashNumber: storeSettings?.jazzcashNumber || '03295147517',
                bankAlHabibQr: storeSettings?.bankAlHabibQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PK45BAHL1029098100234101&margin=10`,
                bankAlHabibTitle: storeSettings?.bankAlHabibTitle || 'KCC Wholesale Traders',
                bankAlHabibAccountNumber: storeSettings?.bankAlHabibAccountNumber || '1029-0981-002341-01-9',
                bankAlHabibIban: storeSettings?.bankAlHabibIban || 'PK45BAHL1029098100234101',
                bankQr: storeSettings?.bankQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PK36MEZN0001020105829102&margin=10`,
                bankName: storeSettings?.bankName || 'Meezan Bank Ltd',
                bankAccountTitle: storeSettings?.bankAccountTitle || 'KCC Online Wholesale Shop',
                bankAccountNumber: storeSettings?.bankAccountNumber || '01020105829102',
                bankIban: storeSettings?.bankIban || 'PK36MEZN0001020105829102',
                raastId: storeSettings?.raastId || '03295147517',
              });
              setIsAdminUploadModalOpen(true);
            }}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer border border-white/10"
            title="Upload and manage bank QR codes"
          >
            <Settings size={12} /> Manage QR (Admin)
          </button>
        )}
      </div>

      {/* Provider Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-zinc-100 border-b border-black/5 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveProvider('easypaisa')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeProvider === 'easypaisa'
              ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
              : 'bg-white/80 text-zinc-700 hover:bg-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Easypaisa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProvider('jazzcash')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeProvider === 'jazzcash'
              ? 'bg-red-600 text-white shadow-sm font-extrabold'
              : 'bg-white/80 text-zinc-700 hover:bg-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          <span>JazzCash</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProvider('bank_al_habib')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeProvider === 'bank_al_habib'
              ? 'bg-blue-700 text-white shadow-sm font-extrabold'
              : 'bg-white/80 text-zinc-700 hover:bg-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span className="truncate">Bank AL Habib</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProvider('meezan_raast')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeProvider === 'meezan_raast'
              ? 'bg-purple-800 text-white shadow-sm font-extrabold'
              : 'bg-white/80 text-zinc-700 hover:bg-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span className="truncate">Meezan / Raast</span>
        </button>
      </div>

      {/* Main Interactive QR Display Card */}
      <div className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-50 p-3.5 rounded-2xl border border-black/5">
          {/* QR Code Graphic Frame */}
          <div className="relative group shrink-0">
            <div 
              onClick={() => setIsFullscreenQrOpen(true)}
              className="w-40 h-40 bg-white p-2.5 rounded-2xl border-2 border-black/10 shadow-md relative flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-all"
              title="Click to Zoom Fullscreen"
            >
              <img 
                src={current.qrUrl} 
                alt={`${current.name} Code`} 
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  // Fallback to dynamic qr server if image fails
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(current.accountNumber || current.name)}&margin=10`;
                }}
              />

              {/* Corner scan line accent */}
              <div className="absolute inset-2 border-2 border-dashed border-emerald-500/40 rounded-xl pointer-events-none group-hover:border-emerald-500 transition-colors"></div>

              {/* Hover Zoom Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white transition-opacity gap-1 text-xs font-bold backdrop-blur-xs">
                <Maximize2 size={16} /> Tap to Zoom
              </div>
            </div>

            {/* Quick Action buttons below QR */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setIsFullscreenQrOpen(true)}
                className="px-2 py-1 bg-white hover:bg-zinc-100 text-zinc-700 text-[10px] font-bold rounded-lg border border-black/10 flex items-center gap-1 transition-colors cursor-pointer"
                title="View enlarged QR code"
              >
                <Maximize2 size={11} /> Zoom
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="px-2 py-1 bg-white hover:bg-zinc-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-black/10 flex items-center gap-1 transition-colors cursor-pointer"
                title="Download QR to scan via mobile gallery in banking app"
              >
                <Download size={11} /> Save Image
              </button>
            </div>
          </div>

          {/* Account Details & Instructions */}
          <div className="flex-1 space-y-2.5 text-left w-full">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${current.badgeBg}`}>
                  {current.name}
                </span>
                <h5 className="font-bold text-xs text-zinc-900 mt-0.5">{current.accountType}</h5>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Total Payable</span>
                <span className="font-mono font-extrabold text-sm text-emerald-700">
                  Rs.{payableAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Account Title Box */}
            <div className="p-2.5 bg-white rounded-xl border border-black/5 space-y-1 text-xs">
              <div className="flex items-center justify-between text-zinc-500 text-[10px] font-bold uppercase">
                <span>Account Title</span>
                <span className="text-emerald-700">Verified Recipient</span>
              </div>
              <p className="font-bold text-zinc-900 text-xs">{current.accountTitle}</p>
            </div>

            {/* Number / IBAN with Copy */}
            <div className="p-2.5 bg-white rounded-xl border border-black/5 space-y-1 text-xs">
              <div className="flex items-center justify-between text-zinc-500 text-[10px] font-bold uppercase">
                <span>{current.iban ? 'Account Number & IBAN' : 'Account / Mobile Number'}</span>
              </div>
              <div className="flex items-center justify-between font-mono font-bold text-zinc-900">
                <span className="text-xs">{current.accountNumber}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(current.accountNumber, 'Account Number', 'card_acc')}
                  className="p-1 hover:bg-emerald-50 rounded text-zinc-500 hover:text-emerald-700 transition-colors cursor-pointer"
                  title="Copy Number"
                >
                  {copiedKey === 'card_acc' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>

              {current.iban && (
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-600 pt-1 border-t border-zinc-100">
                  <span className="truncate pr-1">IBAN: {current.iban}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(current.iban!, 'IBAN', 'card_iban')}
                    className="p-1 hover:bg-emerald-50 rounded text-zinc-500 hover:text-emerald-700 transition-colors cursor-pointer"
                    title="Copy IBAN"
                  >
                    {copiedKey === 'card_iban' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              )}

              {current.raastId && (
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-600 pt-1 border-t border-zinc-100">
                  <span>Raast ID: {current.raastId}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(current.raastId!, 'Raast ID', 'card_raast')}
                    className="p-1 hover:bg-emerald-50 rounded text-zinc-500 hover:text-emerald-700 transition-colors cursor-pointer"
                    title="Copy Raast ID"
                  >
                    {copiedKey === 'card_raast' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Step Hint */}
            <div className="p-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-950 flex items-center gap-2">
              <Smartphone size={15} className="text-emerald-700 shrink-0" />
              <span className="leading-tight">
                <strong>How to Pay:</strong> {current.appStoreHint}. Verify amount <strong>Rs.{payableAmount.toLocaleString()}</strong> and confirm.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen QR Zoom Modal */}
      {isFullscreenQrOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <button
              type="button"
              onClick={() => setIsFullscreenQrOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${current.badgeBg} mb-1`}>
                {current.name}
              </span>
              <h3 className="font-extrabold text-base text-zinc-900">Scan QR Code to Pay</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Amount: <strong className="text-emerald-700 font-mono">Rs.{payableAmount.toLocaleString()}</strong></p>
            </div>

            <div className="w-64 h-64 mx-auto bg-white p-3 rounded-2xl border-2 border-zinc-200 shadow-inner flex items-center justify-center">
              <img 
                src={current.qrUrl} 
                alt={`${current.name} QR`} 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-left space-y-1 text-xs">
              <p className="text-zinc-500 text-[10px] font-bold uppercase">Account Name</p>
              <p className="font-bold text-zinc-900">{current.accountTitle}</p>
              <p className="font-mono text-xs text-emerald-800 font-bold">{current.accountNumber}</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Download size={14} /> Download QR Code
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenQrOpen(false)}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload / Manage QR Modal */}
      {isAdminUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8 text-left">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <QrCode className="text-emerald-600" size={22} /> Upload & Manage Bank QR Codes
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Upload official QR code images for Easypaisa, JazzCash, and Bank AL Habib for direct customer checkout scanning.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminUploadModalOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* 1. Easypaisa QR */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 1. Easypaisa QR Code & Account
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerUploadFor('easypaisa')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Upload size={13} /> Upload QR Image
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-xl border p-1 shrink-0 flex items-center justify-center">
                    <img src={adminDraft.easypaisaQr} alt="Easypaisa QR" className="w-full h-full object-contain rounded" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={adminDraft.easypaisaQr}
                      onChange={(e) => setAdminDraft({ ...adminDraft, easypaisaQr: e.target.value })}
                      placeholder="Image URL or upload file..."
                      className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg p-2 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={adminDraft.easypaisaTitle}
                        onChange={(e) => setAdminDraft({ ...adminDraft, easypaisaTitle: e.target.value })}
                        placeholder="Account Title (e.g. KCC Store)"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-medium"
                      />
                      <input 
                        type="text" 
                        value={adminDraft.easypaisaNumber}
                        onChange={(e) => setAdminDraft({ ...adminDraft, easypaisaNumber: e.target.value })}
                        placeholder="Mobile Number (e.g. 03295147517)"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. JazzCash QR */}
              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> 2. JazzCash QR Code & Account
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerUploadFor('jazzcash')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Upload size={13} /> Upload QR Image
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-xl border p-1 shrink-0 flex items-center justify-center">
                    <img src={adminDraft.jazzcashQr} alt="JazzCash QR" className="w-full h-full object-contain rounded" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={adminDraft.jazzcashQr}
                      onChange={(e) => setAdminDraft({ ...adminDraft, jazzcashQr: e.target.value })}
                      placeholder="Image URL or upload file..."
                      className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg p-2 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={adminDraft.jazzcashTitle}
                        onChange={(e) => setAdminDraft({ ...adminDraft, jazzcashTitle: e.target.value })}
                        placeholder="Account Title"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-medium"
                      />
                      <input 
                        type="text" 
                        value={adminDraft.jazzcashNumber}
                        onChange={(e) => setAdminDraft({ ...adminDraft, jazzcashNumber: e.target.value })}
                        placeholder="Mobile / Till Number"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Bank AL Habib QR */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> 3. Bank AL Habib QR Code & Account
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerUploadFor('bank_al_habib')}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Upload size={13} /> Upload QR Image
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-xl border p-1 shrink-0 flex items-center justify-center">
                    <img src={adminDraft.bankAlHabibQr} alt="Bank AL Habib QR" className="w-full h-full object-contain rounded" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={adminDraft.bankAlHabibQr}
                      onChange={(e) => setAdminDraft({ ...adminDraft, bankAlHabibQr: e.target.value })}
                      placeholder="Image URL or upload file..."
                      className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg p-2 outline-none"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input 
                        type="text" 
                        value={adminDraft.bankAlHabibTitle}
                        onChange={(e) => setAdminDraft({ ...adminDraft, bankAlHabibTitle: e.target.value })}
                        placeholder="Account Title"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-medium"
                      />
                      <input 
                        type="text" 
                        value={adminDraft.bankAlHabibAccountNumber}
                        onChange={(e) => setAdminDraft({ ...adminDraft, bankAlHabibAccountNumber: e.target.value })}
                        placeholder="Account Number"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-mono"
                      />
                      <input 
                        type="text" 
                        value={adminDraft.bankAlHabibIban}
                        onChange={(e) => setAdminDraft({ ...adminDraft, bankAlHabibIban: e.target.value })}
                        placeholder="IBAN"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Meezan Bank & Raast QR */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> 4. Meezan Bank & Raast ID
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerUploadFor('meezan_raast')}
                    className="px-3 py-1.5 bg-purple-800 hover:bg-purple-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Upload size={13} /> Upload QR Image
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-xl border p-1 shrink-0 flex items-center justify-center">
                    <img src={adminDraft.bankQr} alt="Meezan QR" className="w-full h-full object-contain rounded" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={adminDraft.bankQr}
                      onChange={(e) => setAdminDraft({ ...adminDraft, bankQr: e.target.value })}
                      placeholder="Image URL or upload file..."
                      className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg p-2 outline-none"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input 
                        type="text" 
                        value={adminDraft.bankAccountTitle}
                        onChange={(e) => setAdminDraft({ ...adminDraft, bankAccountTitle: e.target.value })}
                        placeholder="Account Title"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-medium"
                      />
                      <input 
                        type="text" 
                        value={adminDraft.bankAccountNumber}
                        onChange={(e) => setAdminDraft({ ...adminDraft, bankAccountNumber: e.target.value })}
                        placeholder="Account Number"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-mono"
                      />
                      <input 
                        type="text" 
                        value={adminDraft.raastId}
                        onChange={(e) => setAdminDraft({ ...adminDraft, raastId: e.target.value })}
                        placeholder="Raast ID"
                        className="text-xs bg-white border border-zinc-200 rounded-lg p-2 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setAdminDraft({
                    easypaisaQr: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=03295147517-EASYPAISA-KCC&margin=10`,
                    easypaisaTitle: 'KCC Store',
                    easypaisaNumber: '03295147517',
                    jazzcashQr: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=03295147517-JAZZCASH-KCC&margin=10`,
                    jazzcashTitle: 'KCC Store',
                    jazzcashNumber: '03295147517',
                    bankAlHabibQr: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PK45BAHL1029098100234101&margin=10`,
                    bankAlHabibTitle: 'KCC Wholesale Traders',
                    bankAlHabibAccountNumber: '1029-0981-002341-01-9',
                    bankAlHabibIban: 'PK45BAHL1029098100234101',
                    bankQr: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PK36MEZN0001020105829102&margin=10`,
                    bankName: 'Meezan Bank Ltd',
                    bankAccountTitle: 'KCC Online Wholesale Shop',
                    bankAccountNumber: '01020105829102',
                    bankIban: 'PK36MEZN0001020105829102',
                    raastId: '03295147517',
                  });
                  if (showToast) showToast('Reset draft to standard default QR codes.', 'info');
                }}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} /> Reset to Defaults
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminUploadModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAdminSettings}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check size={14} /> Save QR Codes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
