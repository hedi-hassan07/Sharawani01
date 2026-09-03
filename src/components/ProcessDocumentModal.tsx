import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Send, 
  CheckCircle2, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  ShieldAlert, 
  Building2, 
  Barcode, 
  Clock, 
  User, 
  Check, 
  Stamp, 
  CornerDownRight, 
  AlertCircle, 
  History, 
  MessageSquarePlus, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { DocumentItem } from '../types';
import { GOVERNMENT_ROOMS } from '../data/initialData';

interface ProcessDocumentModalProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onRouteDocument: (docId: string, targetRoom: string, notes: string) => void;
  onCompleteDocument: (docId: string, archivalNotes: string) => void;
  onAddNote: (docId: string, noteText: string) => void;
  onConfirmPhysicalReceipt: (docId: string) => void;
  onOpenPrintSlip?: (doc: DocumentItem) => void;
}

export const ProcessDocumentModal: React.FC<ProcessDocumentModalProps> = ({
  document,
  isOpen,
  onClose,
  onRouteDocument,
  onCompleteDocument,
  onAddNote,
  onConfirmPhysicalReceipt,
  onOpenPrintSlip,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>(
    document?.destinationRoom || 'ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)'
  );
  const [routeRemarks, setRouteRemarks] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activePdfPage, setActivePdfPage] = useState<number>(1);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pdf' | 'history' | 'audit'>('pdf');

  if (!isOpen || !document) return null;

  const pdf = document.pdfAttachment;
  const isVip = document.urgency === 'VIP';
  const isCompleted = document.status === 'Completed';

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(document.id, newNote.trim());
    setNewNote('');
  };

  const handleRouteSubmit = () => {
    if (!selectedRoom) {
      alert('تکایە ژووری مەبەست هەڵبژێرە.');
      return;
    }
    onRouteDocument(document.id, selectedRoom, routeRemarks);
    onClose();
  };

  const handleCompleteSubmit = () => {
    onCompleteDocument(document.id, 'بە فەرمی واژۆ کرا، مۆرکرا، و ڕادەستی خەزێنەی ئەرشیفی گشتی کرا.');
    setShowCompleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150" dir="rtl">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-right">
        
        {/* Modal Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white">
                  شوێنی وردبینی و بڕیاردان لەسەر دۆسیە
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-600/40 font-bold">
                  {document.id}
                </span>
                {isVip && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-black bg-red-950 text-red-300 border border-red-500/50 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    بەپەلەی VIP
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span>هاوڵاتی: <strong className="text-slate-100 font-bold">{document.citizenNameAr || document.citizenName}</strong></span>
                <span className="text-slate-700">•</span>
                <span>جۆری مامەڵە: <span className="text-emerald-300 font-medium">{document.documentType}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPrintSlip && (
              <button
                type="button"
                onClick={() => onOpenPrintSlip(document)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="چاپکردنی پسولەی هاوڵاتی یان بەرگی فۆڵدەر"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>چاپکردنی پسولە / بەرگی فۆڵدەر</span>
              </button>
            )}

            {!document.physicalReceived && !isCompleted && (
              <button
                onClick={() => onConfirmPhysicalReceipt(document.id)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>پشتڕاستکردنەوەی وەرگرتنی فیزیکی</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="داخستنی پەنجەرە"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Split (Left: Scanned PDF Preview / Right: Metadata & Action Controls) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Attached Scanned PDF Preview Box (Cols 1 to 7) */}
          <div className="lg:col-span-7 bg-slate-900 border-l border-slate-200 flex flex-col overflow-hidden min-h-[420px] lg:min-h-0 order-2 lg:order-1" dir="ltr">
            
            {/* PDF Toolbar */}
            <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300 flex-shrink-0">
              <div className="flex items-center gap-2 font-mono">
                <FileText className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                  {pdf.fileName}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-emerald-400 rounded font-sans font-bold">
                  واژۆکراوی فەرمی
                </span>
              </div>

              {/* Zoom & Page Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900 rounded-md border border-slate-700 px-1 py-0.5">
                  <button 
                    onClick={() => setActivePdfPage(Math.max(1, activePdfPage - 1))}
                    disabled={activePdfPage === 1}
                    className="px-1.5 py-0.5 hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    ‹
                  </button>
                  <span className="text-[11px] px-1 text-slate-300 font-mono">
                    {activePdfPage} / {pdf.pagesCount}
                  </span>
                  <button 
                    onClick={() => setActivePdfPage(Math.min(pdf.pagesCount, activePdfPage + 1))}
                    disabled={activePdfPage === pdf.pagesCount}
                    className="px-1.5 py-0.5 hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    ›
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(Math.min(130, zoomLevel + 15))}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => alert(`داگرتنی دۆسیەی ئەسڵی: ${pdf.fileName}`)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scanned Document Viewport */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center items-start">
              <div 
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-[540px] bg-slate-50 text-slate-900 rounded-sm shadow-2xl p-6 sm:p-8 border border-slate-300 transition-transform duration-150 relative select-none font-serif text-[12px] leading-relaxed"
                dir="rtl"
              >
                {/* Official Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <span className="font-bold text-6xl uppercase tracking-widest text-slate-900 rotate-[-30deg]">
                    حکومەتی هەرێمی کوردستان
                  </span>
                </div>

                {/* Document Letterhead */}
                <div className="text-center pb-4 border-b-2 border-slate-900 mb-4">
                  <div className="text-[11px] font-sans font-bold tracking-wider text-slate-800">
                    حکومەتی هەرێمی کوردستان • عێراق
                  </div>
                  <div className="text-xs sm:text-sm font-sans font-black tracking-wider text-slate-900 mt-0.5">
                    وەزارەتی بازرگانی و پیشەسازی - بەڕێوەبەرایەتی چاودێری
                  </div>
                  <div className="text-[10px] font-sans text-slate-600 mt-0.5">
                    {pdf.issuingAuthority}
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-700 mt-3 pt-2 border-t border-slate-300" dir="ltr">
                    <span>ژمارەی تۆمار: <strong>{pdf.referenceNumber}</strong></span>
                    <span>بەروار: <strong>{pdf.issueDate}</strong></span>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center my-3">
                  <div className="inline-block px-3 py-1 bg-slate-200/80 rounded-md font-sans font-bold text-xs tracking-wide text-slate-900 border border-slate-400/40">
                    {pdf.title}
                  </div>
                </div>

                {/* Document Summary & Articles */}
                <div className="space-y-3 font-sans text-[11px] text-slate-800 text-justify leading-relaxed">
                  <p className="font-serif text-slate-900 bg-slate-100 p-2.5 rounded-md border border-slate-200">
                    «{pdf.summaryText}»
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    {pdf.articles.map((art, idx) => (
                      <div key={idx} className="p-2 bg-slate-100/70 rounded-md border border-slate-200/70 text-[10.5px]">
                        {art}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-[10px] text-slate-600 font-mono" dir="ltr">
                    تۆماری هاوڵاتی: {document.citizenNameAr || document.citizenName} (ناسنامە: {document.citizenId})
                  </div>
                </div>

                {/* Signatory Seal, Stamp & Signature Box */}
                <div className="mt-8 pt-4 border-t-2 border-slate-400 flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    {/* Simulated Official Rubber Seal */}
                    <div className="w-20 h-20 rounded-full border-2 border-red-700/80 flex flex-col items-center justify-center p-1 text-red-700 text-center transform rotate-[-8deg] shadow-sm">
                      <Stamp className="w-4 h-4 mb-0.5 opacity-80" />
                      <div className="text-[8px] font-bold leading-none">مۆری فەرمی حکومی</div>
                      <div className="text-[7px] font-mono mt-0.5">{pdf.sealNumber.split('-')[2]}</div>
                      <div className="text-[6px] font-bold text-red-800 mt-0.5">پەسەندکرا</div>
                    </div>
                  </div>

                  <div className="text-left font-sans" dir="rtl">
                    <div className="text-[10px] text-slate-500 font-bold">فەرمانبەری ڕێگەپێدراو</div>
                    <div className="font-black text-xs text-slate-900 mt-1">{pdf.signatoryName}</div>
                    <div className="text-[10px] text-slate-700">{pdf.signatoryTitle}</div>
                    <div className="font-mono text-[8px] text-slate-400 mt-1" dir="ltr">کۆدی مۆر: {pdf.sealNumber}</div>
                  </div>
                </div>

                {/* Digital Verification Hash Footer */}
                <div className="mt-4 pt-2 border-t border-slate-300 text-[8px] font-mono text-slate-400 truncate" dir="ltr">
                  {pdf.securityHash}
                </div>
              </div>
            </div>
          </div>

          {/* Active File Details, Notes, and Primary Action Buttons (Cols 8 to 12) */}
          <div className="lg:col-span-5 bg-slate-50 flex flex-col overflow-y-auto p-4 sm:p-5 space-y-4 order-1 lg:order-2">
            
            {/* Active File Details Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-black text-slate-900">زانیاری تۆمارکراوی دۆسیە</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  document.physicalReceived 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {document.physicalReceived ? 'فۆڵدەری کاغەزی گەیشتووە' : 'چاوەڕوانی فۆڵدەری کاغەزی'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">ناوی هاوڵاتی / قەوارە</span>
                  <span className="font-bold text-slate-900">{document.citizenNameAr || document.citizenName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">ژمارەی ناسنامە (CID)</span>
                  <span className="font-mono text-slate-700 font-bold">{document.citizenId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">ژووری نێرەر</span>
                  <span className="text-slate-700 font-medium">{document.fromRoom}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">ژووری ئێستا</span>
                  <span className="text-emerald-700 font-bold">{document.currentRoom}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">کاتی وەرگرتن</span>
                  <span className="text-slate-700 font-mono text-[11px]">{document.dateReceived}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">بارکۆدی فیزیکی</span>
                  <span className="font-mono text-slate-800 text-[11px] font-bold">{document.barcode}</span>
                </div>
              </div>
            </div>

            {/* Internal Notes Text Area & History */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 flex-1 flex flex-col shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquarePlus className="w-4 h-4 text-emerald-600" />
                  تێبینی و لێدوانی کارمەندانی ژوورەکان ({document.internalNotes.length})
                </span>
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-40 overflow-y-auto pl-1">
                {document.internalNotes.length === 0 ? (
                  <div className="text-xs text-slate-400 py-3 text-center">هیچ تێبینییەکی ناوخۆیی نەنووسراوە.</div>
                ) : (
                  document.internalNotes.map((note) => (
                    <div key={note.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span className="font-bold text-emerald-800">{note.author}</span>
                        <span className="font-mono">{note.timestamp}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">{note.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNoteSubmit} className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="تێبینی، وردبینی بەڵگەنامە، یان ڕێنمایی نوێ بنووسە..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 active:bg-black disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    + تۆمارکردنی تێبینی
                  </button>
                </div>
              </form>
            </div>

            {/* ACTION CONTROLS */}
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                بڕیار و بەڕێکردنی مامەڵە
              </div>

              {/* Action 1: Route to Next Room */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <label className="text-xs font-bold text-slate-900 block">
                  ئاڕاستەکردن بۆ ژووری داهاتوو:
                </label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 text-xs text-slate-800 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)">ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)</option>
                    <option value="ژووری ٢: مێزی وەرگرتن و پۆلێنکردن">ژووری ٢: مێزی وەرگرتن و پۆلێنکردن</option>
                    <option value="ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە">ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە</option>
                    <option value="ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان">ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان</option>
                    <option value="ژووری ٥: وردبینی دارایی و باج">ژووری ٥: وردبینی دارایی و باج</option>
                  </select>

                  <button
                    onClick={handleRouteSubmit}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5 rotate-180" />
                    <span>ناردن بۆ ژوور</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={routeRemarks}
                  onChange={(e) => setRouteRemarks(e.target.value)}
                  placeholder="تێبینی بۆ گەیاندن / ڕێنمایی بۆ ژووری وەرگر (ئارەزوومەندانە)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Action 2: Green "Mark as Completed & Archive" button */}
              <div>
                {!showCompleteConfirm ? (
                  <button
                    onClick={() => setShowCompleteConfirm(true)}
                    className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-850 active:bg-black text-white font-black text-sm rounded-2xl shadow-lg shadow-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>تەواوکردنی کۆتایی و ئەرشیفکردن</span>
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 animate-in fade-in duration-100">
                    <div className="text-xs text-emerald-950 font-bold leading-relaxed">
                      ئایا دڵنیایت لە تەواوکردنی مامەڵەکە؟ بەم کارە دۆسیەکە بە فەرمی دادەخرێت و بە تەواوکراوی دەنێردرێتە خەزێنەی ئەرشیفی گشتی (ژووری ٤).
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowCompleteConfirm(false)}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        پاشگەزبوونەوە
                      </button>
                      <button
                        onClick={handleCompleteSubmit}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>پەسەندکردن و ئەرشیف</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
