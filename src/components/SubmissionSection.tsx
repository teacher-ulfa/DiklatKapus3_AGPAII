import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Participant, TaskSubmission, DiklatTask, SubmissionStatus } from '../types';
import { DIKLAT_TASKS, DRIVE_MODUL_URL } from '../data/diklatData';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ExternalLink,
  Award,
  AlertTriangle,
  User,
  Building,
  HelpCircle,
  FolderOpen,
  Send,
  MessageSquare,
  FileCheck,
  Video,
  Palette,
} from 'lucide-react';

interface SubmissionSectionProps {
  participants: Participant[];
  submissions: TaskSubmission[];
  onSaveSubmission: (submission: TaskSubmission) => void;
  onOpenGradingModal?: (submission: TaskSubmission) => void;
  isAdminMode: boolean;
}

export const SubmissionSection: React.FC<SubmissionSectionProps> = ({
  participants,
  submissions,
  onSaveSubmission,
  onOpenGradingModal,
  isAdminMode,
}) => {
  // Form State
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | ''>('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(DIKLAT_TASKS[0].id);
  const [docTitle, setDocTitle] = useState('');
  const [docLink, setDocLink] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [notes, setNotes] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Table Filter State
  const [tableSearch, setTableSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Participant Object
  const selectedParticipant = useMemo(() => {
    return participants.find((p) => p.id === Number(selectedParticipantId)) || null;
  }, [participants, selectedParticipantId]);

  // Selected Task Object
  const selectedTask = useMemo(() => {
    return DIKLAT_TASKS.find((t) => t.id === selectedTaskId) || DIKLAT_TASKS[0];
  }, [selectedTaskId]);

  // Filtered participants list for combobox
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

  // Check if participant already submitted this task
  const existingSubmission = useMemo(() => {
    if (!selectedParticipantId || !selectedTaskId) return null;
    return submissions.find(
      (s) => s.participantId === Number(selectedParticipantId) && s.taskId === selectedTaskId
    );
  }, [submissions, selectedParticipantId, selectedTaskId]);

  // List of tasks already submitted by selected participant
  const participantSubmissionsList = useMemo(() => {
    if (!selectedParticipantId) return [];
    return submissions.filter((s) => s.participantId === Number(selectedParticipantId));
  }, [submissions, selectedParticipantId]);

  // Handle File Input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFileSize(`${sizeMB} MB`);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) {
      alert('Silakan pilih nama peserta terlebih dahulu!');
      return;
    }

    if (!uploadedFileName && !docLink.trim()) {
      alert('Silakan unggah berkas tugas (DOCX/PDF/MP4) atau cantumkan tautan Google Drive / Cloud!');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const newSubmission: TaskSubmission = {
      id: existingSubmission ? existingSubmission.id : `sub-${selectedParticipant.id}-${selectedTaskId}-${Date.now()}`,
      participantId: selectedParticipant.id,
      participantName: selectedParticipant.name,
      institution: selectedParticipant.institution,
      taskId: selectedTaskId,
      taskTitle: selectedTask.title,
      submittedAt: formattedDate,
      title: docTitle.trim() || `${selectedTask.code} - ${selectedParticipant.name}`,
      fileName: uploadedFileName || existingSubmission?.fileName || (selectedTask.id === 'tugas-8' ? 'Video_BLC.mp4' : 'Laporan_Tugas.docx'),
      fileSize: uploadedFileSize || existingSubmission?.fileSize || '1.8 MB',
      docLink: docLink.trim() || existingSubmission?.docLink,
      notes: notes.trim(),
      status: existingSubmission?.status === 'Dinilai' ? 'Dinilai' : 'Belum Dinilai',
      score: existingSubmission?.score,
      feedback: existingSubmission?.feedback,
      reviewedBy: existingSubmission?.reviewedBy,
      reviewedAt: existingSubmission?.reviewedAt,
    };

    onSaveSubmission(newSubmission);

    // Fire Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setFormSuccessMessage(
      `Alhamdulillah! Tugas ${selectedTask.code} (${selectedTask.title}) berhasil dikumpulkan atas nama ${selectedParticipant.name}.`
    );

    // Reset form inputs except participant
    setDocTitle('');
    setDocLink('');
    setUploadedFileName('');
    setUploadedFileSize('');
    setNotes('');

    setTimeout(() => {
      setFormSuccessMessage(null);
    }, 7000);
  };

  // Filtered submissions for table
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const matchSearch =
        item.participantName.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.institution.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.title.toLowerCase().includes(tableSearch.toLowerCase());
      const matchTask = taskFilter === 'all' || item.taskId === taskFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchTask && matchStatus;
    });
  }, [submissions, tableSearch, taskFilter, statusFilter]);

  return (
    <div className="space-y-8 pb-16">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengumpulan Tugas Praktik Diklat
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Fasilitas pengunggahan 8 tagihan tugas praktik resmi sesuai Pedoman Penyelenggaraan Pelatihan Diklat Kepala Perpustakaan Sekolah/Madrasah UIN SATU Tulungagung & DPW AGPAII Jatim.
        </p>
      </div>

      {/* Prominent Google Drive Modul & PPT Embedded Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-xl shadow-md border border-emerald-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-xl text-emerald-200 shrink-0 border border-white/10">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white">
                Folder Modul dan Bahan Ajar PPT Diklat
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">
                Google Drive Resmi
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-1">
              Unduh modul lengkap dan slide materi PPT dari para narasumber UIN SATU Tulungagung sebelum menyusun tugas.
            </p>
          </div>
        </div>

        <a
          href={DRIVE_MODUL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs rounded-lg transition-all shadow shrink-0"
        >
          <FolderOpen className="w-4 h-4 text-emerald-800" />
          <span>Buka Folder Modul & PPT</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
        </a>
      </div>

      {formSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Tugas Berhasil Terkirim!</h4>
            <p className="text-xs text-emerald-800 mt-0.5">{formSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* 8 Official Tasks Reference Selector */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Rincian 8 Tagihan Tugas Praktik (Pedoman Penyelenggaraan)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Klik tugas di bawah untuk melihat instruksi dan tautan template resmi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {DIKLAT_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedTaskId === task.id
                  ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-600/30'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] font-bold text-emerald-800">
                  {task.code}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {task.weight}%
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight">
                {task.title}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Task Details Banner with Direct Template Links */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mr-2">
                {selectedTask.code}
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {selectedTask.title}
              </span>
            </div>
            <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 font-medium">
              Batas Pengumpulan: {selectedTask.deadline}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            {selectedTask.description}
          </p>

          {/* Instructions List */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1 text-[11px] uppercase tracking-wider">
              Instruksi Pengerjaan:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              {selectedTask.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-slate-600 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-700">Luaran Tugas: </span>
              <span className="font-mono text-slate-800">{selectedTask.submissionFormat}</span>
            </div>

            {/* Template links */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedTask.templateUrl && (
                <a
                  href={selectedTask.templateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-semibold text-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Buka Template Google Docs ({selectedTask.templateName})</span>
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </a>
              )}

              {selectedTask.canvaUrl && (
                <a
                  href={selectedTask.canvaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-md font-semibold text-xs transition-colors"
                >
                  <Palette className="w-3.5 h-3.5 text-purple-700" />
                  <span>Buka Contoh Desain X-Banner di Canva</span>
                  <ExternalLink className="w-3 h-3 text-purple-600" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Guidelines on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-100">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Formulir Pengunggahan Berkas Tugas
              </h2>
              <p className="text-xs text-slate-500">
                Pilih nama peserta dan lampirkan dokumen luaran sesuai format ketentuan
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Pilih Peserta */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Nama Peserta (Total 48 Peserta) <span className="text-rose-500">*</span>
              </label>

              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Filter nama atau asal instansi..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>

                <select
                  required
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Pilih Nama Peserta Pengumpul --</option>
                  {filteredParticipantsForSelect.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.no}. {p.name} - {p.institution} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Tugas Peserta Terpilih */}
              {selectedParticipant && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      {selectedParticipant.name}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {participantSubmissionsList.length} dari {DIKLAT_TASKS.length} Tugas Terkumpul
                    </span>
                  </div>

                  {/* Progress pills for all 8 tasks */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {DIKLAT_TASKS.map((t) => {
                      const isSub = participantSubmissionsList.some((s) => s.taskId === t.id);
                      return (
                        <span
                          key={t.id}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                            isSub
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isSub && '✓'} {t.code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Pilih Tugas yang Dikumpulkan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tugas yang Dikumpulkan <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              >
                {DIKLAT_TASKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code}: {t.title} (Bobot {t.weight}%)
                  </option>
                ))}
              </select>

              {existingSubmission && (
                <div className="mt-2 text-xs bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-lg space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>
                      Tugas ini sudah pernah dikumpulkan pada {existingSubmission.submittedAt}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded font-semibold text-[10px]">
                      {existingSubmission.status} {existingSubmission.score ? `(Nilai: ${existingSubmission.score})` : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    File: {existingSubmission.fileName}. Jika mengirim kembali, tugas akan diperbarui (revisi).
                  </p>
                </div>
              )}
            </div>

            {/* 3. Judul Portofolio / Berkas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Dokumen / Laporan Tugas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Contoh: Laporan Analisis TI Perpustakaan SMPN 13 Madiun"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* 4. Unggah Berkas & Tautan Cloud */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unggah Berkas Dokumen ({selectedTask.id === 'tugas-8' ? 'Video MP4 / Link' : 'DOCX, PDF, ZIP'})
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors bg-white">
                  <input
                    type="file"
                    id="task-file-upload"
                    accept=".doc,.docx,.pdf,.mp4,.zip,.rar"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="task-file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    {selectedTask.id === 'tugas-8' ? (
                      <Video className="w-8 h-8 text-emerald-700" />
                    ) : (
                      <FolderOpen className="w-8 h-8 text-emerald-700" />
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      Klik untuk memilih berkas dari komputer/ponsel
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedTask.id === 'tugas-8'
                        ? 'Format didukung: Video MP4 (durasi 30 detik s.d. 2 menit)'
                        : 'Format didukung: Microsoft Word (.docx), PDF, ZIP'}
                    </span>
                  </label>

                  {uploadedFileName && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-medium">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>{uploadedFileName}</span>
                      <span className="text-slate-400">({uploadedFileSize})</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Atau Cantumkan Tautan Google Drive / Dropbox / YouTube
                </label>
                <input
                  type="url"
                  value={docLink}
                  onChange={(e) => setDocLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  *Pastikan hak akses tautan Google Drive disetel ke "Siapa saja yang memiliki link dapat melihat (Viewer)".
                </p>
              </div>
            </div>

            {/* 5. Catatan Pengantar */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Pengantar / Keterangan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan untuk instruktur / narasumber penilai..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Dokumen Tugas Praktik</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Submission Guidelines */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" /> Ketentuan Luaran Tugas (Tata Tertib)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Seluruh tugas praktik wajib dikerjakan secara mandiri, orisinal, dan berbasis kondisi riil sekolah masing-masing:
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Format Standar Laporan:</span>
                <span className="font-bold text-emerald-400 font-mono">.docx (Word)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Jenis Huruf & Spasi:</span>
                <span className="font-bold text-emerald-400">Times New Roman 12, Spasi 1.5</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Larangan Plagiasi:</span>
                <span className="font-bold text-rose-400">Dilarang Keras Meniru Dokumen Lain</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Video Yel-Yel BLC:</span>
                <span className="font-bold text-emerald-400 font-mono">.mp4 (30 dtk - 2 mnt)</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Status Pengumpulan Berkas
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xl font-bold font-mono text-slate-900">
                  {submissions.length}
                </div>
                <div className="text-[11px] text-slate-500">Total Masuk</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-xl font-bold font-mono text-emerald-700">
                  {submissions.filter((s) => s.status === 'Dinilai').length}
                </div>
                <div className="text-[11px] text-emerald-800">Telah Dinilai</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-xl font-bold font-mono text-amber-700">
                  {submissions.filter((s) => s.status === 'Belum Dinilai').length}
                </div>
                <div className="text-[11px] text-amber-800">Menunggu</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Tugas Praktik Terkumpul
            </h2>
            <p className="text-xs text-slate-500">
              Dokumen dan video yang telah berhasil diunggah oleh peserta diklat
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
                placeholder="Cari peserta / tugas..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
              />
            </div>

            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Semua Tugas</option>
              {DIKLAT_TASKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Semua Status Nilai</option>
              <option value="Dinilai">Dinilai</option>
              <option value="Belum Dinilai">Belum Dinilai</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Belum ada tugas yang cocok dengan filter pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold w-12 text-center">No</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Peserta</th>
                  <th className="py-2.5 px-3 font-semibold">Tugas Diklat</th>
                  <th className="py-2.5 px-3 font-semibold">Judul & Berkas</th>
                  <th className="py-2.5 px-3 font-semibold">Waktu Unggah</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Nilai</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Aksi / Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-center">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{sub.participantName}</div>
                      <div className="text-[11px] text-slate-500">{sub.institution}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {DIKLAT_TASKS.find((t) => t.id === sub.taskId)?.code || sub.taskId}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{sub.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>{sub.fileName}</span>
                        {sub.docLink && (
                          <a
                            href={sub.docLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-0.5 ml-1 font-semibold"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Buka Tautan
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {sub.submittedAt}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {sub.score !== undefined && sub.score !== null ? (
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {sub.score}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                          sub.status === 'Dinilai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'Perlu Revisi'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onOpenGradingModal && (
                          <button
                            onClick={() => onOpenGradingModal(sub)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-300 transition-colors"
                          >
                            {isAdminMode ? 'Beri Nilai' : 'Lihat Review'}
                          </button>
                        )}
                      </div>
                    </td>
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
