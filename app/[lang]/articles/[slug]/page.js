// app/[lang]/articles/[slug]/page.js
import RelatedLinks from '@/components/RelatedLinks';
import { getArticleSections } from '@/lib/relatedLinks';
import Script from 'next/script';

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  // Лёгкий запрос для метаданных
  const metaRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/articles?locale=${lang}&filters[slug][$eq]=${slug}&populate[category]=true`,
    { cache: 'no-store' }
  );
  const metaData = await metaRes.json();
  const article = metaData.data?.[0];

  if (!article) {
    return { title: lang === 'ru' ? 'Статья не найдена – BimmerBase' : 'Article not found – BimmerBase' };
  }

  const title = `${article.title} – BimmerBase`;
  const description = article.intro?.substring(0, 160) || title;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}/articles/${article.slug}`,
      languages: {
        en: `${siteUrl}/en/articles/${article.slug}`,
        ru: `${siteUrl}/ru/articles/${article.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}/articles/${article.slug}`,
      siteName: 'BimmerBase',
      type: 'article',
      publishedTime: article.published_date,
      images: [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

// ... функции renderRichText, renderListItems, translateDifficulty, categoryTranslations, translateCategory остаются без изменений ...

export default async function ArticlePage({ params }) {
  const { slug, lang } = await params;

  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('filters[slug][$eq]', slug);
  searchParams.set('populate[generations][populate][series]', 'true');
  searchParams.set('populate[engines][populate][engine_family]', 'true');
  searchParams.set('populate[engine_families]', 'true');
  searchParams.set('populate[special_versions]', 'true');
  searchParams.set('populate[category]', 'true');
  searchParams.set('populate[tags]', 'true');

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/articles?${searchParams.toString()}`;
  let article;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    article = data.data?.[0];
  } catch (err) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки статьи' : 'Article loading error'}
        </h1>
        <p className="mt-2 text-gray-700">{err.message}</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <a href={`/${lang}/articles`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
        </a>
        <h1 className="text-2xl font-bold mt-4">
          {lang === 'ru' ? 'Статья не найдена' : 'Article not found'}
        </h1>
      </main>
    );
  }

  const contentHtml = renderRichText(article.content);
  const relatedSections = getArticleSections(article, lang);
  const categoryName = article.category?.title
    ? translateCategory(article.category.title, lang)
    : null;

  // Форматирование даты
  const formattedDate = article.published_date
    ? new Date(article.published_date).toLocaleDateString(
        lang === 'ru' ? 'ru-RU' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';
  const articleUrl = `${siteUrl}/${lang}/articles/${article.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.intro,
    datePublished: article.published_date,
    ...(article.tags?.length > 0 && {
      keywords: article.tags.map(tag => tag.title).join(', '),
    }),
    author: {
      '@type': 'Organization',
      name: 'BimmerBase',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BimmerBase',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: articleUrl,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'ru' ? 'База знаний' : 'Knowledge Base',
        item: `${siteUrl}/${lang}/articles`,
      },
      article.category && {
        '@type': 'ListItem',
        position: 2,
        name: translateCategory(article.category.title, lang),
        item: `${siteUrl}/${lang}/articles?category=${article.category.slug}`,
      },
      {
        '@type': 'ListItem',
        position: article.category ? 3 : 2,
        name: article.title,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <a href={`/${lang}/articles`} className="text-blue-700 no-underline hover:underline">
            {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
          </a>
          {categoryName && (
            <>
              <span className="mx-2">/</span>
              <a href={`/${lang}/articles?category=${article.category.slug}`} className="text-blue-700 no-underline hover:underline">
                {categoryName}
              </a>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-700">{article.title}</span>
        </nav>

        <h1 className="text-3xl font-bold leading-tight">{article.title}</h1>

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          {formattedDate && (
            <span>{formattedDate}</span>
          )}
          {article.difficulty && (
            <span>{translateDifficulty(article.difficulty, lang)}</span>
          )}
        </div>

        {article.intro && (
          <p className="mt-6 text-lg text-gray-600 italic leading-relaxed border-l-4 border-[#0066B1] pl-4">
            {article.intro}
          </p>
        )}

        <div className="mt-8 rich-text text-base">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>

        <RelatedLinks sections={relatedSections} lang={lang} />
      </main>

      <Script
        id="schema-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="schema-breadcrumbs-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}