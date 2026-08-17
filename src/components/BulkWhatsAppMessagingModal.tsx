import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  X, 
  Send, 
  CheckCircle2, 
  Truck, 
  Clock, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  Users, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft,
  FileSpreadsheet,
  AlertCircle,
  Package,
  ArrowRight,
  Filter,
  Flame,
  Check
} from 'lucide-react';
import { ContactSubmission, StoreSettings } from '../types';

interface BulkWhatsAppMessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: ContactSubmission[];
  selectedIds: string[];
  onUpdateSubmissions: (updated: ContactSubmission[]) => void;
  showToast: (message: string, type?: 'success' | 'remove' | 'info') => void;
  storeSettings?: StoreSettings;
}

export function normalizeWhatsAppNumber(raw: string): string {
  let cleaned = (raw || '').replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0092')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
}

interface MessageTemplate {
  id: string;
  name: string;
  category: 'in-transit' | 'replied' | 'delivery' | 'marketing' | 'custom';
  icon: string;
  badge: string;
  badgeColor: string;
  text: string;
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl_in_transit',
    name: '🚚 Order In-Transit / Dispatched Update',
    category: 'in-transit',
    icon: '🚚',
    badge: 'Dispatched / In-Transit',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    text: `Assalam-o-Alaikum {name}! 🚚\n\nYour KCC Shop order *"{subject}"* has been dispatched via *{courier}*.\n\n📦 *Tracking Number:* {trackingNumber}\n📅 *Estimated Delivery:* {deliveryDate}\n\nPlease keep the Cash on Delivery (COD) payment ready. Our courier rider will contact you prior to delivery.\n\nThank you for choosing KCC Store! If you need any assistance, reply to this message.`
  },
  {
    id: 'tpl_out_for_delivery',
    name: '🛵 Out for Delivery Today',
    category: 'delivery',
    icon: '🛵',
    badge: 'Rider Out for Delivery',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    text: `Assalam-o-Alaikum {name}! 🛵\n\nGreat news! Your parcel for *"{subject}"* is *out for delivery today* with our courier rider.\n\n📦 *Courier:* {courier} (Tracking: {trackingNumber})\n\nPlease ensure someone is available at your delivery address to receive the parcel and hand over the COD amount. Thank you!`
  },
  {
    id: 'tpl_replied_inquiry',
    name: '✅ Inquiry Replied / Support Follow-up',
    category: 'replied',
    icon: '✅',
    badge: 'Replied / Customer Care',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: `Assalam-o-Alaikum {name}! 👋\n\nThank you for contacting KCC Store regarding *"{subject}"*.\n\n{notes}\n\nWe would love to help you complete your order. Reply to this chat to confirm your items or request any additional specs/wholesale quotes!`
  },
  {
    id: 'tpl_delivered_feedback',
    name: '⭐ Order Delivered & Review Request',
    category: 'delivery',
    icon: '⭐',
    badge: 'Delivered / Review',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    text: `Assalam-o-Alaikum {name}! ✨\n\nOur system indicates that your order *"{subject}"* has been delivered.\n\nWe hope you love your new purchase! If you have 30 seconds, please let us know how your experience was or share a quick photo/review. JazakAllah khair for shopping with KCC!`
  },
  {
    id: 'tpl_promo_vip',
    name: '🎁 VIP Restock & Discount Offer',
    category: 'marketing',
    icon: '🎁',
    badge: 'VIP Offer / Broadcast',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    text: `Assalam-o-Alaikum {name}! 🌟\n\nAs a valued KCC customer, we're giving you early VIP access to our freshly restocked trending kitchen tools & smart gadgets.\n\nEnjoy up to 20% off with Free Delivery on orders over Rs. 3,000. Reply *CATALOG* to see today's top deals!`
  }
];

export const BulkWhatsAppMessagingModal: React.FC<BulkWhatsAppMessagingModalProps> = ({
  isOpen,
  onClose,
  submissions,
  selectedIds,
  onUpdateSubmissions,
  showToast,
  storeSettings
}) => {
  // Target audience filter within modal
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'in-transit' | 'replied' | 'unread'>('all');
  
  // Selected template & custom text state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_in_transit');
  const [messageBody, setMessageBody] = useState<string>(MESSAGE_TEMPLATES[0].text);
  
  // Interactive Sending Queue Tracker
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isQueueRunning, setIsQueueRunning] = useState<boolean>(false);

  // Filter the selected submissions based on modal audience tab
  const targetedSubmissions = useMemo(() => {
    const selectedList = submissions.filter(s => selectedIds.includes(s.id));
    
    if (audienceFilter === 'in-transit') {
      return selectedList.filter(s => Boolean(s.trackingNumber) || s.status === 'replied');
    }
    if (audienceFilter === 'replied') {
      return selectedList.filter(s => s.status === 'replied');
    }
    if (audienceFilter === 'unread') {
      return selectedList.filter(s => s.status === 'unread');
    }
    return selectedList;
  }, [submissions, selectedIds, audienceFilter]);

  // Keep preview index bounded
  const currentPreviewSub = targetedSubmissions[Math.min(activePreviewIndex, Math.max(0, targetedSubmissions.length - 1))];

  // Helper to compile dynamic template variables
  const compileMessage = (templateText: string, sub: ContactSubmission | undefined): string => {
    if (!sub) return templateText;
    
    const courier = sub.courierName || 'TCS Express';
    const tracking = sub.trackingNumber || 'PENDING-DISPATCH';
    const estDate = sub.estimatedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const notes = sub.notes ? `*Admin Note:* ${sub.notes}` : 'We are ready to assist you.';
    const storePhone = storeSettings?.whatsappNumber || '0300-1234567';

    return templateText
      .replace(/{name}/g, sub.name || 'Valued Customer')
      .replace(/{subject}/g, sub.subject || 'Your Order')
      .replace(/{trackingNumber}/g, tracking)
      .replace(/{courier}/g, courier)
      .replace(/{deliveryDate}/g, estDate)
      .replace(/{notes}/g, notes)
      .replace(/{phone}/g, sub.emailOrPhone || '')
      .replace(/{storePhone}/g, storePhone);
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplateId(template.id);
    setMessageBody(template.text);
  };

  const handleInsertVariable = (varKey: string) => {
    setMessageBody(prev => prev + ' ' + varKey);
  };

  // Launch single customer WhatsApp chat
  const handleLaunchWhatsApp = (sub: ContactSubmission) => {
    const rawPhone = sub.emailOrPhone;
    const cleanPhone = normalizeWhatsAppNumber(rawPhone);
    if (!cleanPhone || cleanPhone.length < 9) {
      showToast(`Invalid phone number for ${sub.name}: "${rawPhone}"`, 'remove');
      return;
    }

    const compiledText = compileMessage(messageBody, sub);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(compiledText)}`;
    
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    
    // Mark as sent in state
    setSentMap(prev => ({ ...prev, [sub.id]: true }));
    
    // Automatically advance preview
    const currIdx = targetedSubmissions.findIndex(s => s.id === sub.id);
    if (currIdx >= 0 && currIdx < targetedSubmissions.length - 1) {
      setActivePreviewIndex(currIdx + 1);
    }
  };

  // Launch next unsent recipient in queue
  const handleSendNextInQueue = () => {
    const nextSub = targetedSubmissions.find(s => !sentMap[s.id]);
    if (nextSub) {
      const idx = targetedSubmissions.findIndex(s => s.id === nextSub.id);
      if (idx >= 0) setActivePreviewIndex(idx);
      handleLaunchWhatsApp(nextSub);
    } else {
      showToast("All recipients in the active queue have been sent messages!", "success");
      setIsQueueRunning(false);
    }
  };

  // Mark all targeted submissions as 'replied' in store state
  const handleMarkAllAsReplied = () => {
    const targetIdSet = new Set(targetedSubmissions.map(s => s.id));
    const updated = submissions.map(s => {
      if (targetIdSet.has(s.id)) {
        return { ...s, status: 'replied' as const };
      }
      return s;
    });
    onUpdateSubmissions(updated);
    showToast(`Marked ${targetedSubmissions.length} customer records as 'Replied'!`, "success");
  };

  // Copy all formatted messages to clipboard (useful for external bulk senders)
  const handleCopyAllBroadcastData = () => {
    if (targetedSubmissions.length === 0) {
      showToast("No recipients to copy.", "info");
      return;
    }
    
    const lines = targetedSubmissions.map(sub => {
      const phone = normalizeWhatsAppNumber(sub.emailOrPhone);
      const text = compileMessage(messageBody, sub).replace(/\n/g, ' \\n ');
      return `${sub.name}\t${phone}\t${text}`;
    });

    const header = "Customer Name\tWhatsApp Number\tFormatted Message\n";
    navigator.clipboard.writeText(header + lines.join('\n'));
    showToast(`Copied ${targetedSubmissions.length} formatted messages to clipboard (TSV format)!`, "success");
  };

  // Copy comma-separated phone numbers list
  const handleCopyPhoneNumbers = () => {
    const numbers = targetedSubmissions
      .map(s => normalizeWhatsAppNumber(s.emailOrPhone))
      .filter(n => n.length >= 9);
    
    const uniqueNums = Array.from(new Set(numbers));
    navigator.clipboard.writeText(uniqueNums.join(', '));
    showToast(`Copied ${uniqueNums.length} WhatsApp numbers to clipboard!`, "success");
  };

  if (!isOpen) return null;

  const totalTargeted = targetedSubmissions.length;
  const sentCount = targetedSubmissions.filter(s => sentMap[s.id]).length;
  const progressPercent = totalTargeted > 0 ? Math.round((sentCount / totalTargeted) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col border border-black/10 my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-black/10 bg-gradient-to-r from-emerald-900 via-emerald-800 to-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg flex-shrink-0">
              <MessageCircle size={24} className="fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl md:text-2xl font-bold font-display text-white">
                  Bulk WhatsApp Status Updater
                </h3>
                <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                  {selectedIds.length} Selected
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Send personalized tracking updates, inquiry replies, or broadcast notifications to selected customers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Audience Filter Tabs & Progress Bar */}
          <div className="bg-brand-light/50 p-4 rounded-2xl border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gray block mb-1.5">
                Filter Target Audience:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => { setAudienceFilter('all'); setActivePreviewIndex(0); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    audienceFilter === 'all'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'bg-white text-brand-dark border border-black/10 hover:bg-black/5'
                  }`}
                >
                  All Selected ({selectedIds.length})
                </button>
                <button
                  onClick={() => { setAudienceFilter('in-transit'); setActivePreviewIndex(0); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    audienceFilter === 'in-transit'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <Truck size={13} /> In-Transit / Dispatched ({submissions.filter(s => selectedIds.includes(s.id) && (Boolean(s.trackingNumber) || s.status === 'replied')).length})
                </button>
                <button
                  onClick={() => { setAudienceFilter('replied'); setActivePreviewIndex(0); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    audienceFilter === 'replied'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 size={13} /> Replied Only ({submissions.filter(s => selectedIds.includes(s.id) && s.status === 'replied').length})
                </button>
                <button
                  onClick={() => { setAudienceFilter('unread'); setActivePreviewIndex(0); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    audienceFilter === 'unread'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Clock size={13} /> Unread / Pending ({submissions.filter(s => selectedIds.includes(s.id) && s.status === 'unread').length})
                </button>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="min-w-[200px] bg-white p-3 rounded-xl border border-black/10 shadow-xs">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-brand-dark flex items-center gap-1">
                  <Send size={13} className="text-emerald-600" /> Dispatch Progress
                </span>
                <span className="text-emerald-700 font-mono">{sentCount} / {totalTargeted} ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Top 1-Click Message Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Pre-Filled Status Update Templates:
              </span>
              <span className="text-[11px] text-brand-gray">Click to load pre-filled text</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {MESSAGE_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateSelect(tpl)}
                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white border-black/10 hover:border-emerald-300 hover:bg-emerald-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-brand-dark flex items-center gap-1.5 truncate">
                        <span>{tpl.icon}</span> {tpl.name}
                      </span>
                      {isSelected && (
                        <span className="p-1 bg-emerald-600 text-white rounded-full flex-shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border inline-block w-fit ${tpl.badgeColor}`}>
                      {tpl.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Editor & Live WhatsApp Preview Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Message Editor */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Message Content (Editable)
                </label>
                <span className="text-[11px] text-brand-gray font-mono">
                  {messageBody.length} characters
                </span>
              </div>

              <textarea
                rows={9}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full bg-brand-light/30 border border-black/10 rounded-2xl p-4 text-xs md:text-sm font-sans leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-y"
                placeholder="Type your WhatsApp message..."
              />

              {/* Dynamic Variables Pill Bar */}
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-gray block mb-1.5">
                  Insert Dynamic Customer & Order Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: '{name}', label: '👤 {name}' },
                    { key: '{subject}', label: '🏷️ {subject}' },
                    { key: '{trackingNumber}', label: '🚚 {trackingNumber}' },
                    { key: '{courier}', label: '🏢 {courier}' },
                    { key: '{deliveryDate}', label: '📅 {deliveryDate}' },
                    { key: '{notes}', label: '📝 {notes}' },
                    { key: '{storePhone}', label: '📞 {storePhone}' }
                  ].map(v => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => handleInsertVariable(v.key)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-brand-dark hover:text-emerald-700 text-[11px] font-bold font-mono rounded-lg border border-black/10 hover:border-emerald-300 transition-colors shadow-2xs cursor-pointer"
                      title={`Insert ${v.key}`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live WhatsApp Phone Simulator Preview */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                  📱 Live Customer Preview
                </span>
                {targetedSubmissions.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActivePreviewIndex(prev => Math.max(0, prev - 1))}
                      disabled={activePreviewIndex === 0}
                      className="p-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-[11px] font-bold font-mono px-1">
                      {activePreviewIndex + 1}/{targetedSubmissions.length}
                    </span>
                    <button
                      onClick={() => setActivePreviewIndex(prev => Math.min(targetedSubmissions.length - 1, prev + 1))}
                      disabled={activePreviewIndex >= targetedSubmissions.length - 1}
                      className="p-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {currentPreviewSub ? (
                <div className="flex-1 bg-emerald-950/90 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner border border-emerald-800/40 text-white min-h-[260px]">
                  {/* WhatsApp Chat Top Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {currentPreviewSub.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{currentPreviewSub.name}</p>
                        <p className="text-[10px] text-emerald-300/80 font-mono truncate">{currentPreviewSub.emailOrPhone}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/20">
                      {currentPreviewSub.trackingNumber ? '🚚 In-Transit' : currentPreviewSub.status}
                    </span>
                  </div>

                  {/* WhatsApp Green Message Bubble */}
                  <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-sm shadow-md text-xs leading-relaxed whitespace-pre-wrap font-sans border border-emerald-600/30 overflow-y-auto max-h-[190px]">
                    {compileMessage(messageBody, currentPreviewSub)}
                    <div className="text-right text-[9px] text-emerald-200/70 mt-1 flex items-center justify-end gap-1 font-mono">
                      <span>Just now</span>
                      <Check size={11} className="text-emerald-300 inline" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Single Send Action Button */}
                  <div className="mt-3 pt-2 border-t border-white/10 flex gap-2">
                    <button
                      onClick={() => handleLaunchWhatsApp(currentPreviewSub)}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <MessageCircle size={15} /> Send to {currentPreviewSub.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center text-brand-gray">
                  <Users size={32} className="opacity-40 mb-2" />
                  <p className="text-xs font-bold">No customers matching current filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Recipient Dispatch Queue Table */}
          <div className="border border-black/10 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="p-4 bg-brand-light/60 border-b border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-brand-dark" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Recipient Dispatch Queue ({totalTargeted})
                </h4>
              </div>

              {/* Fast queue helper */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSendNextInQueue}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send size={13} /> Send Next Unsent ({totalTargeted - sentCount} remaining)
                </button>
                <button
                  onClick={handleMarkAllAsReplied}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 size={13} /> Mark All as Replied
                </button>
              </div>
            </div>

            <div className="max-h-[220px] overflow-y-auto divide-y divide-black/5">
              {targetedSubmissions.map((sub, idx) => {
                const isSent = Boolean(sentMap[sub.id]);
                const isActive = targetedSubmissions[activePreviewIndex]?.id === sub.id;
                const cleanPhone = normalizeWhatsAppNumber(sub.emailOrPhone);

                return (
                  <div
                    key={sub.id}
                    className={`p-3 md:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isActive ? 'bg-emerald-50/60' : 'hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isSent ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-brand-gray'
                      }`}>
                        {isSent ? '✓' : idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setActivePreviewIndex(idx)}
                            className="font-bold text-xs text-brand-dark hover:text-emerald-700 text-left cursor-pointer"
                          >
                            {sub.name}
                          </button>
                          <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {sub.emailOrPhone}
                          </span>
                          {sub.trackingNumber && (
                            <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                              <Truck size={10} /> {sub.courierName || 'Courier'}: {sub.trackingNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-brand-gray truncate max-w-md">
                          {sub.subject} {sub.notes ? `• Note: ${sub.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {isSent ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <CheckCircle2 size={13} /> Sent
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <Clock size={13} /> Queued
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setActivePreviewIndex(idx);
                          handleLaunchWhatsApp(sub);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isSent 
                            ? 'bg-brand-light text-brand-dark hover:bg-gray-200' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <MessageCircle size={13} /> {isSent ? 'Resend' : 'Send WhatsApp'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {targetedSubmissions.length === 0 && (
                <div className="p-8 text-center text-brand-gray text-xs">
                  No customers found in this filter category.
                </div>
              )}
            </div>
          </div>

          {/* Export & Copy Helpers */}
          <div className="bg-brand-light/40 p-4 rounded-2xl border border-black/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-dark">
              <FileSpreadsheet size={15} className="text-emerald-700" />
              <span>Bulk Data & Broadcast Export Tools</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyPhoneNumbers}
                className="px-3.5 py-2 bg-white hover:bg-gray-100 text-brand-dark text-xs font-bold rounded-xl border border-black/10 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Copy numbers for WhatsApp Broadcast"
              >
                <Copy size={13} /> Copy WhatsApp Numbers List
              </button>

              <button
                type="button"
                onClick={handleCopyAllBroadcastData}
                className="px-3.5 py-2 bg-white hover:bg-gray-100 text-brand-dark text-xs font-bold rounded-xl border border-black/10 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Copy all formatted messages with numbers for bulk tools"
              >
                <Copy size={13} /> Copy All Messages (TSV/Spreadsheet)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-black/10 bg-brand-light/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-brand-gray">
            Tip: Clicking <strong>Send WhatsApp</strong> opens the chat with pre-filled status text ready to send.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-brand-dark rounded-xl text-xs font-bold uppercase tracking-wider border border-black/10 transition-colors cursor-pointer"
            >
              Close
            </button>

            {targetedSubmissions.length > 0 && (
              <button
                onClick={handleSendNextInQueue}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Send size={14} /> Send Next ({targetedSubmissions.filter(s => !sentMap[s.id]).length} Left)
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
