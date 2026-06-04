'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Avatar3D from '@/components/edubot/Avatar3D/Avatar3D';
import EduNavbar from '@/components/edubot/Navbar/EduNavbar';
import useEduStore from './store/useEduStore';

const SUBJECTS = [
  { name: 'Mathematics',       icon: 'math', color: '#FF6B00', desc: 'Algebra, Calculus, Geometry' },
  { name: 'Physics',           icon: 'physics',  color: '#7C3AED', desc: 'Mechanics, Optics, Thermodynamics' },
  { name: 'Chemistry',         icon: 'chemistry', color: '#F59E0B', desc: 'Atoms, Bonds, Reactions' },
  { name: 'Biology',           icon: 'biology', color: '#10B981', desc: 'Cells, Genetics, Ecology' },
  { name: 'History',           icon: 'history', color: '#EF4444', desc: 'Ancient, Medieval, Modern India' },
  { name: 'Geography',         icon: 'geography', color: '#3B82F6', desc: 'Maps, Climate, Resources' },
  { name: 'English',           icon: 'english', color: '#EC4899', desc: 'Grammar, Literature, Writing' },
  { name: 'Computer Science',  icon: 'computer_science', color: '#FF9933', desc: 'Programming, Data Structures' },
];

const LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'en-IN', label: 'English' },
  { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'te-IN', label: 'తెలుగు' },
  { code: 'bn-IN', label: 'বাংলা' },
  { code: 'mr-IN', label: 'मराठी' },
  { code: 'gu-IN', label: 'ગુજરાતી' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ' },
  { code: 'ml-IN', label: 'മലയാളം' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ' },
];

const FEATURES = [
  { icon: 'chat', label: 'Voice Chat', desc: 'Ask in your language, get answers instantly', href: '/chat' },
  { icon: 'scan', label: 'Scan Questions', desc: 'Point camera at textbook, get step-by-step solutions', href: '/scanner' },
  { icon: 'notes', label: 'Smart Notes', desc: 'Generate structured NCERT notes on any topic', href: '/notes' },
  { icon: 'quiz', label: 'Adaptive Quiz', desc: 'Test yourself with AI-generated MCQs', href: '/quiz' },
  { icon: 'video', label: 'Video Lessons', desc: 'Best YouTube NCERT explanations for every topic', href: '/videos' },
  { icon: 'progress', label: 'Progress Track', desc: 'Track your weak areas and growth over time', href: '/dashboard' },
];

function renderSubjectIcon(iconName) {
  const props = { width: 24, height: 24, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (iconName) {
    case 'math':
      return <svg {...props}><path d="M22 10v12H2V2l20 8z"/><path d="M6 18l12-6"/></svg>;
    case 'physics':
      return <svg {...props}><ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(-45 12 12)"/><circle cx="12" cy="12" r="2"/></svg>;
    case 'chemistry':
      return <svg {...props}><path d="M10 2v7.31L4.75 19.3a1 1 0 0 0 .81 1.7h12.88a1 1 0 0 0 .81-1.7L14 9.31V2ZM8.5 2h7M7 16h10"/></svg>;
    case 'biology':
      return <svg {...props}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2ZM19 2c-2.26 4.33-5.27 7.14-8 10"/></svg>;
    case 'history':
      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>;
    case 'geography':
      return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
    case 'english':
      return <svg {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    case 'computer_science':
      return <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    default:
      return null;
  }
}

function renderFeatureIcon(iconName) {
  const props = { width: 32, height: 32, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (iconName) {
    case 'chat':
      return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case 'scan':
      return <svg {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case 'notes':
      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>;
    case 'quiz':
      return <svg {...props}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
    case 'video':
      return <svg {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
    case 'progress':
      return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    default:
      return null;
  }
}


let seeded = false;

export default function EduBotLanding() {
  const { language, setLanguage, subject, setSubject, setAvatarMood } = useEduStore();
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  useEffect(() => {
    setAvatarMood('happy');
    const t = setTimeout(() => setAvatarMood('idle'), 3000);

    // Auto-seed NCERT data on first visit
    if (!seeded) {
      seeded = true;
      setSeeding(true);
      fetch('/api/seed', { method: 'POST' })
        .then(() => { setSeedDone(true); })
        .catch(() => { setSeedDone(true); })
        .finally(() => setSeeding(false));
    } else {
      setSeedDone(true);
    }

    return () => clearTimeout(t);
  }, [setAvatarMood]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <EduNavbar />

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 60px',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Avatar */}
        <div style={{ marginBottom: 32 }}>
          <Avatar3D />
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16, maxWidth: 800 }}>
          <span className="gradient-text">EduBot AI</span>
          <br />
          <span style={{ color: 'var(--edu-white)' }}>Your Smart 3D Teacher</span>
        </h1>

        <p style={{ color: 'var(--edu-muted)', fontSize: '1.1rem', maxWidth: 600, marginBottom: 40, lineHeight: 1.7 }}>
          Voice-powered AI teacher for Indian students. Learn NCERT topics in your language,
          scan textbook questions, generate notes & ace every exam.
        </p>

        {/* Language selector */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: 'var(--edu-muted)', fontSize: '0.85rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select your language:
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 700 }}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                id={`lang-${l.code}`}
                onClick={() => setLanguage(l.code)}
                style={{
                  padding: '8px 16px', borderRadius: 30, cursor: 'pointer',
                  border: `1px solid ${language === l.code ? 'var(--edu-teal)' : 'var(--glass-border)'}`,
                  background: language === l.code ? 'rgba(255,107,0,0.15)' : 'var(--glass-bg)',
                  color: language === l.code ? 'var(--edu-teal)' : 'var(--edu-muted)',
                  fontFamily: 'var(--font-ui)', fontWeight: language === l.code ? 600 : 400,
                  fontSize: '0.9rem', transition: 'all 0.2s',
                  boxShadow: language === l.code ? 'var(--glow-teal)' : 'none',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <Link href="/chat">
            <button id="start-learning-btn" className="edu-btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Start Learning Now
            </button>
          </Link>
          <Link href="/quiz">
            <button className="edu-btn-saffron" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Take a Quiz
            </button>
          </Link>
        </div>

        {/* Seed status */}
        {seeding && (
          <div className="badge badge-teal" style={{ fontSize: '0.78rem' }}>
            <span className="spinner-mini" style={{ display: 'inline-block', marginRight: 6 }}></span>
            Loading NCERT curriculum...
          </div>
        )}
        {seedDone && !seeding && (
          <div className="badge badge-teal" style={{ fontSize: '0.78rem' }}>NCERT curriculum ready</div>
        )}
      </section>

      {/* Subject Selection */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>
          Choose Your <span className="gradient-text">Subject</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--edu-muted)', marginBottom: 40 }}>
          NCERT curriculum for Classes 9–12 + JEE/NEET preparation
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {SUBJECTS.map((s) => (
            <button
              key={s.name}
              id={`subject-${s.name.toLowerCase().replace(/\s+/g, '-')}`}
              className={`subject-card ${subject === s.name ? 'active' : ''}`}
              onClick={() => setSubject(s.name)}
              style={{ borderColor: subject === s.name ? s.color : undefined, boxShadow: subject === s.name ? `0 0 30px ${s.color}44` : undefined }}
            >
              <span className="subject-icon">{renderSubjectIcon(s.icon)}</span>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{s.name}</div>
              <div style={{ color: 'var(--edu-muted)', fontSize: '0.82rem' }}>{s.desc}</div>
              {subject === s.name && (
                <div className="badge" style={{ marginTop: 10, borderColor: s.color, color: s.color, background: s.color + '22', fontSize: '0.72rem' }}>
                  ✓ Selected
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>
          Everything You Need to <span className="gradient-text">Score High</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--edu-muted)', marginBottom: 40 }}>
          Powered by Sarvam AI + Neo4j Knowledge Graph
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} style={{ textDecoration: 'none' }}>
              <div className="glass-panel glass-panel-hover" style={{ padding: 24, height: '100%' }}>
                <div style={{ marginBottom: 12, color: 'var(--edu-teal)' }}>{renderFeatureIcon(f.icon)}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: '1.05rem' }}>{f.label}</h3>
                <p style={{ color: 'var(--edu-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--edu-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ marginBottom: 8 }}>
          <span className="gradient-text" style={{ fontWeight: 700 }}>EduBot AI</span> — Built for HACKHAZARDS '26
        </div>
        <div>Powered by Sarvam AI · Neo4j AuraDB · YouTube Data API</div>
        <div style={{ marginTop: 8 }}>Made with care for Indian students</div>
      </footer>
    </div>
  );
}
