// app/[lang]/engines/[family]/page.js
import RelatedLinks from '@/components/RelatedLinks';
import Script from 'next/script';
import OptimizedImage from '@/components/OptimizedImage';
import FamilyTabs from './tabs'; // клиентский компонент

function blocksToText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .flatMap(block => {
      if (block.children) {
        return block.children.map(child => child.text || '').join('');
      }
      return '';
    })
    .join(' ')
    .trim();
}

export async function generateMetadata({ params }) {
  const { family, lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  const metaRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engine-families?locale=${lang}&filters[slug][$eq]=${family}&populate[engines]=true`,
    { cache: 'no-store' }
  );
  const metaData = await metaRes.json();
  const fam = metaData.data?.[0];

  if (!fam) {
    return { title: lang === 'ru' ? 'Двигатель не найден – BimmerBase' : 'Engine not found – BimmerBase' };
  }

  const title = `${fam.code} – ${lang === 'ru' ? 'двигатель BMW' : 'BMW engine'} – BimmerBase`;
  const descriptionText = blocksToText(fam.description).substring(0, 160) || `${fam.code} – ${lang === 'ru' ? 'двигатель BMW' : 'BMW engine'}`;

  return {
    title,
    description: descriptionText,
    alternates: {
      canonical: `${siteUrl}/${lang}/engines/${fam.slug}`,
      languages: {
        en: `${siteUrl}/en/engines/${fam.slug}`,
        ru: `${siteUrl}/ru/engines/${fam.slug}`,
      },
    },
    openGraph: {
      title,
      description: descriptionText,
      url: `${siteUrl}/${lang}/engines/${fam.slug}`,
      siteName: 'BimmerBase',
      type: 'website',
      images: [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

export default async function EngineFamilyPage({ params }) {
  const { family, lang } = await params;

  const famSearchParams = new URLSearchParams();
  famSearchParams.set('locale', lang);
  famSearchParams.set('filters[slug][$eq]', family);
  famSearchParams.set('populate[engines]', 'true');
  famSearchParams.set('populate[articles]', 'true');
  famSearchParams.set('populate[image]', 'true');
  famSearchParams.set('populate[predecessor]', 'true');
  famSearchParams.set('populate[successor]', 'true');

  const famRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engine-families?${famSearchParams.toString()}`,
    { cache: 'no-store' }
  );
  const famData = await famRes.json();
  const fam = famData.data?.[0];

  if (!fam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href={`/${lang}/engines`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'Двигатели' : 'Engines'}
        </a>
        <h1 className="text-2xl mt-4">
          {lang === 'ru' ? 'Двигатель не найден' : 'Engine not found'}
        </h1>
      </div>
    );
  }

  // Получаем модификации автомобилей для применяемости
  const enginesForFamily = fam.engines || [];
  let vehicleModifications = [];
  try {
    const modPromises = enginesForFamily.map(async (eng) => {
      const modRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/modifications?filters[engines][documentId][$eq]=${eng.documentId}&populate=generation.series`,
        { cache: 'no-store' }
      );
      const modData = await modRes.json();
      return modData.data || [];
    });
    const results = await Promise.all(modPromises);
    vehicleModifications = results.flat();
  } catch (e) {
    console.error('Failed to load modifications', e);
  }

  // Группируем модификации по сериям
  const groupedBySeries = {};
  vehicleModifications.forEach(mod => {
    if (!mod.generation || !mod.generation.series) return;
    const seriesTitle = mod.generation.series.title;
    const seriesSlug = mod.generation.series.slug;
    const key = seriesSlug;
    if (!groupedBySeries[key]) {
      groupedBySeries[key] = {
        title: seriesTitle,
        slug: seriesSlug,
        modifications: [],
      };
    }
    groupedBySeries[key].modifications.push(mod);
  });

  const engines = (fam.engines || []).sort((a, b) => {
    if (a.displacement !== b.displacement) return (a.displacement || 0) - (b.displacement || 0);
    return (a.index || '').localeCompare(b.index || '');
  });

  // Статьи для RelatedLinks
  const articles = (fam.articles || []).filter((a) => a.locale === lang);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'ru' ? 'Двигатели' : 'Engines',
        item: `${siteUrl}/${lang}/engines`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: fam.code,
      },
    ],
  };

  const engineDescription = blocksToText(fam.description).substring(0, 500) || `${fam.code} engine`;
  const engineSchema = {
    '@context': 'https://schema.org',
    '@type': 'EngineSpecification',
    name: fam.code,
    description: engineDescription,
    fuelType: fam.fuel_type,
    engineDisplacement: fam.cylinders ? `${fam.cylinders} cyl` : undefined,
    ...(fam.predecessor && { predecessorOf: { '@type': 'EngineSpecification', name: fam.predecessor.code } }),
    ...(fam.successor && { successorOf: { '@type': 'EngineSpecification', name: fam.successor.code } }),
  };

  // Преобразуем technical_update в HTML
  const tuHtml = fam.technical_update ? renderRichText(fam.technical_update) : null;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/${lang}/engines`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'Двигатели' : 'Engines'}
        </a>

        {/* Шапка */}
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          <div className="md:w-1/3 flex-shrink-0 relative">
            <OptimizedImage
              image={fam.image}
              alt={fam.code}
              width={400}
              height={300}
              className="w-full h-auto rounded-lg shadow-md object-contain"
              priority
            />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mt-2">
              <span className="text-[#0066B1]">{fam.code}</span>
            </h1>
            <div className="flex flex-wrap gap-2 mt-3 text-sm text-gray-500">
              <span>{fam.production_start?.substring(0, 4)}–{fam.production_end?.substring(0, 4)}</span>
              <span>•</span>
              <span>{fam.cylinders} cyl</span>
              <span>•</span>
              <span>
                {fam.layout === 'Longitudinal'
                  ? lang === 'ru' ? 'Продольное' : 'Longitudinal'
                  : lang === 'ru' ? 'Поперечное' : 'Transverse'}
              </span>
              <span>•</span>
              <span>{fam.head_material} / {fam.block_material}</span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
              {fam.predecessor && (
                <div>
                  <span className="text-gray-500">
                    {lang === 'ru' ? '← Предшественник' : '← Predecessor'}:{' '}
                  </span>
                  <a href={`/${lang}/engines/${fam.predecessor.slug}`} className="text-blue-700 hover:underline">
                    {fam.predecessor.code}
                  </a>
                </div>
              )}
              {fam.successor && (
                <div>
                  <span className="text-gray-500">
                    {lang === 'ru' ? 'Преемник' : 'Successor'}:{' '}
                  </span>
                  <a href={`/${lang}/engines/${fam.successor.slug}`} className="text-blue-700 hover:underline">
                    {fam.successor.code}
                  </a>
                  {' →'}
                </div>
              )}
            </div>

            {fam.description && (
              <div className="mt-4 rich-text text-gray-700 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: renderRichText(fam.description) }} />
              </div>
            )}
          </div>
        </div>

        {fam.features && (
          <div className="mt-6 rich-text">
            <h2 className="section-title">{lang === 'ru' ? 'Особенности' : 'Features'}</h2>
            <div dangerouslySetInnerHTML={{ __html: renderRichText(fam.features) }} />
          </div>
        )}

        {/* Табы */}
        <FamilyTabs
          lang={lang}
          engines={engines}
          groupedBySeries={Object.values(groupedBySeries)}
          technicalUpdateHtml={tuHtml}
          familySlug={fam.slug}
        />

        {/* Статьи (если есть) */}
        {articles.length > 0 && (
          <div className="mt-10">
            <h2 className="section-title">{lang === 'ru' ? 'Статьи' : 'Articles'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map(article => (
                <a key={article.id} href={`/${lang}/articles/${article.slug}`} className="card-link">
                  <span className="card-title">{article.title}</span>
                  {article.intro && <p className="card-text mt-1 text-sm">{article.intro.substring(0, 100)}</p>}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <Script
        id="schema-breadcrumbs-family"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="schema-engine"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(engineSchema) }}
      />
    </>
  );
}

function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .map((block) => {
      if (block.type === 'paragraph') {
        const text = block.children
          ?.map((c) => {
            let t = c.text || '';
            if (c.bold) t = `<strong>${t}</strong>`;
            if (c.italic) t = `<em>${t}</em>`;
            return t;
          })
          .join('');
        return text ? `<p>${text}</p>` : '';
      }
      if (block.type === 'heading') {
        const text = block.children?.map((c) => c.text).join('');
        return `<h${block.level || 2}>${text}</h${block.level || 2}>`;
      }
      if (block.type === 'list') {
        const tag = block.format === 'ordered' ? 'ol' : 'ul';
        const items = renderListItems(block.children);
        return `<${tag}>${items}</${tag}>`;
      }
      return '';
    })
    .join('');
}

function renderListItems(children) {
  if (!children || !Array.isArray(children)) return '';
  return children
    .map((child) => {
      if (child.type === 'list-item') {
        const text =
          child.children
            ?.filter((c) => c.type === 'text')
            ?.map((c) => c.text || '')
            .join('') || '';
        return `<li>${text}</li>`;
      }
      if (child.type === 'list') {
        const tag = child.format === 'ordered' ? 'ol' : 'ul';
        return `<${tag}>${renderListItems(child.children)}</${tag}>`;
      }
      return '';
    })
    .join('');
}