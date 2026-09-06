import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, Download, Plus, Trash2, Edit, FileText, Users, Shield, BookOpen, Upload, CheckCircle } from 'lucide-react';

export default function TimetablePanel({ isAdmin, token }) {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('Semua'); // 'Semua' | 'kelas' | 'guru' | 'bertugas'
  const [selectedForm, setSelectedForm] = useState('Semua');
  const [search, setSearch] = useState('');

  // Admin form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formType, setFormType] = useState('kelas');
  const [formTitle, setFormTitle] = useState('');
  const [formLevel, setFormLevel] = useState('Tingkatan 5');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      let url = `/api/timetables?type=${activeType}&form_level=${selectedForm}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        setTimetables(await res.json());
      }
    } catch (err) {
      console.error('Error fetching timetables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, [activeType, selectedForm, search]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setFormFileUrl(data.url);
      } else {
        alert(data.error || 'Muat naik fail gagal');
      }
    } catch (err) {
      alert('Ralat muat naik fail');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    const payload = {
      type: formType,
      title: formTitle,
      form_level: formLevel,
      file_url: formFileUrl || '#',
      notes: formNotes
    };

    try {
      const url = editingId ? `/api/timetables/${editingId}` : '/api/timetables';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: data.message });
        setShowAddModal(false);
        resetForm();
        fetchTimetables();
      } else {
        setMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Ralat sambungan pelayan.' });
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormType(item.type);
    setFormTitle(item.title);
    setFormLevel(item.form_level);
    setFormFileUrl(item.file_url || '');
    setFormNotes(item.notes || '');
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam rekod jadual waktu ini?')) return;
    try {
      const res = await fetch(`/api/timetables/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTimetables();
      }
    } catch (err) {
      console.error('Ralat memadam jadual:', err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormType('kelas');
    setFormTitle('');
    setFormLevel('Tingkatan 5');
    setFormFileUrl('');
    setFormNotes('');
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '80vh', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #3d080c 0%, #7b1c1c 50%, #4a0c0c 100%)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        color: 'white',
        marginBottom: '2.5rem',
        boxShadow: '0 20px 40px rgba(90, 16, 16, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.08,
          fontSize: '11rem', fontWeight: 900, userSelect: 'none', pointerEvents: 'none'
        }}>
          SCHEDULE
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 242, 0, 0.15)', border: '1px solid rgba(255, 242, 0, 0.35)', color: 'var(--sh-yellow)', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1rem' }}>
          <Clock size={14} color="var(--sh-yellow)" /> SEMAKAN JADUAL WAKTU SPMS
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, fontFamily: "'Outfit', sans-serif", margin: '0 0 0.5rem 0' }}>
          Jadual Waktu <span style={{ color: 'var(--sh-yellow)' }}>Kelas & Guru</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '720px', margin: 0, fontSize: '0.98rem', lineHeight: 1.6 }}>
          Pusat semakan maklumat jadual waktu pengajaran dan pembelajaran mengikut kelas, jadual waktu persendirian guru, dan jadual tugasan guru bertugas harian SMK Sacred Heart.
        </p>
      </div>

      {/* Control Bar: Categories, Filters & Search */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'Semua', label: '🗂️ Semua Jadual' },
              { id: 'kelas', label: '📚 Jadual Waktu Kelas' },
              { id: 'guru', label: '👨‍🏫 Jadual Waktu Guru' },
              { id: 'bertugas', label: '🛡️ Guru Bertugas Harian' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: activeType === tab.id ? '2px solid var(--sh-maroon)' : '1px solid #e2e8f0',
                  background: activeType === tab.id ? 'var(--sh-maroon)' : '#f8fafc',
                  color: activeType === tab.id ? '#ffffff' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeType === tab.id ? '0 4px 12px rgba(123, 28, 28, 0.25)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              style={{
                background: 'linear-gradient(135deg, var(--sh-red), var(--sh-maroon))',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(230, 28, 36, 0.3)'
              }}
            >
              <Plus size={16} /> Tambah Jadual Baharu
            </button>
          )}
        </div>

        {/* Form Level & Search Filter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
              Pilih Tingkatan / Kategori:
            </label>
            <select
              className="form-control"
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              style={{ width: '100%', borderRadius: '12px', padding: '10px 14px', border: '1px solid #cbd5e1' }}
            >
              <option value="Semua">Semua Tingkatan</option>
              <option value="Tingkatan 6">Tingkatan 6 (STPM)</option>
              <option value="Tingkatan 5">Tingkatan 5</option>
              <option value="Tingkatan 4">Tingkatan 4</option>
              <option value="Tingkatan 3">Tingkatan 3</option>
              <option value="Tingkatan 2">Tingkatan 2</option>
              <option value="Tingkatan 1">Tingkatan 1</option>
              <option value="Peralihan">Kelas Peralihan</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
              Cari Nama Kelas / Guru:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: 5 Science 1, Cikgu Tan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', borderRadius: '12px', padding: '10px 14px 10px 38px', border: '1px solid #cbd5e1' }}
              />
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Message Alert */}
      {msg && (
        <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {msg.text}
        </div>
      )}

      {/* Timetable List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          <p style={{ fontWeight: 600 }}>Memuatkan maklumat jadual waktu...</p>
        </div>
      ) : timetables.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px dashed #cbd5e1', padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
          <Calendar size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>Tiada Jadual Diperoleh</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto' }}>
            Sila tukar penapis tingkatan atau buat carian dengan kata kunci yang lain.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {timetables.map(item => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '1.75rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
            >
              <div>
                {/* Badge Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{
                    background: item.type === 'kelas' ? 'rgba(41, 171, 226, 0.12)' : item.type === 'guru' ? 'rgba(0, 146, 69, 0.12)' : 'rgba(230, 28, 36, 0.12)',
                    color: item.type === 'kelas' ? 'var(--sh-blue)' : item.type === 'guru' ? 'var(--sh-green)' : 'var(--sh-red)',
                    padding: '4px 12px',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {item.type === 'kelas' ? '📚 Jadual Kelas' : item.type === 'guru' ? '👨‍🏫 Jadual Guru' : '🛡️ Guru Bertugas'}
                  </span>

                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    {item.form_level}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", marginBottom: '8px', lineHeight: 1.35 }}>
                  {item.title}
                </h3>

                {item.notes && (
                  <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {item.notes}
                  </p>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Dikemaskini: {item.date_updated}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <a
                    href={item.file_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: item.file_url && item.file_url !== '#' ? 'var(--sh-maroon)' : '#e2e8f0',
                      color: item.file_url && item.file_url !== '#' ? '#ffffff' : '#94a3b8',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      pointerEvents: item.file_url && item.file_url !== '#' ? 'auto' : 'none'
                    }}
                  >
                    <Download size={14} /> {item.file_url && item.file_url !== '#' ? 'Muat Turun Jadual' : 'Tiada Lampiran Fail'}
                  </a>

                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{ padding: '8px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        title="Edit Jadual"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{ padding: '8px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        title="Padam Jadual"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Add / Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
              {editingId ? '✏️ Kemaskini Rekod Jadual Waktu' : '➕ Tambah Jadual Waktu Baharu'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Jenis Jadual</label>
                <select
                  className="form-control"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  required
                >
                  <option value="kelas">📚 Jadual Waktu Kelas</option>
                  <option value="guru">👨‍🏫 Jadual Waktu Guru</option>
                  <option value="bertugas">🛡️ Guru Bertugas Harian</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tajuk Jadual / Nama Kelas / Guru</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Jadual Waktu 5 Science 1"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tingkatan / Kumpulan</label>
                <select
                  className="form-control"
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value)}
                  required
                >
                  <option value="Tingkatan 6">Tingkatan 6 (STPM)</option>
                  <option value="Tingkatan 5">Tingkatan 5</option>
                  <option value="Tingkatan 4">Tingkatan 4</option>
                  <option value="Tingkatan 3">Tingkatan 3</option>
                  <option value="Tingkatan 2">Tingkatan 2</option>
                  <option value="Tingkatan 1">Tingkatan 1</option>
                  <option value="Peralihan">Kelas Peralihan</option>
                  <option value="Semua">Semua Tingkatan (Guru/Bertugas)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Penerangan / Masa / Catatan Slot</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Isnin - Jumaat (7:30 AM - 1:30 PM), Senarai subjek utama..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Muat Naik Fail Jadual (PDF / Imej)</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="form-control"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--sh-blue)', marginTop: '4px' }}>Memuat naik fail...</p>}
                {formFileUrl && formFileUrl !== '#' && (
                  <p style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '6px', fontWeight: 600 }}>
                    ✓ Fail berjaya dipilih/dimuat naik.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--sh-maroon)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                  disabled={uploading}
                >
                  Simpan Rekod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
