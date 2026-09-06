import React from 'react';
import { Heart, Award, Target } from 'lucide-react';

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
  {
    id: 'timetable',
    icon: '🕒',
    title: 'Semakan Jadual Waktu',
    desc: 'Jadual waktu mengikut kelas, jadual waktu guru, dan senarai guru bertugas harian.',
    color: 'rgba(123, 28, 28, 0.1)',
    iconColor: 'var(--sh-maroon)',
  },
  {
    id: 'form6',
    icon: '🎓',
    title: 'Pusat Tingkatan 6 (STPM)',
    desc: 'Google Drive T6, pakej subjek STPM, MUET, Kerja Kursus (PBS), dan pengumuman Pra-U.',
    color: 'rgba(201, 151, 58, 0.15)',
    iconColor: 'var(--sh-gold)',
  },
];



export default function HomePage({ setActiveTab }) {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Section with School Logo GIF / Animated Background */}
      <div className="hero-animated-bg" style={{
        color: 'white',
        padding: '5rem 1.5rem 4.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Watermark Logo Left */}
        <img
          src="/logo.png"
          alt=""
          style={{
            position: 'absolute',
            left: '-60px',
            top: '5%',
            width: '320px',
            height: '320px',
            objectFit: 'contain',
            pointerEvents: 'none',
            animation: 'floatLogoLeft 12s ease-in-out infinite'
          }}
        />

        {/* Animated Watermark Logo Right */}
        <img
          src="/logo.png"
          alt=""
          style={{
            position: 'absolute',
            right: '-60px',
            bottom: '0%',
            width: '360px',
            height: '360px',
            objectFit: 'contain',
            pointerEvents: 'none',
            animation: 'floatLogoRight 14s ease-in-out infinite'
          }}
        />

        {/* Pulsing Glowing Crest Center Overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0
        }}>
          <img
            src="/logo.png"
            alt=""
            style={{
              width: '420px',
              height: '420px',
              objectFit: 'contain',
              animation: 'pulseCenterLogo 9s ease-in-out infinite'
            }}
          />
        </div>

        {/* Subtle Grid Dot Pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, #fff 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none'
        }} />

        {/* Glassmorphic Central Hero Box */}
        <div style={{
          maxWidth: '920px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '3rem 2.5rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 30px rgba(255, 242, 0, 0.1)',
          textAlign: 'center'
        }}>
          {/* Top Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 242, 0, 0.15)',
            border: '1px solid rgba(255, 242, 0, 0.4)',
            color: 'var(--sh-yellow)',
            padding: '6px 18px',
            borderRadius: '100px',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginBottom: '1.75rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            <Heart size={14} fill="var(--sh-yellow)" /> SEKOLAH MENENGAH KEBANGSAAN SACRED HEART • SIBU
          </div>

          {/* School Badge Logo Emblem */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: '#ffffff',
              padding: '6px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 242, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid var(--sh-yellow)'
            }}>
              <img src="/logo.png" alt="SMK Sacred Heart Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 5.2vw, 3.4rem)',
            fontWeight: 900,
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.15,
            marginBottom: '1rem',
            letterSpacing: '-0.5px',
            textShadow: '0 4px 20px rgba(0,0,0,0.7)'
          }}>
            Portal Rasmi Direktori SPMS & e-Filing<br />
            <span style={{ color: 'var(--sh-yellow)', position: 'relative' }}>
              SMK Sacred Heart
            </span>
          </h1>

          <p style={{
            fontSize: '1.08rem',
            color: 'rgba(255, 255, 255, 0.92)',
            maxWidth: '650px',
            margin: '0 auto 2.25rem',
            lineHeight: 1.7,
            fontWeight: 500,
            textShadow: '0 2px 10px rgba(0,0,0,0.6)'
          }}>
            Pusat rujukan bersepadu pengurusan sekolah, direktori staf, amanat pengetua, carta organisasi, dan dokumentasi e-filing warga SMK Sacred Heart, Sibu.
          </p>

          {/* Quick Action CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('schoolinfo')}
              style={{
                background: 'linear-gradient(135deg, #fff200 0%, #e8b654 100%)',
                color: '#4a0c0c',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(232, 182, 84, 0.45)',
                transition: 'all 0.25s ease'
              }}
            >
              🏛️ Terokai Info Sekolah & Doa Guru →
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '14px 24px',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.25s ease'
              }}
            >
              📢 Pengumuman Terkini
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '14px 24px',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.25s ease'
              }}
            >
              👥 Direktori Staf
            </button>
          </div>
        </div>
      </div>



      {/* Directory Hub */}
      <div className="page-wrapper" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
          <div style={{ width: '5px', height: '28px', background: 'var(--sh-maroon)', borderRadius: '10px' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px' }}>
            Direktori & Unit Pengurusan Sekolah
          </h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', paddingLeft: '17px' }}>
          Pilih unit pentadbiran di bawah untuk mengakses senarai jawatan, e-filing, dan fail dokumen rasmi sekolah.
        </p>

        <div className="directory-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {infoCards.map((card, i) => (
            <div
              key={i}
              className="dir-card"
              onClick={() => setActiveTab(card.id)}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '2rem 1.75rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  className="dir-card-icon"
                  style={{
                    background: card.color,
                    color: card.iconColor,
                    fontSize: '2.2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}
                >
                  {card.icon}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", marginBottom: '8px' }}>
                  {card.title}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {card.desc}
                </p>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--sh-maroon)',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9'
              }}>
                Buka Direktori Unit →
              </div>
            </div>
          ))}
        </div>

        {/* Mission & Vision Executive Section */}
        <div style={{
          marginTop: '3.5rem',
          background: 'linear-gradient(135deg, #4a0c0c 0%, #7b1c1c 50%, #290505 100%)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          color: 'white',
          boxShadow: '0 20px 40px rgba(90, 16, 16, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '240px',
            height: '240px',
            opacity: 0.05,
            pointerEvents: 'none'
          }}>
            <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{
                color: 'var(--sh-yellow)',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Target size={15} color="var(--sh-yellow)" /> MISI SEKOLAH
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
                Membentuk Generasi Cemerlang & Berkaliber
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', lineHeight: 1.75 }}>
                SMK Sacred Heart komited untuk melahirkan pelajar yang cemerlang dari segi akademik, sahsiah, dan rohani berlandaskan cogan kata sekolah <strong style={{ color: 'var(--sh-yellow)' }}>"BERDOA SERTA BERUSAHA"</strong>.
              </p>
            </div>

            <div>
              <div style={{
                color: 'var(--sh-yellow)',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Award size={15} color="var(--sh-yellow)" /> VISI SEKOLAH
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
                Sekolah Pilihan Komuniti Utama
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', lineHeight: 1.75 }}>
                Pendidikan Berkualiti, Insan Terdidik, Negara Sejahtera. Menjadi pusat kecemerlangan pendidikan berprestij tinggi di Sarawak dan Malaysia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
