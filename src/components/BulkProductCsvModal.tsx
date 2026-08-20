import React, { useState, useRef, useMemo } from 'react';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Eye, 
  FileText, 
  X, 
  HelpCircle,
  Package,
  Layers,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckSquare,
  Square,
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { Product, CsvImportLog } from '../types';
import { saveImportLog } from './ImportLogsTab';

interface BulkProductCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (newProducts: Product[], mode: 'append' | 'replace') => void;
  currentProducts: Product[];
  showToast: (msg: string, type?: 'success' | 'info' | 'remove') => void;
  onClearStoreCatalog?: () => void;
}

interface ParsedProductRow {
  id: string;
  name: string;
  price: number;
  category: 'Home Improvement' | 'Gadgets' | 'Kitchen';
  weight: number;
  description: string;
  image: string;
  images?: string[];
  rating: number;
  isTopSeller: boolean;
  discountNote?: string;
  stock?: number;
  lowStockThreshold?: number;
  sku?: string;
  isValid: boolean;
  errors: string[];
}

export function BulkProductCsvModal({
  isOpen,
  onClose,
  onImportProducts,
  currentProducts,
  showToast,
  onClearStoreCatalog
}: BulkProductCsvModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'manual'>('upload');
  const [csvText, setCsvText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('catalog_import.csv');
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewCategoryFilter, setPreviewCategoryFilter] = useState<'all' | 'Gadgets' | 'Home Improvement' | 'Kitchen'>('all');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filtered rows for the interactive preview table
  const filteredPreviewRows = parsedRows.filter(row => {
    if (previewCategoryFilter !== 'all' && row.category !== previewCategoryFilter) return false;
    if (previewSearch) {
      const q = previewSearch.toLowerCase();
      return (
        row.name.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.price.toString().includes(q)
      );
    }
    return true;
  });

  // Toggle selection for a single row in the CSV preview
  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle select all filtered rows in CSV preview
  const handleToggleSelectAll = () => {
    if (filteredPreviewRows.length > 0 && filteredPreviewRows.every(r => selectedRowIds.includes(r.id))) {
      const filteredIdSet = new Set(filteredPreviewRows.map(r => r.id));
      setSelectedRowIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const newSelected = Array.from(new Set([...selectedRowIds, ...filteredPreviewRows.map(r => r.id)]));
      setSelectedRowIds(newSelected);
    }
  };

  // Delete multiple selected rows from CSV preview
  const handleDeleteSelectedRows = () => {
    if (selectedRowIds.length === 0) return;
    const selectedCount = selectedRowIds.length;
    const idSet = new Set(selectedRowIds);
    setParsedRows(prev => prev.filter(r => !idSet.has(r.id)));
    setSelectedRowIds([]);
    showToast(`Deleted ${selectedCount} product row(s) from CSV preview.`, 'remove');
  };

  // Delete / Clear complete CSV file and all parsed rows
  const handleClearCompleteCsv = () => {
    if (parsedRows.length === 0) return;
    const count = parsedRows.length;
    setParsedRows([]);
    setSelectedRowIds([]);
    setCsvText('');
    showToast(`Cleared complete CSV dataset (${count} rows removed).`, 'info');
  };

  // Generate Sample CSV Template
  const generateSampleCsv = () => {
    const headers = [
      'SKU',
      'Name',
      'Price',
      'Stock',
      'Low Stock Threshold',
      'Category',
      'Weight',
      'Description',
      'Image URL',
      'Additional Images',
      'Rating',
      'Is Top Seller',
      'Discount Note'
    ];

    const sampleRows = [
      [
        '"KCC-WP-01"',
        '"Smart Rechargeable Water Pump"',
        '1200',
        '25',
        '5',
        '"Gadgets"',
        '350',
        '"Automatic touch water dispenser for 19L bottles. Fast USB charging."',
        '"https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=800"',
        '"https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800"',
        '4.8',
        'TRUE',
        '"Discount On Quantity"'
      ],
      [
        '"KCC-ARC-02"',
        '"Electric Rechargeable Arc Lighter"',
        '250',
        '3',
        '5',
        '"Gadgets"',
        '120',
        '"Windproof plasma arc lighter. Ideal for kitchen gas stoves and camping."',
        '"https://images.unsplash.com/photo-1590212151175-e58edd96185c?q=80&w=800"',
        '""',
        '4.8',
        'TRUE',
        '"Discount On Quantity"'
      ],
      [
        '"KCC-BLND-03"',
        '"Heavy Duty 6-Blade Kitchen Blender"',
        '3800',
        '18',
        '5',
        '"Kitchen"',
        '1800',
        '"High speed copper motor for smoothies, shakes, spices, and puree."',
        '"https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800"',
        '""',
        '4.9',
        'FALSE',
        '"Wholesale Rate"'
      ],
      [
        '"KCC-LL-04"',
        '"Self-Leveling 3D Laser Level Meter"',
        '4500',
        '2',
        '5',
        '"Home Improvement"',
        '1100',
        '"12-line green beam laser with rechargeable battery & rotary tripod."',
        '"https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800"',
        '""',
        '4.9',
        'TRUE',
        '"Box Packing"'
      ]
    ];

    const csvContent = [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kcc_products_bulk_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded sample CSV template with stock fields!', 'success');
  };

  // Export current catalog as CSV
  const handleExportCurrentCatalog = () => {
    const headers = [
      'SKU',
      'Name',
      'Price',
      'Stock',
      'Low Stock Threshold',
      'Category',
      'Weight',
      'Description',
      'Image URL',
      'Additional Images',
      'Rating',
      'Is Top Seller',
      'Discount Note'
    ];

    const rows = currentProducts.map(p => [
      `"${(p.sku || `KCC-${p.id}`).replace(/"/g, '""')}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      p.price,
      p.stock ?? 10,
      p.lowStockThreshold ?? 5,
      `"${p.category}"`,
      p.weight,
      `"${p.description.replace(/"/g, '""')}"`,
      `"${p.image}"`,
      `"${(p.images || []).join(';')}"`,
      p.rating,
      p.isTopSeller ? 'TRUE' : 'FALSE',
      `"${p.discountNote || 'Discount On Quantity'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kcc_store_catalog_backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${currentProducts.length} products with stock data to CSV!`, 'success');
  };

  // Parse CSV Helper handling quotes and commas
  const parseCsvLines = (text: string): string[][] => {
    const lines: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        lines.push(currentRow);
      }
    }

    return lines;
  };

  // Convert parsed lines into structured products
  const processCsvData = (rawText: string) => {
    setIsProcessing(true);
    try {
      const rawRows = parseCsvLines(rawText);
      if (rawRows.length < 2) {
        showToast('CSV must have a header row and at least one product row.', 'remove');
        setIsProcessing(false);
        return;
      }

      const headers = rawRows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      
      // Smart header mapping index finder
      const findCol = (keys: string[]): number => {
        for (const k of keys) {
          const idx = headers.findIndex(h => h.includes(k));
          if (idx !== -1) return idx;
        }
        return -1;
      };

      const skuIdx = findCol(['sku', 'code', 'itemcode', 'model', 'productcode']);
      const nameIdx = findCol(['name', 'title', 'productname', 'item']);
      const priceIdx = findCol(['price', 'rate', 'pkr', 'cost', 'retail']);
      const stockIdx = findCol(['stock', 'inventory', 'quantity', 'qty', 'units', 'stocklevel', 'available']);
      const thresholdIdx = findCol(['lowstockthreshold', 'threshold', 'lowstock', 'alertlevel', 'minstock']);
      const categoryIdx = findCol(['category', 'cat', 'type', 'dept', 'collection']);
      const weightIdx = findCol(['weight', 'grams', 'wt', 'mass']);
      const descIdx = findCol(['description', 'desc', 'details', 'detail', 'info', 'summary']);
      const imageIdx = findCol(['imageurl', 'image', 'photo', 'img', 'thumbnail', 'pic']);
      const addlImagesIdx = findCol(['additionalimages', 'images', 'gallery', 'photos', 'moreimages']);
      const ratingIdx = findCol(['rating', 'stars', 'review', 'score']);
      const topSellerIdx = findCol(['istopseller', 'topseller', 'top', 'featured', 'bestseller']);
      const discountNoteIdx = findCol(['discountnote', 'discount', 'badge', 'note', 'offer']);

      const parsed: ParsedProductRow[] = [];

      for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.length === 0 || !row.some(c => c.trim().length > 0)) continue;

        const errors: string[] = [];
        
        // SKU
        const sku = skuIdx !== -1 && row[skuIdx] ? row[skuIdx].trim() : `KCC-${Date.now().toString().slice(-4)}-${i}`;

        // Name
        const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : `Product Item #${i}`;
        if (!name || name.length < 2) {
          errors.push('Product name is required');
        }

        // Price
        let price = 0;
        if (priceIdx !== -1 && row[priceIdx]) {
          const cleanPrice = row[priceIdx].replace(/[^0-9.]/g, '');
          price = parseFloat(cleanPrice) || 0;
        }
        if (price <= 0) {
          errors.push('Valid price > 0 is required');
        }

        // Stock (Inventory)
        let stock = 15;
        if (stockIdx !== -1 && row[stockIdx] !== undefined && row[stockIdx].trim() !== '') {
          const cleanStock = row[stockIdx].replace(/[^0-9]/g, '');
          stock = parseInt(cleanStock) || 0;
        }

        // Low stock threshold
        let lowStockThreshold = 5;
        if (thresholdIdx !== -1 && row[thresholdIdx] !== undefined && row[thresholdIdx].trim() !== '') {
          const cleanTh = row[thresholdIdx].replace(/[^0-9]/g, '');
          lowStockThreshold = parseInt(cleanTh) || 5;
        }

        // Category
        let category: 'Home Improvement' | 'Gadgets' | 'Kitchen' = 'Gadgets';
        if (categoryIdx !== -1 && row[categoryIdx]) {
          const catStr = row[categoryIdx].toLowerCase();
          if (catStr.includes('kitchen') || catStr.includes('cook') || catStr.includes('blender') || catStr.includes('utensil')) {
            category = 'Kitchen';
          } else if (catStr.includes('home') || catStr.includes('tool') || catStr.includes('decor') || catStr.includes('light') || catStr.includes('lamp')) {
            category = 'Home Improvement';
          } else {
            category = 'Gadgets';
          }
        }

        // Weight
        let weight = 300;
        if (weightIdx !== -1 && row[weightIdx]) {
          const cleanWt = row[weightIdx].replace(/[^0-9.]/g, '');
          weight = parseInt(cleanWt) || 300;
        }

        // Description
        const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : `${name} - High quality wholesale product at KCC Online Store.`;

        // Image
        let image = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800';
        if (imageIdx !== -1 && row[imageIdx] && row[imageIdx].trim().startsWith('http')) {
          image = row[imageIdx].trim();
        }

        // Additional Images
        let images: string[] = [image];
        if (addlImagesIdx !== -1 && row[addlImagesIdx]) {
          const rawAddl = row[addlImagesIdx].split(/[;,|]/).map(s => s.trim()).filter(s => s.startsWith('http'));
          if (rawAddl.length > 0) {
            images = [image, ...rawAddl.filter(u => u !== image)];
          }
        }

        // Rating
        let rating = 4.8;
        if (ratingIdx !== -1 && row[ratingIdx]) {
          const cleanRating = parseFloat(row[ratingIdx].replace(/[^0-9.]/g, ''));
          if (!isNaN(cleanRating) && cleanRating >= 1 && cleanRating <= 5) {
            rating = cleanRating;
          }
        }

        // Is Top Seller
        let isTopSeller = false;
        if (topSellerIdx !== -1 && row[topSellerIdx]) {
          const topVal = row[topSellerIdx].toLowerCase().trim();
          isTopSeller = topVal === 'true' || topVal === '1' || topVal === 'yes' || topVal === 'top' || topVal === 'y';
        }

        // Discount Note
        const discountNote = discountNoteIdx !== -1 && row[discountNoteIdx] ? row[discountNoteIdx].trim() : 'Discount On Quantity';

        parsed.push({
          id: `bulk-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          sku,
          name,
          price,
          stock,
          lowStockThreshold,
          category,
          weight,
          description,
          image,
          images,
          rating,
          isTopSeller,
          discountNote,
          isValid: errors.length === 0,
          errors
        });
      }

      setParsedRows(parsed);
      setSelectedRowIds([]);
      if (parsed.length > 0) {
        showToast(`Parsed ${parsed.length} products from CSV! Review or delete rows before importing.`, 'success');
      } else {
        showToast('No valid product rows could be extracted.', 'remove');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`CSV Parsing Error: ${err.message}`, 'remove');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        processCsvData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setCsvText(content);
          processCsvData(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveRow = (id: string) => {
    setParsedRows(parsedRows.filter(r => r.id !== id));
    setSelectedRowIds(selectedRowIds.filter(selectedId => selectedId !== id));
  };

  const handleUpdateRowField = (id: string, field: keyof ParsedProductRow, val: any) => {
    setParsedRows(parsedRows.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: val };
      // revalidate
      const errors: string[] = [];
      if (!updated.name || updated.name.length < 2) errors.push('Name is required');
      if (updated.price <= 0) errors.push('Price must be > 0');
      return {
        ...updated,
        isValid: errors.length === 0,
        errors
      };
    }));
  };

  const handleAddManualRow = () => {
    const newRow: ParsedProductRow = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sku: `KCC-MAN-${Date.now().toString().slice(-4)}`,
      name: 'New Product Item',
      price: 1500,
      stock: 12,
      lowStockThreshold: 5,
      category: 'Gadgets',
      weight: 350,
      description: 'High quality wholesale imported item with guaranteed manufacturer warranty.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800',
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800'],
      rating: 4.8,
      isTopSeller: false,
      discountNote: 'Discount On Quantity',
      isValid: true,
      errors: []
    };
    setParsedRows([newRow, ...parsedRows]);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    const invalidRows = parsedRows.filter(r => !r.isValid);

    const validProducts: Product[] = validRows.map(r => ({
      id: r.id,
      sku: r.sku || `KCC-${r.id}`,
      name: r.name,
      price: r.price,
      stock: r.stock !== undefined ? r.stock : 15,
      lowStockThreshold: r.lowStockThreshold !== undefined ? r.lowStockThreshold : 5,
      trackInventory: true,
      category: r.category,
      weight: r.weight,
      description: r.description,
      image: r.image,
      images: r.images && r.images.length > 0 ? r.images : [r.image],
      rating: r.rating || 4.8,
      isTopSeller: r.isTopSeller,
      discountNote: r.discountNote || 'Discount On Quantity'
    }));

    if (validProducts.length === 0) {
      showToast('Please fix validation errors or add at least one valid product.', 'remove');
      return;
    }

    // Record structured import log
    const errorsList = invalidRows.map((inv, idx) => ({
      rowNumber: idx + 1,
      productName: inv.name,
      sku: inv.sku,
      errorReason: inv.errors.join(', ') || 'Invalid field values'
    }));

    const status: 'success' | 'partial' | 'failed' = 
      invalidRows.length === 0 ? 'success' : (validRows.length > 0 ? 'partial' : 'failed');

    const logEntry: CsvImportLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fileName: uploadedFileName || (activeTab === 'manual' ? 'Manual Data Entry' : 'Pasted Raw CSV'),
      importMode,
      totalRowsProcessed: parsedRows.length,
      productsAddedCount: validProducts.length,
      errorsCount: invalidRows.length,
      status,
      errors: errorsList,
      importedProductNames: validProducts.map(p => p.name)
    };

    saveImportLog(logEntry);

    onImportProducts(validProducts, importMode);
    onClose();
  };

  const isAllFilteredSelected = filteredPreviewRows.length > 0 && filteredPreviewRows.every(r => selectedRowIds.includes(r.id));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/10 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 via-brand-dark to-black text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-primary/20 text-brand-secondary border border-brand-primary/30 rounded-2xl">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-brand-secondary text-[10px] font-extrabold uppercase tracking-widest mb-1">
                <Sparkles size={11} /> Bulk CSV Catalog Manager
              </div>
              <h2 className="text-xl font-display font-extrabold text-white">
                Upload & Manage Products with CSV File
              </h2>
              <p className="text-xs text-white/70">
                Bulk upload, delete multiple rows at once, replace complete catalog, or export CSV spreadsheet backups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCurrentCatalog}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Backup current store catalog as CSV"
            >
              <Download size={14} /> Export Backup ({currentProducts.length})
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action Tabs & Subheader */}
        <div className="p-4 bg-brand-light/60 border-b border-black/5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-brand-gray hover:text-brand-dark'
              }`}
            >
              <Upload size={14} /> Upload .CSV File
            </button>

            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-brand-gray hover:text-brand-dark'
              }`}
            >
              <FileText size={14} /> Paste CSV Text
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-brand-gray hover:text-brand-dark'
              }`}
            >
              <Plus size={14} /> Interactive Table Builder
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateSampleCsv}
              className="px-3.5 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 border border-emerald-600/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download size={14} /> Sample CSV Template
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-brand-primary bg-brand-primary/5 scale-[0.99]'
                    : 'border-black/20 hover:border-brand-primary hover:bg-brand-light/40 bg-brand-light/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,text/csv,text/plain"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-3">
                  <Upload size={32} />
                </div>
                <h3 className="font-display font-bold text-base text-brand-dark">
                  Click to Browse or Drag & Drop your .CSV File here
                </h3>
                <p className="text-xs text-brand-gray mt-1 max-w-md mx-auto">
                  Supports Excel spreadsheets, Google Sheets CSV exports, and supplier catalogs.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-[11px] font-bold text-brand-gray border border-black/5 shadow-xs">
                  <span>Columns: Name, Price, Category, Weight, Description, Image URL, Additional Images, Rating, Top Seller</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Paste CSV */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">
                  Paste Raw CSV Spreadsheet Text (with header row)
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`Name,Price,Category,Weight,Description,Image URL\n"Automatic Electric Water Pump",1200,"Gadgets",350,"USB rechargeable water pump","https://example.com/pump.jpg"\n"Stainless Kitchen Chef Knife",850,"Kitchen",250,"Ultra sharp 8-inch chef knife","https://example.com/knife.jpg"`}
                  className="w-full bg-brand-light/40 border border-black/10 rounded-2xl p-4 font-mono text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => processCsvData(csvText)}
                  disabled={!csvText.trim() || isProcessing}
                  className="px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} /> Parse & Validate CSV
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive Table Builder */}
          {activeTab === 'manual' && (
            <div className="flex items-center justify-between bg-brand-light p-4 rounded-2xl border border-black/5">
              <div>
                <h4 className="font-bold text-sm text-brand-dark">Interactive Multi-Product Row Editor</h4>
                <p className="text-xs text-brand-gray">Add, edit, or adjust items directly in the table below before importing.</p>
              </div>
              <button
                onClick={handleAddManualRow}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus size={15} /> + Add Product Row
              </button>
            </div>
          )}

          {/* PARSED PRODUCTS PREVIEW & BULK MANAGEMENT SECTION */}
          {parsedRows.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Header with Search, Filter & Bulk Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-base text-brand-dark flex items-center gap-2">
                    <Package size={18} className="text-brand-primary" />
                    CSV Products ({parsedRows.length})
                  </h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full">
                    {parsedRows.filter(r => r.isValid).length} Valid
                  </span>
                  {parsedRows.some(r => !r.isValid) && (
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-800 font-extrabold text-xs rounded-full">
                      {parsedRows.filter(r => !r.isValid).length} Need Correction
                    </span>
                  )}
                  {selectedRowIds.length > 0 && (
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold text-xs rounded-full">
                      {selectedRowIds.length} Selected
                    </span>
                  )}
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                    <input
                      type="text"
                      placeholder="Search CSV rows..."
                      value={previewSearch}
                      onChange={(e) => setPreviewSearch(e.target.value)}
                      className="bg-brand-light border border-black/10 rounded-xl py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary w-40"
                    />
                  </div>

                  <select
                    value={previewCategoryFilter}
                    onChange={(e) => setPreviewCategoryFilter(e.target.value as any)}
                    className="bg-brand-light border border-black/10 rounded-xl py-1.5 px-2.5 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="Home Improvement">Home Improvement</option>
                    <option value="Kitchen">Kitchen</option>
                  </select>

                  <button
                    onClick={handleAddManualRow}
                    className="px-3 py-1.5 bg-brand-light hover:bg-black/5 text-brand-dark text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add Row
                  </button>

                  {/* Complete CSV Deletion Button */}
                  <button
                    onClick={handleClearCompleteCsv}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Delete all parsed rows and reset CSV file"
                  >
                    <Trash2 size={13} /> Delete Complete CSV ({parsedRows.length})
                  </button>
                </div>
              </div>

              {/* Multi-Select Action Bar (Visible when 1+ rows selected) */}
              {selectedRowIds.length > 0 && (
                <div className="p-3 bg-indigo-950 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                      {selectedRowIds.length}
                    </span>
                    <span className="text-xs font-bold">
                      {selectedRowIds.length} row(s) selected for bulk management
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteSelectedRows}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Trash2 size={13} /> Delete Selected ({selectedRowIds.length})
                    </button>
                    <button
                      onClick={() => setSelectedRowIds([])}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}

              {/* Table Container */}
              <div className="border border-black/10 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-light/90 sticky top-0 z-10 text-[11px] font-extrabold uppercase tracking-wider text-brand-gray border-b border-black/10">
                      <tr>
                        {/* Checkbox column header */}
                        <th className="p-3 w-10 text-center">
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="text-brand-dark hover:text-indigo-600 transition-colors cursor-pointer"
                            title={isAllFilteredSelected ? 'Deselect all rows' : 'Select all filtered rows'}
                          >
                            {isAllFilteredSelected ? (
                              <CheckSquare size={16} className="text-indigo-600" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </th>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3 w-16">Image</th>
                        <th className="p-3">Product Name, SKU & Description</th>
                        <th className="p-3 w-24">Price (PKR)</th>
                        <th className="p-3 w-28 text-center">Stock Level</th>
                        <th className="p-3 w-32">Category</th>
                        <th className="p-3 w-20 text-center">Weight (g)</th>
                        <th className="p-3 w-16 text-center">Top Seller</th>
                        <th className="p-3 w-20 text-center">Status</th>
                        <th className="p-3 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {filteredPreviewRows.map((row, idx) => {
                        const isSelected = selectedRowIds.includes(row.id);
                        const rowStock = row.stock !== undefined ? row.stock : 10;
                        const isRowLowStock = rowStock > 0 && rowStock <= (row.lowStockThreshold ?? 5);
                        const isRowOutOfStock = rowStock === 0;

                        return (
                          <tr 
                            key={row.id} 
                            className={`hover:bg-brand-light/40 transition-colors ${
                              isSelected 
                                ? 'bg-indigo-50/60' 
                                : !row.isValid 
                                  ? 'bg-red-50/50' 
                                  : isRowLowStock
                                    ? 'bg-amber-50/40'
                                    : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectRow(row.id)}
                                className="text-brand-gray hover:text-indigo-600 transition-colors cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare size={16} className="text-indigo-600" />
                                ) : (
                                  <Square size={16} />
                                )}
                              </button>
                            </td>
                            <td className="p-3 text-center text-brand-gray font-mono font-bold text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="p-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-black/10 relative group">
                                <img
                                  src={row.image}
                                  alt={row.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800');
                                  }}
                                />
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => handleUpdateRowField(row.id, 'name', e.target.value)}
                                  className="w-full bg-transparent font-bold text-brand-dark focus:bg-white focus:ring-1 focus:ring-brand-primary p-1 rounded outline-none"
                                />
                                <input
                                  type="text"
                                  value={row.sku || ''}
                                  placeholder="SKU"
                                  onChange={(e) => handleUpdateRowField(row.id, 'sku', e.target.value)}
                                  className="w-24 bg-brand-light/60 font-mono text-[10px] text-brand-gray focus:bg-white focus:ring-1 focus:ring-brand-primary p-1 rounded outline-none shrink-0"
                                  title="Product SKU / Code"
                                />
                              </div>
                              <input
                                type="text"
                                value={row.description}
                                onChange={(e) => handleUpdateRowField(row.id, 'description', e.target.value)}
                                placeholder="Product description..."
                                className="w-full bg-transparent text-[11px] text-brand-gray focus:bg-white focus:ring-1 focus:ring-brand-primary p-1 rounded outline-none mt-0.5"
                              />
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-[9px] text-brand-gray">Img URL:</span>
                                <input
                                  type="text"
                                  value={row.image}
                                  onChange={(e) => handleUpdateRowField(row.id, 'image', e.target.value)}
                                  className="w-full bg-transparent text-[10px] text-blue-600 font-mono focus:bg-white focus:ring-1 focus:ring-brand-primary p-0.5 rounded outline-none"
                                />
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <span className="text-brand-gray font-bold text-[11px]">Rs.</span>
                                <input
                                  type="number"
                                  value={row.price}
                                  onChange={(e) => handleUpdateRowField(row.id, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-20 bg-brand-light/60 font-black text-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary p-1.5 rounded outline-none"
                                />
                              </div>
                            </td>
                            {/* Stock & Low Stock Badge */}
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={row.stock !== undefined ? row.stock : 10}
                                  onChange={(e) => handleUpdateRowField(row.id, 'stock', Math.max(0, parseInt(e.target.value) || 0))}
                                  className={`w-16 font-mono font-black text-center p-1 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-brand-primary ${
                                    isRowOutOfStock 
                                      ? 'bg-red-50 text-red-700 border-red-300' 
                                      : isRowLowStock 
                                        ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' 
                                        : 'bg-brand-light/60 text-brand-dark border-black/10'
                                  }`}
                                />
                                {isRowOutOfStock ? (
                                  <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-extrabold text-[9px] uppercase">
                                    Out
                                  </span>
                                ) : isRowLowStock ? (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white font-extrabold text-[9px] uppercase animate-pulse">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-emerald-600 font-bold">
                                    In Stock
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <select
                                value={row.category}
                                onChange={(e) => handleUpdateRowField(row.id, 'category', e.target.value)}
                                className="w-full bg-brand-light/60 font-bold text-brand-dark focus:bg-white focus:ring-1 focus:ring-brand-primary p-1.5 rounded outline-none cursor-pointer"
                              >
                                <option value="Gadgets">Gadgets</option>
                                <option value="Home Improvement">Home Improvement</option>
                                <option value="Kitchen">Kitchen</option>
                              </select>
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                value={row.weight}
                                onChange={(e) => handleUpdateRowField(row.id, 'weight', parseInt(e.target.value) || 100)}
                                className="w-14 bg-brand-light/60 font-bold text-brand-dark focus:bg-white focus:ring-1 focus:ring-brand-primary p-1.5 rounded outline-none text-center"
                              />
                              <span className="text-[10px] text-brand-gray block text-center mt-0.5">g</span>
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.isTopSeller}
                                onChange={(e) => handleUpdateRowField(row.id, 'isTopSeller', e.target.checked)}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                              />
                            </td>
                            <td className="p-3 text-center">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                                  <CheckCircle size={14} /> Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600 font-bold text-[10px]" title={row.errors.join(', ')}>
                                  <AlertCircle size={14} /> Fix
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleRemoveRow(row.id)}
                                className="p-1.5 text-brand-gray hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-brand-light/80 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold text-brand-dark">Import Action:</span>
            <label className="flex items-center gap-1.5 text-xs font-medium text-brand-dark cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="accent-brand-primary cursor-pointer"
              />
              <span>Append (Add to existing {currentProducts.length} items)</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs font-bold text-red-700 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="accent-red-600 cursor-pointer"
              />
              <span>Replace entire store catalog with this CSV</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-black/5 text-brand-dark rounded-xl text-xs font-bold uppercase tracking-wider border border-black/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedRows.length === 0 || !parsedRows.some(r => r.isValid)}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle size={16} /> Import {parsedRows.filter(r => r.isValid).length} Products to Store
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
