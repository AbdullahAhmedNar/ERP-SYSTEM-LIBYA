import { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../types';
import systemLogo from '../../imgaes/lib.ico';

export default function Login() {
  const { settings, users, setLoggedIn } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isDark = settings.theme === 'dark';

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const isMain =
        username === settings.username && password === settings.password;
      const otherUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (isMain || otherUser) {
        const role: UserRole = isMain ? 'admin' : (otherUser!.role || 'cashier');
        useStore.setState({
          currentUser: {
            id: isMain ? 'main-admin' : otherUser!.id,
            username,
            role,
          },
        });
        setLoggedIn(true);
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Top white section */}
      <div className="absolute inset-0 bg-white" />

      {/* Purple bottom with wavy top border */}
      <svg
        className="absolute inset-x-0 top-1/3 w-full h-2/3 text-[#875A7B]"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          d="M0,120 C160,60 320,180 480,120 C640,60 800,180 960,120 C1120,60 1280,180 1440,120 L1440,320 L0,320 Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative z-10 w-full max-w-md px-4 mx-auto flex flex-col justify-center min-h-screen">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl mb-4 border-2 ${
              isDark
                ? 'bg-white/5 border-white/40'
                : 'bg-white border-[#875A7B]/40'
            }`}
          >
            <img
              src={systemLogo}
              alt={settings.systemName}
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1
            className={`text-3xl font-black ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {settings.systemName}
          </h1>
          <p
            className={`mt-1 text-sm font-semibold ${
              isDark ? 'text-purple-100' : 'text-gray-900'
            }`}
          >
            PowerCore ERP
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">تسجيل الدخول</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1.5">اسم المستخدم</label>
              <div className="relative">
                <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin أو مستخدم آخر"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-transparent border border-gray-300 dark:border-slate-500 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-200 text-sm focus:outline-none focus:border-[#875A7B] focus:ring-1 focus:ring-[#875A7B]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full pr-10 pl-10 py-2.5 bg-white dark:bg-transparent border border-gray-300 dark:border-slate-500 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-200 text-sm focus:outline-none focus:border-[#875A7B] focus:ring-1 focus:ring-[#875A7B]/40 transition-all"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !username || !password}
              className="w-full py-2.5 bg-[#875A7B] hover:bg-[#6C4A6A] text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </span>
              ) : (
                'دخول'
              )}
            </button>
          </div>

        </div>
        <div className="mt-8 text-center text-xs text-purple-100 font-semibold space-y-1">
          <p>۞ ﴿ وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ ﴾ ۞</p>
          <p className="text-[11px] text-purple-200">
            @ جميع الحقوق محفوظة للمهندس عبدالله أحمد نار 2026
          </p>
        </div>
      </div>
    </div>
  );
}

