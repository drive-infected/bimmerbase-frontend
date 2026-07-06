// app/sitemap.js
export const dynamic = 'force-dynamic'; // гарантирует актуальность

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
    map.get(item.documentId)[item.locale] = item;
  });
  return map;
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

  // 3. Серии
  const seriesList = await fetchAllPages('series');
  groupByDocumentId(seriesList).forEach(locales => {
    const ru = locales['ru'] || locales['en'];
    if (!ru) return;
    const alternates = {};
    ['en', 'ru'].forEach(l => {
      if (locales[l]) alternates[l] = `${BASE_URL}/${l}/models/${locales[l].slug}`;
    });
    sitemapEntries.push({
      url: `${BASE_URL}/ru/models/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: { languages: alternates },
    });
  });

  // 4. Поколения
  const generationsList = await fetchAllPages('generations', 'populate[series]=true');
  groupByDocumentId(generationsList).forEach(locales => {
    const ru = locales['ru'] || locales['en'];
    if (!ru || !ru.series) return;
    const alternates = {};
    ['en', 'ru'].forEach(l => {
      if (locales[l] && locales[l].series) {
        alternates[l] = `${BASE_URL}/${l}/models/${locales[l].series.slug}/${locales[l].slug}`;
      }
    });
    sitemapEntries.push({
      url: `${BASE_URL}/ru/models/${ru.series.slug}/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: alternates },
    });
  });

  // 5. Семейства двигателей
  const familiesList = await fetchAllPages('engine-families');
  groupByDocumentId(familiesList).forEach(locales => {
    const ru = locales['ru'] || locales['en'];
    if (!ru) return;
    const alternates = {};
    ['en', 'ru'].forEach(l => {
      if (locales[l]) alternates[l] = `${BASE_URL}/${l}/engines/${locales[l].slug}`;
    });
    sitemapEntries.push({
      url: `${BASE_URL}/ru/engines/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: { languages: alternates },
    });
  });

  // 6. Модификации двигателей
  const enginesList = await fetchAllPages('engines', 'populate[engine_family]=true');
  groupByDocumentId(enginesList).forEach(locales => {
    const ru = locales['ru'] || locales['en'];
    if (!ru || !ru.engine_family) return;
    const alternates = {};
    ['en', 'ru'].forEach(l => {
      if (locales[l] && locales[l].engine_family) {
        alternates[l] = `${BASE_URL}/${l}/engines/${locales[l].engine_family.slug}/${locales[l].slug}`;
      }
    });
    sitemapEntries.push({
      url: `${BASE_URL}/ru/engines/${ru.engine_family.slug}/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: alternates },
    });
  });

  // 7. Спецверсии
  const specialVersionsList = await fetchAllPages('special-versions', 'populate[special_version_category]=true');
  groupByDocumentId(specialVersionsList).forEach(locales => {
    const ru = locales['ru'] || locales['en'];
    if (!ru || !ru.special_version_category) return;
    const alternates = {};
    ['en', 'ru'].forEach(l => {
      if (locales[l] && locales[l].special_version_category) {
        alternates[l] = `${BASE_URL}/${l}/special-versions/${locales[l].special_version_category.slug}/${locales[l].slug}`;
      }
    });
    sitemapEntries.push({
      url: `${BASE_URL}/ru/special-versions/${ru.special_version_category.slug}/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: alternates },
    });
  });

  // 8. Статьи
  const articlesList = await fetchAllPages('articles');
  groupByDocumentId(articlesList).forEach(locales => {
    const ru = locales['ru'] || locales['en'];
    if (!ru) return;
    const alternates = {};
    ['en', 'ru'].forEach(l => {
      if (locales[l]) alternates[l] = `${BASE_URL}/${l}/articles/${locales[l].slug}`;
    });
    sitemapEntries.push({
      url: `${BASE_URL}/ru/articles/${ru.slug}`,
      lastModified: ru.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: alternates },
    });
  });

  return sitemapEntries;
}