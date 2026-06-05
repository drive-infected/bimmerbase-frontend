import { NextResponse } from 'next/server';

const supportedLocales = ['ru', 'en'];
const defaultLocale = 'ru';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Пропускаем API-запросы и статические файлы
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Проверяем, есть ли локаль в URL
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Перенаправляем на URL с локалью
    const locale = defaultLocale;
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};