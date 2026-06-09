import '../globals.css';
import UserMenu from './UserMenu';
import LanguageSwitcher from './LanguageSwitcher';

export const metadata = {
  title: 'BimmerBase',
  description: 'BMW knowledge base',
};

export default async function RootLayout({ children, params }) {
  const { lang } = await params;

  const t = {
    title: 'BimmerBase',
    models: lang === 'ru' ? 'Модели' : 'Models',
    engines: lang === 'ru' ? 'Двигатели' : 'Engines',
    specialVersions: lang === 'ru' ? 'Спецверсии' : 'Special Versions',
    options: lang === 'ru' ? 'Опции' : 'Options',
    trimGroups: lang === 'ru' ? 'Подборки' : 'Collections',
    knowledge: lang === 'ru' ? 'База знаний' : 'Knowledge Base',
    garage: lang === 'ru' ? 'Гараж' : 'Garage',
    search: lang === 'ru' ? 'Поиск' : 'Search',
    footer: lang === 'ru' ? 'BimmerBase © 2026' : 'BimmerBase © 2026',
};

  const navLinks = [
  { href: `/${lang}/models`, label: t.models },
  { href: `/${lang}/engines`, label: t.engines },
  { href: `/${lang}/special-versions`, label: t.specialVersions },
  { href: `/${lang}/options`, label: t.options },
  { href: `/${lang}/trim-groups`, label: t.trimGroups },
  { href: `/${lang}/articles`, label: t.knowledge },
];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href={`/${lang}`} className="text-white font-bold text-lg shrink-0 hover:text-blue-300 transition-colors no-underline">
            {t.title}
          </a>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex gap-5 text-sm flex-1 flex-wrap">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors no-underline">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
  <a href={`/${lang}/search`} className="text-gray-300 hover:text-white text-sm no-underline">
  {t.search} 🔍
</a>
  <a href={`/${lang}/garage`} className="text-gray-300 hover:text-white text-sm no-underline">
    {lang === 'ru' ? 'Гараж' : 'Garage'}
  </a>
  <UserMenu lang={lang} />
  <LanguageSwitcher currentLang={lang} />
</div>
        </div>

        {/* Мобильная навигация */}
        <nav className="md:hidden flex gap-3 overflow-x-auto px-4 pb-3 text-sm">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-gray-300 hover:text-white shrink-0 no-underline">
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-100 text-center py-6 text-sm text-gray-500 mt-auto">
        {t.footer}
      </footer>
    </div>
  );
}