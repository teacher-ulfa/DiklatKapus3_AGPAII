import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { INITIAL_PARTICIPANTS } from './src/data/participants';
import { DIKLAT_SESSIONS } from './src/data/diklatData';
import { AttendanceRecord, TaskSubmission } from './src/types';
import { SpreadsheetConfig } from './src/services/googleSheets';

interface StoreData {
  attendance: AttendanceRecord[];
  submissions: TaskSubmission[];
  spreadsheetConfig: SpreadsheetConfig | null;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'diklat_store.json');

// Helper to generate seed attendance for Sesi 1 and Sesi 2
function generateSeedAttendanceForSession1And2(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const session1 = DIKLAT_SESSIONS[0]; // Sesi 1 Pembukaan
  const session2 = DIKLAT_SESSIONS[1]; // Sesi 2 Pengorganisasian Informasi

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
      // Ensure all participants in INITIAL_PARTICIPANTS have Sesi 1 & 2 seeded
      let hasNewSeed = false;
      const s1 = DIKLAT_SESSIONS[0];
      const s2 = DIKLAT_SESSIONS[1];

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
    attendance: generateSeedAttendanceForSession1And2(),
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

// Forwarder to Google Apps Script Webhook (matching Panitia 10-column layout)
async function forwardWebhook(type: 'presensi' | 'tugas', payload: any) {
  if (!store.spreadsheetConfig?.webhookUrl) return;
  try {
    const webhookUrl = store.spreadsheetConfig.webhookUrl;
    const participant = INITIAL_PARTICIPANTS.find((p) => p.id === payload.participantId);
    const session = DIKLAT_SESSIONS.find((s) => s.id === payload.sessionId);

    const enrichedPayload = {
      ...payload,
      participantNo: participant?.no || payload.participantId,
      sessionDate: session?.date || '19 Oktober 2026',
      sessionCode: session?.code || payload.sessionId,
      sessionTitle: session?.title || payload.sessionTitle,
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        data: enrichedPayload,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn('Backend Webhook forward warning:', err);
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

  // 8. Admin fast recovery: Fill Sesi 1 & 2 for all 52 participants
  app.post('/api/admin/mass-attendance-session', (req: Request, res: Response) => {
    try {
      const { sessionIds = ['sesi-1', 'sesi-2'], participantIds } = req.body;
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

  // 9. Batch push all attendance records to Google Apps Script Webhook
  app.post('/api/webhook/sync-all', async (req: Request, res: Response) => {
    try {
      const webhookUrl = req.body.webhookUrl || store.spreadsheetConfig?.webhookUrl;
      if (!webhookUrl) {
        return res.status(400).json({ error: 'Alamat Webhook URL belum diisi' });
      }

      let sentCount = 0;
      let failedCount = 0;

      for (const rec of store.attendance) {
        try {
          const participant = INITIAL_PARTICIPANTS.find((p) => p.id === rec.participantId);
          const session = DIKLAT_SESSIONS.find((s) => s.id === rec.sessionId);
          const enriched = {
            ...rec,
            participantNo: participant?.no || rec.participantId,
            sessionDate: session?.date || '19 Oktober 2026',
            sessionCode: session?.code || rec.sessionId,
            sessionTitle: session?.title || rec.sessionTitle,
          };

          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'presensi',
              data: enriched,
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
        total: store.attendance.length,
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
