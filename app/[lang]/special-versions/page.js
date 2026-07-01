// app/[lang]/special-versions/page.js
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const title = lang === 'ru' ? 'Спецверсии BMW – BimmerBase' : 'BMW Special Versions – BimmerBase';
  const description = lang === 'ru'
    ? 'Каталог специальных версий BMW по категориям: M, Alpina, Limited Edition и другие.'
    : 'Catalog of BMW special versions by categories: M, Alpina, Limited Edition and more.';

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/${lang}/special-versions`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/en/special-versions`,
        ru: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/ru/special-versions`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/${lang}/special-versions`,
      siteName: 'BimmerBase',
      type: 'website',
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/images/og-default.jpg`],
    },
  };
}

export default async function SpecialVersionsPage({ params }) {
  const { lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/special-version-categories?locale=${lang}&populate=image&sort=title`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const categories = data.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'ru' ? 'Специальные версии' : 'Special Versions'}
      </h1>

      {categories.length === 0 && (
        <p className="text-gray-500">{lang === 'ru' ? 'Раздел наполняется.' : 'Section is being filled.'}</p>
      )}

      <div className="flex flex-col gap-6">
        {categories.map(cat => (
          <a
            key={cat.id}
            href={`/${lang}/special-versions/${cat.slug}`}
            className="card-link flex flex-col sm:flex-row-reverse overflow-hidden group"
          >
            {/* Изображение справа, во всю высоту */}
            <div className="sm:w-1/3 h-48 sm:h-auto flex-shrink-0">
              <div className="w-full h-full bg-gray-100 rounded-lg sm:rounded-l-none sm:rounded-r-lg overflow-hidden">
                {cat.image?.url ? (
                  <img
                    src={cat.image.url}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Текст слева */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
              <h2 className="text-xl font-semibold group-hover:text-[#0066B1] transition-colors">
                {cat.title}
              </h2>
              {cat.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {cat.description.replace(/<[^>]+>/g, '')}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}