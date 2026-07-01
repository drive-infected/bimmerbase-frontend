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

  // 2. Поколения, где применяется двигатель (фильтруем по locale)
  const generations = (engine.generations || []).filter(
    (gen) => !gen.locale || gen.locale === lang
  );
  if (generations.length > 0) {
    const sorted = [...generations].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );
    sections.push({
      key: 'generations',
      title: lang === 'ru' ? 'Применяемость' : 'Applications',
      items: sorted.map((gen) => ({
        id: gen.documentId,
        label: gen.title,
        subtitle: gen.series?.title || '',
        href: `/${lang}/models/${gen.series?.slug || ''}/${gen.slug}`,
      })),
    });
  }

  // 3. Статьи (фильтруем по locale)
  const articles = (engine.articles || []).filter(
    (a) => a.locale === lang
  );
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

  // 4. Спецверсии (фильтруем по locale)
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

export function getArticleSections(article, lang) {
  const sections = [];

  // 1. Поколения (применяемость)
  const generations = (article.generations || []).filter(g => !g.locale || g.locale === lang);
  if (generations.length > 0) {
    const sorted = [...generations].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    sections.push({
      key: 'generations',
      title: lang === 'ru' ? 'Связанные модели' : 'Related models',
      items: sorted.map(gen => ({
        id: gen.documentId,
        label: gen.title,
        subtitle: gen.series?.title || '',
        href: `/${lang}/models/${gen.series?.slug || ''}/${gen.slug}`,
      })),
    });
  }

  // 2. Двигатели
  const engines = (article.engines || []).filter(Boolean);
  if (engines.length > 0) {
    const sorted = [...engines].sort((a, b) => (a.index || '').localeCompare(b.index || ''));
    sections.push({
      key: 'engines',
      title: lang === 'ru' ? 'Связанные двигатели' : 'Related engines',
      items: sorted.map(eng => ({
        id: eng.documentId,
        label: eng.index,
        subtitle: `${eng.power_hp} hp • ${eng.displacement} cc`,
        href: eng.engine_family?.slug
          ? `/${lang}/engines/${eng.engine_family.slug}/${eng.slug}`
          : null,
      })),
    });
  }

  // 3. Семейства двигателей (прямая связь)
  const families = (article.engine_families || []).filter(f => !f.locale || f.locale === lang);
  if (families.length > 0) {
    sections.push({
      key: 'engine-families',
      title: lang === 'ru' ? 'Семейства двигателей' : 'Engine families',
      items: families.map(f => ({
        id: f.documentId,
        label: f.code,
        subtitle: `${f.cylinders} cyl • ${f.fuel_type}`,
        href: `/${lang}/engines/${f.slug}`,
      })),
    });
  }

  // 4. Спецверсии
  const specialVersions = (article.special_versions || []).filter(sv => !sv.locale || sv.locale === lang);
  if (specialVersions.length > 0) {
    sections.push({
      key: 'special-versions',
      title: lang === 'ru' ? 'Спецверсии' : 'Special versions',
      items: specialVersions.map(sv => ({
        id: sv.documentId,
        label: sv.title,
        subtitle: sv.engine?.index ? `${sv.engine.index} • ${sv.engine.power_hp} hp` : null,
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