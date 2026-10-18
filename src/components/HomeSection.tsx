import React from 'react';
import { ActiveTab, Participant, AttendanceRecord, TaskSubmission } from '../types';
import {
  AGPAII_LOGO_URL,
  UIN_LOGO_URL,
  DRIVE_MODUL_URL,
  DIKLAT_INFO,
  DIKLAT_SESSIONS,
  DIKLAT_TASKS,
} from '../data/diklatData';
import { SpreadsheetConfig } from '../services/googleSheets';
import {
  Calendar,
  Clock,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  FileText,
  UploadCloud,
  Search,
  ExternalLink,
  School,
  ArrowRight,
  ShieldCheck,
  Building,
  FolderOpen,
  Presentation,
  Download,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

interface HomeSectionProps {
  participants: Participant[];
  attendance: AttendanceRecord[];
  submissions: TaskSubmission[];
  onNavigate: (tab: ActiveTab) => void;
  onSelectParticipant?: (participantId: number) => void;
  spreadsheetConfig?: SpreadsheetConfig | null;
  onOpenSpreadsheetModal?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  participants,
  attendance,
  submissions,
  onNavigate,
  spreadsheetConfig,
  onOpenSpreadsheetModal,
}) => {
  // Calculated stats
  const totalParticipants = participants.length;
  const totalSubmissions = submissions.length;
  const verifiedAttendance = attendance.filter((a) => a.status === 'Hadir').length;
  const gradedSubmissions = submissions.filter((s) => s.status === 'Dinilai').length;

  return (
    <div className="space-y-10 pb-16">
      {/* Official Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-2xl shadow-xl p-6 sm:p-10 lg:p-12 border border-emerald-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          {/* Institutional Badges & Logos */}
          <div className="flex flex-wrap items-center gap-4 mb-6 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 w-fit">
            <div className="flex items-center gap-2">
              <img
                src={AGPAII_LOGO_URL}
                alt="Logo DPW AGPAII Jawa Timur"
                referrerPolicy="no-referrer"
                className="h-10 w-auto bg-white rounded p-1"
              />
              <span className="text-xs font-semibold tracking-wide text-emerald-100">
                DPW AGPAII JAWA TIMUR
              </span>
            </div>
            <span className="text-white/40">✕</span>
            <div className="flex items-center gap-2">
              <img
                src={UIN_LOGO_URL}
                alt="Logo UPT Perpustakaan UIN SATU Tulungagung"
                referrerPolicy="no-referrer"
                className="h-10 w-auto bg-white rounded p-1"
              />
              <span className="text-xs font-semibold tracking-wide text-emerald-100">
                UPT PERPUSTAKAAN UIN SAYYID ALI RAHMATULLAH TULUNGAGUNG
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Portal Diklat Kepala Perpustakaan Sekolah
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-3xl leading-relaxed mb-6">
            Pola 120 Jam Pelajaran (26 JP Teori, 94 JP Praktik) berstandar nasional perpustakaan. Sistem informasi presensi sesi, tagihan 8 tugas praktik resmi, dan rekapitulasi penilaian peserta.
          </p>

          {/* Modul & Bahan Ajar Link Callout Banner */}
          <div className="mb-8 p-4 bg-emerald-800/60 border border-emerald-500/40 rounded-xl backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-lg text-emerald-300 shrink-0">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Modul dan Bahan Ajar PPT Diklat</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-mono">
                    Google Drive
                  </span>
                </h4>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Akses slide presentasi narasumber, panduan materi teori, dan format borang praktik.
                </p>
              </div>
            </div>

            <a
              href={DRIVE_MODUL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs rounded-lg transition-all shadow-md shrink-0"
            >
              <span>Buka Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-800" />
            </a>
          </div>

          {/* Google Sheets Live Sync Banner */}
          <div className="mb-8 p-3.5 bg-emerald-950/70 border border-emerald-400/30 rounded-xl backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Integrasi Google Spreadsheet</span>
                  {spreadsheetConfig ? (
                    <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      Aktif: {spreadsheetConfig.spreadsheetTitle}
                    </span>
                  ) : (
                    <span className="bg-white/10 text-emerald-200 text-[10px] px-2 py-0.5 rounded">
                      Tersedia
                    </span>
                  )}
                </div>
                <p className="text-emerald-200/80 mt-0.5">
                  Kirim seluruh rekaman presensi dan dokumen tugas secara langsung ke Google Sheets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {spreadsheetConfig?.spreadsheetUrl && spreadsheetConfig.spreadsheetUrl !== '#' && (
                <a
                  href={spreadsheetConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Sheet
                </a>
              )}
              {onOpenSpreadsheetModal && (
                <button
                  onClick={onOpenSpreadsheetModal}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg transition shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{spreadsheetConfig ? 'Kelola Spreadsheet' : 'Hubungkan Spreadsheet'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <button
              onClick={() => onNavigate('presensi')}
              className="flex items-center justify-between p-4 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-md group text-left"
            >
              <div>
                <span className="text-xs text-emerald-200 block uppercase tracking-wider font-semibold">
                  Aktivitas 01
                </span>
                <span className="text-base font-bold">Isi Presensi Sesi</span>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('tugas')}
              className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/20 group text-left"
            >
              <div>
                <span className="text-xs text-emerald-300 block uppercase tracking-wider font-semibold">
                  Aktivitas 02
                </span>
                <span className="text-base font-bold">Kumpul 8 Tugas Praktik</span>
              </div>
              <UploadCloud className="w-5 h-5 text-emerald-300 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('rekap')}
              className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/20 group text-left sm:col-span-2 lg:col-span-1"
            >
              <div>
                <span className="text-xs text-emerald-300 block uppercase tracking-wider font-semibold">
                  Aktivitas 03
                </span>
                <span className="text-base font-bold">Rekapitulasi 48 Peserta</span>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Quantitative Rigor KPI Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalParticipants}
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Peserta Terdaftar
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Jatim & Perwakilan Nasional</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {DIKLAT_INFO.totalJP} JP
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              26 JP Teori · 94 JP Praktik
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{DIKLAT_INFO.dates}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {DIKLAT_TASKS.length} Tugas
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tagihan Praktik Resmi
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {totalSubmissions} berkas telah dikumpulkan
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-lg shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              120 JP
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Sertifikasi Kepala Perpus
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">UIN SATU & AGPAII JATIM</div>
          </div>
        </div>
      </section>

      {/* Two-Column Section: Schedule & Tasks Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Sesi Diklat */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Jadwal Sesi Teori & Zoom Meeting
              </h2>
              <p className="text-xs text-slate-500">
                Pemateri resmi Rektor, Kepala UPT, Pustakawan, dan Dosen UIN SATU Tulungagung
              </p>
            </div>
            <button
              onClick={() => onNavigate('presensi')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Presensi Sesi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {DIKLAT_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {session.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {session.date} · {session.time}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {session.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                  {session.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="font-medium text-slate-700 truncate max-w-[280px]">
                    Narasumber: {session.speaker}
                  </span>
                  <span className="text-emerald-700 font-medium">{session.speakerRole}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: 8 Tugas Praktik Resmi dari Pedoman */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tagihan 8 Tugas Praktik Diklat
                </h2>
                <p className="text-xs text-slate-500">
                  Sesuai Bagian D Pedoman Penyelenggaraan Pelatihan
                </p>
              </div>
              <button
                onClick={() => onNavigate('tugas')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Unggah Tugas <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {DIKLAT_TASKS.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors bg-white space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {task.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        Bobot {task.weight}%
                      </span>
                    </div>
                    <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.deadline.split(',')[0]}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {task.description}
                  </p>

                  <div className="pt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      Luaran: {task.submissionFormat}
                    </span>
                    {task.templateUrl && (
                      <a
                        href={task.templateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-0.5 font-semibold"
                      >
                        <FileText className="w-3 h-3" /> Template Docs
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Integrity & Partnership Notice */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Ketentuan Evaluasi & Kelulusan Peserta
            </div>
            <h3 className="text-base font-bold text-white">
              Sertifikat Kelulusan Diklat 120 Jam Pelajaran (JP)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {DIKLAT_INFO.certCriteria}
            </p>
            <div className="pt-2 text-xs text-slate-400 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Narahubung: {DIKLAT_INFO.contactPhone}</span>
              <button
                onClick={() => onNavigate('cek-mandiri')}
                className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
              >
                Cek Kelayakan Portofolio Anda <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
