function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  const html = blocks.map((block) => {
    if (block.type === 'paragraph') { const text = block.children?.map((c) => { let t = c.text || ''; if (c.bold) t = `<strong>${t}</strong>`; if (c.italic) t = `<em>${t}</em>`; return t; }).join(''); return text ? `<p>${text}</p>` : ''; }
    if (block.type === 'heading') { const text = block.children?.map((c) => c.text).join(''); return `<h${block.level || 2}>${text}</h${block.level || 2}>`; }
    if (block.type === 'list') { const tag = block.format === 'ordered' ? 'ol' : 'ul'; return `<${tag}>${renderListItems(block.children)}</${tag}>`; }
    return '';
  }).join('');
  return html;
}

function renderListItems(children) {
  if (!children || !Array.isArray(children)) return '';
  return children.map((child) => {
    if (child.type === 'list-item') { const text = child.children?.filter((c) => c.type === 'text')?.map((c) => c.text || '').join('') || ''; return `<li>${text}</li>`; }
    if (child.type === 'list') { const tag = child.format === 'ordered' ? 'ol' : 'ul'; return `<${tag}>${renderListItems(child.children)}</${tag}>`; }
    return '';
  }).join('');
}

export default async function ArticlePage({ params }) {
  const { slug, lang } = await params;
  const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/articles?locale=${lang}&filters[slug][$eq]=${slug}&populate[generations][populate][series]=*&populate[engines][populate][engine_family]=*`,
  { cache: 'no-store' }
);
  const data = await res.json();
  const article = data.data?.[0];

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href={`/${lang}/articles`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}</a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Статья не найдена' : 'Article not found'}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <a href={`/${lang}/articles`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}</a>
      <h1 className="text-3xl font-bold mt-4 leading-tight">{article.title}</h1>
      <div className="flex gap-4 mt-3 text-sm text-gray-500">
        {article.published_date && <span>{lang === 'ru' ? 'Опубликовано' : 'Published'}: {article.published_date}</span>}
        {article.difficulty && <span>{lang === 'ru' ? 'Сложность' : 'Difficulty'}: {article.difficulty}</span>}
      </div>
      {article.intro && <p className="mt-6 text-lg text-gray-600 italic leading-relaxed">{article.intro}</p>}
      <div className="mt-8 rich-text text-base"><div dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }} /></div>

      {article.generations && article.generations.length > 0 && (
        <div className="mt-10 p-5 bg-gray-50 rounded-xl">
          <strong>{lang === 'ru' ? 'Модели' : 'Models'}:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {article.generations.map((g) => (
  g.series?.slug ? (
    <a key={g.id} href={`/${lang}/models/${g.series.slug}/${g.slug}`} className="text-blue-700 no-underline">{g.title}</a>
  ) : (
    <span key={g.id} className="text-gray-700">{g.title}</span>
  )
))}
          </div>
        </div>
      )}

      {article.engines && article.engines.length > 0 && (
        <div className="mt-3 p-5 bg-gray-50 rounded-xl">
          <strong>{lang === 'ru' ? 'Двигатели' : 'Engines'}:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {article.engines.map((e) => (
  e.engine_family?.slug ? (
    <a key={e.id} href={`/${lang}/engines/${e.engine_family.slug}/${e.slug}`} className="text-blue-700 no-underline">{e.index}</a>
  ) : (
    <span key={e.id} className="text-gray-700">{e.index}</span>
  )
))}
          </div>
        </div>
      )}
    </div>
  );
}