// app/[lang]/models/page.js
function getImageUrl(image) {
  if (!image) return null;
  return image.url || image.formats?.large?.url || image.formats?.medium?.url || image.formats?.small?.url || null;
}

function extractDescription(gen) {
  const blocks = gen.description;
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;
  const firstBlock = blocks[0];
  if (firstBlock.children) {
    return firstBlock.children.map(c => c.text || '').join('').trim();
  }
  return null;
}

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

  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('populate[image]', 'true');
  searchParams.set('populate[generations][populate][image]', 'true');
  searchParams.set('sort', 'title');

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/series?${searchParams.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки модельного ряда' : 'Failed to load model range'}
        </h1>
        <p className="text-sm text-gray-500">Status: {res.status}</p>
      </div>
    );
  }

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
          <div className="mb-6">
            <h2 className="section-title !mb-0">
              <a href={`/${lang}/models/${series.slug}`} className="text-blue-700 no-underline hover:underline">
                {series.title}
              </a>
            </h2>
          </div>

          {series.generations && series.generations.length > 0 ? (
            <div className="flex flex-col gap-4">
              {series.generations
                .filter((gen) => gen.locale === lang)
                .map((gen) => {
                  const imgUrl = getImageUrl(gen.image);
                  const desc = extractDescription(gen);
                  return (
                    <a
                      key={gen.id}
                      href={`/${lang}/models/${series.slug}/${gen.slug}`}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_280px] overflow-hidden border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
                    >
                      {/* Текст слева на десктопе (order-2 sm:order-1), на мобильных снизу */}
                      <div className="p-5 sm:p-6 order-2 sm:order-1">
                        <strong className="text-lg block group-hover:text-[#0066B1] transition-colors">
                          {gen.title}
                        </strong>
                        <p className="text-xs text-gray-500 mt-1">
                          {gen.production_start?.substring(0, 4)}–{gen.production_end?.substring(0, 4)}
                        </p>
                        {desc && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {desc}
                          </p>
                        )}
                      </div>

                      {/* Изображение справа на десктопе (order-1 sm:order-2), на мобильных сверху */}
                      <div className="h-48 sm:h-auto order-1 sm:order-2">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={gen.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            {lang === 'ru' ? 'Нет фото' : 'No img'}
                          </div>
                        )}
                      </div>
                    </a>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              {lang === 'ru' ? 'Нет поколений' : 'No generations'}
            </p>
          )}
        </div>
      ))}

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