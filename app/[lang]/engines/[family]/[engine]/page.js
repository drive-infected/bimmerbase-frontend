// app/[lang]/engines/[family]/[engine]/page.js
import RelatedLinks from '@/components/RelatedLinks';
import { getEngineSections } from '@/lib/relatedLinks';
import Script from 'next/script';

export async function generateMetadata({ params }) {
  const { engine, family, lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';

  const metaRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engines?locale=${lang}&filters[slug][$eq]=${engine}&populate=engine_family`,
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
  searchParams.set('populate[articles]', 'true');
  searchParams.set('populate[special_versions]', 'true');
  searchParams.set('populate[engine_versions]', 'true');

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

  // Получаем модификации автомобилей с рынками
  let vehicleModifications = [];
  try {
    const modRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/modifications?filters[engines][documentId][$eq]=${engine.documentId}&populate=generation.series&populate=markets`,
      { cache: 'no-store' }
    );
    const modData = await modRes.json();
    vehicleModifications = modData.data || [];
  } catch (e) {
    console.error('Failed to load modifications', e);
  }

  // Группировка: series -> generation -> modifications
  const seriesMap = new Map();
  vehicleModifications.forEach(mod => {
    if (!mod.generation || !mod.generation.series) return;
    const gen = mod.generation;
    const series = gen.series;
    if (!seriesMap.has(series.slug)) {
      seriesMap.set(series.slug, {
        title: series.title,
        slug: series.slug,
        generations: new Map(),
      });
    }
    const seriesEntry = seriesMap.get(series.slug);
    if (!seriesEntry.generations.has(gen.slug)) {
      seriesEntry.generations.set(gen.slug, {
        title: gen.title,
        slug: gen.slug,
        modifications: [],
      });
    }
    seriesEntry.generations.get(gen.slug).modifications.push(mod);
  });

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

  const versions = engine.engine_versions || [];
  const hasVersions = versions.length > 0;

  // Функция для перевода типа топлива
  const translateFuel = (type) => {
    if (lang === 'ru') {
      if (type === 'Petrol') return 'Бензин';
      if (type === 'Diesel') return 'Дизель';
    }
    return type;
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

        {/* Характеристики и версии */}
        <div className="mt-8">
          <h2 className="section-title">
            {lang === 'ru' ? 'Характеристики и версии' : 'Specifications & Versions'}
          </h2>
          {hasVersions ? (
            <VersionsTable versions={versions} lang={lang} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
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
              {engine.oil_type && <SpecItem label={lang === 'ru' ? 'Масло' : 'Oil'} value={engine.oil_type} />}
              {engine.oil_capacity && <SpecItem label={lang === 'ru' ? 'Объём масла' : 'Oil capacity'} value={`${engine.oil_capacity} L`} />}
              {engine.coolant_type && <SpecItem label={lang === 'ru' ? 'Тип ОЖ' : 'Coolant type'} value={engine.coolant_type} />}
              {engine.coolant_capacity && <SpecItem label={lang === 'ru' ? 'Объём ОЖ' : 'Coolant capacity'} value={`${engine.coolant_capacity} L`} />}
            </div>
          )}
        </div>

        {/* Применяемость */}
        {seriesMap.size > 0 && (
          <div className="mt-10">
            <h2 className="section-title">{lang === 'ru' ? 'Применяемость' : 'Applications'}</h2>
            <div className="space-y-8">
              {Array.from(seriesMap.values()).map(series => (
                <div key={series.slug}>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    <a href={`/${lang}/models/${series.slug}`} className="text-blue-700 hover:underline">
                      {series.title}
                    </a>
                  </h3>
                  {Array.from(series.generations.values()).map(gen => (
                    <div key={gen.slug} className="ml-4 mb-4">
                      <h4 className="text-lg font-medium text-gray-700 mb-2">
                        <a href={`/${lang}/models/${series.slug}/${gen.slug}`} className="text-blue-600 hover:underline">
                          {gen.title}
                        </a>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                        {gen.modifications.map(mod => (
                          <div key={mod.id} className="card !p-3 flex flex-col">
                            <span className="font-semibold text-sm">{mod.title}</span>
                            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                              {mod.power_hp && <div>{mod.power_hp} hp • {mod.torque_nm} Nm</div>}
                              {mod.displacement && <div>{mod.displacement} cc</div>}
                              {mod.fuel_type && <div>{translateFuel(mod.fuel_type)}</div>}
                              {mod.markets && mod.markets.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {mod.markets.map(market => (
                                    <span key={market.id} className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                      {market.title}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

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

function VersionsTable({ versions, lang }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Версия' : 'Version'}</th>
            <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Мощность' : 'Power'}</th>
            <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Крутящий момент' : 'Torque'}</th>
            <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Макс. обороты' : 'Max RPM'}</th>
            <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Впрыск' : 'Injection'}</th>
            <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Наддув' : 'Aspiration'}</th>
            <th className="text-left p-3 font-medium text-gray-600">VVT</th>
            <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Масло' : 'Oil'}</th>
            <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Период' : 'Period'}</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {versions.map(ver => (
            <tr key={ver.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
              <td className="p-3 text-gray-700">{ver.slug || `${ver.engine?.index || ''} ${ver.power_hp}hp`}</td>
              <td className="p-3 text-gray-700">{ver.power_hp} hp</td>
              <td className="p-3 text-gray-700">{ver.torque_nm} Nm</td>
              <td className="p-3 text-gray-700">{ver.max_rpm || '—'}</td>
              <td className="p-3 text-gray-700">{ver.injection || '—'}</td>
              <td className="p-3 text-gray-700">{ver.aspiration || '—'}</td>
              <td className="p-3 text-gray-700">{ver.vvt || '—'}</td>
              <td className="p-3 text-gray-700">{ver.oil_type && `${ver.oil_type} (${ver.oil_capacity} L)`}</td>
              <td className="p-3 text-gray-700">{ver.production_start && `${ver.production_start.substring(0,4)}–${ver.production_end?.substring(0,4)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
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