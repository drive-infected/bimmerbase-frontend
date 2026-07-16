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
      href: `/${lang}/special-versions/${sv.special_version_category?.slug || 'other'}/${sv.slug}`,
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

export function getEngineSections(engine, lang) {
  const sections = [];

  // 1. Семейство двигателей
  if (engine.engine_family) {
    sections.push({
      key: 'family',
      title: lang === 'ru' ? 'Семейство' : 'Engine Family',
      items: [
        {
          id: engine.engine_family.documentId,
          label: engine.engine_family.code,
          subtitle: `${engine.engine_family.cylinders} cyl • ${engine.engine_family.fuel_type}`,
          href: `/${lang}/engines/${engine.engine_family.slug}`,
        },
      ],
    });
  }

  // 2. Статьи (фильтруем по locale)
  const articles = (engine.articles || []).filter((a) => a.locale === lang);
  if (articles.length > 0) {
    sections.push({
      key: 'articles',
      title: lang === 'ru' ? 'Статьи' : 'Articles',
      items: articles.map((article) => ({
        id: article.documentId,
        label: article.title,
        subtitle: article.intro ? article.intro.substring(0, 100) : null,
        href: `/${lang}/articles/${article.slug}`,
      })),
    });
  }

  // 3. Спецверсии (фильтруем по locale)
  const specialVersions = (engine.special_versions || []).filter(
    (sv) => sv.locale === lang
  );
  if (specialVersions.length > 0) {
    sections.push({
      key: 'special-versions',
      title: lang === 'ru' ? 'Спецверсии' : 'Special Versions',
      items: specialVersions.map((sv) => ({
        id: sv.documentId,
        label: sv.title,
        subtitle: sv.engine?.power_hp ? `${sv.engine.power_hp} hp` : null,
        href: `/${lang}/special-versions/${sv.special_version_category?.slug || 'other'}/${sv.slug}`,
      })),
    });
  }

  return sections;
}

export function getSpecialVersionSections(sv, lang) {
  const sections = [];

  // 1. Поколение
  if (sv.generation) {
    const gen = sv.generation;
    sections.push({
      key: 'generation',
      title: lang === 'ru' ? 'Поколение' : 'Generation',
      items: [{
        id: gen.documentId,
        label: gen.title,
        subtitle: gen.series?.title || '',
        href: `/${lang}/models/${gen.series?.slug || ''}/${gen.slug}`,
      }],
    });
  }

  // 2. Двигатель
  if (sv.engine) {
    const eng = sv.engine;
    sections.push({
      key: 'engine',
      title: lang === 'ru' ? 'Двигатель' : 'Engine',
      items: [{
        id: eng.documentId,
        label: eng.index,
        subtitle: `${eng.power_hp} hp • ${eng.displacement} cc`,
        href: eng.engine_family?.slug
          ? `/${lang}/engines/${eng.engine_family.slug}/${eng.slug}`
          : null,
      }],
    });
  }

  // 3. Статьи
  const articles = (sv.articles || []).filter(a => a.locale === lang);
  if (articles.length > 0) {
    sections.push({
      key: 'articles',
      title: lang === 'ru' ? 'Статьи' : 'Articles',
      items: articles.map(article => ({
        id: article.documentId,
        label: article.title,
        subtitle: article.intro?.substring(0, 100) || null,
        href: `/${lang}/articles/${article.slug}`,
      })),
    });
  }

  return sections;
}