import React from 'react';
import { ActiveTab } from '../types';
import { AGPAII_LOGO_URL, UIN_LOGO_URL, DRIVE_MODUL_URL } from '../data/diklatData';
import { Shield, Sparkles, UserCheck, FolderOpen, ExternalLink } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isAdminMode: boolean;
  onToggleAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isAdminMode,
  onToggleAdmin,
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
            <button
              onClick={() => onTabChange('rekap')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'rekap'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Rekapitulasi
            </button>
            <button
              onClick={() => onTabChange('cek-mandiri')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'cek-mandiri'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700'
                  : ''
              }`}
            >
              Cek Progres Mandiri
            </button>
          </nav>

          {/* Zone 3: Modul Drive Link & Admin Mode Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={DRIVE_MODUL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors whitespace-nowrap shrink-0"
              title="Buka Folder Google Drive Modul dan Bahan Ajar PPT"
            >
              <FolderOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Modul & PPT (Drive)</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>

            <button
              onClick={onToggleAdmin}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isAdminMode
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdminMode ? 'Mode Panitia (Aktif)' : 'Panel Panitia'}</span>
            </button>
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
          <button
            onClick={() => onTabChange('rekap')}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'rekap' ? 'bg-emerald-800 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Rekap
          </button>
          <button
            onClick={() => onTabChange('cek-mandiri')}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'cek-mandiri' ? 'bg-emerald-800 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Cek Mandiri
          </button>
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
