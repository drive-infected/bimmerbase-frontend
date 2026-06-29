import Tabs from './tabs';
import RelatedLinks from '@/components/RelatedLinks';
import { getGenerationSections } from '@/lib/relatedLinks';

export default async function GenerationPage({ params }) {
  const { series, generation, lang } = await params;

  // Один запрос с глубокой популяцией ВСЕХ нужных связей
  const populateQuery = [
    'series',                         // родительская серия
    'modifications.engines',          // модификации + их двигатели
    'engines.engine_family',          // двигатели + их семейства (для перелинковки)
    'special_versions.engine',        // спецверсии + их двигатель
    'articles',                       // статьи (заголовок, intro)
  ].map(p => `populate[${p}]=true`).join('&');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/generations?locale=${lang}&filters[slug][$eq]=${generation}&${populateQuery}`,
    { cache: 'no-store' }
  );
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

  // Формируем секции перелинковки
  const relatedSections = getGenerationSections(gen, lang);

  // Модификации и спецверсии уже лежат в gen благодаря populate,
  // поэтому можем передать их прямо в Tabs без отдельных запросов.
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

      {/* Вкладки с информацией */}
      <Tabs
        lang={lang}
        gen={gen}
        modifications={gen.modifications || []}
        specialVersions={gen.special_versions || []}
        modelCodes={[]} // если нужны коды моделей, их всё равно придётся подгружать отдельно или добавить в populate
      />

      {/* НОВЫЙ БЛОК ПЕРЕЛИНКОВКИ */}
      <RelatedLinks sections={relatedSections} lang={lang} />
    </div>
  );
}