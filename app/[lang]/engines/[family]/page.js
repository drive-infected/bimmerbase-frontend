// app/[lang]/engines/[family]/page.js
import RelatedLinks from '@/components/RelatedLinks';
import Script from 'next/script';
import OptimizedImage from '@/components/OptimizedImage';

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
    return { title: lang === 'ru' ? 'Семейство не найдено – BimmerBase' : 'Family not found – BimmerBase' };
  }

  const title = `${fam.code} – ${lang === 'ru' ? 'семейство двигателей' : 'engine family'} – BimmerBase`;
  const description = `${fam.code} – ${fam.cylinders}-цилиндровый ${fam.fuel_type === 'Petrol' ? 'бензиновый' : 'дизельный'} двигатель (${fam.production_start?.substring(0,4)}–${fam.production_end?.substring(0,4)}). ${fam.engines?.length || 0} модификаций.`.substring(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}/engines/${fam.slug}`,
      languages: {
        en: `${siteUrl}/en/engines/${fam.slug}`,
        ru: `${siteUrl}/ru/engines/${fam.slug}`,
      },
    },
    openGraph: {
      title,
      description,
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
  famSearchParams.set('populate[predecessor]', 'true');   // 👈 добавляем предшественника
  famSearchParams.set('populate[successor]', 'true');     // 👈 и последователя

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
          {lang === 'ru' ? 'Семейство не найдено' : 'Family not found'}
        </h1>
      </div>
    );
  }

  // 2. Поколения применения
  const genSearchParams = new URLSearchParams();
  genSearchParams.set('locale', lang);
  genSearchParams.set('filters[engines][engine_family][slug][$eq]', family);
  genSearchParams.set('populate[series]', 'true');
  genSearchParams.set('sort', 'title');

  let generations = [];
  try {
    const genRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/generations?${genSearchParams.toString()}`,
      { cache: 'no-store' }
    );
    const genData = await genRes.json();
    generations = genData.data || [];
  } catch (e) {
    console.error('Failed to load generations', e);
  }

  const engines = (fam.engines || []).sort((a, b) => {
    if (a.displacement !== b.displacement) return (a.displacement || 0) - (b.displacement || 0);
    return (a.index || '').localeCompare(b.index || '');
  });

  // 3. Секции для RelatedLinks
  const sections = [];

  if (engines.length > 0) {
    sections.push({
      key: 'engines',
      title: lang === 'ru' ? 'Двигатели' : 'Engines',
      items: engines.map((eng) => ({
        id: eng.documentId,
        label: eng.index,
        subtitle: `${eng.power_hp} hp • ${eng.displacement} cc`,
        href: `/${lang}/engines/${fam.slug}/${eng.slug}`,
      })),
    });
  }

  if (generations.length > 0) {
    const sorted = [...generations].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    sections.push({
      key: 'generations',
      title: lang === 'ru' ? 'Применяемость' : 'Applications',
      items: sorted.map((gen) => ({
        id: gen.documentId,
        label: gen.title,
        subtitle: gen.series?.title || '',
        href: `/${lang}/models/${gen.series?.slug || ''}/${gen.slug}`,
      })),
    });
  }

  const articles = (fam.articles || []).filter((a) => a.locale === lang);
  if (articles.length > 0) {
    sections.push({
      key: 'articles',
      title: lang === 'ru' ? 'Статьи' : 'Articles',
      items: articles.map((article) => ({
        id: article.documentId,
        label: article.title,
        subtitle: article.intro ? article.intro.substring(0, 100) : null,
        href: `/${lang}/articles/${article.slug}`,
      })),
    });
  }

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

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/${lang}/engines`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'Двигатели' : 'Engines'}
        </a>

        {/* Шапка с обложкой, техническими данными, ссылками на поколения и описанием */}
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

            {/* Предшественник / последователь */}
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

            {/* Описание семейства теперь внутри шапки */}
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

        <RelatedLinks sections={sections} lang={lang} />
      </div>

      <Script
        id="schema-breadcrumbs-family"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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