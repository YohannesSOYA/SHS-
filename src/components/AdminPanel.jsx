import React, { useState, useEffect } from 'react';
import { Settings, Key, ShieldAlert, CheckCircle, Database, FileText, Users, Bell } from 'lucide-react';

export default function AdminPanel({ token, user }) {
  const [stats, setStats] = useState({ docs: 0, staff: 0, announcements: 0 });
  const [schoolInfo, setSchoolInfo] = useState({
    motto: 'Menggilap Bintang - SMK Lundu Fly High',
    phone: '082-735234',
    email: 'smklundu.yeb1301@moe-dl.edu.my',
    address: 'Jalan Bau-Lundu, 94500 Lundu, Sarawak'
  });
  const [infoSuccess, setInfoSuccess] = useState('');

  // Password change state
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    fetchStats();
    fetchSchoolInfo();
  }, []);

  const fetchStats = async () => {
    try {
      const [docsRes, staffRes, annRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/staff'),
        fetch('/api/announcements')
      ]);
      const docs = await docsRes.json();
      const staff = await staffRes.json();
      const ann = await annRes.json();

      setStats({
        docs: docs.length || 0,
        staff: staff.length || 0,
        announcements: ann.length || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchoolInfo = async () => {
    try {
      const res = await fetch('/api/school-info');
      const data = await res.json();
      if (data && Object.keys(data).length > 0) {
        setSchoolInfo(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoSuccess('');
    try {
      const res = await fetch('/api/school-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(schoolInfo)
      });
      if (res.ok) {
        setInfoSuccess('Maklumat portal sekolah berjaya dikemaskini!');
      }
    } catch (err) {
      alert('Gagal mengemaskini maklumat');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passData.newPassword !== passData.confirmPassword) {
      return setPassError('Kata laluan baru tidak sepadan.');
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passData.oldPassword,
          newPassword: passData.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menukar kata laluan');
      }

      setPassSuccess('Kata laluan admin berjaya ditukar!');
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
          Panel Kawalan Pentadbiran (Admin Dashboard)
        </h2>
        <p style={{ color: '#64748b' }}>
          Pengurusan pangkalan data, tetapan laman web, dan keselamatan akaun admin.
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
            <FileText size={28} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Dokumen E-Filing</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{stats.docs}</h3>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
            <Users size={28} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Jumlah Staf / Guru</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{stats.staff}</h3>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
            <Bell size={28} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Notis & Pengumuman</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{stats.announcements}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* School Info Settings Form */}
        <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="#2563eb" /> Tetapan Maklumat Portal Sekolah
          </h3>

          {infoSuccess && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
              {infoSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateInfo}>
            <div className="form-group">
              <label>Slogan / Moto Sekolah</label>
              <input
                type="text"
                className="form-control"
                value={schoolInfo.motto}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, motto: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>No. Telefon Pejabat Sekolah</label>
              <input
                type="text"
                className="form-control"
                value={schoolInfo.phone}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>E-mel Rasmi Sekolah</label>
              <input
                type="email"
                className="form-control"
                value={schoolInfo.email}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Alamat Sekolah</label>
              <textarea
                className="form-control"
                rows="2"
                value={schoolInfo.address}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn-primary">
              Simpan Tetapan Laman Web
            </button>
          </form>
        </div>

        {/* Change Admin Password */}
        <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="#d97706" /> Tukar Kata Laluan Pentadbir
          </h3>

          {passError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
              {passError}
            </div>
          )}

          {passSuccess && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
              {passSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Kata Laluan Asal</label>
              <input
                type="password"
                className="form-control"
                value={passData.oldPassword}
                onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Kata Laluan Baru</label>
              <input
                type="password"
                className="form-control"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Sahkan Kata Laluan Baru</label>
              <input
                type="password"
                className="form-control"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ background: '#d97706' }}>
              Kemaskini Kata Laluan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
