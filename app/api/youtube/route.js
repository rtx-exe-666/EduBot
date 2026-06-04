export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || '';
    const subject = searchParams.get('subject') || '';

    const results = [];

    // Try YouTube Data API v3
    if (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your_youtube_api_key_here') {
      try {
        const query = encodeURIComponent(
          `${topic} ${subject} explained in Hindi NCERT class 10 11 12`
        );
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&q=${query}&type=video&videoCategoryId=27` +
          `&maxResults=6&order=relevance&relevanceLanguage=hi` +
          `&regionCode=IN&key=${process.env.YOUTUBE_API_KEY}`
        );

        if (ytRes.ok) {
          const ytData = await ytRes.json();

          // Get video durations
          const ids = ytData.items?.map((i) => i.id.videoId).join(',') || '';
          let durations = {};
          if (ids) {
            const detailRes = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?` +
              `part=contentDetails,statistics&id=${ids}&key=${process.env.YOUTUBE_API_KEY}`
            );
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              detailData.items?.forEach((v) => {
                durations[v.id] = {
                  duration: parseDuration(v.contentDetails?.duration),
                  views: parseInt(v.statistics?.viewCount || 0).toLocaleString('en-IN'),
                };
              });
            }
          }

          const videos = ytData.items?.map((item) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
            publishedAt: item.snippet.publishedAt,
            duration: durations[item.id.videoId]?.duration || '',
            views: durations[item.id.videoId]?.views || '',
            source: 'youtube',
          })) || [];

          results.push(...videos);
        }
      } catch (ytErr) {
        console.warn('YouTube API error:', ytErr.message);
      }
    }

    // Fallback curated videos if YouTube fails or returns nothing
    if (results.length === 0) {
      const curated = getCuratedVideos(topic, subject);
      results.push(...curated);
    }

    return Response.json({ videos: results });
  } catch (err) {
    console.error('YouTube route error:', err);
    return Response.json({ videos: [], error: err.message }, { status: 500 });
  }
}

// Parse ISO 8601 duration (PT4M30S → "4:30")
function parseDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Curated fallback videos for popular NCERT topics
function getCuratedVideos(topic, subject) {
  const curated = {
    'Quadratic Equations': [
      { id: 'IKsi-DnayBk', title: 'Quadratic Equations Class 10 | Full Chapter | Vedantu', channel: 'Vedantu' },
      { id: 'Z5MnOHJR438', title: 'Quadratic Formula & Discriminant | Letstute', channel: 'Letstute' },
    ],
    'Trigonometry': [
      { id: 'T9lt6MZKLck', title: 'Trigonometry Full Chapter Class 10 | NCERT', channel: 'Vedantu' },
    ],
    "Newton's Laws": [
      { id: 'ou9YMWlJgkE', title: "Newton's Laws of Motion | Class 11 Physics | NCERT", channel: 'Vedantu' },
    ],
    'Calculus': [
      { id: 'WUvTyaaNkzM', title: 'Calculus for JEE | Differentiation | MathonGo', channel: 'MathonGo' },
    ],
    'Atomic Structure': [
      { id: 'T-lADpzDVTg', title: 'Atomic Structure Class 11 Chemistry | NCERT', channel: 'Unacademy' },
    ],
    'Data Structures': [
      { id: 'RBSGKlAvoiM', title: 'Data Structures Full Course | FreeCodeCamp', channel: 'freeCodeCamp' },
    ],
  };

  const videos = curated[topic] || [
    { id: 'WUvTyaaNkzM', title: `${topic || subject} — NCERT Explained`, channel: 'EduBot Curated' },
  ];

  return videos.map((v) => ({
    ...v,
    thumbnail: `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    embedUrl: `https://www.youtube.com/embed/${v.id}`,
    source: 'curated',
    duration: '',
    views: '',
    publishedAt: '',
  }));
}
