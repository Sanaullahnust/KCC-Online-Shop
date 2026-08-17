import React, { useState, useRef, ChangeEvent, DragEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageCircle, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  FileText, 
  Trash2, 
  Plus, 
  Check, 
  Copy, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit3, 
  Sliders, 
  Layers, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Film,
  FolderPlus,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { compressAndResizeImage } from '../lib/imageCompressor';

interface ParsedWhatsAppItem {
  id: string;
  selected: boolean;
  name: string;
  rawText: string;
  description: string;
  costPricePkr: number;
  retailPricePkr: number;
  category: 'Home Improvement' | 'Gadgets' | 'Kitchen';
  weight: number;
  rating: number;
  discountNote: string;
  isHot: boolean;
  isTopSeller: boolean;
  image: string;
  images: string[];
  video?: string;
  supplierTag?: string;
}

interface WhatsAppProductExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (products: Product[], mode: 'append' | 'replace') => void;
  showToast: (message: string, type: 'success' | 'info' | 'remove') => void;
}

// Curated high-converting Unsplash fallbacks based on categories
const FALLBACK_CATEGORY_IMAGES: Record<string, string[]> = {
  'Kitchen': [
    'https://images.unsplash.com/photo-1585670270608-410a56f8f537?q=80&w=800',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800',
    'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=800',
    'https://images.unsplash.com/photo-1590212151175-e58edd96185c?q=80&w=800'
  ],
  'Gadgets': [
    'https://images.unsplash.com/photo-1590212151175-e58edd96185c?q=80&w=800',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800',
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800',
    'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800'
  ],
  'Home Improvement': [
    'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800',
    'https://images.unsplash.com/photo-1513506490282-4d4716ee38cd?q=80&w=800',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800'
  ]
};

// Preset samples of real Pakistani WhatsApp supplier group posts
const WHATSAPP_PRESET_SAMPLES = [
  {
    title: '🔥 Sample 1: Kitchen & Household Gadgets (3 Products)',
    text: `🔥 NEW ARRIVAL HOT SELLER IN MARKET! 🔥

1️⃣ 5-in-1 Electric Cleaning Brush (Rechargeable)
⚡ Cordless power scrubber with 5 brush heads for kitchen dishes, sink grease, stove tiles & bathroom!
⚡ USB Charging 1200mAh battery. 
📦 Box Packing with wall mount hanger.
💰 Wholesale Price: Rs. 850
⚖️ Weight: 380g
🖼️ Image: https://images.unsplash.com/photo-1585670270608-410a56f8f537?q=80&w=800
🎥 Video: https://assets.mixkit.co/videos/preview/mixkit-cleaning-the-kitchen-counter-with-a-sponge-41716-large.mp4

-----------------------------------

2️⃣ Silicone Air Fryer Reusable Liner Basket
✅ Food grade non-stick high temperature resistant 240°C.
✅ Easy wash silicone pot for microwave and air fryers.
💰 Price: Rs. 320/- Only
⚖️ Weight: 160g
🖼️ Image: https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800

-----------------------------------

3️⃣ Multi-Function Electric Garlic & Vegetable Chopper 250ml
🔥 Wireless mini chopper with 3 stainless steel blades. Fast USB rechargeable motor.
💰 Wholesale Rate: Rs. 650
⚖️ Weight: 280g
🖼️ Image: https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=800`
  },
  {
    title: '⚡ Sample 2: Smart Solar & Tool Electronics (2 Products)',
    text: `⚡ SHAH ALAM WHOLESALE SUPPLIER DIRECT ⚡

Product: 100 LED Solar Motion Sensor Security Lamp
Description: Waterproof IP65 outdoor solar powered security light with PIR infrared motion detector and 3 lighting modes. Zero electricity bill!
Supplier Cost: Rs. 550
Weight: 320g
Category: Home Improvement
Photo: https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800

---

Product: Portable High Power Wireless Car Vacuum Cleaner 9000Pa
Description: Super strong suction handheld vacuum with washable HEPA filter and 120W motor. USB Type-C fast charge for cars, sofas & laptops.
Supplier Cost: Rs. 980
Weight: 420g
Category: Gadgets
Photo: https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800
Video: https://assets.mixkit.co/videos/preview/mixkit-man-cleaning-a-car-interior-with-a-vacuum-42998-large.mp4`
  },
  {
    title: '🇵🇰 Sample 3: Roman Urdu / English Mixed Broadcast',
    text: `AOA Respected Resellers & Dropshippers,
Aaj ka Super Hit Winning Item Stock Ready hai:

🔥 Smart Touch Screen Automatic Water Dispenser Pump
✅ Direct fit on 19L and all standard water cane bottles
✅ Single touch water discharge, blue LED light indicator
✅ 1200mAh Long battery backup on 1 charge
✅ Box packing with food grade silicone pipe and USB cable
Rate: Rs 900 Fixed Wholesale
Market Selling: Rs 1650 to 1850
Weight: 350 grams
Picture: https://images.unsplash.com/photo-1590212151175-e58edd96185c?q=80&w=800

Delivery all over Pakistan via Trax / Leopards COD.`
  }
];

export const WhatsAppProductExtractorModal: React.FC<WhatsAppProductExtractorModalProps> = ({
  isOpen,
  onClose,
  onImportProducts,
  showToast
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'text' | 'file' | 'media' | 'presets'>('text');
  const [rawText, setRawText] = useState<string>('');
  const [markupPercent, setMarkupPercent] = useState<number>(65); // default +65% margin
  const [defaultCategory, setDefaultCategory] = useState<'Auto' | 'Home Improvement' | 'Gadgets' | 'Kitchen'>('Auto');
  const [defaultDiscountNote, setDefaultDiscountNote] = useState<string>('Wholesale Price');
  const [supplierName, setSupplierName] = useState<string>('WhatsApp Wholesale Group');
  
  const [parsedItems, setParsedItems] = useState<ParsedWhatsAppItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Media Pool (Photos & Videos uploaded from WhatsApp Desktop)
  const [mediaPool, setMediaPool] = useState<{ id: string; name: string; url: string; type: 'image' | 'video'; size: string }[]>([]);
  const [dragOverDropzone, setDragOverDropzone] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Smart Parser for WhatsApp Messages
  const parseWhatsAppText = (text: string): ParsedWhatsAppItem[] => {
    if (!text.trim()) return [];

    // Split text by multiple hyphens, numbered dividers, or double blank lines with product triggers
    const chunks = text
      .split(/(?:[-—_=]{3,}|(?:\r?\n){2,}(?=[0-9]+[️⃣\.\)\-]|Product:|🔥|⚡|✅|AOA|Item:))/gi)
      .map(c => c.trim())
      .filter(c => c.length > 25);

    const itemsToParse = chunks.length > 0 ? chunks : [text.trim()];
    const result: ParsedWhatsAppItem[] = [];

    itemsToParse.forEach((chunk, index) => {
      // 1. Extract Name
      let name = '';
      const nameMatch = 
        chunk.match(/(?:Product|Item|Title|Name|Item Name)\s*[:：\-]\s*([^\n\r]+)/i) ||
        chunk.match(/^(?:[0-9]+[️⃣\.\)\-]\s*|[🔥⚡✨👉📦]\s*)([^\n\r]+)/m) ||
        chunk.match(/^([A-Z0-9][A-Za-z0-9\s\-\(\)\/\+\&]{5,60})/m);

      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].replace(/[🔥⚡✨👉📦✅1-9️⃣]/g, '').trim();
      } else {
        const firstLine = chunk.split('\n')[0].replace(/[🔥⚡✨👉📦✅]/g, '').trim();
        name = firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
      }

      // Remove noise from name
      name = name.replace(/^(AOA|NEW ARRIVAL|STOCK READY|DISCOUNT|SALE|WHOLESALE RATE)\s*[:\-]?\s*/i, '').trim();
      if (!name) name = `WhatsApp Product Item ${index + 1}`;

      // 2. Extract Price (Wholesale / Supplier Rate)
      let costPrice = 0;
      const priceMatches = [
        chunk.match(/(?:Wholesale|Supplier Cost|Cost Price|Wholesale Price|Wholesale Rate|Rate|Cost)\s*[:：\-]?\s*(?:Rs\.?|PKR)?\s*([0-9,]+)/i),
        chunk.match(/(?:Price|Rs\.?|PKR)\s*[:：\-]?\s*([0-9,]+)/i),
        chunk.match(/([0-9,]+)\s*(?:Rs|PKR|\/\-)/i)
      ];

      for (const m of priceMatches) {
        if (m && m[1]) {
          const num = parseInt(m[1].replace(/,/g, ''), 10);
          if (num > 50 && num < 100000) {
            costPrice = num;
            break;
          }
        }
      }

      if (costPrice === 0) costPrice = 850; // default wholesale fallback

      // Calculate suggested retail price with markup
      const markupRatio = 1 + (markupPercent / 100);
      const retailPrice = Math.round(costPrice * markupRatio);

      // 3. Extract Weight
      let weight = 350;
      const weightMatch = chunk.match(/(?:Weight|Wgt)\s*[:：\-]?\s*([0-9.]+)\s*(kg|g|grams|gm)/i);
      if (weightMatch) {
        const val = parseFloat(weightMatch[1]);
        const unit = weightMatch[2].toLowerCase();
        if (unit.includes('k')) {
          weight = Math.round(val * 1000);
        } else {
          weight = Math.round(val);
        }
      } else if (chunk.toLowerCase().includes('lighter') || chunk.toLowerCase().includes('fan')) {
        weight = 200;
      }

      // 4. Extract Category
      let category: 'Home Improvement' | 'Gadgets' | 'Kitchen' = 'Gadgets';
      if (defaultCategory !== 'Auto') {
        category = defaultCategory;
      } else {
        const lower = chunk.toLowerCase();
        if (lower.includes('kitchen') || lower.includes('blender') || lower.includes('cook') || lower.includes('knife') || lower.includes('chopper') || lower.includes('fryer') || lower.includes('dish') || lower.includes('brush') || lower.includes('garlic')) {
          category = 'Kitchen';
        } else if (lower.includes('solar') || lower.includes('lamp') || lower.includes('tool') || lower.includes('light') || lower.includes('wall') || lower.includes('meter') || lower.includes('drill') || lower.includes('repair')) {
          category = 'Home Improvement';
        } else {
          category = 'Gadgets';
        }
      }

      // 5. Extract Image & Video URLs
      const imageUrls: string[] = [];
      const videoUrls: string[] = [];

      const urlRegex = /(https?:\/\/[^\s\n\r\t<>"]+)/gi;
      const urls = chunk.match(urlRegex) || [];

      urls.forEach(u => {
        const clean = u.replace(/[,\.\)]+$/, '');
        if (clean.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i) || clean.includes('mixkit.co/videos') || clean.includes('youtube.com') || clean.includes('youtu.be')) {
          videoUrls.push(clean);
        } else if (clean.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) || clean.includes('unsplash.com') || clean.includes('cloudinary.com') || clean.includes('imgur.com')) {
          imageUrls.push(clean);
        }
      });

      // Assign fallback category image if none found in text
      const fallbackList = FALLBACK_CATEGORY_IMAGES[category] || FALLBACK_CATEGORY_IMAGES['Gadgets'];
      const primaryImage = imageUrls.length > 0 
        ? imageUrls[0] 
        : (mediaPool[index]?.url || fallbackList[index % fallbackList.length]);

      // Clean Description
      let description = chunk
        .replace(/(?:Wholesale|Supplier Cost|Price|Rate|Cost)\s*[:：\-]?\s*(?:Rs\.?|PKR)?\s*[0-9,]+/gi, '')
        .replace(/(?:Weight|Wgt)\s*[:：\-]?\s*[0-9.]+\s*(kg|g|grams|gm)/gi, '')
        .replace(/(?:Image|Photo|Picture|Video|Link)\s*[:：\-]?\s*https?:\/\/[^\s]+/gi, '')
        .replace(/[🔥⚡✨👉📦✅]/g, '•')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .join(' ');

      if (description.length > 280) {
        description = description.substring(0, 277) + '...';
      }

      result.push({
        id: `wa_${Date.now()}_${index}`,
        selected: true,
        name,
        rawText: chunk,
        description: description || `${name} - High quality imported wholesale item sourced via WhatsApp Group.`,
        costPricePkr: costPrice,
        retailPricePkr: retailPrice,
        category,
        weight,
        rating: 4.8,
        discountNote: defaultDiscountNote,
        isHot: true,
        isTopSeller: true,
        image: primaryImage,
        images: imageUrls.length > 0 ? imageUrls : [primaryImage],
        video: videoUrls[0] || undefined,
        supplierTag: supplierName
      });
    });

    return result;
  };

  // Handle Extraction Trigger
  const handleExtractFromText = () => {
    if (!rawText.trim()) {
      showToast("Please paste WhatsApp broadcast text or choose a sample preset first.", "remove");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseWhatsAppText(rawText);
      if (parsed.length === 0) {
        showToast("Could not identify product details. Check text format.", "remove");
      } else {
        setParsedItems(parsed);
        showToast(`Successfully extracted ${parsed.length} products with photos & specs!`, "success");
      }
      setIsProcessing(false);
    }, 300);
  };

  // Handle WhatsApp .txt Chat Export File Upload
  const handleChatFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      setIsProcessing(true);
      setTimeout(() => {
        const parsed = parseWhatsAppText(content);
        setParsedItems(parsed);
        showToast(`Parsed ${parsed.length} products from ${file.name}!`, "success");
        setIsProcessing(false);
      }, 400);
    };
    reader.readAsText(file);
  };

  // Handle Media Drop / Upload (Images & MP4 Videos from WhatsApp)
  const handleMediaUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    showToast(`Processing ${files.length} media files...`, "info");
    const newMediaItems: typeof mediaPool = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov)$/i);
      
      if (isVideo) {
        const url = URL.createObjectURL(file);
        newMediaItems.push({
          id: `media_${Date.now()}_${i}`,
          name: file.name,
          url,
          type: 'video',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        });
      } else {
        try {
          const compressed = await compressAndResizeImage(file, { maxWidth: 1000, quality: 0.82 });
          newMediaItems.push({
            id: `media_${Date.now()}_${i}`,
            name: file.name,
            url: compressed.dataUrl,
            type: 'image',
            size: `${(compressed.compressedSizeBytes / 1024).toFixed(0)} KB`
          });
        } catch (err) {
          const fallbackUrl = URL.createObjectURL(file);
          newMediaItems.push({
            id: `media_${Date.now()}_${i}`,
            name: file.name,
            url: fallbackUrl,
            type: 'image',
            size: `${(file.size / 1024).toFixed(0)} KB`
          });
        }
      }
    }

    setMediaPool(prev => [...prev, ...newMediaItems]);

    // Auto-bind media to parsed items if items already exist
    if (parsedItems.length > 0 && newMediaItems.length > 0) {
      setParsedItems(prev => prev.map((item, idx) => {
        const matchedMedia = newMediaItems[idx % newMediaItems.length];
        if (!matchedMedia) return item;
        if (matchedMedia.type === 'video') {
          return { ...item, video: matchedMedia.url };
        } else {
          return {
            ...item,
            image: matchedMedia.url,
            images: [matchedMedia.url, ...item.images.filter(img => img !== matchedMedia.url)]
          };
        }
      }));
      showToast(`Linked ${newMediaItems.length} media files to products!`, "success");
    } else {
      showToast(`Added ${newMediaItems.length} media assets to pool!`, "success");
    }
  };

  // Re-calculate Retail Prices when Margin Slider changes
  const handleMarkupChange = (newPercent: number) => {
    setMarkupPercent(newPercent);
    setParsedItems(prev => prev.map(item => ({
      ...item,
      retailPricePkr: Math.round(item.costPricePkr * (1 + newPercent / 100))
    })));
  };

  // Toggle selection
  const toggleItemSelection = (id: string) => {
    setParsedItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const allSelected = parsedItems.every(i => i.selected);
    setParsedItems(prev => prev.map(i => ({ ...i, selected: !allSelected })));
  };

  // Delete parsed item
  const handleDeleteItem = (id: string) => {
    setParsedItems(prev => prev.filter(i => i.id !== id));
  };

  // Import Selected Products into Store Catalog
  const handleImportToCatalog = (mode: 'append' | 'replace') => {
    const selectedItems = parsedItems.filter(i => i.selected);
    if (selectedItems.length === 0) {
      showToast("Please select at least one product to import.", "remove");
      return;
    }

    const convertedProducts: Product[] = selectedItems.map(item => ({
      id: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: item.name,
      description: item.description,
      price: item.retailPricePkr,
      image: item.image,
      images: item.images.length > 1 ? item.images : undefined,
      video: item.video || undefined,
      category: item.category,
      weight: item.weight,
      rating: item.rating,
      discountNote: item.discountNote,
      isHot: item.isHot,
      isTopSeller: item.isTopSeller
    }));

    onImportProducts(convertedProducts, mode);
    showToast(`Successfully imported ${convertedProducts.length} WhatsApp products to catalog!`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-start p-2 sm:p-4 md:p-6 animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl overflow-hidden my-auto border border-black/10 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shadow-inner shrink-0">
              <MessageCircle size={26} className="fill-emerald-400/30 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight">WhatsApp Product & Media Extractor</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-zinc-950">
                  AI + Media Parser
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Extract product photos, videos, specs, and wholesale prices directly from WhatsApp supplier groups & broadcast channels.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Extractor"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Container with Two-Column / Tab Layout */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Configuration & Source Selector Tabs */}
          <div className="bg-brand-light/60 p-4 sm:p-5 rounded-2xl border border-black/5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'text', label: '📝 Paste WhatsApp Post', icon: FileText },
                  { id: 'file', label: '📂 Chat Export (.txt)', icon: Upload },
                  { id: 'media', label: `🖼️ Media Attachments (${mediaPool.length})`, icon: ImageIcon },
                  { id: 'presets', label: '⚡ 1-Click Samples', icon: Sparkles }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveInputTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeInputTab === tab.id
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-white text-brand-dark hover:bg-black/5 border border-black/5'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Profit Margin Markup Slider */}
              <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-xl border border-black/10 shadow-sm">
                <span className="text-[11px] font-bold text-brand-gray flex items-center gap-1">
                  <TrendingUp size={13} className="text-emerald-600" /> Margin:
                </span>
                <input 
                  type="range" 
                  min="10" 
                  max="200" 
                  step="5"
                  value={markupPercent}
                  onChange={(e) => handleMarkupChange(parseInt(e.target.value))}
                  className="w-24 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  +{markupPercent}%
                </span>
              </div>
            </div>

            {/* TAB CONTENT: Paste Text */}
            {activeInputTab === 'text' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-brand-dark flex items-center gap-1.5">
                    Paste WhatsApp Broadcast or Group Messages:
                  </label>
                  <span className="text-[11px] text-brand-gray">
                    Accepts single or multi-product broadcasts with rates, photos & specs
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste WhatsApp messages here, e.g.:&#10;🔥 NEW ARRIVAL! 5-in-1 Electric Cleaning Brush&#10;Rechargeable cordless power scrubber for dishes and bathroom&#10;Wholesale Price: Rs. 850&#10;Weight: 380g&#10;Image: https://images.unsplash.com/...&#10;Video: https://assets.mixkit.co/..."
                  className="w-full bg-white border border-black/10 rounded-2xl p-3.5 text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-brand-gray">Default Category:</span>
                    <select
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value as any)}
                      className="bg-white border border-black/10 rounded-xl px-3 py-1.5 font-bold text-xs outline-none"
                    >
                      <option value="Auto">✨ Auto Detect</option>
                      <option value="Home Improvement">Home Improvement</option>
                      <option value="Gadgets">Gadgets</option>
                      <option value="Kitchen">Kitchen</option>
                    </select>
                  </div>

                  <button
                    onClick={handleExtractFromText}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={15} />
                    {isProcessing ? 'Parsing Details...' : '🚀 Extract Products & Media'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Chat Export File */}
            {activeInputTab === 'file' && (
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-400/60 bg-white rounded-2xl p-8 text-center hover:bg-emerald-50/40 transition-colors cursor-pointer"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".txt" 
                    onChange={handleChatFileUpload} 
                    className="hidden" 
                  />
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center mb-3">
                    <Upload size={24} />
                  </div>
                  <h4 className="font-bold text-sm text-brand-dark">Upload WhatsApp Chat Export (.txt)</h4>
                  <p className="text-xs text-brand-gray mt-1 max-w-md mx-auto">
                    Export chat from your WhatsApp Group / Channel (Without Media or With Media log) and upload the <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">_chat.txt</code> file here.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Media Attachments */}
            {activeInputTab === 'media' && (
              <div className="space-y-4">
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragOverDropzone(true); }}
                  onDragLeave={() => setDragOverDropzone(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverDropzone(false);
                    handleMediaUpload(e.dataTransfer.files);
                  }}
                  onClick={() => mediaInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    dragOverDropzone ? 'border-emerald-600 bg-emerald-50' : 'border-black/15 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={mediaInputRef} 
                    accept="image/*,video/mp4,video/webm" 
                    multiple 
                    onChange={(e) => handleMediaUpload(e.target.files)} 
                    className="hidden" 
                  />
                  <div className="flex justify-center gap-2 mb-2">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                      <ImageIcon size={20} />
                    </div>
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Video size={20} />
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-brand-dark">Drop WhatsApp Photos & Videos Here</h4>
                  <p className="text-xs text-brand-gray mt-1">
                    Drag and drop images (.jpg, .png, .webp) and MP4 videos downloaded from WhatsApp. They will automatically match your extracted products!
                  </p>
                </div>

                {/* Media Pool Grid */}
                {mediaPool.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-brand-gray">
                      <span>Uploaded Assets ({mediaPool.length})</span>
                      <button 
                        onClick={() => setMediaPool([])}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Clear Assets
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {mediaPool.map((media) => (
                        <div key={media.id} className="relative group bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
                          {media.type === 'video' ? (
                            <div className="h-20 bg-zinc-900 flex flex-col items-center justify-center text-white">
                              <Film size={24} className="text-amber-400 mb-1" />
                              <span className="text-[9px] font-bold">MP4 Video</span>
                            </div>
                          ) : (
                            <img src={media.url} alt={media.name} className="w-full h-20 object-cover" />
                          )}
                          <div className="p-1 text-[9px] font-medium text-brand-gray truncate">
                            {media.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 1-Click Samples */}
            {activeInputTab === 'presets' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {WHATSAPP_PRESET_SAMPLES.map((preset, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-black/10 rounded-2xl p-4 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-brand-dark mb-1.5">{preset.title}</h4>
                      <p className="text-[11px] text-brand-gray font-mono bg-brand-light p-2 rounded-xl line-clamp-3">
                        {preset.text}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setRawText(preset.text);
                        setActiveInputTab('text');
                        showToast("Loaded sample WhatsApp post. Click 'Extract Products' to parse!", "info");
                      }}
                      className="mt-3 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Load This Sample
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parsed Products Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/10">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-brand-dark">
                  Extracted Products ({parsedItems.length})
                </span>
                {parsedItems.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    {parsedItems.every(i => i.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {parsedItems.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleImportToCatalog('append')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus size={15} /> Import Selected ({parsedItems.filter(i => i.selected).length}) to Catalog
                  </button>
                  <button
                    onClick={() => handleImportToCatalog('replace')}
                    className="px-3 py-2 bg-zinc-800 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    title="Replace entire catalog with these items"
                  >
                    <RefreshCw size={13} /> Replace Catalog
                  </button>
                </div>
              )}
            </div>

            {parsedItems.length === 0 ? (
              <div className="bg-brand-light/30 border-2 border-dashed border-black/10 rounded-3xl p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Package size={28} />
                </div>
                <h3 className="font-bold text-base text-brand-dark">No Products Extracted Yet</h3>
                <p className="text-xs text-brand-gray max-w-md mx-auto leading-relaxed">
                  Paste raw WhatsApp broadcast posts above, or click on <strong>"⚡ 1-Click Samples"</strong> to test live extraction of titles, prices, pictures, videos, and weights!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`bg-white border rounded-3xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between ${
                      item.selected ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-black/10 opacity-75'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Row: Checkbox, Name & Category */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItemSelection(item.id)}
                          className="mt-1 w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                        <div className="flex-grow">
                          <input 
                            type="text" 
                            value={item.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setParsedItems(prev => prev.map(i => i.id === item.id ? { ...i, name: val } : i));
                            }}
                            className="w-full font-bold text-sm text-brand-dark border-b border-transparent focus:border-emerald-500 outline-none pb-0.5"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-brand-gray">
                              Weight: <strong>{item.weight}g</strong>
                            </span>
                            {item.video && (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">
                                <Video size={10} /> Has Video
                              </span>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Media Thumbnails & Video Preview */}
                      <div className="flex gap-3 items-center">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border border-black/10 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-grow space-y-1.5 text-xs">
                          {/* Image URL Input */}
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-gray block">
                              Photo URL / Local Asset
                            </label>
                            <input 
                              type="text" 
                              value={item.image}
                              onChange={(e) => {
                                const val = e.target.value;
                                setParsedItems(prev => prev.map(i => i.id === item.id ? { ...i, image: val, images: [val] } : i));
                              }}
                              className="w-full bg-brand-light border border-black/10 rounded-xl px-2.5 py-1 text-xs font-medium outline-none truncate"
                            />
                          </div>

                          {/* Video URL Input */}
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-gray block flex items-center gap-1">
                              <Film size={10} /> Product Video Link (MP4 / WebM / YouTube)
                            </label>
                            <input 
                              type="text" 
                              value={item.video || ''}
                              placeholder="e.g. https://.../video.mp4"
                              onChange={(e) => {
                                const val = e.target.value;
                                setParsedItems(prev => prev.map(i => i.id === item.id ? { ...i, video: val } : i));
                              }}
                              className="w-full bg-brand-light border border-black/10 rounded-xl px-2.5 py-1 text-xs font-medium outline-none truncate"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Price Breakdown Box */}
                      <div className="bg-brand-light/70 p-3 rounded-2xl grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-brand-gray block">Wholesale Cost (Rs):</label>
                          <input 
                            type="number" 
                            value={item.costPricePkr}
                            onChange={(e) => {
                              const cost = parseInt(e.target.value) || 0;
                              const retail = Math.round(cost * (1 + markupPercent / 100));
                              setParsedItems(prev => prev.map(i => i.id === item.id ? { ...i, costPricePkr: cost, retailPricePkr: retail } : i));
                            }}
                            className="w-full bg-white border border-black/10 rounded-xl p-1.5 font-bold text-brand-dark outline-none mt-0.5"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-emerald-700 block">Selling Retail Price (Rs):</label>
                          <input 
                            type="number" 
                            value={item.retailPricePkr}
                            onChange={(e) => {
                              const retail = parseInt(e.target.value) || 0;
                              setParsedItems(prev => prev.map(i => i.id === item.id ? { ...i, retailPricePkr: retail } : i));
                            }}
                            className="w-full bg-white border border-emerald-300 rounded-xl p-1.5 font-black text-emerald-800 outline-none mt-0.5"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => {
                          const desc = e.target.value;
                          setParsedItems(prev => prev.map(i => i.id === item.id ? { ...i, description: desc } : i));
                        }}
                        className="w-full bg-brand-light/40 border border-black/5 rounded-xl p-2 text-xs text-brand-gray outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-gray-50 border-t border-black/10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-brand-gray">
            {parsedItems.length > 0 ? (
              <span><strong>{parsedItems.filter(i => i.selected).length} of {parsedItems.length}</strong> items selected for import</span>
            ) : (
              <span>Tip: Drag MP4 videos and images directly into the media tab to attach them.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-brand-dark border border-black/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {parsedItems.length > 0 && (
              <button
                onClick={() => handleImportToCatalog('append')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Check size={16} /> Import into Store Catalog
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
