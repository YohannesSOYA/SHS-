import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Download, Search, Calendar, Eye, Trash2, X, Plus, Upload, ChevronUp } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function Gallery({ isAdmin, token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });

  // Admin upload form
  const [showUpload, setShowUpload] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category: 'Aktiviti', image_url: '' });
  const [uploading, setUploading] = useState(false);

  const categories = ['Semua', 'Aktiviti', 'Sukan', 'Akademik', 'Komuniti', 'Kokurikulum', 'Lain-lain'];

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory, searchTerm]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      let url = '/api/gallery?';
      if (selectedCategory !== 'Semua') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url);
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setGalleryForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        setFeedback({ type: 'error', msg: data.error || 'Gagal memuat naik gambar.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Ralat semasa muat naik.' });
    } finally {
      setUploading(false);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryForm.image_url) {
      setFeedback({ type: 'error', msg: 'Sila pilih gambar terlebih dahulu.' });
      return;
    }
    const finalCategory = galleryForm.category === 'Lain-lain' ? (customCategory.trim() || 'Lain-lain') : galleryForm.category;
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...galleryForm, category: finalCategory })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', msg: data.message });
        setGalleryForm({ title: '', description: '', category: 'Aktiviti', image_url: '' });
        setCustomCategory('');
        setShowUpload(false);
        fetchGallery();
      } else {
        setFeedback({ type: 'error', msg: data.error });
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Ralat sambungan pelayan.' });
    }
  };

  const handleDeleteClick = (id, title) => {
    setConfirmDelete({ open: true, id, title });
  };

  const confirmDeleteAction = async () => {
    const { id } = confirmDelete;
    setConfirmDelete({ open: false, id: null, title: '' });
    const authToken = token || localStorage.getItem('smk_token');
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setFeedback({ type: 'success', msg: data.message || 'Gambar berjaya dipadam!' });
        fetchGallery();
      } else {
        alert(data.error || 'Gagal memadam gambar. Sila log masuk semula.');
        setFeedback({ type: 'error', msg: data.error || 'Gagal memadam gambar.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Ralat semasa memadam.' });
    }
  };

  const handleDownload = async (imageUrl, title) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const safeTitle = (title || 'gambar-aktiviti').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${safeTitle}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--sh-blue), var(--sh-blue-dark))',
            color: 'white', padding: '12px', borderRadius: '12px'
          }}>
            <ImageIcon size={28} />
          </div>
          <div>
            <h1>Galeri Aktiviti & Peristiwa Sekolah</h1>
            <p>Koleksi gambar aktiviti, program dan peristiwa SMK Sacred Heart.</p>
          </div>
        </div>

        {/* Admin Upload Button */}
        {isAdmin && (
          <button
            onClick={() => { setShowUpload(!showUpload); setFeedback(null); }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {showUpload ? <><ChevronUp size={16} /> Tutup Form</> : <><Plus size={16} /> Muat Naik Gambar</>}
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
          border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Admin Upload Form (Inline) */}
      {isAdmin && showUpload && (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--sh-blue)',
          padding: '1.75rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{ fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} color="var(--sh-blue)" /> Muat Naik Gambar Aktiviti Baharu
          </h3>

          <form onSubmit={handleGallerySubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Tajuk Aktiviti / Peristiwa *</label>
                <input
                  className="form-control"
                  value={galleryForm.title}
                  onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="Contoh: Kejohanan Sukan Tahunan 2026"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-control" value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}>
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
                    placeholder="Masukkan nama kategori baharu..."
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    required
                  />
                )}
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Penerangan Ringkas</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={galleryForm.description}
                  onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  placeholder="Catatan mengenai gambar..."
                ></textarea>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">📸 Pilih Gambar Dari Peranti *</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--sh-blue)', marginTop: '4px' }}>⏳ Memuat naik gambar ke pelayan...</p>}
                {galleryForm.image_url && !uploading && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>✅ Pratonton Gambar:</p>
                    <img
                      src={galleryForm.image_url}
                      alt="Preview"
                      style={{ width: '100%', maxWidth: '400px', height: '180px', objectFit: 'cover', borderRadius: '10px', border: '2px solid var(--sh-blue)' }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading || !galleryForm.image_url}>
                {uploading ? 'Memuat naik...' : '📤 Simpan ke Galeri'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowUpload(false); setGalleryForm({ title: '', description: '', category: 'Aktiviti', image_url: '' }); }}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{
        background: 'white',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Categories */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--sh-blue)' : 'var(--border-color)',
                background: selectedCategory === cat ? 'var(--sh-blue)' : 'var(--surface-light)',
                color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cari gambar aktiviti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.88rem'
            }}
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Memuatkan galeri gambar...
        </div>
      ) : items.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '4rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          <ImageIcon size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
          <h3>Tiada Gambar Ditemui</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
            {isAdmin ? 'Klik "Muat Naik Gambar" di atas untuk menambah gambar baharu.' : 'Belum ada gambar yang dimuat naik dalam kategori ini.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Image */}
              <div
                style={{ position: 'relative', height: '200px', background: '#f1f5f9', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'; }}
                />
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(0,0,0,0.6)', color: 'white',
                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.73rem', fontWeight: 700
                }}>
                  {item.category || 'Aktiviti'}
                </div>
                {/* Eye overlay */}
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                  opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', transition: 'opacity 0.2s ease'
                }} className="img-hover-overlay">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.7)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem' }}>
                    <Eye size={16} /> Lihat Penuh
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px', lineHeight: 1.3 }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {item.date_uploaded}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleDownload(item.image_url, item.title)}
                      style={{
                        background: 'var(--sh-green)', color: 'white', border: 'none',
                        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <Download size={13} /> Simpan
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id, item.title); }}
                        style={{
                          background: '#fee2e2', color: '#b91c1c', border: 'none',
                          padding: '6px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(8px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: 'var(--radius-lg)',
              maxWidth: '900px', width: '100%', maxHeight: '90vh',
              overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--surface-light)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>{selectedImage.title}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedImage.category} • {selectedImage.date_uploaded}</span>
              </div>
              <button onClick={() => setSelectedImage(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', maxHeight: '60vh' }}>
              <img src={selectedImage.image_url} alt={selectedImage.title} style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '8px' }} />
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, marginRight: '1rem' }}>
                {selectedImage.description || 'Tiada penerangan tambahan.'}
              </p>
              <button
                onClick={() => handleDownload(selectedImage.image_url, selectedImage.title)}
                style={{
                  background: 'var(--sh-green)', color: 'white', border: 'none',
                  padding: '10px 20px', borderRadius: 'var(--radius-md)',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Download size={16} /> Muat Turun / Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title="Padam Gambar Galeri"
        message={`Adakah anda pasti mahu memadam gambar "${confirmDelete.title}" ini? Tindakan ini tidak boleh dibatalkan.`}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false, id: null, title: '' })}
      />
    </div>
  );
}
