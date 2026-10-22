import React from 'react';
import { ActiveTab } from '../types';
import { AGPAII_LOGO_URL, UIN_LOGO_URL, DRIVE_MODUL_URL, ZOOM_CONFIG } from '../data/diklatData';
import { Shield, Sparkles, UserCheck, FolderOpen, ExternalLink, FileSpreadsheet, Video, Lock } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isAdminMode: boolean;
  currentUser?: User | null;
  onToggleAdmin: () => void;
  onOpenSpreadsheetModal: () => void;
  isSpreadsheetConnected: boolean;
  onOpenZoomModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isAdminMode,
  currentUser,
  onToggleAdmin,
  onOpenSpreadsheetModal,
  isSpreadsheetConnected,
  onOpenZoomModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Primary Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand & Logos */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <img
                src={AGPAII_LOGO_URL}
                alt="Logo AGPAII"
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain"
              />
              <div className="h-6 w-px bg-slate-300" />
              <img
                src={UIN_LOGO_URL}
                alt="Logo UIN Sayyid Ali Rahmatullah Tulungagung"
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                DIKLAT KEPALA PERPUSTAKAAN
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-none">
                DPW AGPAII JATIM · UIN SATU TULUNGAGUNG
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onTabChange('beranda')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'beranda'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => onTabChange('presensi')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'presensi'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Presensi Kehadiran
            </button>
            <button
              onClick={() => onTabChange('tugas')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'tugas'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Pengumpulan Tugas (8 Tugas)
            </button>
            {isAdminMode && (
              <button
                onClick={() => onTabChange('rekap')}
                className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                  activeTab === 'rekap'
                    ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700'
                    : ''
                }`}
              >
                Rekapitulasi Panitia
              </button>
            )}
            <button
              onClick={() => onTabChange('cek-mandiri')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'cek-mandiri'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              {isAdminMode ? 'Cek Progres Mandiri' : 'Rekap Progres Mandiri'}
            </button>
          </nav>

          {/* Zone 3: Zoom Meeting, Modul Drive Link, Google Sheets Sync & Admin Mode */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Zoom Meeting Trigger */}
            <button
              onClick={onOpenZoomModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap shadow-sm"
              title="Informasi & Tautan Zoom Meeting Diklat"
            >
              <Video className="w-3.5 h-3.5 text-blue-100" />
              <span className="hidden sm:inline">Zoom Meeting</span>
              <span className="sm:hidden">Zoom</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Ruang Zoom Aktif" />
            </button>

            {/* Google Sheets Trigger (Admin / Owner Only) */}
            {isAdminMode && (
              <button
                onClick={onOpenSpreadsheetModal}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap border shadow-sm ${
                  isSpreadsheetConnected
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
                title="Kelola Sinkronisasi Google Sheets"
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${isSpreadsheetConnected ? 'text-emerald-200' : 'text-emerald-600'}`} />
                <span className="hidden sm:inline">Spreadsheet</span>
                {isSpreadsheetConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" title="Terkoneksi" />
                )}
              </button>
            )}

            <a
              href={DRIVE_MODUL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors whitespace-nowrap shrink-0"
              title="Buka Folder Google Drive Modul dan Bahan Ajar PPT"
            >
              <FolderOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Modul & PPT</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>

            {isAdminMode ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold shadow-sm border border-emerald-700">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Foto Profil"
                    className="w-4 h-4 rounded-full border border-emerald-300"
                  />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-emerald-300" />
                )}
                <span className="hidden sm:inline font-bold">Pemilik Aktif</span>
                <button
                  onClick={onToggleAdmin}
                  className="ml-1 text-[10px] bg-emerald-950/80 hover:bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-200 font-bold"
                  title="Keluar dari Mode Pemilik"
                >
                  Keluar
                </button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs">
                {currentUser.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt="Foto Profil"
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span className="truncate max-w-[90px] text-[11px] hidden sm:inline">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={onToggleAdmin}
                  className="text-[10px] text-slate-500 hover:text-slate-800 ml-1"
                  title="Keluar"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={onToggleAdmin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-2xs"
                title="Masuk Akun Google"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center overflow-x-auto py-2.5 gap-2 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => onTabChange('beranda')}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'beranda' ? 'bg-emerald-800 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onTabChange('presensi')}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'presensi' ? 'bg-emerald-800 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Presensi
          </button>
          <button
            onClick={() => onTabChange('tugas')}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'tugas' ? 'bg-emerald-800 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Tugas
          </button>
          {isAdminMode && (
            <button
              onClick={() => onTabChange('rekap')}
              className={`px-3 py-1 text-xs rounded whitespace-nowrap ${
                activeTab === 'rekap' ? 'bg-emerald-800 text-white font-medium' : 'text-slate-600'
              }`}
            >
              Rekap Panitia
            </button>
          )}
          <button
            onClick={() => onTabChange('cek-mandiri')}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'cek-mandiri' ? 'bg-emerald-800 text-white font-medium' : 'text-slate-600'
            }`}
          >
            {isAdminMode ? 'Cek Mandiri' : 'Rekap Mandiri'}
          </button>
          <button
            onClick={onOpenZoomModal}
            className="px-2.5 py-1 text-xs rounded whitespace-nowrap bg-blue-600 text-white font-semibold flex items-center gap-1 shrink-0 shadow-xs"
          >
            <Video className="w-3 h-3 text-blue-100" /> Zoom
          </button>
          {isAdminMode && (
            <button
              onClick={onOpenSpreadsheetModal}
              className={`px-2.5 py-1 text-xs rounded whitespace-nowrap font-semibold border flex items-center gap-1 shrink-0 ${
                isSpreadsheetConnected
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3" /> Sheets
            </button>
          )}
          <a
            href={DRIVE_MODUL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-xs rounded whitespace-nowrap bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1 shrink-0"
          >
            <FolderOpen className="w-3 h-3 text-emerald-700" /> Modul & PPT
          </a>
        </div>
      </div>
    </header>
  );
};
