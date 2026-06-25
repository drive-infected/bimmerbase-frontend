'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation({ lang }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: `/${lang}/models`, ru: 'Модели', en: 'Models' },
    { href: `/${lang}/engines`, ru: 'Двигатели', en: 'Engines' },
    { href: `/${lang}/special-versions`, ru: 'Спецверсии', en: 'Special Versions' },
    { href: `/${lang}/options`, ru: 'Опции', en: 'Options' },
    { href: `/${lang}/trim-groups`, ru: 'Подборки', en: 'Collections' },
    { href: `/${lang}/articles`, ru: 'Статьи', en: 'Articles' },
  ];

  const isActive = (href) => {
    if (href === `/${lang}`) return pathname === href;
    return pathname.startsWith(href);
  };

  const linkClass = (href) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive(href)
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <nav className="max-w-7xl mx-auto px-4 pb-2">
      {/* Кнопка гамбургера для мобильных */}
      <div className="md:hidden flex justify-end">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
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

      {/* Десктопное меню */}
      <div className="hidden md:flex gap-1 overflow-x-auto">
        {links.map((link) => (
          <a key={link.href} href={link.href} className={linkClass(link.href) + ' whitespace-nowrap'}>
            {lang === 'ru' ? link.ru : link.en}
          </a>
        ))}
      </div>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div className="md:hidden mt-2 space-y-1 border-t pt-2">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={linkClass(link.href)} onClick={() => setMobileOpen(false)}>
              {lang === 'ru' ? link.ru : link.en}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}