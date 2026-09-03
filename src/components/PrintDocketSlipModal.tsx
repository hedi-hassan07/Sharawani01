import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Barcode, 
  QrCode, 
  FileText, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ShieldAlert,
  Calendar,
  User,
  Building,
  Phone,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { DocumentItem } from '../types';
import { playSound } from '../utils/audioFeedback';

interface PrintDocketSlipModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintDocketSlipModal: React.FC<PrintDocketSlipModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [printFormat, setPrintFormat] = useState<'thermal_citizen' | 'a4_folder_cover'>('thermal_citizen');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const handlePrint = () => {
    playSound('print_click');
    window.print();
  };

  const handleCopySlipText = () => {
    const text = `حکومەتی هەرێمی کوردستان - دەستەی بەڕێوەبردنی دۆسیەکان
ژمارەی دۆسیە: ${document.id}
کۆدی بارکۆد: ${document.barcode}
ناوی هاوڵاتی: ${document.citizenNameAr || document.citizenName}
ژمارەی ناسنامە: ${document.citizenId}
جۆری مامەڵە: ${document.documentType}
ڕێکەوتی وەرگرتن: ${document.dateReceived}
وێستگەی ئێستا: ${document.currentRoom}
پلەی بەپەلەیی: ${document.urgency === 'VIP' ? 'بەپەلە (VIP)' : 'ئاسایی'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    playSound('scan_beep');
    setTimeout(() => setCopied(false), 2000);
  };

  const isVip = document.urgency === 'VIP';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static" dir="rtl">
      
      {/* Container - Screen View */}
      <div className="relative w-full max-w-3xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Bar - Hidden on print */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                چاپکردنی پسولە و مۆری فەرمی دۆسیە
              </h2>
              <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
                {document.id} • {document.barcode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپکردن (Print)</span>
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

        {/* Format Selector Bar - Hidden on print */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">شێوازی چاپکردن:</span>
            
            {/* Format 1: Thermal Slip */}
            <button
              type="button"
              onClick={() => setPrintFormat('thermal_citizen')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printFormat === 'thermal_citizen'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              پسولەی وەرگرتنی هاوڵاتی (تێرمال / فیش)
            </button>

            {/* Format 2: A4 Folder Cover */}
            <button
              type="button"
              onClick={() => setPrintFormat('a4_folder_cover')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printFormat === 'a4_folder_cover'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              بەرگی فۆڵدەری کاغەزی (A4 Cover Sheet)
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopySlipText}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کۆپی کرا!' : 'کۆپیکردنی دەق'}</span>
          </button>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 flex justify-center print:bg-white print:p-0 print:overflow-visible">
          
          {/* FORMAT 1: THERMAL CITIZEN RECEIPT */}
          {printFormat === 'thermal_citizen' && (
            <div className="w-full max-w-sm bg-white border border-slate-300 rounded-xl p-5 shadow-xs font-sans text-slate-900 space-y-4 print:border-none print:shadow-none print:w-full print:max-w-none print:p-0">
              
              {/* Header */}
              <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-slate-300">
                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-900 mb-1">
                  <Building2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div className="text-xs font-bold text-slate-500">حکومەتی هەرێمی کوردستان</div>
                <div className="text-sm font-black text-slate-900">دەستەی بەڕێوەبردنی بەڵگەنامە فەرمییەکان</div>
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 py-0.5 px-2 rounded-md inline-block border border-emerald-200">
                  پسولەی ڕەسمی وەرگرتنی مامەڵەی هاوڵاتی
                </div>
              </div>

              {/* Barcode Display */}
              <div className="text-center py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-mono text-xs font-black tracking-widest text-slate-900" dir="ltr">
                  * {document.barcode} *
                </div>
                {/* Visual Barcode Bars Simulation */}
                <div className="flex justify-center items-center gap-[2px] h-9 my-1.5 px-6">
                  {document.barcode.split('').map((char, i) => {
                    const code = char.charCodeAt(0);
                    const width = (code % 3) + 1.5;
                    return (
                      <div 
                        key={i} 
                        className="bg-slate-900 h-full" 
                        style={{ width: `${width}px`, opacity: (code % 2 === 0) ? 1 : 0.8 }} 
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] text-slate-500 font-mono" dir="ltr">
                  REF: {document.id}
                </div>
              </div>

              {/* Docket Metadata Details */}
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 font-medium">ناوی هاوڵاتی:</span>
                  <span className="font-black text-slate-900 text-sm">{document.citizenNameAr || document.citizenName}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 font-medium">ژمارەی ناسنامە (Civil ID):</span>
                  <span className="font-mono font-bold text-slate-800" dir="ltr">{document.citizenId}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 font-medium">جۆری مامەڵە:</span>
                  <span className="font-bold text-slate-800">{document.documentType}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 font-medium">پلەی بەپەلەیی:</span>
                  {isVip ? (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-black text-[10px] border border-red-200">
                      بەپەلە (VIP - دەرکردنی خێرا)
                    </span>
                  ) : (
                    <span className="text-slate-700 font-bold">ئاسایی (Normal)</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 font-medium">کات و بەرواری وەرگرتن:</span>
                  <span className="font-mono text-slate-700 text-[11px]" dir="ltr">{document.dateReceived}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 font-medium">مێزی وەرگرتن:</span>
                  <span className="font-bold text-slate-800">{document.fromRoom.split(':')[0]}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 font-medium">ئاراستەکراو بۆ:</span>
                  <span className="font-bold text-emerald-800">{document.currentRoom.split(':')[0]}</span>
                </div>
              </div>

              {/* Instructions for Citizen */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-black flex items-center gap-1 text-amber-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>ڕێنمایی بۆ هاوڵاتی بەڕێز:</span>
                </div>
                <p className="leading-relaxed">
                  تکایە ئەم پسولەیە بە پارێزراوی لای خۆت بهێڵەرەوە. دەتوانی لە ڕێگەی بارکۆدەوە بەدواداچوون بۆ قۆناغەکانی مامەڵەکەت بکەیت.
                </p>
                <div className="font-mono text-[10px] text-amber-800 pt-1" dir="ltr">
                  هێڵی ناوخۆ: ١٠٢ / ١٠٣ • کاتی ئاسایی: ٣-٥ ڕۆژی کار
                </div>
              </div>

              {/* Official Stamp & Sign Box */}
              <div className="pt-3 border-t-2 border-dashed border-slate-300 flex items-center justify-between text-center text-[10px] text-slate-500">
                <div className="space-y-6">
                  <div>واژۆی ئەفسەری وەرگرتن:</div>
                  <div className="font-bold text-slate-800 border-b border-slate-400 pb-0.5 px-4">
                    {document.routingHistory?.[0]?.actionBy || 'کارمەندی وەرگرتن'}
                  </div>
                </div>

                <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center text-[8px] text-emerald-800 font-black rotate-[-12deg] p-1 bg-emerald-50/40">
                  <span>مۆری فەرمی</span>
                  <span>KRG - DMS</span>
                  <span>پەسەندکراو</span>
                </div>
              </div>

            </div>
          )}

          {/* FORMAT 2: A4 FOLDER COVER SHEET */}
          {printFormat === 'a4_folder_cover' && (
            <div className="w-full max-w-2xl bg-white border-2 border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm font-sans text-slate-900 space-y-6 print:border-2 print:border-black print:rounded-none print:shadow-none print:p-4">
              
              {/* Top Governmental Letterhead */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-600">حکومەتی هەرێمی کوردستان - عێراق</div>
                  <div className="text-lg font-black text-slate-900">وەزارەتی شارەوانی و گەشتوگوزار</div>
                  <div className="text-xs font-bold text-emerald-800">بەرگی فەرمی فۆڵدەری مامەڵەی هاوڵاتیان (Physical Dossier Docket)</div>
                </div>

                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-300 text-center">
                  <Building2 className="w-8 h-8 text-slate-800 mb-1" />
                  <span className="font-mono text-[10px] font-bold text-slate-600" dir="ltr">GOV-KRG-2026</span>
                </div>
              </div>

              {/* Barcode & Status Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-300 items-center">
                <div className="sm:col-span-2 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">کۆدی فەرمی دۆسیەی کاغەزی:</div>
                  <div className="font-mono text-xl font-black text-slate-900 tracking-wider" dir="ltr">
                    {document.barcode}
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-600" dir="ltr">
                    ID: {document.id} • CID: {document.citizenId}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center sm:items-end">
                  {isVip ? (
                    <div className="px-4 py-2 rounded-lg bg-red-600 text-white font-black text-sm uppercase tracking-wider text-center shadow-xs">
                      ⚠️ بەپەلە (VIP DOCKET)
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs text-center border border-blue-200">
                      مامەڵەی ئاسایی (NORMAL)
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Parties Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 rounded-xl p-4 bg-white">
                <div>
                  <span className="text-slate-500 block font-bold">ناوی خاوەن مامەڵە (کوردی):</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">{document.citizenNameAr || document.citizenName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">ناو بە پیتی لاتینی:</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block font-sans" dir="ltr">{document.citizenName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">جۆری پۆلێنکردنی دۆسیە:</span>
                  <span className="font-bold text-emerald-800 mt-0.5 block">{document.documentType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold">بەرواری تۆمارکردن:</span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 block" dir="ltr">{document.dateReceived}</span>
                </div>
              </div>

              {/* Physical Handover & Routing Sign-off Grid */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                  <span>خشتەی واژۆ و مۆری ڕێڕەوی ژوورەکان (Official Chain of Custody):</span>
                  <span className="text-[10px] text-slate-500 font-normal">هەر ئەفسەرێک فۆڵدەرەکەی وەرگرت دەبێت لێرە مۆر و واژۆ بکات</span>
                </div>

                <table className="w-full border-collapse border border-slate-400 text-[11px] text-slate-800">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-400">
                      <th className="border border-slate-400 p-2 text-right">وێستگە / ژوور</th>
                      <th className="border border-slate-400 p-2 text-right">ئەفسەری بەرپرس</th>
                      <th className="border border-slate-400 p-2 text-center">بەروار و کات</th>
                      <th className="border border-slate-400 p-2 text-center w-24">واژۆ</th>
                      <th className="border border-slate-400 p-2 text-center w-24">مۆری ژوور</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { room: 'ژووری ٢: وەرگرتن و پۆلێنکردنی سەرەتایی', officer: document.routingHistory?.[0]?.actionBy || 'ڕێبوار کەریم', defaultDate: document.dateReceived.split(' ')[0], signed: true },
                      { room: 'ژووری ٣: نەخشەی بنەڕەتی و پێداچوونەوە', officer: 'کاروان عەلی', defaultDate: '', signed: document.currentRoom.includes('٣') || document.currentRoom.includes('٤') || document.currentRoom.includes('٥') },
                      { room: 'ژووری ٥: وردبینی دارایی و باج', officer: 'سیروان حەمە', defaultDate: '', signed: document.currentRoom.includes('٥') || document.currentRoom.includes('٤') },
                      { room: 'ژووری ١: نوسینگەی بەڕێوەبەری گشتی', officer: 'د. ئەحمەد', defaultDate: '', signed: document.currentRoom.includes('١') },
                      { room: 'ژووری ٤: خەزێنەی ئەرشیفی هەمیشەیی', officer: 'چنار مەحموود', defaultDate: '', signed: document.status === 'Completed' }
                    ].map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-300 hover:bg-slate-50/50">
                        <td className="border border-slate-400 p-2 font-bold">{item.room}</td>
                        <td className="border border-slate-400 p-2">{item.officer}</td>
                        <td className="border border-slate-400 p-2 text-center font-mono text-[10px]" dir="ltr">
                          {item.defaultDate || '___/___/2026'}
                        </td>
                        <td className="border border-slate-400 p-2 text-center">
                          {item.signed ? (
                            <span className="font-script text-emerald-800 font-bold">✓ پەسەندکرا</span>
                          ) : (
                            <span className="text-slate-300">...............</span>
                          )}
                        </td>
                        <td className="border border-slate-400 p-2 text-center">
                          <div className="w-12 h-8 border border-dashed border-slate-400 rounded mx-auto flex items-center justify-center text-[9px] text-slate-400">
                            مۆر
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Verification Seal */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-300">
                <div>
                  پارێزراوە بە مۆری ژمارەیی: <span className="font-mono text-slate-800" dir="ltr">{document.pdfAttachment?.sealNumber || 'SEAL-KRG-2026-X'}</span>
                </div>
                <div className="font-mono text-[10px]" dir="ltr">
                  SYS-DMS-NODE-2026-PRINT-OK
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
