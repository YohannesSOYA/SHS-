import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import EFilingView from './components/EFilingView';
import StaffDirectory from './components/StaffDirectory';
import AnnouncementsView from './components/AnnouncementsView';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import OrganizationChart from './components/OrganizationChart';
import Gallery from './components/Gallery';
import PrincipalPanel from './components/PrincipalPanel';
import UnitPanel from './components/UnitPanel';
import SchoolInfo from './components/SchoolInfo';
import SongPanel from './components/SongPanel';
import TimetablePanel from './components/TimetablePanel';
import Form6Panel from './components/Form6Panel';
import { MapPin, Phone, Mail, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({
    address: 'Jalan Oya, 96000 Sibu, Sarawak',
    phone: '084-330454',
    email: 'smksacredheart.yeb3101@moe-dl.edu.my',
    facebook: '#'
  });

  useEffect(() => {
    // Check saved session token
    const savedToken = localStorage.getItem('smk_token');
    const savedUser = localStorage.getItem('smk_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAdmin(true);
    }

    fetch('/api/school-info')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSchoolInfo(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, [activeTab]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsAdmin(true);
    localStorage.setItem('smk_token', newToken);
    localStorage.setItem('smk_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('smk_token');
    localStorage.removeItem('smk_user');
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        user={user}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomePage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'schoolinfo' && (
          <SchoolInfo />
        )}

        {activeTab === 'songs' && (
          <SongPanel isAdmin={isAdmin} token={token} />
        )}
        {activeTab === 'principal' && (
          <PrincipalPanel isAdmin={isAdmin} token={token} />
        )}

        {['kurikulum', 'kokurikulum', 'hem', 'pentadbiran'].includes(activeTab) && (
          <UnitPanel unitKey={activeTab} isAdmin={isAdmin} token={token} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'staff' && (
          <StaffDirectory isAdmin={isAdmin} token={token} />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsView isAdmin={isAdmin} token={token} />
        )}

        {activeTab === 'admin' && isAdmin && (
          <AdminPanel token={token} user={user} />
        )}

        {activeTab === 'orgchart' && (
          <OrganizationChart isAdmin={isAdmin} token={token} />
        )}

        {activeTab === 'gallery' && (
          <Gallery isAdmin={isAdmin} token={token} />
        )}

        {activeTab === 'timetable' && (
          <TimetablePanel isAdmin={isAdmin} token={token} />
        )}

        {activeTab === 'form6' && (
          <Form6Panel isAdmin={isAdmin} token={token} />
        )}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'white',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                <img src="/logo.png" alt="Logo SMK Sacred Heart" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', fontFamily: "'Outfit', sans-serif" }}>
                SMK SACRED HEART
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6' }}>
              Portal Rasmi Sekolah & Sistem E-Filing Direktori SPMS SMK Sacred Heart, Sibu, Sarawak.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Hubungi Pejabat</h4>
            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#e8b654" /> {schoolInfo.address || 'Jalan Oya, 96000 Sibu, Sarawak'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#e8b654" /> {schoolInfo.phone || '084-330454'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="#e8b654" /> {schoolInfo.email || 'smksacredheart.yeb3101@moe-dl.edu.my'}
              </div>
              <a 
                href={schoolInfo.facebook && schoolInfo.facebook.trim() ? (schoolInfo.facebook.startsWith('http') ? schoolInfo.facebook : `https://${schoolInfo.facebook}`) : '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: '#cbd5e1', 
                  textDecoration: 'none',
                  marginTop: '2px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8b654" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Facebook Rasmi Sekolah
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Mod Akses Sistem</h4>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>• <strong>Mod Awam:</strong> Akses carian dan muat turun dokumen tanpa log masuk.</p>
              <p>• <strong>Mod Admin:</strong> Log masuk dengan akaun pentadbir untuk mengedit fail e-filing & maklumat guru.</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 SMK Sacred Heart. Hak Cipta Terelihara | Sistem Pengurusan Maklumat Sekolah (SPMS) & E-Filing.
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
