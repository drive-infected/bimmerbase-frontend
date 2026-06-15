export default async function EngineFamilyPage({ params }) {
  const { family, lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engine-families?locale=${lang}&filters[slug][$eq]=${family}&populate=*`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const fam = data.data?.[0];

  if (!fam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href={`/${lang}/engines`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Двигатели' : 'Engines'}</a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Семейство не найдено' : 'Family not found'}</h1>
      </div>
    );
  }

  const engines = (fam.engines || []).sort((a, b) => {
    if (a.displacement !== b.displacement) return (a.displacement || 0) - (b.displacement || 0);
    return (a.index || '').localeCompare(b.index || '');
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <a href={`/${lang}/engines`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Двигатели' : 'Engines'}</a>

      <h1 className="text-4xl font-bold mt-4">{fam.code}</h1>
      <div className="flex flex-wrap gap-2 mt-3 text-sm text-gray-500">
        <span>{fam.production_start?.substring(0, 4)}–{fam.production_end?.substring(0, 4)}</span>
        <span>•</span>
        <span>{fam.cylinders} cyl</span>
        <span>•</span>
        <span>{fam.layout === 'Longitudinal' ? (lang === 'ru' ? 'Продольное' : 'Longitudinal') : (lang === 'ru' ? 'Поперечное' : 'Transverse')}</span>
        <span>•</span>
        <span>{fam.head_material} / {fam.block_material}</span>
      </div>

      {fam.description && (
        <div className="mt-6 rich-text">
          <div dangerouslySetInnerHTML={{ __html: renderRichText(fam.description) }} />
        </div>
      )}

      {fam.features && (
        <div className="mt-6 rich-text">
          <h2 className="section-title">{lang === 'ru' ? 'Особенности' : 'Features'}</h2>
          <div dangerouslySetInnerHTML={{ __html: renderRichText(fam.features) }} />
        </div>
      )}

      {engines.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Двигатели' : 'Engines'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {engines.map((engine) => (
              <a key={engine.id} href={`/${lang}/engines/${fam.slug}/${engine.slug}`} className="card-link">
                <span className="card-title">{engine.index}</span>
                <div className="card-text mt-2 space-y-1">
                  <div>{engine.power_hp} hp • {engine.torque_nm} Nm</div>
                  <div>{engine.displacement} cc</div>
                  {engine.vvt && engine.vvt !== 'None' && <div>{engine.vvt}</div>}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map((block) => {
    if (block.type === 'paragraph') {
      const text = block.children?.map((c) => { let t = c.text || ''; if (c.bold) t = `<strong>${t}</strong>`; if (c.italic) t = `<em>${t}</em>`; return t; }).join('');
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
  }).join('');
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
      return `<${tag}>${renderListItems(child.children)}</${tag}>`;
    }
    return '';
  }).join('');
}