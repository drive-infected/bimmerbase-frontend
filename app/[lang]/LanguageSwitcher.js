'use client';

import { usePathname } from 'next/navigation';

export default function LanguageSwitcher({ currentLang }) {
  const pathname = usePathname();
  const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '') || '/';
  const targetLang = currentLang === 'ru' ? 'en' : 'ru';

  return (
    <a
      href={`/${targetLang}${pathWithoutLang}`}
      className="text-sm text-gray-500 hover:text-blue-700 no-underline transition-colors"
      title={targetLang === 'ru' ? 'Русский' : 'English'}
    >
      {targetLang.toUpperCase()}
    </a>
  );
}