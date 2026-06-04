'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import useEduStore from '@/app/store/useEduStore';

const STATUS_COLORS = {
  mastered:  '#10B981',
  weak:      '#EF4444',
  unstudied: '#4B5563',
};

export default function ConceptGraph({ topicName: propTopic }) {
  const [topicInput, setTopicInput] = useState(propTopic || '');
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const canvasRef = useRef(null);
  const { studentUid, subject } = useEduStore();

  const fetchGraph = useCallback(async (topic) => {
    if (!topic.trim()) return;
    setLoading(true);
    setSelected(null);

    try {
      const res = await fetch('/api/neo4j', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'getConceptGraph',
          params: { topic: topic.trim(), uid: studentUid },
        }),
      });
      const data = await res.json();
      setNodes(data.data || []);
    } catch {
      setNodes([]);
    } finally {
      setLoading(false);
    }
  }, [studentUid]);

  useEffect(() => {
    if (propTopic) fetchGraph(propTopic);
  }, [propTopic, fetchGraph]);

  // Draw simple canvas graph
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 340;

    ctx.clearRect(0, 0, W, H);

    // Place nodes in a circle
    const cx = W / 2, cy = H / 2;
    const radius = Math.min(W, H) * 0.35;
    const nodePositions = nodes.map((n, i) => ({
      ...n,
      x: cx + radius * Math.cos((2 * Math.PI * i) / nodes.length - Math.PI / 2),
      y: cy + radius * Math.sin((2 * Math.PI * i) / nodes.length - Math.PI / 2),
    }));

    // Draw center topic node
    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 107, 0, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#FF6B00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#F0F4FF';
    ctx.font = 'bold 11px Sora, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(topicInput.split(' ').slice(0, 2).join('\n'), cx, cy);

    // Draw edges + nodes
    nodePositions.forEach((n) => {
      // Edge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(n.x, n.y);
      ctx.strokeStyle = STATUS_COLORS[n.status] + '55';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Node circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, 28, 0, 2 * Math.PI);
      ctx.fillStyle = STATUS_COLORS[n.status] + '33';
      ctx.fill();
      ctx.strokeStyle = STATUS_COLORS[n.status];
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#F0F4FF';
      ctx.font = '10px Sora, sans-serif';
      const label = n.name.length > 12 ? n.name.slice(0, 12) + '…' : n.name;
      ctx.fillText(label, n.x, n.y);
    });

    // Click handler
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const clicked = nodePositions.find((n) => Math.hypot(n.x - mx, n.y - my) < 30);
      setSelected(clicked || null);
    };
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [nodes, topicInput]);

  return (
    <div className="page-enter" style={{ padding: propTopic ? 0 : '80px 24px 40px', maxWidth: propTopic ? '100%' : 1000, margin: '0 auto' }}>
      {!propTopic && (
        <>
          <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Concept Map</h1>
          <p style={{ color: 'var(--edu-muted)', marginBottom: 32 }}>
            Visualize the knowledge graph of any topic — see what you've mastered, what's weak, and what's untouched.
          </p>
        </>
      )}

      {!propTopic && (
        <div className="glass-panel" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              id="graph-topic-input"
              className="edu-input"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchGraph(topicInput)}
              placeholder="Enter topic e.g. Quadratic Equations"
            />
            <button className="edu-btn-primary" onClick={() => fetchGraph(topicInput)} disabled={loading || !topicInput.trim()} style={{ padding: '0 20px' }}>
              {loading ? '⏳' : '🔍 Map'}
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: '0.82rem', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ color: 'var(--edu-muted)', textTransform: 'capitalize' }}>{status}</span>
          </span>
        ))}
      </div>

      {/* Canvas graph */}
      <div className="glass-panel" style={{ padding: 16, marginBottom: 16, minHeight: 360 }}>
        {loading && (
          <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div className="spinner-mini" style={{ width: 32, height: 32 }}></div>
            <div style={{ color: 'var(--edu-muted)' }}>Loading concept graph...</div>
          </div>
        )}
        {!loading && nodes.length === 0 && (
          <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--edu-teal)', opacity: 0.7 }}>
                <circle cx="12" cy="12" r="3"/>
                <circle cx="6" cy="6" r="3"/>
                <circle cx="18" cy="6" r="3"/>
                <circle cx="18" cy="18" r="3"/>
                <circle cx="6" cy="18" r="3"/>
                <line x1="12" y1="12" x2="6" y2="6"/>
                <line x1="12" y1="12" x2="18" y2="6"/>
                <line x1="12" y1="12" x2="18" y2="18"/>
                <line x1="12" y1="12" x2="6" y2="18"/>
              </svg>
            </div>
            <div style={{ color: 'var(--edu-muted)' }}>Enter a topic to visualize its concept map</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--edu-muted)' }}>Make sure to seed the database first via /api/seed</div>
          </div>
        )}
        {!loading && nodes.length > 0 && (
          <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 8, cursor: 'pointer', display: 'block' }} />
        )}
      </div>

      {/* Selected node detail */}
      {selected && (
        <div className="glass-panel-teal" style={{ padding: 20, animation: 'popIn 0.3s ease' }}>
          <h3 style={{ margin: '0 0 10px', color: 'var(--edu-teal)' }}>{selected.name}</h3>
          <div style={{ color: 'var(--edu-muted)', fontSize: '0.88rem', marginBottom: 8 }}>
            {selected.definition}
          </div>
          <div className={`badge ${selected.status === 'mastered' ? 'badge-teal' : selected.status === 'weak' ? '' : 'badge-purple'}`}
            style={{ borderColor: STATUS_COLORS[selected.status], color: STATUS_COLORS[selected.status], background: STATUS_COLORS[selected.status] + '22' }}>
            {selected.status === 'mastered' ? '✓ Mastered' : selected.status === 'weak' ? 'Needs Review' : 'Not Yet Studied'}
          </div>
        </div>
      )}

      {/* Node list */}
      {nodes.length > 0 && (
        <div className="glass-panel" style={{ padding: 20, marginTop: 16 }}>
          <h3 style={{ marginBottom: 14, fontWeight: 600, fontSize: '0.95rem' }}>All Concepts ({nodes.length})</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {nodes.map((n) => (
              <button key={n.name} onClick={() => setSelected(n)}
                style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${STATUS_COLORS[n.status]}`, background: STATUS_COLORS[n.status] + '22', color: STATUS_COLORS[n.status], cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
                {n.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
