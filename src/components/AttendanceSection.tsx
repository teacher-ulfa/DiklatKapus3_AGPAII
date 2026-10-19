import React, { useState, useMemo } from 'react';
import { Participant, AttendanceRecord, AttendanceStatus } from '../types';
import { DIKLAT_SESSIONS, ZOOM_CONFIG } from '../data/diklatData';
import { SignaturePad } from './SignaturePad';
import { SpreadsheetConfig } from '../services/googleSheets';
import { generateAttendanceCSV, downloadCSV } from '../utils/export';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  User,
  Building,
  MapPin,
  Camera,
  AlertCircle,
  FileCheck,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Video,
  ExternalLink,
  Shield,
  Download,
  Database,
  Sparkles,
} from 'lucide-react';

interface AttendanceSectionProps {
  participants: Participant[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance?: (id: string) => void;
  spreadsheetConfig?: SpreadsheetConfig | null;
  onOpenSpreadsheetModal?: () => void;
  onOpenZoomModal?: () => void;
  isAdminMode?: boolean;
  onRestoreSession1And2?: () => void;
  onSyncLocalNow?: () => void;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  participants,
  attendance,
  onSaveAttendance,
  onDeleteAttendance,
  spreadsheetConfig,
  onOpenSpreadsheetModal,
  onOpenZoomModal,
  isAdminMode = false,
  onRestoreSession1And2,
  onSyncLocalNow,
}) => {
  // Form State
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | ''>('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(DIKLAT_SESSIONS[0].id);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('Hadir');
  const [notes, setNotes] = useState('');
  const [signatureData, setSignatureData] = useState<string>('');
  const [photoProofName, setPhotoProofName] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Table Filter State
  const [tableSearch, setTableSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Participant Object
  const selectedParticipant = useMemo(() => {
    return participants.find((p) => p.id === Number(selectedParticipantId)) || null;
  }, [participants, selectedParticipantId]);

  // Search filtered participants list for combobox
  const filteredParticipantsForSelect = useMemo(() => {
    if (!participantSearch.trim()) return participants;
    const q = participantSearch.toLowerCase();
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.institution.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        String(p.no) === q
    );
  }, [participants, participantSearch]);

  // Check if participant already has attendance for selected session
  const existingAttendance = useMemo(() => {
    if (!selectedParticipantId || !selectedSessionId) return null;
    return attendance.find(
      (a) => a.participantId === Number(selectedParticipantId) && a.sessionId === selectedSessionId
    );
  }, [attendance, selectedParticipantId, selectedSessionId]);

  // Handle Photo Proof change
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoProofName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) {
      alert('Silakan pilih nama peserta terlebih dahulu!');
      return;
    }

    const sessionObj = DIKLAT_SESSIONS.find((s) => s.id === selectedSessionId);
    const now = new Date();
    const formattedTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const newRecord: AttendanceRecord = {
      id: existingAttendance ? existingAttendance.id : `att-${selectedParticipant.id}-${selectedSessionId}-${Date.now()}`,
      participantId: selectedParticipant.id,
      participantName: selectedParticipant.name,
      institution: selectedParticipant.institution,
      city: selectedParticipant.city,
      sessionId: selectedSessionId,
      sessionTitle: sessionObj?.title || 'Sesi Diklat',
      timestamp: formattedTimestamp,
      status: attendanceStatus,
      notes: notes.trim(),
      signature: signatureData || existingAttendance?.signature,
      photoProof: photoPreview || existingAttendance?.photoProof,
      verified: true,
    };

    onSaveAttendance(newRecord);
    setFormSuccessMessage(
      `Alhamdulillah! Presensi berhasil disimpan untuk ${selectedParticipant.name} pada ${sessionObj?.code || 'Sesi Diklat'}.`
    );

    // Reset notes & photo preview
    setNotes('');
    setPhotoProofName('');
    setPhotoPreview('');

    setTimeout(() => {
      setFormSuccessMessage(null);
    }, 6000);
  };

  // Filtered attendance for table
  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const matchSearch =
        item.participantName.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.institution.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.city.toLowerCase().includes(tableSearch.toLowerCase());
      const matchSession = sessionFilter === 'all' || item.sessionId === sessionFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchSession && matchStatus;
    });
  }, [attendance, tableSearch, sessionFilter, statusFilter]);

  return (
    <div className="space-y-10 pb-16">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Presensi Kehadiran Peserta Diklat
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Formulir presensi digital resmi Diklat Calon Kepala Perpustakaan Sekolah/Madrasah kerjasama DPW AGPAII Jawa Timur & UPT Perpustakaan UIN Sayyid Ali Rahmatullah Tulungagung.
        </p>
      </div>

      {formSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Presensi Terverifikasi!</h4>
            <p className="text-xs text-emerald-800 mt-0.5">{formSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* Central Database Sync Info Banner */}
      <div className="bg-emerald-950 text-white rounded-xl p-4 border border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-emerald-100">
                Database Pusat Terhubung (Sinkron Real-time Seluruh Peserta)
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Data presensi otomatis tersimpan ke server bersama dan langsung tampil di tabel rekapitulasi untuk seluruh panitia & peserta.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onSyncLocalNow && (
            <button
              type="button"
              onClick={onSyncLocalNow}
              className="px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold rounded-lg transition border border-emerald-600/40 flex items-center gap-1.5"
              title="Kirim ulang data presensi yang mungkin tersimpan di browser HP ini"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkronkan HP Ini</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const csv = generateAttendanceCSV(participants, DIKLAT_SESSIONS, attendance);
              downloadCSV(csv, `Presensi_Diklat_${participants.length}Peserta_${new Date().toISOString().slice(0, 10)}.csv`);
            }}
            className="px-3 py-1.5 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unduh CSV Presensi</span>
          </button>
        </div>
      </div>

      {/* Admin Fast Recovery: Sesi 1, 2 & 3 Mass Attendance Banner */}
      {isAdminMode && onRestoreSession1And2 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-blue-500/15 border-2 border-amber-400/50 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">
                  Pemulihan & Presensi Massal Sesi 1, 2 & 3 ({participants.length} Peserta)
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                  Aksi Cepat Panitia
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Peserta telah mengikuti <b>Sesi 1 (Pembukaan)</b>, <b>Sesi 2 (Pengorganisasian Informasi)</b>, dan <b>Sesi 3 (Manajemen Kelembagaan)</b> hari ini. Klik tombol di sebelah kanan untuk memastikan seluruh {participants.length} peserta tercatat Hadir di database pusat, rekapan website, dan siap dikirim ke Google Sheets.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRestoreSession1And2}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-lg transition shadow-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Tandai Hadir Semua Sesi 1, 2 & 3 ({participants.length} Peserta)</span>
            </button>
            {onOpenSpreadsheetModal && (
              <button
                type="button"
                onClick={onOpenSpreadsheetModal}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Kirim ke Spreadsheet</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Form on Left, Guidelines on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-100">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Formulir Presensi Harian / Sesi
              </h2>
              <p className="text-xs text-slate-500">
                Pastikan identitas nama dan instansi sesuai SK peserta diklat
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Zoom Meeting Live Notification Banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-blue-950">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-600 text-white rounded-md shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block text-blue-900">
                    Ruang Zoom Meeting Sesi Sinkronus
                  </span>
                  <span className="text-[11px] text-blue-800">
                    ID: <b className="font-mono text-blue-950">{ZOOM_CONFIG.meetingId}</b> · Passcode: <b className="font-mono text-blue-950">{ZOOM_CONFIG.passcode}</b>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={ZOOM_CONFIG.joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition text-xs shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Masuk Zoom</span>
                  <ExternalLink className="w-3 h-3 text-blue-200" />
                </a>
                {onOpenZoomModal && (
                  <button
                    type="button"
                    onClick={onOpenZoomModal}
                    className="text-blue-700 hover:underline font-semibold text-xs"
                  >
                    Detail
                  </button>
                )}
              </div>
            </div>

            {/* Google Sheets Connection Pill */}
            {spreadsheetConfig ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <span className="flex items-center gap-2 font-medium">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>
                    Terhubung ke <b>{spreadsheetConfig.spreadsheetTitle}</b>
                    {spreadsheetConfig.autoSync ? ' (Data otomatis terkirim ke spreadsheet)' : ''}
                  </span>
                </span>
                {onOpenSpreadsheetModal && (
                  <button
                    type="button"
                    onClick={onOpenSpreadsheetModal}
                    className="text-emerald-700 underline font-semibold hover:text-emerald-900 shrink-0 ml-2"
                  >
                    Detail
                  </button>
                )}
              </div>
            ) : onOpenSpreadsheetModal ? (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                  <span>Kirim data presensi otomatis ke Google Spreadsheet?</span>
                </span>
                <button
                  type="button"
                  onClick={onOpenSpreadsheetModal}
                  className="text-emerald-700 font-bold hover:underline shrink-0"
                >
                  Hubungkan
                </button>
              </div>
            ) : null}

            {/* 1. Pilih Peserta */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Nama Peserta (Total {participants.length} Peserta) <span className="text-rose-500">*</span>
              </label>
              
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Ketik nama, instansi, atau kota untuk filter pilihan..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>

                <select
                  required
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Pilih Nama Peserta Dari Daftar --</option>
                  {filteredParticipantsForSelect.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.no}. {p.name} - {p.institution} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto Display Participant Profile Card */}
              {selectedParticipant && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      {selectedParticipant.name}
                    </span>
                    <span className="font-mono text-slate-500">No. {selectedParticipant.no}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedParticipant.institution}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedParticipant.city}, {selectedParticipant.province}
                    </span>
                    <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedParticipant.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Pilih Sesi Diklat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Sesi Diklat <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {DIKLAT_SESSIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.title} ({s.date})
                  </option>
                ))}
              </select>

              {existingAttendance && (
                <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Peserta ini sudah tercatat <strong>{existingAttendance.status}</strong> pada {existingAttendance.timestamp}. Mengirim form akan memperbarui rekaman presensi.
                  </span>
                </div>
              )}
            </div>

            {/* 3. Status Kehadiran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Kehadiran <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Hadir', 'Izin', 'Sakit'] as AttendanceStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setAttendanceStatus(status)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                      attendanceStatus === status
                        ? status === 'Hadir'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : status === 'Izin'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'Hadir' && '✓ '}
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Unggah Bukti Kehadiran / Tangkapan Layar Zoom */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Bukti Kehadiran / Tangkapan Layar Zoom (Opsional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer border border-slate-300 transition-colors">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Pilih Foto Bukti</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {photoProofName || 'Belum ada foto dipilih'}
                </span>
              </div>
              {photoPreview && (
                <div className="mt-2 relative w-24 h-24 border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={photoPreview}
                    alt="Preview Bukti"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview('');
                      setPhotoProofName('');
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* 5. Tanda Tangan Digital */}
            <div className="pt-2 border-t border-slate-100">
              <SignaturePad onSave={(data) => setSignatureData(data)} />
            </div>

            {/* 6. Catatan Kehadiran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Kehadiran / Resume Singkat (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan keterangan singkat, kendala jaringan jika ada, atau resume 1 kalimat materi..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Presensi Kehadiran</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Attendance Rules & Session Timeline */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <FileCheck className="w-4 h-4" /> Ketentuan Presensi Diklat
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                Presensi dibuka 30 menit sebelum sesi dimulai hingga 60 menit setelah sesi berakhir.
              </li>
              <li>
                Peserta wajib mengikuti minimal <strong>85% kehadiran</strong> (maksimal 1 kali izin dengan surat keterangan resmi).
              </li>
              <li>
                Tanda tangan digital berfungsi sebagai bukti autentikasi kehadiran yang sah pada lembar rekapitulasi UIN SATU Tulungagung.
              </li>
              <li>
                Jika terkendala koneksi internet, peserta dapat segera melapor ke Helpdesk Panitia DPW AGPAII Jatim.
              </li>
            </ul>
          </div>

          {/* Quick Summary of Attendance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Statistik Kehadiran Terkini
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-xl font-bold font-mono text-emerald-700">
                  {attendance.filter((a) => a.status === 'Hadir').length}
                </div>
                <div className="text-[11px] font-medium text-emerald-800">Hadir</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-xl font-bold font-mono text-amber-700">
                  {attendance.filter((a) => a.status === 'Izin').length}
                </div>
                <div className="text-[11px] font-medium text-amber-800">Izin</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                <div className="text-xl font-bold font-mono text-rose-700">
                  {attendance.filter((a) => a.status === 'Sakit').length}
                </div>
                <div className="text-[11px] font-medium text-rose-800">Sakit</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Total {attendance.length} entri rekaman presensi tervalidasi.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Attendance Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Presensi Masuk (Real-time Log)
            </h2>
            <p className="text-xs text-slate-500">
              Daftar presensi peserta yang telah terekam dalam sistem
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Cari peserta / instansi..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
              />
            </div>

            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Semua Sesi</option>
              {DIKLAT_SESSIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {filteredAttendance.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Tidak ada rekaman presensi yang sesuai dengan kriteria filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold w-12 text-center">No</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Peserta</th>
                  <th className="py-2.5 px-3 font-semibold">Instansi & Daerah</th>
                  <th className="py-2.5 px-3 font-semibold">Sesi Diklat</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Waktu Presensi</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Tanda Tangan</th>
                  {onDeleteAttendance && (
                    <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-center">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.participantName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div>{item.institution}</div>
                      <div className="text-[11px] text-slate-400">{item.city}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <span className="font-semibold text-emerald-800">
                        {DIKLAT_SESSIONS.find((s) => s.id === item.sessionId)?.code || item.sessionId}:
                      </span>{' '}
                      {item.sessionTitle}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                          item.status === 'Hadir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Izin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.signature ? (
                        <div className="inline-block p-1 bg-white border border-slate-200 rounded">
                          <img
                            src={item.signature}
                            alt="TTD"
                            className="h-6 w-16 object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Tidak ada</span>
                      )}
                    </td>
                    {onDeleteAttendance && (
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onDeleteAttendance(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors text-xs"
                          title="Hapus rekaman ini"
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
