import React, { useState, useEffect } from 'react';
import { Users, User, Edit, Trash2, X, Plus, Camera, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function OrganizationChart({ isAdmin, token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orgForm, setOrgForm] = useState({ id: null, name: '', title: '', role: '', tier: 'pk', avatar_url: '', order_index: 0 });
  const [uploadingId, setUploadingId] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchOrgChart();
  }, []);

  const fetchOrgChart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/org-chart');
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error('Error fetching org chart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChart = async () => {
    if (!window.confirm('Set semula Carta Organisasi ke struktur asal 2025? (Semua susunan asal akan digantikan)')) return;
    try {
      const res = await fetch('/api/org-chart/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Carta Organisasi 2025 berjaya diset semula!');
        fetchOrgChart();
      }
    } catch (err) {
      alert('Ralat semasa set semula.');
    }
  };

  const handleFileUploadForCard = async (e, item) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingId(item.id);
    try {
      const body = new FormData();
      body.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const uploadData = await uploadRes.json();
      if (uploadRes.ok && uploadData.url) {
        const updatedItem = { ...item, avatar_url: uploadData.url };
        const updateRes = await fetch(`/api/org-chart/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(updatedItem)
        });
        if (updateRes.ok) {
          if (item.tier === 'pengetua') {
            await fetch('/api/school-info', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ principal_avatar: uploadData.url })
            });
          }
          fetchOrgChart();
        } else {
          alert('Gagal mengemaskini gambar ahli.');
        }
      } else {
        alert(uploadData.error || 'Gagal memuat naik gambar.');
      }
    } catch (err) {
      alert('Ralat semasa muat naik.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleFormFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingId('form');
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
        setOrgForm(prev => ({ ...prev, avatar_url: data.url }));
      } else {
        alert(data.error || 'Gagal memuat naik gambar.');
      }
    } catch (err) {
      alert('Ralat semasa muat naik.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const isEdit = Boolean(orgForm.id);
      const res = await fetch(isEdit ? `/api/org-chart/${orgForm.id}` : '/api/org-chart', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orgForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: data.message });
        setOrgForm({ id: null, name: '', title: '', role: '', tier: 'pk', avatar_url: '', order_index: 0 });
        setShowForm(false);
        fetchOrgChart();
      } else {
        setMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Ralat sambungan.' });
    }
  };

  const handleEdit = (item) => {
    setOrgForm(item);
    setShowForm(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Padam ahli ini dari Carta Organisasi?')) return;
    try {
      const res = await fetch(`/api/org-chart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchOrgChart();
    } catch (err) {
      console.error(err);
    }
  };

  // Group items by Tier
  const pengetuaItems = items.filter(i => i.tier === 'pengetua');
  const pkItems = items.filter(i => i.tier === 'pk');
  const gkItems = items.filter(i => i.tier === 'gk' || i.tier === 'kb');
  const penyelaras1Items = items.filter(i => i.tier === 'penyelaras1');
  const penyelaras2Items = items.filter(i => i.tier === 'penyelaras2' || i.tier === 'staf');

  return (
    <div className="page-wrapper" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Title Header */}
      <div className="page-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--sh-blue)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={32} color="var(--sh-red)" /> Carta Organisasi Sekolah
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b' }}>
            Struktur Pengurusan dan Pentadbiran SMK Sacred Heart Tahun 2025
          </p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleResetChart}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155' }}
            >
              <RefreshCw size={16} /> Reset 2025
            </button>
            <button
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--sh-red)' }}
              onClick={() => {
                setOrgForm({ id: null, name: '', title: '', role: '', tier: 'pk', avatar_url: '', order_index: 0 });
                setMsg(null);
                setShowForm(true);
              }}
            >
              <Plus size={16} /> Tambah Ahli
            </button>
          </div>
        )}
      </div>

      {/* Notice info */}
      <div style={{
        background: '#eff6ff',
        borderLeft: '4px solid var(--sh-blue)',
        padding: '1rem 1.25rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        color: '#1e40af',
        fontSize: '0.92rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <CheckCircle2 size={20} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          Carta ini disusun mengikut hirarki rasmi Pengurusan Sekolah 2025.
          {isAdmin ? ' Anda boleh klik ikon kamera "Muat Naik Gambar" pada mana-mana pegawai untuk meletakkan foto mereka.' : ' Foto pegawai boleh dimuat naik oleh Pentadbir.'}
        </div>
      </div>

      {/* Admin Add/Edit Form Modal */}
      {isAdmin && showForm && (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--sh-red)',
          padding: '1.75rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {orgForm.id ? <><Edit size={18} color="var(--sh-red)" /> Edit Ahli Carta Organisasi</> : <><Plus size={18} color="var(--sh-red)" /> Tambah Ahli Carta Organisasi</>}
            </h3>
            <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>

          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#15803d' : '#b91c1c', fontSize: '0.88rem' }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Penuh Pegawai</label>
                <input className="form-control" value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} placeholder="Contoh: Encik David Teo Wu" required />
              </div>
              <div className="form-group">
                <label className="form-label">Jawatan / Gelaran</label>
                <input className="form-control" value={orgForm.title} onChange={e => setOrgForm({ ...orgForm, title: e.target.value })} placeholder="Contoh: Pengetua" required />
              </div>
              <div className="form-group">
                <label className="form-label">Tingkat / Hirarki (Tier)</label>
                <select className="form-control" value={orgForm.tier} onChange={e => setOrgForm({ ...orgForm, tier: e.target.value })}>
                  <option value="pengetua">Tier 1 – Pengetua</option>
                  <option value="pk">Tier 2 – Penolong Kanan</option>
                  <option value="gk">Tier 3 – Guru Kanan</option>
                  <option value="penyelaras1">Tier 4 – Penyelaras Pentadbiran (Baris 1)</option>
                  <option value="penyelaras2">Tier 5 – Penyelaras Pentadbiran (Baris 2)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Muat Naik Gambar</label>
                <input type="file" accept="image/*" className="form-control" onChange={handleFormFileUpload} disabled={uploadingId === 'form'} />
                {uploadingId === 'form' && <span style={{ fontSize: '0.8rem', color: 'var(--sh-blue)' }}>⏳ Memuat naik...</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'var(--sh-blue)' }} disabled={uploadingId === 'form'}>
                {orgForm.id ? '💾 Simpan Perubahan' : '➕ Tambah Ahli'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MAIN ORGANIZATIONAL CHART CANVAS */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '2px solid #e2e8f0',
        padding: '2.5rem 1.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        overflowX: 'auto'
      }}>
        {/* Main Banner Header matching the spreadsheet image */}
        <div style={{
          background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
          color: '#000000',
          padding: '1.2rem',
          borderRadius: '10px',
          textAlign: 'center',
          fontWeight: 900,
          fontSize: '1.35rem',
          letterSpacing: '0.5px',
          boxShadow: '0 4px 12px rgba(202, 138, 4, 0.25)',
          marginBottom: '2.5rem',
          textTransform: 'uppercase',
          border: '2px solid #a16207'
        }}>
          JAWATANKUASA PENGURUSAN DAN PENTADBIRAN SEKOLAH TAHUN 2025
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={36} style={{ margin: '0 auto 1rem', color: 'var(--sh-blue)' }} />
            <p>Memuatkan Carta Organisasi Sekolah...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
            <p>Tiada data carta organisasi. Sila klik "Reset 2025" atau "Tambah Ahli".</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minWidth: '1150px' }}>
            
            {/* TIER 1: PENGETUA */}
            {pengetuaItems.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', position: 'relative', width: '100%' }}>
                {pengetuaItems.map(item => (
                  <OfficerCard
                    key={item.id}
                    item={item}
                    headerBg="#0ea5e9"
                    headerText="#ffffff"
                    cardBorder="#0284c7"
                    isAdmin={isAdmin}
                    uploadingId={uploadingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onFileUpload={handleFileUploadForCard}
                    isPengetua={true}
                  />
                ))}
              </div>
            )}

            {/* CONNECTOR LINE FROM PENGETUA TO PK */}
            <div style={{ width: '2px', height: '24px', background: '#94a3b8', marginTop: '-2.5rem', marginBottom: '1.5rem' }}></div>

            {/* TIER 2: PENOLONG-PENOLONG KANAN (4 Columns) */}
            {pkItems.length > 0 && (
              <div style={{ width: '100%', marginBottom: '3rem', position: 'relative' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '1.25rem',
                  position: 'relative'
                }}>
                  {pkItems.map(item => (
                    <OfficerCard
                      key={item.id}
                      item={item}
                      headerBg="#38bdf8"
                      headerText="#0f172a"
                      cardBorder="#0284c7"
                      isAdmin={isAdmin}
                      uploadingId={uploadingId}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onFileUpload={handleFileUploadForCard}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TIER 3: GURU KANAN (PINK SECTION) */}
            {gkItems.length > 0 && (
              <div style={{ width: '100%', marginBottom: '2.5rem' }}>
                <div style={{
                  background: '#ec4899',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.15rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px 6px 0 0',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  border: '1px solid #be185d',
                  borderBottom: 'none'
                }}>
                  Guru Kanan
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '1rem',
                  background: '#fdf2f8',
                  padding: '1.25rem',
                  borderRadius: '0 0 10px 10px',
                  border: '1px solid #fbcfe8'
                }}>
                  {gkItems.map(item => (
                    <OfficerCard
                      key={item.id}
                      item={item}
                      headerBg="#ffffff"
                      headerText="#1e293b"
                      cardBorder="#e2e8f0"
                      isAdmin={isAdmin}
                      uploadingId={uploadingId}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onFileUpload={handleFileUploadForCard}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TIER 4: PENYELARAS PENGURUSAN DAN PENTADBIRAN SEKOLAH (ROW 1 - 8 COLUMNS) */}
            {penyelaras1Items.length > 0 && (
              <div style={{ width: '100%', marginBottom: '2.5rem' }}>
                <div style={{
                  background: '#eab308',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px 6px 0 0',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  border: '1px solid #ca8a04',
                  borderBottom: 'none'
                }}>
                  Penyelaras Pengurusan dan Pentadbiran Sekolah
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '0.65rem',
                  background: '#fefce8',
                  padding: '1rem 0.75rem',
                  borderRadius: '0 0 10px 10px',
                  border: '1px solid #fef08a'
                }}>
                  {penyelaras1Items.map(item => (
                    <OfficerCard
                      key={item.id}
                      item={item}
                      headerBg="#ffffff"
                      headerText="#1e293b"
                      cardBorder="#e2e8f0"
                      isAdmin={isAdmin}
                      uploadingId={uploadingId}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onFileUpload={handleFileUploadForCard}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TIER 5: PENYELARAS PENGURUSAN DAN PENTADBIRAN SEKOLAH (ROW 2 - 13 COLUMNS) */}
            {penyelaras2Items.length > 0 && (
              <div style={{ width: '100%' }}>
                <div style={{
                  background: '#eab308',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px 6px 0 0',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  border: '1px solid #ca8a04',
                  borderBottom: 'none'
                }}>
                  Penyelaras Pengurusan dan Pentadbiran Sekolah
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(13, 1fr)',
                  gap: '0.4rem',
                  background: '#fefce8',
                  padding: '1rem 0.5rem',
                  borderRadius: '0 0 10px 10px',
                  border: '1px solid #fef08a'
                }}>
                  {penyelaras2Items.map(item => (
                    <OfficerCard
                      key={item.id}
                      item={item}
                      headerBg="#ffffff"
                      headerText="#1e293b"
                      cardBorder="#e2e8f0"
                      isAdmin={isAdmin}
                      uploadingId={uploadingId}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onFileUpload={handleFileUploadForCard}
                      compact={true}
                      ultraCompact={true}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// Individual Officer Card Component matching the spreadsheet layout
function OfficerCard({ item, headerBg, headerText, cardBorder, isAdmin, uploadingId, onEdit, onDelete, onFileUpload, isPengetua, compact, ultraCompact }) {
  const isUploading = uploadingId === item.id;

  return (
    <div style={{
      background: 'white',
      border: `1.5px solid ${cardBorder || '#cbd5e1'}`,
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: isPengetua ? '0 8px 20px rgba(0,0,0,0.12)' : '0 2px 6px rgba(0,0,0,0.05)',
      width: isPengetua ? '280px' : '100%',
      position: 'relative',
      transition: 'all 0.2s ease-in-out'
    }}>

      {/* Position Title (Jawatan) Header Box */}
      <div style={{
        background: headerBg,
        color: headerText,
        fontWeight: 800,
        fontSize: ultraCompact ? '0.72rem' : compact ? '0.78rem' : isPengetua ? '1rem' : '0.88rem',
        textAlign: 'center',
        padding: isPengetua ? '0.6rem 0.75rem' : ultraCompact ? '0.35rem 0.2rem' : '0.45rem 0.4rem',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        lineHeight: 1.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isPengetua ? '50px' : ultraCompact ? '46px' : '44px'
      }}>
        {item.title}
      </div>

      {/* Photo Frame Container */}
      <div style={{
        padding: ultraCompact ? '0.4rem 0.2rem' : '0.6rem 0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
        position: 'relative'
      }}>
        {/* Photo Box */}
        <div style={{
          width: isPengetua ? '120px' : compact ? '65px' : ultraCompact ? '55px' : '90px',
          height: isPengetua ? '145px' : compact ? '80px' : ultraCompact ? '68px' : '110px',
          borderRadius: '4px',
          border: '1.5px solid #cbd5e1',
          background: '#ffffff',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {item.avatar_url ? (
            <img
              src={item.avatar_url}
              alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4px' }}>
              <User size={isPengetua ? 36 : ultraCompact ? 20 : 26} style={{ margin: '0 auto 2px' }} />
              <span style={{ fontSize: ultraCompact ? '0.55rem' : '0.65rem', display: 'block', fontWeight: 600 }}>Ruang Gambar</span>
            </div>
          )}

          {/* Admin Image Upload Overlay */}
          {isAdmin && (
            <label style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.55)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              opacity: isUploading ? 1 : 0,
              transition: 'opacity 0.2s ease',
              fontSize: ultraCompact ? '0.55rem' : '0.65rem',
              fontWeight: 700,
              textAlign: 'center',
              padding: '2px'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = isUploading ? 1 : 0}
            >
              {isUploading ? (
                <span>⏳ Muat naik...</span>
              ) : (
                <>
                  <Camera size={ultraCompact ? 14 : 18} />
                  <span>{item.avatar_url ? 'Tukar' : '+ Gambar'}</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => onFileUpload(e, item)}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Name Footer Box */}
        <div style={{
          marginTop: '0.4rem',
          width: '100%',
          textAlign: 'center',
          padding: ultraCompact ? '0.2rem 0.1rem' : '0.3rem 0.25rem',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{
            fontWeight: 800,
            fontSize: ultraCompact ? '0.68rem' : compact ? '0.75rem' : isPengetua ? '0.95rem' : '0.82rem',
            color: '#0f172a',
            lineHeight: 1.25,
            wordBreak: 'break-word'
          }}>
            {item.name}
          </div>
        </div>

        {/* Admin Action Buttons */}
        {isAdmin && (
          <div style={{
            display: 'flex',
            gap: '4px',
            marginTop: '4px',
            justifyContent: 'center',
            width: '100%'
          }}>
            <button
              onClick={() => onEdit(item)}
              title="Edit Nama/Jawatan"
              style={{
                padding: '2px 5px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.65rem',
                color: '#334155'
              }}
            >
              <Edit size={10} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              title="Padam Ahli"
              style={{
                padding: '2px 5px',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.65rem',
                color: '#b91c1c'
              }}
            >
              <Trash2 size={10} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
