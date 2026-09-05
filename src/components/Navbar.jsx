import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Shield, CloudSun, Clock, Calendar } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAdmin, user, onLoginClick, onLogoutClick }) {
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [weather, setWeather] = useState({ temp: '31°C', desc: 'Cerah', icon: '☀️' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setDateStr(now.toLocaleDateString('ms-MY', options));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Fetch live weather forecast for Sibu / Sarawak
    fetch('https://api.open-meteo.com/v1/forecast?latitude=2.3&longitude=111.81&current_weather=true')
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;
          let desc = 'Cerah';
          let icon = '☀️';
          if (code > 2) { desc = 'Berawan'; icon = '⛅'; }
          if (code > 50) { desc = 'Hujan Rintik'; icon = '🌧️'; }
          setWeather({ temp: `${temp}°C`, desc, icon });
        }
      })
      .catch(() => {});

    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: 'home', label: 'Laman Utama', emoji: '🏠' },
    { id: 'staff', label: 'Direktori Staf', emoji: '👥' },
    { id: 'announcements', label: 'Pengumuman', emoji: '📢' },
    { id: 'orgchart', label: 'Carta Organisasi', emoji: '📊' },
    { id: 'gallery', label: 'Galeri Aktiviti', emoji: '🖼️' },
    ...(isAdmin ? [
      { id: 'principal', label: 'Panel Pengetua', emoji: '🎓' },
      { id: 'admin', label: 'Panel Admin', emoji: '⚙️' }
    ] : []),
  ];

  return (
    <>
      {/* Header Banner */}
      <header className="site-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="school-crest" style={{ overflow: 'hidden', background: 'white' }}>
              <img src="/logo.png" alt="Logo SMK Sacred Heart" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} />
            </div>
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

          {/* Live Weather, Date & Time Widget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '6px 14px',
              borderRadius: '12px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.82rem',
              backdropFilter: 'blur(6px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '1rem' }}>{weather.icon}</span>
                <span style={{ fontWeight: 800, color: 'var(--sh-yellow)' }}>{weather.temp}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>Sibu</span>
              </div>

              <div style={{ height: '16px', width: '1px', background: 'rgba(255,255,255,0.25)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} color="var(--sh-yellow)" />
                <span style={{ fontWeight: 600 }}>{dateStr}</span>
              </div>

              <div style={{ height: '16px', width: '1px', background: 'rgba(255,255,255,0.25)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={13} color="var(--sh-yellow)" />
                <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.88rem' }}>{time}</span>
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
