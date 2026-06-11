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
  const { slug, lang } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/engines?locale=${lang}&filters[slug][$eq]=${slug}&populate=*`, { cache: 'no-store' });
  const data = await res.json();
  const engine = data.data?.[0];

  if (!engine) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href={`/${lang}/engines`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'К списку двигателей' : 'Back to engines'}</a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Двигатель не найден' : 'Engine not found'}</h1>
      </div>
    );
  }

  const family = engine.engine_family;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <a href={`/${lang}/engines`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'К списку двигателей' : 'Back to engines'}</a>
      <h1 className="text-4xl font-bold mt-4">{lang === 'ru' ? 'Двигатель' : 'Engine'} {engine.index}</h1>
      {family && <p className="text-gray-600 mt-2 text-lg">{lang === 'ru' ? 'Семейство' : 'Family'}: {family.code} • {family.cylinders} cyl</p>}

      {/* Характеристики */}
      <div className="mt-8"><h2 className="section-title">{lang === 'ru' ? 'Характеристики' : 'Specifications'}</h2>
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

      {/* Обслуживание */}
      {(engine.oil_type || engine.oil_capacity || engine.coolant_type || engine.coolant_capacity) && (
        <div className="mt-10"><h2 className="section-title">{lang === 'ru' ? 'Обслуживание' : 'Maintenance'}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {engine.oil_type && <SpecItem label={lang === 'ru' ? 'Масло' : 'Oil'} value={engine.oil_type} />}
            {engine.oil_capacity && <SpecItem label={lang === 'ru' ? 'Объём масла' : 'Oil capacity'} value={`${engine.oil_capacity} L`} />}
            {engine.coolant_type && <SpecItem label={lang === 'ru' ? 'Тип ОЖ' : 'Coolant type'} value={engine.coolant_type} />}
            {engine.coolant_capacity && <SpecItem label={lang === 'ru' ? 'Объём ОЖ' : 'Coolant capacity'} value={`${engine.coolant_capacity} L`} />}
          </div>
        </div>
      )}

      {/* Применяемость */}
      {engine.generations && engine.generations.length > 0 && (
        <div className="mt-10"><h2 className="section-title">{lang === 'ru' ? 'Применяемость' : 'Applications'}</h2>
          <div className="flex flex-wrap gap-3">
            {engine.generations.map((g) => (
              <a key={g.id} href={`/${lang}/models/${g.series?.slug || 'bmw'}/${g.slug}`} className="card-link !p-3 text-blue-700">
                {g.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Статьи */}
      {engine.articles && engine.articles.length > 0 && (
        <div className="mt-10"><h2 className="section-title">{lang === 'ru' ? 'Статьи' : 'Articles'}</h2>
          <div className="flex flex-col gap-3">
            {engine.articles.map((article) => (
              <a key={article.id} href={`/${lang}/articles/${article.slug}`} className="card-link !p-4">
                <strong>{article.title}</strong>
                {article.intro && <p className="text-sm text-gray-600 mt-1">{article.intro}</p>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SpecItem({ label, value }) {
  return <div className="bg-gray-50 rounded-lg p-3"><span className="text-xs text-gray-500">{label}</span><br /><span className="font-semibold text-sm">{value}</span></div>;
}