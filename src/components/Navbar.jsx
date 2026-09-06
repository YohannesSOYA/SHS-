import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Shield, Calendar, Clock } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAdmin, user, onLoginClick, onLogoutClick }) {
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [weather, setWeather] = useState({ temp: '31°C', desc: 'Cerah', icon: '☀️' });
  const [unreadCount, setUnreadCount] = useState(0);

  const checkUnreadAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const list = await res.json();
        const lastSeenId = parseInt(localStorage.getItem('smk_last_seen_announcement_id') || '0', 10);
        
        if (activeTab === 'announcements') {
          if (list.length > 0) {
            const maxId = Math.max(...list.map(a => a.id));
            localStorage.setItem('smk_last_seen_announcement_id', String(maxId));
          }
          setUnreadCount(0);
        } else {
          const unread = list.filter(a => a.id > lastSeenId).length;
          setUnreadCount(unread);
        }
      }
    } catch (err) {
      console.error('Error fetching announcements count:', err);
    }
  };

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

  useEffect(() => {
    checkUnreadAnnouncements();
    const interval = setInterval(checkUnreadAnnouncements, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const tabs = [
    { id: 'home', label: 'Laman Utama', emoji: '🏠' },
    { id: 'schoolinfo', label: 'Info Sekolah', emoji: '🏛️' },
    { id: 'songs', label: 'Lagu & Video Sekolah', emoji: '🎵' },
    { id: 'staff', label: 'Direktori Staf', emoji: '👥' },
    { id: 'announcements', label: 'Pengumuman', emoji: '📢' },
    { id: 'orgchart', label: 'Carta Organisasi', emoji: '📊' },
    { id: 'gallery', label: 'Galeri Aktiviti', emoji: '🖼️' },
    { id: 'timetable', label: 'Jadual Waktu', emoji: '🕒' },
    { id: 'form6', label: 'Tingkatan 6 (STPM)', emoji: '🎓' },
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
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{tab.emoji}</span> {tab.label}
              {tab.id === 'announcements' && unreadCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  borderRadius: '50px',
                  padding: '2px 7px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '18px',
                  height: '18px',
                  lineHeight: 1,
                  border: '1px solid #ffffff'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
