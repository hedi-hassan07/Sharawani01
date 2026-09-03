import React, { useState, useRef } from 'react';
import { 
  Barcode, 
  Search, 
  CheckCircle2, 
  X, 
  PackageCheck, 
  AlertCircle, 
  ArrowRight,
  Eye,
  Check,
  Upload,
  Paperclip,
  FileText,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { DocumentItem, ScannedPdfData } from '../types';

interface PhysicalBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onConfirmPhysicalReceipt: (docId: string) => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onAttachFileToDocument?: (docId: string, updatedAttachment: Partial<ScannedPdfData>, noteText?: string) => void;
  onOpenCreateWithFile?: (fileData: { fileName: string; fileSize: string; dataUrl?: string }) => void;
}

export const PhysicalBarcodeScannerModal: React.FC<PhysicalBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  documents,
  onConfirmPhysicalReceipt,
  onSelectDocument,
  onAttachFileToDocument,
  onOpenCreateWithFile,
}) => {
  const [inputBarcode, setInputBarcode] = useState('');
  const [matchedDoc, setMatchedDoc] = useState<DocumentItem | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: sizeFormatted,
        dataUrl: reader.result as string,
      });
      setScannedFeedback(`پەڕگەی (${file.name}) لە سکانەرەوە بە سەرکەوتوویی ئامادەکرا.`);
    };
    reader.readAsDataURL(file);
  };

  const handleAttachToCurrentDoc = () => {
    if (!matchedDoc || !selectedFile) return;

    if (onAttachFileToDocument) {
      onAttachFileToDocument(
        matchedDoc.id,
        {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileDataUrl: selectedFile.dataUrl,
          titleKu: `بەڵگەنامەی فەرمی سکانکراو: ${selectedFile.name}`,
        },
        `پەڕگەی سکانکراوی نوێ (${selectedFile.name}) لە ڕێگەی سکانەری فیزیکییەوە لکێندرا.`
      );
    }

    setScannedFeedback(`پەڕگەی (${selectedFile.name}) لکێندرا بە دۆسیەی (${matchedDoc.id}) بە سەرکەوتوویی.`);
    setMatchedDoc(prev => prev ? {
      ...prev,
      pdfAttachment: {
        ...prev.pdfAttachment,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileDataUrl: selectedFile.dataUrl,
      }
    } : null);
    setSelectedFile(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputBarcode.trim().toLowerCase();
    if (!query) return;

    const found = documents.find(
      d => d.barcode.toLowerCase().includes(query) || d.id.toLowerCase().includes(query)
    );

    if (found) {
      setMatchedDoc(found);
      setScannedFeedback(null);
    } else {
      setMatchedDoc(null);
      setScannedFeedback('هیچ مامەڵەیەک نەدۆزرایەوە بەم کۆد یان بارکۆدە.');
    }
  };

  const handleQuickConfirm = (doc: DocumentItem) => {
    onConfirmPhysicalReceipt(doc.id);
    setScannedFeedback(`وەرگرتنی فیزیکی دۆسیەی (${doc.id}) بە سەرکەوتوویی لە سیستەم تۆمارکرا.`);
    setMatchedDoc({
      ...doc,
      physicalReceived: true,
      status: 'In Review',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">
                سکانەری خوێندنەوەی بارکۆدی فیزیکی
              </h3>
              <p className="text-xs text-slate-500">
                بارکۆدی سەر فۆڵدەری کاغەزی بنووسە یان سکان بکە بۆ پشتڕاستکردنەوەی وەرگرتن.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Barcode Form */}
        <form onSubmit={handleSearch} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              داخڵکردنی بارکۆد یان کۆدی دۆسیە
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputBarcode}
                onChange={(e) => setInputBarcode(e.target.value)}
                placeholder="نموونە: 9041-8821-KRG یان DOC-2026-9041"
                autoFocus
                dir="ltr"
                className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Search className="w-4 h-4" />
                <span>پشکنین</span>
              </button>
            </div>
          </div>

          {/* Quick preset tags for testing */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-slate-500 font-bold">کۆدەکانی نموونە بۆ تاقیکردنەوە:</span>
            {documents.slice(0, 3).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setInputBarcode(d.barcode);
                  setMatchedDoc(d);
                  setScannedFeedback(null);
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-md text-[10px] font-mono border border-slate-200 cursor-pointer transition-colors"
                dir="ltr"
              >
                {d.barcode}
              </button>
            ))}
          </div>
        </form>

        {/* 1. Direct Scanner File Attachment Section */}
        <div className="p-3.5 bg-slate-50 border border-dashed border-emerald-300 rounded-2xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-900">
                پەڕگەی سکانکراوی ڕاستەوخۆ لە ئامێری سکانەرەوە
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-100/70 px-2 py-0.5 rounded-md">
              پەیوەستکردنی بەڵگەنامە
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,image/*,.doc,.docx"
            className="hidden"
          />

          {!selectedFile ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400 rounded-xl cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-700 group-hover:text-emerald-800 text-xs">
                کلیک بکە بۆ دیاریکردن و هێنانی پەڕگە لە سکانەر یان کۆمپیوتەر
              </div>
              <div className="text-[10px] text-slate-400">
                پشتیوانی فۆرماتەکانی PDF, JPG, PNG بە قەبارەی ڕەسەن
              </div>
            </div>
          ) : (
            <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-right">
                    <div className="font-bold text-slate-800 text-xs truncate" dir="ltr">
                      {selectedFile.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      قەبارە: {selectedFile.size} • سکانکراوی نوێ
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
                  title="سڕینەوەی پەڕگە"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Action for the attached file */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 justify-end">
                {matchedDoc ? (
                  <button
                    type="button"
                    onClick={handleAttachToCurrentDoc}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>لکاندن بە دۆسیەی دۆزراوە ({matchedDoc.id})</span>
                  </button>
                ) : (
                  onOpenCreateWithFile && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenCreateWithFile({
                          fileName: selectedFile.name,
                          fileSize: selectedFile.size,
                          dataUrl: selectedFile.dataUrl,
                        });
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تۆمارکردنی دۆسیەی نوێ بەم پەڕگەیە</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scan Results Card */}
        {matchedDoc && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="font-mono font-bold text-sm text-emerald-700" dir="ltr">
                {matchedDoc.id}
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                matchedDoc.physicalReceived 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {matchedDoc.physicalReceived ? 'وەرگیراوە' : 'چاوەڕوانی وەرگرتنە'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block font-bold">ناوی هاوڵاتی:</span>
                <span className="font-bold text-slate-800">{matchedDoc.citizenNameAr || matchedDoc.citizenName}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold">جۆری مامەڵە:</span>
                <span className="text-slate-800 font-medium">{matchedDoc.documentType}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold">لە ژووری:</span>
                <span className="text-slate-700 font-medium">{matchedDoc.fromRoom}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold">ژووری ئێستا:</span>
                <span className="text-emerald-700 font-bold">{matchedDoc.currentRoom}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  onSelectDocument(matchedDoc);
                  onClose();
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs flex items-center gap-1 cursor-pointer font-bold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>کردنەوەی دۆسیە</span>
              </button>

              {!matchedDoc.physicalReceived && (
                <button
                  onClick={() => handleQuickConfirm(matchedDoc)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>پشتڕاستکردنەوەی گەیشتن</span>
                </button>
              )}
            </div>
          </div>
        )}

        {scannedFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{scannedFeedback}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs rounded-xl font-bold cursor-pointer transition-colors"
          >
            داخستنی سکانەر
          </button>
        </div>

      </div>
    </div>
  );
};
