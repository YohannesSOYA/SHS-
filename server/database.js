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
            'Cikgu Encik Awangku (Pengetua)',
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
          ['Pengetua', 'Pengetua Cemerlang', 'Pengurusan Tertinggi', 'pengetua', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', 1],
          ['Cikgu Dayang Roziah', 'PK Pentadbiran', 'Akademik & Pentadbiran', 'pk', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 2],
          ['Cikgu Mohamad Faizal', 'PK Hal Ehwal Murid', 'HEM & Disiplin', 'pk', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 3],
          ['Cikgu Patricia Anak Joseph', 'PK Kokurikulum', 'Sukan & Kelab', 'pk', 'https://images.unsplash.com/photo-1580894732413-87bb49276e46?w=150&auto=format&fit=crop&q=80', 4],
          ['Cikgu Robert Tan', 'PK Petang', 'Sesi Petang', 'pk', '', 5],
          ['KB Bahasa', 'Ketua Bidang Bahasa', 'Panitia Bahasa', 'kb', '', 6],
          ['KB Sains & Math', 'Ketua Bidang Sains & Matematik', 'Panitia Sains & Math', 'kb', '', 7],
          ['KB Kemanusiaan', 'Ketua Bidang Kemanusiaan', 'Panitia Kemanusiaan', 'kb', '', 8],
          ['KB Teknik & Vokasional', 'Ketua Bidang Votek', 'Panitia Votek', 'kb', '', 9]
        ];
        const stmt = db.prepare(`
          INSERT INTO organization_chart (name, title, role, tier, avatar_url, order_index)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        sampleOrg.forEach(item => stmt.run(item));
        stmt.finalize();
        console.log('Seeded organization chart.');
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
