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

    // School Settings Info
    db.run(`
      CREATE TABLE IF NOT EXISTS school_info (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Seed default admin user
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (!row) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.run('INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)', [
          'admin',
          hash,
          'admin',
          'Pentadbiran SMK Lundu'
        ]);
        console.log('Seeded default admin user (admin / admin123)');
      }
    });

    // Seed school info
    const infoData = [
      ['school_name', 'SMK Lundu'],
      ['motto', 'Menggilap Bintang - SMK Lundu Fly High'],
      ['code', 'YEB1301'],
      ['address', 'Jalan Bau-Lundu, 94500 Lundu, Sarawak'],
      ['phone', '082-735234'],
      ['email', 'smklundu.yeb1301@moe-dl.edu.my'],
      ['principal', 'Pengetua SMK Lundu']
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
            'Ringkasan aktiviti kelab, persatuan, dan kejohanan MSSD Lundu.',
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
            'pengetua@smklundu.edu.my',
            '082-735234',
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
            'Pentadbir'
          ],
          [
            'Cikgu Dayang Roziah',
            'Penolong Kanan Pentadbiran',
            'Kurikulum',
            'pk.pentadbiran@smklundu.edu.my',
            '082-735235',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            'Pentadbir'
          ],
          [
            'Cikgu Mohamad Faizal',
            'Penolong Kanan Hal Ehwal Murid',
            'HEM',
            'pk.hem@smklundu.edu.my',
            '082-735236',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
            'Pentadbir'
          ],
          [
            'Cikgu Patricia Anak Joseph',
            'Penolong Kanan Kokurikulum',
            'Kokurikulum',
            'pk.koko@smklundu.edu.my',
            '082-735237',
            'https://images.unsplash.com/photo-1580894732413-87bb49276e46?w=150&auto=format&fit=crop&q=80',
            'Pentadbir'
          ],
          [
            'Cikgu Ahmad Redzuan',
            'Ketua Panitia Sains & Matematik',
            'Kurikulum',
            'aredzuan@smklundu.edu.my',
            '019-8234567',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'Guru'
          ],
          [
            'Cikgu Grace Lim',
            'Guru Penyelaras ICT & SPMS',
            'Pentadbiran',
            'gracelim@smklundu.edu.my',
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
            'Jemputan kepada semua ibu bapa dan guru untuk menghadiri Mesyuarat Agung PIBG yang akan diadakan di Dewan Utama SMK Lundu.',
            '2026-02-20',
            'PIBG',
            1
          ],
          [
            'Pelancaran Program "SMK Lundu Fly High"',
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
  });
}

initDb();

module.exports = db;
