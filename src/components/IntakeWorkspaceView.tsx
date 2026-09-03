import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  Plus, 
  Tag, 
  Edit3, 
  Check, 
  Search, 
  Send, 
  FileText, 
  Building, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Barcode, 
  ShieldCheck, 
  X,
  Clock,
  Printer
} from 'lucide-react';
import { DocumentItem, DocumentTypeOption } from '../types';

interface IntakeWorkspaceViewProps {
  documents: DocumentItem[];
  documentTypes: DocumentTypeOption[];
  onUpdateDocumentType: (docId: string, newType: string) => void;
  onAddNewDocumentType: (type: Omit<DocumentTypeOption, 'id'>) => void;
  onRouteDocument: (docId: string, targetRoom: string, notes: string) => void;
  onEditSentRouting?: (doc: DocumentItem) => void;
  onQuickRouteModal?: (doc: DocumentItem) => void;
  onOpenCreateModal: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenPrintSlip?: (doc: DocumentItem) => void;
  searchQuery: string;
}

export const IntakeWorkspaceView: React.FC<IntakeWorkspaceViewProps> = ({
  documents,
  documentTypes,
  onUpdateDocumentType,
  onAddNewDocumentType,
  onRouteDocument,
  onEditSentRouting,
  onQuickRouteModal,
  onOpenCreateModal,
  onOpenBarcodeScanner,
  onOpenPrintSlip,
  searchQuery,
}) => {
  // Track which document is currently being edited for its type
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [tempTypeSelection, setTempTypeSelection] = useState<string>('');

  // New Document Type Dialog State
  const [showNewTypeModal, setShowNewTypeModal] = useState<boolean>(false);
  const [newTypeName, setNewTypeName] = useState<string>('');
  const [newTypeCode, setNewTypeCode] = useState<string>('');
  const [newTypeCategory, setNewTypeCategory] = useState<DocumentTypeOption['category']>('Commercial');
  const [newTypeDescription, setNewTypeDescription] = useState<string>('');
  const [newTypeColor, setNewTypeColor] = useState<string>('bg-emerald-500/10 text-emerald-400 border-emerald-500/30');
  const [newTypeTargetRoom, setNewTypeTargetRoom] = useState<string>('ژووری ٣: نەخشەی بنەڕەتی');

  // Filter documents for Room 2 / Intake
  const intakeDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return documents.filter(doc => {
      if (!q) return true;
      return (
        doc.id.toLowerCase().includes(q) ||
        doc.citizenName.toLowerCase().includes(q) ||
        (doc.citizenNameAr && doc.citizenNameAr.toLowerCase().includes(q)) ||
        doc.documentType.toLowerCase().includes(q) ||
        doc.barcode.toLowerCase().includes(q)
      );
    });
  }, [documents, searchQuery]);

  const handleStartEditType = (doc: DocumentItem) => {
    setEditingDocId(doc.id);
    setTempTypeSelection(doc.documentType);
  };

  const handleSaveType = (docId: string) => {
    if (!tempTypeSelection) return;
    onUpdateDocumentType(docId, tempTypeSelection);
    setEditingDocId(null);
  };

  const handleCreateNewTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    const generatedCode = newTypeCode.trim() || `DOC-${newTypeName.trim().substring(0, 3).toUpperCase()}`;

    onAddNewDocumentType({
      name: newTypeName.trim(),
      nameKu: newTypeName.trim(),
      code: generatedCode,
      category: newTypeCategory,
      badgeColor: newTypeColor,
      description: newTypeDescription.trim() || 'جۆری پۆلێنکردنی دۆسیەی نوێ',
      defaultTargetRoom: newTypeTargetRoom,
      requiresPhysicalSeal: true,
      isCustom: true,
    });

    // Reset and close
    setNewTypeName('');
    setNewTypeCode('');
    setNewTypeDescription('');
    setShowNewTypeModal(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Header Banner & Title Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs flex-shrink-0">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <Tag className="w-3 h-3" />
                <span>ژووری ٢: مێزی وەرگرتنی ناوەندی و پۆلێنکردن</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                شوێنی کارکردنی پۆلێنکردن و وەرگرتنی سەرەتایی دۆسیەکان
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                وەرگرتنی داواکاری هاوڵاتیان، دەستنیشانکردن یان دەستکاریکردنی جۆری مامەڵە (تۆمار، سڕینەوە، زیادکردن، هتد)، و دابەشکردنی فۆڵدەرە فیزیکییەکان.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowNewTypeModal(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>+ زیادکردنی جۆری مامەڵەی نوێ</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-850 active:bg-black text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-slate-300"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>+ وەرگرتنی دۆسیەی کاغەزی نوێ</span>
            </button>
          </div>
        </div>

        {/* Quick Type Catalogue Ribbon */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              کەتەلۆگی جۆرە چالاکەکانی پۆلێنکردن ({documentTypes.length} جۆر بەردەستە)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              کارمەندان دەتوانن لە کاتی هەڵەدا جۆری مامەڵەکە بگۆڕن
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
            {documentTypes.map((type) => (
              <div
                key={type.id}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold whitespace-nowrap flex items-center gap-2 text-slate-700 shadow-2xs"
                title={type.description}
              >
                <span className="text-slate-900">{type.nameKu || type.name}</span>
                <span className="text-[10px] text-slate-500 font-mono" dir="ltr">({type.code})</span>
                {type.isCustom && (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black">
                    دەستکاری
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Intake Queue Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              تۆماری دۆسیە وەرگیراوەکانی ژووری ٢٥
            </span>
            <span className="text-xs text-slate-500 mr-2 font-medium">
              ({intakeDocs.length} مامەڵە لە تۆماری وەرگرتندا هەیە)
            </span>
          </div>
          <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>سیستەمی گۆڕینی پۆلێنکردن چالاکە</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 bg-white shadow-2xs text-xs uppercase text-slate-400 font-bold border-b border-slate-100">
                <th className="py-3 px-4">کۆدی دۆسیە و بارکۆد</th>
                <th className="py-3 px-4">هاوڵاتی / لایەنی داواکار</th>
                <th className="py-3 px-4">بەرواری وەرگرتن</th>
                <th className="py-3 px-4">پۆلێنکردنی ئێستا (جۆری مامەڵە)</th>
                <th className="py-3 px-4">ژووری ئاڕاستەکراو</th>
                <th className="py-3 px-4 text-left">کردارەکان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {intakeDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    هیچ دۆسیەیەک نەدۆزرایەوە بەپێی فلتەرەکەت.
                  </td>
                </tr>
              ) : (
                intakeDocs.map((doc) => {
                  const isEditingThis = editingDocId === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* ID & Barcode */}
                      <td className="py-3.5 px-4 font-mono" dir="ltr">
                        <div className="font-black text-slate-900 text-xs">{doc.id}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.barcode}</span>
                        </div>
                      </td>

                      {/* Citizen */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {doc.citizenNameAr || doc.citizenName}
                        </div>
                        {doc.citizenName && doc.citizenName !== doc.citizenNameAr && (
                          <div className="text-xs text-slate-500 mt-0.5" dir="ltr">
                            {doc.citizenName}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">
                          CID: {doc.citizenId}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap" dir="ltr">
                        <div className="font-bold text-slate-800">{doc.dateReceived.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-400">{doc.dateReceived.split(' ').slice(1).join(' ')}</div>
                      </td>

                      {/* DOCUMENT TYPE & EDITABLE CAPABILITY */}
                      <td className="py-3.5 px-4">
                        {isEditingThis ? (
                          /* Editable Dropdown Mode */
                          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-emerald-400">
                            <select
                              value={tempTypeSelection}
                              onChange={(e) => setTempTypeSelection(e.target.value)}
                              className="bg-white border border-slate-300 text-slate-900 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold"
                            >
                              {documentTypes.map((t) => (
                                <option key={t.id} value={t.nameKu || t.name}>
                                  {t.nameKu || t.name} ({t.category})
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleSaveType(doc.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                              title="پاشەکەوتکردنی پۆلێنکردنی نوێ"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>تۆمار</span>
                            </button>

                            <button
                              onClick={() => setEditingDocId(null)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-800 rounded-lg text-xs cursor-pointer"
                              title="پاشگەزبوونەوە"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          /* Classified Badge with EDIT TYPE button */
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{doc.documentType}</span>
                            </span>

                            <button
                              onClick={() => handleStartEditType(doc)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="گۆڕینی جۆری مامەڵە"
                            >
                              <Edit3 className="w-3 h-3 text-emerald-600" />
                              <span>گۆڕینی جۆر</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Target Room */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.destinationRoom || 'ژووری ٣: نەخشەی بنەڕەتی'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          دۆخ: <span className="text-slate-700 font-bold">{doc.status}</span>
                        </div>
                      </td>

                      {/* Row Action Controls */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Print Receipt / Docket Cover Button */}
                          {onOpenPrintSlip && (
                            <button
                              type="button"
                              onClick={() => onOpenPrintSlip(doc)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              title="چاپکردنی پسولەی فەرمی هاوڵاتی یان بەرگی فۆڵدەر"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-700" />
                              <span>پسولە</span>
                            </button>
                          )}

                          {/* Editable button to correct routing or re-send to another room */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onEditSentRouting) {
                                onEditSentRouting(doc);
                              } else {
                                const target = doc.destinationRoom || 'ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە';
                                onRouteDocument(doc.id, target, `بەڕێکرا لە مێزی وەرگرتنی ژووری ٢`);
                              }
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            title="دەستکاریکردنی ناردن: ئەگەر هەڵەت کردووە لێرە دەستکاری بکە و بینێرەوە بۆ ژوورێکی تر"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>دەستکاریکردنی ناردن</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onQuickRouteModal) {
                                onQuickRouteModal(doc);
                              } else {
                                const target = doc.destinationRoom || 'ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە';
                                onRouteDocument(doc.id, target, `بەڕێکرا لە مێزی وەرگرتنی ژووری ٢ لەژێر پۆلێنی [${doc.documentType}].`);
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            title="پشکنینی سکانەر و ئاڕاستەکردن بۆ ژووری تر"
                          >
                            <Send className="w-3 h-3 rotate-180" />
                            <span>ناردن</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE NEW DOCUMENT TYPE DIALOG */}
      {showNewTypeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg text-slate-900">
                  زیادکردنی جۆری نوێی پۆلێنکردنی دۆسیە
                </h3>
              </div>
              <button
                onClick={() => setShowNewTypeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTypeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  ناوی جۆری مامەڵە *
                </label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="نموونە: مۆڵەتی هەناردەکردن، زیادکردنی سەرمایە، داخستنی کۆمپانیا..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    هاوپۆل (Category)
                  </label>
                  <select
                    value={newTypeCategory}
                    onChange={(e) => setNewTypeCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-1 focus:ring-emerald-500 font-bold"
                  >
                    <option value="Commercial">بازرگانی (Commercial)</option>
                    <option value="Judicial">دادوەری و یاسایی (Judicial)</option>
                    <option value="Real Estate">خاوەندارێتی و زەوی (Real Estate)</option>
                    <option value="Administrative">کارگێڕی (Administrative)</option>
                    <option value="Tax & Revenue">باج و داهات (Tax & Revenue)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    کۆدی کورتکراوە (Short Code)
                  </label>
                  <input
                    type="text"
                    value={newTypeCode}
                    onChange={(e) => setNewTypeCode(e.target.value)}
                    placeholder="e.g. DOC-EXP"
                    dir="ltr"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 uppercase font-mono text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  ژووری مەبەستی سەرەتایی
                </label>
                <select
                  value={newTypeTargetRoom}
                  onChange={(e) => setNewTypeTargetRoom(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)">ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)</option>
                  <option value="ژووری ٢: مێزی وەرگرتن و پۆلێنکردن">ژووری ٢: مێزی وەرگرتن و پۆلێنکردن</option>
                  <option value="ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە">ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە</option>
                  <option value="ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان">ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان</option>
                  <option value="ژووری ٥: وردبینی دارایی و باج">ژووری ٥: وردبینی دارایی و باج</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  شیکردنەوە و بڕگەی یاسایی
                </label>
                <textarea
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  placeholder="پوختەی مەبەست و پێداویستییە یاساییەکان بنووسە..."
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTypeModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-850 active:bg-black text-white rounded-xl font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تۆمارکردن و بڵاوکردنەوە</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
