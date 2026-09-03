import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  RotateCcw, 
  Building2, 
  FileText, 
  Paperclip, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Edit3
} from 'lucide-react';
import { DocumentItem, ScannedPdfData } from '../types';
import { ScannerFeederAttachmentManager, MergedAttachmentResult } from './ScannerFeederAttachmentManager';

interface EditSentRoutingModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAndReRoute: (
    docId: string, 
    newTargetRoom: string, 
    newRemarks: string, 
    updatedFile?: { fileName: string; fileSize: string; dataUrl?: string }
  ) => void;
}

export const EditSentRoutingModal: React.FC<EditSentRoutingModalProps> = ({
  document,
  isOpen,
  onClose,
  onSaveAndReRoute,
}) => {
  const [targetRoom, setTargetRoom] = useState<string>(
    document?.destinationRoom || 'ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە'
  );
  
  // Get previous routing note if available
  const lastHistory = document?.routingHistory?.[document.routingHistory.length - 1];
  const [remarks, setRemarks] = useState<string>(
    lastHistory?.remarks || (document ? `بەڕێکرا لە مێزی وەرگرتنی ژووری ٢ لەژێر پۆلێنی [${document.documentType}].` : '')
  );
  
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document) {
      setTargetRoom(document.destinationRoom || 'ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە');
      const last = document.routingHistory?.[document.routingHistory.length - 1];
      setRemarks(last?.remarks || `ئاراستەکردن بۆ ${document.destinationRoom || 'ژووری مەبەست'}`);
      setAttachedFile(null);
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        size: sizeFormatted,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoom) return;

    onSaveAndReRoute(
      document.id,
      targetRoom,
      remarks.trim(),
      attachedFile ? { fileName: attachedFile.name, fileSize: attachedFile.size, dataUrl: attachedFile.dataUrl } : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 my-8 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                دەستکاریکردن و ڕاستکردنەوەی ناردنی دۆسیە
              </h3>
              <p className="text-xs text-slate-500">
                ئەگەر دۆسیەکە بە هەڵە نێردراوە، لێرە ژوور و پەیام و فایل دەستکاری بکە
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice alert */}
        <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            دەتوانیت شوێنی مەبەست و پەیامی ڕەوانەکردن بگۆڕیت؛ گۆڕانکارییەکان دەستبەجێ لە هەموو بەشەکان نوێ دەبنەوە.
          </span>
        </div>

        {/* Current Document Summary */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between items-center font-mono">
            <span className="text-emerald-700 font-bold">{document.id}</span>
            <span className="text-slate-500 font-medium">{document.documentType}</span>
          </div>
          <div className="text-slate-900 font-bold">{document.citizenNameAr || document.citizenName}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
            <span>ژووری ئێستا: <strong className="text-slate-800">{document.currentRoom}</strong></span>
            <span>ئاڕاستەکراوی پێشوو: <strong className="text-amber-700">{document.destinationRoom || 'دیاری نەکراوە'}</strong></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Target Room Selector */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              هەڵبژاردنی ژوور یان بەشی وەرگری دروست: *
            </label>
            <select
              value={targetRoom}
              onChange={(e) => setTargetRoom(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)">ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)</option>
              <option value="ژووری ٢: مێزی وەرگرتن و پۆلێنکردن">ژووری ٢: مێزی وەرگرتن و پۆلێنکردن</option>
              <option value="ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە">ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە</option>
              <option value="ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان">ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان</option>
              <option value="ژووری ٥: وردبینی دارایی و باج">ژووری ٥: وردبینی دارایی و باج</option>
            </select>
          </div>

          {/* Sent Remarks / Message */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              پەیامی ناردن / تێبینی و هۆکاری ڕاستکردنەوە: *
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="نموونە: دۆسیەکە بە هەڵە نێردرابوو، دووبارە ئاراستەی بەشی نەخشەی بنەڕەتی دەکرێتەوە..."
              rows={3}
              required
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium leading-relaxed"
            />
          </div>

          {/* Scanner & 1-PDF Engine: Checks if scanner is scanning or lets employee choose */}
          <ScannerFeederAttachmentManager
            documentId={document.id}
            citizenName={document.citizenNameAr || document.citizenName}
            currentAttachment={document.pdfAttachment}
            onAttachmentReady={(res) => {
              if (res) {
                setAttachedFile({
                  name: res.fileName,
                  size: res.fileSize,
                  dataUrl: res.dataUrl,
                });
              } else {
                setAttachedFile(null);
              }
            }}
          />

          {/* Action buttons */}
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
              className="px-5 py-2 bg-slate-950 hover:bg-slate-850 active:bg-black text-white rounded-xl font-bold shadow-md shadow-slate-300 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5 rotate-180 text-amber-400" />
              <span>پاشەکەوتکردن و ناردنەوە بۆ ژوور</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
