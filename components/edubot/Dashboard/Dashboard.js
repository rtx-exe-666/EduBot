'use client';
import { useState, useEffect, useCallback } from 'react';
import useEduStore from '@/app/store/useEduStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

const BADGES = [
  { id: 'first_quiz',    icon: 'quiz', label: 'First Quiz!',       condition: (p) => p.totalQuizzes >= 1 },
  { id: 'perfect_score', icon: 'perfect', label: 'Perfect Score',      condition: (p) => p.maxScore >= 100 },
  { id: 'streak_3',      icon: 'streak', label: '3-Day Streak',       condition: (p) => p.streak >= 3 },
  { id: 'topics_5',      icon: 'topics', label: '5 Topics Studied',   condition: (p) => p.totalTopics >= 5 },
  { id: 'math_master',   icon: 'math', label: 'Math Master',        condition: (p) => p.subjectScores?.Mathematics >= 80 },
  { id: 'science_pro',   icon: 'physics',  label: 'Science Pro',       condition: (p) => (p.subjectScores?.Physics || 0) >= 80 },
  { id: 'all_subjects',  icon: 'star', label: 'All-Rounder',        condition: (p) => Object.keys(p.subjectScores || {}).length >= 4 },
];

function renderBadgeIcon(iconName) {
  const props = { width: 32, height: 32, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { margin: '0 auto', display: 'block', color: 'var(--edu-teal)' } };
  switch (iconName) {
    case 'quiz':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
    case 'perfect':
      return (
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--edu-teal)', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          100
        </div>
      );
    case 'streak':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      );
    case 'topics':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5a2.5 2.5 0 0 0-2.5 2.5z"/>
        </svg>
      );
    case 'math':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M22 10v12H2V2l20 8z"/>
          <path d="M6 18l12-6"/>
        </svg>
      );
    case 'physics':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(45 12 12)"/>
          <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(-45 12 12)"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
    case 'star':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      );
    default:
      return null;
  }
}

function renderStatIcon(iconName) {
  const props = { width: 24, height: 24, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { margin: '0 auto 8px', display: 'block', color: 'var(--edu-teal)' } };
  switch (iconName) {
    case 'topics':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5a2.5 2.5 0 0 0-2.5 2.5z"/>
        </svg>
      );
    case 'quizzes':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      );
    case 'streak':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      );
    case 'best':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"/>
        </svg>
      );
    default:
      return null;
  }
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(5,10,24,0.95)', border: '1px solid var(--glass-border-2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--edu-white)' }}>{label}</div>
      <div style={{ color: 'var(--edu-teal)' }}>Score: {payload[0]?.value}%</div>
    </div>
  );
}

export default function Dashboard() {
  const { studentUid } = useEduStore();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTopics: 0, totalQuizzes: 0, streak: 1, maxScore: 0, subjectScores: {} });

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/neo4j', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'getProgress', params: { uid: studentUid } }),
      });
      const data = await res.json();
      const records = data.data || [];
      setProgress(records);

      // Compute stats
      const subjectScores = {};
      let maxScore = 0;
      records.forEach((r) => {
        const score = r.score || 0;
        if (!subjectScores[r.subject]) subjectScores[r.subject] = [];
        subjectScores[r.subject].push(score);
        if (score > maxScore) maxScore = score;
      });
      const avgSubjectScores = {};
      Object.entries(subjectScores).forEach(([s, scores]) => {
        avgSubjectScores[s] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      });

      setStats({
        totalTopics: records.length,
        totalQuizzes: records.length,
        streak: Math.min(records.length, 7),
        maxScore,
        subjectScores: avgSubjectScores,
      });
    } catch (err) {
      // Use mock data if Neo4j not seeded yet
      const mock = [
        { subject: 'Mathematics', topic: 'Quadratic Equations', score: 85 },
        { subject: 'Mathematics', topic: 'Trigonometry', score: 72 },
        { subject: 'Physics', topic: "Newton's Laws", score: 90 },
        { subject: 'Chemistry', topic: 'Atomic Structure', score: 65 },
        { subject: 'Computer Science', topic: 'Data Structures', score: 88 },
      ];
      setProgress(mock);
      setStats({ totalTopics: mock.length, totalQuizzes: mock.length, streak: 3, maxScore: 90, subjectScores: { Mathematics: 78, Physics: 90, Chemistry: 65, 'Computer Science': 88 } });
    } finally {
      setLoading(false);
    }
  }, [studentUid]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const chartData = progress.map((r) => ({
    name: (r.topic || '').split(' ').slice(0, 2).join(' '),
    score: typeof r.score === 'object' ? (r.score?.low || 0) : (r.score || 0),
    subject: r.subject,
  }));

  const radarData = Object.entries(stats.subjectScores).map(([subject, score]) => ({
    subject: subject.split(' ')[0],
    score,
  }));

  const earnedBadges = BADGES.filter((b) => b.condition(stats));

  return (
    <div className="page-enter" style={{ padding: '80px 24px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>My Progress</h1>
      <p style={{ color: 'var(--edu-muted)', marginBottom: 32 }}>Track your learning journey across all subjects.</p>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: 'topics', label: 'Topics Studied', value: stats.totalTopics },
          { icon: 'quizzes', label: 'Quizzes Taken', value: stats.totalQuizzes },
          { icon: 'streak', label: 'Day Streak', value: `${stats.streak} days` },
          { icon: 'best', label: 'Best Score', value: `${stats.maxScore}%` },
        ].map((card) => (
          <div key={card.label} className="glass-panel glass-panel-hover" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ marginBottom: 8 }}>{renderStatIcon(card.icon)}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }} className="gradient-text">{card.value}</div>
            <div style={{ color: 'var(--edu-muted)', fontSize: '0.85rem' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Bar chart */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Quiz Scores by Topic</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#8892B0', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8892B0', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="url(#tealGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--edu-muted)' }}>
              Take some quizzes to see your scores here!
            </div>
          )}
        </div>

        {/* Radar chart */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Subject Strength</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892B0', fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#FF6B00" fill="#FF6B00" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--edu-muted)' }}>
              Study more subjects to see your radar chart!
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Achievements</h3>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {BADGES.map((badge) => {
            const earned = badge.condition(stats);
            return (
              <div key={badge.id} style={{
                padding: '12px 18px', borderRadius: 12, textAlign: 'center',
                background: earned ? 'rgba(255,107,0,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${earned ? 'var(--edu-teal)' : 'var(--glass-border)'}`,
                opacity: earned ? 1 : 0.4, transition: 'all 0.3s',
                filter: earned ? 'none' : 'grayscale(1)',
              }}>
                <div style={{ marginBottom: 4 }}>{renderBadgeIcon(badge.icon)}</div>
                <div style={{ fontSize: '0.78rem', color: earned ? 'var(--edu-teal)' : 'var(--edu-muted)', fontWeight: earned ? 600 : 400 }}>
                  {badge.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Recent Activity</h3>
        {progress.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {progress.slice(0, 8).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: (r.score || 0) >= 70 ? 'var(--edu-success)' : 'var(--edu-warning)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.topic}</span>
                  <span style={{ color: 'var(--edu-muted)', fontSize: '0.82rem', marginLeft: 8 }}>{r.subject}</span>
                </div>
                <div style={{ fontWeight: 700, color: (r.score || 0) >= 70 ? 'var(--edu-success)' : 'var(--edu-saffron)', fontSize: '0.9rem' }}>
                  {r.score || 0}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--edu-muted)', padding: 30 }}>
            Complete some quizzes to see your activity here!
          </div>
        )}
      </div>
    </div>
  );
}
