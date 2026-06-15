'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SearchResults({ lang }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const allResults = {};

      // Поиск по статьям
      const articleRes = await fetch(
        `${API_URL}/api/articles?locale=${lang}&filters[$or][0][title][$containsi]=${encodeURIComponent(searchQuery)}&filters[$or][1][intro][$containsi]=${encodeURIComponent(searchQuery)}&populate=*&pagination[limit]=5`
      );
      const articleData = await articleRes.json();
      allResults.article = (articleData.data || []).map((h) => ({ ...h, _type: 'article' }));

      // Поиск по поколениям
      const genRes = await fetch(
        `${API_URL}/api/generations?locale=${lang}&filters[title][$containsi]=${encodeURIComponent(searchQuery)}&populate=*&pagination[limit]=5`
      );
      const genData = await genRes.json();
      allResults.series = (genData.data || []).map((h) => ({ ...h, _type: 'series' }));

      // Поиск по двигателям
      const engRes = await fetch(
        `${API_URL}/api/engines?locale=${lang}&filters[index][$containsi]=${encodeURIComponent(searchQuery)}&populate=*&pagination[limit]=5`
      );
      const engData = await engRes.json();
      allResults.engine = (engData.data || []).map((h) => ({ ...h, _type: 'engine' }));

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults({});
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const getUrl = (hit) => {
    if (hit._type === 'series') return `/${lang}/models/${hit.series?.slug || 'bmw'}/${hit.slug}`;
    if (hit._type === 'engine') return hit.engine_family?.slug ? `/${lang}/engines/${hit.engine_family.slug}/${hit.slug}` : '#';
    if (hit._type === 'article') return `/${lang}/articles/${hit.slug}`;
    return '#';
  };

  const getTitle = (hit) => hit.title || hit.index || '—';

  const getIntro = (hit) => hit.intro || '';

  const INDEXES = {
    article: { ru: 'Статьи', en: 'Articles' },
    series: { ru: 'Модели', en: 'Models' },
    engine: { ru: 'Двигатели', en: 'Engines' },
  };

  const getTypeLabel = (type) => {
    const item = INDEXES[type];
    return item ? (lang === 'ru' ? item.ru : item.en) : type;
  };

  const getFilteredResults = () => {
    if (!results) return [];
    let all = [];
    for (const [type, hits] of Object.entries(results)) {
      if (activeFilter && type !== activeFilter) continue;
      all = all.concat(hits);
    }
    const order = { article: 0, series: 1, engine: 2 };
    all.sort((a, b) => (order[a._type] || 0) - (order[b._type] || 0));
    return all;
  };

  const filteredResults = getFilteredResults();
  const totalHits = filteredResults.length;
  const getCount = (type) => results?.[type]?.length || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">{lang === 'ru' ? 'Поиск' : 'Search'}</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'ru' ? 'Поиск по сайту...' : 'Search the site...'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base outline-none focus:border-blue-700" />
          <button type="submit" className="btn-primary">{lang === 'ru' ? 'Найти' : 'Search'}</button>
        </div>
        {results && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button type="button" onClick={() => setActiveFilter(null)}
              className={`px-4 py-2 rounded-full text-sm border ${activeFilter === null ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-gray-300'}`}>
              {lang === 'ru' ? 'Все' : 'All'} ({totalHits})
            </button>
            {Object.entries(INDEXES).map(([key, item]) => (
              <button key={key} type="button" onClick={() => handleFilterChange(key)}
                className={`px-4 py-2 rounded-full text-sm border ${activeFilter === key ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
                style={{ opacity: getCount(key) === 0 ? 0.5 : 1 }}>
                {lang === 'ru' ? item.ru : item.en} ({getCount(key)})
              </button>
            ))}
          </div>
        )}
      </form>
      {loading && <p className="text-gray-500">{lang === 'ru' ? 'Поиск...' : 'Searching...'}</p>}
      {results && totalHits === 0 && <p className="text-gray-500 mt-6">{lang === 'ru' ? 'Ничего не найдено' : 'Nothing found'}</p>}
      {results && totalHits > 0 && (
        <div className="flex flex-col gap-4 mt-6">
          {filteredResults.map((hit, i) => (
            <a key={hit.documentId || i} href={getUrl(hit)} className="card-link">
              <div className="flex justify-between items-start">
                <strong className="text-lg">{getTitle(hit)}</strong>
                <span className="type-badge">{getTypeLabel(hit._type)}</span>
              </div>
              {getIntro(hit) && <p className="text-sm text-gray-600 mt-2">{getIntro(hit).substring(0, 200)}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}