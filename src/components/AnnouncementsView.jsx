import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Plus, Trash2, AlertCircle, X } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function AnnouncementsView({ isAdmin, token }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Confirm delete dialog
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  // Admin Publish Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Pengurusan',
    is_important: false
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error('Gagal mengambil pengumuman', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const doDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ open: false, id: null });
    const authToken = token || localStorage.getItem('smk_token');
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        fetchAnnouncements();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Gagal memadam pengumuman. Sila log masuk sebagai Admin.');
      }
    } catch (err) {
      alert('Gagal memadam pengumuman.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = formData.category === 'Lain-lain' ? (customCategory.trim() || 'Lain-lain') : formData.category;
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, category: finalCategory })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', content: '', category: 'Pengurusan', is_important: false });
        setCustomCategory('');
        fetchAnnouncements();
      } else {
        alert('Gagal menerbitkan pengumuman.');
      }
    } catch (err) {
      alert('Ralat sistem');
    }
  };

  return (
    <div className="page-wrapper">
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title="Padam Pengumuman"
        message="Adakah anda pasti mahu memadam pengumuman ini? Tindakan ini tidak boleh dibatalkan."
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Outfit',sans-serif" }}>
            Pengumuman Rasmi & Takwim
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
            SMK Sacred Heart — Notis pentadbiran, aktiviti sekolah, dan pemberitahuan terkini.
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Terbitkan Pengumuman Baru
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
          <p>Memuatkan pengumuman sekolah...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', background: 'white', padding: '4rem 2rem', borderRadius: '16px', border: '2px dashed #e4e8f0' }}>
          <Bell size={48} color="#9ca3af" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#374151', fontWeight: 700 }}>Tiada pengumuman terkini</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`announcement-card ${item.is_important ? 'important' : ''}`}
            >
              <div className="announce-icon">
                <Bell size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.is_important && (
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <AlertCircle size={12} /> PENTING
                      </span>
                    )}
                    <span className="cat-badge cat-spms">
                      {item.category}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {item.date}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>
                  {item.title}
                </h3>

                <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {item.content}
                </p>

                {isAdmin && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-danger"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      <Trash2 size={13} /> Padam Pengumuman
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Publish Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>📢 Terbitkan Pengumuman Rasmi</h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                  Notis rasmi SMK Sacred Heart
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <form id="announce-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Tajuk Pengumuman</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Pembaruan Sistem E-Filing SPMS 2026"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Pengurusan">Pengurusan</option>
                    <option value="Kurikulum">Kurikulum</option>
                    <option value="HEM">Hal Ehwal Murid</option>
                    <option value="Kokurikulum">Kokurikulum</option>
                    <option value="PIBG">PIBG</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                  {formData.category === 'Lain-lain' && (
                    <input
                      type="text"
                      className="form-control"
                      style={{ marginTop: '8px' }}
                      placeholder="Masukkan nama kategori baru..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      required
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Kandungan Pengumuman</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Tuliskan maklumat penuh pengumuman di sini..."
                    required
                  ></textarea>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="is_important"
                    checked={formData.is_important}
                    onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                  />
                  <label htmlFor="is_important" style={{ margin: 0, cursor: 'pointer', fontSize: '0.88rem' }}>
                    Tanda sebagai Notis Important / Utama
                  </label>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                Batal
              </button>
              <button type="submit" form="announce-form" className="btn btn-primary">
                Terbitkan Notis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
