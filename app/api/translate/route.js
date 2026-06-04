export async function POST(request) {
  try {
    const { text, targetLanguage } = await request.json();
    if (!text || targetLanguage === 'en-IN') {
      return Response.json({ translated: text });
    }

    if (!process.env.SARVAM_API_KEY) {
      return Response.json({ translated: text });
    }

    const res = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text.slice(0, 1000),
        source_language_code: 'en-IN',
        target_language_code: targetLanguage,
        speaker_gender: 'Female',
        mode: 'formal',
        enable_preprocessing: true,
      }),
    });

    if (!res.ok) return Response.json({ translated: text });
    const data = await res.json();
    return Response.json({ translated: data.translated_text || text });
  } catch {
    return Response.json({ translated: text });
  }
}
