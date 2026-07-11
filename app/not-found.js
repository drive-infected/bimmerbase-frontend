// app/not-found.jsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-500 mb-8">
          {typeof window !== 'undefined' && window.location.pathname.includes('/ru') 
            ? 'Страница не найдена' 
            : 'Page not found'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-primary no-underline">Главная</Link>
          <Link href="/models" className="btn-primary no-underline">Модели</Link>
          <Link href="/engines" className="btn-primary no-underline">Двигатели</Link>
        </div>
      </div>
    </div>
  );
}