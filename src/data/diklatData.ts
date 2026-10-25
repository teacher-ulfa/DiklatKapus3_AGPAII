import { DiklatSession, DiklatTask, AttendanceRecord, TaskSubmission } from '../types';
import { INITIAL_PARTICIPANTS } from './participants';

export const AGPAII_LOGO_URL =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEItxHQQ4yVvZl3pRlZGfnJuT2SGZPk1ZjJAvgWKcuuVVMcmyCLwWmFnSUtovKH7j_grWquP4x5YQWdbk6T7UtyIvLT7MCeEHRro0ukVOLtpdiMLY7fZ6baQntOicme_ywuSUamgv5R6Jd0xFzs4jy0P1B9-U2YoC0d14ZNt1DJHmtNlLQQsPNkWO2eqcU/s320/LOGO%20AGPAII.png';

export const UIN_LOGO_URL =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhry-rXeFhfkastm1xOSf0dJXgLfy6GIUr5Xh6Jj1B7xYOQO8rxIBIPghBa_AkAs9rywTGrFu_GdYjEGlte4ory56gZGslS30w71ExHXWKYObhYedg-inFqLsIcDwCqxlonoINQnefZzJaOrpnJE_6LDc4IpbvWSBbxXr-Q4qFcRrLeOnJrVTu0dU39dcXa/s554/LOGO%20UINSATU.png';

export const DRIVE_MODUL_URL =
  'https://drive.google.com/drive/folders/1CNOcR-MC3BZ5RmcrllrG2kB62ynSqLdJ?usp=sharing';

// Tautan Resmi Zoom Meeting Diklat (Berlaku dari Pembukaan hingga Penutupan)
export const ZOOM_CONFIG = {
  joinUrl:
    'https://us06web.zoom.us/j/87463474090?pwd=xC6XM7xyt0OHEa62ZayJbDywqZqgWx.1',
  meetingId: '874 6347 4090',
  meetingIdRaw: '87463474090',
  passcode: '997524',
  roomTitle: 'Ruang Zoom Utama Diklat Kepala Perpustakaan',
  validity:
    'Berlaku selama seluruh rangkaian kegiatan berlangsung (mulai pembukaan hingga penutupan resmi)',
};

export const DIKLAT_INFO = {
  title: 'Pendidikan dan Pelatihan Kepala Perpustakaan Sekolah',
  subtitle: 'Pola 120 Jam Pelajaran (26 JP Teori, 94 JP Praktik)',
  organizer: 'DPW AGPAII Provinsi Jawa Timur',
  partner: 'UPT Perpustakaan UIN Sayyid Ali Rahmatullah Tulungagung',
  cooperationNote: 'Kementerian Agama Republik Indonesia · Universitas Islam Negeri Sayyid Ali Rahmatullah Tulungagung bekerjasama dengan DPW AGPAII Jawa Timur',
  dates: '19 - 29 Oktober 2026',
  modality: 'Hybrid Training (Zoom Meeting Sinkronus & Praktik Terbimbing Asinkronus WA Group)',
  zoomUrl: ZOOM_CONFIG.joinUrl,
  zoomMeetingId: ZOOM_CONFIG.meetingId,
  zoomPasscode: ZOOM_CONFIG.passcode,
  contactPhone: '+62 812-3456-7890 (Sekretariat DPW AGPAII Jatim & UPT Perpustakaan UIN SATU)',
  contactEmail: 'perpustakaan@uinsatu.ac.id / diklat.perpus.agpaiijatim@gmail.com',
  certCriteria: 'Kelulusan dan penerbitan sertifikat pelatihan 120 JP dinilai berdasarkan akumulasi kehadiran sesi Zoom, keaktifan dalam grup praktik, serta ketepatan waktu dan kualitas luaran 8 tugas praktik yang dikumpulkan.',
  totalJP: 120,
  teoriJP: 26,
  praktikJP: 94,
};

// Sesi Pembukaan, Teori, dan Penutupan Resmi via Zoom sesuai Jadwal Halaman 12
export const DIKLAT_SESSIONS: DiklatSession[] = [
  {
    id: 'sesi-1',
    code: 'SESI-01',
    title: 'Pembukaan Pelatihan Resmi & Pengarahan Program',
    date: 'Senin, 19 Oktober 2026',
    time: '08.00 - 10.15 WIB',
    speaker: 'Prof. Dr. Abd. Aziz, M.Pd.I. (Rektor) & Dr. Ahmad Fahrudin, M.Pd.I.',
    speakerRole: 'Rektor UIN SATU & Kepala UPT Perpustakaan UIN SATU',
    description: 'Pembukaan resmi Diklat Kepala Perpustakaan Sekolah oleh Rektor UIN SATU dilanjutkan pengarahan teknis program pelatihan 120 JP.',
    topics: ['Arah Kebijakan Kampus & Kemenag', 'Kurikulum 120 JP', 'Building Learning Commitment (BLC)'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
  {
    id: 'sesi-2',
    code: 'SESI-02',
    title: 'Pengorganisasian Informasi di Perpustakaan Sekolah',
    date: 'Senin, 19 Oktober 2026',
    time: '13.00 - 15.15 WIB',
    speaker: 'Galuh Indah Zatadini, M.Eng.',
    speakerRole: 'Dosen Ilmu Perpustakaan dan Informasi Islam UIN SATU',
    description: 'Konsep pengorganisasian data informasi perpustakaan, digitalisasi katalog, audit infrastruktur TI, dan cetak biru otomasi perpustakaan sekolah.',
    topics: ['Audit Perangkat Keras & Lunak', 'Blueprint Sistem Informasi', 'Otomasi Perpustakaan'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
  {
    id: 'sesi-3',
    code: 'SESI-03',
    title: 'Manajemen Kelembagaan Perpustakaan Sekolah',
    date: 'Selasa, 20 Oktober 2026',
    time: '08.00 - 10.15 WIB',
    speaker: 'Nafahatin Nur, S.IIP.',
    speakerRole: 'Pustakawan UPT Perpustakaan UIN SATU Tulungagung',
    description: 'Tata pamong kelembagaan, analisis SWOT internal-eksternal sekolah, struktur organisasi, dan perumusan strategi mutu perpustakaan.',
    topics: ['Tata Pamong Kelembagaan', 'Analisis SWOT Strategis', 'Penyusunan Program Kerja'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
  {
    id: 'sesi-4',
    code: 'SESI-04',
    title: 'Pengembangan dan Pengolahan Bahan Pustaka',
    date: 'Rabu, 21 Oktober 2026',
    time: '08.00 - 10.15 WIB',
    speaker: 'Endang Rifngati, S.Sos.',
    speakerRole: 'Pustakawan UPT Perpustakaan UIN SATU Tulungagung',
    description: 'Pemetaan koleksi bahan pustaka berbasis kebutuhan pengguna (user-centered collection), survei aspirasi wali kelas, dan prioritas belanja koleksi.',
    topics: ['User-Centered Collection', 'Analisis Kesenjangan Koleksi', 'Prioritas Pengadaan Buku'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
  {
    id: 'sesi-5',
    code: 'SESI-05',
    title: 'Manajemen Promosi Perpustakaan & Pembudayaan Kegemaran Membaca',
    date: 'Kamis, 22 Oktober 2026',
    time: '09.00 - 11.15 WIB',
    speaker: 'Evi Zulfiyana, S.I.Pust.',
    speakerRole: 'Pustakawan UPT Perpustakaan UIN SATU Tulungagung',
    description: 'Pemasaran perpustakaan (library marketing), perancangan media komunikasi visual luar ruang (X-Banner), dan strategi peningkatan literasi sekolah.',
    topics: ['Library Marketing', 'Desain X-Banner Publikasi', 'Kampanye Gemar Membaca'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
  {
    id: 'sesi-6',
    code: 'SESI-06',
    title: 'Pembangunan Organisasi Berbasis Moderasi dan Ekoteologi',
    date: "Jum'at, 23 Oktober 2026",
    time: '08.00 - 10.15 WIB',
    speaker: 'Dr. Miftakhul Huda SE.I., S.H., M.Sy. & Nafiul Lubab, S.Pd.I., M.S.I.',
    speakerRole: 'Dosen Fak. Syariah & Ilmu Hukum serta Dosen FTIK UIN SATU',
    description: 'Penguatan nilai-nilai moderasi beragama, kepedulian lingkungan (ekoteologi), dan etika kepemimpinan islami di lingkungan perpustakaan madrasah/sekolah.',
    topics: ['Nilai Moderasi Beragama', 'Prinsip Ekoteologi Perpustakaan', 'Kepemimpinan Transformatif'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
  {
    id: 'sesi-7',
    code: 'SESI-07',
    title: 'Manajemen dan Inovasi Layanan Perpustakaan',
    date: 'Senin, 26 Oktober 2026',
    time: '08.00 - 10.15 WIB',
    speaker: "Laila Rifa'atul Azizah, S.AP.",
    speakerRole: 'Pustakawan UPT Perpustakaan UIN SATU Tulungagung',
    description: 'Evaluasi sistem sirkulasi pemustaka: sistem layanan terbuka (open access), tertutup (closed access), dan semi terbuka (semi open access) serta inovasi layanan.',
    topics: ['Open vs Closed Access', 'Alur Efisiensi Sirkulasi', 'Inovasi Kenyamanan Pemustaka'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
  {
    id: 'sesi-8',
    code: 'SESI-08',
    title: 'Manajemen Pelestarian Bahan Perpustakaan (Preservasi)',
    date: 'Selasa, 27 Oktober 2026',
    time: '08.00 - 10.15 WIB',
    speaker: 'Nurul Setyawati Handayani, M.A.',
    speakerRole: 'Dosen Ilmu Perpustakaan dan Informasi Islam UIN SATU',
    description: 'Tindakan preventif dan kuratif pelestarian fisik koleksi, pengendalian suhu/kelembapan, pembersihan rak, pencegahan hama/biota, dan SOP preservasi.',
    topics: ['Faktor Risiko Kerusakan', 'Aksi Nyata Perawatan Fisik', 'SOP Preservasi Koleksi'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
  {
    id: 'sesi-9',
    code: 'SESI-09',
    title: 'Pengembangan SDM dan Sarana Prasarana Perpustakaan',
    date: 'Rabu, 28 Oktober 2026',
    time: '08.00 - 10.15 WIB',
    speaker: 'Erma Awalien Rochmah, S.E.',
    speakerRole: 'Pustakawan UPT Perpustakaan UIN SATU Tulungagung',
    description: 'Analisis kebutuhan kompetensi tenaga perpustakaan, pembagian beban kerja, serta audit kelayakan sarana prasarana fisik dan fasilitas pendukung.',
    topics: ['Kebutuhan & Kompetensi SDM', 'Audit Sarana & Prasarana', 'Rencana Tindak Lanjut Pengadaan'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
  {
    id: 'sesi-10',
    code: 'SESI-10',
    title: 'Evaluasi Pembelajaran & Penutupan Resmi Diklat',
    date: 'Rabu, 28 Oktober 2026',
    time: '10.15 - 13.30 WIB',
    speaker: 'Dr. Ahmad Fahrudin, M.Pd.I. & Tim Panitia',
    speakerRole: 'Kepala UPT Perpustakaan UIN SATU Tulungagung',
    description: 'Review komprehensif, evaluasi pembelajaran (Pre/Post-test & Evaluasi Program), verifikasi portofolio tugas, dan upacara penutupan resmi diklat.',
    topics: ['Evaluasi Pembelajaran', 'Finalisasi Luaran Tugas', 'Pelepasan Calon Kepala Perpustakaan'],
    isOpen: true,
    zoomUrl: ZOOM_CONFIG.joinUrl,
    meetingId: ZOOM_CONFIG.meetingId,
    passcode: ZOOM_CONFIG.passcode,
  },
];

// 8 Tagihan Tugas Praktik Resmi Sesuai Bagian D. TUGAS PRAKTIK (Halaman 13-18 Pedoman Penyelenggaraan)
export const DIKLAT_TASKS: DiklatTask[] = [
  {
    id: 'tugas-1',
    code: 'TUGAS-01',
    title: 'Analisis Kebutuhan Teknologi Informasi pada Perpustakaan Sekolah',
    deadline: '21 Oktober 2026, 23.59 WIB',
    weight: 12,
    category: 'Pengorganisasian Informasi',
    description:
      'Membekali peserta dengan kemampuan merencanakan digitalisasi dan modernisasi sistem pencatatan informasi di perpustakaan. Peserta dituntut mengaudit infrastruktur perangkat keras (hardware), perangkat lunak (software), serta jaringan yang saat ini dimiliki atau dibutuhkan perpustakaan sebagai cetak biru (blueprint) otomasi sirkulasi dan repositori digital.',
    instructions: [
      'Periksalah kondisi pengelolaan data informasi perpustakaan, apakah masih manual atau semi-otomasi.',
      'Identifikasi kendala teknis dalam proses pencarian buku dan pencatatan riwayat pinjaman siswa.',
      'Susun draf kebutuhan komponen TI yang ideal untuk diterapkan (misal migrasi ke aplikasi SLiMS atau sejenis).',
      'Deskripsikan rencana langkah-langkah implementasi penataan TI dalam laporan singkat rapi kertas A4.',
    ],
    submissionFormat: 'Dokumen laporan kebutuhan TI format .docx (Word)',
    templateName: 'Template_Analisis_Kebutuhan_TI.docx',
    templateUrl:
      'https://docs.google.com/document/d/1BC3UJ_ZRk92qLgVrmaa3_C6Dvgba0yApnfOk5OW9a1k/edit?usp=sharing',
  },
  {
    id: 'tugas-2',
    code: 'TUGAS-02',
    title: 'Analisis Kebutuhan Buku Tiap Kelas Berdasarkan Masukan Wali Kelas',
    deadline: '22 Oktober 2026, 23.59 WIB',
    weight: 13,
    category: 'Pengembangan & Pengolahan Bahan Pustaka',
    description:
      'Melatih kemampuan kepala perpustakaan dalam melakukan pemetaan koleksi bahan pustaka berbasis kebutuhan pengguna (user-centered collection). Peserta menjalin komunikasi kolaboratif dengan seluruh wali kelas guna menjaring aspirasi jenis literatur pendukung pembelajaran yang paling dibutuhkan siswa sebagai prioritas pengadaan bahan pustaka.',
    instructions: [
      'Buatlah instrumen atau formulir sederhana pengumpulan data kebutuhan buku yang ditujukan kepada para wali kelas.',
      'Lakukan koordinasi atau wawancara singkat dengan wali kelas (semua tingkatan kelas di sekolah).',
      'Rekapitulasi seluruh data masukan ke dalam tabel analisis kebutuhan berdasarkan tingkatan kelas secara teratur.',
      'Berikan analisis ringkas mengenai buku apa saja yang mendesak untuk diadakan beserta estimasi volume kebutuhannya.',
    ],
    submissionFormat: 'Dokumen laporan analisis kebutuhan bahan pustaka format .docx (Word)',
    templateName: 'Template_Analisis_Kebutuhan_Buku.docx',
    templateUrl:
      'https://docs.google.com/document/d/1QpWd9oeQ8KjIRCHVgwQFqjLQGizksx5SewgymqFf-7s/edit?usp=sharing',
  },
  {
    id: 'tugas-3',
    code: 'TUGAS-03',
    title: 'Analisis SWOT Strategi Pengembangan Manajemen Kelembagaan Perpustakaan Sekolah',
    deadline: '23 Oktober 2026, 23.59 WIB',
    weight: 13,
    category: 'Manajemen Kelembagaan',
    description:
      'Melakukan evaluasi mendalam terhadap kondisi internal dan eksternal kelembagaan perpustakaan di sekolah masing-masing untuk merumuskan strategi program kerja yang objektif, realistis, dan visioner demi peningkatan mutu institusi.',
    instructions: [
      'Identifikasi 5-10 faktor kekuatan (strengths) dan 5-10 faktor kelemahan (weaknesses) internal tata pamong kelembagaan.',
      'Petakan minimal 5-10 faktor peluang (opportunities) dan 5-10 faktor ancaman (threats) lingkungan eksternal.',
      'Masukkan poin-poin tersebut ke dalam tabel matriks SWOT standar (SO, ST, WO, WT).',
      'Tarik kesimpulan berupa rumusan strategi atau rekomendasi kebijakan pengembangan kelembagaan perpustakaan.',
      'Tugas wajib dikerjakan mandiri, Times New Roman 12 spasi 1.5, dilarang keras plagiasi.',
    ],
    submissionFormat: 'Dokumen laporan analisis strategi format .docx (Word)',
    templateName: 'Template_Analisis_SWOT_Kelembagaan.docx',
    templateUrl:
      'https://docs.google.com/document/d/1PVuSox9XUu9U6boznw8qtVdFHPl6pfxHtKqYYFWD9vI/edit?usp=sharing',
  },
  {
    id: 'tugas-4',
    code: 'TUGAS-04',
    title: 'Pembuatan, Pencetakan, dan Pelaporan Media X-Banner Promosi Gemar Membaca',
    deadline: '24 Oktober 2026, 23.59 WIB',
    weight: 13,
    category: 'Promosi & Pembudayaan Membaca',
    description:
      'Melatih keterampilan pemasaran perpustakaan (library marketing). Peserta merancang media promosi visual berupa X-Banner (ukuran 60x160 cm) dengan konten pesan ajakan gemar membaca, mencetak secara fisik ke percetakan, memasang di area strategis perpustakaan, difoto, dan dilaporkan sebagai bukti keberhasilan program.',
    instructions: [
      'Tentukan tema, slogan, atau kata ajakan promosi membaca yang unik dan sesuai dengan psikologi siswa sekolah.',
      'Buat desain visual X-Banner (ukuran 60x160 cm) menggunakan Canva, CorelDraw, Illustrator, atau Photoshop.',
      'Cetak hasil desain menjadi X-Banner fisik lengkap dengan tiang penyangga melalui percetakan.',
      'Pasang banner di depan perpustakaan/sekolah, ambil foto dokumentasi asli, dan susun laporan proses pembuatannya.',
      'Banner wajib mencantumkan logo sekolah atau logo perpustakaan asal.',
    ],
    submissionFormat: 'Dokumen laporan proses pembuatan dan foto X-Banner terpasang format .docx (Word)',
    templateName: 'Template_Laporan_X_Banner.docx',
    templateUrl:
      'https://docs.google.com/document/d/1e9ShT3atPRCvGVMTsoTcaEcGI2pYa_MFEINsdJHKPUg/edit?usp=sharing',
    canvaUrl: 'https://canva.link/7iupcgzz4okz66f',
  },
  {
    id: 'tugas-5',
    code: 'TUGAS-05',
    title: 'Identifikasi Bentuk Layanan Terbuka, Tertutup, dan Semi Terbuka di Perpustakaan',
    deadline: '26 Oktober 2026, 23.59 WIB',
    weight: 12,
    category: 'Manajemen & Inovasi Layanan',
    description:
      'Menguji pemahaman peserta dalam menerapkan sistem pelayanan sirkulasi yang paling efektif bagi pemustaka di sekolah. Peserta mengevaluasi denah tata ruang, aksesibilitas siswa terhadap rak buku, keamanan koleksi, efisiensi petugas, serta perbandingan sistem open access, closed access, dan semi open access.',
    instructions: [
      'Amati alur sirkulasi peminjaman dan pengembalian buku yang saat ini berlaku di perpustakaan sekolah.',
      'Uraikan secara detail implementasi aspek layanan terbuka, tertutup, atau semi terbuka pada bagian koleksi tertentu.',
      'Lakukan analisis kritis mengenai efektivitas alur tersebut dari sisi kenyamanan siswa dan pengawasan pustakawan.',
      'Tuliskan usulan perbaikan tata cara layanan sirkulasi perpustakaan (1-2 halaman teks ilmiah populer).',
    ],
    submissionFormat: 'Dokumen laporan identifikasi layanan sirkulasi format .docx (Word)',
    templateName: 'Template_Identifikasi_Layanan_Sirkulasi.docx',
    templateUrl:
      'https://docs.google.com/document/d/1z0toqADDOaSwBkJdG5xRqZMn1figBlEKf_JM32rcOxU/edit?usp=sharing',
  },
  {
    id: 'tugas-6',
    code: 'TUGAS-06',
    title: 'Prosedur Upaya Mencegah Kerusakan Bahan Pustaka di Perpustakaan Sekolah',
    deadline: '27 Oktober 2026, 23.59 WIB',
    weight: 12,
    category: 'Manajemen Pelestarian Bahan Pustaka',
    description:
      'Fokus pada tindakan preventif (preservasi) untuk memperpanjang usia pakai koleksi fisik perpustakaan dari berbagai faktor perusak (perawatan harian, suhu/kelembapan, pembersihan debu, pencegahan biota/rayap). Peserta menyusun draf SOP preservasi dan menyertakan minimal 4 foto dokumentasi asli tindakan nyata di sekolah.',
    instructions: [
      'Periksa kondisi fisik ruang penyimpanan dan jajaran buku di rak perpustakaan sekolah untuk menemukan potensi ancaman.',
      'Susun draf panduan prosedur pencegahan kerusakan bahan pustaka secara berurutan dan logis.',
      'Lakukan tindakan perawatan nyata di perpustakaan (penataan sirkulasi udara, pembersihan rak, kapur barus/silica gel).',
      'Wajib menyertakan minimal 4 foto dokumentasi asli kegiatan perawatan (bukan dari internet) disertai caption jelas.',
    ],
    submissionFormat: 'Dokumen laporan prosedur preservasi dilengkapi foto format .docx (Word)',
    templateName: 'Template_Prosedur_Preservasi_Bahan_Pustaka.docx',
    templateUrl:
      'https://docs.google.com/document/d/1v6lh9vt6ThKOPFN_jXtvbiegIAcl1ZQJeNjy_hacCAo/edit?usp=sharing',
  },
  {
    id: 'tugas-7',
    code: 'TUGAS-07',
    title: 'Analisis Kebutuhan Sumber Daya Manusia dan Sarana Prasarana',
    deadline: '28 Oktober 2026, 23.59 WIB',
    weight: 13,
    category: 'Pengembangan SDM & Sarpras',
    description:
      'Analisis terhadap kondisi sumber daya manusia (jumlah petugas, kualifikasi, tugas, kompetensi, beban kerja, kebutuhan pelatihan) dan kondisi sarana prasarana perpustakaan (ruang, luas, tata letak, rak buku, meja baca, komputer, internet, ventilasi, pencahayaan, keamanan, aksesibilitas) beserta rencana tindak lanjut pengembangan.',
    instructions: [
      'Analisis SDM: identifikasi jumlah petugas, latar belakang pendidikan, pelatihan, pembagian tugas, dan kebutuhan pengembangan.',
      'Analisis Sarpras: observasi langsung ruang, perabot, pencahayaan, komputer, internet, dan fasilitas pemustaka.',
      'Identifikasi fasilitas yang rusak, belum tersedia, atau perlu ditingkatkan berdasarkan skala prioritas.',
      'Susun rencana tindak lanjut (RTL) yang dilengkapi perkiraan kebutuhan biaya, penanggung jawab, dan indikator keberhasilan.',
    ],
    submissionFormat: 'Dokumen laporan analisis kebutuhan SDM dan sarana prasarana format .docx (Word)',
    templateName: 'Template_Analisis_Kebutuhan_SDM_Sarpras.docx',
    templateUrl:
      'https://docs.google.com/document/d/1MC17ceYEBQu55xSFGXjpRcZMHhimUExQ/edit?usp=sharing&ouid=103149003712986437769&rtpof=true&sd=true',
  },
  {
    id: 'tugas-8',
    code: 'TUGAS-08',
    title: 'Pembuatan Video Yel-Yel Komitmen Belajar dan Memajukan Perpustakaan (BLC)',
    deadline: '29 Oktober 2026, 11.15 WIB',
    weight: 12,
    category: 'Building Learning Commitment (BLC)',
    description:
      'Tugas praktik perdana untuk membangun semangat kebersamaan, motivasi tinggi, dan komitmen kuat pengelola perpustakaan sekolah. Kepala perpustakaan memimpin staf/rekan di sekolahnya merekam video singkat yel-yel kreatif berdurasi 30 detik s.d. 2 menit dalam format landscape.',
    instructions: [
      'Susun lirik yel-yel pendek kreatif mengandung frasa "siap mengikuti pendidikan dan pelatihan" serta "perpustakaan sekolah maju!".',
      'Kumpulkan staf atau rekan sejawat di sekolah untuk latihan bersama agar gerakan dan ucapan kompak.',
      'Rekam video menggunakan kamera ponsel/digital dalam posisi horizontal (landscape) dengan audio dan pencahayaan jelas.',
      'Kepala Perpustakaan harus terlihat memimpin jalannya yel-yel dengan penuh semangat mengenakan pakaian dinas/rapi.',
      'Durasi minimal 30 detik dan maksimal 2 menit. File video diunggah format .mp4 atau tautan Google Drive/YouTube.',
    ],
    submissionFormat: 'File video format .mp4 (atau tautan Google Drive / YouTube)',
    templateName: 'Petunjuk_Video_Yel_Yel_BLC.pdf',
  },
];

// Pre-populated verified seed attendance for Sesi 1, Sesi 2, and Sesi 3 (54 participants x 3 sessions = 162 records)
const generateInitialAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  INITIAL_PARTICIPANTS.forEach((p) => {
    // Sesi 1: Pembukaan Pelatihan Resmi
    records.push({
      id: `att-${p.id}-sesi-1-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-1',
      sessionTitle: 'Pembukaan Pelatihan Resmi & Pengarahan Program',
      timestamp: '2026-10-19 08.15 WIB',
      status: 'Hadir',
      notes: 'Hadir Pembukaan Diklat Zoom Meeting',
      verified: true,
    });

    // Sesi 2: Pengorganisasian Informasi di Perpustakaan Sekolah
    records.push({
      id: `att-${p.id}-sesi-2-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-2',
      sessionTitle: 'Pengorganisasian Informasi di Perpustakaan Sekolah',
      timestamp: '2026-10-19 13.20 WIB',
      status: 'Hadir',
      notes: 'Hadir Sesi 2 Zoom Meeting Pengorganisasian Informasi',
      verified: true,
    });

    // Sesi 3: Manajemen Kelembagaan Perpustakaan Sekolah
    records.push({
      id: `att-${p.id}-sesi-3-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-3',
      sessionTitle: 'Manajemen Kelembagaan Perpustakaan Sekolah',
      timestamp: '2026-10-20 08.15 WIB',
      status: 'Hadir',
      notes: 'Hadir Sesi 3 Zoom Meeting Manajemen Kelembagaan',
      verified: true,
    });

    // Sesi 4: Pengembangan dan Pengolahan Bahan Pustaka (Rabu, 21 Oktober 2026)
    records.push({
      id: `att-${p.id}-sesi-4-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-4',
      sessionTitle: 'Pengembangan dan Pengolahan Bahan Pustaka',
      timestamp: '2026-10-21 08.15 WIB',
      status: 'Hadir',
      notes: 'Hadir Sesi 4 Zoom Meeting Pengembangan Bahan Pustaka',
      verified: true,
    });

    // Sesi 5: Manajemen Promosi Perpustakaan (Kamis, 22 Oktober 2026)
    records.push({
      id: `att-${p.id}-sesi-5-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-5',
      sessionTitle: 'Manajemen Promosi Perpustakaan & Pembudayaan Kegemaran Membaca',
      timestamp: '2026-10-22 09.15 WIB',
      status: 'Hadir',
      notes: 'Hadir Sesi 5 Zoom Meeting Manajemen Promosi & Budaya Baca',
      verified: true,
    });

    // Sesi 6: Pembangunan Organisasi Berbasis Moderasi dan Ekoteologi (Jum'at, 23 Oktober 2026)
    records.push({
      id: `att-${p.id}-sesi-6-seed`,
      participantId: p.id,
      participantName: p.name,
      institution: p.institution,
      city: p.city,
      sessionId: 'sesi-6',
      sessionTitle: 'Pembangunan Organisasi Berbasis Moderasi dan Ekoteologi',
      timestamp: '2026-10-23 08.15 WIB',
      status: 'Hadir',
      notes: 'Hadir Sesi 6 Zoom Meeting Moderasi Beragama & Ekoteologi',
      verified: true,
    });
  });
  return records;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = generateInitialAttendance();

// Clean initial state ready for real participant task submissions
export const INITIAL_SUBMISSIONS: TaskSubmission[] = [];

