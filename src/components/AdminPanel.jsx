import React, { useState, useEffect } from 'react';
import { Settings, Key, FileText, Users, Bell, Image as ImageIcon, Plus, Trash2, Edit, Upload, Award, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminPanel({ token, user }) {
  const [activeTab, setActiveTab] = useState('settings');

  const [stats, setStats] = useState({ docs: 0, staff: 0, announcements: 0, org: 0, gallery: 0 });
  const [schoolInfo, setSchoolInfo] = useState({
    motto: 'Directa Labore - Dipandu Oleh Usaha Murni',
    phone: '084-330454',
    email: 'smksacredheart.yeb3101@moe-dl.edu.my',
    address: 'Jalan Oya, 96000 Sibu, Sarawak'
  });
  const [infoSuccess, setInfoSuccess] = useState('');

  // Password change state
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Org Chart state
  const [orgList, setOrgList] = useState([]);
  const [orgForm, setOrgForm] = useState({ id: null, name: '', title: '', role: '', tier: 'pk', avatar_url: '', order_index: 0 });
  const [orgUploading, setOrgUploading] = useState(false);
  const [orgMsg, setOrgMsg] = useState(null);

  // Gallery state
  const [galleryList, setGalleryList] = useState([]);
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category: 'Aktiviti', image_url: '' });
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryMsg, setGalleryMsg] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchSchoolInfo();
    fetchOrgChart();
    fetchGallery();
  }, []);

  const fetchStats = async () => {
    try {
      const [docsRes, staffRes, annRes, orgRes, galRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/staff'),
        fetch('/api/announcements'),
        fetch('/api/org-chart'),
        fetch('/api/gallery')
      ]);
      const docs = await docsRes.json();
      const staff = await staffRes.json();
      const ann = await annRes.json();
      const org = await orgRes.json();
      const gal = await galRes.json();

      setStats({
        docs: docs.length || 0,
        staff: staff.length || 0,
        announcements: ann.length || 0,
        org: org.length || 0,
        gallery: gal.length || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchoolInfo = async () => {
    try {
      const res = await fetch('/api/school-info');
      const data = await res.json();
      if (data && Object.keys(data).length > 0) {
        setSchoolInfo(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrgChart = async () => {
    try {
      const res = await fetch('/api/org-chart');
      if (res.ok) setOrgList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) setGalleryList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Device Upload Helper
  const uploadDeviceFile = async (file) => {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Muat naik gambar gagal');
    return data.url;
  };

  const handleOrgFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOrgUploading(true);
    try {
      const url = await uploadDeviceFile(file);
      setOrgForm(prev => ({ ...prev, avatar_url: url }));
    } catch (err) {
      alert(err.message);
    } finally {
      setOrgUploading(false);
    }
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setOrgMsg(null);
    try {
      const isEdit = Boolean(orgForm.id);
      const url = isEdit ? `/api/org-chart/${orgForm.id}` : '/api/org-chart';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orgForm)
      });
      const data = await res.json();
      if (res.ok) {
        setOrgMsg({ type: 'success', text: data.message });
        setOrgForm({ id: null, name: '', title: '', role: '', tier: 'pk', avatar_url: '', order_index: 0 });
        fetchOrgChart();
        fetchStats();
      } else {
        setOrgMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setOrgMsg({ type: 'error', text: 'Ralat sambungan pelayan.' });
    }
  };

  const handleOrgDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam ahli ini dari Carta Organisasi?')) return;
    try {
      const res = await fetch(`/api/org-chart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchOrgChart();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGalleryFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGalleryUploading(true);
    try {
      const url = await uploadDeviceFile(file);
      setGalleryForm(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      alert(err.message);
    } finally {
      setGalleryUploading(false);
    }
  };

  const [galleryCustomCategory, setGalleryCustomCategory] = useState('');

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setGalleryMsg(null);
    const finalCategory = galleryForm.category === 'Lain-lain' ? (galleryCustomCategory.trim() || 'Lain-lain') : galleryForm.category;
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...galleryForm, category: finalCategory })
      });
      const data = await res.json();
      if (res.ok) {
        setGalleryMsg({ type: 'success', text: data.message });
        setGalleryForm({ title: '', description: '', category: 'Aktiviti', image_url: '' });
        setGalleryCustomCategory('');
        fetchGallery();
        fetchStats();
      } else {
        setGalleryMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setGalleryMsg({ type: 'error', text: 'Ralat sambungan pelayan.' });
    }
  };

  const handleGalleryDelete = async (id) => {
    if (!window.confirm('Padam gambar ini dari galeri?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchGallery();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoSuccess('');
    try {
      const res = await fetch('/api/school-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(schoolInfo)
      });
      if (res.ok) {
        setInfoSuccess('Maklumat portal sekolah berjaya dikemaskini!');
      }
    } catch (err) {
      alert('Gagal mengemaskini maklumat');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passData.newPassword !== passData.confirmPassword) {
      return setPassError('Kata laluan baru tidak sepadan.');
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: passData.oldPassword, newPassword: passData.newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menukar kata laluan');

      setPassSuccess('Kata laluan admin berjaya ditukar!');
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Outfit',sans-serif" }}>
          Panel Kawalan Pentadbiran (Admin Dashboard)
        </h1>
        <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
          SMK Sacred Heart — Pengurusan Carta Organisasi, Galeri Peristiwa, Staf & Tetapan Portal.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="stat-cards" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-label">Dokumen E-Filing</div>
            <div className="stat-val">{stats.docs}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-label">Jumlah Staf / Guru</div>
            <div className="stat-val">{stats.staff}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fefce8', color: '#a16207' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-label">Carta Organisasi</div>
            <div className="stat-val">{stats.org}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
            <ImageIcon size={24} />
          </div>
          <div>
            <div className="stat-label">Gambar Galeri</div>
            <div className="stat-val">{stats.gallery}</div>
          </div>
        </div>
      </div>

      {/* Nav Tabs for Admin Sub-Sections */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'settings' ? '3px solid var(--sh-red)' : '3px solid transparent',
            background: 'none',
            fontWeight: 700,
            color: activeTab === 'settings' ? 'var(--sh-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Settings size={18} /> Tetapan Portal & Kata Laluan
        </button>

        <button
          onClick={() => setActiveTab('org')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'org' ? '3px solid var(--sh-red)' : '3px solid transparent',
            background: 'none',
            fontWeight: 700,
            color: activeTab === 'org' ? 'var(--sh-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} /> Urus Carta Organisasi
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'gallery' ? '3px solid var(--sh-red)' : '3px solid transparent',
            background: 'none',
            fontWeight: 700,
            color: activeTab === 'gallery' ? 'var(--sh-red)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ImageIcon size={18} /> Muat Naik Galeri Aktiviti
        </button>
      </div>

      {/* TAB 1: SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
          {/* School Info Settings Form */}
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e4e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e' }}>
              <Settings size={20} color="#7b1c1c" /> Tetapan Maklumat Portal Sekolah
            </h3>

            {infoSuccess && <div className="alert alert-success">{infoSuccess}</div>}

            <form onSubmit={handleUpdateInfo}>
              <div className="form-group">
                <label className="form-label">Slogan / Moto Sekolah</label>
                <input
                  type="text"
                  className="form-control"
                  value={schoolInfo.motto}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, motto: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">No. Telefon Pejabat Sekolah</label>
                <input
                  type="text"
                  className="form-control"
                  value={schoolInfo.phone}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-mel Rasmi Sekolah</label>
                <input
                  type="email"
                  className="form-control"
                  value={schoolInfo.email}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Sekolah</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={schoolInfo.address}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary">
                Simpan Tetapan Laman Web
              </button>
            </form>
          </div>

          {/* Change Admin Password */}
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e4e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e' }}>
              <Key size={20} color="#c9973a" /> Tukar Kata Laluan Pentadbir
            </h3>

            {passError && <div className="alert alert-error">{passError}</div>}
            {passSuccess && <div className="alert alert-success">{passSuccess}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Kata Laluan Asal</label>
                <input
                  type="password"
                  className="form-control"
                  value={passData.oldPassword}
                  onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kata Laluan Baru</label>
                <input
                  type="password"
                  className="form-control"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sahkan Kata Laluan Baru</label>
                <input
                  type="password"
                  className="form-control"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-gold">
                Kemaskini Kata Laluan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: ORG CHART MANAGEMENT */}
      {activeTab === 'org' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.75rem' }}>
          {/* Add / Edit Form */}
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e4e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1a1a2e' }}>
              {orgForm.id ? '✏️ Edit Ahli Carta Organisasi' : '➕ Tambah Ahli Carta Organisasi'}
            </h3>

            {orgMsg && (
              <div className={`alert ${orgMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {orgMsg.text}
              </div>
            )}

            <form onSubmit={handleOrgSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Penuh Staf / Pegawai</label>
                <input
                  type="text"
                  className="form-control"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  placeholder="Contoh: Cikgu Dayang Roziah"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jawatan Carta</label>
                <input
                  type="text"
                  className="form-control"
                  value={orgForm.title}
                  onChange={(e) => setOrgForm({ ...orgForm, title: e.target.value })}
                  placeholder="Contoh: PK Pentadbiran"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tingkat / Kategori Hierarki (Tier)</label>
                <select
                  className="form-control"
                  value={orgForm.tier}
                  onChange={(e) => setOrgForm({ ...orgForm, tier: e.target.value })}
                >
                  <option value="pengetua">Tier 1: Pengetua (Pengurusan Tertinggi)</option>
                  <option value="pk">Tier 2: Penolong Kanan (PK)</option>
                  <option value="kb">Tier 3: Ketua Bidang (KB)</option>
                  <option value="staf">Tier 4: Staf / AJK Sokongan</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bidang / Portfolio Tugas</label>
                <input
                  type="text"
                  className="form-control"
                  value={orgForm.role}
                  onChange={(e) => setOrgForm({ ...orgForm, role: e.target.value })}
                  placeholder="Contoh: Akademik & Pentadbiran"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gambar Avatar (Muat naik dari peranti / URL)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleOrgFileUpload}
                  disabled={orgUploading}
                  style={{ marginBottom: '8px' }}
                />
                {orgUploading && <p style={{ fontSize: '0.8rem', color: 'var(--sh-blue)' }}>Memuat naik gambar...</p>}
                <input
                  type="text"
                  className="form-control"
                  value={orgForm.avatar_url}
                  onChange={(e) => setOrgForm({ ...orgForm, avatar_url: e.target.value })}
                  placeholder="https://... atau /uploads/..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {orgForm.id ? 'Simpan Perubahan' : 'Tambah Ahli Carta'}
                </button>
                {orgForm.id && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setOrgForm({ id: null, name: '', title: '', role: '', tier: 'pk', avatar_url: '', order_index: 0 })}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Org Chart List */}
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e4e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1a1a2e' }}>
              Senarai Ahli Carta Organisasi ({orgList.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
              {orgList.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--surface-light)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.avatar_url ? (
                      <img src={item.avatar_url} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-heading)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--sh-blue)', fontWeight: 600 }}>{item.title} ({item.tier.toUpperCase()})</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setOrgForm(item)}
                      style={{ padding: '6px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleOrgDelete(item.id)}
                      style={{ padding: '6px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GALLERY MANAGEMENT */}
      {activeTab === 'gallery' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.75rem' }}>
          {/* Upload Form */}
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e4e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1a1a2e' }}>
              📸 Muat Naik Gambar Aktiviti Baharu
            </h3>

            {galleryMsg && (
              <div className={`alert ${galleryMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {galleryMsg.text}
              </div>
            )}

            <form onSubmit={handleGallerySubmit}>
              <div className="form-group">
                <label className="form-label">Tajuk Aktiviti / Peristiwa</label>
                <input
                  type="text"
                  className="form-control"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="Contoh: Kejohanan Sukan Tahunan 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-control"
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                >
                  <option value="Aktiviti">Aktiviti General</option>
                  <option value="Sukan">Sukan & Permainan</option>
                  <option value="Akademik">Akademik & Peperiksaan</option>
                  <option value="Komuniti">Komuniti & PIBG</option>
                  <option value="Kokurikulum">Kokurikulum & Kelab</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
                {galleryForm.category === 'Lain-lain' && (
                  <input
                    type="text"
                    className="form-control"
                    style={{ marginTop: '8px' }}
                    placeholder="Masukkan nama kategori baru..."
                    value={galleryCustomCategory}
                    onChange={(e) => setGalleryCustomCategory(e.target.value)}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Penerangan Ringkas</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  placeholder="Catatan mengenai gambar..."
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Pilih Gambar Dari Peranti (Upload File)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleGalleryFileUpload}
                  disabled={galleryUploading}
                  required={!galleryForm.image_url}
                />
                {galleryUploading && <p style={{ fontSize: '0.8rem', color: 'var(--sh-blue)', marginTop: '4px' }}>Memuat naik gambar ke pelayan...</p>}
                
                {galleryForm.image_url && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pratonton Gambar:</p>
                    <img src={galleryForm.image_url} alt="Pratonton" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={galleryUploading}>
                Muat Naik Ke Galeri
              </button>
            </form>
          </div>

          {/* Gallery List Preview & Delete */}
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e4e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1a1a2e' }}>
              Senarai Gambar Galeri ({galleryList.length})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', maxHeight: '550px', overflowY: 'auto' }}>
              {galleryList.map(item => (
                <div key={item.id} style={{
                  background: 'var(--surface-light)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</div>
                  </div>
                  <button
                    onClick={() => handleGalleryDelete(item.id)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
