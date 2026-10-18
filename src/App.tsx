/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, Participant, AttendanceRecord, TaskSubmission } from './types';
import {
  getStoredParticipants,
  getStoredAttendance,
  saveAttendance,
  getStoredSubmissions,
  saveSubmissions,
  resetAllData,
  exportAllDataJSON,
} from './utils/storage';
import { Header } from './components/Header';
import { HomeSection } from './components/HomeSection';
import { AttendanceSection } from './components/AttendanceSection';
import { SubmissionSection } from './components/SubmissionSection';
import { RecapSection } from './components/RecapSection';
import { CheckMandiriSection } from './components/CheckMandiriSection';
import { ParticipantProgressModal } from './components/ParticipantProgressModal';
import { AdminGradingModal } from './components/AdminGradingModal';
import { OfficialPrintReport } from './components/OfficialPrintReport';
import { Footer } from './components/Footer';
import { Shield, RefreshCw, Download, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Modals state
  const [selectedParticipantModal, setSelectedParticipantModal] = useState<Participant | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<TaskSubmission | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load data on mount
  useEffect(() => {
    setParticipants(getStoredParticipants());
    setAttendance(getStoredAttendance());
    setSubmissions(getStoredSubmissions());
  }, []);

  // Handler: Save Attendance
  const handleSaveAttendance = (newRecord: AttendanceRecord) => {
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) => !(a.participantId === newRecord.participantId && a.sessionId === newRecord.sessionId)
      );
      const updated = [newRecord, ...filtered];
      saveAttendance(updated);
      return updated;
    });
    showToast(`Presensi ${newRecord.participantName} berhasil disimpan.`);
  };

  // Handler: Delete Attendance (Admin Only)
  const handleDeleteAttendance = (id: string) => {
    if (!isAdminMode) return;
    if (confirm('Apakah Anda yakin ingin menghapus rekaman presensi ini?')) {
      setAttendance((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        saveAttendance(updated);
        return updated;
      });
      showToast('Rekaman presensi berhasil dihapus.');
    }
  };

  // Handler: Save Submission
  const handleSaveSubmission = (newSub: TaskSubmission) => {
    setSubmissions((prev) => {
      const filtered = prev.filter(
        (s) => !(s.participantId === newSub.participantId && s.taskId === newSub.taskId)
      );
      const updated = [newSub, ...filtered];
      saveSubmissions(updated);
      return updated;
    });
    showToast(`Tugas ${newSub.title} berhasil disimpan.`);
  };

  // Handler: Save Grading from Instructor Modal
  const handleSaveGrading = (updatedSub: TaskSubmission) => {
    setSubmissions((prev) => {
      const updated = prev.map((s) => (s.id === updatedSub.id ? updatedSub : s));
      saveSubmissions(updated);
      return updated;
    });
    showToast(`Penilaian tugas untuk ${updatedSub.participantName} berhasil disimpan.`);
  };

  // Handler: Reset to factory default
  const handleResetData = () => {
    if (confirm('Kembalikan semua data ke pengaturan awal sampel diklat?')) {
      resetAllData();
      setParticipants(getStoredParticipants());
      setAttendance(getStoredAttendance());
      setSubmissions(getStoredSubmissions());
      showToast('Data berhasil di-reset ke nilai default.');
    }
  };

  // Handler: Backup JSON
  const handleBackupJSON = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_diklat_perpus_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // If Official Print Report is active, render full-screen printable document
  if (isPrintReportOpen) {
    return (
      <OfficialPrintReport
        participants={participants}
        attendance={attendance}
        submissions={submissions}
        onClose={() => setIsPrintReportOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Mode Bar Banner (when activated) */}
      {isAdminMode && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Mode Panitia / Instruktur Aktif — Anda memiliki hak asesmen nilai, edit status tugas, dan verifikasi kehadiran peserta.
            </span>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleBackupJSON}
                className="hover:underline flex items-center gap-1 font-bold"
              >
                <Download className="w-3 h-3" /> Backup JSON
              </button>
              <button
                onClick={handleResetData}
                className="hover:underline flex items-center gap-1 text-amber-200"
              >
                <RefreshCw className="w-3 h-3" /> Reset Demo
              </button>
              <button
                onClick={() => setIsAdminMode(false)}
                className="bg-amber-800 px-2 py-0.5 rounded text-[11px] hover:bg-amber-900"
              >
                Tutup Mode Panitia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminMode={isAdminMode}
        onToggleAdmin={() => {
          setIsAdminMode(!isAdminMode);
          showToast(!isAdminMode ? 'Mode Panitia Diaktifkan' : 'Mode Panitia Dimatikan');
        }}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'beranda' && (
          <HomeSection
            participants={participants}
            attendance={attendance}
            submissions={submissions}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'presensi' && (
          <AttendanceSection
            participants={participants}
            attendance={attendance}
            onSaveAttendance={handleSaveAttendance}
            onDeleteAttendance={isAdminMode ? handleDeleteAttendance : undefined}
          />
        )}

        {activeTab === 'tugas' && (
          <SubmissionSection
            participants={participants}
            submissions={submissions}
            onSaveSubmission={handleSaveSubmission}
            onOpenGradingModal={(sub) => setGradingSubmission(sub)}
            isAdminMode={isAdminMode}
          />
        )}

        {activeTab === 'rekap' && (
          <RecapSection
            participants={participants}
            attendance={attendance}
            submissions={submissions}
            onOpenParticipantModal={(p) => setSelectedParticipantModal(p)}
            onOpenPrintReport={() => setIsPrintReportOpen(true)}
          />
        )}

        {activeTab === 'cek-mandiri' && (
          <CheckMandiriSection
            participants={participants}
            attendance={attendance}
            submissions={submissions}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Modals */}
      {selectedParticipantModal && (
        <ParticipantProgressModal
          participant={selectedParticipantModal}
          attendance={attendance}
          submissions={submissions}
          onClose={() => setSelectedParticipantModal(null)}
        />
      )}

      {gradingSubmission && (
        <AdminGradingModal
          submission={gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          onSaveGrading={handleSaveGrading}
          isAdminMode={isAdminMode}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
