import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  Link as LinkIcon,
  X,
  Code2,
  Copy,
  Check,
  LogOut,
  Send,
} from 'lucide-react';
import {
  SpreadsheetConfig,
  createDiklatSpreadsheet,
  saveSpreadsheetConfig,
  syncAllDataToGoogleSheet,
} from '../services/googleSheets';
import { googleSignIn, logoutGoogle } from '../services/googleAuth';
import { Participant, AttendanceRecord, TaskSubmission } from '../types';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  accessToken: string | null;
  onAuthSuccess: (user: User, token: string) => void;
  onAuthLogout: () => void;
  spreadsheetConfig: SpreadsheetConfig | null;
  onUpdateConfig: (config: SpreadsheetConfig | null) => void;
  participants: Participant[];
  attendance: AttendanceRecord[];
  submissions: TaskSubmission[];
  onShowToast: (msg: string) => void;
  isAdminMode?: boolean;
  onRequestAdmin?: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  accessToken,
  onAuthSuccess,
  onAuthLogout,
  spreadsheetConfig,
  onUpdateConfig,
  participants,
  attendance,
  submissions,
  onShowToast,
  isAdminMode = false,
  onRequestAdmin,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [sheetTitleInput, setSheetTitleInput] = useState(
    'Rekap Diklat Kapus Perpustakaan - AGPAII Jatim & UIN SATU'
  );
  const [activeSubTab, setActiveSubTab] = useState<'oauth' | 'webhook'>('oauth');
  const [webhookInput, setWebhookInput] = useState(spreadsheetConfig?.webhookUrl || '');
  const [isCopiedScript, setIsCopiedScript] = useState(false);

  // Confirmation modal state for destructive sync
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);

  if (!isOpen) return null;

  // Extract ID from URL or return raw
  const extractSpreadsheetId = (input: string): string => {
    const trimmed = input.trim();
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : trimmed;
  };

  // Google Sign-In Handler
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthSuccess(res.user, res.accessToken);
        onShowToast(`Berhasil login sebagai ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Gagal login dengan akun Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google Sign-Out Handler
  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      onAuthLogout();
      onShowToast('Akun Google berhasil keluar');
    } catch (err) {
      console.error(err);
    }
  };

  // Create new spreadsheet in Google Drive
  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      onShowToast('Silakan masuk dengan akun Google terlebih dahulu');
      return;
    }

    setIsCreatingSheet(true);
    try {
      const created = await createDiklatSpreadsheet(accessToken, sheetTitleInput);
      const newConfig: SpreadsheetConfig = {
        spreadsheetId: created.spreadsheetId,
        spreadsheetTitle: created.spreadsheetTitle,
        spreadsheetUrl: created.spreadsheetUrl,
        connectedAt: new Date().toISOString(),
        webhookUrl: webhookInput || undefined,
        autoSync: true,
      };
      saveSpreadsheetConfig(newConfig);
      onUpdateConfig(newConfig);

      // Perform initial sync immediately
      await syncAllDataToGoogleSheet(
        accessToken,
        created.spreadsheetId,
        participants,
        attendance,
        submissions
      );

      onShowToast('Google Spreadsheet resmi berhasil dibuat dan data disinkronkan!');
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Gagal membuat Google Spreadsheet');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Connect Existing Spreadsheet
  const handleConnectExisting = () => {
    const sheetId = extractSpreadsheetId(manualInput);
    if (!sheetId) {
      onShowToast('Masukkan ID atau Tautan Google Spreadsheet yang valid');
      return;
    }

    const newConfig: SpreadsheetConfig = {
      spreadsheetId: sheetId,
      spreadsheetTitle: 'Google Spreadsheet Diklat Kapus (Kustom)',
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
      connectedAt: new Date().toISOString(),
      webhookUrl: webhookInput || undefined,
      autoSync: true,
    };

    saveSpreadsheetConfig(newConfig);
    onUpdateConfig(newConfig);
    onShowToast('Google Spreadsheet berhasil dihubungkan.');
    setManualInput('');
  };

  // Disconnect spreadsheet
  const handleDisconnect = () => {
    saveSpreadsheetConfig(null);
    onUpdateConfig(null);
    onShowToast('Tautan Spreadsheet berhasil dilepas');
  };

  // Full Sync Trigger
  const handleExecuteSync = async () => {
    if (!accessToken || !spreadsheetConfig) return;
    setShowSyncConfirm(false);
    setIsSyncing(true);

    try {
      const res = await syncAllDataToGoogleSheet(
        accessToken,
        spreadsheetConfig.spreadsheetId,
        participants,
        attendance,
        submissions
      );
      onShowToast(
        `Sukses! ${res.totalPresensi} presensi & ${res.totalTugas} tugas terkirim ke Google Sheets.`
      );
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Gagal mengirim data ke Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Save Webhook URL
  const handleSaveWebhook = () => {
    if (spreadsheetConfig) {
      const updated = { ...spreadsheetConfig, webhookUrl: webhookInput.trim() };
      saveSpreadsheetConfig(updated);
      onUpdateConfig(updated);
    } else if (webhookInput.trim()) {
      const dummyConfig: SpreadsheetConfig = {
        spreadsheetId: 'webhook-only',
        spreadsheetTitle: 'Integrasi Google Apps Script Webhook',
        spreadsheetUrl: '#',
        connectedAt: new Date().toISOString(),
        webhookUrl: webhookInput.trim(),
        autoSync: true,
      };
      saveSpreadsheetConfig(dummyConfig);
      onUpdateConfig(dummyConfig);
    }
    onShowToast('Pengaturan Google Apps Script Webhook disimpan');
  };

  // Copy sample script for Apps Script
  const sampleAppsScript = `// Kode Google Apps Script (Ekstensi > Apps Script di Spreadsheet Anda)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var contents = JSON.parse(e.postData.contents);
    var type = contents.type; // 'presensi' atau 'tugas'
    var data = contents.data;

    if (type === 'presensi') {
      var targetSheet = sheet.getSheetByName('Presensi Diklat') || sheet.insertSheet('Presensi Diklat');
      targetSheet.appendRow([
        new Date(), data.timestamp, data.participantId, data.participantName,
        data.institution, data.city, data.sessionId, data.sessionTitle,
        data.status, data.notes || '-'
      ]);
    } else if (type === 'tugas') {
      var targetSheet = sheet.getSheetByName('Pengumpulan Tugas') || sheet.insertSheet('Pengumpulan Tugas');
      targetSheet.appendRow([
        new Date(), data.submittedAt, data.participantId, data.participantName,
        data.institution, data.taskId, data.taskTitle, data.title,
        data.docLink || data.fileUrl || '-', data.notes || '-'
      ]);
    }
    return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(sampleAppsScript);
    setIsCopiedScript(true);
    setTimeout(() => setIsCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Integrasi Google Sheets Terpadu</h2>
              <p className="text-xs text-emerald-100">
                Kirim data presensi dan tugas diklat secara otomatis ke spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveSubTab('oauth')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeSubTab === 'oauth'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Google Sheets API (Resmi 1-Klik)
          </button>
          <button
            onClick={() => setActiveSubTab('webhook')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeSubTab === 'webhook'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Google Apps Script Webhook (Opsional)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeSubTab === 'oauth' && (
            <>
              {/* Account Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {currentUser ? (
                    <>
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Google Avatar"
                          className="w-10 h-10 rounded-full border border-slate-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                          {currentUser.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            {currentUser.displayName || 'Akun Google Terhubung'}
                          </p>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Terotorisasi
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{currentUser.email}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Belum Terhubung ke Akun Google
                      </p>
                      <p className="text-xs text-slate-500">
                        Masuk untuk membuat atau memperbarui spreadsheet di Google Drive Anda
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  {currentUser ? (
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Keluar
                    </button>
                  ) : (
                    <button
                      onClick={handleSignIn}
                      disabled={isLoggingIn}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                        />
                      </svg>
                      {isLoggingIn ? 'Memproses...' : 'Sign in with Google'}
                    </button>
                  )}
                </div>
              </div>

              {/* Connected Spreadsheet Box */}
              {spreadsheetConfig ? (
                <div className="border border-emerald-300 bg-emerald-50/70 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                        Spreadsheet Aktif
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {spreadsheetConfig.spreadsheetTitle}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        ID: {spreadsheetConfig.spreadsheetId}
                      </p>
                    </div>
                    <a
                      href={spreadsheetConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Buka Google Sheets
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-emerald-200">
                    <div>
                      <span className="text-slate-500 block">Tab 1:</span>
                      <span className="font-semibold text-slate-800">Presensi Diklat ({attendance.length} data)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tab 2:</span>
                      <span className="font-semibold text-slate-800">Pengumpulan Tugas ({submissions.length} data)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tab 3:</span>
                      <span className="font-semibold text-slate-800">Rekap Nilai ({participants.length} Peserta)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={spreadsheetConfig.autoSync}
                        onChange={(e) => {
                          const updated = { ...spreadsheetConfig, autoSync: e.target.checked };
                          saveSpreadsheetConfig(updated);
                          onUpdateConfig(updated);
                          onShowToast(
                            e.target.checked
                              ? 'Sinkronisasi otomatis diaktifkan'
                              : 'Sinkronisasi otomatis dinonaktifkan'
                          );
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Kirim otomatis setiap ada presensi/tugas baru (Realtime)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowSyncConfirm(true)}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Mengirim...' : 'Sinkronkan Semua Sekarang'}
                      </button>
                      {isAdminMode && (
                        <button
                          onClick={handleDisconnect}
                          className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 font-semibold"
                        >
                          Lepas Tautan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : !isAdminMode ? (
                /* Participant notice when spreadsheet is not yet configured */
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Pengaturan Spreadsheet Dikelola Oleh Panitia
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Pengaturan koneksi Google Sheets dan pembuatan lembar kerja Drive hanya dapat dilakukan oleh Panitia / Instruktur Diklat.
                    </p>
                  </div>
                  {onRequestAdmin && (
                    <button
                      onClick={() => {
                        onClose();
                        onRequestAdmin();
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                    >
                      Buka Akses Panitia (PIN)
                    </button>
                  )}
                </div>
              ) : (
                /* Setup Options when not yet connected (Admin Mode) */
                <div className="space-y-4">
                  {/* Option A: Create New Spreadsheet (Recommended) */}
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition bg-white shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <PlusCircle className="w-4 h-4" />
                      <span>Pilihan 1: Buat Spreadsheet Baru di Google Drive (Rekomendasi)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Sistem akan membuat file spreadsheet baru dengan struktur 3 tab lengkap:
                      Presensi, Pengumpulan Tugas, dan Rekapitulasi Nilai ({participants.length} Peserta).
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={sheetTitleInput}
                        onChange={(e) => setSheetTitleInput(e.target.value)}
                        placeholder="Judul Spreadsheet"
                        className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        onClick={handleCreateNewSheet}
                        disabled={isCreatingSheet || !currentUser}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        {isCreatingSheet ? 'Sedang Membuat...' : 'Buat di Google Drive'}
                      </button>
                    </div>
                    {!currentUser && (
                      <p className="text-[11px] text-amber-700 mt-2">
                        * Perlu masuk dengan akun Google terlebih dahulu di panel atas.
                      </p>
                    )}
                  </div>

                  {/* Option B: Connect Existing Spreadsheet */}
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition bg-white shadow-sm">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <LinkIcon className="w-4 h-4 text-slate-500" />
                      <span>Pilihan 2: Hubungkan Spreadsheet yang Sudah Ada</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Tempelkan URL lengkap Google Spreadsheet atau Spreadsheet ID panitia.
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit"
                        className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                      <button
                        onClick={handleConnectExisting}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition whitespace-nowrap"
                      >
                        Hubungkan ID
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeSubTab === 'webhook' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Kirim Data Tanpa Login Peserta (Google Apps Script Webhook)
                </p>
                <p className="mt-1 text-slate-600">
                  Jika Anda ingin data presensi dan tugas dikirim langsung dari perangkat HP peserta
                  tanpa mengharuskan setiap peserta login akun Google, Anda dapat memasang Apps
                  Script di Spreadsheet Anda dan menempelkan Web App URL di bawah.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Apps Script Web App URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookInput}
                    onChange={(e) => setWebhookInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveWebhook}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold whitespace-nowrap"
                  >
                    Simpan Webhook
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">
                    Skrip Google Apps Script Siap Pasang:
                  </span>
                  <button
                    onClick={copyScriptToClipboard}
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    {isCopiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Salin Kode Skrip
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto font-mono max-h-48 border border-slate-700">
                  {sampleAppsScript}
                </pre>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cara pasang: Buka Google Sheets &gt; Klik <b>Ekstensi</b> &gt; <b>Apps Script</b>{' '}
                  &gt; Tempel kode ini &gt; Klik <b>Terapkan (Deploy)</b> sebagai Web App &gt; Akses:{' '}
                  <b>Siapa Saja (Anyone)</b>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {spreadsheetConfig
              ? `Status: Terhubung ke spreadsheet (${spreadsheetConfig.spreadsheetTitle})`
              : 'Status: Belum terhubung ke spreadsheet'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Destructive / Mutating Operation (MANDATORY per Workspace Integration Skill) */}
      {showSyncConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Sinkronisasi Data Spreadsheet
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Tindakan ini akan mengirim dan memperbarui seluruh data ke Google Spreadsheet:
                </p>
                <ul className="text-xs text-slate-700 mt-2 list-disc list-inside space-y-1 font-medium bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <li>
                    <b>{attendance.length}</b> rekaman presensi peserta
                  </li>
                  <li>
                    <b>{submissions.length}</b> berkas tugas yang terkumpul
                  </li>
                  <li>
                    <b>{participants.length}</b> peserta dalam tabel rekapitulasi nilai
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSyncConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteSync}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Ya, Sinkronkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
