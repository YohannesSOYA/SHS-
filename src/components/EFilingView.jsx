import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Eye, Plus, Edit, Trash2, Filter, CheckCircle, ExternalLink, X } from 'lucide-react';

export default function EFilingView({ isAdmin, token }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Admin Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    category: 'SPMS',
    department: 'Direktori SPMS',
    file_type: 'pdf',
    description: ''
  });

  const categories = ['Semua', 'SPMS', 'Kurikulum', 'HEM', 'Kokurikulum', 'Pentadbiran'];

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let url = `/api/documents?category=${selectedCategory}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Gagal mengambil fail e-filing', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, search]);

  const handleDownload = async (doc) => {
    try {
      await fetch(`/api/documents/${doc.id}/download`, { method: 'POST' });
      fetchDocuments();
      alert(`Muat turun fail: ${doc.title}\nFail sedia diakses.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingDoc(null);
    setFormData({
      code: `SPMS-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: '',
      category: 'SPMS',
      department: 'Direktori SPMS',
      file_type: 'pdf',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc) => {
    setEditingDoc(doc);
    setFormData({
      code: doc.code,
      title: doc.title,
      category: doc.category,
      department: doc.department,
      file_type: doc.file_type || 'pdf',
      description: doc.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam fail e-filing ini?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      alert('Gagal memadam dokumen.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingDoc ? `/api/documents/${editingDoc.id}` : '/api/documents';
      const method = editingDoc ? 'PUT' : 'POST';

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
        fetchDocuments();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Gagal menyimpan dokumen');
      }
    } catch (err) {
      alert('Ralat rangkaian.');
    }
  };

  const getBadgeClass = (cat) => {
    switch (cat) {
      case 'SPMS': return 'cat-spms';
      case 'Kurikulum': return 'cat-kurikulum';
      case 'HEM': return 'cat-hem';
      case 'Kokurikulum': return 'cat-kokurikulum';
      default: return 'cat-pentadbiran';
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Title & Action Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Repositori E-Filing & Direktori SPMS
          </h2>
          <p style={{ color: '#64748b' }}>
            Sistem pengurusan maklumat sekolah, pekeliling, fail panitia dan takwim SMK Lundu.
          </p>
        </div>

        {isAdmin && (
          <button className="btn-primary" onClick={handleOpenAddModal} style={{ background: '#2563eb' }}>
            <Plus size={18} /> Muat Naik Fail E-Filing Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Cari fail mengikut kod, tajuk atau kata kunci..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', items: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
              <Filter size={14} /> Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedCategory === cat ? '#1e3a8a' : '#f1f5f9',
                  color: selectedCategory === cat ? 'white' : '#475569',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents List / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          <FileText size={40} className="animate-spin" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Memuatkan e-filing SMK Lundu...</p>
        </div>
      ) : documents.length === 0 ? (
        <div style={{ textAling: 'center', background: 'white', padding: '4rem 2rem', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <FileText size={48} color="#94a3b8" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#334155' }}>Tiada fail e-filing ditemui</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Cuba ubah kata kunci carian atau kategori di atas.</p>
        </div>
      ) : (
        <div className="card-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="doc-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`card-header-badge ${getBadgeClass(doc.category)}`}>
                    {doc.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                    {doc.code}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '8px 0' }}>
                  {doc.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', minHeight: '40px' }}>
                  {doc.description || 'Tiada penerangan tambahan.'}
                </p>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #f1f5f9' }}>
                  <span>Unit: <strong>{doc.department}</strong></span>
                  <span>Tarikh: {doc.date_uploaded}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setPreviewDoc(doc)}
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  >
                    <Eye size={14} /> Lihat
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => handleDownload(doc)}
                    style={{ padding: '6px 12px', fontSize: '0.82rem', background: '#059669' }}
                  >
                    <Download size={14} /> Fail ({doc.downloads || 0})
                  </button>
                </div>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleOpenEditModal(doc)}
                      style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Edit Fail"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Padam Fail"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className={`card-header-badge ${getBadgeClass(previewDoc.category)}`}>
                  {previewDoc.category}
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {previewDoc.title}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Kod Dokumen: {previewDoc.code}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <div><strong>Unit/Jabatan:</strong> {previewDoc.department}</div>
                <div><strong>Tarikh Muat Naik:</strong> {previewDoc.date_uploaded}</div>
                <div><strong>Format Fail:</strong> {previewDoc.file_type?.toUpperCase() || 'PDF'}</div>
                <div><strong>Jumlah Muat Turun:</strong> {previewDoc.downloads || 0} kali</div>
              </div>

              <div style={{ fontSize: '0.9rem', borderTop: '1px solid #e2e8f0', paddingTop: '10px', color: '#334155' }}>
                <strong>Penerangan Dokumen:</strong>
                <p style={{ marginTop: '4px' }}>{previewDoc.description || 'Tiada nota spesifik.'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setPreviewDoc(null)}>
                Tutup
              </button>
              <button className="btn-primary" onClick={() => handleDownload(previewDoc)} style={{ background: '#059669' }}>
                <Download size={16} /> Muat Turun Fail Rasmi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {editingDoc ? 'Edit Dokumen E-Filing' : 'Muat Naik Dokumen E-Filing Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Kod Rujukan Dokumen</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tajuk Dokumen / Fail</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Manual Pengurusan Sekolah 2026"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="SPMS">SPMS</option>
                    <option value="Kurikulum">Kurikulum</option>
                    <option value="HEM">HEM</option>
                    <option value="Kokurikulum">Kokurikulum</option>
                    <option value="Pentadbiran">Pentadbiran</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Unit / Jawatankuasa</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Contoh: Unit Peperiksaan"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Penerangan / Ringkasan Dokumen</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan penerangan kandungan fail..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingDoc ? 'Kemaskini Dokumen' : 'Simpan Fail Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
