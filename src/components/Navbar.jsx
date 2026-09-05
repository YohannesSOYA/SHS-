import React from 'react';
import { FileText, Users, Bell, Info, Shield, LogIn, LogOut, Search, School, Settings } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAdmin, user, onLoginClick, onLogoutClick }) {
  return (
    <>
      {/* Top Bar Banner */}
      <header className="hero-banner">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <School size={36} color="white" />
              </div>
              <div>
                <span className={`badge-tag ${isAdmin ? 'badge-admin' : 'badge-guest'}`}>
                  <Shield size={14} />
                  {isAdmin ? `MOD ADMIN: ${user?.name || 'Pentadbir'}` : 'MOD USER (LIHAT SAHAJA)'}
                </span>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.5px' }}>
                  SMK LUNDU
                </h1>
                <p className="motto-font" style={{ color: '#93c5fd', fontSize: '1.05rem', fontWeight: 500 }}>
                  "MENGGILAP BINTANG — SMK LUNDU FLY HIGH"
                </p>
              </div>
            </div>

            {/* Auth Button */}
            <div>
              {isAdmin ? (
                <button className="btn-primary" onClick={onLogoutClick} style={{ background: '#ef4444' }}>
                  <LogOut size={16} /> Log Keluar Admin
                </button>
              ) : (
                <button className="btn-primary" onClick={onLoginClick} style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                  <LogIn size={16} /> Log Masuk Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Sticky Bar */}
      <nav className="nav-bar">
        <div className="container nav-container">
          <div className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'efiling' ? 'active' : ''}`}
              onClick={() => setActiveTab('efiling')}
            >
              <FileText size={18} /> e-Filing & Direktori SPMS
            </button>
            <button
              className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              <Users size={18} /> Direktori Guru & Staf
            </button>
            <button
              className={`nav-btn ${activeTab === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveTab('announcements')}
            >
              <Bell size={18} /> Pengumuman & Takwim
            </button>
            {isAdmin && (
              <button
                className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
                style={{ color: '#d97706' }}
              >
                <Settings size={18} /> Panel Kawalan Admin
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Kod Sekolah: <span style={{ color: '#1e293b' }}>YEB1301</span> | Sesi 2026
          </div>
        </div>
      </nav>
    </>
  );
}
