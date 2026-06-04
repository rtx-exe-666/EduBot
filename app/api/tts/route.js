export async function POST(request) {
  try {
    const { text, language } = await request.json();

    if (!process.env.SARVAM_API_KEY) {
      return Response.json({ error: 'Sarvam not configured' }, { status: 500 });
    }

    const trimmed = text?.slice(0, 500) || '';
    if (!trimmed) return Response.json({ error: 'No text provided' }, { status: 400 });

    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [trimmed],
        target_language_code: language || 'hi-IN',
        speaker: 'anushka',
        model: 'bulbul:v2',
        enable_preprocessing: true,
        speech_sample_rate: 22050,
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Sarvam TTS error:', errText);
      return Response.json({ audio: null });
    }

    const data = await res.json();
    return Response.json({ audio: data.audios?.[0] || null });
  } catch (err) {
    console.error('TTS route error:', err);
    return Response.json({ audio: null });
  }
}
