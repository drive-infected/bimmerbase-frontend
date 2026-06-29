// app/[lang]/models/[series]/[generation]/page.js
import Tabs from './tabs';
import RelatedLinks from '@/components/RelatedLinks';
import { getGenerationSections } from '@/lib/relatedLinks';

export default async function GenerationPage({ params }) {
  const { series, generation, lang } = await params;

  // Базовый URL
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/generations`;

  // Собираем параметры через URLSearchParams для корректного кодирования
  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('filters[slug][$eq]', generation);

  // Глубокая популяция (точки в именах допустимы)
  searchParams.set('populate[series]', 'true');
  searchParams.set('populate[modifications][populate][engines]', 'true');
  searchParams.set('populate[engines][populate][engine_family]', 'true');
  searchParams.set('populate[special_versions][populate][engine]', 'true');
  searchParams.set('populate[articles]', 'true');

  const apiUrl = `${baseUrl}?${searchParams.toString()}`;

  const res = await fetch(apiUrl, { cache: 'no-store' });

  if (!res.ok) {
    // В случае ошибки покажем сообщение
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки данных' : 'Data loading error'}
        </h1>
        <p className="mt-2 text-gray-700">
          {lang === 'ru'
            ? `Не удалось загрузить поколение. Код ответа: ${res.status}`
            : `Failed to load generation. Status: ${res.status}`}
        </p>
      </div>
    );
  }

  const data = await res.json();
  const gen = data.data?.[0];

  if (!gen) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/${lang}/models`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}
        </a>
        <h1 className="text-2xl font-bold mt-4">
          {lang === 'ru' ? 'Поколение не найдено' : 'Generation not found'}
        </h1>
      </div>
    );
  }

  const startYear = gen.production_start?.substring(0, 4) || '...';
  const endYear = gen.production_end?.substring(0, 4) || '...';
  const parentSeries = gen.series;
  const relatedSections = getGenerationSections(gen, lang);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500 mb-4">
        <a href={`/${lang}/models`} className="text-blue-700 no-underline hover:underline">
          {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}
        </a>
        {parentSeries && (
          <>
            <span className="mx-2">/</span>
            <a href={`/${lang}/models/${parentSeries.slug}`} className="text-blue-700 no-underline hover:underline">
              {parentSeries.title}
            </a>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{gen.title}</span>
      </nav>

      <h1 className="text-4xl font-bold mt-2">BMW {gen.title}</h1>
      <p className="text-gray-600 mt-2 text-lg">
        {lang === 'ru' ? 'Годы выпуска' : 'Production years'}: {startYear}–{endYear}
      </p>

      <Tabs
        lang={lang}
        gen={gen}
        modifications={gen.modifications || []}
        specialVersions={gen.special_versions || []}
        modelCodes={[]}
      />

      <RelatedLinks sections={relatedSections} lang={lang} />
    </div>
  );
}