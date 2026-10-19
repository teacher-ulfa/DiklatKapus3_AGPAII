/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
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
import {
  SpreadsheetConfig,
  getSavedSpreadsheetConfig,
  saveSpreadsheetConfig,
  appendAttendanceToSheet,
  appendSubmissionToSheet,
  forwardToAppsScriptWebhook,
} from './services/googleSheets';
import { initAuth, logoutGoogle } from './services/googleAuth';
import { Header } from './components/Header';
import { HomeSection } from './components/HomeSection';
import { AttendanceSection } from './components/AttendanceSection';
import { SubmissionSection } from './components/SubmissionSection';
import { RecapSection } from './components/RecapSection';
import { CheckMandiriSection } from './components/CheckMandiriSection';
import { ParticipantProgressModal } from './components/ParticipantProgressModal';
import { AdminGradingModal } from './components/AdminGradingModal';
import { OfficialPrintReport } from './components/OfficialPrintReport';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { AdminPinModal } from './components/AdminPinModal';
import { ZoomModal } from './components/ZoomModal';
import { Footer } from './components/Footer';
import { Shield, RefreshCw, Download, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Zoom Meeting Modal State
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  // Google Workspace Auth & Sheets State (token stored strictly in memory)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig | null>(null);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState<boolean>(false);

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
    }, 4500);
  };

  // Load data & init Google Auth on mount
  useEffect(() => {
    setParticipants(getStoredParticipants());
    setAttendance(getStoredAttendance());
    setSubmissions(getStoredSubmissions());
    setSpreadsheetConfig(getSavedSpreadsheetConfig());

    // Listen to Firebase Google Auth state change
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Handler: Save Attendance with automatic Google Sheets forwarding
  const handleSaveAttendance = async (newRecord: AttendanceRecord) => {
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) => !(a.participantId === newRecord.participantId && a.sessionId === newRecord.sessionId)
      );
      const updated = [newRecord, ...filtered];
      saveAttendance(updated);
      return updated;
    });

    // Check if auto-sync to Google Spreadsheet is enabled
    if (
      spreadsheetConfig?.autoSync &&
      accessToken &&
      spreadsheetConfig.spreadsheetId &&
      spreadsheetConfig.spreadsheetId !== 'webhook-only'
    ) {
      try {
        await appendAttendanceToSheet(accessToken, spreadsheetConfig.spreadsheetId, newRecord);
        showToast(`Presensi ${newRecord.participantName} disimpan & terkirim ke Google Sheets!`);
      } catch (err: any) {
        console.warn('Google Sheets append warning:', err);
        showToast(`Presensi disimpan lokal (Google Sheets: ${err.message || 'menunggu sinkronisasi'})`);
      }
    } else {
      showToast(`Presensi ${newRecord.participantName} berhasil disimpan.`);
    }

    // Forward to Webhook if configured
    if (spreadsheetConfig?.webhookUrl) {
      forwardToAppsScriptWebhook(spreadsheetConfig.webhookUrl, 'presensi', newRecord);
    }
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

  // Handler: Save Submission with automatic Google Sheets forwarding
  const handleSaveSubmission = async (newSub: TaskSubmission) => {
    setSubmissions((prev) => {
      const filtered = prev.filter(
        (s) => !(s.participantId === newSub.participantId && s.taskId === newSub.taskId)
      );
      const updated = [newSub, ...filtered];
      saveSubmissions(updated);
      return updated;
    });

    // Check if auto-sync to Google Spreadsheet is enabled
    if (
      spreadsheetConfig?.autoSync &&
      accessToken &&
      spreadsheetConfig.spreadsheetId &&
      spreadsheetConfig.spreadsheetId !== 'webhook-only'
    ) {
      try {
        const p = participants.find((x) => x.id === newSub.participantId);
        await appendSubmissionToSheet(accessToken, spreadsheetConfig.spreadsheetId, newSub, p);
        showToast(`Tugas ${newSub.title} disimpan & terkirim ke Google Sheets!`);
      } catch (err: any) {
        console.warn('Google Sheets append warning:', err);
        showToast(`Tugas disimpan lokal (Google Sheets: ${err.message || 'menunggu sinkronisasi'})`);
      }
    } else {
      showToast(`Tugas ${newSub.title} berhasil disimpan.`);
    }

    // Forward to Webhook if configured
    if (spreadsheetConfig?.webhookUrl) {
      forwardToAppsScriptWebhook(spreadsheetConfig.webhookUrl, 'tugas', newSub);
    }
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
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fade-in max-w-md">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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
          if (isAdminMode) {
            setIsAdminMode(false);
            showToast('Mode Panitia ditutup (Kembali ke Mode Peserta)');
          } else {
            setIsPinModalOpen(true);
          }
        }}
        onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
        isSpreadsheetConnected={!!spreadsheetConfig}
        onOpenZoomModal={() => setIsZoomModalOpen(true)}
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
            spreadsheetConfig={spreadsheetConfig}
            onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
            onOpenZoomModal={() => setIsZoomModalOpen(true)}
          />
        )}

        {activeTab === 'presensi' && (
          <AttendanceSection
            participants={participants}
            attendance={attendance}
            onSaveAttendance={handleSaveAttendance}
            onDeleteAttendance={isAdminMode ? handleDeleteAttendance : undefined}
            spreadsheetConfig={spreadsheetConfig}
            onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
            onOpenZoomModal={() => setIsZoomModalOpen(true)}
          />
        )}

        {activeTab === 'tugas' && (
          <SubmissionSection
            participants={participants}
            submissions={submissions}
            onSaveSubmission={handleSaveSubmission}
            onOpenGradingModal={(sub) => setGradingSubmission(sub)}
            isAdminMode={isAdminMode}
            spreadsheetConfig={spreadsheetConfig}
            onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
          />
        )}

        {activeTab === 'rekap' && (
          <RecapSection
            participants={participants}
            attendance={attendance}
            submissions={submissions}
            onOpenParticipantModal={(p) => setSelectedParticipantModal(p)}
            onOpenPrintReport={() => setIsPrintReportOpen(true)}
            onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
            spreadsheetConfig={spreadsheetConfig}
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

      {/* Google Sheets Synchronization Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSpreadsheetModalOpen}
        onClose={() => setIsSpreadsheetModalOpen(false)}
        currentUser={currentUser}
        accessToken={accessToken}
        onAuthSuccess={(user, token) => {
          setCurrentUser(user);
          setAccessToken(token);
        }}
        onAuthLogout={() => {
          setCurrentUser(null);
          setAccessToken(null);
        }}
        spreadsheetConfig={spreadsheetConfig}
        onUpdateConfig={(config) => setSpreadsheetConfig(config)}
        participants={participants}
        attendance={attendance}
        submissions={submissions}
        onShowToast={showToast}
        isAdminMode={isAdminMode}
        onRequestAdmin={() => setIsPinModalOpen(true)}
      />

      {/* Admin PIN Verification Modal */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsAdminMode(true);
          showToast('Mode Panitia & Instruktur Berhasil Dibuka');
        }}
      />

      {/* Zoom Meeting Info & Join Modal */}
      <ZoomModal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
