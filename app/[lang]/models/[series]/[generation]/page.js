import Tabs from './tabs';

export default async function GenerationPage({ params }) {
  const { series, generation, lang } = await params;

  const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/generations?locale=${lang}&filters[slug][$eq]=${generation}&populate=*`,
  { cache: 'no-store' }
);
  const data = await res.json();
  const gen = data.data?.[0];

  let modifications = [];
  if (gen) {
    try {
      const modRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/modifications?filters[generation][documentId][$eq]=${gen.documentId}&populate=engines`,
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

  let modelCodes = [];
  if (gen) {
    try {
      let page = 1;
      let allCodes = [];
      while (true) {
        const codesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/model-codes?filters[generation][documentId][$eq]=${gen.documentId}&populate=*&pagination[pageSize]=100&pagination[page]=${page}`,
          { cache: 'no-store' }
        );
        const codesData = await codesRes.json();
        const pageData = codesData.data || [];
        allCodes = allCodes.concat(pageData);
        if (pageData.length < 100) break;
        page++;
      }
      modelCodes = allCodes.sort((a, b) => (a.id || 0) - (b.id || 0));
    } catch (e) {
      // silently fail
    }
  }

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

  const startYear = gen.production_start ? String(gen.production_start).substring(0, 4) : '...';
  const endYear = gen.production_end ? String(gen.production_end).substring(0, 4) : '...';
  const parentSeries = gen.series;

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

      <Tabs lang={lang} gen={gen} modifications={modifications} modelCodes={modelCodes} />
    </div>
  );
}