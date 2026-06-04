export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const language = formData.get('language') || 'hi-IN';

    if (!audioFile) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!process.env.SARVAM_API_KEY) {
      return Response.json({ error: 'Sarvam not configured' }, { status: 500 });
    }

    const sarvamForm = new FormData();
    sarvamForm.append('file', audioFile, 'audio.webm');
    sarvamForm.append('language_code', language);
    sarvamForm.append('model', 'saarika:v2.5');

    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
      },
      body: sarvamForm,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Sarvam STT error:', errText);
      return Response.json({ transcript: '', error: 'STT failed' }, { status: 422 });
    }

    const data = await res.json();
    return Response.json({ transcript: data.transcript || '' });
  } catch (err) {
    console.error('STT route error:', err);
    return Response.json({ transcript: '', error: err.message }, { status: 500 });
  }
}
