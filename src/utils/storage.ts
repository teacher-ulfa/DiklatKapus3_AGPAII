import { Participant, AttendanceRecord, TaskSubmission } from '../types';
import { INITIAL_PARTICIPANTS } from '../data/participants';
import { INITIAL_ATTENDANCE, INITIAL_SUBMISSIONS } from '../data/diklatData';

const STORAGE_KEYS = {
  PARTICIPANTS: 'diklat_perpus_participants_v8',
  ATTENDANCE: 'diklat_perpus_attendance_v8',
  SUBMISSIONS: 'diklat_perpus_submissions_v5',
  ADMIN_MODE: 'diklat_perpus_admin_mode_v4',
};

// Collector to recover any attendance filled on this device from previous keys
export const getAllLocalAttendanceToRecover = (): AttendanceRecord[] => {
  const recovered: AttendanceRecord[] = [];
  const keys = [
    'diklat_perpus_attendance_v8',
    'diklat_perpus_attendance_v7',
    'diklat_perpus_attendance_v6',
    'diklat_perpus_attendance_v5',
    'diklat_perpus_attendance_v4',
    'diklat_perpus_attendance_v3',
    'diklat_perpus_attendance_v2',
    'diklat_perpus_attendance',
  ];

  keys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((rec) => {
            if (rec && rec.participantId && rec.sessionId) {
              const already = recovered.some(
                (r) => r.participantId === rec.participantId && r.sessionId === rec.sessionId
              );
              if (!already) recovered.push(rec);
            }
          });
        }
      }
    } catch {
      // ignore
    }
  });

  return recovered;
};

// Collector to recover any submissions made on this device from previous keys
export const getAllLocalSubmissionsToRecover = (): TaskSubmission[] => {
  const recovered: TaskSubmission[] = [];
  const keys = [
    'diklat_perpus_submissions_v5',
    'diklat_perpus_submissions_v4',
    'diklat_perpus_submissions_v3',
    'diklat_perpus_submissions_v2',
    'diklat_perpus_submissions',
  ];

  keys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((sub) => {
            if (sub && sub.participantId && sub.taskId) {
              const already = recovered.some(
                (s) => s.participantId === sub.participantId && s.taskId === sub.taskId
              );
              if (!already) recovered.push(sub);
            }
          });
        }
      }
    } catch {
      // ignore
    }
  });

  return recovered;
};

export const getStoredParticipants = (): Participant[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length >= INITIAL_PARTICIPANTS.length) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load participants from localStorage', err);
  }
  saveParticipants(INITIAL_PARTICIPANTS);
  return INITIAL_PARTICIPANTS;
};

export const saveParticipants = (participants: Participant[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  } catch (err) {
    console.error('Failed to save participants', err);
  }
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length >= INITIAL_ATTENDANCE.length) {
        return parsed;
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with INITIAL_ATTENDANCE so user manual presensi is not lost
        const merged = [...parsed];
        INITIAL_ATTENDANCE.forEach((seed) => {
          const exists = merged.some(
            (m) => m.participantId === seed.participantId && m.sessionId === seed.sessionId
          );
          if (!exists) merged.push(seed);
        });
        saveAttendance(merged);
        return merged;
      }
    }
  } catch (err) {
    console.error('Failed to load attendance from localStorage', err);
  }
  saveAttendance(INITIAL_ATTENDANCE);
  return INITIAL_ATTENDANCE;
};

export const saveAttendance = (records: AttendanceRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save attendance', err);
  }
};

export const getStoredSubmissions = (): TaskSubmission[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to load submissions from localStorage', err);
  }
  return INITIAL_SUBMISSIONS;
};

export const saveSubmissions = (submissions: TaskSubmission[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  } catch (err) {
    console.error('Failed to save submissions', err);
  }
};

export const resetAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
};

export const exportAllDataJSON = (): string => {
  const payload = {
    app: 'Diklat Kepala Perpustakaan DPW AGPAII Jatim & UPT Perpustakaan UIN SATU',
    exportedAt: new Date().toISOString(),
    participants: getStoredParticipants(),
    attendance: getStoredAttendance(),
    submissions: getStoredSubmissions(),
  };
  return JSON.stringify(payload, null, 2);
};
