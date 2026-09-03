import React, { useState, useMemo } from 'react';
import { 
  Archive, 
  Search, 
  Filter, 
  Building2, 
  ShieldCheck, 
  FileText, 
  FolderLock, 
  Calendar, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  ChevronRight, 
  Building, 
  Hash, 
  DollarSign, 
  Phone, 
  Mail,
  FolderOpen,
  Stamp
} from 'lucide-react';
import { CompanyRecord, CompanyDossierFile, DocumentItem } from '../types';

interface CompanyVaultViewProps {
  companies: CompanyRecord[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  documents?: DocumentItem[];
  onSelectDocument?: (doc: DocumentItem) => void;
  onAssignDocumentToCompany?: (docId: string, companyId: string) => void;
}

type CategoryFilter = 'All Dossiers' | 'Commercial Licenses' | 'Tax Clearances' | 'Board Resolutions' | 'Ownership Contracts';
type QuickPill = 'All Companies' | 'Active Files' | 'Archived' | 'Tax Cleared';

export const CompanyVaultView: React.FC<CompanyVaultViewProps> = ({
  companies,
  searchQuery,
  onSearchChange,
  documents = [],
  onSelectDocument,
  onAssignDocumentToCompany,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || 'comp-1');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All Dossiers');
  const [activePill, setActivePill] = useState<QuickPill>('All Companies');
  const [dateFilter, setDateFilter] = useState<'all' | '2026' | '2025' | 'older'>('all');
  const [previewDossier, setPreviewDossier] = useState<CompanyDossierFile | null>(null);
  
  // State for company assignment of incoming archive documents
  const [assignmentSelections, setAssignmentSelections] = useState<Record<string, string>>({});
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');

  // Selected company object
  const selectedCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  // Filtered companies list for directory
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return companies.filter(c => {
      if (activePill === 'Active Files' && c.pendingActions === 0) return false;
      if (activePill === 'Archived' && c.status !== 'Verified') return false;
      if (activePill === 'Tax Cleared' && !c.dossiers.some(d => d.category === 'Tax Clearances' && d.status === 'Valid')) return false;

      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.legalNameAr && c.legalNameAr.toLowerCase().includes(q)) ||
        c.registrationNo.toLowerCase().includes(q) ||
        c.taxId.toLowerCase().includes(q) ||
        c.representative.toLowerCase().includes(q)
      );
    });
  }, [companies, searchQuery, activePill]);

  // Filtered dossiers for selected company
  const filteredDossiers = useMemo(() => {
    if (!selectedCompany) return [];
    return selectedCompany.dossiers.filter(d => {
      if (activeCategory !== 'All Dossiers' && d.category !== activeCategory) {
        return false;
      }
      if (dateFilter === '2026' && !d.uploadedDate.startsWith('2026')) return false;
      if (dateFilter === '2025' && !d.uploadedDate.startsWith('2025')) return false;
      if (dateFilter === 'older' && (d.uploadedDate.startsWith('2026') || d.uploadedDate.startsWith('2025'))) return false;
      return true;
    });
  }, [selectedCompany, activeCategory, dateFilter]);

  // Incoming documents to Room 4 (Archive Vault)
  const incomingArchiveDocs = useMemo(() => {
    return (documents || []).filter(d => 
      d.currentRoom.includes('ژووری ٤') || 
      d.destinationRoom?.includes('ژووری ٤') || 
      d.destinationRoom === 'room4' ||
      d.status === 'Completed' ||
      d.status === 'Archived'
    );
  }, [documents]);

  const filteredArchiveDocs = useMemo(() => {
    return incomingArchiveDocs.filter(d => {
      const isAssigned = !!d.companyId;
      if (assignmentFilter === 'unassigned' && isAssigned) return false;
      if (assignmentFilter === 'assigned' && !isAssigned) return false;
      return true;
    });
  }, [incomingArchiveDocs, assignmentFilter]);

  const unassignedCount = incomingArchiveDocs.filter(d => !d.companyId).length;
  const assignedCount = incomingArchiveDocs.filter(d => !!d.companyId).length;

  const pillLabels: Record<QuickPill, string> = {
    'All Companies': 'سەرجەم کۆمپانیاکان',
    'Active Files': 'دۆسیە لەژێر کاردا',
    'Archived': 'تەواوکراوی ئەرشیفکراو',
    'Tax Cleared': 'باجی پاکتاوکراو',
  };

  const categoryLabels: Record<CategoryFilter, string> = {
    'All Dossiers': 'هەموو بەڵگەنامەکان',
    'Commercial Licenses': 'مۆڵەتی بازرگانی',
    'Tax Clearances': 'پاکتاوی باج و دارایی',
    'Board Resolutions': 'بڕیاری دەستەی کارگێڕی',
    'Ownership Contracts': 'گرێبەستی خاوەندارێتی و پشک',
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Header & Search Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 text-right">
        
        {/* Title Badge & Top description */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs flex-shrink-0">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <FolderLock className="w-3.5 h-3.5" />
                <span>ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان و قەوارە بازرگانییەکان</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                تۆماری یەکگرتووی بەڵگەنامە و دۆسیەی کۆمپانیاکان
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
              ٥ کۆمپانیای تۆمارکراو
            </span>
          </div>
        </div>

        {/* Global Organization Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="گەڕان بەپێی ناوی کۆمپانیا، ژمارەی تۆمار، ناسنامەی باج، یان وشەی سەرەکی..."
            className="w-full bg-white border border-slate-300 rounded-xl pr-12 pl-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
            >
              سڕینەوەی گەڕان
            </button>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-bold ml-1">فلتەری خێرا:</span>
            {(['All Companies', 'Active Files', 'Archived', 'Tax Cleared'] as QuickPill[]).map((pill) => (
              <button
                key={pill}
                onClick={() => setActivePill(pill)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePill === pill
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pillLabels[pill]}
              </button>
            ))}
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>بەرواری بارکردن:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 font-bold"
            >
              <option value="all">سەرجەم بەروارەکان</option>
              <option value="2026">تۆمارکراوەکانی ٢٠٢٦</option>
              <option value="2025">تۆمارکراوەکانی ٢٠٢٥</option>
              <option value="older">ئەرشیفی کۆنتر</option>
            </select>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 5: Room 4 Archive Incoming Documents & Company Assignment Section */}
      <section className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden text-right" dir="rtl">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300 flex items-center justify-center flex-shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  بەڵگەنامە گەیشتووەکانی ئەرشیف بۆ پۆلێنکردن و لکاندن بە کۆمپانیا
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  ژووری ٤: خەزێنەی ئەرشیف
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ئەفسەری بەرپرسی ژووری ٤ دەتوانێت لێرە پەڕگەکان ببینێت و دیاری بکات کە بەڵگەنامەکە سەر بە کام کۆمپانیایە
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setAssignmentFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                assignmentFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              سەرجەم بەڵگەنامەکان ({incomingArchiveDocs.length})
            </button>
            <button
              type="button"
              onClick={() => setAssignmentFilter('unassigned')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                assignmentFilter === 'unassigned'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>چاوەڕوانی لکاندن</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/40 text-[10px]">
                {unassignedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAssignmentFilter('assigned')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                assignmentFilter === 'assigned'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>بەستراوەتەوە</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/40 text-[10px]">
                {assignedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Incoming Archive Table / Cards */}
        <div className="p-4 sm:p-5">
          {filteredArchiveDocs.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Archive className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">
                هیچ بەڵگەنامەیەک لەم بەشەدا نییە بەپێی فلتەری دیاریکراو
              </p>
              <p className="text-xs text-slate-400 mt-1">
                کاتێک بەڵگەنامەیەک لە ژوورەکانی ترەوە دەنێردرێتە ژووری ٤، راستەوخۆ لێرە دەردەکەوێت
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="py-2.5 px-3">کۆد و بارکۆد</th>
                    <th className="py-2.5 px-3">خاوەن مامەڵە / هاوڵاتی</th>
                    <th className="py-2.5 px-3">جۆری بەڵگەنامە</th>
                    <th className="py-2.5 px-3">پەڕگەی هاوپێچکراو</th>
                    <th className="py-2.5 px-3">دیاریکردنی کۆمپانیا (ژووری ٤)</th>
                    <th className="py-2.5 px-3 text-left">کردارەکان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArchiveDocs.map((doc) => {
                    const assignedCompany = companies.find(c => c.id === doc.companyId);
                    const selectedComp = assignmentSelections[doc.id] || doc.companyId || '';
                    const hasAttachment = !!doc.pdfAttachment;

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Doc ID & Barcode */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900">{doc.id}</div>
                          <div className="font-mono text-[10px] text-slate-500">{doc.barcode}</div>
                        </td>

                        {/* Citizen Name */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{doc.citizenNameAr || doc.citizenName}</div>
                          <div className="text-[10px] text-slate-400">ژمارەی ناسنامە: {doc.nationalId}</div>
                        </td>

                        {/* Document Type */}
                        <td className="py-3 px-3">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                            {doc.documentType}
                          </span>
                        </td>

                        {/* Attached File Preview Trigger */}
                        <td className="py-3 px-3">
                          {hasAttachment ? (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-[11px] max-w-[140px] truncate" title={doc.pdfAttachment?.fileName}>
                                  {doc.pdfAttachment?.fileName || 'بەڵگەنامەی فەرمی'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {doc.pdfAttachment?.fileSize || '2.4 MB'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => onSelectDocument && onSelectDocument(doc)}
                                className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1 font-bold text-[11px]"
                                title="بینینی پەڕگە بە تەواوی و وردەکارییەکان"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>بینینی پەڕگە</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-400">
                              <FileText className="w-3.5 h-3.5" />
                              <span className="text-[11px]">پەڕگەی سەرەکی</span>
                              <button
                                type="button"
                                onClick={() => onSelectDocument && onSelectDocument(doc)}
                                className="mr-1 text-purple-600 hover:underline font-bold text-[10px]"
                              >
                                بینین
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Company Selection Dropdown */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <select
                              value={selectedComp}
                              onChange={(e) => {
                                const newCompId = e.target.value;
                                setAssignmentSelections(prev => ({
                                  ...prev,
                                  [doc.id]: newCompId,
                                }));
                              }}
                              className="w-full max-w-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">-- هەڵبژاردنی کۆمپانیا بۆ ئەم بەڵگەنامەیە --</option>
                              {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.registrationNo}) - {c.legalNameAr || ''}
                                </option>
                              ))}
                            </select>

                            {assignedCompany && (
                              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                <span>بەستراوەتەوە بە: {assignedCompany.name}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={!selectedComp}
                              onClick={() => {
                                if (onAssignDocumentToCompany && selectedComp) {
                                  onAssignDocumentToCompany(doc.id, selectedComp);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                selectedComp
                                  ? 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              }`}
                              title="لکاندن و پاراستنی ئەم بەڵگەنامەیە لە فۆڵدەری کۆمپانیادا"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{doc.companyId ? 'نوێکردنەوەی کۆمپانیا' : 'لکاندن بە کۆمپانیا'}</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Main Vault Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Registered Organizations Directory (Cols 1 to 4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              لیستی کۆمپانیا تۆمارکراوەکان ({filteredCompanies.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pl-1">
            {filteredCompanies.map((comp) => {
              const isSelected = comp.id === selectedCompanyId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompanyId(comp.id)}
                  className={`w-full text-right p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900 truncate">
                      {comp.legalNameAr || comp.name}
                    </div>
                    {comp.name && comp.name !== comp.legalNameAr && (
                      <div className="text-xs text-slate-500 truncate" dir="ltr">
                        {comp.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-1" dir="ltr">
                      <span className="text-emerald-700 font-bold">{comp.registrationNo}</span>
                      <span>•</span>
                      <span>{comp.taxId}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      comp.status === 'Verified' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {comp.status === 'Verified' ? 'پەسەندکراو' : 'لە پشکنیندا'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold mt-1">
                      {comp.dossiers.length} بەڵگەنامە
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Result Card & Unified File Folder (Cols 5 to 12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {selectedCompany && (
            <>
              {/* Active Result Card (Company Profile Summary) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-right">
                
                {/* Header Profile Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900">
                        {selectedCompany.legalNameAr || selectedCompany.name}
                      </h2>
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {selectedCompany.status === 'Verified' ? 'پەسەندکراوی فەرمی' : 'لەژێر پێداچوونەوە'}
                      </span>
                    </div>
                    {selectedCompany.name && (
                      <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
                        {selectedCompany.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono" dir="ltr">
                    <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold">
                      Reg: <strong className="text-emerald-700">{selectedCompany.registrationNo}</strong>
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold">
                      Tax: <strong className="text-slate-800">{selectedCompany.taxId}</strong>
                    </span>
                  </div>
                </div>

                {/* Quick Stat Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block">کۆی گشتی بەڵگەنامەکان</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5 block font-mono">
                      {selectedCompany.totalDocuments}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">هاوکاتکراو لەگەڵ ئەرشیفی گشتی</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block">مامەڵەی لەژێر کار</span>
                    <span className="text-xl font-black text-amber-600 mt-0.5 block font-mono">
                      {selectedCompany.pendingActions}
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold">لە قۆناغی وردبینی</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block">دوایین چالاکی</span>
                    <span className="text-sm font-bold text-slate-800 mt-1 block truncate font-mono">
                      {selectedCompany.lastActivity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">تۆماری ناوەندی حکومی</span>
                  </div>
                </div>

                {/* Additional Company Registry Information */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">سەرمایەی تۆمارکراو</span>
                    <span className="font-bold text-slate-900">{selectedCompany.capital}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">بەرواری دامەزراندن</span>
                    <span className="font-bold text-slate-900 font-mono">{selectedCompany.establishedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">نوێنەری یاسایی</span>
                    <span className="font-bold text-slate-900 truncate block">{selectedCompany.representative}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">بەڕێوەبەرایەتی سەرپەرشتیار</span>
                    <span className="font-bold text-emerald-700 truncate block">{selectedCompany.directorate.split('&')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Unified File Folder & Documents Vault */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-right">
                
                {/* Category Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-emerald-600" />
                    <span className="font-black text-sm text-slate-900">
                      دۆسیە و بەڵگەنامە ئەرشیفکراوەکانی کۆمپانیا
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['All Dossiers', 'Commercial Licenses', 'Tax Clearances', 'Board Resolutions', 'Ownership Contracts'] as CategoryFilter[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-slate-950 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {categoryLabels[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dossier Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="sticky top-0 bg-white shadow-2xs text-xs uppercase text-slate-400 font-bold border-b border-slate-100">
                        <th className="py-3 px-3">ناوی بەڵگەنامە</th>
                        <th className="py-3 px-3">پۆلێن</th>
                        <th className="py-3 px-3">بەرواری تۆمارکردن</th>
                        <th className="py-3 px-3">مۆری فەرمی</th>
                        <th className="py-3 px-3">دۆخ</th>
                        <th className="py-3 px-3 text-left">کردارەکان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredDossiers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                            هیچ بەڵگەنامەیەک لەم بەشەدا نییە بۆ ئەم کۆمپانیایە.
                          </td>
                        </tr>
                      ) : (
                        filteredDossiers.map((dossier) => (
                          <tr key={dossier.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span>{dossier.title}</span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5 pr-6" dir="ltr">
                                {dossier.fileRef} • {dossier.fileSize}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              <span className="px-2.5 py-0.5 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700">
                                {dossier.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap" dir="ltr">
                              {dossier.uploadedDate}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-700" dir="ltr">
                              <div className="flex items-center gap-1">
                                <Stamp className="w-3.5 h-3.5 text-red-500" />
                                <span>{dossier.officialSealNumber}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                dossier.status === 'Valid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {dossier.status === 'Valid' ? 'باوەڕپێکراو' : 'بەسەرچوو'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-left">
                              <button
                                onClick={() => setPreviewDossier(dossier)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>پیشاندان</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </>
          )}

        </div>
      </div>

      {/* Slide-over / Modal Dossier Preview Panel */}
      {previewDossier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg text-slate-900">
                  پشتڕاستکردنەوەی بەڵگەنامەی فەرمی ئەرشیف
                </h3>
              </div>
              <button
                onClick={() => setPreviewDossier(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-sm text-slate-900">{previewDossier.title}</div>
                <div className="text-slate-600 italic font-medium leading-relaxed">«{previewDossier.summary}»</div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-bold block">ژمارەی دۆسیە:</span>
                    <span className="font-mono text-slate-900 font-bold" dir="ltr">{previewDossier.fileRef}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">کۆدی مۆری فەرمی:</span>
                    <span className="font-mono text-red-600 font-bold" dir="ltr">{previewDossier.officialSealNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">واژۆکاری ڕێگەپێدراو:</span>
                    <span className="text-slate-900 font-bold">{previewDossier.authorizedSignatory}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">پۆلی بەڵگەنامە:</span>
                    <span className="text-emerald-700 font-bold">{previewDossier.category}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewDossier(null)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                داخستن
              </button>
              <button
                onClick={() => {
                  alert(`داگرتنی بڕوانامەی باوەڕپێکراوی: ${previewDossier.fileRef}`);
                  setPreviewDossier(null);
                }}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-850 active:bg-black text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>داگرتنی فایلی واژۆکراو (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
