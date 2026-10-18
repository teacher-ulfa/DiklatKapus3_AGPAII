import React from 'react';
import { AGPAII_LOGO_URL, UIN_LOGO_URL, DIKLAT_INFO } from '../data/diklatData';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={AGPAII_LOGO_URL}
              alt="Logo AGPAII"
              referrerPolicy="no-referrer"
              className="h-8 w-auto object-contain"
            />
            <div className="h-4 w-px bg-slate-300" />
            <img
              src={UIN_LOGO_URL}
              alt="Logo UIN SATU Tulungagung"
              referrerPolicy="no-referrer"
              className="h-8 w-auto object-contain"
            />
            <div className="text-xs text-slate-600">
              <span className="font-semibold block text-slate-900">
                Diklat Kepala Perpustakaan Sekolah
              </span>
              <span>DPW AGPAII Jawa Timur & UPT Perpustakaan UIN Sayyid Ali Rahmatullah Tulungagung</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            <p>Pola 120 Jam Pelajaran (JP) Berstandar Nasional Perpustakaan (SNP)</p>
            <p className="mt-0.5">Kontak Panitia: {DIKLAT_INFO.contactPhone}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
