// app/[lang]/articles/layout.js
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const title = lang === 'ru' ? 'База знаний – BimmerBase' : 'Knowledge Base – BimmerBase';
  const description = lang === 'ru'
    ? 'Статьи по ремонту, обслуживанию, истории и доработкам классических BMW. Диагностика, ремонт, автоспорт.'
    : 'Articles about repair, maintenance, history and tuning of classic BMWs. Diagnostics, repair, motorsport.';

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/${lang}/articles`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/en/articles`,
        ru: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/ru/articles`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/${lang}/articles`,
      siteName: 'BimmerBase',
      type: 'website',
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/images/og-default.jpg`],
    },
  };
}

export default function ArticlesLayout({ children }) {
  return <>{children}</>;
}