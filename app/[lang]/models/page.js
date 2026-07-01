// app/[lang]/models/page.js
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';
  const title = lang === 'ru' ? 'Модельный ряд BMW – BimmerBase' : 'BMW Model Range – BimmerBase';
  const description = lang === 'ru'
    ? 'Все серии BMW с поколениями, техническими характеристиками и историей. Выберите интересующую модель.'
    : 'All BMW series with generations, specifications and history. Choose your model.';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}/models`,
      languages: {
        en: `${siteUrl}/en/models`,
        ru: `${siteUrl}/ru/models`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}/models`,
      siteName: 'BimmerBase',
      type: 'website',
      images: [`${siteUrl}/images/og-default.jpg`],
    },
  };
}

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
        <div key={series.id} className="mb-12">
          {/* Заголовок серии с обложкой */}
          <div className="flex items-center gap-4 mb-6">
            {series.image?.url ? (
              <img
                src={series.image.url}
                alt={series.title}
                className="w-16 h-16 object-contain rounded-lg"
              />
            ) : null}
            <h2 className="section-title !mb-0">
              <a href={`/${lang}/models/${series.slug}`} className="text-blue-700 no-underline hover:underline">
                {series.title}
              </a>
            </h2>
          </div>

          {/* Поколения */}
          {series.generations && series.generations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {series.generations
                .filter((gen) => gen.locale === lang)
                .map((gen) => (
                  <a
                    key={gen.id}
                    href={`/${lang}/models/${series.slug}/${gen.slug}`}
                    className="card-link flex gap-4 items-start"
                  >
                    {gen.image?.url ? (
                      <img
                        src={gen.image.url}
                        alt={gen.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                        {lang === 'ru' ? 'Нет фото' : 'No img'}
                      </div>
                    )}
                    <div>
                      <strong className="text-xl block">{gen.title}</strong>
                      <p className="text-sm text-gray-500 mt-1">
                        {gen.production_start?.substring(0, 4)}–{gen.production_end?.substring(0, 4)}
                      </p>
                    </div>
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

      {/* JSON-LD ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: (data.data || []).map((series, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'CarModel',
                name: series.title,
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/${lang}/models/${series.slug}`,
              },
            })),
          }),
        }}
      />
    </div>
  );
}