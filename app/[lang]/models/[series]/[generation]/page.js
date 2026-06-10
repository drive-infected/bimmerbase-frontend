function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  const html = blocks.map((block) => {
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
  return html;
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
      const items = renderListItems(child.children);
      return `<${tag}>${items}</${tag}>`;
    }
    return '';
  }).join('');
}

function translateFuelType(type, lang) {
  if (lang === 'ru') {
    if (type === 'Petrol') return 'Бензин';
    if (type === 'Diesel') return 'Дизель';
  }
  return type;
}

export default async function GenerationPage({ params }) {
  const { series, generation, lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/generations?locale=${lang}&filters[slug][$eq]=${generation}&populate=*`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const gen = data.data?.[0];

  if (!gen) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/${lang}/models`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}</a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Поколение не найдено' : 'Generation not found'}</h1>
      </div>
    );
  }

  const startYear = gen.production_start ? String(gen.production_start).substring(0, 4) : '...';
  const endYear = gen.production_end ? String(gen.production_end).substring(0, 4) : '...';
  const parentSeries = gen.series;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <a href={`/${lang}/models`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}</a>
      {parentSeries && (
        <span className="text-gray-400 mx-2">/</span>
      )}
      {parentSeries && (
        <a href={`/${lang}/models/${parentSeries.slug}`} className="text-blue-700 no-underline">{parentSeries.title}</a>
      )}

      <h1 className="text-4xl font-bold mt-4">BMW {gen.title}</h1>
      <p className="text-gray-600 mt-2 text-lg">
        {lang === 'ru' ? 'Годы выпуска' : 'Production years'}: {startYear}–{endYear}
      </p>

      {/* Описание */}
      {gen.description && (
        <div className="mt-8 rich-text">
          <h2 className="section-title">{lang === 'ru' ? 'Обзор' : 'Overview'}</h2>
          <div dangerouslySetInnerHTML={{ __html: renderRichText(gen.description) }} />
        </div>
      )}
      
      {/* LCI (рестайлинг) */}
      {gen.lci_info && (
        <div className="mt-8 rich-text">
          <h2 className="section-title">LCI</h2>
          <div dangerouslySetInnerHTML={{ __html: renderRichText(gen.lci_info) }} />
        </div>
      )}

            {/* Двигатели */}
      {gen.engines && gen.engines.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Двигатели' : 'Engines'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gen.engines.map((engine) => (
              <a key={engine.id} href={`/${lang}/engines/${engine.slug}`} className="card-link">
                <strong className="text-lg block">{engine.index}</strong>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <div>{engine.power_hp} hp • {engine.torque_nm} Nm</div>
                  <div>{engine.displacement} cc</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

            {/* Модификации */}
      {gen.modifications && gen.modifications.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Модификации' : 'Modifications'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gen.modifications.map((mod) => (
              <div key={mod.id} className="card">
                <div className="flex justify-between items-start gap-2">
                  <strong className="text-lg">{mod.title}</strong>
                  {mod.lci && (
                    <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${mod.lci === 'lci' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {mod.lci === 'lci' ? 'LCI' : 'Pre-LCI'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <div>{translateFuelType(mod.fuel_type, lang)} • {mod.displacement} cc</div>
                  {mod.acceleration_0_100 && <div>0–100: {mod.acceleration_0_100} s</div>}
                  {mod.max_speed && <div>{lang === 'ru' ? 'Макс. скорость' : 'Max speed'}: {mod.max_speed} km/h</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Статьи */}
      {gen.articles && gen.articles.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Статьи' : 'Articles'}</h2>
          <div className="flex flex-col gap-3">
            {gen.articles.map((article) => (
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