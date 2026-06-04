'use client';
import { useState, useRef, useCallback } from 'react';
import useEduStore from '@/app/store/useEduStore';

export default function QuestionScanner() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [step, setStep] = useState('idle'); // idle | ocr | solving | done
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [camActive, setCamActive] = useState(false);
  const { language, subject, setAvatarMood } = useEduStore();

  const processImage = useCallback(async (imageData) => {
    setStep('ocr');
    setOcrProgress(0);
    setAvatarMood('thinking');
    setLoading(true);
    setSolution('');
    setOcrText('');

    try {
      // Dynamic import Tesseract
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng+hin', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();

      const cleanText = text.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
      setOcrText(cleanText);
      setOcrProgress(100);
      setStep('solving');

      if (!cleanText) {
        setSolution('Could not extract text from image. Please try a clearer photo.');
        setStep('done');
        return;
      }

      // Send to Sarvam for step-by-step solution
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Solve this ${subject} problem step-by-step. Show all working clearly. Use LaTeX math notation with $...$ for formulas:\n\n${cleanText}`,
          }],
          language,
          subject,
        }),
      });

      const data = await res.json();
      setSolution(data.content || 'Could not generate solution. Please try again.');
      setStep('done');
      setAvatarMood('happy');
    } catch (err) {
      console.error('Scanner error:', err);
      setSolution('Error processing image. Please try again.');
      setStep('done');
    } finally {
      setLoading(false);
    }
  }, [language, subject, setAvatarMood]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url);
    processImage(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCamActive(true);
      }
    } catch {
      alert('Camera access denied. Please allow camera access.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setImage(url);
      videoRef.current.srcObject?.getTracks().forEach((t) => t.stop());
      setCamActive(false);
      processImage(blob);
    }, 'image/jpeg', 0.9);
  };

  const downloadSolution = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('EduBot AI — Solution', 14, 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Subject: ${subject}`, 14, 32);
    doc.text(`Question:`, 14, 44);
    doc.setTextColor(0);
    const qLines = doc.splitTextToSize(ocrText, 180);
    doc.text(qLines, 14, 52);
    const qHeight = qLines.length * 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Solution:', 14, 60 + qHeight);
    doc.setFont('helvetica', 'normal');
    const sLines = doc.splitTextToSize(solution.replace(/\$\$?[^$]+\$?\$/g, '[formula]'), 180);
    doc.text(sLines, 14, 68 + qHeight);
    doc.save('EduBot-Solution.pdf');
  };

  const reset = () => {
    setImage(null); setOcrText(''); setSolution('');
    setStep('idle'); setOcrProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="page-enter" style={{ padding: '80px 24px 40px', maxWidth: 900, margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Question Scanner</h1>
      <p style={{ color: 'var(--edu-muted)', marginBottom: 32 }}>
        Take a photo of any textbook question and get an instant step-by-step solution!
      </p>

      {/* Upload / Camera area */}
      {step === 'idle' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <button
            id="upload-btn"
            className="glass-panel glass-panel-hover"
            onClick={() => fileRef.current?.click()}
            style={{ padding: 40, border: '2px dashed var(--glass-border-2)', cursor: 'pointer', textAlign: 'center', background: 'transparent', color: 'var(--edu-white)' }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Upload Image</div>
            <div style={{ color: 'var(--edu-muted)', fontSize: '0.85rem' }}>JPG, PNG, HEIC — any photo of a question</div>
          </button>

          <button
            id="camera-btn"
            className="glass-panel glass-panel-hover"
            onClick={startCamera}
            style={{ padding: 40, border: '2px dashed rgba(255,153,51,0.4)', cursor: 'pointer', textAlign: 'center', background: 'transparent', color: 'var(--edu-white)' }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Use Camera</div>
            <div style={{ color: 'var(--edu-muted)', fontSize: '0.85rem' }}>Point your camera at the question</div>
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera view */}
      {camActive && (
        <div className="glass-panel" style={{ padding: 16, marginBottom: 24, position: 'relative' }}>
          <video ref={videoRef} style={{ width: '100%', borderRadius: 12 }} autoPlay playsInline />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
            <button className="edu-btn-primary" onClick={capturePhoto}>Capture</button>
            <button className="edu-btn-ghost" onClick={() => { videoRef.current?.srcObject?.getTracks().forEach(t=>t.stop()); setCamActive(false); }}>✕ Cancel</button>
          </div>
        </div>
      )}

      {/* OCR Progress */}
      {(step === 'ocr' || step === 'solving') && (
        <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>
              {step === 'ocr' ? 'Reading question with OCR...' : 'Generating step-by-step solution...'}
            </span>
          </div>
          {step === 'ocr' && (
            <div className="progress-bar-track" style={{ marginTop: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${ocrProgress}%` }} />
            </div>
          )}
          {step === 'solving' && (
            <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {step === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.5s ease' }}>
          {/* Captured image */}
          {image && (
            <div className="glass-panel" style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 10, color: 'var(--edu-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Captured Question</h3>
              <img src={image} alt="question" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8 }} />
            </div>
          )}

          {/* Extracted text */}
          {ocrText && (
            <div className="glass-panel" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 10, color: 'var(--edu-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extracted Text</h3>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.88rem', color: 'var(--edu-white)', lineHeight: 1.6 }}>
                {ocrText}
              </div>
            </div>
          )}

          {/* Solution */}
          <div className="glass-panel-teal" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: 'var(--edu-teal)', fontSize: '1.1rem', fontWeight: 700 }}>
                Step-by-Step Solution
              </h3>
              <button className="edu-btn-ghost" onClick={downloadSolution} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                Download PDF
              </button>
            </div>
            <div style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
              {solution.split('\n').map((line, i) => (
                <p key={i} style={{ margin: '4px 0' }}>
                  {line.replace(/\*\*(.*?)\*\*/g, (_, b) => b)}
                </p>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="edu-btn-primary" onClick={reset} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Scan Another Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
