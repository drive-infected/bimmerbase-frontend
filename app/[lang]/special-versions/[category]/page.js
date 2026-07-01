'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SpecialVersionCategoryPage() {
  const { lang, category } = useParams();
  const searchParams = useSearchParams();
  const seriesFromUrl = searchParams.get('series') || null;

  const [categoryData, setCategoryData] = useState(null);
  const [specialVersions, setSpecialVersions] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (seriesFilter) => {
    setLoading(true);
    setError(null);
    try {
      // Категория
      const catRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/special-version-categories?locale=${lang}&filters[slug][$eq]=${category}&populate=image`,
        { cache: 'no-store' }
      );
      if (!catRes.ok) throw new Error('Category not found');
      const catData = await catRes.json();
      const cat = catData.data?.[0];
      setCategoryData(cat);

      // Спецверсии с фильтром
      const svUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/special-versions`);
      svUrl.searchParams.set('locale', lang);
      svUrl.searchParams.set('filters[special_version_category][slug][$eq]', category);
      if (seriesFilter) {
        svUrl.searchParams.set('filters[series][slug][$eq]', seriesFilter);
      }
      svUrl.searchParams.set('populate[generation][populate][series]', 'true');
      svUrl.searchParams.set('populate[engine]', 'true');
      svUrl.searchParams.set('populate[series]', 'true');
      svUrl.searchParams.set('sort', 'title');

      const svRes = await fetch(svUrl.toString(), { cache: 'no-store' });
      const svData = await svRes.json();
      setSpecialVersions(svData.data || []);

      // Все уникальные серии для кнопок (без учёта фильтра)
      const allSvUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/special-versions`);
      allSvUrl.searchParams.set('locale', lang);
      allSvUrl.searchParams.set('filters[special_version_category][slug][$eq]', category);
      allSvUrl.searchParams.set('populate[series]', 'true');
      const allRes = await fetch(allSvUrl.toString(), { cache: 'no-store' });
      const allData = await allRes.json();
      const allVersions = allData.data || [];
      const seriesMap = new Map();
      allVersions.forEach(sv => {
        if (sv.series) seriesMap.set(sv.series.slug, sv.series);
      });
      setSeriesOptions(Array.from(seriesMap.values()).sort((a, b) => (a.title || '').localeCompare(b.title || '')));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lang, category]);

  useEffect(() => {
    fetchData(seriesFromUrl);
  }, [seriesFromUrl, fetchData]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-10"><p className="text-gray-500">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</p></div>;
  }
  if (error) {
    return <div className="max-w-6xl mx-auto px-4 py-10"><p className="text-red-600">{lang === 'ru' ? 'Ошибка: ' : 'Error: '}{error}</p></div>;
  }
  if (!categoryData) {
    return <div className="max-w-6xl mx-auto px-4 py-10"><p>{lang === 'ru' ? 'Категория не найдена' : 'Category not found'}</p></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href={`/${lang}/special-versions`} className="text-blue-700 no-underline mb-4 inline-block">
        ← {lang === 'ru' ? 'Спецверсии' : 'Special Versions'}
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mt-4">
        <div className="md:w-1/3">
          {categoryData.image?.url && (
            <img
              src={categoryData.image.url}
              alt={categoryData.title}
              className="w-full h-auto rounded-lg shadow-md"
            />
          )}
        </div>
        <div className="md:w-2/3">
          <h1 className="text-4xl font-bold">{categoryData.title}</h1>
          {categoryData.description && (
            <div className="mt-4 text-gray-600 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: categoryData.description }} />
            </div>
          )}
        </div>
      </div>

      {/* Фильтр по сериям */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href={`/${lang}/special-versions/${category}`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!seriesFromUrl ? 'bg-[#0066B1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {lang === 'ru' ? 'Все' : 'All'}
        </Link>
        {seriesOptions.map(s => (
          <Link
            key={s.slug}
            href={`/${lang}/special-versions/${category}?series=${s.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${seriesFromUrl === s.slug ? 'bg-[#0066B1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {s.title}
          </Link>
        ))}
      </div>

      {/* Сетка версий */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialVersions.map(sv => (
          <Link
            key={sv.id}
            href={`/${lang}/special-versions/${category}/${sv.slug}`}
            className="card-link group"
          >
            <span className="card-title text-lg group-hover:text-[#0066B1] transition-colors">{sv.title}</span>
            {sv.generation && (
              <p className="text-sm text-gray-500 mt-1">
                {sv.generation.title}
                {sv.generation.series && ` (${sv.generation.series.title})`}
              </p>
            )}
            <div className="text-sm text-gray-400 mt-1">
              {sv.production_start?.substring(0, 4)}–{sv.production_end?.substring(0, 4)}
              {sv.production_count && ` • ${sv.production_count} ${lang === 'ru' ? 'шт.' : 'units'}`}
            </div>
            {sv.power_hp && <p className="text-sm text-[#0066B1] mt-1 font-medium">{sv.power_hp} hp</p>}
          </Link>
        ))}
        {!loading && specialVersions.length === 0 && (
          <p className="text-gray-500 col-span-full">{lang === 'ru' ? 'Нет версий по выбранным фильтрам.' : 'No versions found.'}</p>
        )}
      </div>
    </div>
  );
}