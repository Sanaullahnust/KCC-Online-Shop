import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Layers, 
  FileText, 
  ExternalLink,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { ContactSubmission } from '../types';

interface CustomerReplySectionProps {
  submission: ContactSubmission;
  onUpdateSubmission: (updated: ContactSubmission) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'remove') => void;
}

export function CustomerReplySection({
  submission,
  onUpdateSubmission,
  showToast
}: CustomerReplySectionProps) {
  const contactRaw = submission.emailOrPhone.trim();
  const isEmail = contactRaw.includes('@');
  const digitsOnly = contactRaw.replace(/[^0-9]/g, '');
  const isPhone = digitsOnly.length >= 7;

  // Selected Channel: 'whatsapp' or 'email'
  const [channel, setChannel] = useState<'whatsapp' | 'email'>(isPhone ? 'whatsapp' : (isEmail ? 'email' : 'whatsapp'));
  const [selectedTemplate, setSelectedTemplate] = useState<string>('dispatch');
  const [customSubject, setCustomSubject] = useState(`Re: ${submission.subject}`);
  const [replyMessage, setReplyMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Quick Templates Generator
  const generateTemplateText = (templateKey: string) => {
    const name = submission.name || 'Valued Customer';
    const subj = submission.subject || 'Your Inquiry';
    const courier = submission.courierName || 'TCS Express';
    const trk = submission.trackingNumber || 'KCC-TRK-78921';
    const estDate = submission.estimatedDeliveryDate || '2-3 Business Days';

    switch (templateKey) {
      case 'dispatch':
        if (submission.trackingNumber) {
          return `Assalam-o-Alaikum ${name},\n\nYour order regarding "${subj}" has been dispatched via ${courier}!\n\n📦 Courier: ${courier}\n🔢 Tracking Number: ${trk}\n🚚 Estimated Delivery: ${estDate}\n\nYou can track your parcel on the courier website or pay Cash on Delivery (COD) upon receiving.\n\nThank you for choosing KCC Online Shop!\nContact: +92 300 1234567`;
        } else {
          return `Assalam-o-Alaikum ${name},\n\nThank you for reaching out to KCC Online Shop regarding "${subj}".\n\nYour order is confirmed and is currently being packed in our warehouse. We will dispatch it shortly and send you the tracking number.\n\nBest regards,\nKCC Store Team`;
        }

      case 'inquiry':
        return `Assalam-o-Alaikum ${name},\n\nThank you for contacting KCC Store regarding "${subj}".\n\nIn response to your query:\n"${submission.message}"\n\nWe would be happy to assist you further! Please let us know if you need additional specifications, wholesale pricing, or immediate dispatch assistance.\n\nBest regards,\nKCC Customer Support`;

      case 'quote':
        return `Assalam-o-Alaikum ${name},\n\nThank you for your bulk wholesale inquiry on "${subj}".\n\nWe offer special volume discounts with free delivery across KPK and Punjab for orders of 5+ units. All items are 100% tested with replacement warranty.\n\nPlease share your required quantity so we can provide our lowest dealer quote.\n\nWarm regards,\nKCC Wholesale Sales Team`;

      case 'custom':
      default:
        return `Assalam-o-Alaikum ${name},\n\nThank you for contacting KCC Store regarding "${subj}".\n\n\n\nBest regards,\nKCC Online Shop`;
    }
  };

  // Initialize template text
  useEffect(() => {
    setReplyMessage(generateTemplateText(selectedTemplate));
  }, [selectedTemplate, submission.trackingNumber, submission.courierName, submission.name]);

  // Clean phone number with Pakistan prefix
  const getFormattedPhone = () => {
    let clean = digitsOnly;
    if (clean.startsWith('03')) {
      clean = '92' + clean.slice(1);
    } else if (clean.startsWith('3') && clean.length === 10) {
      clean = '92' + clean;
    }
    return clean;
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      showToast('Please enter a reply message.', 'remove');
      return;
    }

    const newReplyItem = {
      date: new Date().toLocaleString(),
      channel,
      message: replyMessage,
      sender: 'Admin'
    };

    const updatedHistory = submission.replyHistory ? [newReplyItem, ...submission.replyHistory] : [newReplyItem];
    const updatedSub: ContactSubmission = {
      ...submission,
      status: 'replied',
      replyHistory: updatedHistory
    };

    onUpdateSubmission(updatedSub);

    if (channel === 'whatsapp') {
      const phoneNum = getFormattedPhone();
      if (!phoneNum) {
        showToast('No valid phone number detected. Copied message to clipboard.', 'info');
        navigator.clipboard.writeText(replyMessage);
        return;
      }
      const waUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(replyMessage)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      showToast(`Opening WhatsApp to deliver reply to ${phoneNum}!`, 'success');
    } else {
      // Email Channel
      const mailtoUrl = `mailto:${encodeURIComponent(contactRaw)}?subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(replyMessage)}`;
      window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
      navigator.clipboard.writeText(replyMessage);
      showToast(`Opening default Email client to send to ${contactRaw}! (Draft copied)`, 'success');
    }
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(replyMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Reply draft copied to clipboard!', 'info');
  };

  return (
    <div className="bg-brand-light/70 p-4 sm:p-5 rounded-2xl border border-black/10 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
            <MessageCircle size={16} />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-dark">
              Editable Reply & Direct Customer Delivery
            </h4>
            <p className="text-[10px] text-brand-gray">
              Compose or customize response to deliver via WhatsApp or Email
            </p>
          </div>
        </div>

        {/* Channel Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-black/10 shadow-xs">
          <button
            type="button"
            onClick={() => setChannel('whatsapp')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              channel === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-brand-gray hover:text-brand-dark'
            }`}
          >
            <MessageCircle size={13} />
            <span>WhatsApp {isPhone && '✓'}</span>
          </button>

          <button
            type="button"
            onClick={() => setChannel('email')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              channel === 'email'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-brand-gray hover:text-brand-dark'
            }`}
          >
            <Mail size={13} />
            <span>Email {isEmail && '✓'}</span>
          </button>
        </div>
      </div>

      {/* Quick Template Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[10px] font-bold uppercase text-brand-gray shrink-0 flex items-center gap-1">
          <Sparkles size={11} className="text-amber-500" /> Template:
        </span>
        {[
          { id: 'dispatch', label: '🚚 Dispatch & Tracking' },
          { id: 'inquiry', label: '💬 Inquiry Reply' },
          { id: 'quote', label: '🏷️ Price Quote / Wholesale' },
          { id: 'custom', label: '✏️ Blank Custom' },
        ].map(tmpl => (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => setSelectedTemplate(tmpl.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border ${
              selectedTemplate === tmpl.id
                ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                : 'bg-white text-brand-dark border-black/10 hover:bg-brand-light'
            }`}
          >
            {tmpl.label}
          </button>
        ))}
      </div>

      {/* Email Subject Line (Visible when channel is email) */}
      {channel === 'email' && (
        <div>
          <label className="block text-[10px] font-bold uppercase text-brand-gray mb-1">Email Subject</label>
          <input
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs font-bold text-brand-dark outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Subject line..."
          />
        </div>
      )}

      {/* Editable Reply Message Area */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold uppercase text-brand-gray">
            Message Content (Fully Editable)
          </label>
          <button
            type="button"
            onClick={handleCopyDraft}
            className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1"
          >
            {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>

        <textarea
          rows={5}
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Type your message to the customer..."
          className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-medium text-brand-dark outline-none focus:ring-2 focus:ring-brand-primary/20 leading-relaxed shadow-inner"
        />
      </div>

      {/* Delivery Action Buttons */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleSendReply}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
            channel === 'whatsapp'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {channel === 'whatsapp' ? <MessageCircle size={16} /> : <Mail size={16} />}
          <span>
            {channel === 'whatsapp'
              ? `Deliver via WhatsApp (${contactRaw})`
              : `Deliver via Email (${contactRaw})`}
          </span>
          <ExternalLink size={14} className="opacity-80" />
        </button>

        <button
          type="button"
          onClick={handleCopyDraft}
          className="py-3 px-4 bg-white hover:bg-gray-100 text-brand-dark border border-black/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Copy Message Text"
        >
          <Copy size={14} />
          <span className="hidden sm:inline">Copy Draft</span>
        </button>
      </div>

      {/* Past Reply History */}
      {submission.replyHistory && submission.replyHistory.length > 0 && (
        <div className="pt-2 border-t border-black/10 space-y-2">
          <span className="text-[10px] font-bold uppercase text-brand-gray flex items-center gap-1">
            <Clock size={11} /> Sent Replies History ({submission.replyHistory.length})
          </span>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {submission.replyHistory.map((rep, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-black/5 text-[11px] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-brand-gray text-[10px]">
                  <span className="font-bold uppercase text-emerald-700 flex items-center gap-1">
                    {rep.channel === 'whatsapp' ? <MessageCircle size={11} /> : <Mail size={11} />}
                    {rep.channel}
                  </span>
                  <span>{rep.date}</span>
                </div>
                <p className="text-brand-dark line-clamp-2 whitespace-pre-wrap font-mono text-[10px]">
                  {rep.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
