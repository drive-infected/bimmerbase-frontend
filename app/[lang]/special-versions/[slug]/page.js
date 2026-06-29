// app/[lang]/special-versions/[slug]/page.js
import RelatedLinks from '@/components/RelatedLinks';
import { getSpecialVersionSections } from '@/lib/relatedLinks';

function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map(block => {
    if (block.type === 'paragraph') {
      const text = block.children?.map(c => c.text || '').join('');
      return text ? `<p>${text}</p>` : '';
    }
    if (block.type === 'heading') {
      const text = block.children?.map(c => c.text).join('');
      return `<h${block.level || 2}>${text}</h${block.level || 2}>`;
    }
    if (block.type === 'list') {
      const tag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = (block.children || []).map(item => {
        if (item.type === 'list-item') {
          const text = item.children?.map(c => c.text || '').join('');
          return `<li>${text}</li>`;
        }
        return '';
      }).join('');
      return `<${tag}>${items}</${tag}>`;
    }
    return '';
  }).join('');
}

export default async function SpecialVersionPage({ params }) {
  const { slug, lang } = await params;

  // Глубокая популяция
  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('filters[slug][$eq]', slug);
  searchParams.set('populate[generation][populate][series]', 'true');
  searchParams.set('populate[engine][populate][engine_family]', 'true');
  searchParams.set('populate[articles]', 'true');
  searchParams.set('populate[base_options]', 'true');

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/special-versions?${searchParams.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки' : 'Loading error'}
        </h1>
      </div>
    );
  }
  const data = await res.json();
  const sv = data.data?.[0];

  if (!sv) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href={`/${lang}/special-versions`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'Спецверсии' : 'Special Versions'}
        </a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Версия не найдена' : 'Version not found'}</h1>
      </div>
    );
  }

  const relatedSections = getSpecialVersionSections(sv, lang);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <a href={`/${lang}/special-versions`} className="text-blue-700 no-underline">
        ← {lang === 'ru' ? 'Спецверсии' : 'Special Versions'}
      </a>

      <h1 className="text-4xl font-bold mt-4">{sv.title}</h1>

      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
        {sv.type && <span className="type-badge">{sv.type}</span>}
        {sv.production_start && (
          <span>{sv.production_start.substring(0, 4)}–{sv.production_end?.substring(0, 4)}</span>
        )}
        {sv.production_count && <span>{sv.production_count} {lang === 'ru' ? 'шт.' : 'units'}</span>}
        {sv.power_hp && <span>{sv.power_hp} hp</span>}
      </div>

      {sv.description && (
        <div className="mt-8 rich-text">
          <h2 className="section-title">{lang === 'ru' ? 'Описание' : 'Description'}</h2>
          <div dangerouslySetInnerHTML={{ __html: renderRichText(sv.description) }} />
        </div>
      )}

      {sv.differences && (
        <div className="mt-8 rich-text">
          <h2 className="section-title">{lang === 'ru' ? 'Отличия от базовой модели' : 'Differences from base model'}</h2>
          <div dangerouslySetInnerHTML={{ __html: renderRichText(sv.differences) }} />
        </div>
      )}

      {sv.base_options && sv.base_options.length > 0 && (
        <div className="mt-8">
          <h2 className="section-title">{lang === 'ru' ? 'Стандартное оснащение' : 'Standard Equipment'}</h2>
          <ul className="space-y-1 text-sm">
            {sv.base_options.map((opt) => (
              <li key={opt.id}><span className="tag mr-2">{opt.sa_code}</span> {opt.title}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Перелинковка */}
      <RelatedLinks sections={relatedSections} lang={lang} />
    </div>
  );
}