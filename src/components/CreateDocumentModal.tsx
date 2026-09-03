import React, { useState, useCallback, useMemo } from 'react';
import { 
  X, 
  FilePlus2, 
  ShieldAlert, 
  Building2, 
  Check, 
  User, 
  Hash, 
  Tag, 
  FileText,
  Barcode,
  Paperclip,
  Upload,
  Trash2
} from 'lucide-react';
import { DocumentItem, UrgencyTag, DocumentTypeOption } from '../types';
import { ScannerFeederAttachmentManager, MergedAttachmentResult } from './ScannerFeederAttachmentManager';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: (newDoc: DocumentItem) => void;
  documentTypes: DocumentTypeOption[];
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  onCreateDocument,
  documentTypes,
}) => {
  // Stable random IDs generated per modal session
  const [randomSuffix] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const autoDocId = useMemo(() => `DOC-2026-${randomSuffix}`, [randomSuffix]);
  const autoBarcode = useMemo(() => `${randomSuffix}-${Math.floor(1000 + Math.random() * 9000)}-KRG`, [randomSuffix]);

  const [citizenName, setCitizenName] = useState('');
  const [citizenNameAr, setCitizenNameAr] = useState('');
  const [citizenId, setCitizenId] = useState(`CID-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [urgency, setUrgency] = useState<UrgencyTag>('Normal');
  const [documentType, setDocumentType] = useState<string>(documentTypes[0]?.nameKu || documentTypes[0]?.name || 'تۆمارکردنی سەرەتایی کۆمپانیا');
  const [fromRoom, setFromRoom] = useState('ژووری ٢: مێزی وەرگرتن و پۆلێنکردن');
  const [currentRoom, setCurrentRoom] = useState('ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە');
  const [destinationRoom, setDestinationRoom] = useState('ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە');
  const [initialNote, setInitialNote] = useState('');
  const [isPhysicalReceived, setIsPhysicalReceived] = useState(true);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
    pagesCount?: number;
    title?: string;
  } | null>(null);

  const handleAttachmentReady = useCallback((res: MergedAttachmentResult | null) => {
    if (res) {
      setAttachedFile({
        name: res.fileName,
        size: res.fileSize,
        dataUrl: res.dataUrl,
        pagesCount: res.pagesCount,
        title: res.titleKu,
      });
    } else {
      setAttachedFile(null);
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() && !citizenNameAr.trim()) {
      return;
    }

    const primaryName = citizenNameAr.trim() || citizenName.trim();
    const secondaryName = citizenName.trim() || citizenNameAr.trim();
    const nowFormatted = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newDocument: DocumentItem = {
      id: autoDocId,
      barcode: autoBarcode,
      citizenName: secondaryName,
      citizenNameAr: primaryName,
      citizenId: citizenId.trim(),
      dateReceived: nowFormatted,
      urgency,
      fromRoom,
      currentRoom,
      destinationRoom,
      status: isPhysicalReceived ? 'In Review' : 'Pending Receipt',
      documentType,
      physicalReceived: isPhysicalReceived,
      physicalReceivedAt: isPhysicalReceived ? nowFormatted : undefined,
      intakeClassificationStatus: 'Classified',
      internalNotes: initialNote.trim() ? [
        {
          id: `note-${Date.now()}`,
          author: 'کاروان عەلی (ژووری ٣)',
          room: currentRoom,
          timestamp: nowFormatted,
          text: initialNote.trim(),
        }
      ] : [],
      pdfAttachment: {
        fileName: attachedFile?.name || `${documentType.replace(/\s+/g, '_')}_Official_Filing_${autoDocId}.pdf`,
        fileSize: attachedFile?.size || '2.4 MB',
        fileDataUrl: attachedFile?.dataUrl,
        title: attachedFile ? (attachedFile.title || `بەڵگەنامەی هاوپێچکراو: ${attachedFile.name}`) : `بەڵگەنامەی فەرمی حکومی: ${documentType}`,
        referenceNumber: `KRG-REF-2026/${autoDocId}`,
        issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        issuingAuthority: 'بەڕێوەبەرایەتی گشتی چاودێری و تۆماری بەڵگەنامەکان',
        signatoryName: 'کاروان عەلی ڕۆستەم',
        signatoryTitle: 'ئەفسەری باڵای یاسایی و تۆمار',
        sealNumber: `SEAL-GOV-${randomSuffix}`,
        pagesCount: attachedFile?.pagesCount || 2,
        summaryText: `دۆسیەی پەسەندکراو بۆ هاوڵاتی ${primaryName} سەبارەت بە ${documentType}. فۆڵدەری کاغەزی و بەڵگەنامەی ڕەسەن بە فەرمی لە سیستەم تۆمارکرا.`,
        articles: [
          `بڕگەی ١: داواکار ${primaryName} (ژمارەی ناسنامە: ${citizenId}) بە فەرمی داواکاری پێشکەش کردووە بۆ وردبینی لە فەرمانگە.`,
          `بڕگەی ٢: سەرجەم مۆر و بەڵگەنامە فەرمییەکان بە بارکۆدی تایبەت تۆمارکراون لە تۆڕی زانیاری ناوەندی.`,
        ],
        securityHash: `SHA256: ${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      },
      routingHistory: [
        {
          id: `rh-${Date.now()}`,
          fromRoom,
          toRoom: currentRoom,
          timestamp: nowFormatted,
          actionBy: 'کاروان عەلی',
          remarks: 'تۆمارکردن و دەرکردنی سەرەتایی دۆسیە بە بارکۆدی فەرمی.',
        }
      ],
    };

    onCreateDocument(newDocument);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 my-8 text-right">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900">
                دروستکردن و تۆمارکردنی مامەڵەی نوێ
              </h2>
              <p className="text-xs text-slate-500">
                دەرکردنی کۆدی فەرمی، تۆمارکردنی زانیاری هاوڵاتی و دیاریکردنی ژووری ئاڕاستەکراو.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Tracking Barcode & ID Readout */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">کۆدی دۆسیە (Document ID)</span>
              <span className="font-bold text-emerald-700 text-sm">{autoDocId}</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-500 block">بارکۆدی دیجیتاڵی</span>
              <span className="text-slate-700 text-xs font-semibold">{autoBarcode}</span>
            </div>
          </div>

          {/* Citizen Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                ناوی تەواوی هاوڵاتی (کوردی / عەرەبی) *
              </label>
              <input
                type="text"
                value={citizenNameAr}
                onChange={(e) => setCitizenNameAr(e.target.value)}
                placeholder="نموونە: ئەحمەد عەلی حەسەن، سارا عوسمان"
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                ناو بە پیتی لاتینی (English Name)
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="e.g. Ahmed Ali Hassan"
                dir="ltr"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                ژمارەی ناسنامەی باری شارستانی (CID)
              </label>
              <input
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                جۆری مامەڵە (Classification)
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {documentTypes.map((t) => (
                  <option key={t.id} value={t.nameKu || t.name}>
                    {t.nameKu || t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                پلەی گرنگی (Urgency)
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyTag)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 focus:ring-1 focus:ring-emerald-500 font-bold"
              >
                <option value="Normal">ئاسایی (Normal Urgency)</option>
                <option value="VIP">بەپەلەی تایبەت (VIP Priority)</option>
              </select>
            </div>
          </div>

          {/* Department Routing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                لە ژووری نێرەر (From Room)
              </label>
              <select
                value={fromRoom}
                onChange={(e) => setFromRoom(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)">ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)</option>
                <option value="ژووری ٢: مێزی وەرگرتن و پۆلێنکردن">ژووری ٢: مێزی وەرگرتن و پۆلێنکردن</option>
                <option value="ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە">ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە</option>
                <option value="ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان">ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان</option>
                <option value="ژووری ٥: وردبینی دارایی و باج">ژووری ٥: وردبینی دارایی و باج</option>
                <option value="مێزی پێشوازی هاوڵاتیان">مێزی پێشوازی هاوڵاتیان</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                بۆ ژووری وەرگر (Target Room)
              </label>
              <select
                value={currentRoom}
                onChange={(e) => setCurrentRoom(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)">ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)</option>
                <option value="ژووری ٢: مێزی وەرگرتن و پۆلێنکردن">ژووری ٢: مێزی وەرگرتن و پۆلێنکردن</option>
                <option value="ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە">ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە</option>
                <option value="ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان">ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان</option>
                <option value="ژووری ٥: وردبینی دارایی و باج">ژووری ٥: وردبینی دارایی و باج</option>
              </select>
            </div>
          </div>

          {/* Physical Receipt Toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">فۆڵدەری کاغەزی بە دەست گەیشتووە (Physical In Hand)</div>
              <div className="text-[10px] text-slate-500">ئەگەر فۆڵدەرەکە هێشتا لە ڕێگای گەیاندندایە، نیشانەکەی لابدە.</div>
            </div>
            <input
              type="checkbox"
              checked={isPhysicalReceived}
              onChange={(e) => setIsPhysicalReceived(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-white border-slate-300 cursor-pointer"
            />
          </div>

          {/* Scanner / Computer Document Chooser with 1-PDF Engine */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>هاوپێچکردنی بەڵگەنامە لە کۆمپیوتەر / سکانەر</span>
              <span className="text-[10px] text-slate-500">یەکخستنی ئۆتۆماتیکی بۆ ١ فایلی PDF</span>
            </div>
            <ScannerFeederAttachmentManager
              documentId={autoDocId}
              citizenName={citizenNameAr || citizenName || 'هاوڵاتی'}
              onAttachmentReady={handleAttachmentReady}
            />
          </div>

          {/* Initial Internal Notes */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              تێبینی و سەرنجی سەرەتایی (ئارەزوومەندانە)
            </label>
            <textarea
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="تێبینی سەبارەت بە تەواوی بەڵگەنامەکان، مۆری ڕەسەن یان پێداویستییەکان بنووسە..."
              rows={2}
              className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
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
              className="px-5 py-2 bg-slate-950 hover:bg-slate-850 active:bg-black text-white rounded-xl font-bold shadow-md shadow-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>تۆمارکردن و دەرکردنی دۆسیە</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

