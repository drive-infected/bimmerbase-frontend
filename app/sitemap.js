// app/sitemap.js
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Пагинированный сбор всех данных из коллекции
async function fetchAllPages(endpoint, params = '') {
  let items = [];
  let page = 1;
  while (true) {
    const url = `${API_URL}/api/${endpoint}?pagination[pageSize]=100&pagination[page]=${page}&${params}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) break;
    const json = await res.json();
    if (!json.data || json.data.length === 0) break;
    items = items.concat(json.data);
    if (json.data.length < 100) break;
    page++;
  }
  return items;
}

// Группировка записей по documentId для мультиязычности
function groupByDocumentId(items) {
  const map = new Map();
  items.forEach(item => {
    if (!map.has(item.documentId)) {
      map.set(item.documentId, {});
    }
    map.get(item.documentId)[item.locale || 'default'] = item; // для нелокализованных используем ключ 'default'
  });
  return map;
}

// Вспомогательная функция для формирования альтернативных ссылок для локализованной сущности
function localizedAlternates(locales, pathBuilder) {
  const alternates = {};
  ['en', 'ru'].forEach(l => {
    const item = locales[l];
    if (item) alternates[l] = `${BASE_URL}/${l}/${pathBuilder(item)}`;
    else {
      // fallback на другой язык, если для данного нет перевода
      const fallback = locales['ru'] || locales['en'];
      if (fallback) alternates[l] = `${BASE_URL}/${l}/${pathBuilder(fallback)}`;
    }
  });
  return alternates;
}

// Построение URL для нелокализованной сущности (одинаковый slug для всех языков)
function nonLocalizedAlternates(slug, pathBuilder) {
  const alternates = {};
  ['en', 'ru'].forEach(l => {
    alternates[l] = `${BASE_URL}/${l}/${pathBuilder(slug)}`;
  });
  return alternates;
}

export default async function sitemap() {
  const sitemapEntries = [];

  // 1. Главная страница
  sitemapEntries.push({
    url: `${BASE_URL}/ru`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
    alternates: { languages: { en: `${BASE_URL}/en`, ru: `${BASE_URL}/ru` } },
  });

  // 2. Разводящие страницы
  const lists = ['models', 'engines', 'special-versions', 'articles'];
  lists.forEach(slug => {
    sitemapEntries.push({
      url: `${BASE_URL}/ru/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: { languages: { en: `${BASE_URL}/en/${slug}`, ru: `${BASE_URL}/ru/${slug}` } },
    });
  });

  // 3. Серии (не локализованы)
  const seriesList = await fetchAllPages('series');
  seriesList.forEach(serie => {
    sitemapEntries.push({
      url: `${BASE_URL}/ru/models/${serie.slug}`,
      lastModified: serie.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: nonLocalizedAlternates(serie.slug, s => `models/${s}`),
      },
    });
  });

  // 4. Поколения (локализованы)
  const generationsList = await fetchAllPages('generations', 'populate[series]=true');
  const generationsGrouped = groupByDocumentId(generationsList);
  for (const [_, locales] of generationsGrouped) {
    const ru = locales['ru'] || locales['en'];
    if (!ru || !ru.series) continue;
    sitemapEntries.push({
      url: `${BASE_URL}/ru/models/${ru.series.slug}/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: localizedAlternates(locales, item => `models/${item.series.slug}/${item.slug}`),
      },
    });
  }

  // 5. Семейства двигателей (локализованы)
  const familiesList = await fetchAllPages('engine-families');
  const familiesGrouped = groupByDocumentId(familiesList);
  for (const [_, locales] of familiesGrouped) {
    const ru = locales['ru'] || locales['en'];
    if (!ru) continue;
    sitemapEntries.push({
      url: `${BASE_URL}/ru/engines/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: localizedAlternates(locales, item => `engines/${item.slug}`),
      },
    });
  }

  // 6. Модификации двигателей (не локализованы)
  const enginesList = await fetchAllPages('engines', 'populate[engine_family]=true');
  enginesList.forEach(engine => {
    if (!engine.engine_family) return;
    sitemapEntries.push({
      url: `${BASE_URL}/ru/engines/${engine.engine_family.slug}/${engine.slug}`,
      lastModified: engine.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: nonLocalizedAlternates(
          `${engine.engine_family.slug}/${engine.slug}`,
          s => `engines/${s}`
        ),
      },
    });
  });

  // 7. Категории спецверсий (не локализованы)
  const specialCategoriesList = await fetchAllPages('special-version-categories');
  specialCategoriesList.forEach(cat => {
    sitemapEntries.push({
      url: `${BASE_URL}/ru/special-versions/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: nonLocalizedAlternates(cat.slug, s => `special-versions/${s}`),
      },
    });
  });

  // 8. Спецверсии (локализованы)
  const specialVersionsList = await fetchAllPages('special-versions', 'populate[special_version_category]=true');
  const svGrouped = groupByDocumentId(specialVersionsList);
  for (const [_, locales] of svGrouped) {
    const ru = locales['ru'] || locales['en'];
    if (!ru || !ru.special_version_category) continue;
    sitemapEntries.push({
      url: `${BASE_URL}/ru/special-versions/${ru.special_version_category.slug}/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: localizedAlternates(locales, item => `special-versions/${item.special_version_category.slug}/${item.slug}`),
      },
    });
  }

  // 9. Статьи (локализованы)
  const articlesList = await fetchAllPages('articles');
  const articlesGrouped = groupByDocumentId(articlesList);
  for (const [_, locales] of articlesGrouped) {
    const ru = locales['ru'] || locales['en'];
    if (!ru) continue;
    sitemapEntries.push({
      url: `${BASE_URL}/ru/articles/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: localizedAlternates(locales, item => `articles/${item.slug}`),
      },
    });
  }

  return sitemapEntries;
}