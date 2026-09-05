import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Plus, Trash2, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';

export default function AnnouncementsView({ isAdmin, token }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Publish Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam pengumuman ini?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAnnouncements();
    } catch (err) {
      alert('Gagal memadam pengumuman.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', content: '', category: 'Pengurusan', is_important: false });
        fetchAnnouncements();
      } else {
        alert('Gagal menerbitkan pengumuman.');
      }
    } catch (err) {
      alert('Ralat sistem');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Pengumuman Rasmi & Takwim SMK Lundu
          </h2>
          <p style={{ color: '#64748b' }}>
            Notis pentadbiran, aktiviti sekolah, dan pemberitahuan terkini.
          </p>
        </div>

        {isAdmin && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Terbitkan Pengumuman Baru
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          <p>Memuatkan pengumuman sekolah...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', background: 'white', padding: '4rem 2rem', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <Bell size={48} color="#94a3b8" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#334155' }}>Tiada pengumuman terkini</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {announcements.map((item) => (
            <div key={item.id} style={{
              background: 'white',
              borderRadius: '16px',
              border: item.is_important ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.is_important && (
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> PENTING
                    </span>
                  )}
                  <span className="card-header-badge cat-spms">
                    {item.category}
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {item.date}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {item.title}
              </h3>

              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {item.content}
              </p>

              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Padam Pengumuman
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Publish Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Terbitkan Pengumuman Rasmi Baru</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tajuk Pengumuman</label>
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
                <label>Kategori</label>
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
                </select>
              </div>

              <div className="form-group">
                <label>Kandungan Pengumuman</label>
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
                <label htmlFor="is_important" style={{ margin: 0, cursor: 'pointer' }}>
                  Tanda sebagai Pengumuman Important / Utama
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Terbitkan Notis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
