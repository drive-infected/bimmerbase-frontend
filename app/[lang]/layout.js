import '../globals.css';
import LanguageSwitcher from './LanguageSwitcher';
import Navigation from './Navigation';

export const metadata = {
  title: 'BimmerBase',
  description: 'База знаний по классическим автомобилям BMW',
};

export default async function RootLayout({ children, params }) {
  const { lang } = await params;

  const t = {
    title: 'BimmerBase',
    search: lang === 'ru' ? 'Поиск' : 'Search',
    searchPlaceholder: lang === 'ru' ? 'Поиск по сайту...' : 'Search the site...',
    login: lang === 'ru' ? 'Вход' : 'Login',
    footer: lang === 'ru' ? 'BimmerBase © 2026' : 'BimmerBase © 2026',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* Верхний ряд: логотип, поиск, вход, язык */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Логотип */}
          <a href={`/${lang}`} className="text-xl font-bold text-gray-900 no-underline shrink-0">
            {t.title}
          </a>

          {/* Поиск */}
          <form
            action={`/${lang}/search`}
            method="get"
            className="flex-1 max-w-md mx-auto hidden sm:block"
          >
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Правая группа */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            {/* Иконка поиска для мобильных */}
            <a
              href={`/${lang}/search`}
              className="sm:hidden text-gray-600 hover:text-blue-700 transition-colors"
              title={t.search}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </a>
            <a
              href={`/${lang}/auth`}
              className="text-sm text-gray-600 hover:text-blue-700 no-underline transition-colors"
            >
              {t.login}
            </a>
            <LanguageSwitcher currentLang={lang} />
          </div>
        </div>

        {/* Нижний ряд: навигация */}
        <Navigation lang={lang} />
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Навигация по разделам */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
            <a href={`/${lang}/models`} className="hover:text-blue-700 no-underline transition-colors">
              {lang === 'ru' ? 'Модели' : 'Models'}
            </a>
            <a href={`/${lang}/engines`} className="hover:text-blue-700 no-underline transition-colors">
              {lang === 'ru' ? 'Двигатели' : 'Engines'}
            </a>
            <a href={`/${lang}/articles`} className="hover:text-blue-700 no-underline transition-colors">
              {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
            </a>
            <a href={`/${lang}/special-versions`} className="hover:text-blue-700 no-underline transition-colors">
              {lang === 'ru' ? 'Спецверсии' : 'Special Versions'}
            </a>
            <a href={`/${lang}/options`} className="hover:text-blue-700 no-underline transition-colors">
              {lang === 'ru' ? 'Опции' : 'Options'}
            </a>
            <a href={`/${lang}/search`} className="hover:text-blue-700 no-underline transition-colors">
              {lang === 'ru' ? 'Поиск' : 'Search'}
            </a>
          </div>

          {/* Копирайт и дисклеймер */}
          <div className="text-center text-xs text-gray-400">
            <p>{t.footer}</p>
            <p className="mt-1">
              {lang === 'ru'
                ? 'Неофициальный проект. Все права на товарные знаки принадлежат BMW AG.'
                : 'Unofficial project. All trademark rights belong to BMW AG.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}