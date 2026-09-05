import React, { useState, useEffect } from 'react';
import { Settings, Key, FileText, Users, Bell } from 'lucide-react';

export default function AdminPanel({ token, user }) {
  const [stats, setStats] = useState({ docs: 0, staff: 0, announcements: 0 });
  const [schoolInfo, setSchoolInfo] = useState({
    motto: 'Directa Labore - Dipandu Oleh Usaha Murni',
    phone: '084-330454',
    email: 'smksacredheart.yeb3101@moe-dl.edu.my',
    address: 'Jalan Oya, 96000 Sibu, Sarawak'
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
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Outfit',sans-serif" }}>
          Panel Kawalan Pentadbiran (Admin Dashboard)
        </h1>
        <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
          SMK Sacred Heart — Pengurusan pangkalan data, tetapan portal sekolah, dan kata laluan admin.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <FileText size={26} />
          </div>
          <div>
            <div className="stat-label">Dokumen E-Filing</div>
            <div className="stat-val">{stats.docs}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-label">Jumlah Staf / Guru</div>
            <div className="stat-val">{stats.staff}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fefce8', color: '#a16207' }}>
            <Bell size={26} />
          </div>
          <div>
            <div className="stat-label">Notis & Pengumuman</div>
            <div className="stat-val">{stats.announcements}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        {/* School Info Settings Form */}
        <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e4e8f0' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e' }}>
            <Settings size={20} color="#7b1c1c" /> Tetapan Maklumat Portal Sekolah
          </h3>

          {infoSuccess && (
            <div className="alert alert-success">
              {infoSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateInfo}>
            <div className="form-group">
              <label className="form-label">Slogan / Moto Sekolah</label>
              <input
                type="text"
                className="form-control"
                value={schoolInfo.motto}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, motto: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">No. Telefon Pejabat Sekolah</label>
              <input
                type="text"
                className="form-control"
                value={schoolInfo.phone}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-mel Rasmi Sekolah</label>
              <input
                type="email"
                className="form-control"
                value={schoolInfo.email}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Sekolah</label>
              <textarea
                className="form-control"
                rows="2"
                value={schoolInfo.address}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">
              Simpan Tetapan Laman Web
            </button>
          </form>
        </div>

        {/* Change Admin Password */}
        <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e4e8f0' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e' }}>
            <Key size={20} color="#c9973a" /> Tukar Kata Laluan Pentadbir
          </h3>

          {passError && (
            <div className="alert alert-error">
              {passError}
            </div>
          )}

          {passSuccess && (
            <div className="alert alert-success">
              {passSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Kata Laluan Asal</label>
              <input
                type="password"
                className="form-control"
                value={passData.oldPassword}
                onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kata Laluan Baru</label>
              <input
                type="password"
                className="form-control"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sahkan Kata Laluan Baru</label>
              <input
                type="password"
                className="form-control"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-gold">
              Kemaskini Kata Laluan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
