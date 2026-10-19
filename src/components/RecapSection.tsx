import React, { useState, useMemo } from 'react';
import { Participant, AttendanceRecord, TaskSubmission, ActiveTab } from '../types';
import { DIKLAT_SESSIONS, DIKLAT_TASKS } from '../data/diklatData';
import { generateRecapCSV, downloadCSV } from '../utils/export';
import { SpreadsheetConfig } from '../services/googleSheets';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Users,
  ChevronDown,
  Building,
  User,
  Eye,
  Download,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface RecapSectionProps {
  participants: Participant[];
  attendance: AttendanceRecord[];
  submissions: TaskSubmission[];
  onOpenParticipantModal: (participant: Participant) => void;
  onOpenPrintReport: () => void;
  onOpenSpreadsheetModal: () => void;
  spreadsheetConfig: SpreadsheetConfig | null;
  onNavigate?: (tab: ActiveTab) => void;
}

export const RecapSection: React.FC<RecapSectionProps> = ({
  participants,
  attendance,
  submissions,
  onOpenParticipantModal,
  onOpenPrintReport,
  onOpenSpreadsheetModal,
  spreadsheetConfig,
  onNavigate,
}) => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Extract unique cities
  const uniqueCities = useMemo(() => {
    const set = new Set(participants.map((p) => p.city));
    return Array.from(set).sort();
  }, [participants]);

  // Compute stats per participant
  const computedParticipants = useMemo(() => {
    return participants.map((p) => {
      // Attendance per session
      const sessionMap: { [key: string]: AttendanceRecord | undefined } = {};
      let totalHadir = 0;
      DIKLAT_SESSIONS.forEach((s) => {
        const att = attendance.find(
          (a) => a.participantId === p.id && a.sessionId === s.id
        );
        sessionMap[s.id] = att;
        if (att && att.status === 'Hadir') totalHadir++;
      });

      const attendancePct = Math.round((totalHadir / DIKLAT_SESSIONS.length) * 100);

      // Tasks per task
      const taskMap: { [key: string]: TaskSubmission | undefined } = {};
      let totalTasksSubmitted = 0;
      let totalScore = 0;
      let gradedCount = 0;

      DIKLAT_TASKS.forEach((t) => {
        const sub = submissions.find(
          (item) => item.participantId === p.id && item.taskId === t.id
        );
        taskMap[t.id] = sub;
        if (sub) {
          totalTasksSubmitted++;
          if (sub.score !== undefined && sub.score !== null) {
            totalScore += sub.score;
            gradedCount++;
          }
        }
      });

      const avgScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;

      // Eligibility: Attendance >= 80% and at least 85% of tasks submitted and avgScore >= 75
      const minTasksRequired = Math.max(1, Math.round(DIKLAT_TASKS.length * 0.85));
      const isEligible =
        attendancePct >= 80 && totalTasksSubmitted >= minTasksRequired && (gradedCount === 0 || avgScore >= 75);

      let eligibilityStatus: 'Tuntas' | 'Progres' | 'Belum' = 'Belum';
      if (isEligible) {
        eligibilityStatus = 'Tuntas';
      } else if (totalTasksSubmitted > 0 || totalHadir > 0) {
        eligibilityStatus = 'Progres';
      }

      return {
        ...p,
        sessionMap,
        totalHadir,
        attendancePct,
        taskMap,
        totalTasksSubmitted,
        gradedCount,
        avgScore,
        eligibilityStatus,
      };
    });
  }, [participants, attendance, submissions]);

  // Filtered computed participants
  const filteredParticipants = useMemo(() => {
    return computedParticipants.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.no) === searchTerm;
      const matchCity = cityFilter === 'all' || p.city === cityFilter;
      const matchRole =
        roleFilter === 'all' ||
        (roleFilter === 'kepala' && p.status.includes('Kepala Perpustakaan')) ||
        (roleFilter === 'guru' && p.status.includes('Guru'));
      const matchStatus = statusFilter === 'all' || p.eligibilityStatus === statusFilter;

      return matchSearch && matchCity && matchRole && matchStatus;
    });
  }, [computedParticipants, searchTerm, cityFilter, roleFilter, statusFilter]);

  // Overall statistics
  const eligibleCount = computedParticipants.filter((p) => p.eligibilityStatus === 'Tuntas').length;
  const inProgressCount = computedParticipants.filter((p) => p.eligibilityStatus === 'Progres').length;
  const avgOverallAttendance = Math.round(
    computedParticipants.reduce((acc, p) => acc + p.attendancePct, 0) / computedParticipants.length
  );

  // Handle Export CSV
  const handleExportCSV = () => {
    const csvData = generateRecapCSV(
      participants,
      DIKLAT_SESSIONS,
      DIKLAT_TASKS,
      attendance,
      submissions
    );
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvData, `Rekap_Diklat_Kepala_Perpus_AGPAII_UINSATU_${dateStr}.csv`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Rekapitulasi Presensi & Tugas Peserta
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Tabel induk rekapitulasi penilaian komprehensif {participants.length} peserta Diklat Kepala Perpustakaan DPW AGPAII Jatim & UPT Perpustakaan UIN SATU Tulungagung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSpreadsheetModal}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm border ${
              spreadsheetConfig
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>{spreadsheetConfig ? 'Kelola Google Sheets' : 'Kirim ke Google Sheets'}</span>
            {spreadsheetConfig && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (CSV)</span>
          </button>

          <button
            onClick={onOpenPrintReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Format Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Transparansi Publik Callout Banner: Terbuka untuk Seluruh Peserta */}
      {/* Status Sesi & Progres Callout Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold text-sm sm:text-base text-white">
                Rekapitulasi Presensi &amp; Progres Tagihan Peserta Diklat
              </span>
              <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Hari Ke-1 Selesai (3 Sesi 100% Hadir)
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
              <b>Alhamdulillah, seluruh {participants.length} peserta telah LENGKAP mengisi presensi pada 3 sesi hari ini (162 rekaman kehadiran tervalidasi):</b> Sesi 1 (Pembukaan), Sesi 2 (Pengorganisasian Informasi), dan Sesi 3 (Manajemen Kelembagaan). Kolom tagihan 8 tugas praktik (T1 s.d. T8) akan terisi otomatis seiring peserta mengunggah tugas sesuai jadwal pedoman (21 s.d. 29 Oktober 2026).
            </p>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('cek-mandiri')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            <Award className="w-4 h-4 text-emerald-900" />
            <span>Buka Kartu Progres Mandiri</span>
          </button>
        )}
      </div>

      {/* Google Sheets Connection Banner */}
      {spreadsheetConfig && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-900">
                  {spreadsheetConfig.spreadsheetTitle}
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Cloud Live Sync
                </span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                Data presensi ({attendance.length}) dan pengumpulan tugas ({submissions.length}) terhubung ke spreadsheet ini.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={spreadsheetConfig.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg border border-emerald-300 transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Buka File
            </a>
            <button
              onClick={onOpenSpreadsheetModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sinkronkan / Pengaturan
            </button>
          </div>
        </div>
      )}

      {/* Recap Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Peserta SK
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {participants.length} Orang
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">DPW AGPAII &amp; UIN SATU</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Kehadiran Hari Ke-1 (S1-S3)
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            100%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{participants.length} dari {participants.length} Peserta Hadir Lengkap</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Presensi Tervalidasi
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {attendance.length} Data
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sesi 1, 2, &amp; 3 Terdata Lengkap</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Status Progres Peserta
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {inProgressCount} Peserta
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Aktif Berprogres (Tugas 1-8)</div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama peserta, instansi, atau kabupaten/kota..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Select Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Semua Kabupaten/Kota ({uniqueCities.length})</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Semua Jabatan</option>
              <option value="kepala">Kepala Perpustakaan</option>
              <option value="guru">Guru PAI / Mapel</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Semua Status Kelulusan</option>
              <option value="Tuntas">Memenuhi Syarat (Tuntas)</option>
              <option value="Progres">Dalam Progres</option>
              <option value="Belum">Belum Berprogres</option>
            </select>

            {(searchTerm || cityFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCityFilter('all');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="px-2.5 py-2 text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Keterangan:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> Hadir / Tugas Terkumpul
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Izin / Belum Dinilai
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> Belum Masuk / Belum Hadir
          </span>
        </div>
      </div>

      {/* Master Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">
            Menampilkan {filteredParticipants.length} dari {participants.length} Peserta
          </span>
          <span className="text-[11px] text-slate-500">
            *Klik baris peserta untuk melihat detail kartu progres mandiri
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold text-center w-12 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  No
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[220px] sticky left-12 bg-slate-50 z-10 border-r border-slate-200">
                  Nama Lengkap Peserta
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[190px]">
                  Instansi Sekolah/Madrasah
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[140px]">
                  Kabupaten / Kota
                </th>
                {/* Sessions */}
                <th className="py-2.5 px-2 font-semibold text-center bg-emerald-50/70 border-x border-slate-200" colSpan={DIKLAT_SESSIONS.length}>
                  Presensi Sesi (S1 - S{DIKLAT_SESSIONS.length})
                </th>
                <th className="py-2.5 px-2 font-semibold text-center bg-blue-50/70 border-r border-slate-200" colSpan={DIKLAT_TASKS.length}>
                  Tagihan 8 Tugas Praktik (T1 - T{DIKLAT_TASKS.length})
                </th>
                <th className="py-2.5 px-3 font-semibold text-center">Rata-rata</th>
                <th className="py-2.5 px-3 font-semibold text-center min-w-[140px]">
                  Status Kelulusan
                </th>
                <th className="py-2.5 px-3 font-semibold text-center">Detail</th>
              </tr>
              {/* Subheader for Sesi & Tugas */}
              <tr className="bg-slate-100/70 text-[10px] text-slate-500 font-mono text-center border-b border-slate-200">
                <th className="sticky left-0 bg-slate-100/70 border-r border-slate-200"></th>
                <th className="sticky left-12 bg-slate-100/70 border-r border-slate-200"></th>
                <th></th>
                <th></th>
                {DIKLAT_SESSIONS.map((s) => (
                  <th key={s.id} className="py-1 px-1.5 font-bold" title={s.title}>
                    {s.code.replace('SESI-', 'S')}
                  </th>
                ))}
                {DIKLAT_TASKS.map((t) => (
                  <th key={t.id} className="py-1 px-1.5 font-bold" title={t.title}>
                    {t.code.replace('TUGAS-', 'T')}
                  </th>
                ))}
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onOpenParticipantModal(p)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-mono text-slate-500 text-center sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-200">
                    {p.no}
                  </td>
                  <td className="py-2 px-3 sticky left-12 bg-white group-hover:bg-slate-50 border-r border-slate-200">
                    <div className="font-bold text-slate-900 truncate max-w-[210px]">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {p.status}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-slate-700">
                    <div className="truncate max-w-[190px]">{p.institution}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                    <div>{p.city}</div>
                    {p.province !== 'Jawa Timur' && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-1 py-0.2 rounded font-medium">
                        {p.province}
                      </span>
                    )}
                  </td>

                  {/* 6 Sessions Presence */}
                  {DIKLAT_SESSIONS.map((s) => {
                    const att = p.sessionMap[s.id];
                    return (
                      <td key={s.id} className="py-2 px-1 text-center">
                        {att && att.status === 'Hadir' ? (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 bg-emerald-600 text-white rounded font-bold text-[10px] shadow-2xs"
                            title={`Hadir: ${att.timestamp}`}
                          >
                            ✓
                          </span>
                        ) : att && att.status === 'Izin' ? (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]"
                            title={`Izin: ${att.notes || ''}`}
                          >
                            I
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 text-slate-300 rounded font-bold text-[10px]"
                            title="Belum Hadir"
                          >
                            -
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* 6 Tasks Submission */}
                  {DIKLAT_TASKS.map((t) => {
                    const sub = p.taskMap[t.id];
                    return (
                      <td key={t.id} className="py-2 px-1 text-center">
                        {sub ? (
                          sub.score !== undefined && sub.score !== null ? (
                            <span
                              className="inline-flex items-center justify-center px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded font-mono font-bold text-[10px]"
                              title={`Nilai: ${sub.score} (${sub.title})`}
                            >
                              {sub.score}
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]"
                              title={`Terkumpul: ${sub.title}`}
                            >
                              ✓
                            </span>
                          )
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 text-slate-300 rounded font-bold text-[10px]"
                            title="Belum Dikumpulkan"
                          >
                            -
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Average Score */}
                  <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                    {p.avgScore > 0 ? p.avgScore : '-'}
                  </td>

                  {/* Eligibility Status */}
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block font-semibold px-2 py-0.5 rounded text-[10px] whitespace-nowrap ${
                        p.eligibilityStatus === 'Tuntas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.eligibilityStatus === 'Progres'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.eligibilityStatus === 'Tuntas'
                        ? 'Memenuhi Syarat'
                        : p.eligibilityStatus === 'Progres'
                        ? 'Dalam Progres'
                        : 'Belum Mulai'}
                    </span>
                  </td>

                  {/* View Details Action */}
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenParticipantModal(p);
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                      title="Lihat Rincian Peserta"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
