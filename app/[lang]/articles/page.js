'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ArticlesPage() {
  const { lang } = useParams();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || null;

  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка категорий (один раз)
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/article-categories`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  // Загрузка статей при изменении categoryFromUrl
  const fetchArticles = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/articles`);
    url.searchParams.set('locale', lang);
    url.searchParams.set('sort', 'published_date:desc');
    if (category) {
      url.searchParams.set('filters[category][slug][$eq]', category);
    }
    url.searchParams.set('populate[category]', 'true');
    try {
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArticles(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    fetchArticles(categoryFromUrl);
  }, [categoryFromUrl, fetchArticles]);

  // Словари
  const categoryTranslations = {
    ru: {
      'Diagnostics & Repair': 'Диагностика и ремонт',
      History: 'История',
      Maintenance: 'Обслуживание',
      Motorsport: 'Автоспорт',
      Retrofit: 'Доработка',
    },
  };
  const translateCategory = (title) => {
    if (lang === 'ru' && categoryTranslations.ru[title]) return categoryTranslations.ru[title];
    return title;
  };
  const translateDifficulty = (d) => {
    if (lang === 'ru') {
      if (d === 'Easy') return 'Лёгкая';
      if (d === 'Medium') return 'Средняя';
      if (d === 'Hard') return 'Сложная';
    }
    return d;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
      </h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={`/${lang}/articles`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !categoryFromUrl
              ? 'bg-[#0066B1] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {lang === 'ru' ? 'Все' : 'All'}
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/${lang}/articles?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categoryFromUrl === cat.slug
                ? 'bg-[#0066B1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {translateCategory(cat.title)}
          </Link>
        ))}
      </div>

      {categoryFromUrl && (
        <p className="text-sm text-gray-500 mb-6">
          {lang === 'ru' ? 'Категория' : 'Category'}:{' '}
          {translateCategory(categories.find(c => c.slug === categoryFromUrl)?.title || categoryFromUrl)}
        </p>
      )}

      {/* Состояния */}
      {loading && <p className="text-gray-500">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</p>}
      {error && (
        <p className="text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки: ' : 'Loading error: '}{error}
        </p>
      )}
      {!loading && !error && articles.length === 0 && (
        <p className="text-gray-500">
          {lang === 'ru' ? 'Статьи не найдены.' : 'No articles found.'}
        </p>
      )}

      {/* Список статей на всю ширину */}
      {!loading && articles.length > 0 && (
        <div className="flex flex-col gap-4">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/${lang}/articles/${article.slug}`}
              className="card-link block"
            >
              <span className="card-title text-lg">{article.title}</span>
              {article.intro && (
                <p className="card-text mt-2 text-sm">{article.intro}</p>
              )}
              <div className="flex gap-3 mt-3 text-xs text-gray-400">
                {article.published_date && <span>{article.published_date}</span>}
                {article.difficulty && (
                  <span>{translateDifficulty(article.difficulty)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}