// app/[lang]/models/[series]/[generation]/page.js
import Tabs from './tabs';
import RelatedLinks from '@/components/RelatedLinks';
import { getGenerationSections } from '@/lib/relatedLinks';
import Script from 'next/script';

function getImageUrl(image) {
  if (!image) return null;
  return image.url || image.formats?.large?.url || image.formats?.medium?.url || image.formats?.small?.url || null;
}

function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map((block) => {
    if (block.type === 'paragraph') {
      const text = block.children?.map((c) => {
        let content = c.text || '';
        if (c.bold) content = `<strong>${content}</strong>`;
        if (c.italic) content = `<em>${content}</em>`;
        return content;
      }).join('');
      return text ? `<p>${text}</p>` : '';
    }
    if (block.type === 'heading') {
      const level = block.level || 2;
      const text = block.children?.map((c) => c.text).join('');
      return `<h${level}>${text}</h${level}>`;
    }
    if (block.type === 'list') {
      const tag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = renderListItems(block.children);
      return `<${tag}>${items}</${tag}>`;
    }
    return '';
  }).join('');
}

function renderListItems(children) {
  if (!children || !Array.isArray(children)) return '';
  return children.map((child) => {
    if (child.type === 'list-item') {
      const text = child.children?.filter((c) => c.type === 'text')?.map((c) => c.text || '').join('') || '';
      return `<li>${text}</li>`;
    }
    if (child.type === 'list') {
      const tag = child.format === 'ordered' ? 'ol' : 'ul';
      return `<${tag}>${renderListItems(child.children)}</${tag}>`;
    }
    return '';
  }).join('');
}

export async function generateMetadata({ params }) {
  const { generation, lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  const metaSearchParams = new URLSearchParams({
    'locale': lang,
    'filters[slug][$eq]': generation,
    'populate[series]': 'true',
    'populate[modifications][fields]': 'title',
    'populate[engines][fields]': 'index,displacement',
  });
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/generations?${metaSearchParams.toString()}`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const gen = data.data?.[0];

  if (!gen) {
    return {
      title: lang === 'ru' ? 'Поколение не найдено – BimmerBase' : 'Generation not found – BimmerBase',
    };
  }

  const title = `BMW ${gen.title} – ${gen.series?.title || ''} – BimmerBase`;
  const years = gen.production_start
    ? `${gen.production_start.substring(0, 4)}–${gen.production_end?.substring(0, 4) || 'н.в.'}`
    : '';
  const enginesCount = gen.engines?.length || 0;
  const modsCount = gen.modifications?.length || 0;

  let description;
  if (lang === 'ru') {
    description = `BMW ${gen.title} (${gen.series?.title || 'серия'}) — технические характеристики, обзор поколения, доступные двигатели (${enginesCount} шт.) и модификации (${modsCount} шт.). Годы выпуска: ${years}.`;
  } else {
    description = `BMW ${gen.title} (${gen.series?.title || 'Series'}) — specifications, overview, available engines (${enginesCount}) and modifications (${modsCount}). Production years: ${years}.`;
  }
  description = description.substring(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}/models/${gen.series?.slug}/${gen.slug}`,
      languages: {
        en: `${siteUrl}/en/models/${gen.series?.slug}/${gen.slug}`,
        ru: `${siteUrl}/ru/models/${gen.series?.slug}/${gen.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}/models/${gen.series?.slug}/${gen.slug}`,
      siteName: 'BimmerBase',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/images/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function GenerationPage({ params }) {
  const { series, generation, lang } = await params;

  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('filters[slug][$eq]', generation);
  searchParams.set('populate[series]', 'true');
  searchParams.set('populate[modifications][populate][engines]', 'true');
  searchParams.set('populate[engines][populate][engine_family]', 'true');
  searchParams.set('populate[special_versions][populate][engine]', 'true');
  searchParams.set('populate[articles]', 'true');
  searchParams.set('populate[image]', 'true');

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/generations?${searchParams.toString()}`;
  const res = await fetch(apiUrl, { cache: 'no-store' });

  if (!res.ok) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки данных' : 'Data loading error'}
        </h1>
        <p className="mt-2 text-gray-700">
          {lang === 'ru'
            ? `Не удалось загрузить поколение. Код ответа: ${res.status}`
            : `Failed to load generation. Status: ${res.status}`}
        </p>
      </div>
    );
  }

  const data = await res.json();
  const gen = data.data?.[0];

  if (!gen) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/${lang}/models`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}
        </a>
        <h1 className="text-2xl font-bold mt-4">
          {lang === 'ru' ? 'Поколение не найдено' : 'Generation not found'}
        </h1>
      </div>
    );
  }

  const startYear = gen.production_start?.substring(0, 4) || '...';
  const endYear = gen.production_end?.substring(0, 4) || '...';
  const parentSeries = gen.series;
  const relatedSections = getGenerationSections(gen, lang);
  const imgUrl = getImageUrl(gen.image);
  const descriptionHtml = gen.description ? renderRichText(gen.description) : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  const carSchema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `BMW ${gen.title}`,
    brand: { '@type': 'Brand', name: 'BMW' },
    model: parentSeries?.title,
    productionDate: startYear,
    vehicleModelDate: startYear,
    ...(gen.engines?.length > 0 && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        name: gen.engines[0].index,
        engineDisplacement: `${gen.engines[0].displacement} cc`,
      },
    }),
  };

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
      parentSeries && {
        '@type': 'ListItem',
        position: 2,
        name: parentSeries.title,
        item: `${siteUrl}/${lang}/models/${parentSeries.slug}`,
      },
      {
        '@type': 'ListItem',
        position: parentSeries ? 3 : 2,
        name: gen.title,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <a href={`/${lang}/models`} className="text-blue-700 no-underline hover:underline">
            {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}
          </a>
          {parentSeries && (
            <>
              <span className="mx-2">/</span>
              <a href={`/${lang}/models/${parentSeries.slug}`} className="text-blue-700 no-underline hover:underline">
                {parentSeries.title}
              </a>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-700">{gen.title}</span>
        </nav>

        {/* Шапка поколения как на странице категории */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Изображение слева */}
          <div className="md:w-1/3 flex-shrink-0">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={gen.title}
                className="w-full h-auto rounded-lg shadow-md object-contain"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                {lang === 'ru' ? 'Нет фото' : 'No image'}
              </div>
            )}
          </div>

          {/* Текст справа */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mt-2">
              BMW <span className="text-[#0066B1]">{gen.title}</span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              {lang === 'ru' ? 'Годы выпуска' : 'Production years'}: {startYear}–{endYear}
            </p>
            {descriptionHtml && (
              <div className="mt-4 text-gray-700 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              </div>
            )}
          </div>
        </div>

        <Tabs
          lang={lang}
          gen={gen}
          modifications={gen.modifications || []}
          specialVersions={gen.special_versions || []}
          modelCodes={[]}
        />

        <RelatedLinks sections={relatedSections} lang={lang} />
      </div>

      <Script
        id="schema-car"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carSchema) }}
      />
      <Script
        id="schema-breadcrumbs"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}