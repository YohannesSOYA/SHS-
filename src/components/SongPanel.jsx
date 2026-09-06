import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Upload, Trash2, Plus, X, AlertCircle, CheckCircle, Video, HardDrive, Volume2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function SongPanel({ isAdmin, token }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSong, setActiveSong] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  // Add form state
  const [addType, setAddType] = useState('gdrive'); // 'upload' | 'gdrive' | 'youtube'
  const [addTitle, setAddTitle] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addDriveId, setAddDriveId] = useState('');
  const [addYtUrl, setAddYtUrl] = useState('');
  const [addFile, setAddFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/songs');
      const data = await res.json();
      setSongs(Array.isArray(data) ? data : []);
      if (data.length > 0 && !activeSong) setActiveSong(data[0]);
    } catch {
      setSongs([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSongs(); }, []);

  const handleDeleteClick = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ open: false, id: null });
    setDeleting(id);
    const authToken = token || localStorage.getItem('smk_token');
    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        showToast('Lagu berjaya dipadam.');
        if (activeSong?.id === id) setActiveSong(null);
        fetchSongs();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || 'Gagal memadam.', 'error');
      }
    } catch {
      showToast('Ralat sambungan.', 'error');
    }
    setDeleting(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addTitle.trim()) { showToast('Sila isi tajuk lagu.', 'error'); return; }

    // Validate inputs before sending
    if (addType === 'gdrive' && !addDriveId.trim()) {
      showToast('Sila masukkan Google Drive link atau ID.', 'error'); return;
    }
    if (addType === 'youtube' && !addYtUrl.trim()) {
      showToast('Sila masukkan URL YouTube.', 'error'); return;
    }
    if (addType === 'upload' && !addFile) {
      showToast('Sila pilih fail audio/video untuk dimuat naik.', 'error'); return;
    }
    if (!token) {
      showToast('Token log masuk tidak dijumpai. Sila log masuk semula.', 'error'); return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', addTitle.trim());
      formData.append('description', addDesc.trim());
      if (addType === 'upload' && addFile) {
        formData.append('file', addFile);
      } else if (addType === 'gdrive') {
        let driveId = addDriveId.trim();
        const match = driveId.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) driveId = match[1];
        formData.append('drive_id', driveId);
      } else if (addType === 'youtube') {
        formData.append('youtube_url', addYtUrl.trim());
      }

      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      let data = {};
      try { data = await res.json(); } catch {}

      if (res.ok) {
        showToast('Lagu berjaya ditambah!');
        setShowAddModal(false);
        resetForm();
        fetchSongs();
      } else {
        showToast(data.error || `Server error ${res.status}`, 'error');
      }
    } catch (err) {
      console.error('Add song error:', err);
      showToast('Gagal sambung ke server. Pastikan server berjalan di port 5000.', 'error');
    }
    setUploading(false);
  };

  const resetForm = () => {
    setAddTitle(''); setAddDesc(''); setAddDriveId('');
    setAddYtUrl(''); setAddFile(null); setAddType('gdrive');
    if (fileRef.current) fileRef.current.value = '';
  };

  // Build embed URL for player
  const getEmbedUrl = (song) => {
    if (!song) return null;
    if (song.type === 'gdrive') {
      return `https://drive.google.com/file/d/${song.file_url}/preview`;
    }
    if (song.type === 'youtube') {
      let id = song.file_url;
      const m = id.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (m) id = m[1];
      return `https://www.youtube.com/embed/${id}?autoplay=0`;
    }
    return null; // 'upload' — uses <audio> tag directly
  };

  const typeIcon = (type) => {
    if (type === 'gdrive') return <HardDrive size={14} color="#4285f4" />;
    if (type === 'youtube') return <Video size={14} color="#ff0000" />;
    return <Volume2 size={14} color="var(--sh-maroon)" />;
  };

  const typeLabel = (type) => {
    if (type === 'gdrive') return 'Google Drive';
    if (type === 'youtube') return 'YouTube';
    return 'Fail Upload';
  };

  return (
    <div className="page-wrapper">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px', zIndex: 9999,
          background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: toast.type === 'error' ? '#991b1b' : '#166534',
          padding: '12px 20px', borderRadius: '12px', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--sh-maroon-dark) 0%, #7b1c1c 50%, #5a0a0a 100%)',
        borderRadius: '20px',
        padding: '2.5rem',
        color: 'white',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(123, 28, 28, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* decorative music notes */}
        <div style={{ position: 'absolute', right: '2rem', top: '1rem', opacity: 0.08, fontSize: '8rem', userSelect: 'none' }}>♪</div>
        <div style={{ position: 'absolute', right: '6rem', bottom: '0.5rem', opacity: 0.06, fontSize: '6rem', userSelect: 'none' }}>♫</div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,242,0,0.2)', border: '1px solid rgba(255,242,0,0.35)', color: 'var(--sh-yellow)', padding: '5px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
          <Music size={14} /> LAGU & VIDEO RASMI SEKOLAH
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, fontFamily: "'Outfit', sans-serif", margin: '0 0 0.5rem 0' }}>
          🎵 Lagu & Video <span style={{ color: 'var(--sh-yellow)' }}>SMK Sacred Heart</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
          Koleksi lagu dan video rasmi sekolah. Sesiapa boleh menonton dan mendengar. Admin boleh tambah atau padam lagu & video.
        </p>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              marginTop: '1.5rem',
              background: 'var(--sh-yellow)',
              color: 'var(--sh-maroon-dark)',
              border: 'none',
              padding: '11px 22px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(232,182,84,0.3)'
            }}
          >
            <Plus size={18} /> Tambah Lagu / Video Baru
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeSong ? 'minmax(0,1fr) 320px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Main Player */}
        {activeSong && (
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e4e8f0', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            {/* Player header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              padding: '1.5rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(255,242,0,0.15)',
                border: '2px solid var(--sh-yellow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Music size={24} color="var(--sh-yellow)" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                  {activeSong.title}
                </h2>
                {activeSong.description && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    {activeSong.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  {typeIcon(activeSong.type)}
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{typeLabel(activeSong.type)}</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>•</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{activeSong.date_uploaded}</span>
                </div>
              </div>
            </div>

            {/* Player body */}
            <div style={{ padding: '0', background: '#0a0a0a', minHeight: '300px' }}>
              {(activeSong.type === 'gdrive' || activeSong.type === 'youtube') && (
                <iframe
                  src={getEmbedUrl(activeSong)}
                  width="100%"
                  height="380"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  style={{ display: 'block', border: 'none' }}
                  title={activeSong.title}
                />
              )}
              {activeSong.type === 'upload' && (
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'rgba(255,242,0,0.1)',
                    border: '3px solid var(--sh-yellow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Music size={42} color="var(--sh-yellow)" />
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{activeSong.title}</p>
                  <audio
                    controls
                    src={activeSong.file_url}
                    style={{ width: '100%', maxWidth: '400px', marginTop: '1rem' }}
                  >
                    Browser anda tidak menyokong audio player.
                  </audio>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Song List */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e4e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Music size={18} color="var(--sh-maroon)" /> Senarai Lagu &amp; Video
            </h3>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  background: 'var(--sh-maroon)', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '7px 14px', fontWeight: 700,
                  fontSize: '0.8rem', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '5px'
                }}
              >
                <Plus size={15} /> Tambah
              </button>
            )}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Memuatkan...</div>
          )}

          {!loading && songs.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', fontSize: '0.9rem' }}>
              Tiada lagu tersedia.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {songs.map(song => (
              <div
                key={song.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: `2px solid ${activeSong?.id === song.id ? 'var(--sh-maroon)' : '#e4e8f0'}`,
                  background: activeSong?.id === song.id ? 'rgba(123,28,28,0.04)' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onClick={() => setActiveSong(song)}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: activeSong?.id === song.id ? 'var(--sh-maroon)' : '#e4e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {activeSong?.id === song.id
                    ? <Play size={16} color="white" fill="white" />
                    : <Music size={16} color="#94a3b8" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {song.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    {typeIcon(song.type)}
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{typeLabel(song.type)}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(song.id); }}
                    disabled={deleting === song.id}
                    style={{
                      background: '#fee2e2', color: '#991b1b', border: 'none',
                      borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', opacity: deleting === song.id ? 0.6 : 1
                    }}
                    title="Padam lagu"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Song Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '2rem',
            width: '100%', maxWidth: '520px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#1e293b' }}>
                🎵 Tambah Lagu / Video Baru
              </h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: '6px' }}>
                  Tajuk Lagu / Video *
                </label>
                <input
                  type="text"
                  value={addTitle}
                  onChange={e => setAddTitle(e.target.value)}
                  placeholder="Contoh: Lagu Sekolah SMK Sacred Heart / Video Majlis 2025"
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e4e8f0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: '6px' }}>
                  Penerangan (pilihan)
                </label>
                <input
                  type="text"
                  value={addDesc}
                  onChange={e => setAddDesc(e.target.value)}
                  placeholder="Penerangan ringkas..."
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e4e8f0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Type Selector */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: '8px' }}>
                  Jenis Sumber Lagu / Video *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                  { id: 'gdrive', label: 'Google Drive', icon: <HardDrive size={16} /> },
                    { id: 'youtube', label: 'YouTube', icon: <Video size={16} /> },
                    { id: 'upload', label: 'Muat Naik Fail', icon: <Upload size={16} /> },
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setAddType(t.id)}
                      style={{
                        flex: 1, padding: '10px 8px', border: `2px solid ${addType === t.id ? 'var(--sh-maroon)' : '#e4e8f0'}`,
                        borderRadius: '10px', background: addType === t.id ? 'rgba(123,28,28,0.07)' : '#f8fafc',
                        color: addType === t.id ? 'var(--sh-maroon)' : '#64748b',
                        fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                      }}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional input */}
              {addType === 'gdrive' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: '6px' }}>
                    Google Drive Link atau File ID *
                  </label>
                  <input
                    type="text"
                    value={addDriveId}
                    onChange={e => setAddDriveId(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... atau ID sahaja"
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e4e8f0', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                    Pastikan fail Google Drive disetel kepada "Anyone with the link can view".
                  </p>
                </div>
              )}

              {addType === 'youtube' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: '6px' }}>
                    URL YouTube *
                  </label>
                  <input
                    type="text"
                    value={addYtUrl}
                    onChange={e => setAddYtUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e4e8f0', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {addType === 'upload' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#374151', marginBottom: '6px' }}>
                    Fail Audio/Video *
                  </label>
                  <input
                    type="file"
                    ref={fileRef}
                    accept="audio/*,video/*"
                    onChange={e => setAddFile(e.target.files[0])}
                    style={{ width: '100%', padding: '10px', border: '2px dashed #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', cursor: 'pointer', boxSizing: 'border-box' }}
                  />
                  {addFile && (
                    <p style={{ fontSize: '0.82rem', color: '#22c55e', marginTop: '4px', fontWeight: 600 }}>
                      ✓ {addFile.name}
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  style={{ flex: 1, padding: '12px', border: '2px solid #e4e8f0', borderRadius: '12px', background: 'white', fontWeight: 700, cursor: 'pointer', color: '#374151' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    flex: 2, padding: '12px', border: 'none', borderRadius: '12px',
                    background: uploading ? '#e4e8f0' : 'var(--sh-maroon)',
                    color: uploading ? '#94a3b8' : 'white', fontWeight: 800, cursor: uploading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {uploading ? 'Memuat naik...' : <><Plus size={18} /> Simpan Lagu</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title="Padam Lagu Sekolah"
        message="Adakah anda pasti mahu memadam lagu ini? Tindakan ini tidak boleh dibatalkan."
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  );
}
