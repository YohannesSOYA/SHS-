import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Search, Plus, Edit, Trash2, Filter, X } from 'lucide-react';

export default function StaffDirectory({ isAdmin, token }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('Semua');

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
    category: 'Guru'
  });

  const departments = ['Semua', 'Pentadbiran', 'Kurikulum', 'HEM', 'Kokurikulum'];

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff?department=${selectedDept}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setStaffList(data);
    } catch (err) {
      console.error('Gagal mengambil direktori staf', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [selectedDept, search]);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      position: '',
      department: 'Pentadbiran',
      email: '',
      phone: '',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      category: 'Guru'
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
      category: st.category || 'Guru'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Padam rekod guru/staf ini?')) return;
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchStaff();
    } catch (err) {
      alert('Gagal memadam rekod.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
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
            SMK Sacred Heart — Senarai pegawai pentadbiran, ketua panitia, dan warga pendidik.
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} /> Tambah Staf / Guru Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Cari mengikut nama guru atau jawatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
            <div key={st.id} className="staff-card">
              <img
                src={st.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={st.name}
                className="staff-avatar"
              />
              <span className={`cat-badge ${st.department === 'Pentadbiran' ? 'cat-spms' : 'cat-kurikulum'}`} style={{ marginBottom: '8px', display: 'inline-flex' }}>
                {st.department}
              </span>
              <div className="staff-name">{st.name}</div>
              <div className="staff-position">{st.position}</div>

              <div className="staff-meta">
                {st.email && (
                  <div className="staff-meta-row">
                    <Mail size={13} color="#7b1c1c" /> {st.email}
                  </div>
                )}
                {st.phone && (
                  <div className="staff-meta-row">
                    <Phone size={13} color="#7b1c1c" /> {st.phone}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleOpenEditModal(st)}
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(st.id)}
                    className="btn btn-danger"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
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
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <form id="staff-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nama Penuh Guru / Staf</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Cikgu Ahmad Redzuan"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jawatan / Portfolio</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Contoh: Ketua Panitia Sains & Matematik"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Unit / Jawatankuasa</label>
                    <select
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Pentadbiran">Pentadbiran</option>
                      <option value="Kurikulum">Kurikulum</option>
                      <option value="HEM">HEM</option>
                      <option value="Kokurikulum">Kokurikulum</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Pentadbir">Pentadbir</option>
                      <option value="Guru">Guru Akademik</option>
                      <option value="AKP">Anggota Kumpulan Pelaksana (AKP)</option>
                    </select>
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
                      placeholder="nama@smksacredheart.edu.my"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">No. Telefon Pejabat / HP</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="019-XXXXXXX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Pautan Gambar Profil (Avatar URL)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://..."
                  />
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
