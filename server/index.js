const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'smk-lundu-secret-key-2026';

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, 'upload-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// File Upload Endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tiada fail dimuat naik.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ message: 'Fail berjaya dimuat naik!', url: fileUrl });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Sesi log masuk diperlukan' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token tidak sah atau telah tamat tempoh' });
  }
}

// Helper token creator using jsonwebtoken
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

// Admin Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Sila masukkan nama pengguna dan kata laluan.' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Ralat pangkalan data' });
    if (!user) {
      return res.status(401).json({ error: 'Nama pengguna atau kata laluan salah.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Nama pengguna atau kata laluan salah.' });
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role, name: user.name });
    res.json({
      message: 'Log masuk berjaya!',
      token,
      user: { id: user.id, username: user.username, role: user.role, name: user.name }
    });
  });
});

// Admin Register
app.post('/api/auth/register', (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Sila lengkapkan semua maklumat.' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Ralat pangkalan data' });
    if (user) {
      return res.status(400).json({ error: 'Nama pengguna sudah wujud.' });
    }

    const hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)', [
      username,
      hash,
      'admin',
      name
    ], function(insertErr) {
      if (insertErr) return res.status(500).json({ error: 'Gagal mendaftar pengguna baharu.' });
      res.json({ message: 'Pendaftaran berjaya! Sila log masuk.' });
    });
  });
});

// Change Password
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const username = req.user.username;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Pengguna tidak ditemui' });

    const isValid = bcrypt.compareSync(oldPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Kata laluan asal tidak tepat' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET password_hash = ? WHERE username = ?', [newHash, username], (err2) => {
      if (err2) return res.status(500).json({ error: 'Gagal mengemaskini kata laluan' });
      res.json({ message: 'Kata laluan berjaya dikemaskini!' });
    });
  });
});

// ----------------------------------------------------
// e-FILING DOCUMENTS ENDPOINTS
// ----------------------------------------------------

// Public Get All Documents
app.get('/api/documents', (req, res) => {
  const { search, category, department } = req.query;
  let query = 'SELECT * FROM efiling_documents WHERE 1=1';
  let params = [];

  if (category && category !== 'Semua') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (department && department !== 'Semua') {
    query += ' AND department = ?';
    params.push(department);
  }
  if (search) {
    query += ' AND (title LIKE ? OR code LIKE ? OR description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY id DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Admin Add Document
app.post('/api/documents', authenticateToken, (req, res) => {
  const { code, title, category, department, file_url, file_type, description } = req.body;
  if (!title || !category || !department) {
    return res.status(400).json({ error: 'Sila lengkapkan tajuk, kategori dan unit.' });
  }

  const docCode = code || `DOC-${Date.now().toString().slice(-5)}`;
  const dateUploaded = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    INSERT INTO efiling_documents 
    (code, title, category, department, file_url, file_type, description, date_uploaded, downloads)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  stmt.run([docCode, title, category, department, file_url || '#', file_type || 'pdf', description || '', dateUploaded], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dokumen e-filing berjaya ditambah!', id: this.lastID });
  });
});

// Admin Update Document
app.put('/api/documents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { code, title, category, department, file_url, file_type, description } = req.body;

  db.run(
    `UPDATE efiling_documents 
     SET code = ?, title = ?, category = ?, department = ?, file_url = ?, file_type = ?, description = ?
     WHERE id = ?`,
    [code, title, category, department, file_url, file_type, description, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Dokumen berjaya dikemaskini!' });
    }
  );
});

// Admin Delete Document
app.delete('/api/documents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM efiling_documents WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dokumen berjaya dipadam!' });
  });
});

// Increment Download
app.post('/api/documents/:id/download', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE efiling_documents SET downloads = downloads + 1 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Muat turun direkodkan.' });
  });
});

// ----------------------------------------------------
// STAFF DIRECTORY ENDPOINTS
// ----------------------------------------------------

// Public Get Staff
app.get('/api/staff', (req, res) => {
  const { department, search } = req.query;
  let query = 'SELECT * FROM staff WHERE 1=1';
  let params = [];

  if (department && department !== 'Semua') {
    query += ' AND department = ?';
    params.push(department);
  }
  if (search) {
    query += ' AND (name LIKE ? OR position LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  query += ' ORDER BY id ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Admin Add Staff
app.post('/api/staff', authenticateToken, (req, res) => {
  const { name, position, department, email, phone, avatar_url, category } = req.body;
  if (!name || !position || !department) {
    return res.status(400).json({ error: 'Sila isi nama, jawatan dan unit.' });
  }

  const stmt = db.prepare(`
    INSERT INTO staff (name, position, department, email, phone, avatar_url, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([name, position, department, email || '', phone || '', avatar_url || '', category || 'Guru'], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Maklumat staf berjaya ditambah!', id: this.lastID });
  });
});

// Admin Update Staff
app.put('/api/staff/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, position, department, email, phone, avatar_url, category } = req.body;

  db.run(
    `UPDATE staff SET name = ?, position = ?, department = ?, email = ?, phone = ?, avatar_url = ?, category = ? WHERE id = ?`,
    [name, position, department, email, phone, avatar_url, category, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Maklumat staf berjaya dikemaskini!' });
    }
  );
});

// Admin Delete Staff
app.delete('/api/staff/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM staff WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Rekod staf dipadam!' });
  });
});

// Admin Reset Staff to 2025 Organization Chart (no dummy Guru Biasa)
app.post('/api/staff/reset', authenticateToken, (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM staff');
    const sampleStaff = [
      ['Encik David Teo Wu', 'Pengetua', 'Pentadbiran', 'pengetua@smksacredheart.edu.my', '084-330454', '', 'Pentadbir'],
      ['Encik Ling Ngie Ming', 'Penolong Kanan Pentadbiran', 'Pentadbiran', 'lingngieming@moe-dl.edu.my', '084-330454', '', 'Pentadbir'],
      ['Encik Yee Hieng Ching', 'Penolong Kanan HEM', 'HEM', 'yeehiengching@moe-dl.edu.my', '084-330454', '', 'Pentadbir'],
      ['Encik Lau Tiew Kiong', 'Penolong Kanan Kokurikulum', 'Kokurikulum', 'lautiewkiong@moe-dl.edu.my', '084-330454', '', 'Pentadbir'],
      ['Puan Lai May Ging', 'Penolong Kanan Tingkatan 6', 'Pentadbiran', 'laimayging@moe-dl.edu.my', '084-330454', '', 'Pentadbir'],

      ['En. Winston Bin Thomas Nyadang', 'Guru Kanan Bahasa', 'Kurikulum', 'winston@moe-dl.edu.my', '084-330454', '', 'Guru Kanan'],
      ['En. Justin Ngo Jin Poh', 'Guru Kanan Sains & Matematik', 'Kurikulum', 'justinngo@moe-dl.edu.my', '084-330454', '', 'Guru Kanan'],
      ['Pn. Ting Suk Leng', 'Guru Kanan Kemanusiaan', 'Kurikulum', 'tingsukleng@moe-dl.edu.my', '084-330454', '', 'Guru Kanan'],
      ['En. Siew Haw Siong', 'Guru Kanan Vokasional & Teknik', 'Kurikulum', 'siewhawsiong@moe-dl.edu.my', '084-330454', '', 'Guru Kanan'],

      ['Pn. Falisia Binti Ali', 'KPT Pengurusan Kewangan & Perkhidmatan', 'Pentadbiran', 'falisia@moe-dl.edu.my', '084-330454', '', 'AKP'],
      ['Pn. Tiong Mee Ling', 'Data & Maklumat', 'Pentadbiran', 'tiongmeeling@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Dia Teck Ing', 'Ketua Setiausaha Peperiksaan', 'Kurikulum', 'diatecking@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['En. Franky anak Dana', 'Perkembangan Profesional & Pementoran', 'Pentadbiran', 'franky@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['En. Ngu Ming Ung', 'Pembestarian Sekolah & Ketua ICT', 'Pentadbiran', 'ngumingung@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Ling Chai Kiong', 'Kajian Tindakan, Penyelidikan & Inovasi', 'Kurikulum', 'lingchaikiong@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Dr. Yek Siew King', 'E-Penilaian Kokurikulum', 'Kokurikulum', 'yeksiewking@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Cik Goh Leh Ling', 'Guru Media / Pusat Sumber Sekolah', 'Kurikulum', 'gohlehling@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],

      ['Pn. Tiong Kung Jim', 'Ketua Penyelia Disiplin', 'HEM', 'tiongkungjim@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Sandra Anak Senja', 'Setiausaha LDP', 'Pentadbiran', 'sandra@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Kong Mee Ching', 'Setiausaha PBD', 'Kurikulum', 'kongmeeching@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Lee Ek Ee', 'Pengerusi Kebajikan Staf', 'Pentadbiran', 'leekeek@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Ting Sing Kiu', 'Setiausaha PAJSK', 'Kokurikulum', 'tingsingkiu@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['En. Ting Kung Jin', 'SU Sukan Balapan & Padang', 'Kokurikulum', 'tingkungjin@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Low Kha Ing', 'Ketua Sidang Redaksi', 'Pentadbiran', 'lowkhaing@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Cik June Hii Ko-Ee', 'Ketua JK Kerohanian', 'HEM', 'junehii@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Doris Tay Lik Cheng', 'Ketua Bantuan Murid Sekolah', 'HEM', 'doristay@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Mok Siew Ying', 'Ketua Lembaga Kepimpinan Pelajar', 'HEM', 'moksiewying@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Judy Chiong Kung Li', 'Penyelaras Lembaga Kepimpinan Pelajar', 'HEM', 'judychiong@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Pn. Wong Shin Ing', 'Penyelaras Lembaga Kepimpinan Pelajar', 'HEM', 'wongshining@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      ['Cik Catherine Tiong Ping Ping', 'Ketua Unit B & K', 'HEM', 'catherinetiong@moe-dl.edu.my', '084-330454', '', 'Penyelaras'],
      // Guru Biasa — kosong, admin boleh tambah sendiri
    ];

    const stmt = db.prepare('INSERT INTO staff (name, position, department, email, phone, avatar_url, category) VALUES (?, ?, ?, ?, ?, ?, ?)');
    sampleStaff.forEach(item => stmt.run(item));
    stmt.finalize(err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Direktori Staf 2025 berjaya diset semula!' });
    });
  });
});

// ----------------------------------------------------
// ORGANIZATION CHART ENDPOINTS
// ----------------------------------------------------

app.get('/api/org-chart', (req, res) => {
  db.all('SELECT * FROM organization_chart ORDER BY order_index ASC, id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/org-chart', authenticateToken, (req, res) => {
  const { name, title, role, tier, avatar_url, order_index } = req.body;
  if (!name || !title) {
    return res.status(400).json({ error: 'Sila lengkapkan nama dan jawatan.' });
  }

  const stmt = db.prepare(`
    INSERT INTO organization_chart (name, title, role, tier, avatar_url, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run([name, title, role || '', tier || 'pk', avatar_url || '', order_index || 0], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Carta organisasi berjaya ditambah!', id: this.lastID });
  });
});

app.put('/api/org-chart/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, title, role, tier, avatar_url, order_index } = req.body;

  db.run(
    `UPDATE organization_chart SET name = ?, title = ?, role = ?, tier = ?, avatar_url = ?, order_index = ? WHERE id = ?`,
    [name, title, role, tier, avatar_url, order_index || 0, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Maklumat carta dikemaskini!' });
    }
  );
});

app.delete('/api/org-chart/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM organization_chart WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Ahli carta organisasi dipadam!' });
  });
});

app.post('/api/org-chart/reset', authenticateToken, (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM organization_chart');
    const sampleOrg = [
      ['Encik David Teo Wu', 'Pengetua', 'Pengurusan Pentadbiran Sekolah', 'pengetua', '', 1],

      ['Encik Ling Ngie Ming', 'Penolong Kanan Pentadbiran', 'Pentadbiran & Kurikulum', 'pk', '', 2],
      ['Encik Yee Hieng Ching', 'Penolong Kanan HEM', 'Hal Ehwal Murid', 'pk', '', 3],
      ['Encik Lau Tiew Kiong', 'Penolong Kanan Kokurikulum', 'Pengurusan Kokurikulum', 'pk', '', 4],
      ['Puan Lai May Ging', 'Penolong Kanan Tingkatan 6', 'Pengurusan Tingkatan 6', 'pk', '', 5],

      ['En. Winston Bin Thomas Nyadang', 'Guru Kanan Bahasa', 'Bidang Bahasa', 'gk', '', 6],
      ['En. Justin Ngo Jin Poh', 'Guru Kanan Sains & Matematik', 'Bidang Sains & Matematik', 'gk', '', 7],
      ['Pn. Ting Suk Leng', 'Guru Kanan Kemanusiaan', 'Bidang Kemanusiaan', 'gk', '', 8],
      ['En. Siew Haw Siong', 'Guru Kanan Vokasional & Teknik', 'Bidang Vokasional & Teknik', 'gk', '', 9],

      ['Pn. Falisia Binti Ali', 'KPT Pengurusan Kewangan & Perkhidmatan', 'Penyelaras Pentadbiran', 'penyelaras1', '', 10],
      ['Pn. Tiong Mee Ling', 'Data & Maklumat', 'Penyelaras Pentadbiran', 'penyelaras1', '', 11],
      ['Pn. Dia Teck Ing', 'Ketua Setiausaha Peperiksaan', 'Penyelaras Pentadbiran', 'penyelaras1', '', 12],
      ['En. Franky anak Dana', 'Perkembangan Profesional & Pementoran', 'Penyelaras Pentadbiran', 'penyelaras1', '', 13],
      ['En. Ngu Ming Ung', 'Pembestarian Sekolah & Ketua ICT', 'Penyelaras Pentadbiran', 'penyelaras1', '', 14],
      ['Pn. Ling Chai Kiong', 'Kajian Tindakan, Penyelidikan & Inovasi', 'Penyelaras Pentadbiran', 'penyelaras1', '', 15],
      ['Dr. Yek Siew King', 'E-Penilaian Kokurikulum', 'Penyelaras Pentadbiran', 'penyelaras1', '', 16],
      ['Cik Goh Leh Ling', 'Guru Media / Pusat Sumber Sekolah', 'Penyelaras Pentadbiran', 'penyelaras1', '', 17],

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
    stmt.finalize(err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Carta Organisasi 2025 berjaya diset semula!' });
    });
  });
});

// ----------------------------------------------------
// GALLERY ENDPOINTS
// ----------------------------------------------------

app.get('/api/gallery', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM gallery WHERE 1=1';
  let params = [];

  if (category && category !== 'Semua') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  query += ' ORDER BY id DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/gallery', authenticateToken, (req, res) => {
  const { title, description, category, image_url } = req.body;
  if (!title || !image_url) {
    return res.status(400).json({ error: 'Sila sertakan tajuk dan gambar aktiviti.' });
  }

  const dateUploaded = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    INSERT INTO gallery (title, description, category, image_url, date_uploaded)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run([title, description || '', category || 'Aktiviti', image_url, dateUploaded], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const galleryId = this.lastID;

    // Automatik cipta pengumuman apabila galeri dikemas kini
    const announceTitle = `🖼️ Galeri Baru: ${title}`;
    const announceContent = `${description ? description + '\n\n' : ''}Gambar baharu bagi aktiviti "${title}" telah dimuat naik ke Galeri Aktiviti sekolah.`;
    
    db.run(
      `INSERT INTO announcements (title, content, date, category, is_important) VALUES (?, ?, ?, ?, 0)`,
      [announceTitle, announceContent, dateUploaded, 'Galeri'],
      (annErr) => {
        if (annErr) {
          console.error('Ralat menambah pengumuman galeri secara automatik:', annErr.message);
        }
      }
    );

    res.json({ message: 'Gambar aktiviti berjaya dimuat naik ke galeri dan pengumuman diterbitkan!', id: galleryId });
  });
});

app.delete('/api/gallery/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM gallery WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Gambar galeri berjaya dipadam!' });
  });
});

// ----------------------------------------------------
// ANNOUNCEMENTS ENDPOINTS
// ----------------------------------------------------

app.get('/api/announcements', (req, res) => {
  db.all('SELECT * FROM announcements ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/announcements', authenticateToken, (req, res) => {
  const { title, content, category, is_important } = req.body;
  const date = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    INSERT INTO announcements (title, content, date, category, is_important)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run([title, content, date, category || 'Umum', is_important ? 1 : 0], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pengumuman berjaya diterbitkan!', id: this.lastID });
  });
});

app.delete('/api/announcements/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM announcements WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pengumuman dipadam!' });
  });
});

// ----------------------------------------------------
// SCHOOL INFO ENDPOINTS
// ----------------------------------------------------

app.get('/api/school-info', (req, res) => {
  db.all('SELECT * FROM school_info', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const infoMap = {};
    rows.forEach(r => infoMap[r.key] = r.value);
    res.json(infoMap);
  });
});

app.put('/api/school-info', authenticateToken, (req, res) => {
  const infoData = req.body;
  const keys = Object.keys(infoData);
  if (keys.length === 0) return res.status(400).json({ error: 'Tiada data untuk dikemaskini.' });

  let completed = 0;
  let hasError = false;

  keys.forEach((key) => {
    db.run(
      'INSERT OR REPLACE INTO school_info (key, value) VALUES (?, ?)',
      [key, String(infoData[key])],
      (err) => {
        if (err && !hasError) {
          hasError = true;
          return res.status(500).json({ error: err.message });
        }
        completed++;
        if (completed === keys.length && !hasError) {
          res.json({ message: 'Maklumat portal sekolah berjaya dikemaskini!' });
        }
      }
    );
  });
});

app.post('/api/school-info', authenticateToken, (req, res) => {
  const infoData = req.body;
  const keys = Object.keys(infoData);
  if (keys.length === 0) return res.status(400).json({ error: 'Tiada data untuk dikemaskini.' });

  let completed = 0;
  let hasError = false;

  keys.forEach((key) => {
    db.run(
      'INSERT OR REPLACE INTO school_info (key, value) VALUES (?, ?)',
      [key, String(infoData[key])],
      (err) => {
        if (err && !hasError) {
          hasError = true;
          return res.status(500).json({ error: err.message });
        }
        completed++;
        if (completed === keys.length && !hasError) {
          res.json({ message: 'Maklumat portal sekolah berjaya dikemaskini!' });
        }
      }
    );
  });
});

// ----------------------------------------------------
// TIMETABLES ENDPOINTS (Jadual Waktu Kelas & Guru)
// ----------------------------------------------------

app.get('/api/timetables', (req, res) => {
  const { type, form_level, search } = req.query;
  let query = 'SELECT * FROM timetables WHERE 1=1';
  let params = [];

  if (type && type !== 'Semua') {
    query += ' AND type = ?';
    params.push(type);
  }

  if (form_level && form_level !== 'Semua') {
    query += ' AND form_level = ?';
    params.push(form_level);
  }

  if (search) {
    query += ' AND (title LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY id DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/timetables', authenticateToken, (req, res) => {
  const { type, title, form_level, file_url, notes } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Sila lengkapkan tajuk jadual.' });
  }

  const date_updated = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    INSERT INTO timetables (type, title, form_level, file_url, notes, date_updated)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run([type || 'kelas', title, form_level || 'Tingkatan 5', file_url || '#', notes || '', date_updated], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Jadual waktu berjaya ditambah!', id: this.lastID });
  });
});

app.put('/api/timetables/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { type, title, form_level, file_url, notes } = req.body;
  const date_updated = new Date().toISOString().split('T')[0];

  db.run(
    `UPDATE timetables 
     SET type = ?, title = ?, form_level = ?, file_url = ?, notes = ?, date_updated = ?
     WHERE id = ?`,
    [type, title, form_level, file_url, notes, date_updated, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Jadual waktu berjaya dikemaskini!' });
    }
  );
});

app.delete('/api/timetables/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM timetables WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Jadual waktu dipadam!' });
  });
});

// ----------------------------------------------------
// FORM 6 (TINGKATAN 6 / STPM) ENDPOINTS
// ----------------------------------------------------

app.get('/api/form6-documents', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM form6_documents WHERE 1=1';
  let params = [];

  if (category && category !== 'Semua') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY id DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/form6-documents', authenticateToken, (req, res) => {
  const { title, category, file_url, file_type, description } = req.body;
  if (!title || !file_url) {
    return res.status(400).json({ error: 'Sila lengkapkan tajuk dan fail dokumen.' });
  }

  const date_uploaded = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    INSERT INTO form6_documents (title, category, file_url, file_type, description, date_uploaded)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run([title, category || 'STPM', file_url, file_type || 'pdf', description || '', date_uploaded], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dokumen Form 6 berjaya ditambah!', id: this.lastID });
  });
});

app.delete('/api/form6-documents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM form6_documents WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dokumen dipadam!' });
  });
});

// ----------------------------------------------------
// ----------------------------------------------------
// PRINCIPAL DOCUMENTS & NOTICES ENDPOINTS
// ----------------------------------------------------

app.get('/api/principal-documents', (req, res) => {
  db.all('SELECT * FROM principal_documents ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/principal-documents', authenticateToken, (req, res) => {
  const { title, category, file_url, file_type, notes } = req.body;
  if (!title || !file_url) {
    return res.status(400).json({ error: 'Sila sertakan tajuk dan fail dokumen.' });
  }

  const dateUploaded = new Date().toISOString().split('T')[0];
  const uploadedBy = req.user?.name || 'Admin';

  const stmt = db.prepare(`
    INSERT INTO principal_documents (title, category, file_url, file_type, uploaded_by, date_uploaded, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([title, category || 'Ucapan Perasmian', file_url, file_type || 'pdf', uploadedBy, dateUploaded, notes || ''], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dokumen pengetua berjaya dimuat naik!', id: this.lastID });
  });
});

app.delete('/api/principal-documents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM principal_documents WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dokumen pengetua dipadam!' });
  });
});

// GET all principal notices
app.get('/api/principal-notices', (req, res) => {
  db.all('SELECT * FROM principal_notices ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST add principal notice (admin) - syncs to announcements too
app.post('/api/principal-notices', authenticateToken, (req, res) => {
  const { title, tag, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Sila lengkapkan tajuk dan kandungan amanat.' });
  }
  const date = new Date().toISOString().split('T')[0];
  db.run(
    'INSERT INTO principal_notices (title, tag, content, date) VALUES (?, ?, ?, ?)',
    [title, tag || 'Amanat Rasmi', content, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const noticeId = this.lastID;

      const announceTitle = `[AMANAT PENGETUA] ${title}`;
      const announceCategory = `Amanat (${tag || 'Pentadbiran'})`;
      db.run(
        'INSERT INTO announcements (title, content, date, category, is_important) VALUES (?, ?, ?, ?, 1)',
        [announceTitle, content, date, announceCategory],
        function (annErr) {
          if (annErr) console.error('Error syncing to announcements:', annErr);
          res.json({ message: 'Amanat berjaya diterbitkan dan dimasukkan ke Pengumuman!', id: noticeId });
        }
      );
    }
  );
});

// DELETE principal notice (admin)
app.delete('/api/principal-notices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM principal_notices WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Amanat berjaya dipadam!' });
  });
});

// ----------------------------------------------------
// UNIT SECTIONS & ITEMS ENDPOINTS
// ----------------------------------------------------

app.get('/api/unit-sections', (req, res) => {
  const { unit_key } = req.query;
  let query = 'SELECT * FROM unit_sections';
  let params = [];
  if (unit_key) {
    query += ' WHERE unit_key = ?';
    params.push(unit_key);
  }
  query += ' ORDER BY id ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/unit-sections', authenticateToken, (req, res) => {
  const { unit_key, section_title, item_name, item_lead, item_code, image_url } = req.body;
  if (!unit_key || !section_title || !item_name) {
    return res.status(400).json({ error: 'Sila lengkapkan tajuk seksyen dan nama item.' });
  }

  const stmt = db.prepare(`
    INSERT INTO unit_sections (unit_key, section_title, item_name, item_lead, item_code, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run([unit_key, section_title, item_name, item_lead || '', item_code || '', image_url || ''], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item seksyen unit berjaya ditambah!', id: this.lastID });
  });
});

app.put('/api/unit-sections/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { section_title, item_name, item_lead, item_code, image_url } = req.body;

  const stmt = db.prepare(`
    UPDATE unit_sections
    SET section_title = ?, item_name = ?, item_lead = ?, item_code = ?, image_url = ?
    WHERE id = ?
  `);

  stmt.run([section_title, item_name, item_lead || '', item_code || '', image_url || '', id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item seksyen unit dikemaskini!' });
  });
});

app.delete('/api/unit-sections/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM unit_sections WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item seksyen dipadam!' });
  });
});

app.put('/api/school-info', authenticateToken, (req, res) => {
  const infoMap = req.body;
  const stmt = db.prepare('INSERT OR REPLACE INTO school_info (key, value) VALUES (?, ?)');
  Object.entries(infoMap).forEach(([k, v]) => {
    stmt.run([k, String(v)]);
  });
  stmt.finalize();
  res.json({ message: 'Maklumat sekolah dikemaskini!' });
});

// ========================
// SONGS API
// ========================

// GET all songs (public)
app.get('/api/songs', (req, res) => {
  db.all('SELECT * FROM songs ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST add a new song (admin) - supports file upload or Google Drive/YouTube link
app.post('/api/songs', authenticateToken, upload.single('file'), (req, res) => {
  const { title, description, type, drive_id, youtube_url } = req.body;
  const dateUploaded = new Date().toISOString().split('T')[0];
  const uploadedBy = req.user?.name || 'Admin';

  if (!title) return res.status(400).json({ error: 'Tajuk lagu diperlukan.' });

  let fileUrl = '';
  let songType = type || 'upload';

  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
    songType = 'upload';
  } else if (drive_id) {
    fileUrl = drive_id;
    songType = 'gdrive';
  } else if (youtube_url) {
    fileUrl = youtube_url;
    songType = 'youtube';
  } else {
    return res.status(400).json({ error: 'Sila muat naik fail atau masukkan ID Google Drive / URL YouTube.' });
  }

  db.run(
    `INSERT INTO songs (title, description, type, file_url, date_uploaded, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description || '', songType, fileUrl, dateUploaded, uploadedBy],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Lagu berjaya ditambah!' });
    }
  );
});

// DELETE a song (admin)
app.delete('/api/songs/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM songs WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Lagu tidak dijumpai.' });

    // If uploaded file, delete from disk
    if (row.type === 'upload' && row.file_url) {
      const filePath = require('path').join(__dirname, '../public', row.file_url);
      if (require('fs').existsSync(filePath)) {
        require('fs').unlinkSync(filePath);
      }
    }

    db.run('DELETE FROM songs WHERE id = ?', [id], (delErr) => {
      if (delErr) return res.status(500).json({ error: delErr.message });
      res.json({ message: 'Lagu berjaya dipadam.' });
    });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server SMK Sacred Heart Portal berjalan di port http://localhost:${PORT}`);
});

