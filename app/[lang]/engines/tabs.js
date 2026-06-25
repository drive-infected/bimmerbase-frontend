'use client';

import { useState } from 'react';

export default function EngineTabs({ lang, petrolFamilies, dieselFamilies }) {
  const [tab, setTab] = useState('petrol');
  const families = tab === 'petrol' ? petrolFamilies : dieselFamilies;

  // Группируем семейства по конфигурации (engine_type + cylinders)
  const grouped = {};
  families.forEach(family => {
    const config = family.engine_type === 'Inline'
      ? (lang === 'ru' ? 'Рядный' : 'Inline') + ' ' + family.cylinders
      : family.engine_type + family.cylinders; // V8, V12 etc.
    if (!grouped[config]) grouped[config] = [];
    grouped[config].push(family);
  });

  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto max-w-full">
        <button onClick={() => setTab('petrol')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
            tab === 'petrol' ? 'bg-[#0066B1] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}>
          {lang === 'ru' ? 'Бензиновые' : 'Petrol'} ({petrolFamilies.length})
        </button>
        <button onClick={() => setTab('diesel')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
            tab === 'diesel' ? 'bg-[#0066B1] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}>
          {lang === 'ru' ? 'Дизельные' : 'Diesel'} ({dieselFamilies.length})
        </button>
      </div>

      {Object.entries(grouped).map(([config, familiesInGroup]) => (
        <div key={config} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{config}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {familiesInGroup.map(family => (
              <a key={family.id} href={`/${lang}/engines/${family.slug}`} className="card-link">
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
      ))}
    </div>
  );
}