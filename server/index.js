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

// ----------------------------------------------------
// PRINCIPAL DOCUMENTS ENDPOINTS
// ----------------------------------------------------

app.get('/api/principal-documents', authenticateToken, (req, res) => {
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server SMK Sacred Heart Portal berjalan di port http://localhost:${PORT}`);
});

