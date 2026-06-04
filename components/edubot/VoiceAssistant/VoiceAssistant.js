'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import useEduStore from '@/app/store/useEduStore';
import { transcribeAudio, speakText, speakWithBrowserTTS } from '@/lib/edubot-sarvam';

export default function VoiceAssistant({ onTranscript, isPlaying }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [barHeights, setBarHeights] = useState([4, 8, 12, 8, 4]);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const animRef = useRef(null);
  const { language, setAvatarMood, soundEnabled } = useEduStore();

  // Animate waveform bars
  useEffect(() => {
    if (recording) {
      animRef.current = setInterval(() => {
        setBarHeights([
          4 + Math.random() * 24,
          4 + Math.random() * 24,
          4 + Math.random() * 28,
          4 + Math.random() * 24,
          4 + Math.random() * 24,
        ]);
      }, 80);
    } else {
      clearInterval(animRef.current);
      setBarHeights([4, 8, 12, 8, 4]);
    }
    return () => clearInterval(animRef.current);
  }, [recording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setLoading(true);
        setAvatarMood('thinking');
        try {
          const transcript = await transcribeAudio(blob, language);
          if (transcript) onTranscript?.(transcript);
        } catch (err) {
          console.error('STT error:', err);
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setAvatarMood('talking');
    } catch (err) {
      alert('Microphone access denied. Please allow microphone access in browser settings.');
    }
  }, [language, onTranscript, setAvatarMood]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  const handleMicClick = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Waveform */}
      <div className="waveform" style={{ height: 36 }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              height: recording ? `${h}px` : isPlaying ? `${4 + Math.abs(Math.sin((Date.now() / 200) + i)) * 20}px` : '4px',
              opacity: (recording || isPlaying) ? 1 : 0.3,
              transition: 'height 0.08s ease',
              background: recording ? 'var(--edu-danger)' : 'var(--edu-teal)',
            }}
          />
        ))}
      </div>

      {/* Mic button */}
      <button
        id="mic-button"
        className={`mic-btn ${recording ? 'recording' : ''}`}
        onClick={handleMicClick}
        disabled={loading}
        title={recording ? 'Stop recording' : 'Start voice input'}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
      >
        {loading ? (
          <div className="spinner-mini" style={{ width: 20, height: 20 }}></div>
        ) : recording ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
          </svg>
        )}
      </button>

      {/* Status label */}
      <div style={{ fontSize: '0.78rem', color: 'var(--edu-muted)', minHeight: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="spinner-mini" style={{ width: 12, height: 12 }}></span> Transcribing...
          </span>
        )}
        {recording && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span> Recording — tap to stop
          </span>
        )}
        {!recording && !loading && isPlaying && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg> Speaking...
          </span>
        )}
        {!recording && !loading && !isPlaying && 'Tap mic to speak'}
      </div>
    </div>
  );
}
