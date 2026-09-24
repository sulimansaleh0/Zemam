import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'زمام - تطبيق السائق الميداني',
    short_name: 'زمام السائق',
    description: 'تطبيق السائق الميداني المعتمد لمنظومة زمام لإدارة الأساطيل وتتبع المهام والرحلات اللوجستية.',
    start_url: '/driver',
    scope: '/driver',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#0F766E',
    orientation: 'portrait',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
