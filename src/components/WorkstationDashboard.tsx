import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  AlertTriangle, 
  Search, 
  Filter, 
  Send, 
  Eye, 
  Check, 
  Barcode, 
  Building, 
  CornerDownLeft,
  ShieldAlert,
  Sparkles,
  Inbox,
  Layers,
  Building2,
  FileCheck,
  ShieldCheck,
  Edit3,
  Printer
} from 'lucide-react';
import { DocumentItem, UrgencyTag, DocumentStatus, RoomInfo, UserAccount, WorkspaceView } from '../types';
import { WorkstationOfficerCard } from './WorkstationOfficerCard';
import { USER_ACCOUNTS, GOVERNMENT_ROOMS } from '../data/initialData';
import { playSound } from '../utils/audioFeedback';

interface WorkstationDashboardProps {
  documents: DocumentItem[];
  onOpenProcessModal: (doc: DocumentItem) => void;
  onOpenCreateModal: () => void;
  onConfirmPhysicalReceipt: (docId: string) => void;
  onQuickRouteModal: (doc: DocumentItem) => void;
  onEditSentRouting?: (doc: DocumentItem) => void;
  onOpenPrintSlip?: (doc: DocumentItem) => void;
  onOpenBatchManifest?: () => void;
  searchQuery: string;
  currentUser?: UserAccount;
  activeRoom?: RoomInfo;
  onSelectRoom?: (roomId: WorkspaceView) => void;
}

type TabFilter = 'all' | 'pending' | 'active' | 'completed';

export const WorkstationDashboard: React.FC<WorkstationDashboardProps> = ({
  documents,
  onOpenProcessModal,
  onOpenCreateModal,
  onConfirmPhysicalReceipt,
  onQuickRouteModal,
  onEditSentRouting,
  onOpenPrintSlip,
  onOpenBatchManifest,
  searchQuery,
  currentUser,
  activeRoom,
  onSelectRoom,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('active');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | UrgencyTag>('all');
  const [localSearch, setLocalSearch] = useState('');

  const effectiveUser = currentUser || USER_ACCOUNTS[0];
  const effectiveRoom = activeRoom || GOVERNMENT_ROOMS[0];
  const isAdmin = effectiveUser?.role === 'admin';
  const currentRoomIdentifier = effectiveRoom?.roomCode?.replace(/\D/g, '') || '1';

  // Calculate counts for Header Action Bar buttons
  const counts = useMemo(() => {
    const relevantDocs = isAdmin 
      ? documents 
      : documents.filter(d => d.currentRoom.includes(currentRoomIdentifier) || d.destinationRoom?.includes(currentRoomIdentifier) || d.fromRoom.includes(currentRoomIdentifier));
    
    return {
      all: relevantDocs.length,
      pending: relevantDocs.filter(d => !d.physicalReceived || d.status === 'Pending Receipt').length,
      active: relevantDocs.filter(d => d.physicalReceived && d.status === 'In Review').length,
      completed: relevantDocs.filter(d => d.status === 'Completed').length,
    };
  }, [documents, isAdmin, currentRoomIdentifier]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    const query = (searchQuery || localSearch).trim().toLowerCase();

    return documents.filter(doc => {
      // Role filtering: Admin sees all, employee sees relevant to their room or completed
      if (!isAdmin) {
        const isRelevant = doc.currentRoom.includes(currentRoomIdentifier) || 
                           doc.destinationRoom?.includes(currentRoomIdentifier) || 
                           doc.fromRoom.includes(currentRoomIdentifier) || 
                           doc.status === 'Completed';
        if (!isRelevant) return false;
      }

      // Tab Filtering
      if (activeTab === 'pending') {
        if (doc.physicalReceived && doc.status !== 'Pending Receipt') return false;
      } else if (activeTab === 'active') {
        if (!doc.physicalReceived || doc.status !== 'In Review') return false;
      } else if (activeTab === 'completed') {
        if (doc.status !== 'Completed') return false;
      }

      // Urgency filter
      if (urgencyFilter !== 'all' && doc.urgency !== urgencyFilter) {
        return false;
      }

      // Search query filter
      if (query) {
        const matchesId = doc.id.toLowerCase().includes(query);
        const matchesCitizen = doc.citizenName.toLowerCase().includes(query) || (doc.citizenNameAr && doc.citizenNameAr.toLowerCase().includes(query));
        const matchesBarcode = doc.barcode.toLowerCase().includes(query);
        const matchesFrom = doc.fromRoom.toLowerCase().includes(query);
        const matchesType = doc.documentType.toLowerCase().includes(query);
        if (!matchesId && !matchesCitizen && !matchesBarcode && !matchesFrom && !matchesType) {
          return false;
        }
      }

      return true;
    });
  }, [documents, activeTab, urgencyFilter, searchQuery, localSearch, isAdmin, currentRoomIdentifier]);

  return (
    <div className="space-y-5 text-right" dir="rtl">
      
      {/* Dynamic, Flickable & Nicer Officer Identity Card */}
      <WorkstationOfficerCard
        activeRoom={effectiveRoom}
        currentUser={effectiveUser}
        isAdmin={isAdmin}
        onSelectRoom={onSelectRoom}
        todayProcessedCount={counts.completed}
        activeQueueCount={counts.active}
      />

      {/* Main Action Bar & Create Document Button */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <span>سیستەمی چاودێری دۆسیەکان</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700 font-bold">{effectiveRoom.roomCode}: {effectiveRoom.nameKu}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ڕیزی بەڵگەنامە و دۆسیە فەرمییەکان
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            پەسەندکردنی فیزیکی، واژۆی ئەفسەری بەرپرس و گواستنەوەی نێوان ژوورەکان بە بارکۆدی فەرمی.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 relative z-0">
          {onOpenBatchManifest && (
            <button
              onClick={onOpenBatchManifest}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center gap-2"
              title="گەیاندنی بەکۆمەڵ یان وەرگرتنی بەکۆمەڵ بە مەنەفێستی فەرمی"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>مەنەفێستی گەیاندن</span>
            </button>
          )}

          <button
            id="workstation-create-doc-btn"
            onClick={onOpenCreateModal}
            className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-3.5 px-5 py-3 bg-slate-950 hover:bg-slate-900 active:bg-black text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-slate-900/20 transition-all cursor-pointer relative z-0 border border-slate-800 hover:border-emerald-500/50 group"
            title="دروستکردنی مامەڵەی نوێ لەگەڵ هاوپێچکردن لە کۆمپیوتەر یان سکانەری ڕاستەوخۆ"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/25 transition-all">
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-white font-black text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                  <span>+ دروستکردنی مامەڵەی نوێ</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">سکانەر و هاوپێچکردنی پەڕگەی کۆمپیوتەر</div>
              </div>
            </div>
            <div className="hidden xs:flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-md group-hover:border-emerald-400 transition-colors">
              <Printer className="w-3 h-3 text-emerald-400" />
              <span>سکانەر (PDF)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Metric KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Active Queue Metric */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-slate-500 font-bold">ڕیزی کارەکان (Active Queue)</div>
            <div className="text-2xl font-black text-slate-900">{counts.active}</div>
            <div className="text-[11px] text-blue-600 font-medium">لەژێر پێداچوونەوەدایە</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Arrival Metric */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-slate-500 font-bold">چاوەڕوانی گەیشتن (Pending Arrival)</div>
            <div className="text-2xl font-black text-slate-900">{counts.pending}</div>
            <div className="text-[11px] text-amber-600 font-medium">لە ڕێگەی گەیاندنی دەستیدایە</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Metric */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-slate-500 font-bold">تەواوکراوەکان (Completed)</div>
            <div className="text-2xl font-black text-slate-900">{counts.completed}</div>
            <div className="text-[11px] text-emerald-600 font-medium">پەسەندکراو لەلایەن بەڕێوەبەر</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Docket Metric */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs text-slate-500 font-bold">گشت دۆسیەکان (Total Docket)</div>
            <div className="text-2xl font-black text-slate-900">{counts.all}</div>
            <div className="text-[11px] text-slate-500 font-medium">تۆمارکراو لە سیستەمدا</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200">
            <Layers className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Header Action Bar & Status Filter Counters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Action & Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* 1. Active Queue */}
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>ڕیزی کارەکان (Active Queue)</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'active' ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {counts.active}
              </span>
            </button>

            {/* 2. Pending Arrival */}
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>چاوەڕوانی گەیشتن (Pending Arrival)</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'pending' ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {counts.pending}
              </span>
            </button>

            {/* 3. Completed */}
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>تەواوکراوەکان (Completed)</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'completed' ? 'bg-slate-800 text-emerald-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {counts.completed}
              </span>
            </button>

            {/* 4. All Documents */}
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span>گشت دۆسیەکان ({counts.all})</span>
            </button>
          </div>

          {/* Quick Urgency Tag Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              پلەی گرنگی:
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setUrgencyFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  urgencyFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                هەمووی
              </button>
              <button
                onClick={() => setUrgencyFilter('VIP')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-colors cursor-pointer ${
                  urgencyFilter === 'VIP' ? 'bg-red-600 text-white shadow-xs' : 'text-red-600 hover:text-red-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                بەپەلە (VIP)
              </button>
              <button
                onClick={() => setUrgencyFilter('Normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  urgencyFilter === 'Normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ئاسایی (Normal)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Data Table (Document Queue) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="font-bold text-slate-800 flex items-center text-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full ml-2"></span>
            خشتەی سەرەکیی بەڵگەنامەکان (Primary Document Queue)
            <span className="text-xs text-slate-500 font-normal mr-2">
              ({filteredDocuments.length} دۆسیە بەردەستە)
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>هاوکاتکردنی ڕاستەوخۆ (Live Data)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="sticky top-0 bg-white shadow-xs text-xs uppercase text-slate-400 font-bold border-b border-slate-100">
                <th className="py-3.5 px-4">کۆدی دۆسیە (Document ID)</th>
                <th className="py-3.5 px-4">ناوی هاوڵاتی (Citizen Name)</th>
                <th className="py-3.5 px-4">بەرواری وەرگرتن (Date)</th>
                <th className="py-3.5 px-4">پلەی گرنگی (Urgency)</th>
                <th className="py-3.5 px-4">لە ژووری (From Room)</th>
                <th className="py-3.5 px-4">دۆخ (Status)</th>
                <th className="py-3.5 px-4 text-left">کردارەکان (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <div className="font-bold text-slate-700 text-sm">هیچ دۆسیەیەک لەم بەشەدا نەدۆزرایەوە</div>
                    <div className="text-xs text-slate-400 mt-1">تکایە فلتەرەکان پاکبکەرەوە یان بڕۆ بۆ بەشێکی تر.</div>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const isVip = doc.urgency === 'VIP';
                  const isPending = !doc.physicalReceived || doc.status === 'Pending Receipt';
                  const isCompleted = doc.status === 'Completed';

                  return (
                    <tr 
                      key={doc.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isVip ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Document ID & Barcode */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                          {doc.id}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          <span>{doc.barcode}</span>
                        </div>
                      </td>

                      {/* Citizen Name (Kurdish/Arabic primary) */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {doc.citizenNameAr || doc.citizenName}
                        </div>
                        {doc.citizenNameAr && doc.citizenName && (
                          <div className="text-xs text-slate-500 font-sans mt-0.5" dir="ltr">
                            {doc.citizenName}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ژمارەی ناسنامە: {doc.citizenId} • <span className="text-emerald-700 font-semibold">{doc.documentType}</span>
                        </div>
                      </td>

                      {/* Date Received */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{doc.dateReceived.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-400">
                          {doc.dateReceived.split(' ').slice(1).join(' ')}
                        </div>
                      </td>

                      {/* Urgency Tag (Normal/VIP) */}
                      <td className="py-3.5 px-4">
                        {isVip ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-black uppercase tracking-wider border border-red-200">
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                            بەپەلە (VIP)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-200">
                            ئاسایی (Normal)
                          </span>
                        )}
                      </td>

                      {/* From Room */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-bold">{doc.fromRoom}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <CornerDownLeft className="w-2.5 h-2.5 text-slate-400" />
                          <span>وێستگەی ئێستا: {doc.currentRoom.split(':')[0]}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            تەواوکراوە
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            چاوەڕوانی گەیشتن
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold border border-blue-200">
                            <FileText className="w-3 h-3 text-blue-600" />
                            لە پێداچوونەوەدایە
                          </span>
                        )}
                      </td>

                      {/* Action Buttons in Table Row */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-start gap-1.5">
                          
                          {/* 1. Confirm Physical Receipt Button */}
                          {isPending && !isCompleted && (
                            <button
                              onClick={() => {
                                playSound('scan_beep');
                                onConfirmPhysicalReceipt(doc.id);
                              }}
                              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                              title="پشتڕاستکردنەوەی وەرگرتنی فۆڵدەری کاغەزی"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>پەسەندکردنی وەرگرتن</span>
                            </button>
                          )}

                          {/* Print Slip / Cover Button */}
                          {onOpenPrintSlip && (
                            <button
                              type="button"
                              onClick={() => onOpenPrintSlip(doc)}
                              className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-300 font-bold px-2.5 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                              title="چاپکردنی پسولەی هاوڵاتی یان بەرگی فۆڵدەری کاغەزی A4"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-700" />
                              <span className="hidden md:inline">چاپکردن</span>
                            </button>
                          )}

                          {/* 2. View/Process Button */}
                          <button
                            onClick={() => onOpenProcessModal(doc)}
                            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            title="کردنەوەی وردەکارییەکان، پشکنینی سکان و واژۆکردن"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>بینین / جێبەجێکردن</span>
                          </button>

                          {/* 3. Edit Sent / Re-route Button (To fix mistakes) */}
                          <button
                            type="button"
                            onClick={() => onEditSentRouting ? onEditSentRouting(doc) : onQuickRouteModal(doc)}
                            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            title="دەستکاریکردنی ناردن: ئەگەر هەڵەت کردووە لێرە دەستکاری بکە و بینێرەوە بۆ ژوورێکی تر"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>دەستکاریکردنی ناردن</span>
                          </button>

                          {/* 4. Route/Complete Button */}
                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => onQuickRouteModal(doc)}
                              className="bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                              title="ناردن بۆ ژووری تر یان تەواوکردنی فەرمی"
                            >
                              <Send className="w-3.5 h-3.5 text-slate-300" />
                              <span>ئاڕاستەکردن</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span>دۆسیەی بەپەلە (VIP): <strong className="text-red-600 font-bold">{filteredDocuments.filter(d => d.urgency === 'VIP').length}</strong></span>
            <span>وەرگیراوی فیزیکی: <strong className="text-emerald-600 font-bold">{filteredDocuments.filter(d => d.physicalReceived).length}</strong></span>
            <span>لە ڕێگەی گەیاندن: <strong className="text-amber-600 font-bold">{filteredDocuments.filter(d => !d.physicalReceived).length}</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            تۆماری فەرمی بەڵگەنامەکان • ستانداردی کاتیی SLA: کەمتر لە ٢٤ کاتژمێر
          </div>
        </div>
      </div>
    </div>
  );
};

