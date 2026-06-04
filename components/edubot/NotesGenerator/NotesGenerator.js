'use client';
import { useState, useCallback } from 'react';
import useEduStore from '@/app/store/useEduStore';

export default function NotesGenerator() {
  const [topicInput, setTopicInput] = useState('');
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const { language, subject, savedNotes, saveNote, deleteNote, setAvatarMood } = useEduStore();
  const [selectedNote, setSelectedNote] = useState(null);

  const generateNotes = useCallback(async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    setAvatarMood('thinking');

    try {
      // First, try to get concepts from Neo4j
      let conceptContext = '';
      try {
        const neo4jRes = await fetch('/api/neo4j', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation: 'getTopicConcepts', params: { topic: topicInput.trim() } }),
        });
        const neo4jData = await neo4jRes.json();
        if (neo4jData.data?.concepts?.length) {
          conceptContext = `\n\nKey concepts to cover: ${neo4jData.data.concepts.map((c) => `${c.name}: ${c.definition}`).join('; ')}`;
        }
      } catch {}

      const prompt = `Create comprehensive, well-structured study notes for Indian students on the topic: "${topicInput}" (Subject: ${subject}).

${conceptContext}

Format the notes EXACTLY as follows:

# ${topicInput}

## Introduction
[2-3 sentences introducing the topic]

## Key Concepts
[5-7 bullet points of main concepts]

## Important Formulae
[List all relevant formulas using LaTeX notation: $formula$]

## Definitions
[3-5 key term definitions]

## Solved Example
[One complete worked example with steps]

## Common Mistakes
[3-4 common errors students make]

## Quick Summary
[3-5 bullet points to remember]

Use $...$ for inline math and $$...$$ for block equations.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          language,
          subject,
        }),
      });

      const data = await res.json();
      const generatedNotes = {
        topic: topicInput.trim(),
        subject,
        language,
        content: data.content,
        createdAt: new Date().toISOString(),
      };

      setNotes(generatedNotes);
      setAvatarMood('happy');
    } catch (err) {
      console.error('Notes generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [topicInput, language, subject, setAvatarMood]);

  const handleSaveNote = () => {
    if (!notes) return;
    saveNote(notes);
    alert('Notes saved successfully!');
  };

  const downloadPDF = async () => {
    if (!notes) return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 180, 160);
    doc.text(`EduBot AI — ${notes.topic}`, 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Subject: ${notes.subject} | Generated: ${new Date(notes.createdAt).toLocaleDateString('en-IN')}`, 14, 30);

    doc.setFontSize(11);
    doc.setTextColor(0);
    const cleanContent = notes.content
      .replace(/\$\$?[^$]+\$?\$/g, '[formula]')
      .replace(/#{1,3} /g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1');

    const lines = doc.splitTextToSize(cleanContent, 180);
    let y = 42;
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += 6;
    }

    doc.save(`EduBot-${notes.topic.replace(/\s+/g, '-')}.pdf`);
  };

  const activeNote = selectedNote || notes;

  return (
    <div className="page-enter" style={{ padding: '80px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Notes Generator</h1>
      <p style={{ color: 'var(--edu-muted)', marginBottom: 32 }}>
        Generate AI-powered structured study notes for any NCERT topic instantly.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Sidebar: saved notes */}
        <div>
          <div className="glass-panel" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="topic-input"
                className="edu-input"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateNotes()}
                placeholder="e.g. Quadratic Equations"
                style={{ flex: 1 }}
              />
              <button
                id="generate-notes-btn"
                className="edu-btn-primary"
                onClick={generateNotes}
                disabled={loading || !topicInput.trim()}
                style={{ padding: '0 14px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {loading ? (
                  <div className="spinner-mini" style={{ width: 16, height: 16 }}></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--edu-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Saved Notes ({savedNotes.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedNotes.map((note) => (
              <div
                key={note.id}
                className="glass-panel glass-panel-hover"
                style={{ padding: '12px 14px', cursor: 'pointer', border: selectedNote?.id === note.id ? '1px solid var(--edu-teal)' : '1px solid var(--glass-border)' }}
                onClick={() => setSelectedNote(note)}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>{note.topic}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--edu-muted)' }}>{note.subject} • {new Date(note.savedAt).toLocaleDateString('en-IN')}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); if (selectedNote?.id === note.id) setSelectedNote(null); }}
                  style={{ marginTop: 6, background: 'none', border: 'none', color: 'var(--edu-danger)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                >
                  Delete
                </button>
              </div>
            ))}
            {savedNotes.length === 0 && (
              <div style={{ color: 'var(--edu-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
                No saved notes yet.<br />Generate some notes!
              </div>
            )}
          </div>
        </div>

        {/* Notes content */}
        <div>
          {loading && (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner-mini" style={{ width: 48, height: 48, margin: '0 auto 16px' }}></div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Generating study notes...</div>
              <div style={{ color: 'var(--edu-muted)', fontSize: '0.88rem' }}>EduBot is preparing comprehensive notes for "{topicInput}"</div>
            </div>
          )}

          {activeNote && !loading && (
            <div className="glass-panel" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem' }}>{activeNote.topic}</h2>
                  <div style={{ color: 'var(--edu-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    {activeNote.subject} • {new Date(activeNote.createdAt || activeNote.savedAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="edu-btn-ghost" onClick={downloadPDF} style={{ fontSize: '0.85rem' }}>PDF</button>
                  {!activeNote.savedAt && (
                    <button className="edu-btn-primary" onClick={handleSaveNote} style={{ fontSize: '0.85rem' }}>Save</button>
                  )}
                </div>
              </div>

              <div style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
                {activeNote.content?.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h3 key={i} style={{ color: 'var(--edu-teal)', marginTop: 20, marginBottom: 8, fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--glass-border)', paddingBottom: 6 }}>{line.slice(3)}</h3>;
                  if (line.startsWith('# ')) return <h2 key={i} className="gradient-text" style={{ marginBottom: 16, fontSize: '1.2rem' }}>{line.slice(2)}</h2>;
                  if (line.startsWith('- ')) return <li key={i} style={{ marginBottom: 6, marginLeft: 16, color: 'var(--edu-white)' }}>{line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, b) => b)}</li>;
                  if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
                  return <p key={i} style={{ margin: '4px 0' }}>{line.replace(/\*\*(.*?)\*\*/g, (_, b) => b)}</p>;
                })}
              </div>
            </div>
          )}

          {!activeNote && !loading && (
            <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
              <h3 style={{ color: 'var(--edu-muted)', fontWeight: 400 }}>Enter a topic to generate notes</h3>
              <p style={{ color: 'var(--edu-muted)', fontSize: '0.88rem' }}>Try: "Quadratic Equations", "Photosynthesis", "Newton's Laws"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
