'use client';
import { useEffect, useRef } from 'react';
import useEduStore from '@/app/store/useEduStore';

/**
 * Animated CSS/SVG holographic teacher avatar.
 * Renders immediately — no Three.js needed.
 * Reacts to avatarMood from global store.
 */
export default function AvatarFallback({ size = 'full' }) {
  const { avatarMood } = useEduStore();
  const mouthRef = useRef(null);

  const isSmall = size === 'small';
  const scale = isSmall ? 0.55 : 1;

  // Animate mouth when talking
  useEffect(() => {
    if (avatarMood !== 'talking') return;
    let interval = setInterval(() => {
      if (mouthRef.current) {
        const h = Math.random() * 16 + 8;
        const w = Math.random() * 12 + 28;
        mouthRef.current.style.height = `${h}px`;
        mouthRef.current.style.width = `${w}px`;
      }
    }, 100);
    return () => {
      clearInterval(interval);
      if (mouthRef.current) {
        mouthRef.current.style.height = '18px';
        mouthRef.current.style.width = '36px';
      }
    };
  }, [avatarMood]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: isSmall ? '160px' : '380px',
      position: 'relative',
    }}>
      {/* Holographic platform */}
      <div style={{
        position: 'absolute',
        bottom: isSmall ? 0 : 10,
        width: isSmall ? 120 : 220,
        height: isSmall ? 10 : 16,
        background: 'linear-gradient(135deg, rgba(255,107,0,0.3), rgba(255,61,0,0.3))',
        borderRadius: '50%',
        filter: 'blur(8px)',
      }} />

      {/* Glow ring */}
      {!isSmall && (
        <div className="avatar-glow-ring" />
      )}

      {/* Main avatar body */}
      <div
        className={`avatar-container avatar-mood-${avatarMood}`}
        style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
      >
        <div className="avatar-body">
          {/* Head */}
          <div className="avatar-head">
            <div className="avatar-hair" />
            {!isSmall && <div className="avatar-bindi" />}
            <div className="avatar-eye-left" />
            <div className="avatar-eye-right" />
            <div className="avatar-mouth" ref={mouthRef} />

            {/* Thinking hand indicator */}
            {avatarMood === 'thinking' && (
              <div style={{
                position: 'absolute', bottom: -5, right: -20,
                fontSize: '1.5rem', animation: 'float 2s ease-in-out infinite',
              }}>
                ✋
              </div>
            )}
          </div>

          {/* Neck */}
          <div className="avatar-neck" />

          {/* Body */}
          <div className="avatar-body-main">
            <div className="avatar-dupatta" />
            <div className="avatar-arm-left" />
            <div className="avatar-arm-right" />
            <div className="avatar-book">
              {avatarMood === 'quiz' ? '❓' :
               avatarMood === 'happy' ? '⭐' :
               avatarMood === 'pointing' ? '☝️' : '📚'}
            </div>
          </div>
        </div>
      </div>

      {/* Mood label */}
      {!isSmall && (
        <div style={{
          marginTop: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          {/* Name badge */}
          <div className="badge badge-teal">
            <span>✨</span> EduBot Teacher
          </div>

          {/* Mood status */}
          <div style={{ color: 'var(--edu-muted)', fontSize: '0.85rem' }}>
            {avatarMood === 'idle'     && '💭 Ready to teach…'}
            {avatarMood === 'talking'  && '🗣️ Explaining…'}
            {avatarMood === 'thinking' && '🤔 Thinking…'}
            {avatarMood === 'happy'    && '🎉 Great job!'}
            {avatarMood === 'pointing' && '☝️ Pay attention!'}
            {avatarMood === 'quiz'     && '📝 Quiz time!'}
            {(avatarMood === 'waving' || avatarMood === 'handshaking') && '👋 Waving hello…'}
            {avatarMood === 'laughing' && '😄 Laughing…'}
            {(avatarMood === 'shock' || avatarMood === 'shocked') && '😲 Shocked!…'}
            {avatarMood === 'sad'      && '😢 Sad…'}
          </div>
        </div>
      )}

      {/* Floating particles */}
      {!isSmall && ['📐', '∑', '⚛️', '🧬', '🔬', '∫', 'π'].map((sym, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: '1.1rem',
          opacity: 0.35,
          animation: `particle-rise ${2 + i * 0.4}s ${i * 0.6}s ease-out infinite`,
          left: `${15 + i * 10}%`,
          bottom: `${10 + (i % 3) * 20}%`,
          color: i % 2 === 0 ? 'var(--edu-teal)' : 'var(--edu-saffron)',
        }}>
          {sym}
        </div>
      ))}
    </div>
  );
}
