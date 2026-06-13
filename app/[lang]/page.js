export default async function Home({ params }) {
  const { lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/series?locale=${lang}&populate=*&sort=title`,
    { cache: 'no-store' }
  );
  const data = await res.json();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">
  BimmerBase
</h1>
<p className="text-gray-600 text-lg mb-10 max-w-2xl">
  {lang === 'ru'
    ? 'База знаний по классическим моделям BMW: двигатели, опции, ремонт и дооснащение.'
    : 'BMW knowledge base: models, engines, options, repair and retrofit.'}
</p>

      <h2 className="section-title">
        {lang === 'ru' ? 'Модельный ряд' : 'Model Range'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data && data.data.map((series) => (
          <a
            key={series.id}
            href={`/${lang}/models/${series.slug}`}
            className="card-link text-center"
          >
            <strong className="text-2xl block">{series.title}</strong>
            {series.generations && (
              <p className="text-gray-500 text-sm mt-2">
                {series.generations.filter(g => g.locale === lang).length} {lang === 'ru' ? 'поколений' : 'generations'}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}