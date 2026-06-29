// app/[lang]/articles/page.js
export default async function ArticlesPage({ params, searchParams }) {
  const { lang } = await params;
  const { category } = searchParams;

  // Загружаем список категорий
  let categories = [];
  try {
    const catRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/article-categories`,
      { cache: 'no-store' }
    );
    const catData = await catRes.json();
    categories = catData.data || [];
  } catch {}

  // URL для фильтрации статей
  const apiUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/articles`);
  apiUrl.searchParams.set('locale', lang);
  apiUrl.searchParams.set('sort', 'published_date:desc');
  if (category) {
    apiUrl.searchParams.set('filters[category][slug][$eq]', category);
  }
  apiUrl.searchParams.set('populate[category]', 'true');

  let articles = [];
  try {
    const res = await fetch(apiUrl.toString(), { cache: 'no-store' });
    const data = await res.json();
    articles = data.data || [];
  } catch {}

  // Словари
  const categoryTranslations = {
    ru: {
      'Diagnostics & Repair': 'Диагностика и ремонт',
      'History': 'История',
      'Maintenance': 'Обслуживание',
      'Motorsport': 'Автоспорт',
      'Retrofit': 'Доработка',
    },
  };
  function translateCategory(title) {
    if (lang === 'ru' && categoryTranslations.ru[title]) return categoryTranslations.ru[title];
    return title;
  }

  function translateDifficulty(difficulty) {
    if (lang === 'ru') {
      if (difficulty === 'Easy') return 'Лёгкая';
      if (difficulty === 'Medium') return 'Средняя';
      if (difficulty === 'Hard') return 'Сложная';
    }
    return difficulty;
  }

  const currentCategory = categories.find(cat => cat.slug === category);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
      </h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href={`/${lang}/articles`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !category
              ? 'bg-[#0066B1] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {lang === 'ru' ? 'Все' : 'All'}
        </a>
        {categories.map(cat => (
          <a
            key={cat.slug}
            href={`/${lang}/articles?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat.slug
                ? 'bg-[#0066B1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {translateCategory(cat.title)}
          </a>
        ))}
      </div>

      {currentCategory && (
        <p className="text-sm text-gray-500 mb-6">
          {lang === 'ru' ? 'Категория' : 'Category'}: {translateCategory(currentCategory.title)}
        </p>
      )}

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => (
            <a
              key={article.id}
              href={`/${lang}/articles/${article.slug}`}
              className="card-link flex flex-col justify-between"
            >
              <div>
                <span className="card-title text-lg">{article.title}</span>
                {article.intro && (
                  <p className="card-text mt-2 text-sm line-clamp-3">{article.intro}</p>
                )}
              </div>
              <div className="flex gap-3 mt-3 text-xs text-gray-400">
                {article.published_date && <span>{article.published_date}</span>}
                {article.difficulty && (
                  <span>{translateDifficulty(article.difficulty)}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          {lang === 'ru' ? 'Статьи не найдены.' : 'No articles found.'}
        </p>
      )}
    </div>
  );
}