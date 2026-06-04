'use client';
import EduNavbar from '@/components/edubot/Navbar/EduNavbar';
import Avatar3D from '@/components/edubot/Avatar3D/Avatar3D';
import ChatPanel from '@/components/edubot/ChatPanel/ChatPanel';
import useEduStore from '../store/useEduStore';

export default function ChatPage() {
  const { subject } = useEduStore();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <EduNavbar />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, marginTop: 64, overflow: 'hidden' }}>
        {/* Avatar sidebar */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '24px 16px',
          borderRight: '1px solid var(--glass-border)',
          background: 'rgba(5,10,24,0.6)',
          backdropFilter: 'blur(20px)',
        }}>
          <Avatar3D />
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <div className="badge badge-teal" style={{ marginBottom: 10 }}>Teaching {subject}</div>
            <p style={{ color: 'var(--edu-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
              Ask any question in your language.<br />
              Voice input supported in 10 Indian languages!
            </p>
          </div>
        </div>

        {/* Chat panel */}
        <div className="glass-panel" style={{ borderRadius: 0, border: 'none', height: '100%', overflow: 'hidden' }}>
          <ChatPanel />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
