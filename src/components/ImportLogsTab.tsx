import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  ArrowRight,
  RefreshCw,
  Info,
  Layers,
  AlertCircle
} from 'lucide-react';
import { CsvImportLog } from '../types';

export const IMPORT_LOGS_STORAGE_KEY = 'kcc_import_logs';

export function getStoredImportLogs(): CsvImportLog[] {
  try {
    const raw = localStorage.getItem(IMPORT_LOGS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic logs if empty
      const sampleLogs: CsvImportLog[] = [
        {
          id: 'log-sample-1',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
          fileName: 'kcc_initial_catalog_batch1.csv',
          importMode: 'replace',
          totalRowsProcessed: 12,
          productsAddedCount: 12,
          errorsCount: 0,
          status: 'success',
          errors: [],
          importedProductNames: [
            '20V Cordless Hammer Drill Set',
            'Portable USB Blender Bottle 380ml',
            'Windproof Plasma Electric Lighter',
            'Automatic Drinking Water Pump Dispenser',
            'Arctic Air Pure Chill 2.0 Portable Evaporative AC',
            'Rechargeable Neck Fan Hands-Free Cooler',
            'Vintage Flying Eagle Solar Desk Lamp',
            'Multipurpose Electric Screwdriver'
          ]
        },
        {
          id: 'log-sample-2',
          timestamp: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
          fileName: 'hhc_dropship_appliances.csv',
          importMode: 'append',
          totalRowsProcessed: 8,
          productsAddedCount: 7,
          errorsCount: 1,
          status: 'partial',
          errors: [
            {
              rowNumber: 6,
              productName: 'Mini Portable Rice Cooker',
              sku: 'KCC-RC-09',
              errorReason: 'Price was missing or 0 in row 6'
            }
          ],
          importedProductNames: [
            'Smart LED RGB Corner Lamp With Remote',
            'Heavy Duty 12-in-1 Vegetable Chopper Pro',
            'Ultrasonic Air Humidifier & Essential Oil Diffuser',
            'Rechargeable Motion Sensor Cabinet Night Light',
            '3-Speed Turbo Portable Handheld Desk Fan',
            'Stainless Steel Kitchen Herb Scissors'
          ]
        }
      ];
      localStorage.setItem(IMPORT_LOGS_STORAGE_KEY, JSON.stringify(sampleLogs));
      return sampleLogs;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load import logs', e);
    return [];
  }
}

export function saveImportLog(log: CsvImportLog) {
  try {
    const existing = getStoredImportLogs();
    const updated = [log, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(IMPORT_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save import log', e);
  }
}

interface ImportLogsTabProps {
  onOpenCsvModal?: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'remove') => void;
}

export function ImportLogsTab({ onOpenCsvModal, showToast }: ImportLogsTabProps) {
  const [logs, setLogs] = useState<CsvImportLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'partial' | 'failed'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getStoredImportLogs());
  }, []);

  const refreshLogs = () => {
    setLogs(getStoredImportLogs());
    showToast('Import logs refreshed', 'info');
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all CSV import history logs?')) {
      localStorage.removeItem(IMPORT_LOGS_STORAGE_KEY);
      setLogs([]);
      showToast('Import logs cleared', 'remove');
    }
  };

  const handleExportLogsCsv = () => {
    if (logs.length === 0) {
      showToast('No logs to export', 'info');
      return;
    }

    const headers = ['ID', 'Timestamp', 'File Name', 'Mode', 'Total Rows', 'Products Added', 'Errors Count', 'Status', 'Error Details'];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.fileName.replace(/"/g, '""')}"`,
      `"${l.importMode}"`,
      l.totalRowsProcessed,
      l.productsAddedCount,
      l.errorsCount,
      `"${l.status}"`,
      `"${(l.errors || []).map(e => `Row ${e.rowNumber}: ${e.errorReason}`).join('; ').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kcc_csv_import_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported CSV import logs report', 'success');
  };

  // Filtered Logs
  const filteredLogs = logs.filter(log => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchFile = log.fileName.toLowerCase().includes(q);
      const matchStatus = log.status.toLowerCase().includes(q);
      const matchProducts = (log.importedProductNames || []).some(p => p.toLowerCase().includes(q));
      const matchErrors = (log.errors || []).some(e => e.errorReason.toLowerCase().includes(q));
      return matchFile || matchStatus || matchProducts || matchErrors;
    }
    return true;
  });

  // Calculate Metrics
  const totalImports = logs.length;
  const totalProductsImported = logs.reduce((acc, curr) => acc + (curr.productsAddedCount || 0), 0);
  const totalErrors = logs.reduce((acc, curr) => acc + (curr.errorsCount || 0), 0);
  const successCount = logs.filter(l => l.status === 'success').length;
  const successRate = totalImports > 0 ? Math.round((successCount / totalImports) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-widest mb-1">
            <FileSpreadsheet size={16} />
            <span>Audit & Activity Trail</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-brand-dark">CSV Import Logs & History</h2>
          <p className="text-sm text-brand-gray mt-1">
            Detailed record of catalog uploads, batch imports, row counts, and processing errors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenCsvModal && (
            <button
              onClick={onOpenCsvModal}
              className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <FileSpreadsheet size={16} /> New CSV Import
            </button>
          )}
          <button
            onClick={refreshLogs}
            className="p-2.5 bg-brand-light hover:bg-black/10 text-brand-dark rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-black/5"
            title="Refresh logs"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleExportLogsCsv}
            className="p-2.5 bg-brand-light hover:bg-black/10 text-brand-dark rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-black/5"
            title="Export logs as CSV"
          >
            <Download size={15} /> Export Report
          </button>
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-200"
              title="Clear all logs"
            >
              <Trash2 size={15} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray block">Total Import Batches</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl md:text-3xl font-mono font-black text-brand-dark">{totalImports}</span>
            <span className="text-xs text-brand-gray font-semibold">Sessions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray block">Products Added / Updated</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl md:text-3xl font-mono font-black text-emerald-600">+{totalProductsImported}</span>
            <span className="text-xs text-brand-gray font-semibold">Items</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray block">Processing Errors</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl md:text-3xl font-mono font-black ${totalErrors > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {totalErrors}
            </span>
            <span className="text-xs text-brand-gray font-semibold">Rows Flagged</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray block">Success Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl md:text-3xl font-mono font-black text-brand-primary">{successRate}%</span>
            <span className="text-xs text-brand-gray font-semibold">Batch Quality</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file, product name, error..."
            className="w-full bg-brand-light pl-9 pr-4 py-2 rounded-xl text-xs font-semibold outline-none border border-black/5 focus:border-brand-primary"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray text-xs">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-brand-gray mr-1 flex items-center gap-1">
            <Filter size={13} /> Filter:
          </span>
          {(['all', 'success', 'partial', 'failed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-brand-dark text-white shadow-xs'
                  : 'bg-brand-light text-brand-gray hover:text-brand-dark'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mx-auto text-brand-gray">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="font-bold text-base text-brand-dark">No Import Logs Found</h3>
            <p className="text-xs text-brand-gray max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? 'No import logs match your current search and filter criteria.' 
                : 'Whenever you import or upload product catalogs via CSV, complete audit logs and error reports will be captured here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {filteredLogs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const dateFormatted = new Date(log.timestamp).toLocaleString('en-PK', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <div key={log.id} className="transition-colors hover:bg-brand-light/30">
                  {/* Log Item Summary Row */}
                  <div 
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                        log.status === 'success' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : log.status === 'partial' 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {log.status === 'success' ? (
                          <CheckCircle2 size={20} />
                        ) : log.status === 'partial' ? (
                          <AlertTriangle size={20} />
                        ) : (
                          <XCircle size={20} />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-brand-dark">{log.fileName || 'Bulk CSV Upload'}</h4>
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            log.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : log.status === 'partial'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}>
                            {log.status}
                          </span>
                          <span className="text-[10px] font-bold text-brand-gray bg-brand-light px-2 py-0.5 rounded-md border border-black/5 uppercase">
                            Mode: {log.importMode}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-brand-gray flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock size={12} /> {dateFormatted}
                          </span>
                          <span>•</span>
                          <span>Processed: <strong>{log.totalRowsProcessed}</strong> rows</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">Added: +{log.productsAddedCount} products</span>
                          {log.errorsCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-red-600 font-bold">{log.errorsCount} row error(s)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <button
                        type="button"
                        className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline"
                      >
                        {isExpanded ? 'Hide Details' : 'View Audit Details'}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Audit Log Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 bg-brand-light/50 border-t border-black/5 space-y-4 text-xs animate-in fade-in duration-150">
                      {/* Products Added List */}
                      {log.importedProductNames && log.importedProductNames.length > 0 && (
                        <div>
                          <span className="font-extrabold text-brand-dark uppercase text-[10px] tracking-wider block mb-2 flex items-center gap-1.5">
                            <Package size={12} className="text-brand-primary" /> Imported Products ({log.importedProductNames.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 bg-white rounded-2xl border border-black/5">
                            {log.importedProductNames.map((name, idx) => (
                              <span 
                                key={idx} 
                                className="bg-brand-light text-brand-dark px-2.5 py-1 rounded-lg text-xs font-semibold border border-black/5"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Errors and Warnings Breakdown */}
                      {log.errors && log.errors.length > 0 ? (
                        <div>
                          <span className="font-extrabold text-red-700 uppercase text-[10px] tracking-wider block mb-2 flex items-center gap-1.5">
                            <AlertCircle size={12} className="text-red-600" /> Row Processing Issues ({log.errors.length})
                          </span>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {log.errors.map((err, errIdx) => (
                              <div 
                                key={errIdx}
                                className="p-3 bg-red-50/80 rounded-xl border border-red-200 text-red-900 flex items-start gap-2.5"
                              >
                                <span className="font-mono font-black text-xs bg-red-200/80 text-red-900 px-2 py-0.5 rounded">
                                  Row {err.rowNumber}
                                </span>
                                <div className="flex-1">
                                  {err.productName && <strong className="block text-xs text-red-950 font-bold">{err.productName}</strong>}
                                  <p className="text-xs text-red-800 font-medium">{err.errorReason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>All product rows in this CSV import were validated and saved with 100% clean formatting.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
