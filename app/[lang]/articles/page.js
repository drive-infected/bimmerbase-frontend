export default async function ArticlesPage({ params }) {
  const { lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/articles?locale=${lang}&populate=*&sort=published_date:desc`,
    { cache: 'no-store' }
  );
  const data = await res.json();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
      </h1>
      {data.data && data.data.length > 0 ? (
        <div className="flex flex-col gap-4">
          {data.data.map((article) => (
            <a key={article.id} href={`/${lang}/articles/${article.slug}`} className="card-link">
              <strong className="text-xl">{article.title}</strong>
              {article.intro && <p className="text-gray-600 mt-2">{article.intro}</p>}
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                {article.published_date && <span>{article.published_date}</span>}
                {article.difficulty && <span>{lang === 'ru' ? 'Сложность' : 'Difficulty'}: {article.difficulty}</span>}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          {lang === 'ru' ? 'Раздел наполняется.' : 'Section is being filled.'}
        </p>
      )}
    </div>
  );
}