// lib/relatedLinks.js

export function getGenerationSections(gen, lang) {
  const sections = [];

  // 1. Родительская серия
  if (gen.series) {
    sections.push({
      key: 'parent',
      title: lang === 'ru' ? 'Серия' : 'Series',
      items: [
        {
          id: gen.series.documentId,
          label: gen.series.title,
          href: `/${lang}/models/${gen.series.slug}`,
        },
      ],
    });
  }

  // 2. Модификации (отсортированы по названию)
  if (gen.modifications && gen.modifications.length > 0) {
    const sorted = [...gen.modifications].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );
    sections.push({
      key: 'modifications',
      title: lang === 'ru' ? 'Модификации' : 'Modifications',
      items: sorted.map((mod) => ({
        id: mod.documentId,
        label: mod.title,
        subtitle: mod.engines?.[0]?.index
          ? `${mod.engines[0].index} • ${mod.engines[0].displacement} cc`
          : null,
        href: null,
      })),
    });
  }

  // 3. Спецверсии
  if (gen.special_versions && gen.special_versions.length > 0) {
    const items = gen.special_versions.map((sv) => ({
      id: sv.documentId,
      label: sv.title,
      subtitle: sv.engine?.index ? `${sv.engine.index} • ${sv.engine.power_hp} hp` : null,
      href: `/${lang}/special-versions/${sv.slug}`,
    }));
    sections.push({
      key: 'special-versions',
      title: lang === 'ru' ? 'Спецверсии' : 'Special Versions',
      items,
    });
  }

  // 4. Статьи
  if (gen.articles && gen.articles.length > 0) {
    const items = gen.articles.map((article) => ({
      id: article.documentId,
      label: article.title,
      subtitle: article.intro ? article.intro.substring(0, 100) : null,
      href: `/${lang}/articles/${article.slug}`,
    }));
    sections.push({
      key: 'articles',
      title: lang === 'ru' ? 'Статьи' : 'Articles',
      items,
    });
  }

  return sections;
}