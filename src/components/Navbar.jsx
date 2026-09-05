import React from 'react';
import { LogIn, LogOut, Shield, ChevronDown } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAdmin, user, onLoginClick, onLogoutClick }) {

  const tabs = [
    { id: 'home', label: 'Laman Utama', emoji: '🏠' },
    { id: 'efiling', label: 'Direktori SPMS & e-Filing', emoji: '📂' },
    { id: 'staff', label: 'Direktori Guru & Staf', emoji: '👥' },
    { id: 'announcements', label: 'Pengumuman & Takwim', emoji: '📢' },
    ...(isAdmin ? [{ id: 'admin', label: 'Panel Admin', emoji: '⚙️' }] : []),
  ];

  return (
    <>
      {/* Header Banner */}
      <header className="site-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="school-crest">SH</div>
            <div>
              <div className={`header-badge ${isAdmin ? 'badge-admin' : 'badge-guest'}`}>
                <Shield size={11} />
                {isAdmin ? `Admin: ${user?.name || 'Pentadbir'}` : 'Mod Tontonan Awam'}
              </div>
              <div className="header-school-name">
                SMK SACRED HEART
                <span>Sekolah Menengah Kebangsaan Sacred Heart, Sarawak</span>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <button className="header-auth-btn btn-logout" onClick={onLogoutClick}>
              <LogOut size={15} /> Log Keluar
            </button>
          ) : (
            <button className="header-auth-btn btn-login" onClick={onLoginClick}>
              <LogIn size={15} /> Log Masuk Admin
            </button>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="site-nav">
        <div className="nav-inner">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
