import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Users, FileText, Download, Plus, Trash2, Edit, Sparkles, Folder, Search, ArrowRight, X, Image as ImageIcon, ExternalLink, GraduationCap, CheckCircle, Target, ZoomIn } from 'lucide-react';

export default function Form6Panel({ isAdmin, token, setActiveTab }) {
  const [unitDocs, setUnitDocs] = useState([]);
  const [unitStaff, setUnitStaff] = useState([]);
  const [unitSections, setUnitSections] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docSearch, setDocSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  // GDrive folder URLs provided by user
  const driveUrlMain = "https://drive.google.com/drive/folders/10MhW5azyYZsdBcIyqQkj0Eqy_Khv2aib?usp=drive_link";
  const driveUrlKebolehpasaran = "https://drive.google.com/drive/folders/1y-680PGi9doGUz8p_LDQ-SjL_wltK4Uu?usp=drive_link";

  // Active embedded Drive tab
  const [activeEmbedDrive, setActiveEmbedDrive] = useState('main'); // 'main' | 'kebolehpasaran'

  // Image Lightbox Preview Modal state
  const [previewImage, setPreviewImage] = useState(null);

  // e-Filing upload modal state
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [uploadingDocFile, setUploadingDocFile] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', code: '', category: 'STPM', department: 'Tingkatan 6', file_url: '', description: '' });

  // Section Item Edit / Add Modal state for Admin
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionItem, setEditingSectionItem] = useState(null);
  const [uploadingSectionImage, setUploadingSectionImage] = useState(false);
  const [sectionForm, setSectionForm] = useState({ section_title: 'Panitia Mata Pelajaran STPM', item_name: '', item_lead: '', item_code: '', image_url: '' });

  // Staff Edit / Add Modal state for Admin
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [uploadingStaffAvatar, setUploadingStaffAvatar] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', position: '', department: 'Tingkatan 6', category: 'Guru', email: '', phone: '', avatar_url: '' });

  useEffect(() => {
    fetchForm6Data();
  }, []);

  const fetchForm6Data = async () => {
    setLoadingDocs(true);
    try {
      // 1. Fetch Form 6 documents
      const resDocs = await fetch('/api/form6-documents');
      if (resDocs.ok) {
        setUnitDocs(await resDocs.json());
      } else {
        // Fallback to efiling documents
        const resEfiling = await fetch('/api/documents');
        if (resEfiling.ok) {
          const docs = await resEfiling.json();
          setUnitDocs(docs.filter(d => d.department.includes('Tingkatan 6') || d.category.includes('STPM')));
        }
      }

      // 2. Fetch Form 6 Staff
      const resStaff = await fetch('/api/staff');
      if (resStaff.ok) {
        const staff = await resStaff.json();
        const filtered = staff.filter(s => 
          s.department === 'Tingkatan 6' || 
          s.position.includes('Tingkatan 6') || 
          s.position.includes('STPM') || 
          s.position.includes('Pra-U') ||
          s.position.includes('Penolong Kanan T6')
        );
        setUnitStaff(filtered.length > 0 ? filtered : staff.slice(0, 8));
      }

      // 3. Fetch section items for form6
      const resSec = await fetch('/api/unit-sections?unit_key=form6');
      if (resSec.ok) {
        const secData = await resSec.json();
        if (secData.length > 0) {
          setUnitSections(secData);
        } else {
          // Default initial extracted section structure for Form 6
          setUnitSections([
            { id: 1, section_title: 'Panitia Mata Pelajaran STPM', item_name: 'Panitia Pengajian Am', item_lead: 'Ketua Panitia Pengajian Am T6', item_code: 'PPA-STPM', image_url: '' },
            { id: 2, section_title: 'Panitia Mata Pelajaran STPM', item_name: 'Panitia Matematik T & Fizik', item_lead: 'Guru Penyelaras Aliran Sains T6', item_code: 'PMT-STPM', image_url: '' },
            { id: 3, section_title: 'Panitia Mata Pelajaran STPM', item_name: 'Panitia Kimia & Biologi', item_lead: 'Guru Penyelaras Makmal Sains T6', item_code: 'PKB-STPM', image_url: '' },
            { id: 4, section_title: 'Panitia Mata Pelajaran STPM', item_name: 'Panitia Ekonomi, Akaun & Bahasa Melayu', item_lead: 'Guru Penyelaras Sains Sosial T6', item_code: 'PEA-STPM', image_url: '' },
            { id: 5, section_title: 'Unit MUET & Bahasa Inggeris Pra-U', item_name: 'Modul Pentaksiran MUET CEFR', item_lead: 'Ketua Penyelaras MUET T6', item_code: 'MUET-SHS', image_url: '' },
            { id: 6, section_title: 'Pengurusan Kerja Kursus (PBS STPM)', item_name: 'Jawatankuasa Pentaksiran PBS T6', item_lead: 'Setiausaha PBS Pra-U', item_code: 'PBS-STPM', image_url: '' },
            { id: 7, section_title: 'Unit Kebolehpasaran & Alumni Pra-U', item_name: 'Rekod Kebolehpasaran Graduan T6', item_lead: 'Penyelaras Alumni & Kebolehpasaran T6', item_code: 'ALUMNI-T6', image_url: '' },
            { id: 8, section_title: 'Unit Kebolehpasaran & Alumni Pra-U', item_name: 'Jejak Kerjaya & Pengajian Tinggi', item_lead: 'Guru Bimbingan & Kerjaya Pra-U', item_code: 'KERJAYA-T6', image_url: '' }
          ]);
        }
      }
    } catch (err) {
      console.error('Ralat memuatkan data Form 6:', err);
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

  // Device Upload Helper
  const uploadDeviceFile = async (file) => {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Muat naik fail gagal');
    return data.url;
  };

  // Section Item Handlers
  const openAddSectionItemModal = (sectionTitle = '') => {
    setEditingSectionItem(null);
    setSectionForm({
      section_title: sectionTitle || (Object.keys(groupedSections)[0] || 'Panitia Mata Pelajaran STPM'),
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

  const handleSectionFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingSectionImage(true);
    try {
      const url = await uploadDeviceFile(file);
      setSectionForm(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingSectionImage(false);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = Boolean(editingSectionItem);
      const url = isEdit ? `/api/unit-sections/${editingSectionItem.id}` : '/api/unit-sections';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...sectionForm, unit_key: 'form6' })
      });
      const data = await res.json();
      if (res.ok) {
        setShowSectionModal(false);
        fetchForm6Data();
      } else {
        alert(data.error || 'Ralat menyimpan maklumat sub-unit');
      }
    } catch (err) {
      alert('Ralat sambungan pelayan');
    }
  };

  const handleSectionDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam item panitia/unit ini?')) return;
    try {
      const res = await fetch(`/api/unit-sections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchForm6Data();
    } catch (err) {
      console.error(err);
    }
  };

  // Document Upload Handlers
  const handleDocFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDocFile(true);
    try {
      const url = await uploadDeviceFile(file);
      setDocForm(prev => ({ ...prev, file_url: url }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingDocFile(false);
    }
  };

  const handleAddDocSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/form6-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: docForm.title,
          category: docForm.category || 'STPM',
          file_url: docForm.file_url || driveUrlMain,
          file_type: docForm.file_url.includes('drive.google') ? 'gdrive' : 'pdf',
          description: docForm.description
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddDocModal(false);
        setDocForm({ title: '', code: '', category: 'STPM', department: 'Tingkatan 6', file_url: '', description: '' });
        fetchForm6Data();
      } else {
        alert(data.error || 'Ralat muat naik dokumen');
      }
    } catch (err) {
      alert('Ralat sambungan pelayan');
    }
  };

  const handleDocDelete = async (id) => {
    if (!window.confirm('Padam dokumen ini dari e-filing Form 6?')) return;
    try {
      const res = await fetch(`/api/form6-documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchForm6Data();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = unitDocs.filter(doc => {
    const matchCategory = activeCategory === 'Semua' || doc.category === activeCategory;
    const matchSearch = !docSearch || 
      doc.title.toLowerCase().includes(docSearch.toLowerCase()) || 
      (doc.description && doc.description.toLowerCase().includes(docSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="page-wrapper" style={{ minHeight: '85vh', paddingBottom: '4rem' }}>
      {/* Unit Header Banner (Executive Form 6 Maroon/Gold Theme) */}
      <div style={{
        background: 'linear-gradient(135deg, #2b0507 0%, #6b1414 50%, #3d080c 100%)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        color: 'white',
        marginBottom: '2.5rem',
        boxShadow: '0 20px 40px rgba(90, 16, 16, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img
          src="/logo.png"
          alt=""
          style={{
            position: 'absolute', right: '-40px', bottom: '-40px',
            width: '320px', height: '320px', objectFit: 'contain',
            opacity: 0.08, pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 242, 0, 0.15)', border: '1px solid rgba(255, 242, 0, 0.4)', color: 'var(--sh-yellow)', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1.25rem' }}>
          <GraduationCap size={16} color="var(--sh-yellow)" /> PUSAT TINGKATAN 6 (STPM & PRA-UNIVERSITI)
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.8rem)', fontWeight: 900, fontFamily: "'Outfit', sans-serif", margin: '0 0 0.75rem 0', lineHeight: 1.15 }}>
          Pusat Tingkatan 6 <span style={{ color: 'var(--sh-yellow)' }}>SMK Sacred Heart</span>
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.92)', maxWidth: '780px', margin: '0 0 2rem 0', fontSize: '1.02rem', lineHeight: 1.7 }}>
          Pengurusan panitia mata pelajaran STPM, pentaksiran MUET, kerja kursus (PBS), direktori pensyarah Pra-U, dan fail repositori e-Filing Tingkatan 6.
        </p>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem 1.25rem', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sh-yellow)', fontWeight: 700, textTransform: 'uppercase' }}>Aliran STPM</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px', fontFamily: "'Outfit', sans-serif" }}>Sains & Sains Sosial</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem 1.25rem', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sh-yellow)', fontWeight: 700, textTransform: 'uppercase' }}>Modul Wajib</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px', fontFamily: "'Outfit', sans-serif" }}>Pengajian Am & MUET</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem 1.25rem', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--sh-yellow)', fontWeight: 700, textTransform: 'uppercase' }}>Repositori Drive T6</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px', fontFamily: "'Outfit', sans-serif" }}>SPMS Terhubung</div>
          </div>
        </div>
      </div>

      {/* Dual Google Drive Repository Cards (Folder Utama & Rekod Kebolehpasaran) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Card 1: Google Drive Utama T6 */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '24px',
          border: '2px solid rgba(232, 182, 84, 0.4)',
          padding: '1.75rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'rgba(255, 242, 0, 0.2)', border: '1px solid var(--sh-yellow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Folder size={28} color="var(--sh-maroon)" />
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--sh-maroon)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Sparkles size={12} color="var(--sh-maroon)" /> REPOSITORI UTAMA
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", margin: '4px 0 6px' }}>
                Folder Utama Tingkatan 6 (T6)
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
                Nota kursus, modul panitia, kertas percubaan STPM, dan e-filing pengurusan Form 6.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href={driveUrlMain}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, var(--sh-maroon) 0%, #4a0c0c 100%)',
                color: '#ffffff',
                padding: '12px 18px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.88rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(123, 28, 28, 0.25)'
              }}
            >
              <ExternalLink size={16} color="var(--sh-yellow)" /> Buka Drive T6 →
            </a>
            <button
              onClick={() => setActiveEmbedDrive('main')}
              style={{
                background: activeEmbedDrive === 'main' ? 'rgba(123,28,28,0.1)' : '#f1f5f9',
                color: activeEmbedDrive === 'main' ? 'var(--sh-maroon)' : '#475569',
                border: activeEmbedDrive === 'main' ? '1px solid var(--sh-maroon)' : '1px solid #cbd5e1',
                borderRadius: '14px',
                padding: '0 16px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Pratonton
            </button>
          </div>
        </div>

        {/* Card 2: Rekod Kebolehpasaran T6 */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fdf8f6 100%)',
          borderRadius: '24px',
          border: '2px solid rgba(194, 65, 12, 0.3)',
          padding: '1.75rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'rgba(234, 88, 12, 0.15)', border: '1px solid #f97316',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <GraduationCap size={28} color="#c2410c" />
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c2410c', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Target size={12} color="#c2410c" /> REKOD KEBOLEHPASARAN & ALUMNI
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", margin: '4px 0 6px' }}>
                Rekod Kebolehpasaran Graduan T6
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
                Pangkalan data jejak alumni Pra-U, statistik tawaran IPTA/IPTS, dan status kerjaya graduan T6.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="https://drive.google.com/drive/folders/1y-680PGi9doGUz8p_LDQ-SjL_wltK4Uu"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)',
                color: '#ffffff',
                padding: '12px 18px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.88rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(194, 65, 12, 0.25)'
              }}
            >
              <ExternalLink size={16} color="var(--sh-yellow)" /> Buka Drive Kebolehpasaran →
            </a>
            <button
              onClick={() => setActiveEmbedDrive('kebolehpasaran')}
              style={{
                background: activeEmbedDrive === 'kebolehpasaran' ? 'rgba(194,65,12,0.1)' : '#f1f5f9',
                color: activeEmbedDrive === 'kebolehpasaran' ? '#c2410c' : '#475569',
                border: activeEmbedDrive === 'kebolehpasaran' ? '1px solid #c2410c' : '1px solid #cbd5e1',
                borderRadius: '14px',
                padding: '0 16px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Pratonton
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Google Drive Interactive Viewer Section */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        marginBottom: '3rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(123,28,28,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Folder size={22} color="var(--sh-maroon)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
                Pratonton Terus Fail Google Drive T6
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                {activeEmbedDrive === 'main' ? 'Papan Paparan Folder Utama Tingkatan 6' : 'Papan Paparan Rekod Kebolehpasaran Graduan T6'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveEmbedDrive('main')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeEmbedDrive === 'main' ? 'var(--sh-maroon)' : 'transparent',
                color: activeEmbedDrive === 'main' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📁 Folder Utama T6
            </button>
            <button
              onClick={() => setActiveEmbedDrive('kebolehpasaran')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeEmbedDrive === 'kebolehpasaran' ? '#c2410c' : 'transparent',
                color: activeEmbedDrive === 'kebolehpasaran' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🎓 Rekod Kebolehpasaran
            </button>
          </div>
        </div>

        <div style={{ width: '100%', height: '520px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <iframe
            src={activeEmbedDrive === 'main' 
              ? "https://drive.google.com/embeddedfolderview?id=10MhW5azyYZsdBcIyqQkj0Eqy_Khv2aib#grid"
              : "https://drive.google.com/embeddedfolderview?id=1y-680PGi9doGUz8p_LDQ-SjL_wltK4Uu#grid"
            }
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Google Drive Embedded Preview"
          />
        </div>
      </div>

      {/* SECTION 1: EXTRACTED UNIT & PANITIA SECTIONS (Like UnitPanel) */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px' }}>
              Panitia & Sub-Unit Tingkatan 6
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
              Senarai panitia mata pelajaran STPM, unit pentaksiran MUET, dan jawatankuasa kerja kursus (PBS).
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => openAddSectionItemModal()}
              style={{
                background: 'var(--sh-maroon)',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> Tambah Sub-Unit / Panitia
            </button>
          )}
        </div>

        {Object.keys(groupedSections).length === 0 ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
            <BookOpen size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
            <p style={{ fontWeight: 600 }}>Tiada panitia atau sub-unit direkodkan lagi.</p>
          </div>
        ) : (
          Object.entries(groupedSections).map(([sectionTitle, items], idx) => (
            <div key={idx} style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Outfit', sans-serif", borderLeft: '4px solid var(--sh-maroon)', paddingLeft: '12px' }}>
                  {sectionTitle}
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => openAddSectionItemModal(sectionTitle)}
                    style={{ background: 'none', border: 'none', color: 'var(--sh-maroon)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    + Tambah Dalam "{sectionTitle}"
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {items.map(item => (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      border: '1px solid #e2e8f0',
                      padding: '1.5rem',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {item.image_url && (
                        <div
                          onClick={() => setPreviewImage(item.image_url)}
                          style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', cursor: 'pointer', position: 'relative' }}
                        >
                          <img src={item.image_url} alt={item.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                            <ZoomIn color="white" size={24} />
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--sh-maroon)', background: 'rgba(123,28,28,0.08)', padding: '3px 10px', borderRadius: '50px' }}>
                          {item.item_code || 'T6-UNIT'}
                        </span>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => openEditSectionItemModal(item)} style={{ padding: '4px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Edit size={13} /></button>
                            <button onClick={() => handleSectionDelete(item.id)} style={{ padding: '4px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={13} /></button>
                          </div>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", marginBottom: '6px' }}>
                        {item.item_name}
                      </h4>

                      {item.item_lead && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                          👤 {item.item_lead}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECTION 2: FAIL & DOKUMEN E-FILING FORM 6 */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px' }}>
              Dokumen & Fail e-Filing Form 6
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
              Fail pengurusan pentaksiran STPM, MUET, pekeliling rasmi, dan manual kerja kursus.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddDocModal(true)}
              style={{
                background: 'var(--sh-maroon)',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> Muat Naik Fail e-Filing T6
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Kategori:</span>
            {['Semua', 'STPM', 'MUET', 'PBS', 'Pekeliling', 'GDrive'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 14px', borderRadius: '50px',
                  border: activeCategory === cat ? '1px solid var(--sh-maroon)' : '1px solid #cbd5e1',
                  background: activeCategory === cat ? 'rgba(123,28,28,0.08)' : 'white',
                  color: activeCategory === cat ? 'var(--sh-maroon)' : '#475569',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Cari fail e-filing T6..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              style={{ width: '100%', borderRadius: '12px', padding: '8px 14px 8px 36px', border: '1px solid #cbd5e1' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {/* Document Cards */}
        {filteredDocs.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px dashed #cbd5e1', padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
            <FileText size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
            <p style={{ fontWeight: 600 }}>Tiada fail e-filing dijumpai bagi carian ini.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {filteredDocs.map(doc => (
              <div key={doc.id} style={{
                background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0',
                padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex',
                flexDirection: 'column', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{
                      background: 'rgba(123,28,28,0.08)', color: 'var(--sh-maroon)',
                      padding: '4px 10px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800
                    }}>
                      {doc.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{doc.date_uploaded}</span>
                  </div>

                  <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", marginBottom: '6px' }}>
                    {doc.title}
                  </h4>
                  {doc.description && <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1rem' }}>{doc.description}</p>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <a
                    href={doc.file_url || driveUrlMain}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--sh-maroon)', color: '#ffffff', padding: '8px 16px',
                      borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Download size={14} /> Akses Dokumen
                  </a>

                  {isAdmin && (
                    <button
                      onClick={() => handleDocDelete(doc.id)}
                      style={{ padding: '6px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: BARISAN GURU TINGKATAN 6 */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px' }}>
            Barisan Guru Tingkatan 6
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
            Warga pendidik Pra-Universiti SMK Sacred Heart — Barisan Guru Tingkatan Enam 2021.
          </p>
        </div>

        {/* Barisan Guru Group Photo */}
        <div style={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '3px solid rgba(232, 182, 84, 0.5)',
          position: 'relative',
          background: '#f8fafc'
        }}>
          <img
            src="/barisan-guru-t6.png"
            alt="Barisan Guru Tingkatan Enam SMK Sacred Heart 2021"
            style={{ width: '100%', display: 'block', objectFit: 'contain' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(43,5,7,0.88) 0%, rgba(43,5,7,0.3) 60%, transparent 100%)',
            padding: '3rem 2.5rem 2rem',
            color: 'white'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,242,0,0.2)', border: '1px solid rgba(255,242,0,0.5)', color: 'var(--sh-yellow)', padding: '5px 14px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '10px', letterSpacing: '0.5px' }}>
              <GraduationCap size={14} /> BARISAN GURU TINGKATAN ENAM 2021
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              Warga Pendidik Pra-Universiti SMK Sacred Heart
            </h3>
          </div>
        </div>
      </div>


      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
        >
          <div style={{ position: 'relative', maxWidth: '900px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={28} />
            </button>
            <img src={previewImage} alt="Pratonton" style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '16px' }} />
          </div>
        </div>
      )}

      {/* Admin Add Section Item Modal */}
      {showSectionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
              {editingSectionItem ? '✏️ Kemaskini Sub-Unit / Panitia' : '➕ Tambah Sub-Unit / Panitia T6'}
            </h3>

            <form onSubmit={handleSectionSubmit}>
              <div className="form-group">
                <label className="form-label">Kategori / Tajuk Seksyen Utama</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Panitia Mata Pelajaran STPM"
                  value={sectionForm.section_title}
                  onChange={(e) => setSectionForm({ ...sectionForm, section_title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Panitia / Sub-Unit</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Panitia Pengajian Am STPM"
                  value={sectionForm.item_name}
                  onChange={(e) => setSectionForm({ ...sectionForm, item_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pegawai / Ketua Penyelaras (Pilihan)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Cikgu Ling (Ketua Panitia)"
                  value={sectionForm.item_lead}
                  onChange={(e) => setSectionForm({ ...sectionForm, item_lead: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kod Panitia / Rujukan (Pilihan)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: PPA-STPM"
                  value={sectionForm.item_code}
                  onChange={(e) => setSectionForm({ ...sectionForm, item_code: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowSectionModal(false)} style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600 }}>Batal</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--sh-maroon)', color: 'white', fontWeight: 700 }}>Simpan Sub-Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Document Modal */}
      {showAddDocModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
              📄 Muat Naik Fail e-Filing Form 6
            </h3>

            <form onSubmit={handleAddDocSubmit}>
              <div className="form-group">
                <label className="form-label">Tajuk Dokumen / Fail</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Jadual Peperiksaan STPM Sem 1 2026"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori Dokumen</label>
                <select
                  className="form-control"
                  value={docForm.category}
                  onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                  required
                >
                  <option value="STPM">Peperiksaan STPM</option>
                  <option value="MUET">MUET</option>
                  <option value="PBS">Kerja Kursus (PBS)</option>
                  <option value="GDrive">Pautan Google Drive</option>
                  <option value="Pekeliling">Pekeliling & Surat Rasmi</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Penerangan Ringkas</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Catatan mengenai isi kandungan fail..."
                  value={docForm.description}
                  onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Muat Naik Fail Dari Peranti / Pautan Google Drive</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleDocFileUpload}
                  disabled={uploadingDocFile}
                />
                <input
                  type="url"
                  className="form-control"
                  style={{ marginTop: '8px' }}
                  placeholder="Atau masukkan pautan URL Google Drive..."
                  value={docForm.file_url}
                  onChange={(e) => setDocForm({ ...docForm, file_url: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddDocModal(false)} style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600 }}>Batal</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--sh-maroon)', color: 'white', fontWeight: 700 }} disabled={uploadingDocFile}>Simpan Fail</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
