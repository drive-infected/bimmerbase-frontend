'use client';

import { useState } from 'react';

export default function EngineTabs({ lang, petrolFamilies, dieselFamilies }) {
  const [tab, setTab] = useState('petrol');
  const families = tab === 'petrol' ? petrolFamilies : dieselFamilies;

  return (
    <div className="mt-8">
      {/* Табы */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-6">
        <button
          onClick={() => setTab('petrol')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
            tab === 'petrol'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {lang === 'ru' ? 'Бензиновые' : 'Petrol'} ({petrolFamilies.length})
        </button>
        <button
          onClick={() => setTab('diesel')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
            tab === 'diesel'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {lang === 'ru' ? 'Дизельные' : 'Diesel'} ({dieselFamilies.length})
        </button>
      </div>

      {/* Сетка семейств */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {families.map((family) => (
          <a
            key={family.id}
            href={`/${lang}/engines/${family.slug}`}
            className="card-link"
          >
            <span className="card-title">{family.code}</span>
            <div className="card-text mt-2 space-y-1">
              <div>
                {family.cylinders} cyl •{' '}
                {family.layout === 'Longitudinal'
                  ? lang === 'ru' ? 'Продольное' : 'Longitudinal'
                  : lang === 'ru' ? 'Поперечное' : 'Transverse'}
              </div>
              <div>
                {family.head_material === 'Aluminium' ? 'Al' : family.head_material} /{' '}
                {family.block_material === 'Aluminium' ? 'Al' : family.block_material}
              </div>
              <div className="text-xs text-gray-400">
                {family.production_start?.substring(0, 4)}–{family.production_end?.substring(0, 4)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}