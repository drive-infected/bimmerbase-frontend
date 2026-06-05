function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map((block) => {
    if (block.type === 'paragraph') {
      const text = block.children?.map((c) => c.text || '').join('');
      return text ? `<p>${text}</p>` : '';
    }
    if (block.type === 'heading') {
      const text = block.children?.map((c) => c.text).join('');
      return `<h${block.level || 2}>${text}</h${block.level || 2}>`;
    }
    if (block.type === 'list') {
      const tag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = (block.children || []).map((item) => {
        if (item.type === 'list-item') {
          const text = item.children?.map((c) => c.text || '').join('');
          return `<li>${text}</li>`;
        }
        return '';
      }).join('');
      return `<${tag}>${items}</${tag}>`;
    }
    return '';
  }).join('');
}

export default async function SeriesPage({ params }) {
  const { series, lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/series?locale=${lang}&filters[slug][$eq]=${series}&populate=*`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const serie = data.data?.[0];

  if (!serie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href={`/${lang}/models`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}</a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Серия не найдена' : 'Series not found'}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <a href={`/${lang}/models`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}</a>

      <h1 className="text-4xl font-bold mt-4">{serie.title}</h1>

      {serie.description && (
        <div className="mt-6 rich-text text-gray-700">
          <div dangerouslySetInnerHTML={{ __html: renderRichText(serie.description) }} />
        </div>
      )}

      {serie.generations && serie.generations.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Поколения' : 'Generations'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serie.generations
  .filter((gen) => gen.locale === lang)
  .map((gen) => (
              <a
                key={gen.id}
                href={`/${lang}/models/${serie.slug}/${gen.slug}`}
                className="card-link"
              >
                <strong className="text-xl block">{gen.title}</strong>
                <p className="text-sm text-gray-500 mt-2">
                  {gen.production_start?.substring(0, 4)}–{gen.production_end?.substring(0, 4)}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}