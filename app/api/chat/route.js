const TEACHER_PERSONA = `You are EduBot, a brilliant, warm, and encouraging AI teacher for Indian students (Classes 9-12 and competitive exams like JEE/NEET). 

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
- Use LaTeX-compatible notation for math: $formula$ for inline, $$formula$$ for block`;


export async function POST(request) {
  try {
    const { messages, language, subject } = await request.json();

    if (!process.env.SARVAM_API_KEY) {
      return Response.json({ error: 'Sarvam API not configured' }, { status: 500 });
    }

    const systemPrompt = `${TEACHER_PERSONA}

Current context:
- Subject: ${subject || 'General'}
- Student Language Preference: ${language || 'en-IN'}
- Always respond in ${language === 'en-IN' ? 'English' : 'a mix of English and the student\'s preferred language'}
- Keep math notation LaTeX-compatible: use $...$ for inline math`;

    const body = {
      model: 'sarvam-30b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-12), // last 12 messages for context window
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: false,
    };

    const res = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Sarvam chat error:', errText);
      // Fallback: return a helpful message
      return Response.json({
        content: `I'm your EduBot AI teacher! I'm having a small technical issue right now. Please try again in a moment. Your question about **${subject}** is important — I'm here to help! 🎓`,
      });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';

    return Response.json({ content });
  } catch (err) {
    console.error('Chat route error:', err);
    return Response.json({
      content: 'Hello! I\'m EduBot, your AI teacher. I\'m ready to help you learn! Please ask me any question. 📚',
    });
  }
}
