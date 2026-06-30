'use client';

import { useState, useEffect, use } from 'react';

export default function AddCarPage({ params }) {
  const { lang } = use(params);
  const [user, setUser] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [generationList, setGenerationList] = useState([]);
  const [modificationList, setModificationList] = useState([]);

  const [name, setName] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [vin, setVin] = useState('');
  const [carStatus, setCarStatus] = useState('Owned');
  const [visibility, setVisibility] = useState('Public');
  const [notes, setNotes] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [generationId, setGenerationId] = useState('');
  const [modificationId, setModificationId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);

    if (!jwt) {
      window.location.href = `/${lang}/auth`;
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/series?locale=${lang}&sort=title`)
      .then(r => r.json()).then(d => setSeriesList(d.data || []));
  }, []);

  // При выборе серии загружаем поколения
  useEffect(() => {
    if (seriesId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generations?locale=${lang}&filters[series][documentId][$eq]=${seriesId}&sort=title`)
        .then(r => r.json())
        .then(d => setGenerationList(d.data || []));
      setGenerationId('');
      setModificationId('');
      setModificationList([]);
    } else {
      setGenerationList([]);
    }
  }, [seriesId]);

  // При выборе поколения загружаем модификации
  useEffect(() => {
    if (generationId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/modifications?locale=${lang}&filters[generation][documentId][$eq]=${generationId}&sort=title`)
        .then(r => r.json())
        .then(d => setModificationList(d.data || []));
      setModificationId('');
    } else {
      setModificationList([]);
    }
  }, [generationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const jwt = localStorage.getItem('jwt');
    if (!user) return;

    const body = {
      data: {
        name,
        production_date: productionDate || null,
        vin: vin || null,
        car_status: carStatus,
        visibility,
        notes: notes || null,
        // Связь с текущим пользователем
        users_permissions_user: user.id,
        // Связи с выбранной моделью (если выбраны)
        ...(seriesId && { series: seriesId }),
        ...(generationId && { generation: generationId }),
        ...(modificationId && { modification: modificationId }),
      },
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        window.location.href = `/${lang}/garage`;
      } else {
        const err = await res.json();
        setMessage(err.error?.message || 'Error');
      }
    } catch (err) {
      setMessage(lang === 'ru' ? 'Ошибка соединения' : 'Connection error');
    }
    setLoading(false);
  };

  if (!user) {
    return <p className="text-center py-12 text-gray-500">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</p>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <a href={`/${lang}/garage`} className="text-blue-700 no-underline">← {lang === 'ru' ? 'Гараж' : 'Garage'}</a>
      <h1 className="text-2xl font-bold mt-4 mb-6">
        {lang === 'ru' ? 'Добавить автомобиль' : 'Add Car'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder={lang === 'ru' ? 'Название (например, Моя E39)' : 'Name (e.g., My E39)'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700"
        />

        <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700">
          <option value="">{lang === 'ru' ? 'Выберите серию' : 'Select series'}</option>
          {seriesList.map((s) => (
            <option key={s.id} value={s.documentId}>{s.title}</option>
          ))}
        </select>

        <select value={generationId} onChange={(e) => setGenerationId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700" disabled={!seriesId}>
          <option value="">{lang === 'ru' ? 'Выберите поколение' : 'Select generation'}</option>
          {generationList.map((g) => (
            <option key={g.id} value={g.documentId}>{g.title}</option>
          ))}
        </select>

        <select value={modificationId} onChange={(e) => setModificationId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700" disabled={!generationId}>
          <option value="">{lang === 'ru' ? 'Выберите модификацию' : 'Select modification'}</option>
          {modificationList.map((m) => (
            <option key={m.id} value={m.documentId}>{m.title} ({m.power_hp} hp)</option>
          ))}
        </select>

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
          <option value="Visible for registered users">{lang === 'ru' ? 'Видно зарегистрированным' : 'Visible to registered users'}</option>
          <option value="Private">{lang === 'ru' ? 'Видно только мне' : 'Only visible to me'}</option>
        </select>

        <textarea
          placeholder={lang === 'ru' ? 'Заметки' : 'Notes'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-700"
        />

        {message && <p className="text-sm text-red-600">{message}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (lang === 'ru' ? 'Сохранение...' : 'Saving...') : (lang === 'ru' ? 'Добавить' : 'Add Car')}
        </button>
      </form>
    </div>
  );
}