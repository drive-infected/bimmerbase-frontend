// app/[lang]/models/[series]/page.js
import Script from 'next/script';
import OptimizedImage from '@/components/OptimizedImage';

function extractDescription(gen) {
  const blocks = gen.description;
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;
  const firstBlock = blocks[0];
  if (firstBlock.children) {
    return firstBlock.children.map(c => c.text || '').join('').trim();
  }
  return null;
}

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
    `${process.env.NEXT_PUBLIC_API_URL}/api/series?locale=${lang}&filters[slug][$eq]=${series}&populate[image]=true`,
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

  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('filters[slug][$eq]', series);
  searchParams.set('populate[image]', 'true');
  searchParams.set('populate[generations][populate][image]', 'true');

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/series?${searchParams.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки серии' : 'Series loading error'}
        </h1>
        <p className="text-sm text-gray-500">Status: {res.status}</p>
      </div>
    );
  }

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
          <div className="md:w-1/3 flex-shrink-0">
            <OptimizedImage
              image={serie.image}
              alt={serie.title}
              width={400}
              height={300}
              className="w-full h-auto rounded-lg shadow-md object-contain"
              priority
            />
          </div>
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
            <div className="flex flex-col gap-4">
              {serie.generations
                .filter((gen) => gen.locale === lang)
                .map((gen) => {
                  const desc = extractDescription(gen);
                  return (
                    <a
                      key={gen.id}
                      href={`/${lang}/models/${serie.slug}/${gen.slug}`}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_280px] overflow-hidden border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
                    >
                      <div className="p-5 sm:p-6 order-2 sm:order-1">
                        <strong className="text-lg block group-hover:text-[#0066B1] transition-colors">
                          {gen.title}
                        </strong>
                        <p className="text-xs text-gray-500 mt-1">
                          {gen.production_start?.substring(0, 4)}–{gen.production_end?.substring(0, 4)}
                        </p>
                        {desc && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {desc}
                          </p>
                        )}
                      </div>
                      <div className="h-48 sm:h-auto order-1 sm:order-2 bg-gray-100">
                        <OptimizedImage
                          image={gen.image}
                          alt={gen.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 280px"
                        />
                      </div>
                    </a>
                  );
                })}
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