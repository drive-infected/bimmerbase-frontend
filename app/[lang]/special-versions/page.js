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
    `${process.env.NEXT_PUBLIC_API_URL}/api/special-version-categories?populate=image&sort=title`,
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
            className="card-link flex gap-6 items-center hover:bg-gray-50 transition-colors"
          >
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {cat.image?.url ? (
                <img src={cat.image.url} alt={cat.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{cat.title}</h2>
              {cat.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
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