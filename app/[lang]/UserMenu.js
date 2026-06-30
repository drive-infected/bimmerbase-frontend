// app/UserMenu.js
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
    return <span className="text-sm text-gray-400">...</span>;
  }

  if (!user) {
    return (
      <a
        href={`/${lang}/auth`}
        className="text-sm text-gray-600 hover:text-[#0066B1] no-underline transition-colors"
      >
        {lang === 'ru' ? 'Вход' : 'Login'}
      </a>
    );
  }

  return (
    <a
      href={`/${lang}/profile`}
      className="text-sm text-gray-600 hover:text-[#0066B1] no-underline transition-colors"
    >
      {user.username}
    </a>
  );
}