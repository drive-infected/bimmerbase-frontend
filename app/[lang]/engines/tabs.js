'use client';

import { useState } from 'react';

export default function Tabs({ lang, petrolFamilies, dieselFamilies }) {
  const [tab, setTab] = useState('petrol');
  const families = tab === 'petrol' ? petrolFamilies : dieselFamilies;

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button onClick={() => setTab('petrol')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'petrol' ? 'bg-white border border-gray-200 border-b-white text-blue-700 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
          {lang === 'ru' ? 'Бензиновые' : 'Petrol'} ({petrolFamilies.length})
        </button>
        <button onClick={() => setTab('diesel')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'diesel' ? 'bg-white border border-gray-200 border-b-white text-blue-700 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
          {lang === 'ru' ? 'Дизельные' : 'Diesel'} ({dieselFamilies.length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {families.map((family) => {
          const engines = (family.engines || []).sort((a, b) => {
            if (a.displacement !== b.displacement) return (a.displacement || 0) - (b.displacement || 0);
            return (a.index || '').localeCompare(b.index || '');
          });

          return (
            <div key={family.id} className="flex flex-col">
              {/* Карточка семейства */}
              <a href={`/${lang}/engines/${family.slug}`} className="card mb-3 no-underline text-gray-900 block hover:shadow-md transition-shadow">
                <h2 className="text-lg font-bold">{family.code}</h2>
                <div className="text-xs text-gray-500 mt-1 space-x-2">
                  <span>{family.production_start?.substring(0, 4)}–{family.production_end?.substring(0, 4)}</span>
                  <span>•</span>
                  <span>{family.cylinders} cyl</span>
                  <span>•</span>
                  <span>{family.layout === 'Longitudinal' ? (lang === 'ru' ? 'Продольное' : 'Longitudinal') : (lang === 'ru' ? 'Поперечное' : 'Transverse')}</span>
                </div>
              </a>

              {/* Двигатели */}
              <div className="flex flex-col gap-2">
                {engines.map((engine) => (
                  <a key={engine.id} href={`/${lang}/engines/${family.slug}/${engine.slug}`} className="card-link !p-3">
                    <span className="text-sm font-semibold">{engine.index}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {engine.power_hp} hp • {engine.torque_nm} Nm • {engine.displacement} cc
                      {engine.vvt && engine.vvt !== 'None' && ` • ${engine.vvt}`}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}