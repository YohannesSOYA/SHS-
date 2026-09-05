import React from 'react';
import { MapPin, Phone, Mail, Heart, Star, BookOpen, Users, Award, Target } from 'lucide-react';

const infoCards = [
  {
    id: 'kurikulum',
    icon: '📚',
    title: 'Kurikulum & Akademik',
    desc: 'Maklumat panitia, jadual peperiksaan, dan hasil pencapaian murid.',
    color: 'rgba(41, 171, 226, 0.1)',
    iconColor: 'var(--sh-blue)',
  },
  {
    id: 'kokurikulum',
    icon: '🏅',
    title: 'Kokurikulum & Sukan',
    desc: 'Kelab, persatuan, pasukan sukan, dan pencapaian pertandingan.',
    color: 'rgba(0, 146, 69, 0.1)',
    iconColor: 'var(--sh-green)',
  },
  {
    id: 'hem',
    icon: '🤝',
    title: 'Hal Ehwal Murid',
    desc: 'Kebajikan pelajar, disiplin, bimbingan kaunseling, dan program sahsiah.',
    color: 'rgba(255, 242, 0, 0.15)',
    iconColor: '#eab308',
  },
  {
    id: 'pentadbiran',
    icon: '🏫',
    title: 'Pentadbiran Sekolah',
    desc: 'Struktur organisasi, pekeliling, dan dasar pengurusan sekolah.',
    color: 'rgba(230, 28, 36, 0.1)',
    iconColor: 'var(--sh-red)',
  },
];

const quickStats = [
  { val: '1,200+', label: 'Pelajar Berdaftar', icon: <Users size={22} color="var(--sh-red)" /> },
  { val: '85+', label: 'Tenaga Pengajar', icon: <BookOpen size={22} color="var(--sh-blue)" /> },
  { val: '40+', label: 'Kelab & Persatuan', icon: <Star size={22} color="var(--sh-yellow)" /> },
  { val: '1931', label: 'Tahun Ditubuhkan', icon: <Award size={22} color="var(--sh-green)" /> },
];

export default function HomePage({ setActiveTab }) {
  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--sh-maroon-dark) 0%, var(--sh-red) 50%, var(--sh-maroon) 100%)',
        color: 'white',
        padding: '4rem 2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255, 242, 0, 0.2)', border: '1px solid rgba(255, 242, 0, 0.4)',
            color: 'var(--sh-yellow)', padding: '6px 16px', borderRadius: '100px',
            fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '1.5rem'
          }}>
            <Heart size={14} fill="var(--sh-yellow)" /> PORTAL RASMI SEKOLAH 2026
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900,
            fontFamily: "'Outfit', sans-serif", lineHeight: 1.15, marginBottom: '0.75rem'
          }}>
            Selamat Datang ke<br />
            <span style={{ color: 'var(--sh-yellow)' }}>SMK Sacred Heart</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Portal Direktori SPMS, e-Filing, dan maklumat sekolah rasmi untuk warga
            SMK Sacred Heart, Sarawak. Akses mudah untuk guru, pelajar, dan ibu bapa.
          </p>


        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ background: 'white', borderBottom: '1px solid #e4e8f0', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {quickStats.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.5rem 1.5rem', borderRight: i < quickStats.length - 1 ? '1px solid #e4e8f0' : 'none' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(123,28,28,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1, fontFamily: "'Outfit',sans-serif" }}>{s.val}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directory Hub */}
      <div className="page-wrapper">
        <div style={{ marginBottom: '2rem', marginTop: '0.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Outfit', sans-serif" }}>
            Direktori & Maklumat Utama
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
            Akses cepat ke direktori SPMS, unit, dan fail e-filing mengikut jabatan.
          </p>
        </div>

        <div className="directory-grid">
          {infoCards.map((card, i) => (
            <div
              key={i}
              className="dir-card"
              onClick={() => setActiveTab(card.id)}
              style={{ cursor: 'pointer', transition: 'all 0.25s ease' }}
            >
              <div
                className="dir-card-icon"
                style={{ background: card.color, color: card.iconColor, fontSize: '2rem' }}
              >
                {card.icon}
              </div>
              <div>
                <div className="dir-card-title">{card.title}</div>
                <div className="dir-card-count" style={{ marginTop: '4px' }}>{card.desc}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--sh-maroon)', marginTop: '10px' }}>
                  Buka Panel Unit →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mission Card */}
        <div style={{
          marginTop: '2.5rem',
          background: 'linear-gradient(135deg, var(--sh-red) 0%, var(--sh-maroon-dark) 100%)',
          borderRadius: '20px',
          padding: '2.5rem',
          color: 'white',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <div style={{ color: 'var(--sh-yellow)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Misi Sekolah</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px', fontFamily: "'Outfit',sans-serif" }}>
              Membentuk Generasi Cemerlang
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              SMK Sacred Heart komited untuk melahirkan pelajar yang cemerlang dari segi akademik, sahsiah, dan rohani bagi menghadapi cabaran masa depan.
            </p>
          </div>
          <div>
            <div style={{ color: 'var(--sh-yellow)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Visi Sekolah</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px', fontFamily: "'Outfit',sans-serif" }}>
              Sekolah Pilihan Komuniti
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              Menjadi sekolah pilihan yang menghasilkan warga negara bertanggungjawab, beridentiti kuat, dan mampu bersaing di peringkat global.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
