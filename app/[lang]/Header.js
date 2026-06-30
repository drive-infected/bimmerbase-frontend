'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu'; // импорт компонента

export default function Header({ lang }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: `/${lang}/models`, ru: 'Модели', en: 'Models' },
    { href: `/${lang}/engines`, ru: 'Двигатели', en: 'Engines' },
    { href: `/${lang}/special-versions`, ru: 'Спецверсии', en: 'Special Versions' },
    { href: `/${lang}/options`, ru: 'Опции', en: 'Options' },
    { href: `/${lang}/trim-groups`, ru: 'Подборки', en: 'Collections' },
    { href: `/${lang}/articles`, ru: 'Статьи', en: 'Articles' },
  ];

  const isActive = (href) => pathname.startsWith(href);

  const linkClass = (href) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive(href)
        ? 'bg-[#0066B1] text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <a href={`/${lang}`} className="text-xl font-bold text-gray-900 no-underline shrink-0">
          BimmerBase
        </a>

        {/* Поиск (десктоп) */}
        <form action={`/${lang}/search`} method="get" className="flex-1 max-w-md mx-auto hidden sm:block">
          <div className="relative">
            <input type="text" name="q"
              placeholder={lang === 'ru' ? 'Поиск по сайту...' : 'Search the site...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0066B1] focus:ring-1 focus:ring-[#0066B1] transition-colors"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0066B1]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Правая группа */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {/* Мобильная иконка поиска */}
          <a href={`/${lang}/search`} className="sm:hidden text-gray-600 hover:text-[#0066B1] transition-colors" title={lang === 'ru' ? 'Поиск' : 'Search'}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </a>

          {/* Вход / Профиль */}
          <UserMenu lang={lang} />

          <LanguageSwitcher currentLang={lang} />

          {/* Бургер-меню */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Десктопная навигация */}
      <nav className="hidden md:block max-w-7xl mx-auto px-4 pb-2">
        <div className="flex gap-1 overflow-x-auto">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={linkClass(link.href) + ' whitespace-nowrap'}>
              {lang === 'ru' ? link.ru : link.en}
            </a>
          ))}
        </div>
      </nav>

      {/* Мобильное меню */}
      {mobileOpen && (
        <nav className="md:hidden max-w-7xl mx-auto px-4 pb-2 border-t pt-2">
          <div className="space-y-1">
            {links.map((link) => (
              <a key={link.href} href={link.href} className={linkClass(link.href)} onClick={() => setMobileOpen(false)}>
                {lang === 'ru' ? link.ru : link.en}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}