import React, { useState } from 'react';
import {
  Video,
  ExternalLink,
  Copy,
  Check,
  X,
  Calendar,
  ShieldCheck,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ZOOM_CONFIG, DIKLAT_INFO } from '../data/diklatData';

interface ZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({ isOpen, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white shadow-inner">
              <Video className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-100 border border-blue-400/30">
                  Sinkronus 120 JP
                </span>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Ruang Aktif
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                Ruang Zoom Utama Pelatihan
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors relative z-10"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Validity Callout */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-start gap-3 text-xs text-blue-950">
            <Calendar className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block text-blue-900">
                Berlaku untuk Seluruh Sesi Pelatihan
              </span>
              <p className="text-blue-800/90 mt-0.5 leading-relaxed">
                Tautan dan ID Zoom ini digunakan untuk seluruh rangkaian kegiatan diklat (mulai dari Pembukaan Resmi, seluruh Sesi Teori Pemateri, hingga Penutupan Resmi 19 - 29 Oktober 2026).
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <a
            href={ZOOM_CONFIG.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Video className="w-4 h-4" />
            <span>Masuk / Gabung Zoom Meeting Sekarang</span>
            <ExternalLink className="w-4 h-4 text-blue-200" />
          </a>

          {/* Credentials Card (Meeting ID & Passcode) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                Kredensial Akses Aplikasi Zoom
              </span>
              <span className="text-[11px] font-mono text-slate-500">Pola 120 JP</span>
            </div>

            {/* Meeting ID */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Meeting ID
                </span>
                <span className="text-lg font-mono font-extrabold text-slate-900 tracking-wider">
                  {ZOOM_CONFIG.meetingId}
                </span>
              </div>
              <button
                onClick={() => handleCopy(ZOOM_CONFIG.meetingIdRaw, 'id')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                  copiedField === 'id'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                {copiedField === 'id' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin ID
                  </>
                )}
              </button>
            </div>

            {/* Passcode */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Passcode
                </span>
                <span className="text-lg font-mono font-extrabold text-blue-700 tracking-widest">
                  {ZOOM_CONFIG.passcode}
                </span>
              </div>
              <button
                onClick={() => handleCopy(ZOOM_CONFIG.passcode, 'passcode')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                  copiedField === 'passcode'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                {copiedField === 'passcode' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Passcode
                  </>
                )}
              </button>
            </div>

            {/* Direct Link */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[11px] font-medium text-slate-500">Tautan Langsung (Direct Link):</span>
                <button
                  onClick={() => handleCopy(ZOOM_CONFIG.joinUrl, 'link')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  {copiedField === 'link' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" /> Tautan Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Salin Tautan
                    </>
                  )}
                </button>
              </div>
              <div className="p-2 bg-slate-100 rounded text-[11px] font-mono text-slate-600 truncate border border-slate-200 select-all">
                {ZOOM_CONFIG.joinUrl}
              </div>
            </div>
          </div>

          {/* Tata Tertib Singkat Zoom */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Petunjuk & Tata Tertib Peserta di Ruang Zoom:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-600">
              <li>Gunakan format nama akun Zoom: <b>Nama Lengkap - Asal Instansi</b> (contoh: <i>Anita Ningrum - SMPN 13 Madiun</i>).</li>
              <li>Bergabunglah 10–15 menit sebelum sesi materi dimulai.</li>
              <li>Wajib menyalakan kamera video (On-Camera) selama sesi sinkronus berlangsung.</li>
              <li>Pastikan mikrofon dalam posisi <b>Mute</b> kecuali saat dipersilakan bertanya/berpendapat.</li>
            </ul>
          </div>

          {/* Footer Close */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
