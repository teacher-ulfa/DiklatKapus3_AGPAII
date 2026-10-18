import React, { useState } from 'react';
import { TaskSubmission, SubmissionStatus } from '../types';
import { DIKLAT_TASKS } from '../data/diklatData';
import { X, Award, CheckCircle, ExternalLink, FileText, User, Building } from 'lucide-react';

interface AdminGradingModalProps {
  submission: TaskSubmission | null;
  onClose: () => void;
  onSaveGrading: (updatedSubmission: TaskSubmission) => void;
  isAdminMode: boolean;
}

export const AdminGradingModal: React.FC<AdminGradingModalProps> = ({
  submission,
  onClose,
  onSaveGrading,
  isAdminMode,
}) => {
  if (!submission) return null;

  const [score, setScore] = useState<number | ''>(submission.score ?? 85);
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? '');
  const [reviewer, setReviewer] = useState<string>(
    submission.reviewedBy || 'Dr. Ahmad Fahrudin, M.Pd.I. (Kepala UPT Perpustakaan UIN SATU)'
  );

  const taskObj = DIKLAT_TASKS.find((t) => t.id === submission.taskId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const updated: TaskSubmission = {
      ...submission,
      score: score === '' ? undefined : Number(score),
      status,
      feedback: feedback.trim(),
      reviewedBy: reviewer,
      reviewedAt: formattedDate,
    };

    onSaveGrading(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {isAdminMode ? 'Penilaian Portofolio Tugas Peserta' : 'Detail Review Tugas Peserta'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Participant Info Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-900 text-sm">{submission.participantName}</div>
            <div className="text-slate-600">{submission.institution}</div>
            <div className="text-emerald-800 font-semibold pt-1">
              {taskObj?.code}: {taskObj?.title}
            </div>
          </div>

          {/* Submission Details */}
          <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 border border-slate-200 rounded-xl">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Judul Karya/Laporan:</span>
              <span className="font-semibold text-slate-900">{submission.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Waktu Pengumpulan:</span>
              <span className="font-mono text-slate-600">{submission.submittedAt}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Berkas Dokumen:</span>
              <span className="font-mono text-slate-800 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {submission.fileName} ({submission.fileSize || '1.8 MB'})
              </span>
            </div>
            {submission.docLink && (
              <div className="pt-1">
                <a
                  href={submission.docLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" /> Buka Berkas di Google Drive
                </a>
              </div>
            )}
            {submission.notes && (
              <div className="pt-1 text-slate-500 border-t border-slate-100">
                <span className="font-medium text-slate-700">Catatan Peserta: </span>
                {submission.notes}
              </div>
            )}
          </div>

          {isAdminMode ? (
            /* Admin Grading Form Inputs */
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                {/* Score Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nilai Angka (0 - 100) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status Verifikasi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Dinilai">Dinilai (Lulus/Sah)</option>
                    <option value="Perlu Revisi">Perlu Revisi</option>
                    <option value="Belum Dinilai">Belum Dinilai</option>
                  </select>
                </div>
              </div>

              {/* Reviewer / Instruktur Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Penilai / Instruktur
                </label>
                <select
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Dr. Ahmad Fahrudin, M.Pd.I. (Kepala UPT Perpustakaan UIN SATU)">
                    Dr. Ahmad Fahrudin, M.Pd.I. (Kepala UPT Perpustakaan UIN SATU)
                  </option>
                  <option value="Galuh Indah Zatadini, M.Eng. (Dosen Ilmu Perpustakaan UIN SATU)">
                    Galuh Indah Zatadini, M.Eng. (Dosen Ilmu Perpustakaan UIN SATU)
                  </option>
                  <option value="Nafahatin Nur, S.IIP. (Pustakawan UIN SATU Tulungagung)">
                    Nafahatin Nur, S.IIP. (Pustakawan UIN SATU Tulungagung)
                  </option>
                  <option value="Endang Rifngati, S.Sos. (Pustakawan UIN SATU Tulungagung)">
                    Endang Rifngati, S.Sos. (Pustakawan UIN SATU Tulungagung)
                  </option>
                  <option value="Evi Zulfiyana, S.I.Pust. (Pustakawan UIN SATU Tulungagung)">
                    Evi Zulfiyana, S.I.Pust. (Pustakawan UIN SATU Tulungagung)
                  </option>
                  <option value="Laila Rifa'atul Azizah, S.AP. (Pustakawan UIN SATU Tulungagung)">
                    Laila Rifa'atul Azizah, S.AP. (Pustakawan UIN SATU Tulungagung)
                  </option>
                  <option value="Nurul Setyawati Handayani, M.A. (Dosen Ilmu Perpustakaan UIN SATU)">
                    Nurul Setyawati Handayani, M.A. (Dosen Ilmu Perpustakaan UIN SATU)
                  </option>
                  <option value="Erma Awalien Rochmah, S.E. (Pustakawan UIN SATU Tulungagung)">
                    Erma Awalien Rochmah, S.E. (Pustakawan UIN SATU Tulungagung)
                  </option>
                  <option value="Dr. H. Mohammad Ahsan, M.Pd.I (Ketua DPW AGPAII Jatim)">
                    Dr. H. Mohammad Ahsan, M.Pd.I (Ketua DPW AGPAII Jatim)
                  </option>
                  <option value="Tim Asesor Diklat DPW AGPAII & UPT Perpustakaan UIN SATU">
                    Tim Asesor Diklat DPW AGPAII & UPT Perpustakaan UIN SATU
                  </option>
                </select>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Koreksi / Feedback Konstruktif
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Berikan masukan perbaikan atau apresiasi terhadap hasil kerja peserta..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Simpan Penilaian
                </button>
              </div>
            </div>
          ) : (
            /* Read-only Review details for non-admin */
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="font-bold text-slate-900 flex justify-between">
                  <span>Nilai: {submission.score ?? 'Belum ada'}</span>
                  <span>Status: {submission.status}</span>
                </div>
                {submission.feedback && (
                  <p className="mt-2 text-slate-700 italic">
                    "{submission.feedback}"
                  </p>
                )}
                {submission.reviewedBy && (
                  <div className="text-[11px] text-slate-500 mt-1">
                    Instruktur: {submission.reviewedBy} ({submission.reviewedAt})
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
