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

export default async function OptionPage({ params }) {
  const { slug, lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/options?locale=${lang}&filters[slug][$eq]=${slug}&populate=*`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const opt = data.data?.[0];

  if (!opt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href={`/${lang}/options`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Каталог опций' : 'Options Catalog'}</a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Опция не найдена' : 'Option not found'}</h1>
      </div>
    );
  }

  const retrofitLabel = {
    Easy: lang === 'ru' ? 'Да, легко' : 'Yes, easy',
    Hard: lang === 'ru' ? 'Да, сложно' : 'Yes, hard',
    Possible: lang === 'ru' ? 'Возможно с заменой блока' : 'Possible with module replacement',
    No: lang === 'ru' ? 'Нет' : 'No',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <a href={`/${lang}/options`} className="text-blue-700 no-underline">
        ← {lang === 'ru' ? 'Каталог опций' : 'Options Catalog'}
      </a>

      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <span className="tag text-lg">{opt.sa_code}</span>
        <span className="text-sm text-gray-500">{opt.option_type}</span>
      </div>

      <h1 className="text-3xl font-bold mt-3">{opt.title}</h1>

      {opt.option_category && (
        <p className="text-gray-500 mt-1">{opt.option_category.title}</p>
      )}

      {opt.description && (
        <div className="mt-6 rich-text">
          <div dangerouslySetInnerHTML={{ __html: renderRichText(opt.description) }} />
        </div>
      )}

      {opt.retrofit_difficulty && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <strong>{lang === 'ru' ? 'Возможность ретрофита' : 'Retrofit possibility'}:</strong>{' '}
          {retrofitLabel[opt.retrofit_difficulty] || opt.retrofit_difficulty}
        </div>
      )}

      {opt.series && opt.series.length > 0 && (
        <div className="mt-8">
          <h2 className="section-title">{lang === 'ru' ? 'Применяемость' : 'Applications'}</h2>
          <div className="flex flex-wrap gap-2">
            {opt.series.map((s) => (
              <a key={s.id} href={`/${lang}/series/${s.slug}`} className="card-link !p-3 text-blue-700">{s.title}</a>
            ))}
          </div>
        </div>
      )}

      {opt.articles && opt.articles.length > 0 && (
        <div className="mt-8">
          <h2 className="section-title">{lang === 'ru' ? 'Статьи' : 'Articles'}</h2>
          <div className="flex flex-col gap-2">
            {opt.articles.map((article) => (
              <a key={article.id} href={`/${lang}/articles/${article.slug}`} className="card-link !p-4">
                <strong>{article.title}</strong>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}