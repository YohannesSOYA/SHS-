import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EFilingView from './components/EFilingView';
import StaffDirectory from './components/StaffDirectory';
import AnnouncementsView from './components/AnnouncementsView';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import { School, MapPin, Phone, Mail, Globe, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('efiling');
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
      setActiveTab('efiling');
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
      <footer>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'white' }}>
                <School size={24} color="#3b82f6" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>SMK LUNDU</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6' }}>
                Portal Rasmi Sekolah & Sistem E-Filing SPMS Direktori SMK Lundu, Lundu, Sarawak.
              </p>
            </div>

            <div>
              <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Hubungi Pejabat</h4>
              <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="#3b82f6" /> Jalan Bau-Lundu, 94500 Lundu, Sarawak
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} color="#3b82f6" /> 082-735234
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color="#3b82f6" /> smklundu.yeb1301@moe-dl.edu.my
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Akses Sistem</h4>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                <p style={{ marginBottom: '8px' }}>• Mod Awam: Akses carian dan muat turun dokumen tanpa log masuk.</p>
                <p>• Mod Admin: Log masuk dengan kredensial untuk mengedit fail e-filing & maklumat guru.</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
            © 2026 SMK Lundu. Hak Cipta Terelihara | Sistem Pengurusan Maklumat Sekolah (SPMS) & E-Filing.
          </div>
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
