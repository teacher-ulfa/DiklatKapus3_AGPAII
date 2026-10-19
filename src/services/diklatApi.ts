import { AttendanceRecord, TaskSubmission } from '../types';
import { SpreadsheetConfig } from './googleSheets';

export interface RemoteDiklatData {
  attendance: AttendanceRecord[];
  submissions: TaskSubmission[];
  spreadsheetConfig: SpreadsheetConfig | null;
  totalParticipants: number;
}

export const fetchRemoteDiklatData = async (): Promise<RemoteDiklatData | null> => {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return null;
    const data = await res.json();
    return {
      attendance: data.attendance || [],
      submissions: data.submissions || [],
      spreadsheetConfig: data.spreadsheetConfig || null,
      totalParticipants: data.totalParticipants || 54,
    };
  } catch (err) {
    console.warn('API /api/data not reachable (using local fallback):', err);
    return null;
  }
};

export const postAttendanceApi = async (record: AttendanceRecord): Promise<boolean> => {
  try {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return res.ok;
  } catch (err) {
    console.warn('postAttendanceApi error:', err);
    return false;
  }
};

export const deleteAttendanceApi = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/attendance/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('deleteAttendanceApi error:', err);
    return false;
  }
};

export const postSubmissionApi = async (submission: TaskSubmission): Promise<boolean> => {
  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    return res.ok;
  } catch (err) {
    console.warn('postSubmissionApi error:', err);
    return false;
  }
};

export const postGradeSubmissionApi = async (payload: {
  id: string;
  score: number;
  feedback?: string;
  verifiedBy?: string;
}): Promise<boolean> => {
  try {
    const res = await fetch('/api/submissions/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn('postGradeSubmissionApi error:', err);
    return false;
  }
};

export const postSpreadsheetConfigApi = async (
  config: SpreadsheetConfig | null
): Promise<boolean> => {
  try {
    const res = await fetch('/api/config/spreadsheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    });
    return res.ok;
  } catch (err) {
    console.warn('postSpreadsheetConfigApi error:', err);
    return false;
  }
};

export const syncLocalToServerApi = async (
  localAttendance: AttendanceRecord[],
  localSubmissions: TaskSubmission[]
): Promise<{ addedAttendance: number; addedSubmissions: number } | null> => {
  try {
    const res = await fetch('/api/sync-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localAttendance, localSubmissions }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('syncLocalToServerApi warning:', err);
    return null;
  }
};

export const triggerMassAttendanceSessionApi = async (
  sessionIds: string[] = ['sesi-1', 'sesi-2']
): Promise<{ success: boolean; createdCount: number; attendance: AttendanceRecord[] } | null> => {
  try {
    const res = await fetch('/api/admin/mass-attendance-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionIds }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('triggerMassAttendanceSessionApi error:', err);
    return null;
  }
};

export const triggerSyncAllToWebhookApi = async (
  webhookUrl?: string
): Promise<{ success: boolean; sentCount: number; failedCount: number; total: number } | null> => {
  try {
    const res = await fetch('/api/webhook/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('triggerSyncAllToWebhookApi error:', err);
    return null;
  }
};
