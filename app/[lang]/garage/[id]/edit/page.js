'use client';

import { useState, useEffect, use } from 'react';

export default function EditCarPage({ params }) {
  const { lang, id } = use(params);
  const [user, setUser] = useState(null);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [name, setName] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [vin, setVin] = useState('');
  const [carStatus, setCarStatus] = useState('Owned');
  const [visibility, setVisibility] = useState('Public');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);

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
        const c = data.data[0];
        setCar(c);
        setName(c.name || '');
        setProductionDate(c.production_date || '');
        setVin(c.vin || '');
        setCarStatus(c.car_status || 'Owned');
        setVisibility(c.visibility || 'Public');
        setNotes(c.notes || '');
      } else {
        setMessage(lang === 'ru' ? 'Автомобиль не найден' : 'Car not found');
      }
    } catch (err) {
      setMessage(lang === 'ru' ? 'Ошибка загрузки' : 'Loading error');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const jwt = localStorage.getItem('jwt');

    const body = {
      data: {
        name,
        production_date: productionDate || null,
        vin: vin || null,
        car_status: carStatus,
        visibility,
        notes: notes || null,
      },
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        window.location.href = `/${lang}/garage/${id}`;
      } else {
        const err = await res.json();
        setMessage(err.error?.message || 'Error');
      }
    } catch (err) {
      setMessage(lang === 'ru' ? 'Ошибка соединения' : 'Connection error');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href={`/${lang}/garage`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Гараж' : 'Garage'}</a>
        <h1 className="text-2xl font-bold mt-4">{message}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <a href={`/${lang}/garage/${id}`} className="text-blue-700 no-underline">
        ← {lang === 'ru' ? 'Назад к автомобилю' : 'Back to car'}
      </a>
      <h1 className="text-2xl font-bold mt-4 mb-6">
        {lang === 'ru' ? 'Редактировать автомобиль' : 'Edit Car'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder={lang === 'ru' ? 'Название' : 'Name'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700"
        />

        <input
          type="date"
          value={productionDate}
          onChange={(e) => setProductionDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700"
        />

        <input
          type="text"
          placeholder="VIN (последние 7 символов)"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          maxLength={7}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700"
        />

        <select value={carStatus} onChange={(e) => setCarStatus(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700">
          <option value="Owned">{lang === 'ru' ? 'Сейчас владею' : 'Currently own'}</option>
          <option value="Sold">{lang === 'ru' ? 'Владел ранее' : 'Previously owned'}</option>
        </select>

        <select value={visibility} onChange={(e) => setVisibility(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700">
          <option value="Public">{lang === 'ru' ? 'Видно всем' : 'Visible to everyone'}</option>
          <option value="Visible for registered users">{lang === 'ru' ? 'Видно зарегистрированным пользователям' : 'Visible to registered users'}</option>
          <option value="Private">{lang === 'ru' ? 'Видно только мне' : 'Only visible to me'}</option>
        </select>

        <textarea
          placeholder={lang === 'ru' ? 'Заметки' : 'Notes'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700"
        />

        {message && <p className="text-sm text-red-600">{message}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? (lang === 'ru' ? 'Сохранение...' : 'Saving...') : (lang === 'ru' ? 'Сохранить' : 'Save')}
        </button>
      </form>
    </div>
  );
}