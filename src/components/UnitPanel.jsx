import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Users, FileText, Download, Plus, Trash2, Edit, Sparkles, Folder, Search, ArrowRight, X, Image as ImageIcon, ExternalLink, ZoomIn } from 'lucide-react';

const defaultUnitConfigs = {
  kurikulum: {
    id: 'kurikulum',
    title: 'Kurikulum & Akademik',
    emoji: '📚',
    color: '#0284c7',
    bgColor: 'linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #38bdf8 100%)',
    desc: 'Pengurusan panitia mata pelajaran, jadual pentaksiran & peperiksaan, serta direktori fail e-Filing akademik murid.',
    categoryName: 'Kurikulum',
    stats: [
      { label: 'Panitia Mata Pelajaran', val: '14 Panitia' },
      { label: 'Sasaran GPS SPM', val: '4.20' },
      { label: 'Direktori e-Filing Unit', val: 'Kurikulum & SPM' }
    ]
  },
  kokurikulum: {
    id: 'kokurikulum',
    title: 'Kokurikulum & Sukan',
    emoji: '🏅',
    color: '#15803d',
    bgColor: 'linear-gradient(135deg, #166534 0%, #15803d 60%, #4ade80 100%)',
    desc: 'Pengurusan kelab & persatuan, unit beruniform, pasukan sukan permainan, dan direktori fail e-Filing kokurikulum.',
    categoryName: 'Kokurikulum',
    stats: [
      { label: 'Kelab & Persatuan', val: '18 Kelab' },
      { label: 'Unit Beruniform', val: '6 Unit' },
      { label: 'Pasukan Sukan', val: '8 Pasukan' }
    ]
  },
  hem: {
    id: 'hem',
    title: 'Hal Ehwal Murid (HEM)',
    emoji: '🤝',
    color: '#b45309',
    bgColor: 'linear-gradient(135deg, #78350f 0%, #b45309 60%, #facc15 100%)',
    desc: 'Pengurusan kebajikan pelajar, biasiswa & bantuan RMT, disiplin murid, bimbingan kaunseling, serta direktori fail e-Filing HEM.',
    categoryName: 'HEM',
    stats: [
      { label: 'Sasaran Kehadiran', val: '95.5%' },
      { label: 'Penerima Bantuan BAP/RMT', val: '320 Murid' },
      { label: 'Program Sahsiah', val: 'Aktif Bulanan' }
    ]
  },
  pentadbiran: {
    id: 'pentadbiran',
    title: 'Pentadbiran Sekolah',
    emoji: '🏫',
    color: '#b91c1c',
    bgColor: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 60%, #ef4444 100%)',
    desc: 'Pengurusan pentadbiran tertinggi sekolah, takwim rasmi, dasar pekeliling perkhidmatan, serta direktori fail e-Filing Pentadbiran & SPMS.',
    categoryName: 'Pentadbiran',
    stats: [
      { label: 'Tenaga Staf & AKP', val: '85 Orang' },
      { label: 'Manual Pengurusan', val: 'Edisi 2026' },
      { label: 'Tadbir Urus Digital', val: 'SPMS Verified' }
    ]
  }
};

export default function UnitPanel({ unitKey = 'kurikulum', isAdmin, token, setActiveTab }) {
  const [currentUnitKey, setCurrentUnitKey] = useState(unitKey);
  const [unitDocs, setUnitDocs] = useState([]);
  const [unitStaff, setUnitStaff] = useState([]);
  const [unitSections, setUnitSections] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docSearch, setDocSearch] = useState('');

  // Image Lightbox Preview Modal state
  const [previewImage, setPreviewImage] = useState(null);

  // e-Filing upload modal state
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [uploadingDocFile, setUploadingDocFile] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', code: '', category: '', department: '', file_url: '', description: '' });

  // Staff Edit / Add Modal state for Admin
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [uploadingStaffAvatar, setUploadingStaffAvatar] = useState(false);
  const [customDept, setCustomDept] = useState('');
  const [customCat, setCustomCat] = useState('');
  const [staffForm, setStaffForm] = useState({ name: '', position: '', department: '', category: 'Guru', email: '', phone: '', avatar_url: '' });

  // Section Item Edit / Add Modal state for Admin
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionItem, setEditingSectionItem] = useState(null);
  const [uploadingSectionImage, setUploadingSectionImage] = useState(false);
  const [sectionForm, setSectionForm] = useState({ section_title: '', item_name: '', item_lead: '', item_code: '', image_url: '' });

  const config = defaultUnitConfigs[currentUnitKey] || defaultUnitConfigs.kurikulum;

  useEffect(() => {
    setCurrentUnitKey(unitKey);
  }, [unitKey]);

  useEffect(() => {
    fetchUnitData();
  }, [currentUnitKey]);

  const fetchUnitData = async () => {
    setLoadingDocs(true);
    try {
      // 1. Fetch documents for this category
      const resDocs = await fetch('/api/documents');
      if (resDocs.ok) {
        const allDocs = await resDocs.json();
        const filtered = allDocs.filter(d => 
          d.category.toLowerCase() === config.categoryName.toLowerCase() ||
          d.department.toLowerCase().includes(config.categoryName.toLowerCase()) ||
          (config.id === 'kurikulum' && (d.category === 'SPMS' || d.category === 'Kurikulum'))
        );
        setUnitDocs(filtered);
      }

      // 2. Fetch staff for this department
      const resStaff = await fetch('/api/staff');
      if (resStaff.ok) {
        const staff = await resStaff.json();
        const filtered = staff.filter(s => s.department === config.categoryName || s.department === 'Pentadbiran');
        setUnitStaff(filtered);
      }

      // 3. Fetch section items for this unit
      const resSec = await fetch(`/api/unit-sections?unit_key=${currentUnitKey}`);
      if (resSec.ok) {
        const secData = await resSec.json();
        setUnitSections(secData);
      }
    } catch (err) {
      console.error('Ralat memuatkan data unit:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Group section items by section_title
  const groupedSections = unitSections.reduce((acc, item) => {
    acc[item.section_title] = acc[item.section_title] || [];
    acc[item.section_title].push(item);
    return acc;
  }, {});

  // Section Item Handlers (Add, Edit, Delete, Image Upload)
  const openAddSectionItemModal = (sectionTitle = '') => {
    setEditingSectionItem(null);
    setSectionForm({
      section_title: sectionTitle || (Object.keys(groupedSections)[0] || 'Jawatankuasa & Panitia Unit'),
      item_name: '',
      item_lead: '',
      item_code: '',
      image_url: ''
    });
    setShowSectionModal(true);
  };

  const openEditSectionItemModal = (item) => {
    setEditingSectionItem(item);
    setSectionForm({
      section_title: item.section_title,
      item_name: item.item_name,
      item_lead: item.item_lead || '',
      item_code: item.item_code || '',
      image_url: item.image_url || ''
    });
    setShowSectionModal(true);
  };

  const handleSectionImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingSectionImage(true);
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
        setSectionForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.error || 'Gagal memuat naik gambar poster/jadual.');
      }
    } catch (err) {
      alert('Ralat muat naik gambar.');
    } finally {
      setUploadingSectionImage(false);
    }
  };

  const handleSectionItemSubmit = async (e) => {
    e.preventDefault();
    if (!sectionForm.item_name || !sectionForm.section_title) {
      alert('Sila masukkan tajuk seksyen dan nama item.');
      return;
    }

    try {
      const url = editingSectionItem ? `/api/unit-sections/${editingSectionItem.id}` : '/api/unit-sections';
      const method = editingSectionItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...sectionForm, unit_key: currentUnitKey })
      });

      if (res.ok) {
        setShowSectionModal(false);
        fetchUnitData();
        alert(`Item seksyen berjaya ${editingSectionItem ? 'dikemaskini' : 'ditambah'}!`);
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal menyimpan item seksyen.');
      }
    } catch (err) {
      alert('Ralat sambungan pelayan.');
    }
  };

  const handleDeleteSectionItem = async (id, name) => {
    if (!window.confirm(`Padam item "${name}" dari seksyen ini?`)) return;
    try {
      const res = await fetch(`/api/unit-sections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUnitData();
        alert(`Item "${name}" telah dipadam!`);
      }
    } catch (err) {
      alert('Ralat memadam item.');
    }
  };

  // e-Filing Document Handlers
  const handleDownload = async (doc) => {
    try { await fetch(`/api/documents/${doc.id}/download`, { method: 'POST' }); } catch (e) {}
    if (doc.file_url && doc.file_url !== '#') {
      window.open(doc.file_url, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Fail "${doc.title}" belum mempunyai pautan dokumen.`);
    }
  };

  const handleDeleteDoc = async (id, title) => {
    if (!window.confirm(`Padam fail e-Filing "${title}" ini?`)) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchUnitData();
    } catch (err) {
      alert('Gagal memadam fail e-filing.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDocFile(true);
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
        setDocForm(prev => ({ ...prev, file_url: data.url }));
      } else {
        alert(data.error || 'Gagal memuat naik fail.');
      }
    } catch (err) {
      alert('Ralat muat naik fail.');
    } finally {
      setUploadingDocFile(false);
    }
  };

  const handleAddDocSubmit = async (e) => {
    e.preventDefault();
    if (!docForm.title || !docForm.file_url) {
      alert('Sila lengkapkan tajuk dan fail e-Filing.');
      return;
    }

    const payload = {
      ...docForm,
      category: config.categoryName,
      department: docForm.department || `Unit ${config.categoryName}`
    };

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddDocModal(false);
        setDocForm({ title: '', code: '', category: '', department: '', file_url: '', description: '' });
        fetchUnitData();
        alert('Fail e-Filing berjaya ditambah!');
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal menyimpan fail e-Filing.');
      }
    } catch (err) {
      alert('Ralat sistem.');
    }
  };

  const openAddDocModal = () => {
    setDocForm({
      code: `SHS-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: '',
      category: config.categoryName,
      department: `Unit ${config.categoryName}`,
      file_url: '',
      description: ''
    });
    setShowAddDocModal(true);
  };

  // Staff CRUD Handlers
  const openAddStaffModal = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      position: '',
      department: config.categoryName,
      category: 'Guru',
      email: '',
      phone: '',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
    setCustomDept('');
    setCustomCat('');
    setShowStaffModal(true);
  };

  const openEditStaffModal = (st) => {
    setEditingStaff(st);
    setStaffForm({
      name: st.name || '',
      position: st.position || '',
      department: st.department || config.categoryName,
      category: st.category || 'Guru',
      email: st.email || '',
      phone: st.phone || '',
      avatar_url: st.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
    setCustomDept('');
    setCustomCat('');
    setShowStaffModal(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingStaffAvatar(true);
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
        setStaffForm(prev => ({ ...prev, avatar_url: data.url }));
      } else {
        alert(data.error || 'Gagal memuat naik gambar avatar.');
      }
    } catch (err) {
      alert('Ralat muat naik gambar.');
    } finally {
      setUploadingStaffAvatar(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.position) {
      alert('Sila lengkapkan nama dan jawatan staf.');
      return;
    }

    const finalDept = staffForm.department === 'Lain-lain' ? (customDept.trim() || 'Lain-lain') : staffForm.department;
    const finalCat = staffForm.category === 'Lain-lain' ? (customCat.trim() || 'Lain-lain') : staffForm.category;

    const payload = {
      ...staffForm,
      department: finalDept,
      category: finalCat
    };

    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowStaffModal(false);
        fetchUnitData();
        alert(`Rekod staf/guru berjaya ${editingStaff ? 'kemaskini' : 'ditambah'}!`);
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan rekod staf.');
      }
    } catch (err) {
      alert('Ralat sambungan pelayan.');
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Adakah anda pasti mahu memadam rekod guru/staf "${name}" ini?`)) return;
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUnitData();
        alert(`Rekod "${name}" telah dipadam!`);
      } else {
        alert('Gagal memadam rekod.');
      }
    } catch (err) {
      alert('Ralat sambungan pelayan.');
    }
  };

  const searchedDocs = unitDocs.filter(d => 
    d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
    d.code.toLowerCase().includes(docSearch.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(docSearch.toLowerCase()))
  );

  return (
    <div className="page-wrapper">
      {/* Unit Selector Header Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '1.5rem' }}>
        {Object.keys(defaultUnitConfigs).map(key => {
          const u = defaultUnitConfigs[key];
          const active = currentUnitKey === key;
          return (
            <button
              key={key}
              onClick={() => setCurrentUnitKey(key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: active ? `2px solid ${u.color}` : '1px solid #e2e8f0',
                background: active ? 'white' : '#f8fafc',
                color: active ? '#1a1a2e' : '#64748b',
                fontWeight: active ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: active ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{u.emoji}</span> {u.title}
            </button>
          );
        })}
      </div>

      {/* Main Unit Banner Header */}
      <div style={{
        background: config.bgColor,
        color: 'white',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', backdropFilter: 'blur(4px)' }}>
            <span>{config.emoji}</span> DIREKTORI & PANEL UNIT SEKOLAH
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: 'white', margin: 0 }}>
            {config.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '700px', lineHeight: '1.6' }}>
            {config.desc}
          </p>

          {/* Unit Key Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            {config.stats.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: '12px', backdropFilter: 'blur(6px)' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white' }}>{s.val}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
        
        {/* Left Column: Sub-Units, Panitia/Kelab, Jadual Peperiksaan WITH IMAGE POSTER SUPPORT & FULL INTEGRATED e-FILING */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Sub Sections Grid with Full Admin Edit & Image Poster Support */}
          {Object.keys(groupedSections).length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e4e8f0', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>Tiada seksyen jawatankuasa / program ditemui bagi unit ini.</p>
              {isAdmin && (
                <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }} onClick={() => openAddSectionItemModal()}>
                  <Plus size={14} /> Tambah Seksyen & Item Pertama
                </button>
              )}
            </div>
          ) : (
            Object.entries(groupedSections).map(([secTitle, items], idx) => (
              <div key={idx} style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e4e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Sparkles size={18} color={config.color} /> {secTitle}
                  </h3>

                  {isAdmin && (
                    <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => openAddSectionItemModal(secTitle)}>
                      <Plus size={13} /> Tambah Item / Jadual
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#1e293b' }}>{item.item_name}</div>
                          {item.item_lead && (
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                              Ketua / Penyelaras / Tarikh: {item.item_lead}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.item_code && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px' }}>
                              {item.item_code}
                            </span>
                          )}

                          {/* Image Attachment Button */}
                          {item.image_url && (
                            <button
                              onClick={() => setPreviewImage({ url: item.image_url, title: item.item_name })}
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--sh-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <ImageIcon size={13} /> Lihat Gambar Jadual
                            </button>
                          )}

                          {/* Admin Action Buttons for Section Items */}
                          {isAdmin && (
                            <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                              <button
                                onClick={() => openEditSectionItemModal(item)}
                                style={{ padding: '6px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                title="Sunting Item & Gambar"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSectionItem(item.id, item.item_name)}
                                style={{ padding: '6px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                title="Padam Item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Display thumbnail poster if uploaded */}
                      {item.image_url && (
                        <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', cursor: 'pointer' }} onClick={() => setPreviewImage({ url: item.image_url, title: item.item_name })}>
                          <img src={item.image_url} alt={item.item_name} style={{ maxHeight: '140px', width: 'auto', objectFit: 'cover', display: 'block' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', opacity: 0, transition: 'opacity 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                            <ZoomIn size={24} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* FULL e-FILING DIRECTORY PANEL */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e4e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <FileText size={22} color={config.color} /> Fail & Dokumen e-Filing ({config.categoryName})
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, marginTop: '3px' }}>
                  Direktori simpanan fail digital rasmi SPMS bagi unit {config.title}.
                </p>
              </div>

              {isAdmin && (
                <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={openAddDocModal}>
                  <Plus size={14} /> Muat Naik Fail e-Filing
                </button>
              )}
            </div>

            {/* Search Input for e-Filing Documents */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                placeholder={`Cari fail e-filing ${config.categoryName}...`}
                value={docSearch}
                onChange={e => setDocSearch(e.target.value)}
              />
            </div>

            {loadingDocs ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Memuatkan fail e-Filing...</p>
            ) : searchedDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                <Folder size={36} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ color: '#475569', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
                  Tiada Fail e-Filing {docSearch ? 'Ditemui' : `Khas Bagi ${config.categoryName}`}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                  {isAdmin ? 'Klik "Muat Naik Fail e-Filing" untuk menambah dokumen baharu.' : 'Dokumen akan dikemaskini oleh pihak pentadbiran.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {searchedDocs.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          <span style={{ fontWeight: 700, color: config.color }}>{doc.code}</span> • {doc.department} {doc.download_count ? `• ${doc.download_count} Muat Turun` : ''}
                        </div>
                        {doc.description && (
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{doc.description}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Download size={13} /> Buka Fail
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          style={{ padding: '6px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          title="Padam Fail"
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

        </div>

        {/* Right Column: Staf & Guru Unit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Staf & Guru Unit Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e4e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Users size={18} color={config.color} /> Staf & Guru ({config.categoryName})
              </h3>

              <div style={{ display: 'flex', gap: '6px' }}>
                {isAdmin && (
                  <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={openAddStaffModal}>
                    <Plus size={13} /> Tambah Staf
                  </button>
                )}
                <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '4px 8px' }} onClick={() => setActiveTab && setActiveTab('staff')}>
                  Direktori Full
                </button>
              </div>
            </div>

            {unitStaff.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Tiada senarai staf ditemui bagi unit ini.</p>
                {isAdmin && (
                  <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '4px 12px' }} onClick={openAddStaffModal}>
                    + Tambah Staf Pertama
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {unitStaff.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <img
                        src={s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={s.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.position}</div>
                      </div>
                    </div>

                    {/* Admin Action Buttons: Edit & Delete */}
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '4px', marginLeft: '8px', flexShrink: 0 }}>
                        <button
                          onClick={() => openEditStaffModal(s)}
                          style={{ padding: '6px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          title="Sunting Staf"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s.id, s.name)}
                          style={{ padding: '6px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          title="Padam Staf"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info Card */}
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Folder size={16} color="var(--sh-maroon)" /> Pengurusan Tersepadu Unit {config.categoryName}
            </h4>
            <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              Semua maklumat jawatankuasa, panitia, staf, gambar jadual, dan fail e-Filing diselaraskan secara langsung. Admin mempunyai akses penuh untuk mengemaskini setiap seksyen di dalam panel unit ini.
            </p>
          </div>

        </div>

      </div>

      {/* LIGHTBOX MODAL: Full Size Image Viewer */}
      {previewImage && (
        <div className="modal-backdrop" onClick={() => setPreviewImage(null)}>
          <div className="modal-card" style={{ maxWidth: '800px', background: '#0f172a', color: 'white', padding: '1rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>🖼️ {previewImage.title}</h3>
              <button className="btn-close" style={{ color: 'white' }} onClick={() => setPreviewImage(null)}>✕</button>
            </div>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <img src={previewImage.url} alt={previewImage.title} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '10px', objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <a href={previewImage.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: 'none', padding: '6px 16px', fontSize: '0.8rem' }}>
                <ExternalLink size={14} /> Buka Gambar Asal
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Upload e-Filing Document */}
      {showAddDocModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>📂 Muat Naik Fail e-Filing ({config.categoryName})</h3>
              <button className="btn-close" onClick={() => setShowAddDocModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddDocSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tajuk Dokumen / Fail *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Minit Mesyuarat Unit 2026"
                    value={docForm.title}
                    onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Kod Rujukan Fail</label>
                    <input
                      type="text"
                      className="form-control"
                      value={docForm.code}
                      onChange={e => setDocForm({ ...docForm, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit / Jawatankuasa</label>
                    <input
                      type="text"
                      className="form-control"
                      value={docForm.department}
                      onChange={e => setDocForm({ ...docForm, department: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Muat Naik Fail Dokumen (PDF, Word, Images)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileUpload}
                    disabled={uploadingDocFile}
                    style={{ marginBottom: '8px' }}
                  />
                  {uploadingDocFile && <p style={{ fontSize: '0.8rem', color: 'var(--sh-blue)' }}>Memuat naik fail...</p>}
                  
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
                  <label className="form-label">Penerangan Ringkas Dokumen</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Ringkasan atau maklumat fail e-Filing..."
                    value={docForm.description}
                    onChange={e => setDocForm({ ...docForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddDocModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={uploadingDocFile || !docForm.file_url}>
                  Simpan Fail e-Filing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Edit Staff & Teacher */}
      {showStaffModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3>{editingStaff ? '✏️ Sunting Rekod Guru / Staf' : `👤 Tambah Guru / Staf Unit (${config.categoryName})`}</h3>
              <button className="btn-close" onClick={() => setShowStaffModal(false)}>✕</button>
            </div>

            <form onSubmit={handleStaffSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama Penuh Guru / Staf *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Cikgu Ahmad Redzuan"
                    value={staffForm.name}
                    onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jawatan / Portfolio Tugas *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Ketua Panitia Sains / Penyelaras Unit"
                    value={staffForm.position}
                    onChange={e => setStaffForm({ ...staffForm, position: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Unit / Jawatankuasa</label>
                    <select
                      className="form-control"
                      value={staffForm.department}
                      onChange={e => setStaffForm({ ...staffForm, department: e.target.value })}
                    >
                      <option value="Pentadbiran">Pentadbiran</option>
                      <option value="Kurikulum">Kurikulum</option>
                      <option value="HEM">HEM</option>
                      <option value="Kokurikulum">Kokurikulum</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                    {staffForm.department === 'Lain-lain' && (
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginTop: '8px' }}
                        placeholder="Nama unit baharu..."
                        value={customDept}
                        onChange={e => setCustomDept(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kategori Staf</label>
                    <select
                      className="form-control"
                      value={staffForm.category}
                      onChange={e => setStaffForm({ ...staffForm, category: e.target.value })}
                    >
                      <option value="Pentadbir">Pentadbir</option>
                      <option value="Guru">Guru Akademik</option>
                      <option value="AKP">Anggota Kumpulan Pelaksana (AKP)</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                    {staffForm.category === 'Lain-lain' && (
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginTop: '8px' }}
                        placeholder="Kategori baharu..."
                        value={customCat}
                        onChange={e => setCustomCat(e.target.value)}
                        required
                      />
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">E-mel Rasmi / DELIMa</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="nama@smksacredheart.edu.my"
                      value={staffForm.email}
                      onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. Telefon</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="019-XXXXXXX"
                      value={staffForm.phone}
                      onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Gambar Profil Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleAvatarUpload}
                    disabled={uploadingStaffAvatar}
                    style={{ marginBottom: '8px' }}
                  />
                  {uploadingStaffAvatar && <p style={{ fontSize: '0.8rem', color: 'var(--sh-blue)' }}>Memuat naik avatar...</p>}
                  
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://... atau /uploads/..."
                    value={staffForm.avatar_url}
                    onChange={e => setStaffForm({ ...staffForm, avatar_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowStaffModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={uploadingStaffAvatar}>
                  {editingStaff ? 'Simpan Perubahan' : 'Tambah Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add / Edit Section Items (Panitia, Program, Jadual Peperiksaan WITH IMAGE POSTER SUPPORT) */}
      {showSectionModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>{editingSectionItem ? '✏️ Sunting Item & Gambar Jadual' : `✨ Tambah Item / Jadual Unit (${config.categoryName})`}</h3>
              <button className="btn-close" onClick={() => setShowSectionModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSectionItemSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tajuk Seksyen Utama *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Jadual Peperiksaan & Ujian 2026 / Panitia"
                    value={sectionForm.section_title}
                    onChange={e => setSectionForm({ ...sectionForm, section_title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Item / Jadual / Program *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Pentaksiran Pertengahan Tahun (PPT)"
                    value={sectionForm.item_name}
                    onChange={e => setSectionForm({ ...sectionForm, item_name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Ketua / Penyelaras / Tarikh</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: 15 - 26 Jun 2026 / Cikgu Dayang"
                      value={sectionForm.item_lead}
                      onChange={e => setSectionForm({ ...sectionForm, item_lead: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kod / Tag Status</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: BM / BI / Dijadualkan"
                      value={sectionForm.item_code}
                      onChange={e => setSectionForm({ ...sectionForm, item_code: e.target.value })}
                    />
                  </div>
                </div>

                {/* IMAGE UPLOAD FIELD FOR SCHEDULE / POSTER */}
                <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} color="var(--sh-maroon)" /> Muat Naik Gambar Poster / Gambar Jadual Peperiksaan (Pilihan)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleSectionImageUpload}
                    disabled={uploadingSectionImage}
                    style={{ marginBottom: '8px' }}
                  />
                  {uploadingSectionImage && <p style={{ fontSize: '0.8rem', color: 'var(--sh-blue)' }}>Memuat naik gambar...</p>}

                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Atau Tampal Pautan / Link Gambar</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://... atau /uploads/..."
                    value={sectionForm.image_url}
                    onChange={e => setSectionForm({ ...sectionForm, image_url: e.target.value })}
                  />

                  {sectionForm.image_url && (
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, marginBottom: '4px' }}>✓ Gambar dipilih:</p>
                      <img src={sectionForm.image_url} alt="Pratonton" style={{ maxHeight: '80px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowSectionModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={uploadingSectionImage}>
                  {editingSectionItem ? 'Simpan Perubahan' : 'Tambah Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
