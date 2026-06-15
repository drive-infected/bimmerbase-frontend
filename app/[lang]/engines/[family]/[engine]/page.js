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

  // 1. Загружаем двигатель с engine_family, статьями и базовыми поколениями
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

  // 2. Загружаем поколения с их series для правильных ссылок
  let generationsWithSeries = [];
  if (engine.generations?.length) {
    const genIds = engine.generations.map(g => g.documentId).filter(Boolean);
    if (genIds.length) {
      try {
        const genRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/generations?locale=${lang}&filters[documentId][$in]=${genIds.join(',')}&populate=series`,
          { cache: 'no-store' }
        );
        const genData = await genRes.json();
        generationsWithSeries = genData.data || [];
      } catch {
        // если не загрузились, остаётся пустой массив
      }
    }
  }

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

      {/* Применяемость */}
      {generationsWithSeries.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Применяемость' : 'Applications'}</h2>
          <div className="flex flex-wrap gap-3">
            {generationsWithSeries.map((gen) => (
              <a
                key={gen.documentId}
                href={`/${lang}/models/${gen.series?.slug || ''}/${gen.slug}`}
                className="card-link !p-3"
              >
                <span className="card-title !mb-0">{gen.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Статьи */}
      {filteredArticles.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Статьи' : 'Articles'}</h2>
          <div className="flex flex-col gap-3">
            {filteredArticles.map((article) => (
              <a key={article.documentId} href={`/${lang}/articles/${article.slug}`} className="card-link">
                <span className="card-title">{article.title}</span>
                {article.intro && <p className="card-text">{article.intro}</p>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Вспомогательные компоненты для чистоты основного компонента
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