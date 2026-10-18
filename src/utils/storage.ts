import { Participant, AttendanceRecord, TaskSubmission } from '../types';
import { INITIAL_PARTICIPANTS } from '../data/participants';
import { INITIAL_ATTENDANCE, INITIAL_SUBMISSIONS } from '../data/diklatData';

const STORAGE_KEYS = {
  PARTICIPANTS: 'diklat_perpus_participants_v3',
  ATTENDANCE: 'diklat_perpus_attendance_v3',
  SUBMISSIONS: 'diklat_perpus_submissions_v3',
  ADMIN_MODE: 'diklat_perpus_admin_mode_v3',
};

// Clean up legacy demo keys so the app starts completely clean for live production
try {
  ['diklat_perpus_attendance', 'diklat_perpus_attendance_v2', 'diklat_perpus_submissions', 'diklat_perpus_submissions_v2'].forEach(
    (key) => localStorage.removeItem(key)
  );
} catch {
  // ignore
}

export const getStoredParticipants = (): Participant[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to load participants from localStorage', err);
  }
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to load attendance from localStorage', err);
  }
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
