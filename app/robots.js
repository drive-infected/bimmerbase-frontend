export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/auth/', '/garage/', '/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}