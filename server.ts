import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { INITIAL_PARTICIPANTS } from './src/data/participants';
import { DIKLAT_SESSIONS, DIKLAT_TASKS } from './src/data/diklatData';
import { AttendanceRecord, TaskSubmission } from './src/types';
import { SpreadsheetConfig } from './src/services/googleSheets';

interface StoreData {
  attendance: AttendanceRecord[];
  submissions: TaskSubmission[];
  spreadsheetConfig: SpreadsheetConfig | null;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'diklat_store.json');

// Helper to generate seed attendance for Sesi 1, Sesi 2, and Sesi 3 (54 participants x 3 sessions = 162 records)
function generateSeedAttendanceForSessions(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const session1 = DIKLAT_SESSIONS[0]; // Sesi 1 Pembukaan
  const session2 = DIKLAT_SESSIONS[1]; // Sesi 2 Pengorganisasian Informasi
  const session3 = DIKLAT_SESSIONS[2]; // Sesi 3 Manajemen Kelembagaan

  INITIAL_PARTICIPANTS.forEach((p) => {
    // Sesi 1
    records.push({
      id: `att-${p.id}-sesi-1-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-1',
      sessionTitle: session1?.title || 'Pembukaan Pelatihan Resmi & Pengarahan Program',
      timestamp: '2026-10-19 08.15 WIB',
      status: 'Hadir',
      notes: 'Hadir Pembukaan Diklat Zoom Meeting',
      verified: true,
    });

    // Sesi 2
    records.push({
      id: `att-${p.id}-sesi-2-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-2',
      sessionTitle: session2?.title || 'Pengorganisasian Informasi di Perpustakaan Sekolah',
      timestamp: '2026-10-19 13.20 WIB',
      status: 'Hadir',
      notes: 'Hadir Sesi 2 Zoom Meeting Pengorganisasian Informasi',
      verified: true,
    });

    // Sesi 3: Manajemen Kelembagaan
    records.push({
      id: `att-${p.id}-sesi-3-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-3',
      sessionTitle: session3?.title || 'Manajemen Kelembagaan Perpustakaan Sekolah',
      timestamp: '2026-10-20 08.15 WIB',
      status: 'Hadir',
      notes: 'Hadir Sesi 3 Zoom Meeting Manajemen Kelembagaan',
      verified: true,
    });

    // Sesi 4: Pengembangan dan Pengolahan Bahan Pustaka (21 Okt 2026)
    records.push({
      id: `att-${p.id}-sesi-4-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-4',
      sessionTitle: DIKLAT_SESSIONS[3]?.title || 'Pengembangan dan Pengolahan Bahan Pustaka',
      timestamp: '2026-10-21 08.15 WIB',
      status: 'Hadir',
      notes: 'Hadir Sesi 4 Zoom Meeting Pengembangan Bahan Pustaka',
      verified: true,
    });

    // Sesi 5: Manajemen Promosi Perpustakaan (22 Okt 2026)
    records.push({
      id: `att-${p.id}-sesi-5-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-5',
      sessionTitle: DIKLAT_SESSIONS[4]?.title || 'Manajemen Promosi Perpustakaan & Pembudayaan Kegemaran Membaca',
      timestamp: '2026-10-22 09.15 WIB',
      status: 'Hadir',
      notes: 'Hadir Sesi 5 Zoom Meeting Manajemen Promosi & Budaya Baca',
      verified: true,
    });
  });

  return records;
}

// Load or initialize store from disk
function loadStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (!data.attendance) {
        data.attendance = [];
      }
      // Ensure all participants in INITIAL_PARTICIPANTS have Sesi 1 s.d 5 seeded
      let hasNewSeed = false;
      const s1 = DIKLAT_SESSIONS[0];
      const s2 = DIKLAT_SESSIONS[1];
      const s3 = DIKLAT_SESSIONS[2];
      const s4 = DIKLAT_SESSIONS[3];
      const s5 = DIKLAT_SESSIONS[4];

      INITIAL_PARTICIPANTS.forEach((p) => {
        // Sesi 1
        const hasS1 = data.attendance.some(
          (a: any) => a.participantId === p.id && a.sessionId === 'sesi-1'
        );
        if (!hasS1) {
          data.attendance.push({
            id: `att-${p.id}-sesi-1-seed`,
            participantId: p.id,
            participantName: p.name,
            institution: p.institution,
            city: p.city,
            sessionId: 'sesi-1',
            sessionTitle: s1?.title || 'Pembukaan Pelatihan Resmi & Pengarahan Program',
            timestamp: '2026-10-19 08.15 WIB',
            status: 'Hadir',
            notes: 'Hadir Pembukaan Diklat Zoom Meeting',
            verified: true,
          });
          hasNewSeed = true;
        }

        // Sesi 2
        const hasS2 = data.attendance.some(
          (a: any) => a.participantId === p.id && a.sessionId === 'sesi-2'
        );
        if (!hasS2) {
          data.attendance.push({
            id: `att-${p.id}-sesi-2-seed`,
            participantId: p.id,
            participantName: p.name,
            institution: p.institution,
            city: p.city,
            sessionId: 'sesi-2',
            sessionTitle: s2?.title || 'Pengorganisasian Informasi di Perpustakaan Sekolah',
            timestamp: '2026-10-19 13.20 WIB',
            status: 'Hadir',
            notes: 'Hadir Sesi 2 Zoom Meeting Pengorganisasian Informasi',
            verified: true,
          });
          hasNewSeed = true;
        }

        // Sesi 3
        const hasS3 = data.attendance.some(
          (a: any) => a.participantId === p.id && a.sessionId === 'sesi-3'
        );
        if (!hasS3) {
          data.attendance.push({
            id: `att-${p.id}-sesi-3-seed`,
            participantId: p.id,
            participantName: p.name,
            institution: p.institution,
            city: p.city,
            sessionId: 'sesi-3',
            sessionTitle: s3?.title || 'Manajemen Kelembagaan Perpustakaan Sekolah',
            timestamp: '2026-10-20 08.15 WIB',
            status: 'Hadir',
            notes: 'Hadir Sesi 3 Zoom Meeting Manajemen Kelembagaan',
            verified: true,
          });
          hasNewSeed = true;
        }

        // Sesi 4 (21 Oktober 2026)
        const hasS4 = data.attendance.some(
          (a: any) => a.participantId === p.id && a.sessionId === 'sesi-4'
        );
        if (!hasS4) {
          data.attendance.push({
            id: `att-${p.id}-sesi-4-seed`,
            participantId: p.id,
            participantName: p.name,
            institution: p.institution,
            city: p.city,
            sessionId: 'sesi-4',
            sessionTitle: s4?.title || 'Pengembangan dan Pengolahan Bahan Pustaka',
            timestamp: '2026-10-21 08.15 WIB',
            status: 'Hadir',
            notes: 'Hadir Sesi 4 Zoom Meeting Pengembangan Bahan Pustaka',
            verified: true,
          });
          hasNewSeed = true;
        }

        // Sesi 5 (22 Oktober 2026)
        const hasS5 = data.attendance.some(
          (a: any) => a.participantId === p.id && a.sessionId === 'sesi-5'
        );
        if (!hasS5) {
          data.attendance.push({
            id: `att-${p.id}-sesi-5-seed`,
            participantId: p.id,
            participantName: p.name,
            institution: p.institution,
            city: p.city,
            sessionId: 'sesi-5',
            sessionTitle: s5?.title || 'Manajemen Promosi Perpustakaan & Pembudayaan Kegemaran Membaca',
            timestamp: '2026-10-22 09.15 WIB',
            status: 'Hadir',
            notes: 'Hadir Sesi 5 Zoom Meeting Manajemen Promosi & Budaya Baca',
            verified: true,
          });
          hasNewSeed = true;
        }
      });

      if (hasNewSeed) {
        saveStore(data);
      }

      return {
        attendance: data.attendance || [],
        submissions: data.submissions || [],
        spreadsheetConfig: data.spreadsheetConfig || null,
      };
    }
  } catch (err) {
    console.error('Error reading store file:', err);
  }

  // Initial seed
  const initialData: StoreData = {
    attendance: generateSeedAttendanceForSessions(),
    submissions: [],
    spreadsheetConfig: null,
  };
  saveStore(initialData);
  return initialData;
}

// Persist store to disk
function saveStore(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store file:', err);
  }
}

// In-memory cache
let store: StoreData = loadStore();

// Forwarder to Google Apps Script Webhook (matching Panitia layout & real-time sync)
async function forwardWebhook(type: 'presensi' | 'tugas', payload: any) {
  if (!store.spreadsheetConfig?.webhookUrl) return;
  try {
    const webhookUrl = store.spreadsheetConfig.webhookUrl;
    if (webhookUrl.includes('docs.google.com/spreadsheets')) {
      console.warn('[Webhook Warning]: URL is a spreadsheet URL, not a web app URL');
      return;
    }
    const participant = INITIAL_PARTICIPANTS.find((p) => p.id === payload.participantId);
    const session = DIKLAT_SESSIONS.find((s) => s.id === payload.sessionId);
    const task = DIKLAT_TASKS.find((t) => t.id === payload.taskId);

    let enrichedPayload: any = { ...payload };

    if (type === 'presensi') {
      enrichedPayload = {
        ...payload,
        participantNo: participant?.no || payload.participantId,
        participantName: payload.participantName || participant?.name,
        institution: payload.institution || participant?.institution,
        city: participant?.city || payload.city || '',
        sessionDate: session?.date || payload.sessionDate || '19 Oktober 2026',
        sessionCode: session?.code || payload.sessionId,
        sessionTitle: session?.title || payload.sessionTitle,
        hasPhoto: payload.photoProof ? 'Ada Foto Bukti' : '-',
        hasSignature: payload.signature ? 'Bertandatangan Digital' : '-',
      };
    } else if (type === 'tugas') {
      enrichedPayload = {
        ...payload,
        participantNo: participant?.no || payload.participantId,
        participantName: payload.participantName || participant?.name,
        institution: payload.institution || participant?.institution,
        city: participant?.city || '',
        taskCode: task?.code || payload.taskId,
        taskTitle: task?.title || payload.taskTitle,
        fileUrl: payload.fileUrl || payload.docLink || '-',
        notes: payload.notes || '-',
        status: payload.status || 'Belum Dinilai',
        score: payload.score !== undefined ? payload.score : '-',
      };
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      body: JSON.stringify({
        type,
        data: enrichedPayload,
        timestamp: new Date().toISOString(),
      }),
    });
    console.log(`[Webhook Real-Time] Sukses kirim ${type} peserta #${enrichedPayload.participantNo} (${enrichedPayload.participantName}) ke spreadsheet.`);
  } catch (err) {
    console.warn('[Webhook Real-Time Warning]:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '20mb' }));

  // API Routes
  // 1. Get central database data
  app.get('/api/data', (_req: Request, res: Response) => {
    res.json({
      success: true,
      attendance: store.attendance,
      submissions: store.submissions,
      spreadsheetConfig: store.spreadsheetConfig,
      totalParticipants: INITIAL_PARTICIPANTS.length,
    });
  });

  // 2. Submit or update attendance
  app.post('/api/attendance', async (req: Request, res: Response) => {
    try {
      const record: AttendanceRecord = req.body;
      if (!record || !record.participantId || !record.sessionId) {
        return res.status(400).json({ error: 'Data presensi tidak valid' });
      }

      // Filter out existing record for this participant & session
      const filtered = store.attendance.filter(
        (a) => !(a.participantId === record.participantId && a.sessionId === record.sessionId)
      );
      store.attendance = [record, ...filtered];
      saveStore(store);

      // Async webhook forward
      forwardWebhook('presensi', record);

      res.json({ success: true, record });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Delete attendance
  app.delete('/api/attendance/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    store.attendance = store.attendance.filter((a) => a.id !== id);
    saveStore(store);
    res.json({ success: true, message: 'Presensi berhasil dihapus' });
  });

  // 4. Submit task
  app.post('/api/submissions', async (req: Request, res: Response) => {
    try {
      const sub: TaskSubmission = req.body;
      if (!sub || !sub.participantId || !sub.taskId) {
        return res.status(400).json({ error: 'Data tugas tidak valid' });
      }

      const filtered = store.submissions.filter(
        (s) => !(s.participantId === sub.participantId && s.taskId === sub.taskId)
      );
      store.submissions = [sub, ...filtered];
      saveStore(store);

      forwardWebhook('tugas', sub);

      res.json({ success: true, submission: sub });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Grade submission (Admin)
  app.post('/api/submissions/grade', (req: Request, res: Response) => {
    try {
      const { id, score, feedback, verifiedBy } = req.body;
      const index = store.submissions.findIndex((s) => s.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Tugas tidak ditemukan' });
      }

      store.submissions[index] = {
        ...store.submissions[index],
        score: Number(score),
        feedback: feedback !== undefined ? feedback : store.submissions[index].feedback,
        reviewedBy: verifiedBy || 'Narasumber / Panitia Diklat',
        status: 'Dinilai',
      };
      saveStore(store);

      res.json({ success: true, submission: store.submissions[index] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Save central spreadsheet configuration
  app.post('/api/config/spreadsheet', (req: Request, res: Response) => {
    const config: SpreadsheetConfig | null = req.body.config;
    store.spreadsheetConfig = config;
    saveStore(store);
    res.json({ success: true, config: store.spreadsheetConfig });
  });

  // 7. Sync local client storage into central server
  app.post('/api/sync-local', (req: Request, res: Response) => {
    try {
      const { localAttendance = [], localSubmissions = [] } = req.body;
      let addedAttendance = 0;
      let addedSubmissions = 0;

      // Merge attendance
      localAttendance.forEach((rec: AttendanceRecord) => {
        if (!rec.participantId || !rec.sessionId) return;
        const exists = store.attendance.some(
          (a) => a.participantId === rec.participantId && a.sessionId === rec.sessionId
        );
        if (!exists) {
          store.attendance.push(rec);
          addedAttendance++;
        }
      });

      // Merge submissions
      localSubmissions.forEach((sub: TaskSubmission) => {
        if (!sub.participantId || !sub.taskId) return;
        const exists = store.submissions.some(
          (s) => s.participantId === sub.participantId && s.taskId === sub.taskId
        );
        if (!exists) {
          store.submissions.push(sub);
          addedSubmissions++;
        }
      });

      if (addedAttendance > 0 || addedSubmissions > 0) {
        saveStore(store);
      }

      res.json({
        success: true,
        addedAttendance,
        addedSubmissions,
        attendance: store.attendance,
        submissions: store.submissions,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Admin fast recovery: Fill Sesi 1, 2 & 3 for all 54 participants
  app.post('/api/admin/mass-attendance-session', (req: Request, res: Response) => {
    try {
      const { sessionIds = ['sesi-1', 'sesi-2', 'sesi-3'], participantIds } = req.body;
      const targetParticipants = participantIds
        ? INITIAL_PARTICIPANTS.filter((p) => participantIds.includes(p.id))
        : INITIAL_PARTICIPANTS;

      let createdCount = 0;

      sessionIds.forEach((sId: string) => {
        const sessionObj = DIKLAT_SESSIONS.find((s) => s.id === sId);
        targetParticipants.forEach((p) => {
          const exists = store.attendance.some(
            (a) => a.participantId === p.id && a.sessionId === sId
          );
          if (!exists) {
            const newRec: AttendanceRecord = {
              id: `att-${p.id}-${sId}-${Date.now()}`,
              participantId: p.id,
              participantName: p.name,
              institution: p.institution,
              city: p.city,
              sessionId: sId,
              sessionTitle: sessionObj?.title || `Sesi Diklat ${sId}`,
              timestamp: '2026-10-19 08.30 WIB',
              status: 'Hadir',
              notes: 'Verifikasi Kehadiran Panitia / Sistem Diklat',
              verified: true,
            };
            store.attendance.push(newRec);
            createdCount++;
          }
        });
      });

      saveStore(store);

      res.json({
        success: true,
        createdCount,
        attendance: store.attendance,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Batch push all attendance & submission records to Google Apps Script Webhook
  app.post('/api/webhook/sync-all', async (req: Request, res: Response) => {
    try {
      const webhookUrl = req.body.webhookUrl || store.spreadsheetConfig?.webhookUrl;
      if (!webhookUrl) {
        return res.status(400).json({ error: 'Alamat Webhook URL belum diisi' });
      }

      if (webhookUrl.includes('docs.google.com/spreadsheets')) {
        return res.status(400).json({
          error: 'Tautan yang dimasukkan adalah tautan file Spreadsheet (docs.google.com/spreadsheets), BUKAN tautan Web App Apps Script (script.google.com/macros/s/.../exec). Silakan deploy Web App di Apps Script terlebih dahulu atau gunakan Metode 1 (Salin Cepat TSV).',
        });
      }

      // Prepare enriched presensi records
      const presensiList = store.attendance.map((rec) => {
        const participant = INITIAL_PARTICIPANTS.find((p) => p.id === rec.participantId);
        const session = DIKLAT_SESSIONS.find((s) => s.id === rec.sessionId);
        return {
          ...rec,
          participantNo: participant?.no || rec.participantId,
          participantName: rec.participantName || participant?.name,
          institution: rec.institution || participant?.institution,
          city: rec.city || participant?.city || '',
          sessionDate: session?.date || '19 Oktober 2026',
          sessionCode: session?.code || rec.sessionId,
          sessionTitle: session?.title || rec.sessionTitle,
          hasPhoto: rec.photoProof ? 'Ada Foto Bukti' : '-',
          hasSignature: rec.signature ? 'Bertandatangan Digital' : '-',
        };
      });

      // Prepare enriched tugas records
      const tugasList = store.submissions.map((sub) => {
        const participant = INITIAL_PARTICIPANTS.find((p) => p.id === sub.participantId);
        const task = DIKLAT_TASKS.find((t) => t.id === sub.taskId);
        return {
          ...sub,
          participantNo: participant?.no || sub.participantId,
          participantName: sub.participantName || participant?.name,
          institution: sub.institution || participant?.institution,
          city: participant?.city || '',
          taskCode: task?.code || sub.taskId,
          taskTitle: task?.title || sub.taskTitle,
          fileUrl: sub.fileUrl || sub.docLink || '-',
        };
      });

      // Try bulk push first (fastest, atomic)
      try {
        const bulkRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          redirect: 'follow',
          body: JSON.stringify({
            type: 'batch_all',
            presensi: presensiList,
            tugas: tugasList,
            timestamp: new Date().toISOString(),
          }),
        });

        if (bulkRes.ok) {
          return res.json({
            success: true,
            sentCount: presensiList.length,
            sentTugasCount: tugasList.length,
            mode: 'bulk',
          });
        }
      } catch (err) {
        console.warn('Bulk push failed, trying sequential fallback...', err);
      }

      // Fallback: sequential single rows
      let sentCount = 0;
      let failedCount = 0;

      for (const rec of presensiList) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            redirect: 'follow',
            body: JSON.stringify({
              type: 'presensi',
              data: rec,
              timestamp: new Date().toISOString(),
            }),
          });
          sentCount++;
        } catch {
          failedCount++;
        }
      }

      res.json({
        success: true,
        sentCount,
        failedCount,
        total: presensiList.length,
        mode: 'sequential',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. Test ping to Google Apps Script Webhook
  app.post('/api/webhook/test', async (req: Request, res: Response) => {
    try {
      const webhookUrl = req.body.webhookUrl || store.spreadsheetConfig?.webhookUrl;
      if (!webhookUrl) {
        return res.status(400).json({ error: 'URL Webhook belum diisi' });
      }

      if (webhookUrl.includes('docs.google.com/spreadsheets')) {
        return res.status(400).json({
          error: 'Tautan yang dimasukkan adalah tautan file Spreadsheet (docs.google.com/spreadsheets), BUKAN tautan Web App Apps Script (script.google.com/macros/s/.../exec). Silakan deploy Web App di Apps Script terlebih dahulu.',
        });
      }

      const pingPayload = {
        type: 'test_ping',
        message: 'Tes koneksi sistem diklat AGPAII Jatim & UIN SATU Tulungagung',
        timestamp: new Date().toISOString(),
      };

      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow',
        body: JSON.stringify(pingPayload),
      });

      res.json({
        success: resp.ok,
        status: resp.status,
        statusText: resp.statusText,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite Integration
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Portal Diklat Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Start Error:', err);
});
