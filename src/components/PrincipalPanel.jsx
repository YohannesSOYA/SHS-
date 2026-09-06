import React, { useState, useEffect } from 'react';
import { Award, FileText, Download, Plus, Trash2, Edit3, Sparkles, MessageSquare, FolderCheck, User, Camera } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function PrincipalPanel({ isAdmin, token }) {
  const [principalInfo, setPrincipalInfo] = useState({
    name: 'Encik David Teo Wu',
    title: 'Pengetua Cemerlang SMK Sacred Heart',
    quote: '"Pendidikan Berkualiti, Insan Terdidik, Negara Sejahtera."',
    avatar_url: '',
    message: `Assalamu'alaikum Warahmatullahi Wabarakatuh dan Salam Sejahtera,

Selamat datang ke Portal Rasmi SMK Sacred Heart & Sistem E-Filing Direktori SPMS.

Sebagai pengetua, saya amat berbangga dengan komitmen dan dedikasi seluruh warga sekolah—daripada barisan guru, Anggota Kumpulan Pelaksana (AKP), pelajar, mahupun Persatuan Ibu Bapa dan Guru (PIBG). Era digital menuntut kita untuk sentiasa berinovasi dalam pengurusan maklumat dan penyampaian perkhidmatan pendidikan.

Dengan terbinanya Portal SPMS ini, kita dapat memperkasa tadbir urus digital, memudahkan capaian fail pengurusan, serta memastikan maklumat sekolah disampaikan secara telus dan pantas kepada semua pihak.

Mari kita bersama-sama menggembleng tenaga demi merealisasikan visi SMK Sacred Heart ke arah kecemerlangan akademik, kokurikulum, dan pembentukan sahsiah pelajar yang holistik.

"Sacred Heart Fly High!"`,
    visi: 'Pendidikan Berkualiti Insan Terdidik Negara Sejahtera',
    misi: 'Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara'
  });

  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Principal Documents state
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Ucapan Perasmian',
    customCategory: '',
    file_url: '',
    file_type: 'pdf',
    notes: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...principalInfo });
  const [newNotice, setNewNotice] = useState({ title: '', tag: 'Amanat Rasmi', content: '' });
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: null, title: '' });

  const getAuthToken = () => token || localStorage.getItem('smk_token') || '';

  useEffect(() => {
    // 1. Fetch principal info from backend
    fetch('/api/school-info')
      .then(res => res.json())
      .then(data => {
        if (data.principal_name || data.principal) {
          setPrincipalInfo(prev => ({
            ...prev,
            name: data.principal_name || data.principal || prev.name,
            title: data.principal_title || prev.title,
            quote: data.principal_quote || prev.quote,
            avatar_url: data.principal_avatar || prev.avatar_url,
            message: data.principal_message || prev.message
          }));
        }
      })
      .catch(() => {});

    // 2. Sync photo from org-chart Pengetua row
    fetch('/api/org-chart')
      .then(res => res.json())
      .then(items => {
        const pengetua = items.find(i => i.tier === 'pengetua');
        if (pengetua && pengetua.avatar_url) {
          setPrincipalInfo(prev => ({
            ...prev,
            avatar_url: pengetua.avatar_url
          }));
        }
      })
      .catch(() => {});

    // 3. Fetch principal documents from backend
    fetchPrincipalDocuments();

    // 4. Fetch principal notices from backend
    fetchPrincipalNotices();
  }, []);

  const fetchPrincipalDocuments = async () => {
    setDocLoading(true);
    try {
      const res = await fetch('/api/principal-documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Ralat mengambil dokumen pengetua:', err);
    } finally {
      setDocLoading(false);
    }
  };

  const fetchPrincipalNotices = async () => {
    setNoticesLoading(true);
    try {
      const res = await fetch('/api/principal-notices');
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (err) {
      console.error('Ralat mengambil amanat pengetua:', err);
    } finally {
      setNoticesLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const authToken = getAuthToken();
    if (!authToken) {
      alert('Sila log masuk semula sebagai Admin.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const newUrl = data.url;
        setPrincipalInfo(prev => ({ ...prev, avatar_url: newUrl }));

        // 1. Save to school-info
        await fetch('/api/school-info', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ principal_avatar: newUrl })
        });

        // 2. Sync to org-chart Pengetua row
        const orgRes = await fetch('/api/org-chart');
        if (orgRes.ok) {
          const orgItems = await orgRes.json();
          const pengetua = orgItems.find(i => i.tier === 'pengetua');
          if (pengetua) {
            await fetch(`/api/org-chart/${pengetua.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
              body: JSON.stringify({ ...pengetua, avatar_url: newUrl })
            });
          }
        }
        alert('Gambar Pengetua berjaya dikemaskini!');
      } else {
        alert(data.error || 'Gagal memuat naik gambar. Sila log masuk semula.');
      }
    } catch (err) {
      alert('Ralat semasa muat naik gambar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const authToken = getAuthToken();
    if (!authToken) {
      alert('Sila log masuk semula sebagai Admin.');
      return;
    }

    setUploadingFile(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const ext = file.name.split('.').pop().toLowerCase();
        setDocForm(prev => ({ ...prev, file_url: data.url, file_type: ext }));
      } else {
        alert(data.error || 'Gagal memuat naik fail.');
      }
    } catch (err) {
      alert('Ralat semasa muat naik fail.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docForm.title || !docForm.file_url) {
      alert('Sila lengkapkan tajuk dan fail dokumen.');
      return;
    }

    const authToken = getAuthToken();
    if (!authToken) {
      alert('Sila log masuk semula sebagai Admin.');
      return;
    }

    const finalCategory = docForm.category === 'Lain-lain' ? (docForm.customCategory.trim() || 'Lain-lain') : docForm.category;

    try {
      const res = await fetch('/api/principal-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: docForm.title,
          category: finalCategory,
          file_url: docForm.file_url,
          file_type: docForm.file_type,
          notes: docForm.notes
        })
      });

      if (res.ok) {
        setShowDocModal(false);
        setDocForm({ title: '', category: 'Ucapan Perasmian', customCategory: '', file_url: '', file_type: 'pdf', notes: '' });
        fetchPrincipalDocuments();
        alert('Fail dokumen pengetua berjaya dimuat naik!');
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal memuat naik dokumen. Sila log masuk semula.');
      }
    } catch (err) {
      alert('Ralat sambungan pelayan.');
    }
  };

  const handleDeleteDocument = (id, title) => {
    setConfirmModal({ open: true, type: 'doc', id, title });
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    const authToken = getAuthToken();
    if (!authToken) {
      alert('Sila log masuk semula sebagai Admin.');
      return;
    }

    setPrincipalInfo(editForm);
    setIsEditing(false);

    try {
      await fetch('/api/school-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          principal_name: editForm.name,
          principal_title: editForm.title,
          principal_quote: editForm.quote,
          principal_message: editForm.message
        })
      });
      alert('Perutusan Pengetua berjaya dikemaskini!');
    } catch (err) {
      alert('Ralat menyimpan maklumat.');
    }
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) {
      alert('Sila lengkapkan tajuk dan kandungan amanat.');
      return;
    }

    const authToken = getAuthToken();
    if (!authToken) {
      alert('Sila log masuk semula sebagai Admin.');
      return;
    }

    try {
      const res = await fetch('/api/principal-notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(newNotice)
      });
      if (res.ok) {
        setNewNotice({ title: '', tag: 'Amanat Rasmi', content: '' });
        setShowAddNotice(false);
        fetchPrincipalNotices();
        alert('Amanat berjaya diterbitkan!');
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menerbitkan amanat. Sila log masuk semula sebagai Admin.');
      }
    } catch (err) {
      alert('Ralat semasa menerbitkan amanat.');
    }
  };

  const handleDeleteNotice = (id, title) => {
    setConfirmModal({ open: true, type: 'notice', id, title });
  };

  const confirmDeleteAction = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ open: false, type: '', id: null, title: '' });
    const authToken = getAuthToken();
    if (!authToken) {
      alert('Sila log masuk semula sebagai Admin.');
      return;
    }

    if (type === 'doc') {
      try {
        const res = await fetch(`/api/principal-documents/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (res.ok) fetchPrincipalDocuments();
      } catch (err) {
        alert('Gagal memadam dokumen.');
      }
    } else if (type === 'notice') {
      try {
        const res = await fetch(`/api/principal-notices/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (res.ok) fetchPrincipalNotices();
      } catch (err) {
        alert('Gagal memadam amanat.');
      }
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--sh-maroon-dark) 0%, var(--sh-maroon) 60%, var(--sh-red) 100%)',
        color: 'white',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        boxShadow: '0 12px 30px rgba(123, 28, 28, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,242,0,0.2)', color: 'var(--sh-yellow)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px' }}>
              <Award size={14} /> PANEL KHAS PENGETUA & PENTADBIRAN
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'white' }}>
              Panel & Dokumen Pengetua
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', marginTop: '4px', maxWidth: '650px' }}>
              Pusat muat naik dokumen ucapan perasmian, perutusan rasmi, dan hala tuju pentadbiran Pengetua Cemerlang SMK Sacred Heart.
            </p>
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-warning"
                onClick={() => setShowDocModal(true)}
                style={{ background: 'var(--sh-yellow)', color: 'var(--sh-maroon-dark)', fontWeight: 700 }}
              >
                <Plus size={16} /> Muat Naik Fail Dokumen
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => { setEditForm(principalInfo); setIsEditing(!isEditing); }}
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}
              >
                <Edit3 size={16} /> {isEditing ? 'Batal Edit' : 'Edit Perutusan'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column: Pengetua Profile & Strategic Goals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Profile Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e4e8f0', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ position: 'relative', width: '135px', height: '135px', margin: '0 auto 1.25rem' }}>
              {principalInfo.avatar_url ? (
                <img
                  src={principalInfo.avatar_url}
                  alt="Pengetua"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '4px solid var(--sh-yellow)', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: '4px dashed #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8'
                }}>
                  <User size={48} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: '2px' }}>Ruang Gambar</span>
                </div>
              )}

              {/* Admin Camera Overlay */}
              {isAdmin && (
                <label style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.65)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: uploadingAvatar ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  zIndex: 3
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = uploadingAvatar ? 1 : 0}
                >
                  {uploadingAvatar ? (
                    <span>⏳ Muat naik...</span>
                  ) : (
                    <>
                      <Camera size={22} />
                      <span>{principalInfo.avatar_url ? 'Tukar' : '+ Gambar'}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    style={{ display: 'none' }}
                  />
                </label>
              )}

              <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--sh-red)', color: 'white', padding: '6px', borderRadius: '50%', border: '2px solid white', zIndex: 2 }}>
                <Award size={16} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px' }}>{principalInfo.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--sh-blue)', fontWeight: 700, marginBottom: '12px' }}>{principalInfo.title}</p>
            
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', fontSize: '0.82rem', color: '#475569', fontStyle: 'italic', borderLeft: '4px solid var(--sh-yellow)' }}>
              {principalInfo.quote}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e4e8f0' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderCheck size={18} color="var(--sh-maroon)" /> Status Dokumen Pengetua
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1d4ed8' }}>{documents.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>Fail Dimuat Naik</div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d' }}>{notices.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Amanat Aktif</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Principal Documents & Perutusan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* SECTION: Fail & Dokumen Khas Pengetua (Ucapan Perasmian, Amanat, etc.) */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e4e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={22} color="var(--sh-maroon)" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Fail & Dokumen Ucapan Pengetua</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Teks ucapan perasmian, amanat rasmi, dan fail rujukan pengetua.</span>
                </div>
              </div>

              {isAdmin && (
                <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => setShowDocModal(true)}>
                  <Plus size={14} /> Muat Naik Fail
                </button>
              )}
            </div>

            {/* Documents List */}
            {docLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>Memuatkan fail dokumen...</p>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ color: '#475569', fontWeight: 700, marginBottom: '4px' }}>Tiada Fail Dokumen Pengetua Dimuat Naik</p>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                  {isAdmin ? 'Klik butang \'Muat Naik Fail\' untuk menambah teks ucapan perasmian atau dokumen pengetua.' : 'Fail dokumen pengetua belum dimuat naik.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                            {doc.category}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {doc.date_uploaded}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.title}
                        </div>
                        {doc.notes && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                            {doc.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Download size={13} /> Buka / Muat Turun
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id, doc.title)}
                          style={{ padding: '6px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          title="Padam Dokumen"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Form / Display Perutusan */}
          {isAdmin && isEditing ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '2px solid var(--sh-yellow)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '1rem' }}>
                ✏️ Edit Perutusan Pengetua
              </h3>

              <form onSubmit={handleSaveInfo}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">Nama Pengetua</label>
                    <input type="text" className="form-control" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="form-label">Gelaran / Jawatan</label>
                    <input type="text" className="form-control" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Motto / Kata-kata Mutiara</label>
                  <input type="text" className="form-control" value={editForm.quote} onChange={e => setEditForm({ ...editForm, quote: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Teks Perutusan Penuh</label>
                  <textarea className="form-control" rows="8" value={editForm.message} onChange={e => setEditForm({ ...editForm, message: e.target.value })} required />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan Perutusan</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>Batal</button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e4e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquare size={22} color="var(--sh-maroon)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Perutusan Pengetua</h3>
                </div>
                {isAdmin && (
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                    onClick={() => { setEditForm(principalInfo); setIsEditing(true); }}
                  >
                    <Edit3 size={14} /> Edit Perutusan
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-line' }}>
                {principalInfo.message}
              </div>
            </div>
          )}

          {/* Notices & Directives from Pengetua */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e4e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--sh-yellow)" /> Amanat & Arahan Pentadbiran Terkini
              </h3>

              {isAdmin && (
                <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => setShowAddNotice(!showAddNotice)}>
                  + Tambah Amanat
                </button>
              )}
            </div>

            {isAdmin && showAddNotice && (
              <form onSubmit={handleAddNotice} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input type="text" className="form-control" placeholder="Tajuk Notis Amanat..." value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} required />
                  <input type="text" className="form-control" placeholder="Tag (Contoh: Akademik)" value={newNotice.tag} onChange={e => setNewNotice({ ...newNotice, tag: e.target.value })} required />
                </div>
                <textarea className="form-control" rows="2" placeholder="Kandungan arahan pengetua..." value={newNotice.content} onChange={e => setNewNotice({ ...newNotice, content: e.target.value })} required style={{ marginBottom: '10px' }}></textarea>
                <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Terbitkan Notis</button>
              </form>
            )}

            {noticesLoading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem 0' }}>Memuatkan amanat pengetua...</p>
            ) : notices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
                Tiada amanat diterbitkan lagi.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notices.map(n => (
                  <div key={n.id} style={{ padding: '14px 16px', borderRadius: '12px', background: '#fafafa', border: '1px solid #f1f5f9', borderLeft: '4px solid var(--sh-maroon)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px' }}>{n.tag}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{n.date}</span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteNotice(n.id, n.title)}
                            style={{
                              padding: '4px 6px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Padam Amanat"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{n.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODAL: Upload Principal Document */}
      {isAdmin && showDocModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>📄 Muat Naik Dokumen / Ucapan Pengetua</h3>
              <button className="btn-close" onClick={() => setShowDocModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddDocument}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tajuk Dokumen / Fail *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Teks Ucapan Perasmian Kejohanan Sukan 2026"
                    value={docForm.title}
                    onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori Dokumen</label>
                  <select
                    className="form-control"
                    value={docForm.category}
                    onChange={e => setDocForm({ ...docForm, category: e.target.value })}
                  >
                    <option value="Ucapan Perasmian">Teks Ucapan Perasmian</option>
                    <option value="Amanat Pentadbiran">Amanat Pentadbiran</option>
                    <option value="Kertas Kerja">Kertas Kerja & Cadangan</option>
                    <option value="Laporan Pengetua">Laporan Khas Pengetua</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                  {docForm.category === 'Lain-lain' && (
                    <input
                      type="text"
                      className="form-control"
                      style={{ marginTop: '8px' }}
                      placeholder="Masukkan nama kategori dokumen baharu..."
                      value={docForm.customCategory}
                      onChange={e => setDocForm({ ...docForm, customCategory: e.target.value })}
                      required
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Muat Naik Fail Dokumen (PDF, Word, Images)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    style={{ marginBottom: '8px' }}
                  />
                  {uploadingFile && <p style={{ fontSize: '0.8rem', color: 'var(--sh-blue)' }}>Memuat naik fail...</p>}
                  
                  <label className="form-label" style={{ marginTop: '4px', fontSize: '0.78rem' }}>Atau Tampal Pautan / Link Fail</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://drive.google.com/... atau /uploads/..."
                    value={docForm.file_url}
                    onChange={e => setDocForm({ ...docForm, file_url: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Tambahan (Pilihan)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Catatan seperti majlis perasmian, tarikh program..."
                    value={docForm.notes}
                    onChange={e => setDocForm({ ...docForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowDocModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={uploadingFile || !docForm.file_url}>
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmModal.open}
        title={confirmModal.type === 'doc' ? "Padam Dokumen Pengetua" : "Padam Amanat Rasmi"}
        message={`Adakah anda pasti mahu memadam "${confirmModal.title}"? Tindakan ini tidak boleh dibatalkan.`}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmModal({ open: false, type: '', id: null, title: '' })}
      />
    </div>
  );
}
