'use client';

import { useState, useEffect } from 'react';
import { Meilisearch } from 'meilisearch';

const client = new Meilisearch({
  host: 'http://localhost:7700',
  apiKey: 'bmw_master_key_2024',
});

const INDEXES = {
  article: { name: 'article', ru: 'Статьи', en: 'Articles' },
  series: { name: 'serie', ru: 'Модели', en: 'Models' },
  engine: { name: 'engine', ru: 'Двигатели', en: 'Engines' },
};

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
      for (const [key, idx] of Object.entries(INDEXES)) {
        const searchIndex = client.index(idx.name);
        const res = await searchIndex.search(searchQuery, { limit: 10 });
        allResults[key] = res.hits.map((hit) => ({ ...hit, _type: key }));
      }
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
    if (hit._type === 'series') return `/${lang}/models/${hit.slug}`;
    if (hit._type === 'engine') return `/${lang}/engines/${hit.slug}`;
    if (hit._type === 'article') return `/${lang}/articles/${hit.slug}`;
    return '#';
  };

  const getTitle = (hit) => {
    if (lang === 'ru' && hit.localizations?.[0]?.title) return hit.localizations[0].title;
    return hit.title || hit.index || '—';
  };

  const getIntro = (hit) => {
    if (lang === 'ru' && hit.localizations?.[0]?.intro) return hit.localizations[0].intro;
    return hit.intro || '';
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
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'ru' ? 'Поиск' : 'Search'}
      </h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'ru' ? 'Поиск по сайту...' : 'Search the site...'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base outline-none focus:border-blue-700"
          />
          <button type="submit" className="btn-primary">
            {lang === 'ru' ? 'Найти' : 'Search'}
          </button>
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

      {results && totalHits === 0 && (
        <p className="text-gray-500 mt-6">{lang === 'ru' ? 'Ничего не найдено' : 'Nothing found'}</p>
      )}

      {results && totalHits > 0 && (
        <div className="flex flex-col gap-4 mt-6">
          {filteredResults.map((hit, i) => (
            <a key={hit._meilisearch_id || i} href={getUrl(hit)} className="card-link">
              <div className="flex justify-between items-start">
                <strong className="text-lg">{getTitle(hit)}</strong>
                <span className="type-badge">{getTypeLabel(hit._type)}</span>
              </div>
              {getIntro(hit) && (
                <p className="text-sm text-gray-600 mt-2">{getIntro(hit).substring(0, 200)}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}