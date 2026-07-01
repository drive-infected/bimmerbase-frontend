// app/[lang]/models/[series]/page.js
import Script from 'next/script';

function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map((block) => {
    if (block.type === 'paragraph') {
      const text = block.children?.map((c) => c.text || '').join('');
      return text ? `<p>${text}</p>` : '';
    }
    if (block.type === 'heading') {
      const text = block.children?.map((c) => c.text).join('');
      return `<h${block.level || 2}>${text}</h${block.level || 2}>`;
    }
    if (block.type === 'list') {
      const tag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = (block.children || []).map((item) => {
        if (item.type === 'list-item') {
          const text = item.children?.map((c) => c.text || '').join('');
          return `<li>${text}</li>`;
        }
        return '';
      }).join('');
      return `<${tag}>${items}</${tag}>`;
    }
    return '';
  }).join('');
}

export async function generateMetadata({ params }) {
  const { series, lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/series?locale=${lang}&filters[slug][$eq]=${series}&populate=*`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const serie = data.data?.[0];

  if (!serie) {
    return { title: lang === 'ru' ? 'Серия не найдена – BimmerBase' : 'Series not found – BimmerBase' };
  }

  const title = `${serie.title} – BimmerBase`;
  const description = serie.description
    ? serie.description.replace(/<[^>]+>/g, '').substring(0, 160)
    : `${serie.title} – ${lang === 'ru' ? 'поколения, характеристики, история модели.' : 'generations, specs, model history.'}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}/models/${serie.slug}`,
      languages: {
        en: `${siteUrl}/en/models/${serie.slug}`,
        ru: `${siteUrl}/ru/models/${serie.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}/models/${serie.slug}`,
      siteName: 'BimmerBase',
      type: 'website',
      images: serie.image?.url ? [serie.image.url] : [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

export default async function SeriesPage({ params }) {
  const { series, lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/series?locale=${lang}&filters[slug][$eq]=${series}&populate=*`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const serie = data.data?.[0];

  if (!serie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href={`/${lang}/models`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}
        </a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Серия не найдена' : 'Series not found'}</h1>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'ru' ? 'Модельный ряд' : 'Model Range',
        item: `${siteUrl}/${lang}/models`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: serie.title,
      },
    ],
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <a href={`/${lang}/models`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}
        </a>

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          {serie.image?.url && (
            <div className="md:w-1/3 flex-shrink-0">
              <img
                src={serie.image.url}
                alt={serie.title}
                className="w-full h-auto rounded-lg shadow-md object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{serie.title}</h1>
            {serie.description && (
              <div className="mt-4 rich-text text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: renderRichText(serie.description) }} />
              </div>
            )}
          </div>
        </div>

        {serie.generations && serie.generations.length > 0 && (
          <div className="mt-10">
            <h2 className="section-title">{lang === 'ru' ? 'Поколения' : 'Generations'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {serie.generations
                .filter((gen) => gen.locale === lang)
                .map((gen) => (
                  <a
                    key={gen.id}
                    href={`/${lang}/models/${serie.slug}/${gen.slug}`}
                    className="card-link flex gap-4 items-start"
                  >
                    {gen.image?.url ? (
                      <img
                        src={gen.image.url}
                        alt={gen.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                        {lang === 'ru' ? 'Нет фото' : 'No img'}
                      </div>
                    )}
                    <div>
                      <strong className="text-xl block">{gen.title}</strong>
                      <p className="text-sm text-gray-500 mt-1">
                        {gen.production_start?.substring(0, 4)}–{gen.production_end?.substring(0, 4)}
                      </p>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        )}
      </div>

      <Script
        id="schema-breadcrumbs-series"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}