import React, { useState, useMemo } from 'react';
import { Participant, AttendanceRecord, TaskSubmission, ActiveTab } from '../types';
import {
  DIKLAT_SESSIONS,
  DIKLAT_TASKS,
  AGPAII_LOGO_URL,
  UIN_LOGO_URL,
  DRIVE_MODUL_URL,
  ZOOM_CONFIG,
} from '../data/diklatData';
import {
  Search,
  User,
  Building,
  MapPin,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  FileText,
  Printer,
  ArrowRight,
  ShieldCheck,
  Check,
  FolderOpen,
  ExternalLink,
  Palette,
  Video,
} from 'lucide-react';

interface CheckMandiriSectionProps {
  participants: Participant[];
  attendance: AttendanceRecord[];
  submissions: TaskSubmission[];
  onNavigate: (tab: ActiveTab) => void;
}

export const CheckMandiriSection: React.FC<CheckMandiriSectionProps> = ({
  participants,
  attendance,
  submissions,
  onNavigate,
}) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | ''>(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered participant list for search
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const q = searchQuery.toLowerCase();
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.institution.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
    );
  }, [participants, searchQuery]);

  // Selected participant
  const currentParticipant = useMemo(() => {
    return participants.find((p) => p.id === Number(selectedParticipantId)) || participants[0];
  }, [participants, selectedParticipantId]);

  // Attendance for this participant
  const participantAttendance = useMemo(() => {
    return attendance.filter((a) => a.participantId === currentParticipant?.id);
  }, [attendance, currentParticipant]);

  // Submissions for this participant
  const participantSubmissions = useMemo(() => {
    return submissions.filter((s) => s.participantId === currentParticipant?.id);
  }, [submissions, currentParticipant]);

  // Calculations
  const hadirCount = participantAttendance.filter((a) => a.status === 'Hadir').length;
  const attendanceRate = Math.round((hadirCount / DIKLAT_SESSIONS.length) * 100);
  const submittedTasksCount = participantSubmissions.length;

  const totalScore = participantSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const scoredCount = participantSubmissions.filter((s) => s.score !== undefined).length;
  const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;

  const minTasksRequired = Math.max(1, Math.round(DIKLAT_TASKS.length * 0.85));
  const isEligible =
    attendanceRate >= 80 && submittedTasksCount >= minTasksRequired && (scoredCount === 0 || avgScore >= 75);

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cek Progres Mandiri Peserta Diklat
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Pantau status presensi kehadiran, verifikasi berkas tugas, dan perolehan nilai secara mandiri dan transparan.
        </p>
      </div>

      {/* Resource Callout: Zoom Meeting & Modul Drive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Zoom Callout */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-950">
          <div className="flex items-center gap-2.5">
            <Video className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Ruang Zoom Meeting Diklat: <b>ID {ZOOM_CONFIG.meetingId}</b> · Sandi: <b>{ZOOM_CONFIG.passcode}</b>
            </span>
          </div>
          <a
            href={ZOOM_CONFIG.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition shadow-xs shrink-0"
          >
            <span>Masuk Zoom</span>
            <ExternalLink className="w-3 h-3 text-blue-200" />
          </a>
        </div>

        {/* Modul Drive Callout */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Materi & Slide Narasumber: <b>Folder Google Drive Diklat</b>
            </span>
          </div>
          <a
            href={DRIVE_MODUL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-xs shrink-0"
          >
            <span>Akses Drive</span>
            <ExternalLink className="w-3 h-3 text-emerald-600" />
          </a>
        </div>
      </div>

      {/* Selector Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Pilih / Cari Nama Anda Dari Daftar {participants.length} Peserta
        </label>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau instansi..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-8">
            <select
              value={selectedParticipantId}
              onChange={(e) => setSelectedParticipantId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
            >
              {filteredList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.no}. {p.name} - {p.institution} ({p.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Participant Digital Progress Card */}
      {currentParticipant && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header with Logos */}
          <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg font-mono">
                  {currentParticipant.no}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">
                      Kartu Progres Peserta Diklat
                    </span>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-xs text-slate-400">ID #{currentParticipant.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {currentParticipant.name}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {currentParticipant.institution} · {currentParticipant.city} ({currentParticipant.province})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrintCard}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Kartu Progres</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200">
            <div className="bg-white p-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Kehadiran Sesi
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {hadirCount} / {DIKLAT_SESSIONS.length} Sesi
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                {attendanceRate}% Tingkat Kehadiran
              </div>
            </div>

            <div className="bg-white p-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Tugas Terkumpul
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {submittedTasksCount} / {DIKLAT_TASKS.length} Tugas
              </div>
              <div className="text-[11px] text-slate-500">
                {DIKLAT_TASKS.length - submittedTasksCount} tugas belum terkumpul
              </div>
            </div>

            <div className="bg-white p-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Rata-rata Nilai
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {avgScore > 0 ? avgScore : '-'}
              </div>
              <div className="text-[11px] text-slate-500">
                {scoredCount} tugas telah dinilai
              </div>
            </div>

            <div className="bg-white p-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status Kelayakan
              </div>
              <div className="mt-1">
                <span
                  className={`inline-block font-bold px-2 py-0.5 rounded text-xs ${
                    isEligible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isEligible ? 'Memenuhi Syarat' : 'Lengkapi Tugas'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {isEligible ? 'Sertifikat 120 JP Siap Terbit' : `Wajib minimal ${minTasksRequired} tugas & 80% hadir`}
              </div>
            </div>
          </div>

          {/* Two-Column Detail: Kehadiran on Left, 8 Tugas on Right */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Attendance Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat Presensi ({DIKLAT_SESSIONS.length} Sesi)
                </h3>
                <button
                  onClick={() => onNavigate('presensi')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Isi Presensi Sesi Ini →
                </button>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {DIKLAT_SESSIONS.map((session) => {
                  const record = participantAttendance.find((a) => a.sessionId === session.id);
                  return (
                    <div
                      key={session.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {session.code}
                          </span>
                          <span className="text-xs font-medium text-slate-900 line-clamp-1">
                            {session.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {session.date}
                          {record && ` · Tercatat: ${record.timestamp}`}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {record ? (
                          <span
                            className={`inline-block font-semibold px-2 py-0.5 rounded text-xs ${
                              record.status === 'Hadir'
                                ? 'bg-emerald-100 text-emerald-800'
                                : record.status === 'Izin'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {record.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Belum Presensi
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: 8 Task Submissions Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Tagihan 8 Tugas Praktik Diklat
                </h3>
                <button
                  onClick={() => onNavigate('tugas')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Unggah Tugas Baru →
                </button>
              </div>

              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {DIKLAT_TASKS.map((task) => {
                  const sub = participantSubmissions.find((s) => s.taskId === task.id);
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        sub
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            {task.code}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                            {task.title}
                          </span>
                        </div>

                        {sub ? (
                          <div className="flex items-center gap-1.5">
                            {sub.score !== undefined && (
                              <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                                Skor: {sub.score}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                sub.status === 'Dinilai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-medium">
                            Belum Kumpul
                          </span>
                        )}
                      </div>

                      {sub ? (
                        <div className="mt-1 text-[11px] text-slate-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-mono">
                              File: {sub.fileName}
                            </span>
                            <span className="text-slate-400">{sub.submittedAt}</span>
                          </div>
                          {sub.feedback && (
                            <div className="p-2 bg-slate-100 rounded text-slate-700 italic border border-slate-200/80">
                              "Review: {sub.feedback}"
                              {sub.reviewedBy && (
                                <span className="block font-medium not-italic text-slate-500 text-[10px] mt-0.5">
                                  — Penilai: {sub.reviewedBy}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Batas: {task.deadline.split(',')[0]}</span>
                          <div className="flex items-center gap-2">
                            {task.templateUrl && (
                              <a
                                href={task.templateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:underline flex items-center gap-0.5"
                              >
                                <FileText className="w-2.5 h-2.5" /> Template
                              </a>
                            )}
                            <button
                              onClick={() => onNavigate('tugas')}
                              className="text-emerald-700 hover:underline font-semibold"
                            >
                              Kumpulkan →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
