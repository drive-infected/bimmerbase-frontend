import Tabs from './Tabs';

export default async function GenerationPage({ params }) {
  const { series, generation, lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/generations?locale=${lang}&filters[slug][$eq]=${generation}&populate=*`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const gen = data.data?.[0];

  // Загружаем модификации отдельно (без локали)
  let modifications = [];
  if (gen) {
    try {
      const modRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/modifications?filters[generation][documentId][$eq]=${gen.documentId}&populate=*`,
        { cache: 'no-store' }
      );
      const modData = await modRes.json();
      modifications = (modData.data || []).sort((a, b) => {
        if (a.lci !== b.lci) return a.lci === 'LCI' ? 1 : -1;
        return (a.title || '').localeCompare(b.title || '');
      });
    } catch (e) {
      // silently fail
    }
  }

  // Загружаем коды моделей
  let modelCodes = [];
  if (gen) {
    try {
      const codesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/model-codes?filters[generation][documentId][$eq]=${gen.documentId}&populate=*`,
        { cache: 'no-store' }
      );
      const codesData = await codesRes.json();
      modelCodes = (codesData.data || []).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    } catch (e) {
      // silently fail
    }
  }

  if (!gen) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/${lang}/models`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}</a>
        <h1 className="text-2xl mt-4">{lang === 'ru' ? 'Поколение не найдено' : 'Generation not found'}</h1>
      </div>
    );
  }

  const startYear = gen.production_start ? String(gen.production_start).substring(0, 4) : '...';
  const endYear = gen.production_end ? String(gen.production_end).substring(0, 4) : '...';
  const parentSeries = gen.series;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <a href={`/${lang}/models`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}</a>
      {parentSeries && <span className="text-gray-400 mx-2">/</span>}
      {parentSeries && <a href={`/${lang}/models/${parentSeries.slug}`} className="text-blue-700 no-underline">{parentSeries.title}</a>}

      <h1 className="text-4xl font-bold mt-4">BMW {gen.title}</h1>
      <p className="text-gray-600 mt-2 text-lg">
        {lang === 'ru' ? 'Годы выпуска' : 'Production years'}: {startYear}–{endYear}
      </p>

      <Tabs lang={lang} gen={gen} modifications={modifications} modelCodes={modelCodes} />
    </div>
  );
}