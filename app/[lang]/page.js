// app/[lang]/page.js
// Главная страница BimmerBase: Hero, быстрая навигация, модельный ряд, последние статьи

export default async function Home({ params }) {
  const { lang } = await params;

  // Загружаем серии и последние статьи параллельно
  let series = [];
  let articles = [];

  try {
    const [seriesRes, articlesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/series?locale=${lang}&populate=*&sort=title`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles?locale=${lang}&populate=*&sort=published_date:desc&pagination[limit]=3`, { cache: 'no-store' })
    ]);

    const seriesData = await seriesRes.json();
    series = seriesData.data || [];

    const articlesData = await articlesRes.json();
    articles = articlesData.data || [];
  } catch (e) {
    console.error('Failed to load homepage data', e);
  }

  // Переводы
  const t = {
    heroTitle: 'BimmerBase',
    heroSubtitle: lang === 'ru'
      ? 'База знаний по классическим автомобилям BMW'
      : 'Knowledge base for classic BMW automobiles',
    heroDescription: lang === 'ru'
      ? 'Модели, двигатели, опции, руководства по ремонту и дооснащению — всё в одном месте.'
      : 'Models, engines, options, repair guides and retrofits — all in one place.',
    exploreModels: lang === 'ru' ? 'Модельный ряд' : 'Model Range',
    search: lang === 'ru' ? 'Поиск' : 'Search',
    quickNavTitle: lang === 'ru' ? 'Что вас интересует?' : 'What are you looking for?',
    models: lang === 'ru' ? 'Модели' : 'Models',
    modelsDesc: lang === 'ru' ? 'Выберите серию и поколение' : 'Choose a series and generation',
    engines: lang === 'ru' ? 'Двигатели' : 'Engines',
    enginesDesc: lang === 'ru' ? 'Каталог по семействам' : 'Catalog by families',
    knowledge: lang === 'ru' ? 'База знаний' : 'Knowledge Base',
    knowledgeDesc: lang === 'ru' ? 'Статьи по ремонту и обслуживанию' : 'Repair and maintenance articles',
    special: lang === 'ru' ? 'Спецверсии и опции' : 'Special Versions & Options',
    specialDesc: lang === 'ru' ? 'M-версии, Alpina, SA-коды' : 'M versions, Alpina, SA codes',
    modelRangeTitle: lang === 'ru' ? 'Модельный ряд' : 'Model Range',
    latestArticles: lang === 'ru' ? 'Последние статьи' : 'Latest Articles',
    readMore: lang === 'ru' ? 'Читать' : 'Read',
    generationsCount: (count) => lang === 'ru'
      ? `${count} ${decline(count, 'поколение', 'поколения', 'поколений')}`
      : `${count} generation${count !== 1 ? 's' : ''}`,
  };

  function decline(n, one, two, five) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return five;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return two;
    return five;
  }

  // Считаем поколения для каждой серии (только для текущей локали)
  const seriesWithCount = series.map(s => ({
    ...s,
    genCount: (s.generations || []).filter(g => g.locale === lang).length,
  }));

  return (
    <div>
      {/* Hero-секция */}
      <section
        className="hero-bg relative text-gray-900 md:pt-8 md:pb-96"
        style={{
          backgroundImage: 'url(/images/hero-bg.webp)',
          backgroundSize: '100% auto',
          backgroundRepeat: 'no-repeat',
          paddingTop: '0px',
          height: '200px',
        }}
      >
        <div
          className="max-w-5xl mx-auto px-4 text-center relative z-10 flex flex-col md:block"
          style={{
            height: '200px',
            paddingTop: '0px',
            paddingBottom: '0px',
          }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight md:mb-8">
            {t.heroTitle}
          </h1>
          <div className="flex-1 md:hidden" style={{ height: '100px' }}></div>
          <p className="text-lg md:text-xl text-gray-700 md:mt-0">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Быстрая навигация */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            {t.quickNavTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickLink
              href={`/${lang}/models`}
              icon={<NavIcon type="models" />}
              title={t.models}
              description={t.modelsDesc}
            />
            <QuickLink
              href={`/${lang}/engines`}
              icon={<NavIcon type="engines" />}
              title={t.engines}
              description={t.enginesDesc}
            />
            <QuickLink
              href={`/${lang}/articles`}
              icon={<NavIcon type="articles" />}
              title={t.knowledge}
              description={t.knowledgeDesc}
            />
            <QuickLink
              href={`/${lang}/special-versions`}
              icon={<NavIcon type="special" />}
              title={t.special}
              description={t.specialDesc}
            />
          </div>
        </div>
      </section>

      {/* Модельный ряд */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t.modelRangeTitle}</h2>
            <a href={`/${lang}/models`} className="text-blue-700 text-sm no-underline hover:underline">
              {lang === 'ru' ? 'Все модели' : 'All models'} →
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {seriesWithCount.map((s) => (
              <a
                key={s.documentId || s.id}
                href={`/${lang}/models/${s.slug}`}
                className="card-link text-center"
              >
                <span className="text-2xl font-bold block">{s.title}</span>
                <span className="text-sm text-gray-500 mt-1">
                  {t.generationsCount(s.genCount)}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Последние статьи */}
      {articles.length > 0 && (
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t.latestArticles}</h2>
              <a href={`/${lang}/articles`} className="text-blue-700 text-sm no-underline hover:underline">
                {lang === 'ru' ? 'Все статьи' : 'All articles'} →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {articles.map((article) => (
                <a
                  key={article.documentId || article.id}
                  href={`/${lang}/articles/${article.slug}`}
                  className="card-link"
                >
                  <span className="text-sm text-gray-500">
                    {article.published_date}
                  </span>
                  <h3 className="text-lg font-semibold mt-1 mb-2">{article.title}</h3>
                  {article.intro && (
                    <p className="text-sm text-gray-600 line-clamp-2">{article.intro}</p>
                  )}
                  <span className="text-blue-700 text-sm mt-2 inline-block">
                    {t.readMore} →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Компонент карточки быстрой навигации
function QuickLink({ href, icon, title, description }) {
  return (
    <a
      href={href}
      className="card-link flex flex-col items-center text-center py-4"
      style={{ minHeight: '130px', justifyContent: 'center' }}
    >
      <div className="flex items-center justify-center w-full mb-1">
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </a>
  );
}

// SVG-иконки для навигации
function NavIcon({ type }) {
  const icons = {
    models: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    engines: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    articles: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    special: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  };
  return icons[type] || null;
}