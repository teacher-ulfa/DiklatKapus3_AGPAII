export interface Participant {
  id: number;
  no: number;
  name: string;
  status: string; // e.g., 'Kepala Perpustakaan' | 'Guru Pendidikan Agama Islam' | 'Guru Mata Pelajaran (selain PAI)'
  kepalaPerpusStatus?: string; // 'Belum' | 'Sudah'
  institution: string;
  city: string;
  province: string;
}

export interface DiklatSession {
  id: string;
  code: string;
  title: string;
  date: string;
  time: string;
  speaker: string;
  speakerRole: string;
  description: string;
  topics: string[];
  isOpen: boolean;
}

export interface DiklatTask {
  id: string;
  code: string;
  title: string;
  deadline: string;
  weight: number; // percentage, e.g. 15
  category: string;
  description: string;
  instructions: string[];
  submissionFormat: string;
  templateUrl?: string;
  templateName?: string;
  canvaUrl?: string;
}

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit';

export interface AttendanceRecord {
  id: string;
  participantId: number;
  participantName: string;
  institution: string;
  city: string;
  sessionId: string;
  sessionTitle: string;
  timestamp: string;
  status: AttendanceStatus;
  notes?: string;
  signature?: string; // base64
  photoProof?: string; // base64 or url
  verified: boolean;
}

export type SubmissionStatus = 'Belum Dinilai' | 'Dinilai' | 'Perlu Revisi';

export interface TaskSubmission {
  id: string;
  participantId: number;
  participantName: string;
  institution: string;
  taskId: string;
  taskTitle: string;
  submittedAt: string;
  title: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  docLink?: string;
  notes?: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type ActiveTab = 'beranda' | 'presensi' | 'tugas' | 'rekap' | 'cek-mandiri';
