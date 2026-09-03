import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  KeyRound,
  AlertCircle,
  Layers,
  Building,
  BadgeCheck,
  Zap
} from 'lucide-react';
import { UserAccount } from '../types';
import { USER_ACCOUNTS } from '../data/initialData';

interface LoginPageProps {
  onLogin: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const foundUser = USER_ACCOUNTS.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim()
      );

      if (foundUser) {
        onLogin(foundUser);
      } else {
        setErrorMessage('ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە. تکایە دووبارە هەوڵبدەرەوە.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (account: UserAccount) => {
    setUsername(account.username);
    setPassword(account.password || '');
    setIsLoading(true);
    setTimeout(() => {
      onLogin(account);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden" dir="rtl">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              حکومەتی هەرێمی کوردستان • سیستەمی بەڵگەنامە فەرمییەکان
            </h1>
            <p className="text-[11px] text-slate-400">
              Institutional Document Management & Room Tracking System
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>تۆڕی پارێزراوی GovLAN • پشکنینی ئاسایش چالاکە</span>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Main Form Column */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Form Title & Subtitle */}
            <div className="space-y-1 text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                دەروازەی چوونەژوورەوەی فەرمانبەران
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                چوونەژوورەوە بۆ سیستەم
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                تکایە ناوی بەکارهێنەر و وشەی تێپەڕی فەرمانبەر یان بەڕێوەبەر داخڵ بکە.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  ناوی بەکارهێنەر (Username)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="نموونە: karwan یان admin"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  وشەی تێپەڕ (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-10 pl-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>چوونەژوورەوەی پارێزراو</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-800 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>پابەندە بە ستانداردەکانی ئاسایشی دەزگای حکومەتی هەرێم</span>
            </div>
          </div>

          {/* Right Column: Fast Demo Credentials & Role Switcher */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-right">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">
                    هەڵبژاردنی خێرا (Demo Accounts)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">کلیک بکە بۆ چوونەژوورەوەی ڕاستەوخۆ</span>
              </div>

              <div className="space-y-2.5">
                
                {/* 1. Room 1: Director General / Admin */}
                <div 
                  onClick={() => handleQuickLogin(USER_ACCOUNTS[0])}
                  className="group p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 hover:border-amber-400 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                      {USER_ACCOUNTS[0].avatarInitials}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white group-hover:text-amber-400">
                        <span>{USER_ACCOUNTS[0].nameKu}</span>
                        <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                          ژووری ١ (ئەدمین)
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        User: <span className="text-amber-300 font-bold">admin</span> • Pass: <span className="text-slate-300">admin123</span>
                      </div>
                    </div>
                  </div>
                  <BadgeCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                </div>

                {/* 2. Room 2: Intake Desk (Rebwar K.) */}
                <div 
                  onClick={() => handleQuickLogin(USER_ACCOUNTS[1])}
                  className="group p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {USER_ACCOUNTS[1].avatarInitials}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400">
                        <span>{USER_ACCOUNTS[1].nameKu}</span>
                        <span className="text-slate-400 text-xs mr-2 font-normal">(ژووری ٢: وەرگرتن)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        User: <span className="text-emerald-300 font-bold">rebwar</span> • Pass: <span className="text-slate-300">intake2</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-emerald-400">ژووری ٢</span>
                </div>

                {/* 3. Room 3: Master Plan Department (Karwan A.) */}
                <div 
                  onClick={() => handleQuickLogin(USER_ACCOUNTS[2])}
                  className="group p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {USER_ACCOUNTS[2].avatarInitials}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-400">
                        <span>{USER_ACCOUNTS[2].nameKu}</span>
                        <span className="text-slate-400 text-xs mr-2 font-normal">(ژووری ٣: نەخشەی بنەڕەتی)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        User: <span className="text-blue-300 font-bold">karwan</span> • Pass: <span className="text-slate-300">legal3</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-blue-400">ژووری ٣</span>
                </div>

                {/* 4. Room 4: Company Vault (Chinar M.) */}
                <div 
                  onClick={() => handleQuickLogin(USER_ACCOUNTS[3])}
                  className="group p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {USER_ACCOUNTS[3].avatarInitials}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-sm text-white group-hover:text-purple-400">
                        <span>{USER_ACCOUNTS[3].nameKu}</span>
                        <span className="text-slate-400 text-xs mr-2 font-normal">(ژووری ٤: ئەرشیف)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        User: <span className="text-purple-300 font-bold">chinar</span> • Pass: <span className="text-slate-300">archive4</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-purple-400">ژووری ٤</span>
                </div>

                {/* 5. Room 5: Audit & Tax (Diyar S.) */}
                <div 
                  onClick={() => handleQuickLogin(USER_ACCOUNTS[4])}
                  className="group p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {USER_ACCOUNTS[4]?.avatarInitials || 'د.س'}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-400">
                        <span>{USER_ACCOUNTS[4]?.nameKu || 'دیار سەردار مەحمود'}</span>
                        <span className="text-slate-400 text-xs mr-2 font-normal">(ژووری ٥: وردبینی دارایی)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        User: <span className="text-cyan-300 font-bold">diyar</span> • Pass: <span className="text-slate-300">tax5</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-cyan-400">ژووری ٥</span>
                </div>

              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 text-right space-y-1">
              <div className="font-bold text-slate-200">تێبینی گرنگ لەسەر دەسەڵاتەکان:</div>
              <p>• بەڕێوەبەری گشتی (Admin) دەتوانێت لە نێوان گشت ژوورەکاندا هاتوچۆ بکات و تەواوی مامەڵەکان ببینێت.</p>
              <p>• فەرمانبەرانی ژوورەکان ڕاستەوخۆ دەبرێنە بەشی تایبەتی خۆیان.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        سیستەمی چاودێری و گەیاندنی بەڵگەنامە حکومییەکان • چاپی فەرمی ٢٠٢٦
      </footer>
    </div>
  );
};
