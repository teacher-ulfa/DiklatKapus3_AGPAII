import { Participant, AttendanceRecord, TaskSubmission } from '../types';
import { DIKLAT_INFO, DIKLAT_SESSIONS, DIKLAT_TASKS } from '../data/diklatData';

export interface SpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetTitle: string;
  spreadsheetUrl: string;
  connectedAt: string;
  webhookUrl?: string;
  autoSync: boolean;
}

const STORAGE_KEY_SPREADSHEET = 'diklat_kapus_spreadsheet_config';

export const getSavedSpreadsheetConfig = (): SpreadsheetConfig | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPREADSHEET);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSpreadsheetConfig = (config: SpreadsheetConfig | null) => {
  if (config) {
    localStorage.setItem(STORAGE_KEY_SPREADSHEET, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEY_SPREADSHEET);
  }
};

/**
 * Creates a brand new Google Spreadsheet with three prepared tabs:
 * 1. Presensi Diklat
 * 2. Pengumpulan Tugas
 * 3. Rekapitulasi Nilai Peserta
 */
export const createDiklatSpreadsheet = async (
  accessToken: string,
  title?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; spreadsheetTitle: string }> => {
  const finalTitle =
    title ||
    `Rekap Diklat Kapus Perpustakaan - AGPAII Jatim & UIN SATU (${new Date().toLocaleDateString('id-ID')})`;

  const payload = {
    properties: {
      title: finalTitle,
    },
    sheets: [
      {
        properties: {
          title: 'Presensi Diklat',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'Pengumpulan Tugas',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'Rekapitulasi Nilai Peserta',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || `Gagal membuat Google Spreadsheet (Status: ${response.status})`
    );
  }

  const created = await response.json();
  const spreadsheetId = created.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Initialize header rows on all sheets
  await initializeSheetHeaders(accessToken, spreadsheetId);

  return {
    spreadsheetId,
    spreadsheetUrl,
    spreadsheetTitle: finalTitle,
  };
};

/**
 * Initializes header columns on all sheets
 */
export const initializeSheetHeaders = async (accessToken: string, spreadsheetId: string) => {
  const presensiHeaders = [
    'No',
    'Waktu Presensi',
    'No Peserta',
    'Nama Lengkap & Gelar',
    'Jabatan di Sekolah',
    'Asal Instansi / Sekolah',
    'Kabupaten / Kota',
    'Kode Sesi',
    'Judul Sesi Zoom / Diklat',
    'Status Kehadiran',
    'Catatan / Keterangan',
    'Tanda Tangan Digital',
    'Bukti Kehadiran',
  ];

  const tugasHeaders = [
    'No',
    'Waktu Pengumpulan',
    'No Peserta',
    'Nama Lengkap Peserta',
    'Asal Instansi',
    'Kabupaten / Kota',
    'Kode Tugas',
    'Judul Tagihan Tugas',
    'Judul Dokumen Pengumpulan',
    'Tautan File / Google Drive',
    'Nama Berkas',
    'Catatan Pengantar Peserta',
    'Status Penilaian',
    'Nilai Angka (0-100)',
    'Nama Reviewer',
    'Catatan / Feedback Instruktur',
  ];

  const rekapHeaders = [
    'No',
    'Nama Lengkap Peserta',
    'Jabatan',
    'Asal Instansi',
    'Kabupaten / Kota',
    'Total Hadir (Max 10 Sesi)',
    'Persentase Presensi (%)',
    'Total Tugas Terkumpul (Max 8)',
    'Rata-rata Nilai Tugas',
    'Status Kelulusan Diklat 120 JP',
  ];

  const data = [
    {
      range: "'Presensi Diklat'!A1:M1",
      values: [presensiHeaders],
    },
    {
      range: "'Pengumpulan Tugas'!A1:P1",
      values: [tugasHeaders],
    },
    {
      range: "'Rekapitulasi Nilai Peserta'!A1:J1",
      values: [rekapHeaders],
    },
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data,
      }),
    }
  );
};

/**
 * Append single Attendance record to Google Sheet
 */
export const appendAttendanceToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  record: AttendanceRecord,
  index?: number
) => {
  const row = [
    index || 1,
    record.timestamp,
    record.participantId,
    record.participantName,
    '', // Jabatan will be filled if participant is lookuped
    record.institution,
    record.city,
    record.sessionId,
    record.sessionTitle,
    record.status,
    record.notes || '-',
    record.signature ? 'Ada Tanda Tangan Digital' : 'Tidak Ada',
    record.photoProof ? 'Ada Foto Bukti Kehadiran' : 'Tidak Ada',
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Presensi Diklat'!A:M:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menambahkan presensi ke Google Sheets');
  }

  return true;
};

/**
 * Append single Task Submission record to Google Sheet
 */
export const appendSubmissionToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  submission: TaskSubmission,
  participant?: Participant,
  index?: number
) => {
  const row = [
    index || 1,
    submission.submittedAt,
    submission.participantId,
    submission.participantName,
    submission.institution,
    participant?.city || '',
    submission.taskId,
    submission.taskTitle,
    submission.title,
    submission.docLink || submission.fileUrl || '-',
    submission.fileName || '-',
    submission.notes || '-',
    submission.status,
    submission.score !== undefined ? submission.score : '',
    submission.reviewedBy || '-',
    submission.feedback || '-',
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Pengumpulan Tugas'!A:P:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menambahkan tugas ke Google Sheets');
  }

  return true;
};

/**
 * Full Sync of All Participants, Attendance & Task Submissions to the Google Spreadsheet
 */
export const syncAllDataToGoogleSheet = async (
  accessToken: string,
  spreadsheetId: string,
  participants: Participant[],
  attendanceList: AttendanceRecord[],
  submissionsList: TaskSubmission[]
): Promise<{ success: boolean; totalPresensi: number; totalTugas: number }> => {
  // 1. Ensure headers exist
  await initializeSheetHeaders(accessToken, spreadsheetId).catch(() => {});

  // 2. Prepare Presensi Rows
  const presensiRows = attendanceList.map((rec, idx) => {
    const p = participants.find((x) => x.id === rec.participantId);
    return [
      idx + 1,
      rec.timestamp,
      rec.participantId,
      rec.participantName,
      p?.status || '-',
      rec.institution,
      rec.city,
      rec.sessionId,
      rec.sessionTitle,
      rec.status,
      rec.notes || '-',
      rec.signature ? 'Ada Tanda Tangan Digital' : 'Tidak Ada',
      rec.photoProof ? 'Ada Foto Bukti Kehadiran' : 'Tidak Ada',
    ];
  });

  // 3. Prepare Tugas Rows
  const tugasRows = submissionsList.map((sub, idx) => {
    const p = participants.find((x) => x.id === sub.participantId);
    return [
      idx + 1,
      sub.submittedAt,
      sub.participantId,
      sub.participantName,
      sub.institution,
      p?.city || '-',
      sub.taskId,
      sub.taskTitle,
      sub.title,
      sub.docLink || sub.fileUrl || '-',
      sub.fileName || '-',
      sub.notes || '-',
      sub.status,
      sub.score !== undefined ? sub.score : '',
      sub.reviewedBy || '-',
      sub.feedback || '-',
    ];
  });

  // 4. Prepare Master Recap Rows for all participants ({participants.length})
  const rekapRows = participants.map((p, idx) => {
    const pAtt = attendanceList.filter((a) => a.participantId === p.id && a.status === 'Hadir');
    const pSub = submissionsList.filter((s) => s.participantId === p.id);
    const scoredSub = pSub.filter((s) => s.score !== undefined);
    const avgScore =
      scoredSub.length > 0
        ? (scoredSub.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredSub.length).toFixed(
            1
          )
        : '-';

    const presensiPct = Math.round((pAtt.length / (DIKLAT_SESSIONS.length || 10)) * 100);
    const isLulus = presensiPct >= 75 && pSub.length >= 6;

    return [
      idx + 1,
      p.name,
      p.status,
      p.institution,
      p.city,
      pAtt.length,
      `${presensiPct}%`,
      pSub.length,
      avgScore,
      isLulus ? 'LULUS (MEMENUHI SYARAT 120 JP)' : 'BELUM MEMENUHI SYARAT',
    ];
  });

  // Clear existing data rows below header and replace
  // We use batchUpdate to populate the sheet cleanly
  const data = [
    {
      range: `'Presensi Diklat'!A2:M${Math.max(presensiRows.length + 1, 100)}`,
      values: presensiRows.length > 0 ? presensiRows : [['-']],
    },
    {
      range: `'Pengumpulan Tugas'!A2:P${Math.max(tugasRows.length + 1, 100)}`,
      values: tugasRows.length > 0 ? tugasRows : [['-']],
    },
    {
      range: `'Rekapitulasi Nilai Peserta'!A2:J${Math.max(rekapRows.length + 1, 100)}`,
      values: rekapRows,
    },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menyinkronkan data ke Google Sheets');
  }

  return {
    success: true,
    totalPresensi: presensiRows.length,
    totalTugas: tugasRows.length,
  };
};

/**
 * Optional Webhook Forwarder (Google Apps Script Web App)
 */
export const forwardToAppsScriptWebhook = async (
  webhookUrl: string,
  type: 'presensi' | 'tugas',
  payload: any
): Promise<boolean> => {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data: payload,
        timestamp: new Date().toISOString(),
      }),
    });
    return true;
  } catch (err) {
    console.warn('Webhook delivery warning:', err);
    return false;
  }
};
