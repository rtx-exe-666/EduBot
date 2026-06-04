'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useEduStore from '@/app/store/useEduStore';

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

const NAV_LINKS = [
  { href: '/',           icon: '🏠', label: 'Home' },
  { href: '/chat',      icon: '💬', label: 'Chat' },
  { href: '/scanner',   icon: '📷', label: 'Scanner' },
  { href: '/notes',     icon: '📝', label: 'Notes' },
  { href: '/quiz',      icon: '🧠', label: 'Quiz' },
  { href: '/videos',    icon: '▶️',  label: 'Videos' },
  { href: '/graph',     icon: '🕸️',  label: 'Graph' },
  { href: '/dashboard', icon: '📊', label: 'Progress' },
];

export default function EduNavbar() {
  const pathname = usePathname();
  const { language, setLanguage } = useEduStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5, 10, 24, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="gradient-text" style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            EduBot AI
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1, justifyContent: 'center' }}
             className="desktop-nav">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 10,
                  fontSize: '0.85rem', fontWeight: active ? 600 : 400,
                  color: active ? 'var(--edu-teal)' : 'var(--edu-muted)',
                  background: active ? 'rgba(255,107,0,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(255,107,0,0.25)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Language selector + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select
            className="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <Link href="/settings">
            <button className="edu-btn-icon" title="Settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="edu-btn-icon mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{ display: 'none' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'rgba(5,10,24,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}
                  onClick={() => setMenuOpen(false)}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12,
                color: pathname === link.href ? 'var(--edu-teal)' : 'var(--edu-white)',
                background: pathname === link.href ? 'rgba(255,107,0,0.1)' : 'transparent',
                fontSize: '1rem', fontWeight: 500,
              }}>
                {link.label}
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
