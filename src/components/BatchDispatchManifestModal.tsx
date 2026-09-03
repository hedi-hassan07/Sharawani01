import React, { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  CheckCheck, 
  Printer, 
  Layers, 
  Building, 
  User, 
  Calendar, 
  Check, 
  AlertCircle, 
  FileText, 
  Barcode, 
  Building2,
  ShieldCheck
} from 'lucide-react';
import { DocumentItem, RoomInfo } from '../types';
import { GOVERNMENT_ROOMS } from '../data/initialData';
import { playSound } from '../utils/audioFeedback';

interface BatchDispatchManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  currentRoom: RoomInfo;
  onBatchRoute: (docIds: string[], targetRoom: string, courierName: string, manifestNotes: string) => void;
  onBatchConfirmReceipt: (docIds: string[]) => void;
}

export const BatchDispatchManifestModal: React.FC<BatchDispatchManifestModalProps> = ({
  isOpen,
  onClose,
  documents,
  currentRoom,
  onBatchRoute,
  onBatchConfirmReceipt,
}) => {
  const [activeMode, setActiveMode] = useState<'dispatch' | 'receive'>('dispatch');
  const [targetRoom, setTargetRoom] = useState<string>('ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە');
  const [courierName, setCourierName] = useState<string>('کاک ئاسۆ محمد (گەیەنەری ناوخۆ)');
  const [manifestNotes, setManifestNotes] = useState<string>('گەیاندنی فۆڵدەری کاغەزی و بەڵگەنامە فەرمییەکان بە پێی مەنەفێستی ژمارەیی.');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [manifestId] = useState(() => `MNF-2026-${Math.floor(1000 + Math.random() * 9000)}`);

  // Documents available for dispatch (not completed)
  const dispatchableDocs = useMemo(() => {
    return documents.filter(doc => doc.status !== 'Completed');
  }, [documents]);

  // Documents available for batch receive (pending arrival at current room)
  const receivableDocs = useMemo(() => {
    const roomCodeNum = currentRoom?.roomCode?.replace(/\D/g, '') || '1';
    return documents.filter(doc => 
      !doc.physicalReceived && 
      (doc.currentRoom.includes(roomCodeNum) || doc.destinationRoom?.includes(roomCodeNum))
    );
  }, [documents, currentRoom]);

  const currentList = activeMode === 'dispatch' ? dispatchableDocs : receivableDocs;

  if (!isOpen) return null;

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === currentList.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(currentList.map(d => d.id));
    }
  };

  const handleExecuteDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocIds.length === 0) {
      alert('تکایە بەلایەنی کەم یەک دۆسیە هەڵبژێرە بۆ گەیاندن.');
      return;
    }

    onBatchRoute(selectedDocIds, targetRoom, courierName, manifestNotes);
    playSound('batch_complete');
    onClose();
  };

  const handleExecuteReceive = () => {
    if (selectedDocIds.length === 0) {
      alert('تکایە بەلایەنی کەم یەک دۆسیە هەڵبژێرە بۆ وەرگرتن.');
      return;
    }

    onBatchConfirmReceipt(selectedDocIds);
    playSound('batch_complete');
    onClose();
  };

  const handlePrintManifest = () => {
    playSound('print_click');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 print:p-0 print:bg-white print:static" dir="rtl">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Header - Hidden on print */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  مەنەفێستی گەیاندنی بەکۆمەڵی دۆسیەکان
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  {manifestId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                گەیاندنی فۆڵدەری کاغەزی لەڕێگەی گەیەنەر (معتمد) لەنێوان ژوورەکان
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintManifest}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>چاپکردنی مەنەفێست</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs - Hidden on print */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveMode('dispatch');
                setSelectedDocIds([]);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'dispatch'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>ناردنی کۆمەڵە دۆسیە بەرەو ژوورێکی تر ({dispatchableDocs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('receive');
                setSelectedDocIds([]);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'receive'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>پەسەندکردنی وەرگرتنی بەکۆمەڵ لە گەیەنەر ({receivableDocs.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            دۆسیەی هەڵبژێردراو: <span className="text-emerald-700 font-black">{selectedDocIds.length}</span> لە {currentList.length}
          </div>
        </div>

        {/* Dispatch Options Config Bar (Only in Dispatch Mode) - Hidden on print */}
        {activeMode === 'dispatch' && (
          <div className="p-5 bg-white border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs print:hidden">
            <div>
              <label className="font-bold text-slate-700 block mb-1">ژووری مەبەست (Destination Room):</label>
              <select
                value={targetRoom}
                onChange={(e) => setTargetRoom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {GOVERNMENT_ROOMS.map(r => (
                  <option key={r.id} value={`${r.roomCode}: ${r.nameKu}`}>
                    {r.roomCode}: {r.nameKu}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ناوی گەیەنەری فەرمی (Courier):</label>
              <input
                type="text"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="ناوی فەرمانبەری گەیاندن..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">تێبینی مەنەفێست:</label>
              <input
                type="text"
                value={manifestNotes}
                onChange={(e) => setManifestNotes(e.target.value)}
                placeholder="تێبینی..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Printable & Interactive Document List Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 print:bg-white print:p-0">
          
          {/* Printable Official Header (Shown when printing) */}
          <div className="hidden print:block mb-4 border-b-2 border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-slate-900">حکومەتی هەرێمی کوردستان - مەنەفێستی گەیاندنی دۆسیەکان</h1>
                <p className="text-xs text-slate-600 font-bold">Official Physical Batch Handover Manifest • {manifestId}</p>
              </div>
              <div className="text-left text-xs font-mono" dir="ltr">
                Date: {new Date().toLocaleDateString('en-CA')}
              </div>
            </div>
            <div className="mt-2 text-xs grid grid-cols-3 gap-2 bg-slate-100 p-2 rounded">
              <div>لە ژووری: <strong>{currentRoom?.nameKu || 'ژووری ئێستا'}</strong></div>
              <div>بەرەو ژووری: <strong>{targetRoom}</strong></div>
              <div>گەیەنەر: <strong>{courierName}</strong></div>
            </div>
          </div>

          {/* Table Header & Select All */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs print:hidden">
              <button
                type="button"
                onClick={handleSelectAll}
                className="font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedDocIds.length > 0 && selectedDocIds.length === currentList.length}
                  onChange={handleSelectAll}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>دیاریکردنی هەموو دۆسیەکان ({currentList.length})</span>
              </button>

              <span className="text-slate-500 text-[11px]">
                تکایە دۆسیەکان دیاریبکە پێش پەسەندکردنی کارەکە
              </span>
            </div>

            {/* Document Rows */}
            {currentList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-600">هیچ دۆسیەیەک لەم بەشەدا نییە</div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {currentList.map(doc => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleSelectDoc(doc.id)}
                      className={`p-3.5 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                        isChecked ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectDoc(doc.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {doc.citizenNameAr || doc.citizenName}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 font-bold" dir="ltr">
                              {doc.id}
                            </span>
                            {doc.urgency === 'VIP' && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                            <span>جۆر: {doc.documentType}</span>
                            <span>•</span>
                            <span>بارکۆد: <strong className="font-mono" dir="ltr">{doc.barcode}</strong></span>
                            <span>•</span>
                            <span>وێستگەی ئێستا: {doc.currentRoom.split(':')[0]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left flex-shrink-0">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          doc.physicalReceived
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.physicalReceived ? 'وەرگیراوی فیزیکی' : 'لە چاوەڕوانی وەرگرتن'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Printable Signature Boxes for Courier & Handover (Shown when printing) */}
          <div className="hidden print:grid grid-cols-2 gap-8 mt-6 pt-4 border-t-2 border-slate-400 text-xs">
            <div className="space-y-6">
              <div>واژۆی ئەفسەری ڕادەستکار (ژووری سەرچاوە):</div>
              <div className="border-b border-black pb-1">ناو و واژۆ: .......................................</div>
            </div>
            <div className="space-y-6">
              <div>واژۆی ئەفسەری وەرگر (ژووری مەبەست):</div>
              <div className="border-b border-black pb-1">ناو و واژۆ: .......................................</div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions - Hidden on print */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            پاشگەزبوونەوە
          </button>

          <div className="flex items-center gap-2">
            {activeMode === 'dispatch' ? (
              <button
                type="button"
                onClick={handleExecuteDispatch}
                disabled={selectedDocIds.length === 0}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                  selectedDocIds.length > 0
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>ناردنی ({selectedDocIds.length}) دۆسیە بە مەنەفێست بۆ {targetRoom.split(':')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExecuteReceive}
                disabled={selectedDocIds.length === 0}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                  selectedDocIds.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <CheckCheck className="w-4 h-4" />
                <span>پەسەندکردنی وەرگرتنی فیعلی بۆ ({selectedDocIds.length}) دۆسیە</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
