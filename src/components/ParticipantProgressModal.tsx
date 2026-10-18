import React from 'react';
import { Participant, AttendanceRecord, TaskSubmission } from '../types';
import { DIKLAT_SESSIONS, DIKLAT_TASKS } from '../data/diklatData';
import { X, User, Building, MapPin, Award, CheckCircle2, Clock, Printer } from 'lucide-react';

interface ParticipantProgressModalProps {
  participant: Participant | null;
  attendance: AttendanceRecord[];
  submissions: TaskSubmission[];
  onClose: () => void;
}

export const ParticipantProgressModal: React.FC<ParticipantProgressModalProps> = ({
  participant,
  attendance,
  submissions,
  onClose,
}) => {
  if (!participant) return null;

  const participantAttendance = attendance.filter((a) => a.participantId === participant.id);
  const participantSubmissions = submissions.filter((s) => s.participantId === participant.id);

  const hadirCount = participantAttendance.filter((a) => a.status === 'Hadir').length;
  const attendancePct = Math.round((hadirCount / DIKLAT_SESSIONS.length) * 100);

  const scoredSubs = participantSubmissions.filter((s) => s.score !== undefined);
  const avgScore =
    scoredSubs.length > 0
      ? Math.round(scoredSubs.reduce((acc, c) => acc + (c.score || 0), 0) / scoredSubs.length)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-base">
              {participant.no}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {participant.name}
              </h3>
              <p className="text-xs text-slate-300">
                {participant.institution} · {participant.city} ({participant.province})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">
                Kehadiran
              </span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                {attendancePct}% ({hadirCount}/{DIKLAT_SESSIONS.length})
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">
                Tugas Masuk
              </span>
              <div className="text-lg font-bold font-mono text-blue-700 mt-0.5">
                {participantSubmissions.length} / {DIKLAT_TASKS.length}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">
                Rata-rata Nilai
              </span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {avgScore > 0 ? avgScore : '-'}
              </div>
            </div>
          </div>

          {/* Sesi Kehadiran */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Rincian Kehadiran Sesi Diklat
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DIKLAT_SESSIONS.map((s) => {
                const rec = participantAttendance.find((a) => a.sessionId === s.id);
                return (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800">{s.code}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{s.title}</p>
                    </div>
                    <div>
                      {rec ? (
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            rec.status === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'Izin'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Belum Presensi</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tugas */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Rincian Portofolio Tugas & RTL
            </h4>
            <div className="space-y-2 text-xs">
              {DIKLAT_TASKS.map((t) => {
                const sub = participantSubmissions.find((item) => item.taskId === t.id);
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {t.code}: {t.title}
                      </span>
                      {sub ? (
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            sub.status === 'Dinilai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.status} {sub.score !== undefined ? `(${sub.score})` : ''}
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold text-[10px]">
                          Belum Dikumpulkan
                        </span>
                      )}
                    </div>

                    {sub && (
                      <div className="text-[11px] text-slate-600">
                        <div>
                          Judul: <span className="font-medium text-slate-800">{sub.title}</span> (
                          {sub.fileName})
                        </div>
                        {sub.feedback && (
                          <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded text-slate-700 italic">
                            Review: {sub.feedback}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Status: {participant.status} ({participant.institution})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
