'use client';

import { usePathname } from 'next/navigation';

export default function LanguageSwitcher({ currentLang }) {
  const pathname = usePathname();
  const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '') || '/';
  const targetLang = currentLang === 'ru' ? 'en' : 'ru';

  return (
    <div className="flex items-center gap-2 text-sm">
      {currentLang === 'ru' ? (
        <>
          <span className="text-white font-bold">RU</span>
          <span className="text-gray-600">|</span>
          <a href={`/en${pathWithoutLang}`} className="text-gray-400 hover:text-white no-underline">EN</a>
        </>
      ) : (
        <>
          <a href={`/ru${pathWithoutLang}`} className="text-gray-400 hover:text-white no-underline">RU</a>
          <span className="text-gray-600">|</span>
          <span className="text-white font-bold">EN</span>
        </>
      )}
    </div>
  );
}