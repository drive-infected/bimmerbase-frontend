'use client';

import { useState, useEffect } from 'react';

export default function UserMenu({ lang }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);
  }, []);

  if (!mounted) {
    return <span className="text-gray-300 text-sm">...</span>;
  }

  if (!user) {
    return (
      <a href={`/${lang}/auth`} className="text-gray-300 hover:text-white text-sm no-underline">
        {lang === 'ru' ? 'Вход' : 'Login'}
      </a>
    );
  }

  return (
    <a href={`/${lang}/profile`} className="text-gray-300 hover:text-white text-sm no-underline">
      {user.username}
    </a>
  );
}