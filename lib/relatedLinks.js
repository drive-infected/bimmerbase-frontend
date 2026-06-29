// lib/relatedLinks.js

/**
 * Возвращает массив секций для блока RelatedLinks на странице поколения.
 * @param {object} gen - объект поколения со всеми популяризированными связями
 * @param {string} lang - текущий язык ('ru' или 'en')
 * @returns {Array<{key: string, title: string, items: Array}>}
 */
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

  // 2. Модификации (пока без ссылок, так как страницы модификаций ещё не созданы)
  if (gen.modifications && gen.modifications.length > 0) {
    const items = gen.modifications.map((mod) => ({
      id: mod.documentId,
      label: mod.title,
      subtitle: mod.engines?.[0]?.index
        ? `${mod.engines[0].index} • ${mod.engines[0].displacement} cc`
        : null,
      href: null, // когда появятся страницы, замени на `/${lang}/models/${gen.series?.slug}/${gen.slug}/${mod.slug}`
    }));
    sections.push({
      key: 'modifications',
      title: lang === 'ru' ? 'Модификации' : 'Modifications',
      items,
    });
  }

  // 3. Двигатели (семейства двигателей) — собираем уникальные по slug
  if (gen.engines && gen.engines.length > 0) {
    const familyMap = new Map();
    gen.engines.forEach((engine) => {
      const family = engine.engine_family;
      if (family && !familyMap.has(family.slug)) {
        familyMap.set(family.slug, {
          id: family.documentId,
          label: family.code,
          subtitle: `${family.cylinders} cyl • ${family.fuel_type}`,
          href: `/${lang}/engines/${family.slug}`,
        });
      }
    });
    if (familyMap.size > 0) {
      sections.push({
        key: 'engine-families',
        title: lang === 'ru' ? 'Двигатели' : 'Engines',
        items: Array.from(familyMap.values()),
      });
    }
  }

  // 4. Спецверсии
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

  // 5. Статьи
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