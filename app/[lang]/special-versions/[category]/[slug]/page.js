// app/[lang]/special-versions/[category]/[slug]/page.js
import RelatedLinks from '@/components/RelatedLinks';
import { getSpecialVersionSections } from '@/lib/relatedLinks';
import Script from 'next/script';

export async function generateMetadata({ params }) {
  const { category, slug, lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  const metaRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/special-versions?locale=${lang}&filters[slug][$eq]=${slug}&filters[special_version_category][slug][$eq]=${category}&populate=special_version_category&populate=generation&populate=engine`,
    { cache: 'no-store' }
  );
  const metaData = await metaRes.json();
  const sv = metaData.data?.[0];

  if (!sv) {
    return { title: lang === 'ru' ? 'Спецверсия не найдена – BimmerBase' : 'Special version not found – BimmerBase' };
  }

  const title = `${sv.title} – BimmerBase`;
  const description = `${sv.title} – ${sv.special_version_category?.title || ''} BMW${sv.generation ? ', поколение ' + sv.generation.title : ''}. ${sv.production_start ? 'Выпуск: ' + sv.production_start.substring(0, 4) : ''}`.substring(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}/special-versions/${sv.special_version_category?.slug}/${sv.slug}`,
      languages: {
        en: `${siteUrl}/en/special-versions/${sv.special_version_category?.slug}/${sv.slug}`,
        ru: `${siteUrl}/ru/special-versions/${sv.special_version_category?.slug}/${sv.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}/special-versions/${sv.special_version_category?.slug}/${sv.slug}`,
      siteName: 'BimmerBase',
      type: 'website',
      images: [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map(block => {
    if (block.type === 'paragraph') {
      const text = block.children?.map(c => c.text || '').join('');
      return text ? `<p>${text}</p>` : '';
    }
    if (block.type === 'heading') {
      const text = block.children?.map(c => c.text).join('');
      return `<h${block.level || 2}>${text}</h${block.level || 2}>`;
    }
    if (block.type === 'list') {
      const tag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = (block.children || []).map(item => {
        if (item.type === 'list-item') {
          const text = item.children?.map(c => c.text || '').join('');
          return `<li>${text}</li>`;
        }
        return '';
      }).join('');
      return `<${tag}>${items}</${tag}>`;
    }
    return '';
  }).join('');
}

export default async function SpecialVersionPage({ params }) {
  const { category, slug, lang } = await params;

  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('filters[slug][$eq]', slug);
  searchParams.set('filters[special_version_category][slug][$eq]', category);
  searchParams.set('populate[generation][populate][series]', 'true');
  searchParams.set('populate[engine][populate][engine_family]', 'true');
  searchParams.set('populate[articles]', 'true');
  searchParams.set('populate[base_options]', 'true');
  searchParams.set('populate[special_version_category]', 'true');
  searchParams.set('populate[series]', 'true');

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/special-versions?${searchParams.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки' : 'Loading error'}
        </h1>
      </div>
    );
  }
  const data = await res.json();
  const sv = data.data?.[0];

  if (!sv) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href={`/${lang}/special-versions/${category}`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'К категории' : 'Back to category'}
        </a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Версия не найдена' : 'Version not found'}</h1>
      </div>
    );
  }

  const relatedSections = getSpecialVersionSections(sv, lang);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  // Хлебные крошки (без поколения)
  const breadcrumbItems = [
    {
      name: lang === 'ru' ? 'Спецверсии' : 'Special Versions',
      href: `/${lang}/special-versions`,
    },
    sv.special_version_category && {
      name: sv.special_version_category.title,
      href: `/${lang}/special-versions/${sv.special_version_category.slug}`,
    },
    {
      name: sv.title,
    },
  ].filter(Boolean);

  const carSchema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: sv.title,
    brand: { '@type': 'Brand', name: 'BMW' },
    model: sv.generation?.series?.title || sv.title,
    vehicleModelDate: sv.production_start?.substring(0, 4),
    ...(sv.engine && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        name: sv.engine.index,
        engineDisplacement: `${sv.engine.displacement} cc`,
      },
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.href && { item: `${siteUrl}${item.href}` }),
    })),
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Хлебные крошки */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          {breadcrumbItems.map((item, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-2">/</span>}
              {item.href ? (
                <a href={item.href} className="text-blue-700 no-underline hover:underline">
                  {item.name}
                </a>
              ) : (
                <span className="text-gray-700">{item.name}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Шапка страницы */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold">{sv.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                {sv.special_version_category && (
                  <span className="bg-[#0066B1] text-white px-3 py-0.5 rounded-full text-xs font-medium">
                    {sv.special_version_category.title}
                  </span>
                )}
                {sv.production_start && (
                  <span>
                    {sv.production_start.substring(0, 4)}–{sv.production_end?.substring(0, 4)}
                  </span>
                )}
                {sv.production_count && (
                  <span>
                    {sv.production_count} {lang === 'ru' ? 'шт.' : 'units'}
                  </span>
                )}
                {sv.power_hp && <span className="font-semibold">{sv.power_hp} hp</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Контент страницы */}
        <div className="space-y-8">
          {sv.description && (
            <section>
              <h2 className="section-title">{lang === 'ru' ? 'Описание' : 'Description'}</h2>
              <div className="rich-text" dangerouslySetInnerHTML={{ __html: renderRichText(sv.description) }} />
            </section>
          )}

          {sv.differences && (
            <section>
              <h2 className="section-title">{lang === 'ru' ? 'Отличия от базовой модели' : 'Differences from base model'}</h2>
              <div className="rich-text" dangerouslySetInnerHTML={{ __html: renderRichText(sv.differences) }} />
            </section>
          )}

          {sv.base_options && sv.base_options.length > 0 && (
            <section>
              <h2 className="section-title">{lang === 'ru' ? 'Стандартное оснащение' : 'Standard Equipment'}</h2>
              <ul className="space-y-1 text-sm">
                {sv.base_options.map((opt) => (
                  <li key={opt.id} className="flex gap-2">
                    <span className="tag mr-2 font-mono">{opt.sa_code}</span>
                    <span>{opt.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <RelatedLinks sections={relatedSections} lang={lang} />
        </div>
      </div>

      <Script
        id="schema-car-sv"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carSchema) }}
      />
      <Script
        id="schema-breadcrumbs-sv"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}