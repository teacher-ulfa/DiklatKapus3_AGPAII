import React from 'react';
import { Participant, AttendanceRecord, TaskSubmission } from '../types';
import { AGPAII_LOGO_URL, UIN_LOGO_URL, DIKLAT_SESSIONS, DIKLAT_TASKS } from '../data/diklatData';
import { Printer, ArrowLeft } from 'lucide-react';

interface OfficialPrintReportProps {
  participants: Participant[];
  attendance: AttendanceRecord[];
  submissions: TaskSubmission[];
  onClose: () => void;
}

export const OfficialPrintReport: React.FC<OfficialPrintReportProps> = ({
  participants,
  attendance,
  submissions,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Compute table data
  const rows = participants.map((p) => {
    let hadirCount = 0;
    DIKLAT_SESSIONS.forEach((s) => {
      const att = attendance.find((a) => a.participantId === p.id && a.sessionId === s.id);
      if (att && att.status === 'Hadir') hadirCount++;
    });

    const attendancePct = Math.round((hadirCount / DIKLAT_SESSIONS.length) * 100);

    let submittedCount = 0;
    let scoreSum = 0;
    let scoredCount = 0;
    DIKLAT_TASKS.forEach((t) => {
      const sub = submissions.find((item) => item.participantId === p.id && item.taskId === t.id);
      if (sub) {
        submittedCount++;
        if (sub.score !== undefined && sub.score !== null) {
          scoreSum += sub.score;
          scoredCount++;
        }
      }
    });

    const avgScore = scoredCount > 0 ? Math.round(scoreSum / scoredCount) : 0;
    const minTasksRequired = Math.max(1, Math.round(DIKLAT_TASKS.length * 0.85));
    const isEligible = attendancePct >= 80 && submittedCount >= minTasksRequired && (scoredCount === 0 || avgScore >= 75);

    return {
      ...p,
      hadirCount,
      attendancePct,
      submittedCount,
      avgScore,
      isEligible,
    };
  });

  const totalEligible = rows.filter((r) => r.isEligible).length;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="no-print max-w-5xl mx-auto mb-6 bg-slate-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Portal
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 hidden sm:inline">
            Siap dicetak pada kertas A4 atau disimpan dalam format PDF
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Official Paper Sheet */}
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-12 shadow-md border border-slate-300 print:shadow-none print:border-none print:p-0 text-slate-900">
        {/* Kop Surat Resmi */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
          <img
            src={AGPAII_LOGO_URL}
            alt="Logo DPW AGPAII"
            referrerPolicy="no-referrer"
            className="h-20 w-auto object-contain shrink-0"
          />

          <div className="text-center px-4 flex-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Dewan Pengurus Wilayah
            </h3>
            <h1 className="text-base sm:text-lg font-black uppercase text-slate-900 leading-tight">
              Asosiasi Guru Pendidikan Agama Islam Indonesia (AGPAII) Provinsi Jawa Timur
            </h1>
            <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">
              Bekerjasama Dengan
            </p>
            <h2 className="text-sm sm:text-base font-extrabold uppercase text-slate-900 leading-tight">
              UPT Perpustakaan UIN Sayyid Ali Rahmatullah Tulungagung
            </h2>
            <p className="text-[10px] text-slate-500 mt-1">
              Sekretariat DPW: Graha AGPAII Jatim | Kampus UIN SATU: Jl. Mayor Sujadi Timur No. 46 Tulungagung
            </p>
          </div>

          <img
            src={UIN_LOGO_URL}
            alt="Logo UIN SATU Tulungagung"
            referrerPolicy="no-referrer"
            className="h-20 w-auto object-contain shrink-0"
          />
        </div>
        {/* Secondary hairline in kop surat */}
        <div className="h-0.5 bg-slate-900 mt-0.5 mb-6" />

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 underline underline-offset-4">
            Laporan Rekapitulasi Presensi & Penilaian Portofolio Tugas Diklat
          </h2>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            DIKLAT CALON KEPALA PERPUSTAKAAN SEKOLAH / MADRASAH (POLA 120 JP)
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Nomor: 048/DIKLAT-PERPUS/DPW-AGPAII-JATIM/UIN-SATU/X/2026
          </p>
        </div>

        {/* Summary Info Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 p-3 mb-6 bg-slate-50/50">
          <div>
            <span className="text-slate-500 block text-[10px]">Total Peserta:</span>
            <span className="font-bold text-slate-900">{participants.length} Orang</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Beban Kurikulum:</span>
            <span className="font-bold text-slate-900">120 Jam Pelajaran (26 JP Teori, 94 JP Praktik)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Jumlah Sesi / Tugas:</span>
            <span className="font-bold text-slate-900">{DIKLAT_SESSIONS.length} Sesi / {DIKLAT_TASKS.length} Tagihan Tugas Praktik</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Status Memenuhi Syarat:</span>
            <span className="font-bold text-emerald-800">{totalEligible} Peserta</span>
          </div>
        </div>

        {/* Table of 48 Participants */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                <th className="py-2 px-2 text-center border-r border-slate-300 w-8">No</th>
                <th className="py-2 px-2 border-r border-slate-300">Nama Lengkap Peserta</th>
                <th className="py-2 px-2 border-r border-slate-300">Instansi Sekolah / Madrasah</th>
                <th className="py-2 px-2 border-r border-slate-300">Kabupaten / Kota</th>
                <th className="py-2 px-2 text-center border-r border-slate-300">Hadir</th>
                <th className="py-2 px-2 text-center border-r border-slate-300">% Hadir</th>
                <th className="py-2 px-2 text-center border-r border-slate-300">Tugas</th>
                <th className="py-2 px-2 text-center border-r border-slate-300">Rerata</th>
                <th className="py-2 px-2 text-center">Status Kelulusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.id} className="leading-tight">
                  <td className="py-1.5 px-2 text-center border-r border-slate-300 font-mono">
                    {row.no}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-slate-900">
                    {row.name}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300 text-slate-700">
                    {row.institution}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300 text-slate-600">
                    {row.city}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-300 font-mono">
                    {row.hadirCount}/{DIKLAT_SESSIONS.length}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-300 font-mono">
                    {row.attendancePct}%
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-300 font-mono">
                    {row.submittedCount}/{DIKLAT_TASKS.length}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-300 font-mono font-bold">
                    {row.avgScore > 0 ? row.avgScore : '-'}
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold">
                    {row.isEligible ? (
                      <span className="text-emerald-800">LULUS / MEMENUHI</span>
                    ) : (
                      <span className="text-amber-800">PROGRES</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures Row */}
        <div className="pt-6 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-center break-inside-avoid">
          <div className="space-y-16">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold text-slate-900">Ketua DPW AGPAII Jawa Timur</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 underline">
                Dr. H. Mohammad Ahsan, M.Pd.I
              </p>
              <p className="text-[10px] text-slate-500">NPA. AGPAII 35.00.001</p>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold text-slate-900">
                Kepala UPT Perpustakaan UIN SATU
              </p>
            </div>
            <div>
              <p className="font-bold text-slate-900 underline">
                Dr. Ahmad Fahrudin, M.Pd.I.
              </p>
              <p className="text-[10px] text-slate-500">
                NIP. 19740510 200312 1 002
              </p>
            </div>
          </div>

          <div className="space-y-16 col-span-2 sm:col-span-1">
            <div>
              <p className="text-slate-600">Surabaya / Tulungagung,</p>
              <p className="font-bold text-slate-900">Ketua Panitia Pelaksana Diklat</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 underline">
                Drs. H. M. Zainal Arifin, M.Pd.I
              </p>
              <p className="text-[10px] text-slate-500">Ketua Bidang Diklat & Profesi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
