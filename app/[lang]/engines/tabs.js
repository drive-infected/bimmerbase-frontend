'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';

export default function EngineTabs({ lang, petrolFamilies, dieselFamilies }) {
  const [tab, setTab] = useState('petrol');
  const families = tab === 'petrol' ? petrolFamilies : dieselFamilies;

  const grouped = {};
  families.forEach(family => {
    const config = family.engine_type === 'Inline'
      ? (lang === 'ru' ? 'Рядный' : 'Inline') + ' ' + family.cylinders
      : family.engine_type + family.cylinders;
    if (!grouped[config]) grouped[config] = [];
    grouped[config].push(family);
  });

  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto max-w-full">
        <button onClick={() => setTab('petrol')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
            tab === 'petrol' ? 'bg-[#0066B1] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}>
          {lang === 'ru' ? 'Бензиновые' : 'Petrol'} ({petrolFamilies.length})
        </button>
        <button onClick={() => setTab('diesel')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
            tab === 'diesel' ? 'bg-[#0066B1] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}>
          {lang === 'ru' ? 'Дизельные' : 'Diesel'} ({dieselFamilies.length})
        </button>
      </div>

      {Object.entries(grouped).map(([config, familiesInGroup]) => (
        <div key={config} className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{config}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {familiesInGroup.map(family => (
              <a
                key={family.id}
                href={`/${lang}/engines/${family.slug}`}
                className="card-link flex flex-col overflow-hidden group !p-0" // убираем стандартные padding карточки
              >
                <div className="h-56 relative flex-shrink-0">
                  <OptimizedImage
                    image={family.image}
                    alt={family.code}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="px-4 pb-4 pt-3 flex flex-col flex-1">
                  <span className="card-title text-lg">{family.code}</span>
                  <div className="mt-auto text-xs text-gray-400 pt-2">
                    {family.production_start?.substring(0, 4)}–{family.production_end?.substring(0, 4)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}