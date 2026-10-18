import React, { useState } from 'react';
import { Shield, KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Default PIN Panitia: agpaii2026 (atau 123456)
export const DEFAULT_ADMIN_PINS = ['agpaii2026', '123456', 'panitia120jp'];

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pin.trim().toLowerCase();

    // Check if custom pin is saved in localStorage or matches defaults
    const customPin = localStorage.getItem('diklat_perpus_custom_pin')?.toLowerCase();
    const isMatch = (customPin && entered === customPin) || DEFAULT_ADMIN_PINS.includes(entered);

    if (isMatch) {
      setError(null);
      setPin('');
      onSuccess();
      onClose();
    } else {
      setError('PIN Panitia salah. Akses asesmen nilai dan edit data hanya untuk Panitia Diklat.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Verifikasi Akses Panitia</h3>
              <p className="text-[11px] text-slate-300">Proteksi hak akses penilaian & edit data</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            Halaman publik peserta disetel <b>tanpa akses edit</b> (hanya kirim presensi, kumpul tugas, dan cek mandiri).
            Masukkan PIN Panitia untuk membuka panel penilaian dan pengelolaan.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              PIN / Sandi Panitia
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="Masukkan PIN (default: agpaii2026)"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                {showPin ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              *PIN default panitia: <span className="font-mono font-bold text-emerald-800">agpaii2026</span>
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              Buka Akses Panitia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
