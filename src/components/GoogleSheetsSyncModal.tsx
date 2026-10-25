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
  Download,
  ClipboardCopy,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  SpreadsheetConfig,
  createDiklatSpreadsheet,
  saveSpreadsheetConfig,
  syncAllDataToGoogleSheet,
  syncAllToAppsScriptDirectly,
} from '../services/googleSheets';
import { saveSharedWebhookUrl } from '../utils/storage';
import { googleSignIn, logoutGoogle } from '../services/googleAuth';
import { Participant, AttendanceRecord, TaskSubmission } from '../types';
import { postSpreadsheetConfigApi, triggerSyncAllToWebhookApi, testWebhookApi } from '../services/diklatApi';
import {
  generateRecapCSV,
  generateAttendanceCSV,
  generatePanitiaExactSpreadsheetCSV,
  generatePanitiaClipboardTSV,
  downloadCSV,
} from '../utils/export';
import { DIKLAT_SESSIONS, DIKLAT_TASKS } from '../data/diklatData';

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
  const [isSyncingWebhook, setIsSyncingWebhook] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [sheetTitleInput, setSheetTitleInput] = useState(
    'Rekap Diklat Kapus Perpustakaan - AGPAII Jatim & UIN SATU'
  );
  // Default to copy-tsv for immediate 100% success rate without login hurdles
  const [activeSubTab, setActiveSubTab] = useState<'copy-tsv' | 'oauth' | 'webhook'>('copy-tsv');
  const [webhookInput, setWebhookInput] = useState(spreadsheetConfig?.webhookUrl || '');
  const [isCopiedScript, setIsCopiedScript] = useState(false);
  const [isCopiedTSV, setIsCopiedTSV] = useState(false);
  const [isCopiedTSVHeaders, setIsCopiedTSVHeaders] = useState(false);

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
      postSpreadsheetConfigApi(newConfig);

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
  const handleConnectExisting = async () => {
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
    postSpreadsheetConfigApi(newConfig);

    // If logged in with Google, perform immediate sync to user's existing spreadsheet
    if (accessToken) {
      try {
        await syncAllDataToGoogleSheet(accessToken, sheetId, participants, attendance, submissions);
        onShowToast('Berhasil terhubung & data disinkronkan ke Google Spreadsheet Anda!');
      } catch {
        onShowToast('Spreadsheet terhubung. Silakan klik tombol "Sinkronkan Sekarang".');
      }
    } else {
      onShowToast('Google Spreadsheet berhasil dihubungkan ke sistem portal diklat.');
    }
    setManualInput('');
  };

  // Disconnect spreadsheet
  const handleDisconnect = () => {
    saveSpreadsheetConfig(null);
    onUpdateConfig(null);
    postSpreadsheetConfigApi(null);
    onShowToast('Tautan Spreadsheet berhasil dilepas');
  };

  // Safe clipboard helper that never throws or crashes
  const copyToClipboardSafe = async (text: string): Promise<boolean> => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('Navigator clipboard failed, using fallback:', err);
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error('All clipboard copy methods failed:', fallbackErr);
      return false;
    }
  };

  // Full Sync Trigger - robust with zero-fail fallback
  const handleExecuteSync = async () => {
    setShowSyncConfirm(false);

    // If config is webhook-only, automatically route to webhook sync!
    if (
      spreadsheetConfig?.webhookUrl &&
      (spreadsheetConfig.spreadsheetId === 'webhook-only' || !spreadsheetConfig.spreadsheetId)
    ) {
      await handleBatchPushWebhook();
      return;
    }

    if (!spreadsheetConfig || !spreadsheetConfig.spreadsheetId) {
      onShowToast('Belum ada tautan spreadsheet yang terhubung. Masukkan URL spreadsheet Anda di bawah.');
      return;
    }

    let token = accessToken;
    if (!token) {
      onShowToast('Memerlukan autentikasi Google. Silakan login pada jendela pop-up...');
      try {
        const res = await googleSignIn();
        if (res) {
          token = res.accessToken;
          onAuthSuccess(res.user, res.accessToken);
        } else {
          onShowToast('Autentikasi Google dibatalkan. Anda tetap dapat menggunakan tab "Salin Cepat" (100% instan).');
          return;
        }
      } catch (authErr: any) {
        onShowToast('Gagal masuk Google: ' + (authErr.message || 'Izin ditolak'));
        return;
      }
    }

    setIsSyncing(true);
    try {
      const res = await syncAllDataToGoogleSheet(
        token,
        spreadsheetConfig.spreadsheetId,
        participants,
        attendance,
        submissions
      );
      onShowToast(
        `🎉 ALHAMDULILLAH! ${res.totalPresensi} data presensi berhasil masuk ke Google Spreadsheet Anda!`
      );
    } catch (err: any) {
      console.error('Sync error:', err);
      // If API sync fails (e.g. 403 permission), offer clear advice
      if (spreadsheetConfig?.webhookUrl) {
        onShowToast('API Sheets gagal. Mengalihkan ke sinkronisasi Webhook...');
        await handleBatchPushWebhook();
      } else {
        onShowToast(
          err.message || 'Gagal sinkronisasi API. Silakan gunakan tab "Salin Cepat" (Ctrl+V) yang 100% langsung berhasil.'
        );
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Save Webhook URL
  const handleSaveWebhook = () => {
    let finalConfig: SpreadsheetConfig | null = null;
    if (spreadsheetConfig) {
      finalConfig = { ...spreadsheetConfig, webhookUrl: webhookInput.trim() };
    } else if (webhookInput.trim()) {
      finalConfig = {
        spreadsheetId: 'webhook-only',
        spreadsheetTitle: 'Integrasi Google Apps Script Webhook',
        spreadsheetUrl: '#',
        connectedAt: new Date().toISOString(),
        webhookUrl: webhookInput.trim(),
        autoSync: true,
      };
    }
    if (finalConfig) {
      saveSpreadsheetConfig(finalConfig);
      onUpdateConfig(finalConfig);
      postSpreadsheetConfigApi(finalConfig);
      onShowToast('Pengaturan Google Apps Script Webhook disimpan ke database pusat');
    }
  };

  // Save Webhook URL & Immediately Push All Data in 1-Click
  const handleSaveAndPushWebhook = async () => {
    const rawUrl = webhookInput.trim() || spreadsheetConfig?.webhookUrl || '';
    if (!rawUrl) {
      onShowToast('Masukkan URL Webhook Google Apps Script terlebih dahulu');
      return;
    }
    if (rawUrl.includes('docs.google.com/spreadsheets')) {
      onShowToast('⚠️ Tautan yang Anda masukkan adalah tautan file Spreadsheet, bukan tautan Web App Apps Script.');
      return;
    }

    const finalConfig: SpreadsheetConfig = {
      spreadsheetId: 'webhook-only',
      spreadsheetTitle: 'Integrasi Google Apps Script Webhook',
      spreadsheetUrl: '#',
      connectedAt: new Date().toISOString(),
      webhookUrl: rawUrl,
      autoSync: true,
    };

    saveSpreadsheetConfig(finalConfig);
    saveSharedWebhookUrl(rawUrl);
    onUpdateConfig(finalConfig);
    postSpreadsheetConfigApi(finalConfig);

    setIsSyncingWebhook(true);
    try {
      // 1. Try server-side sync first (if running on Node server)
      let syncedOnServer = false;
      try {
        const res = await triggerSyncAllToWebhookApi(rawUrl);
        if (res && res.success) {
          syncedOnServer = true;
          onShowToast(
            `🎉 ALHAMDULILLAH! ${res.sentCount} data presensi & ${res.sentTugasCount || 0} tugas berhasil masuk ke Spreadsheet Anda!`
          );
        }
      } catch {
        syncedOnServer = false;
      }

      // 2. Direct browser fallback (crucial for Vercel/GitHub static deployment!)
      if (!syncedOnServer) {
        const directRes = await syncAllToAppsScriptDirectly(rawUrl, attendance, submissions);
        if (directRes && directRes.success) {
          onShowToast(
            `🎉 ALHAMDULILLAH! ${directRes.sentCount} data presensi & ${directRes.sentTugasCount} tugas berhasil terkirim langsung dari browser ke Spreadsheet Anda!`
          );
        } else {
          onShowToast('Gagal mengirim ke Webhook. Pastikan URL Apps Script benar dan di-deploy dengan akses "Anyone".');
        }
      }
    } catch (err: any) {
      onShowToast(err.message || 'Gagal mengirim data ke Webhook');
    } finally {
      setIsSyncingWebhook(false);
    }
  };

  // Test ping webhook
  const handleTestWebhook = async () => {
    const url = webhookInput.trim() || spreadsheetConfig?.webhookUrl;
    if (!url) {
      onShowToast('Masukkan URL Webhook Google Apps Script terlebih dahulu');
      return;
    }
    if (url.includes('docs.google.com/spreadsheets')) {
      onShowToast('⚠️ Ini tautan file Spreadsheet biasa, bukan Web App Apps Script (script.google.com/macros/s/.../exec)');
      return;
    }
    setIsTestingWebhook(true);
    try {
      const res = await testWebhookApi(url);
      if (res && res.success) {
        onShowToast('✅ Berhasil terhubung ke Google Spreadsheet! Webhook siap menerima presensi & tugas secara real-time.');
      } else {
        onShowToast(`Koneksi webhook gagal: ${res.error || 'Periksa apakah Web App di-deploy dengan akses Anyone'}`);
      }
    } catch (err: any) {
      onShowToast('Gagal tes koneksi: ' + err.message);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Batch Push All Records to Apps Script Webhook
  const handleBatchPushWebhook = async () => {
    const url = webhookInput.trim() || spreadsheetConfig?.webhookUrl;
    if (!url) {
      onShowToast('Masukkan URL Webhook Google Apps Script terlebih dahulu');
      return;
    }
    if (url.includes('docs.google.com/spreadsheets')) {
      onShowToast('⚠️ Tautan file spreadsheet tidak bisa menerima POST. Gunakan Web App Apps Script.');
      return;
    }

    setIsSyncingWebhook(true);
    try {
      let synced = false;
      try {
        const res = await triggerSyncAllToWebhookApi(url);
        if (res && res.success) {
          synced = true;
          onShowToast(
            `Sukses! ${res.sentCount} data presensi & ${res.sentTugasCount || 0} tugas terkirim ke Google Sheets via Webhook.`
          );
        }
      } catch {
        synced = false;
      }

      if (!synced) {
        const directRes = await syncAllToAppsScriptDirectly(url, attendance, submissions);
        if (directRes && directRes.success) {
          onShowToast(
            `Sukses! ${directRes.sentCount} data presensi & ${directRes.sentTugasCount} tugas terkirim langsung dari browser ke Google Sheets via Webhook.`
          );
        }
      }
    } catch (err: any) {
      onShowToast(err.message || 'Gagal mengirim data ke Webhook');
    } finally {
      setIsSyncingWebhook(false);
    }
  };

  // Copy 10-column data directly to clipboard (TSV format for Ctrl+V)
  const handleCopyPanitiaTSV = async (withHeaders: boolean = false) => {
    let tsv = '';
    if (withHeaders) {
      const headers = [
        'Time stemp',
        'Tanggal',
        'No Pesesrta',
        'Nama',
        'Instansi',
        'Kab/Ko',
        'Sesi-1',
        'Materi',
        'Kehadiran',
        'Catatan',
      ].join('\t');
      tsv = headers + '\n' + generatePanitiaClipboardTSV(participants, DIKLAT_SESSIONS, attendance);
      await copyToClipboardSafe(tsv);
      setIsCopiedTSVHeaders(true);
      setTimeout(() => setIsCopiedTSVHeaders(false), 3000);
      onShowToast(
        `✅ ${attendance.length} Baris Data + Judul Kolom tersalin! Tempelkan (Ctrl+V) mulai sel A1 di spreadsheet Anda.`
      );
    } else {
      tsv = generatePanitiaClipboardTSV(participants, DIKLAT_SESSIONS, attendance);
      await copyToClipboardSafe(tsv);
      setIsCopiedTSV(true);
      setTimeout(() => setIsCopiedTSV(false), 3000);
      onShowToast(
        `✅ ${attendance.length} Baris Data tersalin! Tempelkan (Ctrl+V) mulai sel A2 di spreadsheet Anda.`
      );
    }
  };

  // Download Exact 10-Column Panitia CSV
  const handleDownloadPanitiaCSV = () => {
    const csv = generatePanitiaExactSpreadsheetCSV(participants, DIKLAT_SESSIONS, attendance, ',');
    downloadCSV(
      csv,
      `Presensi_Panitia_10Kolom_${participants.length}Peserta_${new Date().toISOString().slice(0, 10)}.csv`
    );
    onShowToast(`Berkas CSV 10 Kolom Resmi (${attendance.length} baris) berhasil diunduh`);
  };

  // Copy sample script for Apps Script (Real-time sync for Presensi & Tugas)
  const sampleAppsScript = `// GOOGLE APPS SCRIPT SINKRONISASI REAL-TIME (PRESENSI & TUGAS)
// Diklat Kepala Perpustakaan DPW AGPAII Jatim & UPT Perpustakaan UIN SATU

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    result: 'success',
    status: 'online',
    message: 'Webhook Google Apps Script Diklat AGPAII Jatim & UIN SATU Aktif dan Siap Digunakan'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: 'No post data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({ 
        result: 'error', 
        error: 'Spreadsheet tidak terhubung. Buka Apps Script langsung dari menu Ekstensi > Apps Script di Google Sheets Anda.' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var type = payload.type || 'presensi';
    var data = payload.data || payload;

    // 1. Inisialisasi Sheet Presensi (Format 10 Kolom Panitia)
    var presensiSheet = ss.getSheetByName('Presensi Diklat') || ss.getActiveSheet();
    if (presensiSheet.getLastRow() === 0) {
      presensiSheet.appendRow([
        'Time stemp', 'Tanggal', 'No Pesesrta', 'Nama', 
        'Instansi', 'Kab/Ko', 'Sesi-1', 
        'Materi', 'Kehadiran', 'Catatan', 'Bukti Foto', 'Tanda Tangan'
      ]);
      presensiSheet.getRange('A1:L1').setBackground('#065F46').setFontColor('#FFFFFF').setFontWeight('bold');
    }

    // 2. Inisialisasi Sheet Tugas
    var tugasSheet = ss.getSheetByName('Pengumpulan Tugas');
    if (!tugasSheet) {
      tugasSheet = ss.insertSheet('Pengumpulan Tugas');
      tugasSheet.appendRow([
        'Waktu Kirim', 'Tanggal Tugas', 'No Peserta', 'Nama Lengkap', 
        'Instansi', 'Kabupaten / Kota', 'Kode Tugas', 'Judul Tagihan Tugas', 
        'Judul Berkas / Karya', 'Tautan Berkas (Drive / YouTube)', 'Catatan Peserta', 'Nilai', 'Status'
      ]);
      tugasSheet.getRange('A1:M1').setBackground('#1E40AF').setFontColor('#FFFFFF').setFontWeight('bold');
    }

    var now = new Date();
    var timeStampStr = Utilities.formatDate(now, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');

    if (type === 'presensi') {
      presensiSheet.appendRow([
        timeStampStr,
        data.sessionDate || Utilities.formatDate(now, 'Asia/Jakarta', 'dd MMMM yyyy'),
        data.participantNo || data.participantId,
        data.participantName,
        data.institution,
        data.city || '-',
        data.sessionCode || data.sessionId,
        data.sessionTitle,
        data.status || 'Hadir',
        data.notes || '-',
        data.photoProof ? 'Ada Foto Bukti' : (data.hasPhoto || '-'),
        data.signature ? 'Bertandatangan Digital' : (data.hasSignature || '-')
      ]);
    } else if (type === 'tugas') {
      tugasSheet.appendRow([
        timeStampStr,
        data.submittedAt || timeStampStr,
        data.participantNo || data.participantId,
        data.participantName,
        data.institution,
        data.city || '-',
        data.taskCode || data.taskId,
        data.taskTitle,
        data.title || '-',
        data.fileUrl || data.docLink || '-',
        data.notes || '-',
        data.score !== undefined ? data.score : '-',
        data.status || 'Belum Dinilai'
      ]);
    } else if (type === 'batch_all' || type === 'batch_presensi') {
      var presensiList = payload.presensi || (Array.isArray(data) ? data : []);
      if (presensiList.length > 0) {
        var lastRow = presensiSheet.getLastRow();
        if (lastRow > 1) {
          presensiSheet.deleteRows(2, lastRow - 1);
        }
        var pRows = presensiList.map(function(item) {
          return [
            item.timestamp || timeStampStr,
            item.sessionDate || Utilities.formatDate(now, 'Asia/Jakarta', 'dd MMMM yyyy'),
            item.participantNo || item.participantId,
            item.participantName,
            item.institution,
            item.city || '-',
            item.sessionCode || item.sessionId,
            item.sessionTitle,
            item.status || 'Hadir',
            item.notes || '-',
            item.photoProof ? 'Ada Foto Bukti' : (item.hasPhoto || '-'),
            item.signature ? 'Bertandatangan Digital' : (item.hasSignature || '-')
          ];
        });
        presensiSheet.getRange(2, 1, pRows.length, pRows[0].length).setValues(pRows);
      }

      var tugasList = payload.tugas || [];
      if (tugasList.length > 0) {
        var lastTRow = tugasSheet.getLastRow();
        if (lastTRow > 1) {
          tugasSheet.deleteRows(2, lastTRow - 1);
        }
        var tRows = tugasList.map(function(item) {
          return [
            item.submittedAt || timeStampStr,
            item.submittedAt || timeStampStr,
            item.participantNo || item.participantId,
            item.participantName,
            item.institution,
            item.city || '-',
            item.taskCode || item.taskId,
            item.taskTitle,
            item.title || '-',
            item.fileUrl || item.docLink || '-',
            item.notes || '-',
            item.score !== undefined ? item.score : '-',
            item.status || 'Belum Dinilai'
          ];
        });
        tugasSheet.getRange(2, 1, tRows.length, tRows[0].length).setValues(tRows);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ result: 'success', message: 'Data berhasil disinkronkan' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScriptToClipboard = async () => {
    await copyToClipboardSafe(sampleAppsScript);
    setIsCopiedScript(true);
    setTimeout(() => setIsCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Sinkronisasi Google Spreadsheet Diklat</h2>
              <p className="text-xs text-emerald-100">
                Hubungkan & kirim seluruh {attendance.length} data presensi ke spreadsheet panitia
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto text-xs font-semibold text-slate-600 no-scrollbar">
          <button
            onClick={() => setActiveSubTab('copy-tsv')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap px-2 ${
              activeSubTab === 'copy-tsv'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Salin Cepat / Download (100% Instan)
          </button>
          <button
            onClick={() => setActiveSubTab('oauth')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap px-2 ${
              activeSubTab === 'oauth'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Google Sheets API (Auto-Sync)
          </button>
          <button
            onClick={() => setActiveSubTab('webhook')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap px-2 ${
              activeSubTab === 'webhook'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Apps Script Webhook (Kirim Otomatis)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: Salin Cepat / Unduh Excel (100% Anti-Gagal) */}
          {activeSubTab === 'copy-tsv' && (
            <div className="space-y-5">
              {/* Highlight Hero Card */}
              <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-xl p-5 border border-emerald-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Solusi Paling Cepat &amp; Praktis
                  </span>
                  <span className="text-xs text-emerald-200">Tidak perlu izin Google Cloud</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Sudah Punya File Google Spreadsheet? Salin &amp; Tempel dalam 3 Detik!
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Semua <b>{attendance.length} data presensi</b> (Sesi 1 s.d 6 untuk seluruh {participants.length} peserta, termasuk 21, 22, &amp; 23 Oktober) sudah tersusun rapi sesuai <b>10 kolom baku format panitia</b>. Cukup klik tombol di bawah, buka Google Spreadsheet Anda, lalu tekan <b>Ctrl + V</b>.
                </p>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopyPanitiaTSV(false)}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-black rounded-lg transition shadow-md flex items-center gap-2"
                  >
                    {isCopiedTSV ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-950" />
                        <span>Tersalin! Siap Ctrl+V di Sel A2</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="w-4 h-4" />
                        <span>Salin Baris Data Saja (Mulai Sel A2)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyPanitiaTSV(true)}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-lg transition flex items-center gap-2"
                  >
                    {isCopiedTSVHeaders ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Tersalin Lengkap Judul!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-emerald-300" />
                        <span>Salin + Judul Kolom (Mulai Sel A1)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPanitiaCSV}
                    className="px-3.5 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Unduh CSV 10 Kolom</span>
                  </button>

                  <a
                    href={
                      spreadsheetConfig?.spreadsheetUrl && spreadsheetConfig.spreadsheetUrl !== '#'
                        ? spreadsheetConfig.spreadsheetUrl
                        : 'https://docs.google.com/spreadsheets/u/0/'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-200" />
                    <span>Buka Google Spreadsheet</span>
                  </a>
                </div>
              </div>

              {/* 3 Simple Steps */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  3 Langkah Mudah Memasukkan ke Google Sheets:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
                      1
                    </span>
                    <p className="font-semibold text-slate-800">Salin Data</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Klik tombol hijau di atas: <b>"Salin Baris Data Saja"</b>.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
                      2
                    </span>
                    <p className="font-semibold text-slate-800">Buka Spreadsheet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Buka file Google Sheets Anda di tab baru &amp; klik pada sel <b>A2</b>.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
                      3
                    </span>
                    <p className="font-semibold text-slate-800">Tekan Ctrl + V</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tekan <b>Ctrl+V</b> (Paste). Semua 10 kolom otomatis terisi rapi seketika!
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview 10 Kolom Panitia */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Struktur 10 Kolom Panitia (Pratinjau Data Presensi):
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Total {attendance.length} Baris
                  </span>
                </div>
                <div className="overflow-x-auto max-h-48 text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[10px] uppercase font-bold sticky top-0">
                      <tr>
                        <th className="p-2 border-r border-slate-200">1. Time stemp</th>
                        <th className="p-2 border-r border-slate-200">2. Tanggal</th>
                        <th className="p-2 border-r border-slate-200">3. No Peserta</th>
                        <th className="p-2 border-r border-slate-200">4. Nama</th>
                        <th className="p-2 border-r border-slate-200">5. Instansi</th>
                        <th className="p-2 border-r border-slate-200">6. Kab/Ko</th>
                        <th className="p-2 border-r border-slate-200">7. Sesi</th>
                        <th className="p-2 border-r border-slate-200">8. Materi</th>
                        <th className="p-2 border-r border-slate-200">9. Kehadiran</th>
                        <th className="p-2">10. Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                      {attendance.slice(0, 4).map((rec, i) => {
                        const p = participants.find((x) => x.id === rec.participantId);
                        const s = DIKLAT_SESSIONS.find((x) => x.id === rec.sessionId);
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-1.5 border-r border-slate-200 text-slate-500 whitespace-nowrap">
                              {rec.timestamp}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-600 whitespace-nowrap">
                              {s?.date || '19 Oktober 2026'}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              {p?.no || rec.participantId}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 font-sans font-medium text-slate-800 whitespace-nowrap">
                              {rec.participantName}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 font-sans text-slate-600 whitespace-nowrap">
                              {rec.institution}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 font-sans text-slate-600 whitespace-nowrap">
                              {rec.city}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-emerald-700 font-bold">
                              {s?.code || rec.sessionId}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 font-sans text-slate-600 truncate max-w-[120px]">
                              {rec.sessionTitle}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-emerald-800 font-bold">
                              {rec.status}
                            </td>
                            <td className="p-1.5 font-sans text-slate-500 truncate max-w-[100px]">
                              {rec.notes || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Google Sheets API (OAuth) */}
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
                        Belum Masuk dengan Akun Google
                      </p>
                      <p className="text-xs text-slate-500">
                        Masuk untuk membuat atau menyinkronkan langsung ke Google Sheets Anda
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
              {spreadsheetConfig && spreadsheetConfig.spreadsheetId !== 'webhook-only' ? (
                <div className="border border-emerald-300 bg-emerald-50/70 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                        Spreadsheet Terhubung
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {spreadsheetConfig.spreadsheetTitle}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        ID: {spreadsheetConfig.spreadsheetId}
                      </p>
                    </div>
                    {spreadsheetConfig.spreadsheetUrl && spreadsheetConfig.spreadsheetUrl !== '#' && (
                      <a
                        href={spreadsheetConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka Google Sheets
                      </a>
                    )}
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
                          postSpreadsheetConfigApi(updated);
                          onShowToast(
                            e.target.checked
                              ? 'Sinkronisasi otomatis diaktifkan'
                              : 'Sinkronisasi otomatis dinonaktifkan'
                          );
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Kirim otomatis setiap ada presensi/tugas baru</span>
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
                      <button
                        onClick={handleDisconnect}
                        className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 font-semibold"
                      >
                        Lepas Tautan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Connect / Setup Options */
                <div className="space-y-4">
                  {/* Option 1: Connect Existing Spreadsheet */}
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition bg-white shadow-sm">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <LinkIcon className="w-4 h-4 text-emerald-600" />
                      <span>Hubungkan Spreadsheet Panitia yang Sudah Ada</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Tempelkan URL lengkap Google Spreadsheet Anda atau Spreadsheet ID di kolom bawah.
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
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition whitespace-nowrap shadow-sm"
                      >
                        Hubungkan Spreadsheet
                      </button>
                    </div>
                  </div>

                  {/* Option 2: Create New Spreadsheet */}
                  <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition bg-white shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <PlusCircle className="w-4 h-4" />
                      <span>Atau Buat File Spreadsheet Baru di Google Drive</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Sistem akan membuat file spreadsheet baru dengan struktur 3 tab lengkap:
                      Presensi Diklat, Pengumpulan Tugas, dan Rekapitulasi Nilai ({participants.length} Peserta).
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
                </div>
              )}
            </>
          )}

          {/* TAB 3: Webhook */}
          {activeSubTab === 'webhook' && (
            <div className="space-y-5">
              {/* Status Banner */}
              {spreadsheetConfig?.webhookUrl ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-emerald-950 text-sm">
                        Webhook Terhubung &amp; Aktif
                      </span>
                      <p className="text-[11px] font-mono text-emerald-800 break-all mt-0.5">
                        {spreadsheetConfig.webhookUrl}
                      </p>
                      <span className="inline-block mt-1 text-[10px] bg-emerald-200 text-emerald-900 font-semibold px-2 py-0.5 rounded">
                        Setiap presensi &amp; tugas baru otomatis terkirim real-time
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleTestWebhook}
                      disabled={isTestingWebhook}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
                      <span>Tes Ping</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchPushWebhook}
                      disabled={isSyncingWebhook}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSyncingWebhook ? 'Mengirim...' : `Kirim Ulang ${attendance.length} Data`}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-sm">Status: Belum Terhubung ke Spreadsheet Otomatis</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Agar presensi dan tugas dapat terkirim secara otomatis ke Google Spreadsheet Anda tanpa login Google berulang-ulang (termasuk saat diakses peserta via Vercel/GitHub), silakan pasang <b>Google Apps Script Webhook</b> melalui 4 langkah mudah di bawah ini.
                  </p>
                </div>
              )}

              {/* Input Webhook URL */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800">
                  Tautan Aplikasi Web Apps Script (URL berakhiran /exec):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={webhookInput}
                    onChange={(e) => setWebhookInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2.5 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAndPushWebhook}
                    disabled={isSyncingWebhook || !webhookInput.trim()}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold whitespace-nowrap flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSyncingWebhook ? 'Sedang Mengirim...' : `Simpan & Kirim ${attendance.length} Data Sekarang`}</span>
                  </button>
                </div>

                {/* Validation Warning if user inputs spreadsheet URL */}
                {webhookInput.includes('docs.google.com/spreadsheets') && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs space-y-1.5 animate-fade-in">
                    <span className="font-bold flex items-center gap-1.5 text-rose-900">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      PERHATIAN: Ini adalah tautan file Spreadsheet biasa, BUKAN tautan Web App Apps Script!
                    </span>
                    <p className="leading-relaxed">
                      Google Spreadsheet tidak menerima kiriman data langsung dari URL file biasa. Yang dibutuhkan adalah <b>URL Web App Apps Script</b> (berawalan <code>https://script.google.com/macros/s/.../exec</code>).
                    </p>
                    <p className="font-bold text-rose-950 pt-1">
                      💡 Solusi Instan 3 Detik: Klik tab <b>"Salin Cepat / Download"</b> di menu atas! Anda bisa menyalin seluruh {attendance.length} data dan menempelkannya (Ctrl + V) langsung ke file Google Spreadsheet Anda.
                    </p>
                  </div>
                )}
              </div>

              {/* 4 Step Tutorial */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Petunjuk 4 Langkah Pemasangan Webhook di Google Sheets:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center justify-center mr-1.5">
                      1
                    </span>
                    <span className="font-bold text-slate-800">Buka Google Sheets &amp; Apps Script</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Buka file Google Spreadsheet Anda di browser &gt; Klik menu <b>Ekstensi (Extensions)</b> &gt; pilih <b>Apps Script</b>.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center justify-center mr-1.5">
                      2
                    </span>
                    <span className="font-bold text-slate-800">Tempel Kode Skrip</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Hapus semua tulisan di editor Apps Script, klik tombol <b>"Salin Kode Skrip"</b> di bawah, lalu tekan <b>Ctrl + V</b> di editor.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center justify-center mr-1.5">
                      3
                    </span>
                    <span className="font-bold text-slate-800">Deploy sebagai Web App (Siapa Saja)</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Klik <b>Terapkan (Deploy)</b> &gt; <b>Deployment baru</b> &gt; Pilih jenis <b>Aplikasi Web</b>. Pada <i>Siapa yang memiliki akses (Who has access)</i>, <b>WAJIB pilih "Siapa saja (Anyone)"</b>, lalu klik Deploy.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center justify-center mr-1.5">
                      4
                    </span>
                    <span className="font-bold text-slate-800">Salin URL &amp; Kirim Data</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Salin <b>URL Aplikasi Web</b> yang berakhiran <code>/exec</code>, tempelkan ke kotak di atas, lalu klik tombol hijau <b>Simpan &amp; Kirim {attendance.length} Data Sekarang</b>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">
                    Skrip Google Apps Script Siap Pasang:
                  </span>
                  <button
                    type="button"
                    onClick={copyScriptToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition"
                  >
                    {isCopiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-emerald-700" /> Salin Kode Skrip
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] bg-slate-900 text-slate-200 p-3.5 rounded-xl overflow-x-auto font-mono max-h-52 border border-slate-700 leading-relaxed shadow-inner">
                  {sampleAppsScript}
                </pre>
              </div>
            </div>
          )}

          {/* Quick CSV Export Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">
                  Unduh Berkas Excel / CSV Langsung
                </span>
                <p className="text-[11px] text-slate-500">
                  Dapat langsung dibuka di Excel atau diimpor ke Google Sheets melalui menu File &gt; Import.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadPanitiaCSV}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh CSV Format 10 Kolom Panitia</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const csv = generateAttendanceCSV(participants, DIKLAT_SESSIONS, attendance);
                  downloadCSV(
                    csv,
                    `Presensi_Diklat_${participants.length}Peserta_${new Date().toISOString().slice(0, 10)}.csv`
                  );
                  onShowToast(`Berkas CSV Presensi ${participants.length} peserta berhasil diunduh`);
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Unduh CSV Rekap Presensi Sesi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const csv = generateRecapCSV(
                    participants,
                    DIKLAT_SESSIONS,
                    DIKLAT_TASKS,
                    attendance,
                    submissions
                  );
                  downloadCSV(
                    csv,
                    `Rekap_Diklat_${participants.length}Peserta_${new Date().toISOString().slice(0, 10)}.csv`
                  );
                  onShowToast(`Berkas CSV Rekapitulasi Lengkap ${participants.length} peserta berhasil diunduh`);
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span>Unduh CSV Rekap Portofolio Nilai</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {spreadsheetConfig && spreadsheetConfig.spreadsheetUrl !== '#'
              ? `Status: Terhubung (${spreadsheetConfig.spreadsheetTitle})`
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

      {/* Confirmation Dialog for Destructive / Mutating Operation */}
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
