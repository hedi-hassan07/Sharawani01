import React from 'react';
import { 
  Building, 
  Building2, 
  FileText, 
  Map, 
  Archive, 
  Coins, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';
import { GOVERNMENT_ROOMS, USER_ACCOUNTS } from '../data/initialData';
import { WorkspaceView, UserAccount } from '../types';

interface BottomRoomManagerBarProps {
  currentWorkspace: WorkspaceView;
  currentUser: UserAccount | null;
  onSelectWorkspace: (room: WorkspaceView) => void;
  unreadCount?: number;
}

const roomIcons: Record<string, React.ReactNode> = {
  room1: <Building className="w-4 h-4 text-amber-500" />,
  room2: <FileText className="w-4 h-4 text-blue-500" />,
  room3: <Map className="w-4 h-4 text-emerald-500" />,
  room4: <Archive className="w-4 h-4 text-purple-500" />,
  room5: <Coins className="w-4 h-4 text-teal-500" />,
};

export const BottomRoomManagerBar: React.FC<BottomRoomManagerBarProps> = ({
  currentWorkspace,
  currentUser,
  onSelectWorkspace,
}) => {
  const safeUser = currentUser || USER_ACCOUNTS[0];
  const isAdmin = safeUser?.role === 'admin';

  return (
    <section className="bg-white border-t border-slate-200 shadow-lg mt-10 py-5 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-3.5">
        
        {/* Header flex row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <span>بەڕێوەبەری ژوورەکان و وێستگەکانی کار</span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    دەسەڵاتی تەواوی ئەدمین
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    ژووری دیاریکراو: {safeUser.name}
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500">
                هەڵبژاردن و ئاڵوگۆڕی خێرا لە نێوان بەشە فەرمییەکانی فەرمانگە
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-[11px]">ژووری چالاک:</span>
            <strong className="text-slate-900 font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
              {GOVERNMENT_ROOMS.find(r => r.id === currentWorkspace)?.nameKu || 'ژوور'}
            </strong>
          </div>
        </div>

        {/* Room Manager Selector Buttons (Flexbox layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {GOVERNMENT_ROOMS.slice(0, 5).map((room) => {
            const isActive = currentWorkspace === room.id;
            const isAssignedToUser = safeUser.assignedRoomId === room.id;
            const canAccess = isAdmin || isAssignedToUser;

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  if (canAccess) {
                    onSelectWorkspace(room.id as WorkspaceView);
                  }
                }}
                disabled={!canAccess}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-emerald-500/20'
                    : canAccess
                    ? 'bg-slate-50/80 hover:bg-slate-100/90 text-slate-800 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50/40 text-slate-400 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-slate-800' : 'bg-white border border-slate-200'
                  }`}>
                    {roomIcons[room.id] || <Building className="w-3.5 h-3.5" />}
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>چالاک</span>
                    </span>
                  ) : canAccess ? (
                    <span className="text-[10px] font-bold text-slate-500">
                      {isAssignedToUser ? 'ژووری ئێوە' : 'دەستگەیشتن'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      <span>داخراوە</span>
                    </span>
                  )}
                </div>

                <div>
                  <div className={`font-bold text-xs leading-snug ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {room.nameKu}
                  </div>
                  <div className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                    {room.purposeKu || room.descriptionKu || room.departmentKu}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
