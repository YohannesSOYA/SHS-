import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import EFilingView from './components/EFilingView';
import StaffDirectory from './components/StaffDirectory';
import AnnouncementsView from './components/AnnouncementsView';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import { MapPin, Phone, Mail, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Check saved session token
    const savedToken = localStorage.getItem('smk_token');
    const savedUser = localStorage.getItem('smk_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAdmin(true);
    }
  }, []);

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

        {activeTab === 'efiling' && (
          <EFilingView isAdmin={isAdmin} token={token} />
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
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #c9973a, #e8b654)',
                color: '#5a1010', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem'
              }}>
                SH
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
                <MapPin size={16} color="#e8b654" /> Jalan Oya, 96000 Sibu, Sarawak
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#e8b654" /> 084-330454
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="#e8b654" /> smksacredheart.yeb3101@moe-dl.edu.my
              </div>
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
