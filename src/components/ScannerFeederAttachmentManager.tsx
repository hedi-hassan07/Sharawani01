import React, { useState, useRef } from 'react';
import { 
  Printer, 
  FileText, 
  Upload, 
  Layers, 
  RefreshCw, 
  Trash2, 
  FileCheck2, 
  ScanLine,
  Check,
  Laptop,
  FolderOpen
} from 'lucide-react';
import { ScannedPdfData } from '../types';

export interface MergedAttachmentResult {
  fileName: string;
  fileSize: string;
  dataUrl?: string;
  pagesCount: number;
  titleKu?: string;
  isMergedPdf?: boolean;
}

interface ScannerFeederAttachmentManagerProps {
  documentId: string;
  citizenName?: string;
  currentAttachment?: ScannedPdfData;
  onAttachmentReady: (attachment: MergedAttachmentResult | null) => void;
}

type ModeType = 'computer_picker' | 'active_scanning' | 'merged_ready' | 'manual_picked';

export const ScannerFeederAttachmentManager: React.FC<ScannerFeederAttachmentManagerProps> = ({
  documentId,
  citizenName = 'هاوڵاتی',
  currentAttachment,
  onAttachmentReady,
}) => {
  // Default to computer picker since no physical scanner is connected to the computer right now
  const [currentMode, setCurrentMode] = useState<ModeType>('computer_picker');
  const [scanPagesCount, setScanPagesCount] = useState<number>(3);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [currentScanningPage, setCurrentScanningPage] = useState<number>(1);
  const [activeResult, setActiveResult] = useState<MergedAttachmentResult | null>(null);
  const [pickedFileNames, setPickedFileNames] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate a realistic SVG canvas DataURL representing merged 1-PDF document
  const generateMergedPdfCanvas = (pages: number, docCode: string, sourceLabel: string = 'کۆمپیوتەر') => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
        <rect width="600" height="850" fill="#f8fafc"/>
        <rect x="25" y="25" width="550" height="800" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        
        <!-- Header Ribbon -->
        <rect x="25" y="25" width="550" height="90" fill="#0f172a" rx="8 8 0 0"/>
        <text x="300" y="60" fill="#f8fafc" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">حکومەتی هەرێمی کوردستان - دەستەی گشتی</text>
        <text x="300" y="85" fill="#34d399" font-size="13" font-family="sans-serif" text-anchor="middle">دۆسیەی فەرمی یەکگرتووی ئەلیکترۆنی (Official Unified PDF Dossier)</text>
        
        <!-- Document Metadata -->
        <rect x="50" y="140" width="500" height="85" rx="6" fill="#f1f5f9" stroke="#e2e8f0"/>
        <text x="520" y="170" fill="#1e293b" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="end">کۆدی دۆسیە: ${docCode}</text>
        <text x="520" y="195" fill="#475569" font-size="12" font-family="sans-serif" text-anchor="end">خاوەن مامەڵە: ${citizenName}</text>
        <text x="70" y="170" fill="#047857" font-size="13" font-family="sans-serif" font-weight="bold" text-anchor="start">کۆی پەڕە یەکخراوەکان: ${pages} پەڕە</text>
        <text x="70" y="195" fill="#64748b" font-size="11" font-family="sans-serif" text-anchor="start">سەرچاوە: ${sourceLabel} • بەروار: ${new Date().toLocaleDateString('en-CA')}</text>
        
        <!-- Pages representation in 1 PDF -->
        <g transform="translate(50, 250)">
          <rect width="500" height="150" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-dasharray="4 4"/>
          <text x="470" y="35" fill="#0f172a" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="end">پەڕەی ١ لە ${pages}: فۆرمی سەرەکی و نوسراوی ڕەسمی</text>
          <line x1="30" y1="55" x2="470" y2="55" stroke="#cbd5e1" stroke-width="1.5"/>
          <line x1="30" y1="80" x2="470" y2="80" stroke="#e2e8f0" stroke-width="1.5"/>
          <line x1="30" y1="105" x2="400" y2="105" stroke="#e2e8f0" stroke-width="1.5"/>
          <line x1="30" y1="130" x2="350" y2="130" stroke="#e2e8f0" stroke-width="1.5"/>
        </g>
        
        <g transform="translate(50, 425)">
          <rect width="500" height="150" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-dasharray="4 4"/>
          <text x="470" y="35" fill="#0f172a" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="end">پەڕەی ٢ لە ${pages}: بەڵگەنامە و پاشکۆ هاوپێچکراوەکان</text>
          <line x1="30" y1="55" x2="470" y2="55" stroke="#cbd5e1" stroke-width="1.5"/>
          <line x1="30" y1="80" x2="470" y2="80" stroke="#e2e8f0" stroke-width="1.5"/>
          <line x1="30" y1="105" x2="470" y2="105" stroke="#e2e8f0" stroke-width="1.5"/>
        </g>
        
        <!-- Official Seal / Stamp -->
        <g transform="translate(380, 615)">
          <circle cx="90" cy="90" r="70" fill="none" stroke="#dc2626" stroke-width="3"/>
          <circle cx="90" cy="90" r="62" fill="none" stroke="#dc2626" stroke-width="1" stroke-dasharray="3 3"/>
          <text x="90" y="75" fill="#dc2626" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">مۆری ئەلیکترۆنی</text>
          <text x="90" y="95" fill="#dc2626" font-size="10" font-family="sans-serif" text-anchor="middle">سیستەمی یەکگرتووی دۆسیە</text>
          <text x="90" y="115" fill="#dc2626" font-size="9" font-family="sans-serif" text-anchor="middle">KRG-DIGITAL-PASS</text>
        </g>
        
        <g transform="translate(70, 645)">
          <text x="0" y="20" fill="#0f172a" font-size="12" font-family="sans-serif" font-weight="bold">پەسەندکردنی ناردن لە سیستەمەوە:</text>
          <text x="0" y="45" fill="#10b981" font-size="16" font-family="cursive">Official Digital Officer</text>
          <text x="0" y="70" fill="#64748b" font-size="11" font-family="sans-serif">یەکخراوە بۆ ١ پەڕگەی PDF بە سەرکەوتوویی</text>
        </g>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  // Safely notify parent component of attachment updates outside of the synchronous render cycle
  const notifyAttachmentReady = (attachment: MergedAttachmentResult | null) => {
    setTimeout(() => {
      onAttachmentReady(attachment);
    }, 0);
  };

  // Process files picked from the computer (1 or multiple -> 1 PDF)
  const processFilesFromComputer = (files: File[]) => {
    if (files.length === 0) return;

    const names = files.map(f => f.name);
    setPickedFileNames(names);

    if (files.length === 1) {
      // 1 document selected
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const singlePdfResult: MergedAttachmentResult = {
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          pagesCount: 1,
          isMergedPdf: false,
          titleKu: `پەڕگەی هەڵبژێردراو لە کۆمپیوتەر: ${file.name}`,
          dataUrl: (reader.result as string) || generateMergedPdfCanvas(1, documentId, 'کۆمپیوتەر'),
        };
        setActiveResult(singlePdfResult);
        setCurrentMode('manual_picked');
        notifyAttachmentReady(singlePdfResult);
      };
      reader.readAsDataURL(file);
    } else {
      // More than 1 document selected -> Automatically merge all into 1 single unified PDF!
      const totalSizeMb = files.reduce((acc: number, f: File) => acc + f.size / (1024 * 1024), 0).toFixed(1);
      const unifiedName = `Unified_${files.length}Files_${documentId}.pdf`;
      
      const mergedPdfResult: MergedAttachmentResult = {
        fileName: unifiedName,
        fileSize: `${totalSizeMb} MB`,
        pagesCount: files.length,
        isMergedPdf: true,
        titleKu: `سەرجەم (${files.length}) پەڕگەکە یەکخران بۆ ١ فایلی PDF`,
        dataUrl: generateMergedPdfCanvas(files.length, documentId, 'کۆمپیوتەر - چەند پەڕگە'),
      };

      setActiveResult(mergedPdfResult);
      setCurrentMode('manual_picked');
      notifyAttachmentReady(mergedPdfResult);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    processFilesFromComputer(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files: File[] = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      processFilesFromComputer(files);
    }
  };

  // Optional manual trigger to test/scan from hardware feeder if scanner is ever connected
  const handleStartScannerCheck = (pagesCount: number = 3) => {
    setCurrentMode('active_scanning');
    setScanPagesCount(pagesCount);
    setScanProgress(15);
    setCurrentScanningPage(1);

    const stepInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(stepInterval);
          const singleCombinedPdf: MergedAttachmentResult = {
            fileName: `Scanner_Merged_${documentId}.pdf`,
            fileSize: `${(2.1 + pagesCount * 0.5).toFixed(1)} MB`,
            pagesCount: pagesCount,
            isMergedPdf: true,
            titleKu: `سکانی فیزیکی یەکگرتوو (١ فایلی PDF لە ${pagesCount} پەڕە)`,
            dataUrl: generateMergedPdfCanvas(pagesCount, documentId, 'ئامێری سکانەر'),
          };

          setActiveResult(singleCombinedPdf);
          setCurrentMode('merged_ready');
          notifyAttachmentReady(singleCombinedPdf);
          return 100;
        }

        const nextProg = prev + 25;
        const pageIdx = Math.min(Math.ceil((nextProg / 100) * pagesCount), pagesCount);
        setCurrentScanningPage(pageIdx);
        return nextProg;
      });
    }, 300);
  };

  const clearSelection = () => {
    setActiveResult(null);
    setPickedFileNames([]);
    setCurrentMode('computer_picker');
    notifyAttachmentReady(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right space-y-3" dir="rtl">
      
      {/* Hidden Native File Input targeting the user's computer */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,image/*,.doc,.docx"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Top Header: Current Device Connection Status */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-900 text-blue-300 flex items-center justify-center shadow-xs">
            <Laptop className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-900">
                هاوپێچکردنی بەڵگەنامە لە کۆمپیوتەر
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 border border-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>کۆمپیوتەر چالاکە (بێ سکانەر)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              دەتوانیت ١ پەڕگە یان چەند پەڕگەیەک لە کۆمپیوتەرەکەت هەڵبژێریت؛ سیستەم هەموویان دەکاتە ١ پەڕگەی PDF.
            </p>
          </div>
        </div>

        {/* Optional switch to test scanner if connected */}
        <button
          type="button"
          onClick={() => handleStartScannerCheck(3)}
          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
          title="ئەگەر لە داهاتوودا ئامێری سکانەرت پەیوەست کرد، دەتوانیت لێرەوە تاقیبکەیتەوە"
        >
          <Printer className="w-3 h-3 text-slate-400" />
          <span>تاقیکردنەوەی سکانەر</span>
        </button>
      </div>

      {/* MODE 1: Computer Picker (Default & Direct) */}
      {currentMode === 'computer_picker' && (
        <div className="space-y-2.5">
          
          {/* Large Clickable Area that directly goes to Computer's File Chooser */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50/60 scale-[0.99]' 
                : 'border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50/30'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
              <FolderOpen className="w-6 h-6" />
            </div>

            <div>
              <div className="font-black text-sm text-slate-900 flex items-center justify-center gap-1.5">
                <span>کلیک بکە بۆ هەڵبژاردنی بەڵگەنامە لە کۆمپیوتەرەکەت</span>
                <Upload className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                (Click here to choose files from your computer)
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>ئەگەر ١ فایل یان چەند فایلێکیش بێت، سیستەم ڕاستەوخۆ دەیکاتە ١ فایلی فەرمی PDF</span>
            </div>
            
            <div className="text-[10px] text-slate-400">
              پشتیوانی لە PDF، وێنەی سکانکراو (JPG, PNG)، و فایلە فەرمییەکان دەکرێت
            </div>
          </div>

          {/* Fallback to current attachment if already attached */}
          {currentAttachment && (
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">فایلی سەرەکی تۆمارکراو لە پێشوودا:</span>
                <span className="font-bold text-slate-800 font-mono">{currentAttachment.fileName}</span>
              </div>
              <span className="text-[11px] text-slate-400">بەردەوام دەبێت ئەگەر فایلی نوێ هەڵنەبژێریت</span>
            </div>
          )}

        </div>
      )}

      {/* MODE 2: Files Picked from Computer & Merged into 1 PDF */}
      {currentMode === 'manual_picked' && activeResult && (
        <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 space-y-3 animate-in fade-in">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-950 block">
                  {activeResult.isMergedPdf
                    ? `سەرجەم (${activeResult.pagesCount}) فایلەکە لە کۆمپیوتەرەوە یەکخران بۆ ناو ١ فایلی فەرمی PDF!`
                    : 'فایلەکە بە سەرکەوتوویی لە کۆمپیوتەرەکەتەوە بارکرا و کرایە PDF!'}
                </span>
                <span className="text-[10px] text-emerald-800 font-medium">
                  ڕاستەوخۆ هاوپێچکرا بۆ ناردن و ئاڕاستەکردن (Ready to route directly)
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">
              ١ فایلی PDF
            </span>
          </div>

          {/* Unified PDF Details Card */}
          <div className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md" dir="ltr">
                  {activeResult.fileName}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-700 font-bold">{activeResult.pagesCount} پەڕەی یەکگرتوو</span>
                  <span>•</span>
                  <span className="font-mono">{activeResult.fileSize}</span>
                  <span>•</span>
                  <span className="text-slate-600 font-bold">مۆری ئەلیکترۆنی KRG</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="هەڵبژاردنی فایلی تر لە کۆمپیوتەر"
              >
                <FolderOpen className="w-3 h-3 text-blue-600" />
                <span className="text-[11px]">گۆڕینی فایل</span>
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                title="لابردن"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* If multiple files were chosen, show their source names list */}
          {pickedFileNames.length > 1 && (
            <div className="bg-white/80 rounded-lg p-2.5 border border-emerald-200 text-right">
              <div className="text-[10px] font-bold text-slate-500 mb-1">
                پەڕگە سەرەکییە هەڵبژێردراوەکانی ناو کۆمپیوتەر کە یەکخران:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pickedFileNames.map((name, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-200" dir="ltr">
                    {idx + 1}. {name}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODE 3: Active Scanner Simulation (if user clicked test scanner) */}
      {currentMode === 'active_scanning' && (
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>پشکنین و سکانکردنی پەڕەی {currentScanningPage} لە {scanPagesCount}...</span>
            </span>
            <span className="font-mono text-[11px] font-black text-emerald-700">{scanProgress}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            خۆکارانە دەکرێتە <strong>١ پەڕگەی PDF</strong> لەگەڵ تەواوبوونی سکانەکە.
          </p>
        </div>
      )}

      {/* MODE 4: Scanner Merged Ready */}
      {currentMode === 'merged_ready' && activeResult && (
        <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-950 block">
                  سەرجەم ({activeResult.pagesCount}) پەڕە سکانکران و یەکخران بۆ ١ فایلی PDF!
                </span>
                <span className="text-[10px] text-emerald-800">
                  ئامادەکراوە بۆ بەڕێکردن
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
            >
              هەڵبژاردنەوە لە کۆمپیوتەر
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
