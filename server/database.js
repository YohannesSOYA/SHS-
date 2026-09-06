const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        name TEXT NOT NULL
      )
    `);

    // eFiling documents table
    db.run(`
      CREATE TABLE IF NOT EXISTS efiling_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        department TEXT NOT NULL,
        file_url TEXT,
        file_type TEXT DEFAULT 'pdf',
        description TEXT,
        date_uploaded TEXT NOT NULL,
        downloads INTEGER DEFAULT 0
      )
    `);

    // Staff directory table
    db.run(`
      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        department TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        avatar_url TEXT,
        category TEXT DEFAULT 'Guru'
      )
    `);

    // Announcements table
    db.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Umum',
        is_important INTEGER DEFAULT 0
      )
    `);

    // Organization Chart table
    db.run(`
      CREATE TABLE IF NOT EXISTS organization_chart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        role TEXT NOT NULL,
        tier TEXT NOT NULL DEFAULT 'pk', -- pengetua, pk, kb, staf
        avatar_url TEXT,
        order_index INTEGER DEFAULT 0
      )
    `);

    // Gallery table
    db.run(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'Aktiviti',
        image_url TEXT NOT NULL,
        date_uploaded TEXT NOT NULL
      )
    `);

    // School Settings Info
    db.run(`
      CREATE TABLE IF NOT EXISTS school_info (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Principal Documents table
    db.run(`
      CREATE TABLE IF NOT EXISTS principal_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Ucapan Perasmian',
        file_url TEXT NOT NULL,
        file_type TEXT DEFAULT 'pdf',
        uploaded_by TEXT DEFAULT 'Admin',
        date_uploaded TEXT NOT NULL,
        notes TEXT
      )
    `);

    // Principal Notices table (Amanat & Arahan Pentadbiran Terkini)
    db.run(`
      CREATE TABLE IF NOT EXISTS principal_notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        tag TEXT NOT NULL DEFAULT 'Amanat Rasmi',
        content TEXT NOT NULL,
        date TEXT NOT NULL
      )
    `);

    // Unit Section Items table
    db.run(`
      CREATE TABLE IF NOT EXISTS unit_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_key TEXT NOT NULL,
        section_title TEXT NOT NULL,
        item_name TEXT NOT NULL,
        item_lead TEXT,
        item_code TEXT,
        image_url TEXT,
        order_index INTEGER DEFAULT 0
      )
    `, () => {
      db.run("ALTER TABLE unit_sections ADD COLUMN image_url TEXT", () => {});
    });

    // Songs / School Song table
    db.run(`
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'upload', -- 'upload' | 'gdrive' | 'youtube'
        file_url TEXT NOT NULL,
        date_uploaded TEXT NOT NULL,
        uploaded_by TEXT DEFAULT 'Admin'
      )
    `, () => {
      // Seed default school song from Google Drive
      db.get("SELECT * FROM songs WHERE id = 1", (err, row) => {
        if (!row) {
          db.run(
            `INSERT INTO songs (title, description, type, file_url, date_uploaded, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              'Lagu Sekolah SMK Sacred Heart',
              'Lagu rasmi sekolah SMK Sacred Heart, Sibu, Sarawak.',
              'gdrive',
              '1ScsSYZkCgIvl_RQnYx4dA3RypQFZEG9n',
              new Date().toISOString().split('T')[0],
              'Admin'
            ]
          );
        }
      });
    });

    // Timetables table (Class, Teacher, and Duty Teacher Timetables)
    db.run(`
      CREATE TABLE IF NOT EXISTS timetables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL DEFAULT 'kelas', -- 'kelas' | 'guru' | 'bertugas'
        title TEXT NOT NULL,
        form_level TEXT NOT NULL DEFAULT 'Tingkatan 5',
        file_url TEXT,
        notes TEXT,
        date_updated TEXT NOT NULL
      )
    `, () => {
      db.get('SELECT COUNT(*) as count FROM timetables', (err, row) => {
        if (row && row.count === 0) {
          const today = new Date().toISOString().split('T')[0];
          const seedTimetables = [
            ['kelas', 'Jadual Waktu 5 Science 1', 'Tingkatan 5', '#', 'Waktu Pengajaran & Pembelajaran Isnin - Jumaat (7:30 AM - 1:30 PM)', today],
            ['kelas', 'Jadual Waktu 4 Science 2', 'Tingkatan 4', '#', 'Waktu Pengajaran & Pembelajaran Isnin - Jumaat (7:30 AM - 1:30 PM)', today],
            ['kelas', 'Jadual Waktu 3 Bakti', 'Tingkatan 3', '#', 'Waktu Pengajaran Menengah Rendah (7:30 AM - 1:10 PM)', today],
            ['kelas', 'Jadual Waktu 2 Cemerlang', 'Tingkatan 2', '#', 'Waktu Pengajaran Menengah Rendah (7:30 AM - 1:10 PM)', today],
            ['guru', 'Jadual Waktu Cikgu Ahmad Bin Hassan (Matematik)', 'Tingkatan 5', '#', 'Pengajaran subjek Matematik Tambahan & Matematik 5 Science 1', today],
            ['guru', 'Jadual Waktu Cikgu Tan Wei Ling (Bahasa Inggeris)', 'Tingkatan 4', '#', 'Pengajaran subjek Bahasa Inggeris 4 Science 1 & 4 Arts 2', today],
            ['bertugas', 'Jadual Guru Bertugas Minggu Ini (Minggu 34)', 'Semua', '#', 'Ketua Bertugas: Cikgu Hairul Nizam | Ahli: Cikgu Wong, Cikgu Ling, Cikgu Mary', today]
          ];
          const stmt = db.prepare('INSERT INTO timetables (type, title, form_level, file_url, notes, date_updated) VALUES (?, ?, ?, ?, ?, ?)');
          seedTimetables.forEach(t => stmt.run(t));
          stmt.finalize();
          console.log('Seeded initial timetables data.');
        }
      });
    });

    // Form 6 Documents & Materials table
    db.run(`
      CREATE TABLE IF NOT EXISTS form6_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'STPM', -- 'STPM' | 'MUET' | 'PBS' | 'Pekeliling' | 'GDrive'
        file_url TEXT NOT NULL,
        file_type TEXT DEFAULT 'pdf',
        description TEXT,
        date_uploaded TEXT NOT NULL
      )
    `, () => {
      db.get('SELECT COUNT(*) as count FROM form6_documents', (err, row) => {
        if (row && row.count === 0) {
          const today = new Date().toISOString().split('T')[0];
          const seedDocs = [
            ['Google Drive Folder Rasmi Tingkatan 6 (T6)', 'GDrive', 'https://drive.google.com/drive/folders/10MhW5azyYZsdBcIyqQkj0Eqy_Khv2aib?usp=drive_link', 'gdrive', 'Pusat penyimpanan bahan, nota, modul, dan dokumen rasmi Tingkatan 6 SMK Sacred Heart.', today],
            ['Rekod Kebolehpasaran Graduan Tingkatan 6', 'GDrive', 'https://drive.google.com/drive/folders/1y-680PGi9doGUz8p_LDQ-SjL_wltK4Uu?usp=drive_link', 'gdrive', 'Laporan dan fail data rekod kebolehpasaran alumni / graduan STPM Tingkatan 6 SMK Sacred Heart.', today],
            ['Jadual Waktu Peperiksaan STPM 2026', 'STPM', '#', 'pdf', 'Jadual waktu rasmi peperiksaan STPM Semester 1, 2, dan 3.', today],
            ['Panduan dan Format Pentaksiran MUET 2026', 'MUET', '#', 'pdf', 'Panduan lengkap modul Listening, Speaking, Reading & Writing MUET.', today],
            ['Manual Kerja Kursus (PBS) Pengajian Am & Sejarah', 'PBS', '#', 'pdf', 'Garis panduan penulisan folio dan pentaksiran berasaskan sekolah (PBS).', today]
          ];
          const stmt = db.prepare('INSERT INTO form6_documents (title, category, file_url, file_type, description, date_uploaded) VALUES (?, ?, ?, ?, ?, ?)');
          seedDocs.forEach(d => stmt.run(d));
          stmt.finalize();
          console.log('Seeded initial Form 6 documents data.');
        }
      });
    });

    // Seed default admin user
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (!row) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.run('INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)', [
          'admin',
          hash,
          'admin',
          'Pentadbiran SMK Sacred Heart'
        ]);
        console.log('Seeded default admin user (admin / admin123)');
      } else {
        // Update existing admin name if it still shows old name
        db.run("UPDATE users SET name = 'Pentadbiran SMK Sacred Heart' WHERE username = 'admin' AND name LIKE '%Lundu%'");
      }
    });

    // Seed school info
    const infoData = [
      ['school_name', 'SMK Sacred Heart'],
      ['motto', 'Directa Labore - Dipandu Oleh Usaha Murni'],
      ['code', 'YEB3101'],
      ['address', 'Jalan Oya, 96000 Sibu, Sarawak'],
      ['phone', '084-330454'],
      ['email', 'smksacredheart.yeb3101@moe-dl.edu.my'],
      ['principal', 'Pengetua SMK Sacred Heart']
    ];

    infoData.forEach(([k, v]) => {
      db.run('INSERT OR IGNORE INTO school_info (key, value) VALUES (?, ?)', [k, v]);
    });

    // Seed initial e-filing documents
    db.get('SELECT COUNT(*) as count FROM efiling_documents', (err, row) => {
      if (row && row.count === 0) {
        const sampleDocs = [
          [
            'SPMS-2026-001',
            'Manual Pengurusan Sekolah 2026',
            'Pentadbiran',
            'Direktori SPMS',
            '#',
            'pdf',
            'Panduan dan garis panduan pengurusan organisasi sekolah tahun 2026.',
            '2026-01-05',
            142
          ],
          [
            'SPMS-2026-002',
            'Carta Organisasi & Jawatankuasa SPMS',
            'SPMS',
            'Direktori SPMS',
            '#',
            'pdf',
            'Senarai jawatankuasa dan agihan tugas e-filing Sistem Pengurusan Maklumat Sekolah.',
            '2026-01-10',
            98
          ],
          [
            'KUR-2026-012',
            'Takwim Pentaksiran & Peperiksaan SPM 2026',
            'Kurikulum',
            'Unit Peperiksaan',
            '#',
            'pdf',
            'Jadual Ujian Akhir Sesi Akademik & Peperiksaan Percubaan SPM.',
            '2026-02-01',
            310
          ],
          [
            'HEM-2026-005',
            'Borang Kebenaran Ibu Bapa & Peraturan Disiplin',
            'HEM',
            'Hal Ehwal Murid',
            '#',
            'doc',
            'Borang rasmi kebenaran aktiviti luar dan panduan sahsiah murid.',
            '2026-02-15',
            215
          ],
          [
            'KOKO-2026-008',
            'Laporan Pencapaian Sukan & Permainan Q1',
            'Kokurikulum',
            'Unit Kokurikulum',
            '#',
            'pdf',
            'Ringkasan aktiviti kelab, persatuan, dan kejohanan MSSD Sarawak.',
            '2026-03-02',
            76
          ],
          [
            'EFILE-2026-099',
            'Panduan Format E-Filing Fail Panitia',
            'Pentadbiran',
            'e-Filing',
            '#',
            'pdf',
            'Standard Operating Procedure (SOP) pendaftaran & muat naik fail panitia.',
            '2026-03-10',
            180
          ]
        ];

        const stmt = db.prepare(`
          INSERT INTO efiling_documents 
          (code, title, category, department, file_url, file_type, description, date_uploaded, downloads)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        sampleDocs.forEach((doc) => stmt.run(doc));
        stmt.finalize();
        console.log('Seeded sample e-filing documents.');
      }
    });

    // Seed initial staff members
    db.get('SELECT COUNT(*) as count FROM staff', (err, row) => {
      if (row && row.count === 0) {
        const sampleStaff = [
          [
            'Encik David Teo Wu (Pengetua)',
            'Pengetua Cemerlang',
            'Pentadbiran',
            'pengetua@smksacredheart.edu.my',
            '082-735234',
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
            'Pentadbir'
          ],
          [
            'Cikgu Dayang Roziah',
            'Penolong Kanan Pentadbiran',
            'Kurikulum',
            'pk.pentadbiran@smksacredheart.edu.my',
            '082-735235',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            'Pentadbir'
          ],
          [
            'Cikgu Mohamad Faizal',
            'Penolong Kanan Hal Ehwal Murid',
            'HEM',
            'pk.hem@smksacredheart.edu.my',
            '082-735236',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
            'Pentadbir'
          ],
          [
            'Cikgu Patricia Anak Joseph',
            'Penolong Kanan Kokurikulum',
            'Kokurikulum',
            'pk.koko@smksacredheart.edu.my',
            '082-735237',
            'https://images.unsplash.com/photo-1580894732413-87bb49276e46?w=150&auto=format&fit=crop&q=80',
            'Pentadbir'
          ],
          [
            'Cikgu Ahmad Redzuan',
            'Ketua Panitia Sains & Matematik',
            'Kurikulum',
            'aredzuan@smksacredheart.edu.my',
            '019-8234567',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'Guru'
          ],
          [
            'Cikgu Grace Lim',
            'Guru Penyelaras ICT & SPMS',
            'Pentadbiran',
            'gracelim@smksacredheart.edu.my',
            '013-8877123',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            'Guru'
          ]
        ];

        const stmt = db.prepare(`
          INSERT INTO staff 
          (name, position, department, email, phone, avatar_url, category)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        sampleStaff.forEach((st) => stmt.run(st));
        stmt.finalize();
        console.log('Seeded sample staff directory.');
      }
    });

    // Seed announcements
    db.get('SELECT COUNT(*) as count FROM announcements', (err, row) => {
      if (row && row.count === 0) {
        const sampleAnnouncements = [
          [
            'Pembaruan Sistem E-Filing SPMS 2026',
            'Semua Ketua Panitia dikehendaki mengemaskini fail panitia masing-masing ke dalam portal e-filing sebelum 15 Mac 2026.',
            '2026-03-01',
            'Pengurusan',
            1
          ],
          [
            'Mesyuarat Agung PIBG Kali Ke-32',
            'Jemputan kepada semua ibu bapa dan guru untuk menghadiri Mesyuarat Agung PIBG yang akan diadakan di Dewan Utama SMK Sacred Heart.',
            '2026-02-20',
            'PIBG',
            1
          ],
          [
            'Pelancaran Program "SMK Sacred Heart Fly High"',
            'Program pemantapan akademik dan sahsiah murid SPM 2026 rasmi dilancarkan oleh Pengetua Cemerlang.',
            '2026-01-15',
            'Kurikulum',
            0
          ]
        ];

        const stmt = db.prepare(`
          INSERT INTO announcements (title, content, date, category, is_important)
          VALUES (?, ?, ?, ?, ?)
        `);
        sampleAnnouncements.forEach((an) => stmt.run(an));
        stmt.finalize();
        console.log('Seeded announcements.');
      }
    });

    // Seed Organization Chart
    db.get('SELECT COUNT(*) as count FROM organization_chart', (err, row) => {
      if (row && row.count === 0) {
        const sampleOrg = [
          // Tier 1: Pengetua
          ['Encik David Teo Wu', 'Pengetua', 'Pengurusan Pentadbiran Sekolah', 'pengetua', '', 1],

          // Tier 2: Penolong Kanan
          ['Encik Ling Ngie Ming', 'Penolong Kanan Pentadbiran', 'Pentadbiran & Kurikulum', 'pk', '', 2],
          ['Encik Yee Hieng Ching', 'Penolong Kanan HEM', 'Hal Ehwal Murid', 'pk', '', 3],
          ['Encik Lau Tiew Kiong', 'Penolong Kanan Kokurikulum', 'Pengurusan Kokurikulum', 'pk', '', 4],
          ['Puan Lai May Ging', 'Penolong Kanan Tingkatan 6', 'Pengurusan Tingkatan 6', 'pk', '', 5],

          // Tier 3: Guru Kanan
          ['En. Winston Bin Thomas Nyadang', 'Guru Kanan Bahasa', 'Bidang Bahasa', 'gk', '', 6],
          ['En. Justin Ngo Jin Poh', 'Guru Kanan Sains & Matematik', 'Bidang Sains & Matematik', 'gk', '', 7],
          ['Pn. Ting Suk Leng', 'Guru Kanan Kemanusiaan', 'Bidang Kemanusiaan', 'gk', '', 8],
          ['En. Siew Haw Siong', 'Guru Kanan Vokasional & Teknik', 'Bidang Vokasional & Teknik', 'gk', '', 9],

          // Tier 4: Penyelaras Pengurusan dan Pentadbiran Sekolah (Baris 1)
          ['Pn. Falisia Binti Ali', 'KPT Pengurusan Kewangan & Perkhidmatan', 'Penyelaras Pentadbiran', 'penyelaras1', '', 10],
          ['Pn. Tiong Mee Ling', 'Data & Maklumat', 'Penyelaras Pentadbiran', 'penyelaras1', '', 11],
          ['Pn. Dia Teck Ing', 'Ketua Setiausaha Peperiksaan', 'Penyelaras Pentadbiran', 'penyelaras1', '', 12],
          ['En. Franky anak Dana', 'Perkembangan Profesional & Pementoran', 'Penyelaras Pentadbiran', 'penyelaras1', '', 13],
          ['En. Ngu Ming Ung', 'Pembestarian Sekolah & Ketua ICT', 'Penyelaras Pentadbiran', 'penyelaras1', '', 14],
          ['Pn. Ling Chai Kiong', 'Kajian Tindakan, Penyelidikan & Inovasi', 'Penyelaras Pentadbiran', 'penyelaras1', '', 15],
          ['Dr. Yek Siew King', 'E-Penilaian Kokurikulum', 'Penyelaras Pentadbiran', 'penyelaras1', '', 16],
          ['Cik Goh Leh Ling', 'Guru Media / Pusat Sumber Sekolah', 'Penyelaras Pentadbiran', 'penyelaras1', '', 17],

          // Tier 5: Penyelaras Pengurusan dan Pentadbiran Sekolah (Baris 2)
          ['Pn. Tiong Kung Jim', 'Ketua Penyelia Disiplin', 'Penyelaras Pentadbiran', 'penyelaras2', '', 18],
          ['Pn. Sandra Anak Senja', 'Setiausaha LDP', 'Penyelaras Pentadbiran', 'penyelaras2', '', 19],
          ['Pn. Kong Mee Ching', 'Setiausaha PBD', 'Penyelaras Pentadbiran', 'penyelaras2', '', 20],
          ['Pn. Lee Ek Ee', 'Pengerusi Kebajikan Staf', 'Penyelaras Pentadbiran', 'penyelaras2', '', 21],
          ['Pn. Ting Sing Kiu', 'Setiausaha PAJSK', 'Penyelaras Pentadbiran', 'penyelaras2', '', 22],
          ['En. Ting Kung Jin', 'SU Sukan Balapan & Padang', 'Penyelaras Pentadbiran', 'penyelaras2', '', 23],
          ['Pn. Low Kha Ing', 'Ketua Sidang Redaksi', 'Penyelaras Pentadbiran', 'penyelaras2', '', 24],
          ['Cik June Hii Ko-Ee', 'Ketua JK Kerohanian', 'Penyelaras Pentadbiran', 'penyelaras2', '', 25],
          ['Pn. Doris Tay Lik Cheng', 'Ketua Bantuan Murid Sekolah', 'Penyelaras Pentadbiran', 'penyelaras2', '', 26],
          ['Pn. Mok Siew Ying', 'Ketua Lembaga Kepimpinan Pelajar', 'Penyelaras Pentadbiran', 'penyelaras2', '', 27],
          ['Pn. Judy Chiong Kung Li', 'Penyelaras Lembaga Kepimpinan Pelajar', 'Penyelaras Pentadbiran', 'penyelaras2', '', 28],
          ['Pn. Wong Shin Ing', 'Penyelaras Lembaga Kepimpinan Pelajar', 'Penyelaras Pentadbiran', 'penyelaras2', '', 29],
          ['Cik Catherine Tiong Ping Ping', 'Ketua Unit B & K', 'Penyelaras Pentadbiran', 'penyelaras2', '', 30]
        ];
        const stmt = db.prepare(`
          INSERT INTO organization_chart (name, title, role, tier, avatar_url, order_index)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        sampleOrg.forEach(item => stmt.run(item));
        stmt.finalize();
        console.log('Seeded organization chart 2025.');
      }
    });

    // Seed Gallery
    db.get('SELECT COUNT(*) as count FROM gallery', (err, row) => {
      if (row && row.count === 0) {
        const sampleGallery = [
          ['Kejohanan Sukan Tahunan 2026', 'Aktiviti sukan padang dan balapan SMK Sacred Heart', 'Sukan', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80', '2026-02-15'],
          ['Majlis Anugerah Cemerlang', 'Penyampaian sijil penghargaan akademik murid SPM', 'Akademik', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80', '2026-01-20'],
          ['Gotong-Royong Perdana Sekolah', 'Pembersihan kawasan sekolah dan lanskap keceriaan', 'Komuniti', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80', '2026-02-28']
        ];
        const stmt = db.prepare(`
          INSERT INTO gallery (title, description, category, image_url, date_uploaded)
          VALUES (?, ?, ?, ?, ?)
        `);
        sampleGallery.forEach(g => stmt.run(g));
        stmt.finalize();
        console.log('Seeded gallery.');
      }
    });

    // Seed Principal Documents
    db.get('SELECT COUNT(*) as count FROM principal_documents', (err, row) => {
      if (row && row.count === 0) {
        const sampleDocs = [
          ['Teks Ucapan Perasmian Kejohanan Sukan Tahunan 2026', 'Ucapan Perasmian', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 'Pentadbiran', '2026-02-14', 'Ucapan perasmian kejohanan sukan sekolah.'],
          ['Amanat Pengetua Sempena Mesyuarat Agung PIBG', 'Amanat Pentadbiran', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 'Pentadbiran', '2026-01-10', 'Amanat hala tuju perkongsian pintar PIBG & Sekolah.']
        ];
        const stmt = db.prepare(`
          INSERT INTO principal_documents (title, category, file_url, file_type, uploaded_by, date_uploaded, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        sampleDocs.forEach(d => stmt.run(d));
        stmt.finalize();
        console.log('Seeded principal documents.');
      }
    });

    // Seed Principal Notices
    db.get('SELECT COUNT(*) as count FROM principal_notices', (err, row) => {
      if (row && row.count === 0) {
        const sampleNotices = [
          ['Amanat Pembukaan Semester 2 SPMS', 'Amanat Rasmi', 'Semua Ketua Panitia diminta mengemas kini fail e-Filing bagi persediaan pencerapan pdpc.', '2026-09-01'],
          ['Fokus Kecemerlangan SPM 2026', 'Akademik', 'Pelaksanaan Kelas Bimbingan Terancang dan Program Sentuhan Kasih bagi calon SPM.', '2026-08-25'],
          ['Penegasan Kehadiran & Disiplin Pelajar', 'HEM', 'Sasaran kehadiran bulanan sekolah ditetapkan melebihi 95% dengan kerjasama guru tingkatan.', '2026-08-15']
        ];
        const stmt = db.prepare(`
          INSERT INTO principal_notices (title, tag, content, date)
          VALUES (?, ?, ?, ?)
        `);
        sampleNotices.forEach(n => stmt.run(n));
        stmt.finalize();
        console.log('Seeded principal notices.');
      }
    });

    // Seed Unit Sections Items
    db.get('SELECT COUNT(*) as count FROM unit_sections', (err, row) => {
      if (row && row.count === 0) {
        const sampleUnitSections = [
          // Kurikulum
          ['kurikulum', 'Panitia Mata Pelajaran', 'Panitia Bahasa Melayu & Inggeris', 'Cikgu Dayang Roziah', 'BM / BI', 1],
          ['kurikulum', 'Panitia Mata Pelajaran', 'Panitia Sains & Matematik', 'Cikgu Ahmad Redzuan', 'SN / MT', 2],
          ['kurikulum', 'Panitia Mata Pelajaran', 'Panitia Sejarah & Geografi', 'Cikgu Patricia', 'SJ / GEO', 3],
          ['kurikulum', 'Jadual Peperiksaan & Ujian 2026', 'Pentaksiran Pertengahan Tahun (PPT)', '15 - 26 Jun 2026', 'Akan Datang', 4],
          ['kurikulum', 'Jadual Peperiksaan & Ujian 2026', 'Peperiksaan Percubaan SPM (Trial)', '10 - 24 Ogos 2026', 'Dijadualkan', 5],

          // Kokurikulum
          ['kokurikulum', 'Unit Beruniform & Kelab Persatuan', 'Kadet Remaja Sekolah (KRS)', 'Cikgu Patricia', 'KRS', 1],
          ['kokurikulum', 'Unit Beruniform & Kelab Persatuan', 'Pengakap Muda & Remaja', 'Cikgu Ahmad Redzuan', 'PENGAKAP', 2],
          ['kokurikulum', 'Pasukan Sukan & Permainan Utama', 'Pasukan Bola Sepak & Futsal SHS', 'Latihan: Selasa & Khamis', 'MSSD Sarawak', 3],

          // HEM
          ['hem', 'Unit Pengurusan HEM & Kebajikan', 'Unit Disiplin & Pengawas Sekolah', 'Cikgu Mohamad Faizal', 'DISIPLIN', 1],
          ['hem', 'Unit Pengurusan HEM & Kebajikan', 'Unit Bimbingan & Kaunseling (UBK)', 'Kaunselor Sekolah', 'UBK', 2],
          ['hem', 'Program Utama Sahsiah & Kebajikan 2026', 'Program Minda Sihat & Anti-Buli', 'Setiap Bulan', 'Pencegahan', 3],

          // Pentadbiran
          ['pentadbiran', 'Jawatankuasa Pengurusan Pentadbiran', 'Jawatankuasa Pengurusan & Pentadbiran Am', 'Pengetua Cemerlang', 'PENTADBIRAN', 1],
          ['pentadbiran', 'Pekeliling & Manual Pengurusan', 'Manual Pengurusan Sekolah (MPS 2026)', 'Kemaskini Januari 2026', 'Rasmi', 2]
        ];
        const stmt = db.prepare(`
          INSERT INTO unit_sections (unit_key, section_title, item_name, item_lead, item_code, order_index)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        sampleUnitSections.forEach(item => stmt.run(item));
        stmt.finalize();
        console.log('Seeded unit sections.');
      }
    });
  });
}

initDb();

module.exports = db;
