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
    if (block.type === 'quote') {
      const text = block.children?.map((c) => c.text).join('');
      return `<blockquote>${text}</blockquote>`;
    }
    if (block.type === 'code') {
      const code = block.children?.map((c) => c.text).join('');
      return `<pre><code>${code}</code></pre>`;
    }
    if (block.type === 'image') {
      return `<img src="${block.image?.url}" alt="${block.image?.alternativeText || ''}" />`;
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

export default async function ArticlePage({ params }) {
  const { slug, lang } = await params;

  const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/articles?locale=${lang}&filters[slug][$eq]=${slug}&populate=*`,
  { cache: 'no-store' }
);
  const data = await res.json();
  const article = data.data?.[0];

  if (!article) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <a href={`/${lang}/articles`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
        </a>
        <h1 className="text-2xl font-bold mt-4">
          {lang === 'ru' ? 'Статья не найдена' : 'Article not found'}
        </h1>
      </main>
    );
  }

  const contentHtml = renderRichText(article.content);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500 mb-6">
        <a href={`/${lang}/articles`} className="text-blue-700 no-underline hover:underline">
          {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
        </a>
        {article.category && (
          <>
            <span className="mx-2">/</span>
            <span>{article.category.title}</span>
          </>
        )}
      </nav>

      <h1 className="text-3xl font-bold leading-tight">{article.title}</h1>

      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
        {article.published_date && (
          <span>{lang === 'ru' ? 'Опубликовано' : 'Published'}: {article.published_date}</span>
        )}
        {article.difficulty && (
          <span>{lang === 'ru' ? 'Сложность' : 'Difficulty'}: {article.difficulty}</span>
        )}
      </div>

      {article.intro && (
        <p className="mt-6 text-lg text-gray-600 italic leading-relaxed">
          {article.intro}
        </p>
      )}

      <div className="mt-8 rich-text text-base">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>

      {/* Связанные модели */}
      {article.generations?.length > 0 && (
        <section className="mt-12 p-5 bg-gray-50 rounded-xl">
          <h2 className="text-lg font-semibold mb-3">
            {lang === 'ru' ? 'Связанные модели' : 'Related models'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {article.generations.map((g) => (
              g.series?.slug ? (
                <a key={g.id} href={`/${lang}/models/${g.series.slug}/${g.slug}`}
                   className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-blue-700 no-underline hover:border-blue-300 transition-colors text-sm"
                >
                  {g.title}
                </a>
              ) : (
                <span key={g.id} className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 text-sm">
                  {g.title}
                </span>
              )
            ))}
          </div>
        </section>
      )}

      {/* Связанные двигатели */}
      {article.engines?.length > 0 && (
        <section className="mt-3 p-5 bg-gray-50 rounded-xl">
          <h2 className="text-lg font-semibold mb-3">
            {lang === 'ru' ? 'Связанные двигатели' : 'Related engines'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {article.engines.map((e) => (
              e.engine_family?.slug ? (
                <a key={e.id} href={`/${lang}/engines/${e.engine_family.slug}/${e.slug}`}
                   className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-blue-700 no-underline hover:border-blue-300 transition-colors text-sm"
                >
                  {e.index}
                </a>
              ) : (
                <span key={e.id} className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 text-sm">
                  {e.index}
                </span>
              )
            ))}
          </div>
        </section>
      )}
    </main>
  );
}