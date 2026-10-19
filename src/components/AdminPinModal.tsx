import React, { useState } from 'react';
import { Shield, Lock, X, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';
import { googleSignIn } from '../services/googleAuth';
import { User } from 'firebase/auth';

export const OWNER_EMAIL = 'pembelajaranulfa@gmail.com';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onGoogleAuthSuccess?: (user: User, token: string) => void;
}

// Secret fallback passcodes (strictly confidential - never exposed in UI)
const SECRET_ADMIN_PINS = ['ulfa2026', 'agpaii2026', 'panitia120jp'];

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onGoogleAuthSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  if (!isOpen) return null;

  // 1. Google Sign-In with Owner Account (pembelajaranulfa@gmail.com)
  const handleGoogleSignInOwner = async () => {
    setIsLoggingInGoogle(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        const userEmail = res.user.email?.toLowerCase().trim();
        if (userEmail === OWNER_EMAIL.toLowerCase()) {
          if (onGoogleAuthSuccess) {
            onGoogleAuthSuccess(res.user, res.accessToken);
          }
          onSuccess();
          onClose();
        } else {
          setError(
            `Akses Ditolak: Akun "${res.user.email}" bukan pemilik website. Akses panitia hanya untuk ${OWNER_EMAIL}.`
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal login dengan akun Google');
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  // 2. Secret PIN Fallback
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pin.trim().toLowerCase();
    const customPin = localStorage.getItem('diklat_perpus_custom_pin')?.toLowerCase();
    const isMatch = (customPin && entered === customPin) || SECRET_ADMIN_PINS.includes(entered);

    if (isMatch) {
      setError(null);
      setPin('');
      onSuccess();
      onClose();
    } else {
      setError('Sandi atau PIN salah. Akses ini dikhususkan untuk pengelola diklat.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Akses Khusus Pemilik &amp; Panitia</h3>
              <p className="text-[11px] text-emerald-300 font-mono">{OWNER_EMAIL}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(null);
              setPin('');
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            Akses penilaian tugas, pengelolaan peserta, dan konfigurasi spreadsheet hanya diperuntukkan bagi pemilik akun <b>{OWNER_EMAIL}</b>.
          </div>

          {/* Primary Action: 1-Click Google Sign-In with Owner Email */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Metode Utama (Rekomendasi):
            </label>
            <button
              type="button"
              onClick={handleGoogleSignInOwner}
              disabled={isLoggingInGoogle}
              className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border-2 border-emerald-600 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>{isLoggingInGoogle ? 'Memverifikasi Akun...' : 'Masuk dengan Akun Google'}</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              Login langsung sebagai <b>{OWNER_EMAIL}</b>
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400">
              atau gunakan sandi
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Secondary Option: Secret Passcode */}
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sandi Rahasia Pemilik:
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setPin('');
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!pin.trim()}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                Buka Panel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
