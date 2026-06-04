/**
 * EduBot Sarvam API client helpers — all calls go through Next.js Route Handlers
 * so that API keys stay server-side only.
 */

const BASE = '/api/edubot';

// ─── Chat / Teacher AI ────────────────────────────────────────────────────────

/**
 * Send a message to the teacher AI and get a streaming response.
 * @param {Array} messages - [{role, content}] array
 * @param {string} language - BCP-47 code e.g. 'hi-IN'
 * @param {string} subject - Current subject context
 * @param {function} onToken - Callback for each streamed token
 */
export async function chatWithTeacher(messages, language, subject, onToken) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, language, subject }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Chat error ${res.status}`);
  }

  // Handle streaming response
  if (res.headers.get('content-type')?.includes('text/event-stream')) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) {
              fullText += token;
              onToken?.(token, fullText);
            }
          } catch {
            // Ignore parse errors in stream
          }
        }
      }
    }
    return fullText;
  } else {
    // Non-streaming fallback
    const data = await res.json();
    const text = data.content || '';
    onToken?.(text, text);
    return text;
  }
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

/**
 * Convert text to speech using Sarvam Bulbul v2.
 * Returns an audio URL for playback.
 */
export async function speakText(text, language = 'hi-IN') {
  try {
    const res = await fetch(`${BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) {
      console.warn('TTS failed, using browser TTS fallback');
      return null;
    }

    const data = await res.json();
    if (!data.audio) return null;

    // Convert base64 to blob URL
    const binaryStr = atob(data.audio);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('TTS error:', err);
    return null;
  }
}

/**
 * Browser TTS fallback when Sarvam TTS fails.
 */
export function speakWithBrowserTTS(text, language = 'hi-IN') {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

// ─── Speech-to-Text ───────────────────────────────────────────────────────────

/**
 * Transcribe an audio blob using Sarvam STT.
 */
export async function transcribeAudio(audioBlob, language = 'hi-IN') {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('language', language);

  const res = await fetch(`${BASE}/stt`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'STT failed' }));
    throw new Error(err.error || 'STT failed');
  }

  const data = await res.json();
  return data.transcript || '';
}

// ─── Translation ──────────────────────────────────────────────────────────────

/**
 * Translate text to target Indian language.
 */
export async function translateText(text, targetLanguage) {
  if (targetLanguage === 'en-IN') return text;

  const res = await fetch(`${BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage }),
  });

  if (!res.ok) return text; // Graceful fallback

  const data = await res.json();
  return data.translated || text;
}

// ─── Teacher Persona Prompts ─────────────────────────────────────────────────

export const TEACHER_PERSONA = `You are EduBot, a brilliant, warm, and encouraging AI teacher for Indian students (Classes 9-12 and competitive exams like JEE/NEET). 

Your teaching style:
- Explain concepts in simple language first, then build up complexity
- Always use Indian context in examples (Indian cities, festivals, everyday objects)
- Use the "First Principle" approach — explain WHY before HOW
- Show step-by-step solutions with reasoning at each step
- Celebrate correct answers enthusiastically
- Gently correct wrong answers with encouragement
- Use analogies from daily Indian life (cricket, cooking, festivals)
- For math/physics/chemistry: always show the formula first, then solve with numbers

Response format:
- Start with a brief concept explanation
- Show step-by-step solution if it's a problem
- End with a quick tip or common mistake to avoid
- Use KaTeX-compatible LaTeX for math: $formula$ for inline, $$formula$$ for block`;
