'use client';

import { useState, useEffect, use } from 'react';

export default function ProfilePage({ params }) {
  const { lang } = use(params);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carsCount, setCarsCount] = useState(0);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    const userData = JSON.parse(localStorage.getItem('user') || 'null');

    if (!jwt || !userData) {
      window.location.href = `/${lang}/auth`;
      return;
    }

    setUser(userData);
    fetchCarsCount(jwt);
    setLoading(false);
  }, []);

  const fetchCarsCount = async (jwt) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-cars`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      const data = await res.json();
      setCarsCount(data.data?.length || 0);
    } catch (err) {
      // silently fail
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = `/${lang}`;
  };

  const getTimeLabel = (dateString) => {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;

  if (lang === 'ru') {
    let parts = [];
    if (years > 0) parts.push(decline(years, 'год', 'года', 'лет'));
    if (months > 0) parts.push(decline(months, 'месяц', 'месяца', 'месяцев'));
    if (days > 0 || parts.length === 0) parts.push(decline(days, 'день', 'дня', 'дней'));
    return parts.join(' ') + ' на сайте';
  } else {
    let parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    return parts.join(' ') + ' on site';
  }
};

  const decline = (n, one, two, five) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return five;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return two;
    return five;
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'ru' ? 'Профиль' : 'Profile'}
      </h1>

      {/* Информация о пользователе */}
      <div className="card space-y-3 mb-6">
        <div>
          <span className="text-xs text-gray-500 block">{lang === 'ru' ? 'Имя пользователя' : 'Username'}</span>
          <span className="font-semibold text-lg">{user?.username}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">Email</span>
          <span className="font-semibold text-lg">{user?.email}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">{lang === 'ru' ? 'Дата регистрации' : 'Registered'}</span>
          <span className="text-sm text-gray-600">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          </span>
        </div>
      </div>

                  {/* Статистика */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-blue-700">{carsCount}</span>
          <span className="text-sm text-gray-500 mt-2 text-center">
            {lang === 'ru'
              ? decline(carsCount, 'автомобиль', 'автомобиля', 'автомобилей')
              : `car${carsCount !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="card flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-blue-700">
            {user?.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : '—'}
          </span>
          <span className="text-sm text-gray-500 mt-2 text-center">
            {user?.createdAt ? getTimeLabel(user.createdAt) : '—'}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <a href={`/${lang}/garage`} className="btn-primary no-underline">
          {lang === 'ru' ? 'Мой гараж' : 'My Garage'}
        </a>
        <button onClick={handleLogout} className="px-6 py-3 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors">
          {lang === 'ru' ? 'Выйти' : 'Logout'}
        </button>
      </div>
    </div>
  );
}