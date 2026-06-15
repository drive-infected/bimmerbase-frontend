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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engines?locale=${lang}&filters[slug][$eq]=${engineSlug}&populate=generations.series,articles,engine_family`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const engineData = data.data?.[0];

  if (!engineData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/${lang}/engines/${familySlug}`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'К семейству' : 'Back to family'}
        </a>
        <h1 className="text-2xl font-bold mt-4">{lang === 'ru' ? 'Двигатель не найден' : 'Engine not found'}</h1>
      </div>
    );
  }

  const familyData = engineData.engine_family;

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
              {familyData?.code || familySlug}
            </a>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{engineData.index}</span>
      </nav>

      <h1 className="text-4xl font-bold mt-2">{lang === 'ru' ? 'Двигатель' : 'Engine'} {engineData.index}</h1>
      {familyData && (
        <p className="text-gray-600 mt-2 text-lg">
          {lang === 'ru' ? 'Семейство' : 'Family'}: {familyData.code} • {familyData.cylinders} cyl
        </p>
      )}

      {/* Характеристики */}
      <div className="mt-8">
        <h2 className="section-title">{lang === 'ru' ? 'Характеристики' : 'Specifications'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {engineData.power_hp && <SpecItem label={lang === 'ru' ? 'Мощность' : 'Power'} value={`${engineData.power_hp} hp`} />}
          {engineData.torque_nm && <SpecItem label={lang === 'ru' ? 'Крутящий момент' : 'Torque'} value={`${engineData.torque_nm} Nm`} />}
          {engineData.displacement && <SpecItem label={lang === 'ru' ? 'Объём' : 'Displacement'} value={`${engineData.displacement} cc`} />}
          {engineData.bore_stroke && <SpecItem label={lang === 'ru' ? 'Диаметр × Ход' : 'Bore × Stroke'} value={engineData.bore_stroke} />}
          {engineData.compression_ratio && <SpecItem label={lang === 'ru' ? 'Степень сжатия' : 'Compression'} value={engineData.compression_ratio} />}
          {engineData.valves_per_cylinder && <SpecItem label={lang === 'ru' ? 'Клапанов' : 'Valves'} value={engineData.valves_per_cylinder} />}
          {engineData.max_rpm && <SpecItem label={lang === 'ru' ? 'Макс. обороты' : 'Max RPM'} value={`${engineData.max_rpm} rpm`} />}
          {engineData.timing_drive && <SpecItem label={lang === 'ru' ? 'ГРМ' : 'Timing'} value={translate(engineData.timing_drive, { Chain: lang === 'ru' ? 'Цепь' : 'Chain', Belt: lang === 'ru' ? 'Ремень' : 'Belt' })} />}
          {engineData.vvt && <SpecItem label={lang === 'ru' ? 'Фазорегуляторы' : 'VVT'} value={engineData.vvt} />}
          {engineData.injection && <SpecItem label={lang === 'ru' ? 'Впрыск' : 'Injection'} value={engineData.injection} />}
          {engineData.ecu && <SpecItem label="ECU" value={engineData.ecu} />}
        </div>
      </div>

      {/* Обслуживание */}
      {(engineData.oil_type || engineData.oil_capacity || engineData.coolant_type || engineData.coolant_capacity) && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Обслуживание' : 'Maintenance'}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {engineData.oil_type && <SpecItem label={lang === 'ru' ? 'Масло' : 'Oil'} value={engineData.oil_type} />}
            {engineData.oil_capacity && <SpecItem label={lang === 'ru' ? 'Объём масла' : 'Oil capacity'} value={`${engineData.oil_capacity} L`} />}
            {engineData.coolant_type && <SpecItem label={lang === 'ru' ? 'Тип ОЖ' : 'Coolant type'} value={engineData.coolant_type} />}
            {engineData.coolant_capacity && <SpecItem label={lang === 'ru' ? 'Объём ОЖ' : 'Coolant capacity'} value={`${engineData.coolant_capacity} L`} />}
          </div>
        </div>
      )}

      {/* Применяемость */}
      {engineData.generations?.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Применяемость' : 'Applications'}</h2>
          <div className="flex flex-wrap gap-3">
            {engineData.generations.map((g) => (
              <a
                key={g.id}
                href={`/${lang}/models/${g.series?.slug || ''}/${g.slug}`}
                className="card-link !p-3"
              >
                <span className="card-title !mb-0">{g.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Статьи */}
      {engineData.articles?.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Статьи' : 'Articles'}</h2>
          <div className="flex flex-col gap-3">
            {engineData.articles.map((article) => (
              <a key={article.id} href={`/${lang}/articles/${article.slug}`} className="card-link">
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

function SpecItem({ label, value }) {
  return (
    <div className="card !p-3">
      <span className="text-xs text-gray-500">{label}</span>
      <br />
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}