'use client';
import { useState, useCallback, useEffect } from 'react';
import useEduStore from '@/app/store/useEduStore';
import { speakText, speakWithBrowserTTS } from '@/lib/edubot-sarvam';

export default function QuizMode() {
  const { subject, language, quizState, startQuiz, answerQuestion, endQuiz, setAvatarMood, soundEnabled, studentUid } = useEduStore();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const generateQuiz = useCallback(async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    setAvatarMood('pointing');

    try {
      // Get concepts from Neo4j
      let conceptData = '';
      const neo4jRes = await fetch('/api/neo4j', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'getTopicConcepts', params: { topic: topicInput.trim() } }),
      });
      const neo4jData = await neo4jRes.json();
      if (neo4jData.data?.concepts?.length) {
        conceptData = neo4jData.data.concepts.map((c) =>
          `Concept: ${c.name}\nDefinition: ${c.definition}\nFormula: ${c.formula || 'N/A'}\nExample: ${c.example || 'N/A'}`
        ).join('\n\n');
      }

      const prompt = `Generate 5 quiz questions for Indian students on "${topicInput}" (${subject}).

${conceptData ? `Based on these concepts:\n${conceptData}` : ''}

Return EXACTLY this JSON format (no extra text):
{
  "questions": [
    {
      "question": "question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct": 0,
      "explanation": "why this is correct",
      "concept": "concept name"
    }
  ]
}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          language: 'en-IN',
          subject,
        }),
      });

      const data = await res.json();
      let qs = [];
      try {
        const jsonMatch = data.content?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          qs = JSON.parse(jsonMatch[0]).questions || [];
        }
      } catch {
        // Fallback questions
        qs = [{
          question: `What is the most important concept in ${topicInput}?`,
          options: ['A) Concept A', 'B) Concept B', 'C) Concept C', 'D) Concept D'],
          correct: 0,
          explanation: 'This is a key concept.',
          concept: topicInput,
        }];
      }

      setSelectedTopic(topicInput.trim());
      startQuiz(qs);
      setQuestions(qs);
      setShowAnswer(false);
      setFeedback(null);
      setUserAnswer('');
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [topicInput, subject, startQuiz, setAvatarMood]);

  const currentQ = questions[quizState.currentIdx];
  const isLastQuestion = quizState.currentIdx >= questions.length;

  const handleAnswer = useCallback(async (optionIdx) => {
    if (showAnswer) return;
    const correct = optionIdx === currentQ.correct;
    setShowAnswer(true);
    setFeedback({ correct, explanation: currentQ.explanation });
    setAvatarMood(correct ? 'happy' : 'thinking');

    // TTS feedback
    if (soundEnabled) {
      const msg = correct
        ? `Bilkul sahi! ${currentQ.explanation}`
        : `Galat jawab. Sahi uttar hai option ${currentQ.options[currentQ.correct]}. ${currentQ.explanation}`;
      const url = await speakText(msg.slice(0, 300), language);
      if (url) {
        const a = new Audio(url);
        a.onended = () => { URL.revokeObjectURL(url); };
        a.play().catch(() => speakWithBrowserTTS(msg, language));
      } else {
        speakWithBrowserTTS(msg, language);
      }
    }

    // Mark mastery in Neo4j
    if (studentUid && currentQ.concept) {
      fetch('/api/neo4j', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'markMastery',
          params: { uid: studentUid, concept: currentQ.concept, mastered: correct },
        }),
      }).catch(() => {});
    }

    answerQuestion(optionIdx, correct);
  }, [currentQ, showAnswer, soundEnabled, language, studentUid, setAvatarMood, answerQuestion]);

  const handleNext = () => {
    setShowAnswer(false);
    setFeedback(null);
    setUserAnswer('');
    if (!isLastQuestion) setAvatarMood('pointing');
  };

  const handleEndQuiz = async () => {
    endQuiz();
    setAvatarMood('happy');
    // Save progress
    if (studentUid && selectedTopic) {
      const score = Math.round((quizState.score / questions.length) * 100);
      await fetch('/api/neo4j', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'saveProgress',
          params: { uid: studentUid, topic: selectedTopic, score },
        }),
      }).catch(() => {});
    }
  };

  // Score card
  if (!quizState.active && quizState.answers.length > 0) {
    const pct = Math.round((quizState.score / questions.length) * 100);
    return (
      <div className="page-enter" style={{ padding: '80px 24px 40px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          {pct >= 80 ? (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--edu-saffron)' }}>
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"/>
            </svg>
          ) : pct >= 50 ? (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--edu-teal)' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ) : (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--edu-muted)' }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5a2.5 2.5 0 0 0-2.5 2.5z"/>
            </svg>
          )}
        </div>
        <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 8 }}>Quiz Complete!</h1>
        <p style={{ color: 'var(--edu-muted)', marginBottom: 32 }}>{selectedTopic}</p>

        <div className="glass-panel-teal" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ fontSize: '4rem', fontWeight: 800, marginBottom: 4 }} className="gradient-text">{pct}%</div>
          <div style={{ color: 'var(--edu-muted)' }}>{quizState.score} out of {questions.length} correct</div>
          <div className="progress-bar-track" style={{ marginTop: 16 }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          {pct >= 80 && <div className="badge badge-teal" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>Excellent! You mastered this topic!</div>}
          {pct >= 50 && pct < 80 && <div className="badge badge-saffron" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>Good effort! Review the concepts you missed.</div>}
          {pct < 50 && <div className="badge badge-purple" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>Keep practicing! This topic needs more review.</div>}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="edu-btn-primary" onClick={() => { setTopicInput(selectedTopic); generateQuiz(); }}>Retry</button>
          <button className="edu-btn-ghost" onClick={() => { setQuestions([]); setSelectedTopic(''); }}>New Topic</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ padding: '80px 24px 40px', maxWidth: 700, margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Quiz Mode</h1>
      <p style={{ color: 'var(--edu-muted)', marginBottom: 32 }}>Test your knowledge with AI-generated questions from your topic!</p>

      {/* Topic selector */}
      {!quizState.active && (
        <div className="glass-panel" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Choose a topic to quiz yourself on:</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              id="quiz-topic-input"
              className="edu-input"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateQuiz()}
              placeholder="e.g. Quadratic Equations, Newton's Laws"
            />
            <button
              id="start-quiz-btn"
              className="edu-btn-saffron"
              onClick={generateQuiz}
              disabled={loading || !topicInput.trim()}
              style={{ whiteSpace: 'nowrap', padding: '0 20px' }}
            >
              {loading ? 'Loading...' : 'Start Quiz!'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {['Quadratic Equations', "Newton's Laws", 'Trigonometry', 'Atomic Structure', 'Data Structures'].map((t) => (
              <button key={t} className="badge badge-teal" style={{ cursor: 'pointer', border: 'none', background: 'rgba(255,107,0,0.1)' }}
                onClick={() => { setTopicInput(t); }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active quiz */}
      {quizState.active && currentQ && !isLastQuestion && (
        <div style={{ animation: 'fadeInUp 0.4s ease' }}>
          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="badge badge-teal">Question {quizState.currentIdx + 1} of {questions.length}</span>
            <span className="badge badge-saffron">Score: {quizState.score}</span>
          </div>
          <div className="progress-bar-track" style={{ marginBottom: 24 }}>
            <div className="progress-bar-fill" style={{ width: `${((quizState.currentIdx) / questions.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div className="glass-panel-teal" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--edu-teal)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {currentQ.concept}
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>{currentQ.question}</p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {currentQ.options?.map((opt, i) => (
              <button
                key={i}
                id={`quiz-option-${i}`}
                className={`quiz-option ${showAnswer ? (i === currentQ.correct ? 'correct' : (quizState.answers[quizState.answers.length - 1]?.answer === i ? 'wrong' : '')) : ''}`}
                onClick={() => handleAnswer(i)}
                disabled={showAnswer}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {showAnswer && feedback && (
            <div className={`glass-panel`} style={{ padding: 16, marginBottom: 16, borderColor: feedback.correct ? 'var(--edu-success)' : 'var(--edu-danger)', borderWidth: 1, borderStyle: 'solid', animation: 'popIn 0.3s ease' }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: feedback.correct ? 'var(--edu-success)' : 'var(--edu-danger)' }}>
                {feedback.correct ? 'Correct! Well done!' : 'Incorrect'}
              </div>
              <div style={{ color: 'var(--edu-muted)', fontSize: '0.9rem' }}>{feedback.explanation}</div>
            </div>
          )}

          {showAnswer && (
            <button
              id="next-question-btn"
              className="edu-btn-primary"
              style={{ width: '100%' }}
              onClick={quizState.currentIdx + 1 >= questions.length ? handleEndQuiz : handleNext}
            >
              {quizState.currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
