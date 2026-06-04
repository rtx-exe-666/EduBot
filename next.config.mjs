/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 uses Turbopack by default — add empty turbopack config to silence warning
  turbopack: {},

  // Allow images from external sources (YouTube thumbnails, RPM avatars)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'models.readyplayer.me' },
    ],
  },
};

export default nextConfig;

