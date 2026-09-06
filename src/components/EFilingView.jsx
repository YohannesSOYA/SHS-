import React, { useState, useEffect } from 'react';
import {
  Search, FileText, Download, Eye, Plus, Edit, Trash2,
  Filter, X, ChevronRight, FolderOpen, ArrowLeft, File
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const CATEGORIES = ['Semua', 'SPMS', 'Kurikulum', 'HEM', 'Kokurikulum', 'Pentadbiran'];

const DIR_SECTIONS = [
  {
    id: 'spms', label: 'Direktori SPMS', emoji: '📋', category: 'SPMS',
    desc: 'Fail Sistem Pengurusan Maklumat Sekolah & pekeliling utama',
    color: '#eff6ff', iconColor: '#1d4ed8'
  },
  {
    id: 'kurikulum', label: 'Fail Kurikulum', emoji: '📚', category: 'Kurikulum',
    desc: 'Pelan kurikulum, takwim peperiksaan, dan fail panitia mata pelajaran',
    color: '#f0fdf4', iconColor: '#15803d'
  },
  {
    id: 'hem', label: 'Hal Ehwal Murid', emoji: '🤝', category: 'HEM',
    desc: 'Borang disiplin, kebajikan, dan program pembangunan murid',
    color: '#fefce8', iconColor: '#a16207'
  },
  {
    id: 'kokurikulum', label: 'Kokurikulum', emoji: '🏆', category: 'Kokurikulum',
    desc: 'Kelab, persatuan, laporan sukan, dan aktiviti luar bilik darjah',
    color: '#fdf4ff', iconColor: '#7e22ce'
  },
  {
    id: 'pentadbiran', label: 'Pentadbiran', emoji: '🏫', category: 'Pentadbiran',
    desc: 'Dasar sekolah, surat rasmi, minit mesyuarat, dan rekod pentadbiran',
    color: '#fff1f2', iconColor: '#be123c'
  },
];

function getCatClass(cat) {
  const map = {
    SPMS: 'cat-spms', Kurikulum: 'cat-kurikulum',
    HEM: 'cat-hem', Kokurikulum: 'cat-kokurikulum',
    Pentadbiran: 'cat-pentadbiran'
  };
  return map[cat] || 'cat-pentadbiran';
}

export default function EFilingView({ isAdmin, token }) {
  const [view, setView] = useState('hub'); // 'hub' or 'list'
  const [activeSection, setActiveSection] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docCounts, setDocCounts] = useState({});
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });
  const [formData, setFormData] = useState({
    code: '', title: '', category: 'SPMS',
    department: 'Direktori SPMS', file_url: '', file_type: 'pdf', description: ''
  });

  useEffect(() => { fetchAllCounts(); }, []);

  const fetchAllCounts = async () => {
    try {
      const res = await fetch('/api/documents');
      const all = await res.json();
      const counts = {};
      all.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
      setDocCounts(counts);
    } catch (e) {}
  };

  const fetchDocuments = async (category, searchTerm = '') => {
    setLoading(true);
    try {
      const cat = category === 'Semua' ? '' : category;
      const res = await fetch(`/api/documents?category=${cat}&search=${encodeURIComponent(searchTerm)}`);
      setDocuments(await res.json());
    } catch (e) {}
    setLoading(false);
  };

  const openSection = (section) => {
    setActiveSection(section);
    setView('list');
    setSearch('');
    fetchDocuments(section.category);
  };

  const openAll = () => {
    setActiveSection({ id: 'all', label: 'Semua Fail e-Filing', emoji: '📂', category: 'Semua' });
    setView('list');
    setSearch('');
    fetchDocuments('Semua');
  };

  useEffect(() => {
    if (view === 'list' && activeSection) {
      fetchDocuments(activeSection.category, search);
    }
  }, [search]);

  const handleDownload = async (doc) => {
    await fetch(`/api/documents/${doc.id}/download`, { method: 'POST' });
    fetchDocuments(activeSection?.category || 'Semua', search);
    if (doc.file_url && doc.file_url !== '#' && doc.file_url !== '') {
      window.open(doc.file_url, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Fail "${doc.title}" belum mempunyai pautan dokumen. Sila hubungi pentadbir.`);
    }
  };

  const handleDeleteClick = (doc) => {
    setConfirmDelete({ open: true, id: doc.id, title: doc.title || '' });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ open: false, id: null, title: '' });
    const authToken = token || localStorage.getItem('smk_token');
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        fetchDocuments(activeSection?.category || 'Semua', search);
        fetchAllCounts();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Gagal memadam fail. Sila pastikan anda log masuk sebagai Admin.');
      }
    } catch (err) {
      alert('Ralat sambungan semasa memadam fail.');
    }
  };

  const openAddModal = () => {
    setEditingDoc(null);
    setFormData({
      code: `SHS-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: '', category: activeSection?.category !== 'Semua' ? activeSection?.category || 'SPMS' : 'SPMS',
      department: '', file_url: '', file_type: 'pdf', description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setFormData({ code: doc.code, title: doc.title, category: doc.category, department: doc.department, file_url: doc.file_url || '', file_type: doc.file_type || 'pdf', description: doc.description || '' });
    setIsModalOpen(true);
  };

  const [customCategory, setCustomCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = formData.category === 'Lain-lain' ? (customCategory.trim() || 'Lain-lain') : formData.category;
    const url = editingDoc ? `/api/documents/${editingDoc.id}` : '/api/documents';
    const method = editingDoc ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...formData, category: finalCategory })
    });
    if (res.ok) { setIsModalOpen(false); setCustomCategory(''); fetchDocuments(activeSection?.category || 'Semua', search); fetchAllCounts(); }
    else { const d = await res.json(); alert(d.error || 'Gagal menyimpan'); }
  };

  // ── HUB VIEW ──
  if (view === 'hub') {
    return (
      <div className="page-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Outfit',sans-serif" }}>
              Direktori SPMS & e-Filing
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
              SMK Sacred Heart — Pilih kategori atau unit untuk akses fail dan dokumen rasmi.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" onClick={openAll} style={{ gap: '6px' }}>
              <FileText size={15} /> Lihat Semua Fail
            </button>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => { openAll(); setTimeout(openAddModal, 100); }}>
                <Plus size={15} /> Tambah Dokumen
              </button>
            )}
          </div>
        </div>

        {/* Directory Section Cards */}
        <div className="directory-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {DIR_SECTIONS.map(section => (
            <div key={section.id} className="dir-card" onClick={() => openSection(section)} style={{ gap: '1rem', padding: '1.75rem 1.5rem' }}>
              <div className="dir-card-icon" style={{ background: section.color, width: '60px', height: '60px', fontSize: '1.8rem' }}>
                {section.emoji}
              </div>
              <div style={{ textAlign: 'left', width: '100%' }}>
                <div className="dir-card-title" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{section.label}</div>
                <div className="dir-card-count" style={{ marginBottom: '10px', lineHeight: 1.5 }}>{section.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', background: section.color, color: section.iconColor, padding: '2px 10px', borderRadius: '100px', fontWeight: 700 }}>
                    {docCounts[section.category] || 0} fail
                  </span>
                  <ChevronRight size={16} color="#9ca3af" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => setView('hub')}>
          <ArrowLeft size={14} /> Direktori SPMS
        </button>
        <span>/</span>
        <span style={{ color: '#1a1a2e' }}>{activeSection?.emoji} {activeSection?.label}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Outfit',sans-serif" }}>
            {activeSection?.emoji} {activeSection?.label}
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
            {documents.length} fail ditemui
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={15} /> Muat Naik Fail Baru
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Cari fail mengikut kod, tajuk atau kata kunci..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af' }}>
          <FileText size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
          <p>Memuatkan fail...</p>
        </div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', background: 'white', borderRadius: '16px', border: '2px dashed #e4e8f0', padding: '4rem 2rem' }}>
          <FolderOpen size={48} color="#d1d5db" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ color: '#374151', fontWeight: 700 }}>Tiada fail ditemui</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '4px' }}>
            Cuba cari dengan kata kunci lain, atau {isAdmin ? 'muat naik fail baru.' : 'hubungi pentadbir.'}
          </p>
        </div>
      ) : (
        <div className="doc-grid">
          {documents.map(doc => (
            <div key={doc.id} className="doc-card">
              <div className="doc-card-stripe" />
              <div className="doc-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <span className={`cat-badge ${getCatClass(doc.category)}`}>{doc.category}</span>
                  <span className="doc-card-code">{doc.code}</span>
                </div>
                <div className="doc-card-title">{doc.title}</div>
                <div className="doc-card-desc">{doc.description || 'Tiada penerangan.'}</div>
                <div className="doc-card-meta">
                  <span>📁 {doc.department}</span>
                  <span>🗓 {doc.date_uploaded}</span>
                </div>
              </div>
              <div className="doc-card-footer">
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setPreviewDoc(doc)}>
                    <Eye size={13} /> Maklumat
                  </button>
                  {doc.file_url && doc.file_url !== '#' && doc.file_url !== '' ? (
                    <button
                      className="btn btn-gold"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#059669', color: 'white' }}
                      onClick={() => handleDownload(doc)}
                    >
                      <Download size={13} /> Buka Dokumen ({doc.downloads || 0})
                    </button>
                  ) : (
                    <button
                      className="btn btn-gold"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#94a3b8', color: 'white', cursor: 'not-allowed' }}
                      disabled
                      title="Tiada pautan dokumen"
                    >
                      <Download size={13} /> Tiada Pautan
                    </button>
                  )}
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-icon" onClick={() => openEditModal(doc)} style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-icon btn-danger" onClick={() => handleDeleteClick(doc)} title="Padam Fail">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="modal-backdrop" onClick={() => setPreviewDoc(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className={`cat-badge ${getCatClass(previewDoc.category)}`} style={{ marginBottom: '8px', display: 'inline-flex' }}>{previewDoc.category}</span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{previewDoc.title}</h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>Kod: {previewDoc.code}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8f9fc', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div><span className="text-muted">Unit/Jabatan</span><br /><strong>{previewDoc.department}</strong></div>
                  <div><span className="text-muted">Tarikh Muat Naik</span><br /><strong>{previewDoc.date_uploaded}</strong></div>
                  <div><span className="text-muted">Format Fail</span><br /><strong>{previewDoc.file_type?.toUpperCase()}</strong></div>
                  <div><span className="text-muted">Muat Turun</span><br /><strong>{previewDoc.downloads || 0} kali</strong></div>
                </div>
                {previewDoc.description && (
                  <div style={{ borderTop: '1px solid #e4e8f0', paddingTop: '10px', marginTop: '10px', fontSize: '0.88rem' }}>
                    <span className="text-muted">Penerangan</span><br />
                    <span>{previewDoc.description}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPreviewDoc(null)}>Tutup</button>
              {previewDoc.file_url && previewDoc.file_url !== '#' && previewDoc.file_url !== '' ? (
                <button className="btn" style={{ background: '#059669', color: 'white' }} onClick={() => handleDownload(previewDoc)}>
                  <Download size={15} /> Buka / Muat Turun Fail
                </button>
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>Tiada pautan dokumen. Hubungi pentadbir.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {editingDoc ? '✏️ Edit Dokumen' : '📤 Muat Naik Fail Baru'}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>
                  Isi maklumat fail e-filing untuk SMK Sacred Heart
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form id="doc-form" onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Tajuk Dokumen</label>
                    <input className="form-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Contoh: Manual Pengurusan Fail 2026" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kod Rujukan</label>
                    <input className="form-control" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      {['SPMS', 'Kurikulum', 'HEM', 'Kokurikulum', 'Pentadbiran', 'Lain-lain'].map(c => <option key={c}>{c}</option>)}
                    </select>
                    {formData.category === 'Lain-lain' && (
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginTop: '8px' }}
                        placeholder="Masukkan nama kategori baru..."
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Unit / Jawatankuasa</label>
                    <input className="form-control" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="Contoh: Unit Peperiksaan" required />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">🔗 Pautan / Link Dokumen</label>
                    <input
                      className="form-control"
                      type="url"
                      value={formData.file_url}
                      onChange={e => setFormData({ ...formData, file_url: e.target.value })}
                      placeholder="https://drive.google.com/... atau https://..."
                    />
                    <span style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                      Tampal pautan Google Drive, OneDrive, atau mana-mana URL dokumen yang boleh diakses pengguna.
                    </span>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Penerangan Dokumen</label>
                    <textarea className="form-control" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Ringkasan kandungan fail..." />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" type="button" onClick={() => setIsModalOpen(false)}>Batal</button>
              <button className="btn btn-primary" type="submit" form="doc-form">
                {editingDoc ? 'Kemaskini' : 'Simpan Fail'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title="Padam Fail e-Filing"
        message={`Adakah anda pasti mahu memadam fail e-filing "${confirmDelete.title}" ini? Tindakan ini tidak boleh dibatalkan.`}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false, id: null, title: '' })}
      />
    </div>
  );
}
