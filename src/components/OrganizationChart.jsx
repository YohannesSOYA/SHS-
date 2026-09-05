import React, { useState, useEffect } from 'react';
import { Users, User, Award, Shield, Plus, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function OrganizationChart({ isAdmin, token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orgForm, setOrgForm] = useState({ id: null, name: '', title: '', role: '', tier: 'pk', avatar_url: '', order_index: 0 });
  const [uploading, setUploading] = useState(false);
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
        setOrgForm(prev => ({ ...prev, avatar_url: data.url }));
      } else {
        alert(data.error || 'Gagal memuat naik gambar.');
      }
    } catch (err) {
      alert('Ralat semasa muat naik.');
    } finally {
      setUploading(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const pengetuaItems = items.filter(i => i.tier === 'pengetua');
  const pkItems = items.filter(i => i.tier === 'pk');
  const kbItems = items.filter(i => i.tier === 'kb');
  const otherItems = items.filter(i => i.tier === 'staf');

  const tierLabel = { pengetua: 'Tier 1 – Pengetua', pk: 'Tier 2 – Penolong Kanan', kb: 'Tier 3 – Ketua Bidang', staf: 'Tier 4 – Staf Sokongan' };

  return (
    <div className="page-wrapper">
      <div className="page-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Carta Organisasi Sekolah</h1>
          <p>Struktur pentadbiran dan pengurusan SMK Sacred Heart.</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => {
              setOrgForm({ id: null, name: '', title: '', role: '', tier: 'pk', avatar_url: '', order_index: 0 });
              setMsg(null);
              setShowForm(true);
            }}
          >
            <Plus size={16} /> Tambah Ahli Carta
          </button>
        )}
      </div>

      {/* Admin Add/Edit Form */}
      {isAdmin && showForm && (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--sh-red)',
          padding: '1.75rem',
          marginBottom: '2rem',
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Penuh Pegawai</label>
                <input className="form-control" value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} placeholder="Contoh: Cikgu Dayang Roziah" required />
              </div>
              <div className="form-group">
                <label className="form-label">Jawatan Carta</label>
                <input className="form-control" value={orgForm.title} onChange={e => setOrgForm({ ...orgForm, title: e.target.value })} placeholder="Contoh: PK Pentadbiran" required />
              </div>
              <div className="form-group">
                <label className="form-label">Hierarki (Tier)</label>
                <select className="form-control" value={orgForm.tier} onChange={e => setOrgForm({ ...orgForm, tier: e.target.value })}>
                  <option value="pengetua">Tier 1 – Pengetua</option>
                  <option value="pk">Tier 2 – Penolong Kanan (PK)</option>
                  <option value="kb">Tier 3 – Ketua Bidang (KB)</option>
                  <option value="staf">Tier 4 – Staf / AJK Sokongan</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bidang / Portfolio Tugas</label>
                <input className="form-control" value={orgForm.role} onChange={e => setOrgForm({ ...orgForm, role: e.target.value })} placeholder="Contoh: Akademik & Pentadbiran" />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Gambar Avatar (Upload dari peranti)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input type="file" accept="image/*" className="form-control" onChange={handleFileUpload} disabled={uploading} style={{ marginBottom: '8px' }} />
                    {uploading && <span style={{ fontSize: '0.8rem', color: 'var(--sh-blue)' }}>⏳ Memuat naik gambar...</span>}
                    <input type="text" className="form-control" value={orgForm.avatar_url} onChange={e => setOrgForm({ ...orgForm, avatar_url: e.target.value })} placeholder="Atau tampal URL gambar di sini..." style={{ marginTop: '8px' }} />
                  </div>
                  {orgForm.avatar_url && (
                    <img src={orgForm.avatar_url} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--sh-red)', flexShrink: 0 }} />
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                {orgForm.id ? '💾 Simpan Perubahan' : '➕ Tambah ke Carta Organisasi'}
              </button>
              {orgForm.id && (
                <button type="button" className="btn btn-ghost" onClick={() => { setOrgForm({ id: null, name: '', title: '', role: '', tier: 'pk', avatar_url: '', order_index: 0 }); }}>
                  Tambah Baru
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Chart Display */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '3rem 2rem',
        boxShadow: 'var(--shadow-sm)',
        overflowX: 'auto'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Memuatkan carta organisasi...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
            <p>Tiada ahli carta organisasi lagi.{isAdmin ? ' Klik "Tambah Ahli Carta" untuk mula.' : ''}</p>
          </div>
        ) : (
          <>
            {/* Tier 1: Pengetua */}
            {pengetuaItems.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
                {pengetuaItems.map(p => (
                  <OrgCard key={p.id} item={p} isAdmin={isAdmin} tier="pengetua" onEdit={handleEdit} onDelete={handleDelete} showConnector={pkItems.length > 0} />
                ))}
              </div>
            )}

            {/* Tier 2: PK */}
            {pkItems.length > 0 && (
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
                <div style={{ position: 'absolute', top: '-2px', left: '10%', right: '10%', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                {pkItems.map(pk => (
                  <OrgCard key={pk.id} item={pk} isAdmin={isAdmin} tier="pk" onEdit={handleEdit} onDelete={handleDelete} showConnector={kbItems.length > 0} />
                ))}
              </div>
            )}

            {/* Tier 3: KB */}
            {kbItems.length > 0 && (
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap', marginBottom: otherItems.length > 0 ? '3.5rem' : '0' }}>
                <div style={{ position: 'absolute', top: '-2px', left: '5%', right: '5%', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                {kbItems.map(kb => (
                  <OrgCard key={kb.id} item={kb} isAdmin={isAdmin} tier="kb" onEdit={handleEdit} onDelete={handleDelete} showConnector={false} />
                ))}
              </div>
            )}

            {/* Tier 4: Staf */}
            {otherItems.length > 0 && (
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {otherItems.map(st => (
                  <OrgCard key={st.id} item={st} isAdmin={isAdmin} tier="staf" onEdit={handleEdit} onDelete={handleDelete} showConnector={false} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrgCard({ item, isAdmin, tier, onEdit, onDelete, showConnector }) {
  const styles = {
    pengetua: {
      background: 'linear-gradient(135deg, var(--sh-maroon-dark), var(--sh-red))',
      color: 'white', border: 'none', minWidth: '260px', maxWidth: '320px', padding: '1.5rem',
      avatarBorder: '3px solid white', titleColor: 'var(--sh-yellow)', roleColor: 'rgba(255,255,255,0.85)'
    },
    pk: {
      background: 'var(--surface-light)', border: '2px solid var(--sh-blue)', minWidth: '200px', maxWidth: '240px', padding: '1.2rem',
      avatarBorder: '2px solid var(--sh-blue)', titleColor: 'var(--sh-blue)', roleColor: 'var(--text-muted)'
    },
    kb: {
      background: 'white', border: '1px solid var(--border-color)', minWidth: '175px', maxWidth: '210px', padding: '1rem',
      avatarBorder: '2px solid var(--sh-green)', titleColor: 'var(--sh-green)', roleColor: 'var(--text-muted)'
    },
    staf: {
      background: '#f8fafc', border: '1px dashed var(--border-color)', minWidth: '160px', maxWidth: '190px', padding: '0.8rem 1rem',
      avatarBorder: '2px solid #94a3b8', titleColor: 'var(--text-muted)', roleColor: 'var(--text-muted)'
    }
  };
  const s = styles[tier] || styles.staf;
  const avatarSize = tier === 'pengetua' ? 80 : tier === 'pk' ? 62 : 48;

  return (
    <div style={{
      background: s.background,
      border: s.border,
      padding: s.padding,
      borderRadius: 'var(--radius-lg)',
      textAlign: 'center',
      minWidth: s.minWidth,
      maxWidth: s.maxWidth,
      position: 'relative',
      zIndex: 1,
      boxShadow: 'var(--shadow-sm)',
      transition: 'transform 0.2s ease'
    }}>
      {/* Connector line above */}
      <div style={{
        position: 'absolute', top: '-1.75rem', left: '50%',
        width: '2px', height: '1.75rem',
        background: 'var(--border-color)', transform: 'translateX(-50%)'
      }}></div>

      {/* Avatar */}
      {item.avatar_url ? (
        <div style={{ width: `${avatarSize}px`, height: `${avatarSize}px`, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', border: s.avatarBorder, flexShrink: 0 }}>
          <img src={item.avatar_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
        </div>
      ) : (
        <div style={{
          width: `${avatarSize}px`, height: `${avatarSize}px`, borderRadius: '50%', margin: '0 auto 10px',
          background: tier === 'pengetua' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: tier === 'pengetua' ? 'var(--sh-yellow)' : '#94a3b8',
          border: s.avatarBorder
        }}>
          {tier === 'pengetua' ? <Award size={32} /> : <User size={22} />}
        </div>
      )}

      <h4 style={{ fontSize: tier === 'pengetua' ? '1.1rem' : '0.95rem', fontWeight: 800, color: tier === 'pengetua' ? 'white' : 'var(--text-heading)', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</h4>
      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: s.titleColor, marginBottom: '2px' }}>{item.title}</p>
      {item.role && <p style={{ fontSize: '0.78rem', color: s.roleColor }}>{item.role}</p>}

      {/* Admin controls */}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
          <button onClick={() => onEdit(item)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', color: tier === 'pengetua' ? 'white' : 'var(--text-main)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
            <Edit size={12} /> Edit
          </button>
          <button onClick={() => onDelete(item.id)} style={{ padding: '4px 10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', color: '#b91c1c', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trash2 size={12} /> Padam
          </button>
        </div>
      )}

      {/* Connector line below */}
      {showConnector && (
        <div style={{
          position: 'absolute', bottom: '-3.5rem', left: '50%',
          width: '2px', height: '3.5rem',
          background: 'var(--border-color)', transform: 'translateX(-50%)'
        }}></div>
      )}
    </div>
  );
}
