import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Search, 
  Barcode, 
  LogOut, 
  ChevronRight, 
  ChevronLeft, 
  Building, 
  Inbox, 
  Layers, 
  Archive, 
  FileCheck2, 
  Menu, 
  X, 
  User, 
  ShieldCheck, 
  CheckCircle2,
  Volume2,
  VolumeX,
  FileSearch
} from 'lucide-react';
import { WorkspaceView, UserAccount } from '../types';
import { GOVERNMENT_ROOMS, USER_ACCOUNTS } from '../data/initialData';
import { isAudioFeedbackEnabled, toggleAudioFeedback, playSound } from '../utils/audioFeedback';

interface TopNavbarProps {
  currentWorkspace: WorkspaceView;
  currentUser: UserAccount | null;
  onSelectWorkspace: (workspace: WorkspaceView) => void;
  onOpenBarcodeScanner: () => void;
  onOpenCitizenTracking?: () => void;
  onOpenBatchManifest?: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeQueueCount?: number;
  pendingArrivalCount?: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentWorkspace,
  currentUser,
  onSelectWorkspace,
  onOpenBarcodeScanner,
  onOpenCitizenTracking,
  onOpenBatchManifest,
  onLogout,
  searchQuery,
  onSearchChange,
  activeQueueCount = 0,
  pendingArrivalCount = 0,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() => isAudioFeedbackEnabled());
  const navScrollRef = useRef<HTMLDivElement>(null);

  const handleToggleAudio = () => {
    const next = toggleAudioFeedback();
    setAudioEnabled(next);
    if (next) {
      playSound('scan_beep');
    }
  };

  const safeUser = currentUser || USER_ACCOUNTS[0];
  const activeRoom = GOVERNMENT_ROOMS.find(r => r.id === currentWorkspace) || GOVERNMENT_ROOMS[0];
  const isAdmin = safeUser?.role === 'admin';

  // Requirement 2: Except for admins, non-admin users should only see their assigned room in navigation bar
  const visibleRooms = isAdmin 
    ? GOVERNMENT_ROOMS.slice(0, 5) 
    : GOVERNMENT_ROOMS.filter(r => r.id === safeUser.assignedRoomId);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      navScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getRoomIcon = (roomId: string) => {
    switch (roomId) {
      case 'room1':
        return <Building className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
      case 'room2':
        return <Inbox className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
      case 'room3':
        return <Layers className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
      case 'room4':
        return <Archive className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />;
      case 'room5':
        return <FileCheck2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />;
      default:
        return <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md flex flex-col w-full" dir="rtl">
      
      {/* 1. Main Navigation Bar (Flexbox layout) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between py-2.5 sm:py-3.5 gap-2.5 lg:gap-3 min-w-0">
          
          {/* Top Flex Row: Logo & Identity + Mobile Action Triggers */}
          <div className="flex items-center justify-between w-full xl:w-auto gap-3 flex-shrink-0">
            
            {/* Right: Government Emblem + Title */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="bg-emerald-500 p-2 sm:p-2.5 rounded-xl flex-shrink-0 text-white shadow-sm flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0 text-right">
                <h1 className="text-xs sm:text-sm md:text-base font-black leading-tight text-white whitespace-normal">
                  سیستەمی چاودێری و گەیاندنی بەڵگەنامە فەرمییەکان
                </h1>
                <p className="text-[10px] sm:text-xs text-emerald-400 font-medium mt-1 leading-normal whitespace-normal">
                  حکومەتی هەرێمی کوردستان • دەستەی باڵای بەڕێوەبردنی دۆسیەکان
                </p>
              </div>
            </div>

            {/* Mobile Controls (Visible only on small screens) */}
            <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
              {/* Mobile Citizen Tracking */}
              {onOpenCitizenTracking && (
                <button
                  type="button"
                  onClick={onOpenCitizenTracking}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="بەدواداچوونی هاوڵاتی"
                  aria-label="Citizen Tracking"
                >
                  <FileSearch className="w-4 h-4 text-amber-400" />
                </button>
              )}

              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="گەڕان"
                aria-label="Toggle Search"
              >
                {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>

              {/* Mobile Barcode Scanner Trigger */}
              <button
                type="button"
                onClick={onOpenBarcodeScanner}
                className="p-2 rounded-xl bg-emerald-600 text-white min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm"
                title="پشکنینی بارکۆد"
                aria-label="Barcode Scanner"
              >
                <Barcode className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Desktop Tools & Actions: Fully flexible, wrapping naturally */}
          <div className="hidden md:flex flex-wrap items-center gap-2 lg:gap-2.5 min-w-0 justify-start xl:justify-end">
            
            {/* Active Workstation Identity Chip */}
            <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-200 flex-shrink-0 max-w-[200px] lg:max-w-[240px] xl:max-w-[270px] min-w-0 whitespace-nowrap overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
              <span className="text-emerald-400 truncate max-w-[130px] lg:max-w-[170px] xl:max-w-[200px] block text-xs" title={activeRoom.nameKu}>{activeRoom.nameKu}</span>
              {isAdmin && (
                <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded border border-amber-400/30 flex-shrink-0 whitespace-nowrap">
                  ئەدمین
                </span>
              )}
            </div>

            {/* Desktop Search Bar */}
            <div className="relative flex-shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="گەڕان بەپێی کۆد، ناوی هاوڵاتی، بارکۆد..."
                className="bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-4 py-1.5 text-xs sm:text-sm w-36 lg:w-44 xl:w-52 2xl:w-60 focus:w-48 lg:focus:w-56 xl:focus:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-200 placeholder-slate-400 transition-all text-right"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white font-bold"
                >
                  سڕینەوە
                </button>
              )}
            </div>

            {/* Citizen Public Tracking Trigger */}
            {onOpenCitizenTracking && (
              <button
                type="button"
                onClick={onOpenCitizenTracking}
                className="px-2.5 lg:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                title="بەدواداچوونی ڕێڕەوی دۆسیەی هاوڵاتی بەپێی بارکۆد"
              >
                <FileSearch className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="whitespace-nowrap">بەدواداچوونی هاوڵاتی</span>
              </button>
            )}

            {/* Batch Dispatch Manifest Trigger */}
            {onOpenBatchManifest && (
              <button
                type="button"
                onClick={onOpenBatchManifest}
                className="px-2.5 lg:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                title="دەرکردنی مەنەفێستی گەیاندنی بەکۆمەڵی دۆسیەکان"
              >
                <Layers className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="whitespace-nowrap">مەنەفێستی گەیاندن</span>
              </button>
            )}

            {/* Barcode Scanner Button */}
            <button
              onClick={onOpenBarcodeScanner}
              className="px-2.5 lg:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer flex-shrink-0 whitespace-nowrap"
              title="پشکنینی بارکۆد"
            >
              <Barcode className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">پشکنینی بارکۆد</span>
            </button>

            {/* Audio Feedback Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer flex-shrink-0 ${
                audioEnabled
                  ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
              title={audioEnabled ? 'دەنگی سکانەر: چالاکە (کرتە بکە بۆ بێدەنگکردن)' : 'دەنگی سکانەر: بێدەنگە (کرتە بکە بۆ چالاککردن)'}
              aria-label="Toggle Sound"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-2.5 flex-shrink-0 min-w-0">
              <div 
                className="w-8 h-8 rounded-xl bg-emerald-700 border border-emerald-500 flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                title={`${safeUser.nameKu} - ${safeUser.role}`}
              >
                {safeUser.avatarInitials}
              </div>
              <div className="flex flex-col text-right min-w-0 max-w-[120px] 2xl:max-w-[160px] overflow-hidden">
                <span className="text-xs font-bold text-slate-200 leading-tight truncate whitespace-nowrap block" title={safeUser.nameKu}>{safeUser.nameKu}</span>
                <span className="text-[10px] text-slate-400 truncate whitespace-nowrap block" title={safeUser.badgeTitleKu}>{safeUser.badgeTitleKu}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer flex items-center gap-1 py-1.5 px-2 rounded-xl hover:bg-rose-950/40 transition-colors flex-shrink-0 whitespace-nowrap"
                title="دەرچوون لە هەژمار"
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">دەرچوون</span>
              </button>
            </div>

          </div>

        </div>

        {/* Dedicated Mobile Search Bar (Collapsible on mobile) */}
        {mobileSearchOpen && (
          <div className="md:hidden py-2 pb-3 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="گەڕان بەپێی کۆد، ناوی هاوڵاتی، بارکۆد..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-4 py-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right min-h-[44px]"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold"
                >
                  سڕینەوە
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 2. Room Navigation Flex Bar */}
      <div className="bg-slate-800/95 border-b border-slate-850 px-2 sm:px-4 lg:px-8 py-2 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Scroll Controls + Room Tabs (Flexbox) */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            
            {/* Scroll Right (RTL right navigation) for admin view */}
            {isAdmin && visibleRooms.length > 3 && (
              <button
                onClick={() => scrollNav('right')}
                className="p-1.5 rounded-lg bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 flex-shrink-0 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="بەرەو پێشەوە"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Room Tabs Flex Row */}
            <div 
              ref={navScrollRef}
              className="flex items-center gap-2 overflow-x-auto py-1 px-1 scroll-smooth touch-pan-x flex-1 min-w-0"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#475569 transparent'
              }}
            >
              {/* If non-admin: Only show their assigned room as per Requirement 2 */}
              {visibleRooms.map((room) => {
                const isActive = currentWorkspace === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => onSelectWorkspace(room.id as WorkspaceView)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap flex-shrink-0 transition-all cursor-pointer min-h-[40px] ${
                      isActive
                        ? 'bg-slate-950 text-emerald-400 shadow-md border border-emerald-500/50 ring-1 ring-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {getRoomIcon(room.id)}
                    <span>{room.nameKu}</span>
                    
                    {!isAdmin && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ژووری سپێردراو بە ئێوە</span>
                      </span>
                    )}

                    {room.id === 'room3' && activeQueueCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-blue-900/80 text-blue-200 text-[10px] rounded-full border border-blue-400/30">
                        {activeQueueCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scroll Left (RTL left navigation) for admin view */}
            {isAdmin && visibleRooms.length > 3 && (
              <button
                onClick={() => scrollNav('left')}
                className="p-1.5 rounded-lg bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 flex-shrink-0 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="بەرەو دواوە"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Mobile Logout (Visible on small screens) */}
          <div className="flex md:hidden items-center flex-shrink-0">
            <button
              onClick={onLogout}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold p-2 rounded-xl bg-slate-900 border border-slate-700 min-h-[40px] flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>دەرچوون</span>
            </button>
          </div>

          {/* System Network status info (Desktop only) */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 font-mono flex-shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>GovLAN-KRG-Secure</span>
            <span className="text-slate-600">|</span>
            <span>{new Date().toLocaleDateString('ku-IQ', { day: '2-digit', month: 'short', year: 'numeric' }) || new Date().toLocaleDateString('en-GB')}</span>
          </div>

        </div>
      </div>

    </header>
  );
};
