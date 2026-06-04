'use client';
import { useState } from 'react';
import EduNavbar from '@/components/edubot/Navbar/EduNavbar';
import useEduStore from '../store/useEduStore';

const LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी — Hindi' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'ta-IN', label: 'தமிழ் — Tamil' },
  { code: 'te-IN', label: 'తెలుగు — Telugu' },
  { code: 'bn-IN', label: 'বাংলা — Bengali' },
  { code: 'mr-IN', label: 'मराठी — Marathi' },
  { code: 'gu-IN', label: 'ગુજરાતી — Gujarati' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ — Kannada' },
  { code: 'ml-IN', label: 'മലയാളം — Malayalam' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ — Punjabi' },
];

export default function SettingsPage() {
  const { language, setLanguage, voiceSpeed, setVoiceSpeed, soundEnabled, toggleSound, setAvatarMood } = useEduStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <EduNavbar />
      <div className="page-enter" style={{ padding: '90px 24px 40px', maxWidth: 700, margin: '0 auto' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Settings</h1>
        <p style={{ color: 'var(--edu-muted)', marginBottom: 40 }}>Personalize your EduBot AI experience.</p>

        {/* Language */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Language</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LANGUAGES.map((l) => (
              <button key={l.code} id={`setting-lang-${l.code}`}
                onClick={() => setLanguage(l.code)}
                style={{
                  padding: '12px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: `1px solid ${language === l.code ? 'var(--edu-teal)' : 'var(--glass-border)'}`,
                  background: language === l.code ? 'rgba(255,107,0,0.1)' : 'var(--glass-bg)',
                  color: language === l.code ? 'var(--edu-teal)' : 'var(--edu-white)',
                  fontFamily: 'var(--font-ui)', fontWeight: language === l.code ? 600 : 400,
                  transition: 'all 0.2s',
                }}>
                {l.label}
                {language === l.code && <span style={{ float: 'right' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Speed */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Voice Speed</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input
              type="range" min="0.5" max="1.5" step="0.1"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--edu-teal)' }}
            />
            <div style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid var(--edu-teal)', borderRadius: 8, padding: '6px 14px', color: 'var(--edu-teal)', fontWeight: 700, minWidth: 52, textAlign: 'center' }}>
              {voiceSpeed}x
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--edu-muted)', fontSize: '0.78rem', marginTop: 8 }}>
            <span>Slow</span><span>Normal</span><span>Fast</span>
          </div>
        </div>

        {/* Sound toggle */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontWeight: 600 }}>Sound Effects</h3>
              <p style={{ margin: 0, color: 'var(--edu-muted)', fontSize: '0.85rem' }}>Enable TTS voice responses from the teacher</p>
            </div>
            <button
              id="sound-toggle"
              onClick={toggleSound}
              style={{
                width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative',
                background: soundEnabled ? 'var(--edu-teal)' : 'var(--glass-bg-2)',
                transition: 'background 0.3s',
              }}
            >
              <div style={{
                position: 'absolute', top: 4, width: 20, height: 20, borderRadius: '50%',
                background: 'white',
                left: soundEnabled ? 28 : 4,
                transition: 'left 0.3s',
              }} />
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12, fontWeight: 600 }}>Test Avatar Expressions</h3>
          <p style={{ color: 'var(--edu-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Click any button to preview the avatar's animations in real-time!</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {[
              { label: 'Idle', mood: 'idle' },
              { label: 'Talking', mood: 'talking' },
              { label: 'Thinking', mood: 'thinking' },
              { label: 'Waving', mood: 'waving' },
              { label: 'Laughing', mood: 'laughing' },
              { label: 'Shocked', mood: 'shock' },
              { label: 'Sad', mood: 'sad' },
              { label: 'Happy', mood: 'happy' },
              { label: 'Pointing', mood: 'pointing' },
              { label: 'Quiz', mood: 'quiz' }
            ].map((btn) => (
              <button
                key={btn.mood}
                onClick={() => setAvatarMood(btn.mood)}
                className="badge badge-teal"
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: 'rgba(255,107,0,0.1)',
                  padding: '10px 8px',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <button className="edu-btn-primary" onClick={handleSave} style={{ width: '100%', padding: '14px' }}>
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </>
  );
}
