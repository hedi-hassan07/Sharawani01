import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Barcode, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Building2, 
  Building, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Printer, 
  Calendar, 
  User, 
  CornerDownLeft,
  Info,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import { DocumentItem } from '../types';
import { playSound } from '../utils/audioFeedback';

interface CitizenPublicTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onOpenPrintSlip: (doc: DocumentItem) => void;
}

export const CitizenPublicTrackingModal: React.FC<CitizenPublicTrackingModalProps> = ({
  isOpen,
  onClose,
  documents,
  onOpenPrintSlip,
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(() => {
    // Default to first document for immediate rich preview
    return documents.length > 0 ? documents[0] : null;
  });

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query) return;

    const matched = documents.find(d => 
      d.barcode.toLowerCase() === query ||
      d.id.toLowerCase() === query ||
      d.citizenId.toLowerCase() === query ||
      d.citizenName.toLowerCase().includes(query) ||
      (d.citizenNameAr && d.citizenNameAr.toLowerCase().includes(query))
    );

    if (matched) {
      setSelectedDoc(matched);
      playSound('scan_beep');
    } else {
      playSound('alert');
    }
  };

  const selectSample = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setSearchInput(doc.barcode);
    playSound('scan_beep');
  };

  // Determine current progression steps
  const steps = [
    {
      id: 1,
      title: 'وەرگرتن و پۆلێنکردن',
      room: 'ژووری ٢: وەرگرتنی سەرەتایی',
      done: true,
      current: selectedDoc?.status === 'Pending Receipt' && selectedDoc?.currentRoom.includes('٢'),
    },
    {
      id: 2,
      title: 'لێکۆڵینەوەی تەکنیکی / نەخشە',
      room: 'ژووری ٣ یان ژووری ٥',
      done: selectedDoc ? (selectedDoc.currentRoom.includes('١') || selectedDoc.currentRoom.includes('٤') || selectedDoc.status === 'Completed' || (selectedDoc.currentRoom.includes('٣') && selectedDoc.physicalReceived)) : false,
      current: selectedDoc ? (selectedDoc.currentRoom.includes('٣') || selectedDoc.currentRoom.includes('٥')) && selectedDoc.status !== 'Completed' : false,
    },
    {
      id: 3,
      title: 'پەسەندکردنی بەڕێوەبەری گشتی',
      room: 'ژووری ١: نوسینگەی بەڕێوەبەری گشتی',
      done: selectedDoc?.status === 'Completed' || (selectedDoc?.currentRoom.includes('٤') ?? false),
      current: selectedDoc?.currentRoom.includes('١') && selectedDoc.status !== 'Completed',
    },
    {
      id: 4,
      title: 'تەواوبوو و ئەرشیفکرا',
      room: 'ژووری ٤: ئەرشیفی کۆتایی',
      done: selectedDoc?.status === 'Completed',
      current: selectedDoc?.status === 'Completed',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5" dir="rtl">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900">
        
        {/* Top Header Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  پۆرتاڵی بەدواداچوونی مامەڵەی هاوڵاتیان
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  ڕاستەوخۆ (Live Tracker)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                بەدواداچوون بۆ ڕێڕەوی فۆڵدەری کاغەزی و بەڵگەنامە فەرمییەکان بەپێی بارکۆد
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Section */}
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Barcode className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="کۆدی بارکۆد بنووسە (بۆ نموونە: 2026-8941-KRG یان DOC-2026-1049)..."
                className="w-full bg-white border border-slate-300 rounded-2xl pr-11 pl-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs text-right"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>گەڕان</span>
            </button>
          </form>

          {/* Quick Click Samples */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3 text-xs text-slate-500">
            <span className="font-bold text-[11px] text-slate-400">نموونەی خێرا:</span>
            {documents.slice(0, 4).map(doc => (
              <button
                key={doc.id}
                type="button"
                onClick={() => selectSample(doc)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer border ${
                  selectedDoc?.id === doc.id
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                dir="ltr"
              >
                {doc.barcode}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Display Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {selectedDoc ? (
            <div className="space-y-6">
              
              {/* Primary Identity & Location Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black text-slate-900">
                      {selectedDoc.citizenNameAr || selectedDoc.citizenName}
                    </span>
                    {selectedDoc.urgency === 'VIP' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-black border border-red-200">
                        بەپەلەی VIP
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                        ئاسایی
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>کۆدی دۆسیە: <strong className="font-mono text-slate-700" dir="ltr">{selectedDoc.id}</strong></span>
                    <span>بارکۆد: <strong className="font-mono text-slate-700" dir="ltr">{selectedDoc.barcode}</strong></span>
                    <span>ناسنامە: <strong className="font-mono text-slate-700" dir="ltr">{selectedDoc.citizenId}</strong></span>
                    <span>جۆری مامەڵە: <strong className="text-emerald-700 font-bold">{selectedDoc.documentType}</strong></span>
                  </div>
                </div>

                {/* Location Badge + Print Action */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left">
                    <div className="text-[10px] text-slate-400 font-medium">شوێنی ئێستای فۆڵدەر:</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>{selectedDoc.currentRoom}</span>
                    </div>
                    <div className="text-[11px] mt-0.5">
                      {selectedDoc.physicalReceived ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          فۆڵدەری کاغەزی وەرگیراوە لە ژوور
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          لە ڕێگەی گەیاندنە بەرەو ژوور
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenPrintSlip(selectedDoc)}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="چاپکردنی پسولەی وەرگرتنی هاوڵاتی"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>چاپکردنی پسولە</span>
                  </button>
                </div>
              </div>

              {/* Graphical Step Progression */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="text-xs font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>قۆناغەکانی پێشکەوتنی مامەڵە (Workflow Progression)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {steps.map(step => (
                    <div 
                      key={step.id} 
                      className={`p-3.5 rounded-xl border transition-all ${
                        step.current
                          ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                          : step.done
                            ? 'bg-white border-slate-300'
                            : 'bg-slate-100/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                          step.done
                            ? 'bg-emerald-600 text-white'
                            : step.current
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-600'
                        }`}>
                          {step.done ? '✓' : step.id}
                        </span>
                        {step.current && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            قۆناغی ئێستا
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-black text-slate-900">{step.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{step.room}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Audit & Movement Trail */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>مێژووی جووڵە و تۆمارەکانی دۆسیە (Audit Log):</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                    {selectedDoc.routingHistory.length} ڕووداو تۆمارکراوە
                  </span>
                </div>

                <div className="space-y-3 relative before:absolute before:right-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pr-2">
                  {selectedDoc.routingHistory.map((history, idx) => (
                    <div key={history.id || idx} className="relative pr-7 group">
                      {/* Step Circle Indicator */}
                      <span className="absolute right-2 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white border-2 border-white"></span>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="font-bold text-slate-800">{history.remarks}</span>
                          <span className="font-mono text-[10px]" dir="ltr">{history.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2">
                          <span>لەلایەن: <strong>{history.actionBy}</strong></span>
                          <span>•</span>
                          <span>لە: {history.fromRoom.split(':')[0]}</span>
                          <span>بەرەو: {history.toRoom.split(':')[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Info className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-600">هیچ دۆسیەیەک نەدۆزرایەوە</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                تکایە لە سەرەوە بارکۆد یان کۆدی دۆسیە بنووسە یان کلیک لەسەر یەکێک لە نموونە خێراکان بکە.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>سیستەمی چاودێری و گەیاندنی بەڵگەنامە فەرمییەکان • KRG DMS</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            داخستن
          </button>
        </div>

      </div>

    </div>
  );
};
