'use client';

import { useState, useEffect, use } from 'react';

export default function CarPage({ params }) {
  const { lang, id } = use(params);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      window.location.href = `/${lang}/auth`;
      return;
    }
    fetchCar(jwt);
  }, []);

  const fetchCar = async (jwt) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-cars?filters[documentId][$eq]=${id}&populate=*`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setCar(data.data[0]);
      } else {
        setError(lang === 'ru' ? 'Автомобиль не найден' : 'Car not found');
      }
    } catch (err) {
      setError(lang === 'ru' ? 'Ошибка загрузки' : 'Loading error');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href={`/${lang}/garage`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Гараж' : 'Garage'}</a>
        <h1 className="text-2xl font-bold mt-4">{error}</h1>
      </div>
    );
  }

  const statusLabel = car.car_status === 'Owned'
    ? (lang === 'ru' ? 'Сейчас владею' : 'Currently own')
    : (lang === 'ru' ? 'Владел ранее' : 'Previously owned');

  const visibilityLabel = car.visibility === 'Public'
    ? (lang === 'ru' ? 'Видно всем' : 'Visible to everyone')
    : car.visibility === 'Visible for registered users'
      ? (lang === 'ru' ? 'Видно зарегистрированным' : 'Visible to registered users')
      : (lang === 'ru' ? 'Видно только мне' : 'Only visible to me');

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <a href={`/${lang}/garage`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Гараж' : 'Garage'}</a>

      <h1 className="text-3xl font-bold mt-4">
        {car.name || (lang === 'ru' ? 'Без названия' : 'Untitled')}
      </h1>

      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
        <span className={car.car_status === 'Owned' ? 'type-badge' : 'type-badge !bg-gray-200 !text-gray-600'}>{statusLabel}</span>
        <span>{visibilityLabel}</span>
      </div>

      <div className="mt-4">
        <a href={`/${lang}/garage/${id}/edit`} className="text-blue-700 text-sm no-underline hover:underline">
          ✏️ {lang === 'ru' ? 'Редактировать' : 'Edit'}
        </a>
      </div>

      {/* Информация об автомобиле */}
      <div className="mt-8">
        <h2 className="section-title">{lang === 'ru' ? 'Информация об автомобиле' : 'Vehicle Information'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {car.generation && (
            <div className="card !p-4">
              <span className="text-xs text-gray-500 block">{lang === 'ru' ? 'Поколение' : 'Generation'}</span>
              <a href={`/${lang}/models/${car.generation.series?.slug || 'bmw'}/${car.generation.slug}`} className="text-blue-700 font-semibold no-underline">{car.generation.title}</a>
            </div>
          )}
          {car.modification && (
            <div className="card !p-4">
              <span className="text-xs text-gray-500 block">{lang === 'ru' ? 'Модификация' : 'Modification'}</span>
              <span className="font-semibold">{car.modification.title}</span>
              <span className="text-sm text-gray-500 ml-1">({car.modification.power_hp} hp)</span>
            </div>
          )}
          {car.engine && (
            <div className="card !p-4">
              <span className="text-xs text-gray-500 block">{lang === 'ru' ? 'Двигатель' : 'Engine'}</span>
              {car.engine.engine_family?.slug ? (
                <a href={`/${lang}/engines/${car.engine.engine_family.slug}/${car.engine.slug}`} className="text-blue-700 font-semibold no-underline">
                  {car.engine.index}
                </a>
              ) : (
                <span className="font-semibold">{car.engine.index}</span>
              )}
              <span className="text-sm text-gray-500 ml-1">({car.engine.power_hp} hp)</span>
            </div>
          )}
          {car.transmission && (
            <div className="card !p-4">
              <span className="text-xs text-gray-500 block">{lang === 'ru' ? 'КПП' : 'Transmission'}</span>
              <span className="font-semibold">{car.transmission.title}</span>
              <span className="text-sm text-gray-500 ml-1">({car.transmission.type})</span>
            </div>
          )}
          {car.market && (
            <div className="card !p-4">
              <span className="text-xs text-gray-500 block">{lang === 'ru' ? 'Рынок' : 'Market'}</span>
              <span className="font-semibold">{car.market.title}</span>
            </div>
          )}
          {car.production_date && (
            <div className="card !p-4">
              <span className="text-xs text-gray-500 block">{lang === 'ru' ? 'Дата производства' : 'Production date'}</span>
              <span className="font-semibold">{car.production_date}</span>
            </div>
          )}
          {car.vin && (
            <div className="card !p-4">
              <span className="text-xs text-gray-500 block">VIN</span>
              <span className="font-semibold font-mono">{car.vin}</span>
            </div>
          )}
        </div>
      </div>

      {/* Заметки владельца */}
      {car.notes && (
        <div className="mt-10">
          <h2 className="section-title">{lang === 'ru' ? 'Заметки владельца' : "Owner's Notes"}</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap italic">
            {car.notes}
          </div>
        </div>
      )}

      {/* Журнал обслуживания */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title !mb-0">{lang === 'ru' ? 'Журнал обслуживания' : 'Service Log'}</h2>
          <span className="text-sm text-gray-400">{lang === 'ru' ? 'Скоро' : 'Coming soon'}</span>
        </div>
        <p className="text-gray-400 text-sm">{lang === 'ru' ? 'Записей пока нет.' : 'No records yet.'}</p>
      </div>
    </div>
  );
}