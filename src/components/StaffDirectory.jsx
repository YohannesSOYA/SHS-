import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Search, Plus, Edit, Trash2, User, RefreshCw } from 'lucide-react';

export default function StaffDirectory({ isAdmin, token }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('Semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');

  // Admin Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: 'Pentadbiran',
    email: '',
    phone: '',
    avatar_url: '',
    category: 'Guru Biasa'
  });

  const departments = ['Semua', 'Pentadbiran', 'Kurikulum', 'HEM', 'Kokurikulum', 'Guru Biasa'];
  const categories = ['Semua Kategori', 'Pentadbir', 'Guru Kanan', 'Penyelaras', 'Guru Biasa', 'AKP'];

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff?department=${selectedDept}&search=${encodeURIComponent(search)}`);
      let data = await res.json();

      if (selectedCategory !== 'Semua Kategori') {
        data = data.filter(st => st.category === selectedCategory);
      }

      setStaffList(data);
    } catch (err) {
      console.error('Gagal mengambil direktori staf', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [selectedDept, selectedCategory, search]);

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append('file', file);

    const authToken = token || localStorage.getItem('smk_token');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: body
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, avatar_url: data.url }));
      } else {
        alert(data.error || 'Gagal memuat naik gambar.');
      }
    } catch (err) {
      alert('Ralat semasa muat naik gambar.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetStaff = async () => {
    if (!window.confirm('Set semula Direktori Staf mengikut Carta Organisasi 2025 & Guru Biasa?')) return;
    const authToken = token || localStorage.getItem('smk_token');
    try {
      const res = await fetch('/api/staff/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        alert('Direktori Staf 2025 berjaya diset semula!');
        fetchStaff();
      }
    } catch (err) {
      alert('Ralat semasa set semula.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      position: '',
      department: 'Pentadbiran',
      email: '',
      phone: '',
      avatar_url: '',
      category: 'Guru Biasa'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (st) => {
    setEditingStaff(st);
    setFormData({
      name: st.name,
      position: st.position,
      department: st.department,
      email: st.email || '',
      phone: st.phone || '',
      avatar_url: st.avatar_url || '',
      category: st.category || 'Guru Biasa'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Padam rekod guru/staf ini?')) return;
    const authToken = token || localStorage.getItem('smk_token');
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) fetchStaff();
    } catch (err) {
      alert('Gagal memadam rekod.');
    }
  };

  const [customDept, setCustomDept] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalDept = formData.department === 'Lain-lain' ? (customDept.trim() || 'Lain-lain') : formData.department;
    const finalCat = formData.category === 'Lain-lain' ? (customCategory.trim() || 'Lain-lain') : formData.category;
    const authToken = token || localStorage.getItem('smk_token');

    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ ...formData, department: finalDept, category: finalCat })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setCustomDept('');
        setCustomCategory('');
        fetchStaff();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Gagal menyimpan');
      }
    } catch (err) {
      alert('Ralat sistem');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Outfit',sans-serif" }}>
            Direktori Barisan Pentadbir & Guru
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
            SMK Sacred Heart — Senarai pegawai pentadbiran, ketua panitia, penyelaras, dan guru biasa.
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" onClick={handleResetStaff} style={{ border: '1px solid #cbd5e1' }}>
              <RefreshCw size={15} /> Reset Direktori 2025
            </button>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <Plus size={16} /> Tambah Staf / Guru Baru
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="search-wrap">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Cari mengikut nama guru, jawatan, atau subjek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Unit / Jabatan:</div>
          <div className="filter-chips">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`chip ${selectedDept === dept ? 'active' : ''}`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Kategori Jawatan:</div>
          <div className="filter-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                style={{
                  background: selectedCategory === cat ? 'var(--sh-red)' : '#f1f5f9',
                  color: selectedCategory === cat ? 'white' : '#334155',
                  borderColor: selectedCategory === cat ? 'var(--sh-red)' : '#cbd5e1'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Directory Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
          <p>Memuatkan senarai direktori guru & staf...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div style={{ textAlign: 'center', background: 'white', padding: '4rem 2rem', borderRadius: '16px', border: '2px dashed #e4e8f0' }}>
          <Users size={48} color="#9ca3af" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#374151', fontWeight: 700 }}>Tiada maklumat staf ditemui</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '4px' }}>
            Cuba cari dengan carian lain atau {isAdmin ? 'tambah staf baru.' : 'hubungi pihak pentadbiran.'}
          </p>
        </div>
      ) : (
        <div className="staff-grid">
          {staffList.map((st) => (
            <div key={st.id} className="staff-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '90px',
                height: '110px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '10px',
                border: '2px solid var(--sh-yellow)',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
              }}>
                {st.avatar_url ? (
                  <img
                    src={st.avatar_url}
                    alt={st.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <User size={32} style={{ margin: '0 auto 2px' }} />
                    <span style={{ fontSize: '0.62rem', fontWeight: 600, display: 'block' }}>Ruang Gambar</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '6px' }}>
                <span className={`cat-badge ${st.department === 'Pentadbiran' ? 'cat-spms' : 'cat-kurikulum'}`}>
                  {st.department}
                </span>
                {st.category && (
                  <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                    {st.category}
                  </span>
                )}
              </div>

              <div className="staff-name" style={{ textAlign: 'center' }}>{st.name}</div>
              <div className="staff-position" style={{ textAlign: 'center', color: 'var(--sh-blue)', fontWeight: 700 }}>{st.position}</div>

              <div className="staff-meta" style={{ width: '100%', marginTop: 'auto', paddingTop: '10px' }}>
                {st.email && (
                  <div className="staff-meta-row" style={{ fontSize: '0.78rem' }}>
                    <Mail size={13} color="var(--sh-maroon)" /> {st.email}
                  </div>
                )}
                {st.phone && (
                  <div className="staff-meta-row" style={{ fontSize: '0.78rem' }}>
                    <Phone size={13} color="var(--sh-maroon)" /> {st.phone}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1rem', width: '100%' }}>
                  <button
                    onClick={() => handleOpenEditModal(st)}
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', flex: 1 }}
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(st.id)}
                    className="btn btn-danger"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', flex: 1 }}
                  >
                    <Trash2 size={13} /> Padam
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {editingStaff ? '✏️ Edit Maklumat Staf' : '👤 Tambah Staf / Guru Baru'}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                  Direktori SMK Sacred Heart
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <form id="staff-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nama Penuh Guru / Staf *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Encik David Teo Wu"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jawatan / Portfolio *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Contoh: Pengetua / Guru Akademik (Fizik)"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Unit / Jabatan</label>
                    <select
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Pentadbiran">Pentadbiran</option>
                      <option value="Kurikulum">Kurikulum</option>
                      <option value="HEM">HEM</option>
                      <option value="Kokurikulum">Kokurikulum</option>
                      <option value="Guru Biasa">Guru Biasa</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                    {formData.department === 'Lain-lain' && (
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginTop: '8px' }}
                        placeholder="Nama Unit / Jawatankuasa baru..."
                        value={customDept}
                        onChange={(e) => setCustomDept(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Pentadbir">Pentadbir</option>
                      <option value="Guru Kanan">Guru Kanan</option>
                      <option value="Penyelaras">Penyelaras</option>
                      <option value="Guru Biasa">Guru Biasa</option>
                      <option value="AKP">AKP (Staf Sokongan)</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                    {formData.category === 'Lain-lain' && (
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginTop: '8px' }}
                        placeholder="Nama Kategori baru..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">E-mel Rasmi / DELIMa</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@moe-dl.edu.my"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">No. Telefon Pejabat / HP</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="084-330454"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Gambar Profil (Muat naik dari peranti ATAU masukkan URL)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    {uploading && <span style={{ fontSize: '0.8rem', color: 'var(--sh-blue)' }}>Memuat naik gambar peranti...</span>}
                    <input
                      type="text"
                      className="form-control"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      placeholder="https://... atau /uploads/..."
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                Batal
              </button>
              <button type="submit" form="staff-form" className="btn btn-primary">
                {editingStaff ? 'Kemaskini Staf' : 'Simpan Maklumat Staf'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
