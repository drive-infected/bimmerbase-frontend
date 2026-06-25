import '../globals.css';
import Header from './Header';

export const metadata = {
  title: 'BimmerBase',
  description: 'База знаний по классическим автомобилям BMW',
};

export default async function RootLayout({ children, params }) {
  const { lang } = await params;

  const t = {
    footer: lang === 'ru' ? 'BimmerBase © 2026' : 'BimmerBase © 2026',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={lang} />

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
            <a href={`/${lang}/models`} className="hover:text-[#0066B1] no-underline transition-colors">
              {lang === 'ru' ? 'Модели' : 'Models'}
            </a>
            <a href={`/${lang}/engines`} className="hover:text-[#0066B1] no-underline transition-colors">
              {lang === 'ru' ? 'Двигатели' : 'Engines'}
            </a>
            <a href={`/${lang}/articles`} className="hover:text-[#0066B1] no-underline transition-colors">
              {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
            </a>
            <a href={`/${lang}/special-versions`} className="hover:text-[#0066B1] no-underline transition-colors">
              {lang === 'ru' ? 'Спецверсии' : 'Special Versions'}
            </a>
            <a href={`/${lang}/options`} className="hover:text-[#0066B1] no-underline transition-colors">
              {lang === 'ru' ? 'Опции' : 'Options'}
            </a>
            <a href={`/${lang}/search`} className="hover:text-[#0066B1] no-underline transition-colors">
              {lang === 'ru' ? 'Поиск' : 'Search'}
            </a>
          </div>

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