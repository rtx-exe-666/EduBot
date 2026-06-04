'use client';
import { useState, useCallback } from 'react';
import useEduStore from '@/app/store/useEduStore';

export default function VideoFinder() {
  const [topicInput, setTopicInput] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [embeddedVideo, setEmbeddedVideo] = useState(null);
  const { subject } = useEduStore();

  const searchVideos = useCallback(async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    setEmbeddedVideo(null);

    try {
      const res = await fetch(
        `/api/youtube?topic=${encodeURIComponent(topicInput)}&subject=${encodeURIComponent(subject)}`
      );
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Video search error:', err);
    } finally {
      setLoading(false);
    }
  }, [topicInput, subject]);

  const QUICK_TOPICS = ['Quadratic Equations', "Newton's Laws", 'Photosynthesis', 'Trigonometry', 'Periodic Table', 'World War 2'];

  return (
    <div className="page-enter" style={{ padding: '80px 24px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Video Lessons</h1>
      <p style={{ color: 'var(--edu-muted)', marginBottom: 32 }}>
        Find the best YouTube NCERT explanations for any topic in Hindi and English.
      </p>

      {/* Search bar */}
      <div className="glass-panel" style={{ padding: 20, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            id="video-search-input"
            className="edu-input"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchVideos()}
            placeholder="Search topic e.g. Quadratic Equations, Photosynthesis..."
          />
          <button
            id="video-search-btn"
            className="edu-btn-primary"
            onClick={searchVideos}
            disabled={loading || !topicInput.trim()}
            style={{ padding: '0 24px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {loading ? (
              <div className="spinner-mini" style={{ width: 14, height: 14 }}></div>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search
              </>
            )}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK_TOPICS.map((t) => (
            <button
              key={t}
              className="badge badge-teal"
              style={{ cursor: 'pointer', border: 'none' }}
              onClick={() => { setTopicInput(t); }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded player */}
      {embeddedVideo && (
        <div className="glass-panel" style={{ padding: 16, marginBottom: 24, animation: 'fadeInUp 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{embeddedVideo.title}</h3>
            <button className="edu-btn-icon" onClick={() => setEmbeddedVideo(null)} title="Close">✕</button>
          </div>
          <iframe
            className="video-embed"
            src={embeddedVideo.embedUrl}
            title={embeddedVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 12 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <a href={embeddedVideo.url} target="_blank" rel="noopener noreferrer">
              <button className="edu-btn-ghost" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
                Open in YouTube
              </button>
            </a>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel" style={{ overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 157 }} />
              <div style={{ padding: 14 }}>
                <div className="skeleton" style={{ height: 16, marginBottom: 8, width: '90%' }} />
                <div className="skeleton" style={{ height: 12, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video grid */}
      {!loading && videos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {videos.map((video) => (
            <div
              key={video.id}
              id={`video-${video.id}`}
              className="video-card"
              onClick={() => setEmbeddedVideo(video)}
            >
              <div style={{ position: 'relative' }}>
                <img
                  className="video-thumbnail"
                  src={video.thumbnail}
                  alt={video.title}
                  onError={(e) => { e.target.src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`; }}
                />
                {video.duration && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'rgba(0,0,0,0.8)', color: 'white',
                    padding: '2px 6px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    {video.duration}
                  </div>
                )}
                {/* Play overlay */}
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s', background: 'rgba(0,0,0,0.3)',
                  fontSize: '2.5rem',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
                >
                  ▶
                </div>
              </div>

              <div style={{ padding: '12px 14px 14px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {video.title}
                </h4>
                <div style={{ color: 'var(--edu-muted)', fontSize: '0.78rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h20M2 17h20"/>
                  </svg>
                  {video.channel}
                </div>
                {video.views && (
                  <div style={{ color: 'var(--edu-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    {video.views} views
                  </div>
                )}
                {video.source === 'curated' && (
                  <span className="badge badge-saffron" style={{ marginTop: 8, fontSize: '0.7rem', padding: '3px 8px' }}>Curated</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && videos.length === 0 && topicInput && !loading && (
        <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--edu-muted)', opacity: 0.5, margin: '0 auto' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h3 style={{ color: 'var(--edu-muted)', fontWeight: 400 }}>Search for a topic to find videos</h3>
          <p style={{ color: 'var(--edu-muted)', fontSize: '0.88rem' }}>Videos from YouTube India + curated NCERT links</p>
        </div>
      )}

      {!loading && videos.length === 0 && !topicInput && (
        <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--edu-muted)', opacity: 0.5, margin: '0 auto' }}>
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h20M2 17h20"/>
            </svg>
          </div>
          <h3 style={{ color: 'var(--edu-muted)', fontWeight: 400 }}>Search for a topic to find videos</h3>
          <p style={{ color: 'var(--edu-muted)', fontSize: '0.88rem' }}>Videos from YouTube India + curated NCERT links</p>
        </div>
      )}
    </div>
  );
}
