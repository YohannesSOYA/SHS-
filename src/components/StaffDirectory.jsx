import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Search, Plus, Edit, Trash2, Shield, User, Filter, X } from 'lucide-react';

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
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Direktori Barisan Pentadbir & Guru SMK Lundu
          </h2>
          <p style={{ color: '#64748b' }}>
            Senarai pegawai pentadbiran, ketua panitia, dan guru-guru akademik.
          </p>
        </div>

        {isAdmin && (
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} /> Tambah Staf / Guru Baru
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Cari mengikut nama guru atau jawatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
              <Filter size={14} /> Unit Pentadbiran:
            </span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedDept === dept ? '#1e3a8a' : '#f1f5f9',
                  color: selectedDept === dept ? 'white' : '#475569',
                  transition: 'all 0.2s ease'
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Directory Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          <p>Memuatkan senarai direktori guru & staf...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div style={{ textAlign: 'center', background: 'white', padding: '4rem 2rem', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <Users size={48} color="#94a3b8" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#334155' }}>Tiada maklumat staf ditemui</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {staffList.map((st) => (
            <div key={st.id} style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              position: 'relative'
            }}>
              <img
                src={st.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={st.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 1rem',
                  border: '3px solid #eff6ff',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              />
              <span className={`card-header-badge ${st.department === 'Pentadbiran' ? 'cat-spms' : 'cat-kurikulum'}`}>
                {st.department}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                {st.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, marginBottom: '1rem' }}>
                {st.position}
              </p>

              <div style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'left', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' }}>
                {st.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Mail size={14} color="#64748b" /> {st.email}
                  </div>
                )}
                {st.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="#64748b" /> {st.phone}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleOpenEditModal(st)}
                    style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(st.id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Padam
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {editingStaff ? 'Edit Maklumat Staf' : 'Tambah Staf / Guru Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Penuh Guru / Staf</label>
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
                <label>Jawatan / Portfolio</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Contoh: Ketua Panitia Sains & Matematik"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Unit / Jawatankuasa</label>
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
                  <label>Kategori</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>E-mel Rasmi / DELIMa</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@smklundu.edu.my"
                  />
                </div>

                <div className="form-group">
                  <label>No. Telefon Pejabat / HP</label>
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
                <label>Pautan Gambar Profil (Avatar URL)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingStaff ? 'Kemaskini Staf' : 'Simpan Maklumat Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
