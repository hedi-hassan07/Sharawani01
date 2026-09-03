import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  ShieldCheck, 
  BadgeCheck, 
  CheckCircle2, 
  RotateCw, 
  Sparkles, 
  Copy, 
  Layers, 
  Clock, 
  FileCheck2, 
  UserCheck, 
  Lock, 
  Unlock,
  ChevronDown,
  Building,
  Radio,
  Share2
} from 'lucide-react';
import { RoomInfo, UserAccount, WorkspaceView } from '../types';
import { GOVERNMENT_ROOMS, USER_ACCOUNTS } from '../data/initialData';

interface WorkstationOfficerCardProps {
  activeRoom?: RoomInfo;
  currentUser?: UserAccount;
  onSelectRoom?: (roomId: WorkspaceView) => void;
  isAdmin?: boolean;
  todayProcessedCount?: number;
  activeQueueCount?: number;
}

export const WorkstationOfficerCard: React.FC<WorkstationOfficerCardProps> = ({
  activeRoom,
  currentUser,
  onSelectRoom,
  isAdmin = false,
  todayProcessedCount = 8,
  activeQueueCount = 4,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedExtension, setCopiedExtension] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  const safeRoom = activeRoom || GOVERNMENT_ROOMS[0];
  const safeUser = currentUser || USER_ACCOUNTS[0];

  const handleCopyExtension = () => {
    navigator.clipboard?.writeText(safeRoom.phoneExtension || '1042');
    setCopiedExtension(true);
    setTimeout(() => setCopiedExtension(false), 2500);
  };

  return (
    <div className={`relative bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${showRoomDropdown ? 'z-30' : 'z-20'}`}>
      
      {/* Top Gradient Ribbon / Institutional Header */}
      <div className="h-2.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 w-full rounded-t-2xl" />

      <div className="p-4 sm:p-5">
        {!isFlipped ? (
          /* FRONT VIEW: Officer & Room Identity Dossier */
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            
            {/* Left/Main Column: Officer Avatar & Room Information */}
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              {/* Badge Avatar with Shift Status */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md border-2 border-white ring-2 ring-slate-200">
                  {safeUser.avatarInitials || 'ک.ع'}
                </div>
                <div 
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" 
                  title="لە کاتی دەوامدا چالاکە"
                >
                  <Radio className="w-2.5 h-2.5 text-white animate-pulse" />
                </div>
              </div>

              {/* Room & Officer Details */}
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold tracking-tight inline-flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    {safeRoom.roomCode}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold inline-flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-blue-600" />
                    {safeRoom.badgeKu || safeRoom.badge}
                  </span>

                  {isAdmin && (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold inline-flex items-center gap-1">
                      <Unlock className="w-3 h-3 text-amber-600" />
                      دەسەڵاتی بەڕێوەبەری گشتی (All Rooms)
                    </span>
                  )}
                </div>

                {/* Room Title in Kurdish Sorani */}
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{safeRoom.nameKu || safeRoom.name}</span>
                </h2>

                {/* Officer & Directorate metadata */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ئەفسەری بەرپرس: <span className="text-emerald-700 font-bold">{safeRoom.leadOfficerKu || safeRoom.leadOfficer}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">{safeRoom.departmentKu || safeRoom.department}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Utilities, Phone Extension, Room Switcher, Card Flip */}
            <div className="flex flex-wrap items-center gap-2.5 lg:justify-end border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
              
              {/* Interactive Phone Extension with 1-click Copy */}
              <button
                onClick={handleCopyExtension}
                title="ژمارەی ناوخۆ کۆپی بکە"
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  copiedExtension 
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' 
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{safeRoom.phoneExtension}</span>
                {copiedExtension ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {/* Room Switcher (For Admin or Authorized users) */}
              {isAdmin ? (
                <div className="relative z-30">
                  <button
                    onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>گۆڕینی ژوور</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showRoomDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowRoomDropdown(false)} 
                      />
                      <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-1 max-h-96 overflow-y-auto ring-1 ring-slate-900/10">
                        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          هەڵبژاردنی وێستگەی کار (بەڕێوەبەر)
                        </div>
                        {GOVERNMENT_ROOMS.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => {
                              onSelectRoom?.(room.id as WorkspaceView);
                              setShowRoomDropdown(false);
                            }}
                            className={`w-full text-right px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                              safeRoom.id === room.id
                                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-900">{room.roomCode}: {room.nameKu}</div>
                              <div className="text-[10px] text-slate-500">{room.leadOfficerKu} • {room.badgeKu}</div>
                            </div>
                            {safeRoom.id === room.id && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>تایبەت بە ژووری {safeRoom.roomCode}</span>
                </div>
              )}

              {/* Flip Card Button */}
              <button
                onClick={() => setIsFlipped(true)}
                title="بینینی دەسەڵاتە فەرمییەکان و ئەرکەکانی ئەمڕۆ"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* BACK VIEW: Responsibilities, Powers & Shift Statistics */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  دەسەڵاتە فەرمییەکان و ئەرکی {safeRoom.roomCode}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {safeRoom.descriptionKu || 'پەسەندکردنی یاسایی، وردبینی بەڵگەنامەکان و ڕێکخستنی هاتووچۆی فەرمی نێوان بەڕێوەبەرایەتییەکان.'}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  <Clock className="w-3 h-3 text-slate-500" /> کاتی دەوام: ٠٨:٣٠ تا ١٥:٠٠
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                  <FileCheck2 className="w-3 h-3 text-emerald-600" /> پەسەندکراوی ئەمڕۆ: {todayProcessedCount} دۆسیە
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                  <Layers className="w-3 h-3 text-blue-600" /> لە ڕیزدایە: {activeQueueCount} دۆسیە
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
              <button
                onClick={() => setIsFlipped(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>گەڕانەوە بۆ ناسنامە</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
