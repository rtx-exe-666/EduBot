'use client';
import dynamic from 'next/dynamic';
import AvatarFallback from './AvatarFallback';

// Load Three.js VRM canvas only on the client (never SSR)
const Avatar3DCanvas = dynamic(() => import('./Avatar3DCanvas'), {
  ssr: false,
  loading: () => <AvatarFallback />,
});

export default function Avatar3D({ size }) {
  // NEXT_PUBLIC_ prefix is required for client-side env access in Next.js
  const vrmUrl = process.env.NEXT_PUBLIC_EDUBOT_RPM_AVATAR_URL || '';

  if (!vrmUrl) {
    return <AvatarFallback size={size} />;
  }

  return <Avatar3DCanvas vrmUrl={vrmUrl} size={size} />;
}

