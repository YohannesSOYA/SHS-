import React, { useState } from 'react';
import { BookOpen, Heart, Shield, Award, Sparkles, Scroll, Copy, Check, ChevronDown, Target, Star, FileText, Compass, Flag } from 'lucide-react';

export default function SchoolInfo() {
  const [selectedProfileItem, setSelectedProfileItem] = useState('prayer'); // 'prayer' | 'vmm' | 'objectives' | 'core_values' | 'charter' | 'focus_strategies' | 'badge' | 'rally' | 'lasallian'
  const [copiedPrayer, setCopiedPrayer] = useState(false);

  const teacherPrayerText = `God
Grant me wisdom, creativity and love,
With wisdom,
I may look to the future and see the effect
then my teaching will have on these children,
and thus adapt my methods
to fit the needs of each one.

With creativity,
I can prepare new and interesting projects
that can challenge my students
and expand their minds
to set higher goals and dream loftier dreams.

With love,
I can praise my students for jobs well done
and encourage them to get up
and go on when they fail,

Lord reveal yourself through me.
Amen.`;

  const copyPrayer = () => {
    navigator.clipboard.writeText(teacherPrayerText);
    setCopiedPrayer(true);
    setTimeout(() => setCopiedPrayer(false), 2000);
  };

  const profileOptions = [
    { id: 'prayer', label: "Doa Guru (Teacher's Prayer)", icon: '✨' },
    { id: 'vmm', label: 'Visi, Misi, Matlamat & Motto', icon: '🎯' },
    { id: 'objectives', label: 'Objektif Sekolah (Objectives)', icon: '📌' },
    { id: 'core_values', label: 'Nilai-Nilai Teras (Core Values)', icon: '⭐' },
    { id: 'charter', label: 'Piagam Pelanggan (Client\'s Charter)', icon: '📜' },
    { id: 'focus_strategies', label: 'Fokus Utama & Strategi (Main Focus & Strategies)', icon: '🚀' },
    { id: 'badge', label: 'Lencana Sekolah (School Badge)', icon: '🛡️' },
    { id: 'rally', label: 'Lagu Semangat Sekolah (School Rally)', icon: '🎶' },
    { id: 'lasallian', label: '5 Prinsip Teras Lasallian (Lasallian Principles)', icon: '🏅' },
  ];

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--sh-maroon-dark) 0%, var(--sh-red) 60%, var(--sh-maroon) 100%)',
        borderRadius: '20px',
        padding: '2.5rem',
        color: 'white',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(123, 28, 28, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', right: '-20px', bottom: '-30px', opacity: 0.1,
          fontSize: '12rem', fontWeight: 900, userSelect: 'none', pointerEvents: 'none'
        }}>
          SHS
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,242,0,0.2)', border: '1px solid rgba(255,242,0,0.35)', color: 'var(--sh-yellow)', padding: '5px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
          <Heart size={14} fill="var(--sh-yellow)" /> MAKLUMAT & PROFIL RASMI SEKOLAH
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, fontFamily: "'Outfit', sans-serif", margin: '0 0 0.5rem 0' }}>
          Maklumat & Profil <span style={{ color: 'var(--sh-yellow)' }}>SMK Sacred Heart</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '750px', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
          Maklumat sejarah rasmi sekolah dan profil lengkap yang merangkumi Visi, Misi, Doa Guru, Piagam Pelanggan, Nilai Teras, serta Prinsip Lasallian.
        </p>
      </div>

      {/* SEJARAH SEKOLAH (Direct Narrative Text) */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e4e8f0', padding: '2.25rem', marginBottom: '2.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(123,28,28,0.08)', color: 'var(--sh-maroon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scroll size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Outfit', sans-serif" }}>
              Sejarah Laman Web SHS (History of SHS Website)
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>Dari Geocities 1997 Hingga shssibu.com</span>
          </div>
        </div>

        <div style={{ fontSize: '0.96rem', color: '#334155', lineHeight: 1.9, background: '#f8fafc', padding: '1.75rem 2rem', borderRadius: '14px', borderLeft: '4px solid var(--sh-maroon)' }}>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            The story of Sacred Heart Secondary School or SHS Website started in 1997. Lam Jiih Kui, a student of the school spotted a rare site. At that time it could be said to be rare because few schools had a website then. Then he contacted his friend, Alex Ling Zi Neng about it. The school site based at Geocities was rather simple, according to the two students. Mr. Ong Chin Kim, a Physics teacher of the school was the one who created that site. The two students offered suggestions to improve the school website through an e-mail to Mr. Ong.
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            Mr. Ong then called the two and another student to meet him. Thomas Ting, a fourth former, was more experienced than Lam and Alex at building a page on the website. Mr. Ong formed a team and so with these three students they started off to make improvements to the original site. The team collected information, photographs and data about the school to furnish the site with not the most up-to-date tools but using simple Java scripts running on the MIDI player. They would upgrade the site regularly with the latest information about the school.
          </p>
          <p style={{ margin: '0 0 1.1rem 0', fontStyle: 'italic', color: '#64748b', background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            " The other student was Tay Cheng Hui. From : Cikgu Ong (23-02-2011) "
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            When the website was quite completed, Mr Ong proposed to the principal, Mr Peter Wong, to officially launch the SHS Website as part of the Teachers' Day celebration of the school. So on <strong>5th June 1998</strong>, the webteam led by Mr Ong Chin Kim, accompanied by the principal, were at the launching ceremony officiated by the late <strong>YB Datuk Robert Lau Hoi Chew</strong>. Other VIPs present were Datuk Teng Chin Hua and members of the School Board.
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            Sacred Heart School Webteam continued to work at improving the site. With the help of a new program that they accidentally come across, Front Page 98 assisted their editing and updating greatly. They replaced HTML with ActiveX. To accommodate the expanding website, a second version of SHS website was created to contain more information which included the latest news of the school, exams results, clubs and societies in the school. (But the server of the second version based on 2020Net was soon shut down.) The team was happy with the layout and graphic design but to them at that time, it was not good enough to come top in the state competition. (More of this later) Nevertheless, it was a class of its own. This was the website that won the <strong>Sarawak Secondary School's Web Design Competition organized by SAINS</strong>. The team is proud to present it to you at{' '}
            <a href="http://schools.sains.com.my/smbsh/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sh-maroon)', fontWeight: 700 }}>http://schools.sains.com.my/smbsh/</a>
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            <strong>1999</strong> was a difficult year with most members of the team in exam classes. Moreover, Mr Ong, the teacher advisor, left the school for further studies. Mr. Ngu Joo was the new teacher-in-charge. The computer club was formed led by Joni Kang from Form 4 Science. Students who joined the club were encouraged to carry out html programming and collecting data. In July of the same year the school was invited to take part in in the Secondary School Web Design Competition organized by the Sarawak Information System or SAINS. When they sent in their participation they did not expect to get anything because they had no time to do any last minute touch up for the website. So when they were chosen as the winner, having beaten <strong>20 other schools in the state</strong>, they were beside themselves.
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            Then in <strong>2001</strong>, the school website was further upgraded with <strong>Project 2001</strong> and renamed <strong>SHS Millennium Website</strong>. To Alex and his team it was to be a mark in the field of information technology as we approached the new millennium. They were so proud of the website that they even include the following as their motto: <em>"Building A Future Of Our Own."</em>
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            The old school website was:{' '}
            <a href="http://shssibu.tripod.com/SHSframe.htm" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sh-maroon)', fontWeight: 700 }}>http://shssibu.tripod.com/SHSframe.htm</a>
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            When the late Mr Lau Kui Poh took over as the teacher in charge in <strong>2006</strong>, the school website was going strong, loaded with up-to-date information of the progress of the school. Under the new principal, Mr Vincent Liong Shou Chuan and the help of Mr Ngu Mee Ung, who was Head of ICT Resource Centre of the school, a new base in geocities was set up to link the various clubs and societies of the school. Somehow this resulted in a misuse of GEOCITIES and to solve the problem the school decided to come up with its own domain name – <a href="http://www.shssibu.edu.my" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sh-maroon)', fontWeight: 700 }}>http://www.shssibu.edu.my</a>. SMS Parradot Company was contacted and a new base with the new domain name was established at a cost of RM100 with a web space increased to 2GB costing RM400.
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            By <strong>2007</strong> a well-established website of the school could be viewed and it was constantly up-dated with news and data. A new team was set up to monitor the school site. Kong Lung Wei, a student good in IT helped by sharing his expertise to update and improved it. However in December of that year the school web server encountered a connection problem.
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            So the following year <strong>2008</strong>, the school website had to move to a new server. This solved the problem that was bothering the upgrading earlier on, but of course, at a cost of RM230. This time the web space was reduced to 1 GB with 5GB Bandwidth.
          </p>
          <p style={{ margin: '0 0 1.1rem 0' }}>
            With the passing of Mr Lau in a tragic car accident in <strong>June 2009</strong>, the task of Guru Data and Webmaster was carried on by Mr Moh Heng Yiing. He, being new, according to him, had to learn many things such as html, Java, Microsoft Front Page, CSS Script, taking photographs, uploading data etc. By year end he had more or less grasped and completed most of his task.
          </p>
          <p style={{ margin: 0 }}>
            In early <strong>2010</strong> the website was once again marked for further improvement and upgrading based on java, CSS, php, web2.0 and html 5 concepts. In April of the same, the principal, Mr Liong, went on to upgrade with a system bought from Schoolmate costing RM800. This is based on the <strong>Joomla system</strong> with an unlimited storage space. To maintain the domain name and web space an annual fee of RM120 has be paid. Mr Moh started transferring all the contents to{' '}
            <a href="http://www.shssibu.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sh-maroon)', fontWeight: 700 }}>http://www.shssibu.com</a>. He is still at it at the time of this writing.
          </p>
        </div>
      </div>

      {/* PROFIL SEKOLAH (Dropdown Selection UI) */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e4e8f0', padding: '2.25rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <Shield color="var(--sh-maroon)" size={24} />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Outfit', sans-serif" }}>
              Profil Sekolah (School Profile)
            </h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Pilih item profil sekolah daripada senarai dropdown di bawah untuk melihat maklumat terperinci:
          </p>
        </div>

        {/* Dropdown Menu Control */}
        <div style={{ marginBottom: '2rem', maxWidth: '500px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--sh-maroon-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pilih Item Profil Sekolah:
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedProfileItem}
              onChange={(e) => setSelectedProfileItem(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 45px 14px 16px',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1e293b',
                background: '#f8fafc',
                border: '2px solid #cbd5e1',
                borderRadius: '12px',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              {profileOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={20} color="#64748b" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* DROPDOWN CONTENT RENDERING */}

        {/* 1. TEACHER'S PRAYER */}
        {selectedProfileItem === 'prayer' && (
          <div style={{
            background: 'linear-gradient(135deg, #1e1b18 0%, #3a2219 100%)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            color: '#fef3c7',
            border: '2px solid rgba(232, 182, 84, 0.4)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={24} color="var(--sh-yellow)" />
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--sh-yellow)', fontFamily: "'Outfit', sans-serif" }}>
                  Teacher's Prayer (Doa Guru)
                </h3>
              </div>
              <button
                onClick={copyPrayer}
                style={{
                  background: copiedPrayer ? '#22c55e' : 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedPrayer ? <Check size={16} /> : <Copy size={16} />}
                {copiedPrayer ? 'Disalin!' : 'Salin Teks Doa'}
              </button>
            </div>

            <div style={{
              fontFamily: "'Georgia', serif",
              fontSize: '1.08rem',
              lineHeight: 1.9,
              color: '#fef08a',
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: '14px',
              border: '1px dashed rgba(232,182,84,0.3)'
            }}>
              <p style={{ fontWeight: 700, fontSize: '1.3rem', color: 'white', marginBottom: '1rem' }}>God</p>
              <p style={{ marginBottom: '1.5rem' }}>Grant me wisdom, creativity and love,</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <strong style={{ color: 'var(--sh-yellow)', display: 'block', marginBottom: '4px' }}>With wisdom,</strong>
                I may look to the future and see the effect<br />
                then my teaching will have on these children,<br />
                and thus adapt my methods to fit the needs of each one.
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <strong style={{ color: 'var(--sh-yellow)', display: 'block', marginBottom: '4px' }}>With creativity,</strong>
                I can prepare new and interesting projects<br />
                that can challenge my students and expand their minds<br />
                to set higher goals and dream loftier dreams.
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <strong style={{ color: 'var(--sh-yellow)', display: 'block', marginBottom: '4px' }}>With love,</strong>
                I can praise my students for jobs well done<br />
                and encourage them to get up and go on when they fail,
              </div>

              <p style={{ fontStyle: 'italic', color: 'white', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                Lord reveal yourself through me.
              </p>
              <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--sh-yellow)', margin: 0 }}>
                Amen.
              </p>
            </div>
          </div>
        )}

        {/* 2. VISI, MISI, MATLAMAT & MOTTO */}
        {selectedProfileItem === 'vmm' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', borderRadius: '16px', padding: '1.75rem' }}>
              <div style={{ color: 'var(--sh-yellow)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Motto Sekolah
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
                Berdoa Serta Berusaha
              </h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                (Pray and Strive) — Menekankan keseimbangan antara pegangan rohani serta usaha gigih untuk mencapai kejayaan.
              </p>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: 'var(--sh-yellow)', fontWeight: 700 }}>
                Lasallian Motto: Signum Fidei (Sign of Faith / Tanda Iman)
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
              <div style={{ color: 'var(--sh-red)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Visi Sekolah
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
                Pendidikan Berkualiti, Insan Terdidik, Negara Sejahtera
              </h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Menyediakan persekitaran pembelajaran yang berkualiti tinggi bagi melahirkan modal insan berakhlak mulia dan bersahsiah terpuji.
              </p>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
              <div style={{ color: 'var(--sh-blue)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Misi Sekolah
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
                Melestarikan Sistem Pendidikan Yang Berkualiti
              </h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Membangunkan potensi individu secara menyeluruh bagi memenuhi aspirasi murid, komuniti, dan negara Malaysia.
              </p>
            </div>
          </div>
        )}

        {/* 3. OBJEKTIF SEKOLAH */}
        {selectedProfileItem === 'objectives' && (
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
              📌 Objektif SMK Sacred Heart (School Objectives)
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', lineHeight: 1.8, fontSize: '0.95rem' }}>
              <li>Mencapai kecemerlangan akademik dalam peperiksaan SPM dan STPM secara berterusan.</li>
              <li>Meningkatkan penglibatan murid dalam aktiviti kokurikulum dan sukan di peringkat daerah, negeri, dan kebangsaan.</li>
              <li>Memupuk disiplin tinggi, nilai integriti, serta jati diri murid berlandaskan nilai teras Lasallian.</li>
              <li>Mewujudkan persekitaran sekolah yang selamat, kondusif, dan mesra pembelajaran.</li>
            </ul>
          </div>
        )}

        {/* 4. NILAI-NILAI TERAS */}
        {selectedProfileItem === 'core_values' && (
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
              ⭐ Nilai-Nilai Teras (Core Values)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Integriti & Kejujuran', desc: 'Sentiasa bersikap jujur dan telus dalam tindakan.' },
                { title: 'Kecemerlangan (Excellence)', desc: 'Sentiasa berusaha memberikan yang terbaik dalam setiap bidang.' },
                { title: 'Hormat & Kasih Sayang', desc: 'Menghormati kepelbagaian kaum dan agama dengan penuh kasih.' },
                { title: 'Semangat Berkhidmat', desc: '"Enter to Learn, Leave to Serve" — Berkhidmat demi masyarakat.' }
              ].map((val, idx) => (
                <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--sh-maroon)' }}>{val.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PIAGAM PELANGGAN */}
        {selectedProfileItem === 'charter' && (
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
              📜 Piagam Pelanggan (Client's Charter)
            </h3>
            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.7, margin: '0 0 1rem 0' }}>
              Kami warga SMK Sacred Heart komited untuk memberikan perkhidmatan mesra, cekap, dan profesional kepada semua pelanggan:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Memberikan perkhidmatan kaunter pengurusan yang mesra dan pantas dalam tempoh 15 minit.',
                'Memastikan pengajaran dan pembelajaran (PdP) berjalan mengikut jadual waktu yang ditetapkan.',
                'Memaklumkan maklumat terkini sekolah dan rekod pencapaian murid kepada ibu bapa secara telus.',
                'Menyediakan persekitaran sekolah yang selamat, bersih, dan berdisiplin tinggi.'
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: 'var(--sh-green)', fontWeight: 800 }}>✓</span>
                  <span style={{ fontSize: '0.88rem', color: '#334155' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FOKUS UTAMA & STRATEGI */}
        {selectedProfileItem === 'focus_strategies' && (
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
              🚀 Fokus Utama & Strategi Sekolah
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--sh-blue)', fontWeight: 800 }}>Fokus Akademik</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Pengukuhan subjek teras SPM/STPM melalui kelas bimbingan berfokus, analitik pencapaian murid, dan modul kecemerlangan.
                </p>
              </div>
              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--sh-green)', fontWeight: 800 }}>Fokus Kokurikulum</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  Peningkatan bakat kepimpinan dan sukan menerusi penglibatan aktif dalam kelab, persatuan, dan badan beruniform.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. LENCANA SEKOLAH */}
        {selectedProfileItem === 'badge' && (
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
              🛡️ Lencana Sekolah (School Badge)
            </h3>
            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.7 }}>
              Lencana rasmi SMK Sacred Heart mengandungi lambang <strong>Salib</strong>, <strong>Mahkota</strong>, dan <strong>Hati Kudus (Sacred Heart)</strong> yang melambangkan pengorbanan, kemuliaan, serta dedikasi pendidikan berlandaskan nilai-nilai murni keimanan. Warna merah, kuning, dan biru melambangkan keberanian, kemuliaan, dan kesetiaan.
            </p>
          </div>
        )}

        {/* 8. LAGU SEMANGAT SEKOLAH */}
        {selectedProfileItem === 'rally' && (
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
              🎶 School Rally (Lagu Semangat Sekolah)
            </h3>
            <div style={{ fontStyle: 'italic', color: '#334155', lineHeight: 1.8, background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 700 }}>"All through our college, a voice is resounding,"</p>
              <p style={{ margin: '0 0 8px 0' }}>Promptly respond to your duty's sweet call;</p>
              <p style={{ margin: '0 0 8px 0' }}>Hearken you all, for the trumpet is sounding,</p>
              <p style={{ margin: '0 0 1rem 0' }}>Your Alma Mater's a-calling us all!</p>

              <p style={{ margin: '0 0 8px 0', color: 'var(--sh-maroon)', fontWeight: 800 }}>CHORUS:</p>
              <p style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'var(--sh-maroon)' }}>Forward, Sacred Heart School, onward to glory,</p>
              <p style={{ margin: 0, fontWeight: 800, color: 'var(--sh-maroon)' }}>Pray and strive for victory!</p>
            </div>
          </div>
        )}

        {/* 9. 5 PRINSIP TERAS LASALLIAN */}
        {selectedProfileItem === 'lasallian' && (
          <div style={{ background: '#fffbeb', borderRadius: '16px', padding: '1.75rem', border: '1px solid #fef3c7' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#92400e', fontFamily: "'Outfit', sans-serif" }}>
              🏅 5 Prinsip Teras Lasallian (5 Lasallian Core Principles)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                { num: '1', title: 'Faith & Love in God', desc: 'Caring & loving God & to see the world through the "eyes of faith".' },
                { num: '2', title: 'Service to Others', desc: '"Enter to Learn, Leave to Serve" — Belajar untuk berkhidmat.' },
                { num: '3', title: 'Presence of God', desc: '"Live God in our hearts... Forever" — Menghayati kehadiran Tuhan.' },
                { num: '4', title: 'Holistic Teaching', desc: '"Teaching Minds & Touching Hearts" — Mendidik minda & menyentuh hati.' },
                { num: '5', title: 'Inclusivity & Unity', desc: 'A united community where diversity is respected.' }
              ].map((p, idx) => (
                <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ background: 'var(--sh-yellow)', color: 'var(--sh-maroon-dark)', fontWeight: 900, width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>{p.num}</span>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#78350f' }}>{p.title}</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#92400e', fontStyle: 'italic' }}>"{p.desc}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
