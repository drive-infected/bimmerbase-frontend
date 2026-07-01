// app/[lang]/special-versions/page.js
import OptimizedImage from '@/components/OptimizedImage';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru';
  const title = lang === 'ru' ? 'Спецверсии BMW – BimmerBase' : 'BMW Special Versions – BimmerBase';
  const description = lang === 'ru'
    ? 'Каталог специальных версий BMW по категориям: M, Alpina, Limited Edition и другие.'
    : 'Catalog of BMW special versions by categories: M, Alpina, Limited Edition and more.';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${lang}/special-versions`,
      languages: {
        en: `${siteUrl}/en/special-versions`,
        ru: `${siteUrl}/ru/special-versions`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${lang}/special-versions`,
      siteName: 'BimmerBase',
      type: 'website',
      images: [`${siteUrl}/images/og-default.jpg`],
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
            className="grid grid-cols-1 sm:grid-cols-[1fr_280px] overflow-hidden border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
          >
            <div className="p-5 sm:p-6 order-2 sm:order-1">
              <h2 className="text-xl font-semibold group-hover:text-[#0066B1] transition-colors">
                {cat.title}
              </h2>
              {cat.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {cat.description.replace(/<[^>]+>/g, '')}
                </p>
              )}
            </div>

            <div className="h-48 sm:h-auto order-1 sm:order-2 bg-gray-100">
              <OptimizedImage
                image={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 280px"
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}