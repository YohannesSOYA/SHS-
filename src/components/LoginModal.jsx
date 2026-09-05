import React, { useState } from 'react';
import { Lock, User, X, AlertCircle, Shield, UserPlus } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { name, username, password } : { username, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isRegister ? 'Pendaftaran gagal.' : 'Log masuk gagal.'));
      }

      if (isRegister) {
        alert(data.message);
        setIsRegister(false);
      } else {
        onLoginSuccess(data.token, data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="#e8b654" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isRegister ? 'Daftar Pentadbir Baharu' : 'Log Masuk Pentadbir'}
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              Portal Admin SMK Sacred Heart
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form id="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Nama Penuh</label>
                <div style={{ position: 'relative' }}>
                  <UserPlus size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama penuh"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nama Pengguna (Username)</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Kata Laluan (Password)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata laluan"
                  required
                />
              </div>
            </div>

            {!isRegister && (
              <div className="alert alert-info" style={{ marginTop: '1rem', marginBottom: 0 }}>
                <div>
                  <strong>Akaun Default Admin:</strong><br />
                  Username: <code>admin</code> | Password: <code>admin123</code>
                </div>
              </div>
            )}
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              style={{
                background: 'none', border: 'none', color: 'var(--sh-red)',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              {isRegister ? 'Sudah ada akaun? Log Masuk' : 'Belum ada akaun? Daftar Admin'}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" form="auth-form" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sila tunggu...' : (isRegister ? 'Daftar' : 'Log Masuk')}
          </button>
        </div>
      </div>
    </div>
  );
}
