// app/[lang]/articles/[slug]/page.js
import RelatedLinks from '@/components/RelatedLinks';
import { getArticleSections } from '@/lib/relatedLinks';

function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map(block => {
    if (block.type === 'paragraph') {
      const text = block.children?.map(c => {
        let content = c.text || '';
        if (c.bold) content = `<strong>${content}</strong>`;
        if (c.italic) content = `<em>${content}</em>`;
        return content;
      }).join('');
      return text ? `<p>${text}</p>` : '';
    }
    if (block.type === 'heading') {
      const text = block.children?.map(c => c.text).join('');
      return `<h${block.level || 2}>${text}</h${block.level || 2}>`;
    }
    if (block.type === 'list') {
      const tag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = renderListItems(block.children);
      return `<${tag}>${items}</${tag}>`;
    }
    if (block.type === 'quote') {
      const text = block.children?.map(c => c.text).join('');
      return `<blockquote>${text}</blockquote>`;
    }
    if (block.type === 'code') {
      const code = block.children?.map(c => c.text).join('');
      return `<pre><code>${code}</code></pre>`;
    }
    if (block.type === 'image') {
      return `<img src="${block.image?.url}" alt="${block.image?.alternativeText || ''}" />`;
    }
    return '';
  }).join('');
}

function renderListItems(children) {
  if (!children || !Array.isArray(children)) return '';
  return children.map(child => {
    if (child.type === 'list-item') {
      const text = child.children?.filter(c => c.type === 'text')?.map(c => c.text || '').join('') || '';
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

function translateDifficulty(difficulty, lang) {
  if (lang === 'ru') {
    if (difficulty === 'Easy') return 'Лёгкая';
    if (difficulty === 'Medium') return 'Средняя';
    if (difficulty === 'Hard') return 'Сложная';
  }
  return difficulty;
}

export default async function ArticlePage({ params }) {
  const { slug, lang } = await params;

  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('filters[slug][$eq]', slug);
  searchParams.set('populate[generations][populate][series]', 'true');
  searchParams.set('populate[engines][populate][engine_family]', 'true');
  searchParams.set('populate[engine_families]', 'true');
  searchParams.set('populate[special_versions]', 'true');
  searchParams.set('populate[category]', 'true');
  searchParams.set('populate[tags]', 'true');

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/articles?${searchParams.toString()}`;
  let article;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    article = data.data?.[0];
  } catch (err) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки статьи' : 'Article loading error'}
        </h1>
        <p className="mt-2 text-gray-700">{err.message}</p>
      </main>
    );
  }

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
  const relatedSections = getArticleSections(article, lang);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
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
          <span>{lang === 'ru' ? 'Сложность' : 'Difficulty'}: {translateDifficulty(article.difficulty, lang)}</span>
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

      <RelatedLinks sections={relatedSections} lang={lang} />
    </main>
  );
}