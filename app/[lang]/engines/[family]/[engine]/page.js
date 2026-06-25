// app/[lang]/engines/[family]/[engine]/page.js
// Страница двигателя с группировкой модификаций по поколениям

function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map((block) => {
    if (block.type === 'paragraph') {
      const text = block.children?.map((c) => { let t = c.text || ''; if (c.bold) t = `<strong>${t}</strong>`; if (c.italic) t = `<em>${t}</em>`; return t; }).join('');
      return text ? `<p>${text}</p>` : '';
    }
    if (block.type === 'heading') { const text = block.children?.map((c) => c.text).join(''); return `<h${block.level || 2}>${text}</h${block.level || 2}>`; }
    if (block.type === 'list') { const tag = block.format === 'ordered' ? 'ol' : 'ul'; const items = renderListItems(block.children); return `<${tag}>${items}</${tag}>`; }
    return '';
  }).join('');
}

function renderListItems(children) {
  if (!children || !Array.isArray(children)) return '';
  return children.map((child) => {
    if (child.type === 'list-item') { const text = child.children?.filter((c) => c.type === 'text')?.map((c) => c.text || '').join('') || ''; return `<li>${text}</li>`; }
    if (child.type === 'list') { const tag = child.format === 'ordered' ? 'ol' : 'ul'; return `<${tag}>${renderListItems(child.children)}</${tag}>`; }
    return '';
  }).join('');
}

function translate(val, map) {
  return map[val] || val;
}

export default async function EnginePage({ params }) {
  const { engine: engineSlug, family: familySlug, lang } = await params;

  // 1. Двигатель со всеми связями
  let engine;
  try {
    const engineRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/engines?locale=${lang}&filters[slug][$eq]=${engineSlug}&populate=*`,
      { cache: 'no-store' }
    );
    const engineData = await engineRes.json();
    engine = engineData.data?.[0];
  } catch {
    return <ErrorMessage lang={lang} familySlug={familySlug} />;
  }

  if (!engine) {
    return <ErrorMessage lang={lang} familySlug={familySlug} />;
  }

  // 2. Модификации, сгруппированные по поколениям
  let modifications = [];
  try {
    const modRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/modifications?filters[engines][slug][$eq]=${engineSlug}&populate=generation`,
      { cache: 'no-store' }
    );
    const modData = await modRes.json();
    modifications = modData.data || [];
  } catch (e) {
    console.error('Failed to fetch modifications', e);
  }

  const groupedByGeneration = {};
  modifications.forEach(mod => {
    const gen = mod.generation;
    if (!gen) return;
    const key = gen.slug;
    if (!groupedByGeneration[key]) {
      groupedByGeneration[key] = {
        generation: gen,
        modifications: [],
      };
    }
    groupedByGeneration[key].modifications.push(mod);
  });

  const family = engine.engine_family;
  const filteredArticles = (engine.articles || []).filter(a => a.locale === lang);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500 mb-4">
        <a href={`/${lang}/engines`} className="text-blue-700 no-underline hover:underline">
          {lang === 'ru' ? 'Двигатели' : 'Engines'}
        </a>
        {familySlug && (
          <>
            <span className="mx-2">/</span>
            <a href={`/${lang}/engines/${familySlug}`} className="text-blue-700 no-underline hover:underline">
              {family?.code || familySlug}
            </a>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{engine.index}</span>
      </nav>

      <h1 className="text-4xl font-bold mt-2">{lang === 'ru' ? 'Двигатель' : 'Engine'} {engine.index}</h1>
      {family && (
        <p className="text-gray-600 mt-2 text-lg">
          {lang === 'ru' ? 'Семейство' : 'Family'}: {family.code} • {family.cylinders} cyl
        </p>
      )}

      {/* Характеристики */}
      <SpecsSection engine={engine} lang={lang} />

      {/* Обслуживание */}
      <MaintenanceSection engine={engine} lang={lang} />

      {/* Модификации по поколениям */}
      {Object.keys(groupedByGeneration).length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Модификации' : 'Modifications'}</h2>
          {Object.values(groupedByGeneration).map(({ generation, modifications }) => (
            <div key={generation.slug} className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                <a
                  href={`/${lang}/models/${generation.series?.slug || ''}/${generation.slug}`}
                  className="text-blue-700 no-underline hover:underline"
                >
                  {generation.title}
                </a>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modifications.map(mod => (
                  <div key={mod.id} className="card">
                    <div className="flex justify-between items-start gap-2">
                      <span className="card-title !mb-0">{mod.title}</span>
                      {mod.lci && (
                        <span className={`card-badge ${mod.lci === 'LCI' ? 'card-badge-green' : 'card-badge-gray'}`}>
                          {mod.lci === 'LCI' ? 'LCI' : 'Pre-LCI'}
                        </span>
                      )}
                    </div>
                    <div className="card-text mt-2 space-y-1">
                      <div>{mod.power_hp} hp • {mod.torque_nm} Nm</div>
                      <div>{mod.displacement} cc</div>
                      {mod.max_speed && <div>{lang === 'ru' ? 'Макс. скорость' : 'Max speed'}: {mod.max_speed} km/h</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Статьи */}
      {filteredArticles.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Статьи' : 'Articles'}</h2>
          <div className="flex flex-col gap-3">
            {filteredArticles.map((article) => (
              <a key={article.id} href={`/${lang}/articles/${article.slug}`} className="card-link">
                <span className="card-title">{article.title}</span>
                {article.intro && <p className="card-text mt-1">{article.intro}</p>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
        {engine.timing_drive && <SpecItem label={lang === 'ru' ? 'ГРМ' : 'Timing'} value={translate(engine.timing_drive, { Chain: lang === 'ru' ? 'Цепь' : 'Chain', Belt: lang === 'ru' ? 'Ремень' : 'Belt' })} />}
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

function ErrorMessage({ lang, familySlug }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <a href={`/${lang}/engines/${familySlug}`} className="text-blue-700 no-underline">
        ← {lang === 'ru' ? 'К семейству' : 'Back to family'}
      </a>
      <h1 className="text-2xl font-bold mt-4">{lang === 'ru' ? 'Двигатель не найден' : 'Engine not found'}</h1>
    </div>
  );
}