import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Building2, 
  CheckCircle2, 
  CornerDownRight, 
  FileText
} from 'lucide-react';
import { DocumentItem } from '../types';
import { ScannerFeederAttachmentManager, MergedAttachmentResult } from './ScannerFeederAttachmentManager';

interface QuickRouteModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRouteDocument: (
    docId: string, 
    targetRoom: string, 
    notes: string,
    attachedFile?: { fileName: string; fileSize: string; dataUrl?: string; pagesCount?: number; title?: string }
  ) => void;
}

export const QuickRouteModal: React.FC<QuickRouteModalProps> = ({
  document,
  isOpen,
  onClose,
  onRouteDocument,
}) => {
  const [targetRoom, setTargetRoom] = useState<string>(
    document?.destinationRoom || 'ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)'
  );
  const [memo, setMemo] = useState<string>('');
  const [preparedAttachment, setPreparedAttachment] = useState<MergedAttachmentResult | null>(null);

  if (!isOpen || !document) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoom) return;

    onRouteDocument(
      document.id, 
      targetRoom, 
      memo.trim(),
      preparedAttachment ? {
        fileName: preparedAttachment.fileName,
        fileSize: preparedAttachment.fileSize,
        dataUrl: preparedAttachment.dataUrl,
        pagesCount: preparedAttachment.pagesCount,
        title: preparedAttachment.titleKu,
      } : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 text-right my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Send className="w-4 h-4 rotate-180" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                بەڕێکردن و ئاڕاستەکردنی دۆسیە بۆ ژووری تر
              </h3>
              <p className="text-[11px] text-slate-500">
                هەڵبژاردنی بەڵگەنامە لە کۆمپیوتەرەکەت و یەکخستنی بۆ ١ فایلی فەرمی PDF
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details snippet */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between font-mono">
            <span className="text-emerald-700 font-bold">{document.id}</span>
            <span className="text-slate-500 font-medium">{document.documentType}</span>
          </div>
          <div className="text-slate-900 font-bold">{document.citizenNameAr || document.citizenName}</div>
          <div className="text-[11px] text-slate-500">ژووری ئێستا: <span className="font-bold text-slate-800">{document.currentRoom}</span></div>
        </div>

        {/* Scanner & 1-PDF Engine: Checks if scanner is scanning or lets employee choose */}
        <ScannerFeederAttachmentManager
          documentId={document.id}
          citizenName={document.citizenNameAr || document.citizenName}
          currentAttachment={document.pdfAttachment}
          onAttachmentReady={setPreparedAttachment}
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              هەڵبژاردنی ژوور یان بەشی وەرگر:
            </label>
            <select
              value={targetRoom}
              onChange={(e) => setTargetRoom(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
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
              تێبینی بۆ گەیاندن یان ڕێنمایی (ئارەزوومەندانە)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="نموونە: بەڵگەنامەی سکانکراوی نوێ هاوپێچکراوە، تکایە وردبینی بکرێت..."
              rows={2}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-850 active:bg-black text-white rounded-xl font-bold shadow-md shadow-slate-300 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5 rotate-180 text-emerald-400" />
              <span>بەڕێکردنی دۆسیە</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
