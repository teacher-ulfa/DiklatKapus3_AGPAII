import { Participant, AttendanceRecord, TaskSubmission, DiklatSession, DiklatTask } from '../types';

export const downloadCSV = (content: string, filename: string): void => {
  // UTF-8 BOM so Excel opens accented characters & Indonesian text correctly
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateRecapCSV = (
  participants: Participant[],
  sessions: DiklatSession[],
  tasks: DiklatTask[],
  attendanceList: AttendanceRecord[],
  submissionsList: TaskSubmission[]
): string => {
  // Headers
  const sessionHeaders = sessions.map((s) => `Presensi ${s.code}`);
  const taskHeaders = tasks.map((t) => `Tugas ${t.code} (Skor)`);
  const headers = [
    'No',
    'Nama Lengkap',
    'Jabatan / Status',
    'Instansi Sekolah/Madrasah',
    'Kabupaten / Kota',
    'Provinsi',
    ...sessionHeaders,
    'Total Hadir',
    '% Kehadiran',
    ...taskHeaders,
    'Tugas Terkumpul',
    'Rata-rata Nilai',
    'Status Kelulusan',
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = participants.map((p) => {
    // Session attendance
    let totalHadir = 0;
    const sessionCols = sessions.map((s) => {
      const att = attendanceList.find(
        (a) => a.participantId === p.id && a.sessionId === s.id
      );
      if (att && att.status === 'Hadir') {
        totalHadir++;
        return 'Hadir';
      } else if (att) {
        return att.status;
      }
      return 'Belum Hadir';
    });

    const attendancePct = Math.round((totalHadir / sessions.length) * 100);

    // Task scores
    let submittedCount = 0;
    let scoreSum = 0;
    let scoredCount = 0;

    const taskCols = tasks.map((t) => {
      const sub = submissionsList.find(
        (item) => item.participantId === p.id && item.taskId === t.id
      );
      if (sub) {
        submittedCount++;
        if (sub.score !== undefined && sub.score !== null) {
          scoreSum += sub.score;
          scoredCount++;
          return `${sub.score} (${sub.status})`;
        }
        return `Kumpul (${sub.status})`;
      }
      return 'Belum';
    });

    const avgScore = scoredCount > 0 ? Math.round(scoreSum / scoredCount) : 0;
    const minTasksRequired = Math.max(1, Math.round(tasks.length * 0.85));
    const isEligible = attendancePct >= 80 && submittedCount >= minTasksRequired && (scoredCount === 0 || avgScore >= 75);
    const kelulusan = isEligible
      ? 'MEMENUHI SYARAT KELULUSAN'
      : submittedCount === 0
      ? 'BELUM MENUNTASKAN TUGAS'
      : 'DALAM PROSES PROGRES';

    return [
      p.no,
      p.name,
      p.status,
      p.institution,
      p.city,
      p.province,
      ...sessionCols,
      totalHadir,
      `${attendancePct}%`,
      ...taskCols,
      `${submittedCount}/${tasks.length}`,
      avgScore > 0 ? avgScore : '-',
      kelulusan,
    ].map(escapeCSV).join(';'); // Use semicolon for seamless Excel Indonesian/European delimiter
  });

  return [headers.map(escapeCSV).join(';'), ...rows].join('\r\n');
};

export const generateAttendanceCSV = (
  participants: Participant[],
  sessions: DiklatSession[],
  attendanceList: AttendanceRecord[]
): string => {
  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    'No',
    'Nama Lengkap',
    'Jabatan',
    'Instansi Sekolah / Madrasah',
    'Kabupaten / Kota',
    'Provinsi',
    ...sessions.map((s) => `${s.code} - ${s.title}`),
    'Total Hadir',
    '% Kehadiran',
  ];

  const rows = participants.map((p) => {
    let totalHadir = 0;
    const sessionCols = sessions.map((s) => {
      const att = attendanceList.find(
        (a) => a.participantId === p.id && a.sessionId === s.id
      );
      if (att && att.status === 'Hadir') {
        totalHadir++;
        return `Hadir (${att.timestamp})`;
      } else if (att) {
        return att.status;
      }
      return 'Belum Mengisi';
    });

    const attendancePct = Math.round((totalHadir / sessions.length) * 100);

    return [
      p.no,
      p.name,
      p.status,
      p.institution,
      p.city,
      p.province,
      ...sessionCols,
      totalHadir,
      `${attendancePct}%`,
    ].map(escapeCSV).join(';');
  });

  return [headers.map(escapeCSV).join(';'), ...rows].join('\r\n');
};

