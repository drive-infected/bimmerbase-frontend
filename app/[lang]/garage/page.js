'use client';

import { useState, useEffect, use } from 'react';

export default function GaragePage({ params }) {
  const { lang } = use(params);
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);

    if (jwt && userData) {
      fetchCars(jwt, userData);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCars = async (jwt, userData) => {
    try {
      const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/user-cars?populate=*`,
  { headers: { Authorization: `Bearer ${jwt}` } }
);
      const data = await res.json();
      setCars(data.data || []);
    } catch (err) {
      console.error('Failed to fetch cars:', err);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {lang === 'ru' ? 'Гараж' : 'Garage'}
        </h1>
        <p className="text-gray-500 mb-6">
          {lang === 'ru' ? 'Войдите, чтобы увидеть свой гараж.' : 'Login to see your garage.'}
        </p>
        <a href={`/${lang}/auth`} className="btn-primary inline-block no-underline">
          {lang === 'ru' ? 'Войти' : 'Login'}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {lang === 'ru' ? 'Мой гараж' : 'My Garage'}
        </h1>
        <a href={`/${lang}/garage/add`} className="btn-primary no-underline text-sm">
          + {lang === 'ru' ? 'Добавить авто' : 'Add car'}
        </a>
      </div>

      {loading && <p className="text-gray-500">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</p>}

      {!loading && cars.length === 0 && (
        <p className="text-gray-500">{lang === 'ru' ? 'У вас пока нет автомобилей.' : 'No cars yet.'}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cars.map((car) => (
          <a
            key={car.id}
            href={`/${lang}/garage/${car.documentId}`}
            className="card-link"
          >
            <strong className="text-xl block">{car.name || (car.series?.title ? `BMW ${car.series.title}` : '—')}</strong>
            <div className="text-sm text-gray-500 mt-2 space-y-1">
              {car.production_date && <div>{lang === 'ru' ? 'Дата выпуска' : 'Production date'}: {car.production_date}</div>}
              {car.series && <div>{car.series.title}</div>}
              {car.engine && <div>{car.engine.index} • {car.engine.power_hp} hp</div>}
              {car.car_status && (
  <div className={car.car_status === 'Owned' ? 'text-blue-700' : 'text-gray-500'}>
    {car.car_status === 'Owned'
      ? (lang === 'ru' ? 'Сейчас владею' : 'Currently own')
      : (lang === 'ru' ? 'Владел ранее' : 'Previously owned')}
  </div>
)}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}