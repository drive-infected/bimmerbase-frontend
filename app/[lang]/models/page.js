export default async function ModelsPage({ params }) {
  const { lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/series?locale=${lang}&populate=*&sort=title`,
    { cache: 'no-store' }
  );
  const data = await res.json();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'ru' ? 'Модельный ряд BMW' : 'BMW Model Range'}
      </h1>

      {(!data.data || data.data.length === 0) && (
        <p className="text-gray-500">{lang === 'ru' ? 'Раздел наполняется.' : 'Section is being filled.'}</p>
      )}

      {data.data && data.data.map((series) => (
        <div key={series.id} className="mb-10">
          <h2 className="section-title">
            <a href={`/${lang}/models/${series.slug}`} className="text-blue-700 no-underline hover:underline">
              {series.title}
            </a>
          </h2>
          {series.generations && series.generations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {series.generations
                .filter((gen) => gen.locale === lang)
                .map((gen) => (
                  <a
                    key={gen.id}
                    href={`/${lang}/models/${series.slug}/${gen.slug}`}
                    className="card-link"
                  >
                    <strong className="text-xl block">{gen.title}</strong>
                    <p className="text-sm text-gray-500 mt-2">
                      {gen.production_start?.substring(0, 4)}–{gen.production_end?.substring(0, 4)}
                    </p>
                  </a>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              {lang === 'ru' ? 'Нет поколений' : 'No generations'}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}