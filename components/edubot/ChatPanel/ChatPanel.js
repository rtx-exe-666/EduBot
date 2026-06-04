'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import useEduStore from '@/app/store/useEduStore';
import { chatWithTeacher, speakText, speakWithBrowserTTS } from '@/lib/edubot-sarvam';
import VoiceAssistant from '../VoiceAssistant/VoiceAssistant';

function renderTextWithMath(text) {
  if (!text) return null;
  // Split by $...$ and $$...$$
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return (
        <div key={i} style={{ fontFamily: 'var(--font-code)', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 8, margin: '6px 0', overflowX: 'auto', color: 'var(--edu-teal)' }}>
          {part.slice(2, -2)}
        </div>
      );
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <code key={i} style={{ fontFamily: 'var(--font-code)', background: 'rgba(255,107,0,0.1)', padding: '1px 5px', borderRadius: 4, color: 'var(--edu-teal)', fontSize: '0.95em' }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    // Render **bold** and *italic*
    const bold = part.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <span key={i} dangerouslySetInnerHTML={{ __html: bold }} />;
  });
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isUser ? 'row-reverse' : 'row' }}>
        {!isUser && (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--edu-teal), var(--edu-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
            🎓
          </div>
        )}
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
          {renderTextWithMath(msg.content)}
        </div>
      </div>
      <span style={{ fontSize: '0.72rem', color: 'var(--edu-muted)', marginTop: 4, marginLeft: isUser ? 0 : 40, marginRight: isUser ? 0 : 0 }}>
        {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

export default function ChatPanel() {
  const {
    chatHistory, addMessage, updateLastMessage, clearChat,
    setAvatarMood, setIsTyping, isTyping, language, subject, soundEnabled,
  } = useEduStore();

  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioRef] = useState(() => (typeof window !== 'undefined' ? new Audio() : null));
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim()) return;
    setInput('');
    addMessage('user', text.trim());
    setIsTyping(true);
    setAvatarMood('thinking');

    // Add placeholder for AI response
    addMessage('assistant', '');

    let fullText = '';
    try {
      const history = chatHistory
        .slice(-10)
        .map(({ role, content }) => ({ role, content }));
      history.push({ role: 'user', content: text.trim() });

      await chatWithTeacher(history, language, subject, (token, all) => {
        fullText = all;
        updateLastMessage(all);
      });

      setAvatarMood('talking');

      // TTS playback
      if (soundEnabled && fullText) {
        const ttsText = fullText.replace(/\$\$?[^$]+\$?\$/g, '').replace(/\*\*/g, '').slice(0, 400);
        const audioUrl = await speakText(ttsText, language);
        if (audioUrl && audioRef) {
          audioRef.src = audioUrl;
          audioRef.onplay = () => setIsSpeaking(true);
          audioRef.onended = () => {
            setIsSpeaking(false);
            setAvatarMood('idle');
            URL.revokeObjectURL(audioUrl);
          };
          audioRef.play().catch(() => {
            speakWithBrowserTTS(ttsText, language);
          });
        } else {
          speakWithBrowserTTS(ttsText, language);
          setTimeout(() => { setAvatarMood('idle'); setIsSpeaking(false); }, 4000);
        }
      } else {
        setTimeout(() => setAvatarMood('idle'), 2000);
      }
    } catch (err) {
      updateLastMessage('Sorry, I had trouble connecting. Please try again! 🙏');
      setAvatarMood('idle');
    } finally {
      setIsTyping(false);
    }
  }, [chatHistory, language, subject, soundEnabled, addMessage, updateLastMessage, setIsTyping, setAvatarMood, audioRef]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  // Welcome message on first load
  useEffect(() => {
    if (chatHistory.length === 0) {
      setTimeout(() => {
        addMessage('assistant', `नमस्ते! I'm **EduBot**, your AI teacher!\n\nI can help you with:\n- **Mathematics** — Algebra, Calculus, Trigonometry\n- **Physics** — Newton's Laws, Optics, Thermodynamics\n- **Chemistry** — Atomic Structure, Bonding\n- **Biology** — Genetics, Cell Biology\n- **Computer Science** — Data Structures, Algorithms\n\nAsk me any question, or use the microphone to speak in your language. What topic would you like to learn today?`);
        setAvatarMood('happy');
        setTimeout(() => setAvatarMood('idle'), 3000);
      }, 800);
    }
  }, []); // eslint-disable-line

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Chat with EduBot</span>
          <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{subject}</span>
        </div>
        <button
          onClick={clearChat}
          title="Clear chat"
          style={{
            fontSize: '0.8rem',
            height: 30,
            padding: '0 12px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: 'var(--edu-white)',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        {chatHistory.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}
        {isTyping && (
          <div className="chat-bubble-ai" style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Voice + Text Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          {/* Voice input */}
          <VoiceAssistant
            onTranscript={(t) => sendMessage(t)}
            isPlaying={isSpeaking}
          />

          {/* Text input */}
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <textarea
              id="chat-input"
              className="edu-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your question... (Enter to send)"
              rows={2}
              style={{ resize: 'none', lineHeight: 1.5 }}
              disabled={isTyping}
            />
            <button
              id="send-button"
              className="edu-btn-primary"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={{ padding: '0 16px', alignSelf: 'stretch' }}
            >
              ➤
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.72rem', color: 'var(--edu-muted)' }}>
          Powered by Sarvam AI • Voice in 10 Indian languages
        </div>
      </div>
    </div>
  );
}
