// app/[lang]/engines/[family]/[engine]/page.js
import RelatedLinks from '@/components/RelatedLinks';
import { getEngineSections } from '@/lib/relatedLinks';
import Script from 'next/script';

export async function generateMetadata({ params }) {
  const { engine, family, lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  const metaRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engines?locale=${lang}&filters[slug][$eq]=${engine}&populate=engine_family&populate[generations][fields]=title`,
    { cache: 'no-store' }
  );
  const metaData = await metaRes.json();
  const eng = metaData.data?.[0];

  if (!eng) {
    return { title: lang === 'ru' ? 'Двигатель не найден – BimmerBase' : 'Engine not found – BimmerBase' };
  }

  const title = `${lang === 'ru' ? 'Двигатель' : 'Engine'} ${eng.index} – ${eng.engine_family?.code || ''} – BimmerBase`;
  const description = `${eng.index} (${eng.engine_family?.code || ''}) – ${eng.displacement} cc, ${eng.power_hp} hp, ${eng.torque_nm} Nm. ${lang === 'ru' ? 'Характеристики, обслуживание, применяемость.' : 'Specifications, maintenance, applications.'}`.substring(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}/engines/${eng.engine_family?.slug}/${eng.slug}`,
      languages: {
        en: `${siteUrl}/en/engines/${eng.engine_family?.slug}/${eng.slug}`,
        ru: `${siteUrl}/ru/engines/${eng.engine_family?.slug}/${eng.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}/engines/${eng.engine_family?.slug}/${eng.slug}`,
      siteName: 'BimmerBase',
      type: 'website',
      images: [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

export default async function EnginePage({ params }) {
  const { engine: engineSlug, family: familySlug, lang } = await params;

  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('filters[slug][$eq]', engineSlug);
  searchParams.set('populate[engine_family]', 'true');
  searchParams.set('populate[generations][populate][series]', 'true');
  searchParams.set('populate[articles]', 'true');
  searchParams.set('populate[special_versions]', 'true');

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/engines?${searchParams.toString()}`;

  let engine;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    engine = data.data?.[0];
  } catch (err) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки данных' : 'Data loading error'}
        </h1>
        <p className="mt-2 text-gray-700">{err.message}</p>
      </div>
    );
  }

  if (!engine) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/${lang}/engines/${familySlug}`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'К семейству' : 'Back to family'}
        </a>
        <h1 className="text-2xl font-bold mt-4">
          {lang === 'ru' ? 'Двигатель не найден' : 'Engine not found'}
        </h1>
      </div>
    );
  }

  const family = engine.engine_family;
  const relatedSections = getEngineSections(engine, lang);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  const engineSchema = {
    '@context': 'https://schema.org',
    '@type': 'EngineSpecification',
    name: engine.index,
    engineDisplacement: `${engine.displacement} cc`,
    enginePower: `${engine.power_hp} hp`,
    torque: `${engine.torque_nm} Nm`,
    fuelType: engine.fuel_type,
    manufacturer: { '@type': 'Brand', name: 'BMW' },
    ...(family && { model: family.code }),
  };

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
      family && {
        '@type': 'ListItem',
        position: 2,
        name: family.code,
        item: `${siteUrl}/${lang}/engines/${family.slug}`,
      },
      {
        '@type': 'ListItem',
        position: family ? 3 : 2,
        name: engine.index,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <a href={`/${lang}/engines`} className="text-blue-700 no-underline hover:underline">
            {lang === 'ru' ? 'Двигатели' : 'Engines'}
          </a>
          {family && (
            <>
              <span className="mx-2">/</span>
              <a href={`/${lang}/engines/${family.slug}`} className="text-blue-700 no-underline hover:underline">
                {family.code}
              </a>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-700">{engine.index}</span>
        </nav>

        <h1 className="text-4xl font-bold mt-2">
          {lang === 'ru' ? 'Двигатель' : 'Engine'}{' '}
          <span className="text-[#0066B1]">{engine.index}</span>
        </h1>
        {family && (
          <p className="text-gray-600 mt-2 text-lg">
            {lang === 'ru' ? 'Семейство' : 'Family'}: {family.code} • {family.cylinders} cyl
          </p>
        )}

        <SpecsSection engine={engine} lang={lang} />
        <MaintenanceSection engine={engine} lang={lang} />
        <RelatedLinks sections={relatedSections} lang={lang} />
      </div>

      <Script
        id="schema-engine"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(engineSchema) }}
      />
      <Script
        id="schema-breadcrumbs-engine"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

// --- Вспомогательные компоненты (оставлены без изменений) ---

function SpecsSection({ engine, lang }) {
  return (
    <div className="mt-8">
      <h2 className="section-title">{lang === 'ru' ? 'Характеристики' : 'Specifications'}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {engine.power_hp && <SpecItem label={lang === 'ru' ? 'Мощность' : 'Power'} value={`${engine.power_hp} hp`} />}
        {engine.torque_nm && <SpecItem label={lang === 'ru' ? 'Крутящий момент' : 'Torque'} value={`${engine.torque_nm} Nm`} />}
        {engine.displacement && <SpecItem label={lang === 'ru' ? 'Объём' : 'Displacement'} value={`${engine.displacement} cc`} />}
        {engine.bore_stroke && <SpecItem label={lang === 'ru' ? 'Диаметр × Ход' : 'Bore × Stroke'} value={engine.bore_stroke} />}
        {engine.compression_ratio && <SpecItem label={lang === 'ru' ? 'Степень сжатия' : 'Compression'} value={engine.compression_ratio} />}
        {engine.valves_per_cylinder && <SpecItem label={lang === 'ru' ? 'Клапанов' : 'Valves'} value={engine.valves_per_cylinder} />}
        {engine.max_rpm && <SpecItem label={lang === 'ru' ? 'Макс. обороты' : 'Max RPM'} value={`${engine.max_rpm} rpm`} />}
        {engine.timing_drive && (
          <SpecItem
            label={lang === 'ru' ? 'ГРМ' : 'Timing'}
            value={engine.timing_drive === 'Chain' ? (lang === 'ru' ? 'Цепь' : 'Chain') : (lang === 'ru' ? 'Ремень' : 'Belt')}
          />
        )}
        {engine.vvt && <SpecItem label={lang === 'ru' ? 'Фазорегуляторы' : 'VVT'} value={engine.vvt} />}
        {engine.injection && <SpecItem label={lang === 'ru' ? 'Впрыск' : 'Injection'} value={engine.injection} />}
        {engine.ecu && <SpecItem label="ECU" value={engine.ecu} />}
      </div>
    </div>
  );
}

function MaintenanceSection({ engine, lang }) {
  if (!engine.oil_type && !engine.oil_capacity && !engine.coolant_type && !engine.coolant_capacity) return null;
  return (
    <div className="mt-10">
      <h2 className="section-title">{lang === 'ru' ? 'Обслуживание' : 'Maintenance'}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {engine.oil_type && <SpecItem label={lang === 'ru' ? 'Масло' : 'Oil'} value={engine.oil_type} />}
        {engine.oil_capacity && <SpecItem label={lang === 'ru' ? 'Объём масла' : 'Oil capacity'} value={`${engine.oil_capacity} L`} />}
        {engine.coolant_type && <SpecItem label={lang === 'ru' ? 'Тип ОЖ' : 'Coolant type'} value={engine.coolant_type} />}
        {engine.coolant_capacity && <SpecItem label={lang === 'ru' ? 'Объём ОЖ' : 'Coolant capacity'} value={`${engine.coolant_capacity} L`} />}
      </div>
    </div>
  );
}

function SpecItem({ label, value }) {
  return (
    <div className="card !p-3">
      <span className="text-xs text-gray-500">{label}</span>
      <br />
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}