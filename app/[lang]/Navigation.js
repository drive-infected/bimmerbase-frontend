'use client';

import { usePathname } from 'next/navigation';

export default function Navigation({ lang }) {
  const pathname = usePathname();

  const links = [
    { href: `/${lang}/models`, ru: 'Модели', en: 'Models' },
    { href: `/${lang}/engines`, ru: 'Двигатели', en: 'Engines' },
    { href: `/${lang}/articles`, ru: 'База знаний', en: 'Knowledge Base' },
    { href: `/${lang}/special-versions`, ru: 'Спецверсии', en: 'Special Versions' },
    { href: `/${lang}/options`, ru: 'Опции', en: 'Options' },
    { href: `/${lang}/trim-groups`, ru: 'Подборки', en: 'Collections' },
  ];

  const isActive = (href) => {
    if (href === `/${lang}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="max-w-7xl mx-auto px-4 pb-2 overflow-x-auto">
      <div className="flex gap-1 text-sm">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-md whitespace-nowrap no-underline transition-colors ${
              isActive(link.href)
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {lang === 'ru' ? link.ru : link.en}
          </a>
        ))}
      </div>
    </nav>
  );
}