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

      {families.map((family) => {
        const engines = (family.engines || []).sort((a, b) => {
          if (a.displacement !== b.displacement) return (a.displacement || 0) - (b.displacement || 0);
          return (a.index || '').localeCompare(b.index || '');
        });

        return (
          <div key={family.id} className="mb-10">
            {/* Заголовок семейства */}
            <div className="card mb-4">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold">{family.code}</h2>
                  <div className="text-sm text-gray-500 mt-1 space-x-3">
                    <span>{family.production_start?.substring(0, 4)}–{family.production_end?.substring(0, 4)}</span>
                    <span>•</span>
                    <span>{family.cylinders} cyl</span>
                    <span>•</span>
                    <span>{family.layout === 'Longitudinal' ? (lang === 'ru' ? 'Продольное' : 'Longitudinal') : (lang === 'ru' ? 'Поперечное' : 'Transverse')}</span>
                    <span>•</span>
                    <span>{family.head_material} / {family.block_material}</span>
                  </div>
                  {family.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {typeof family.description === 'string' ? family.description : family.description?.[0]?.children?.[0]?.text || ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Двигатели семейства */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {engines.map((engine) => (
                <a key={engine.id} href={`/${lang}/engines/${engine.slug}`} className="card-link">
                  <span className="card-title">{engine.index}</span>
                  <div className="card-text mt-2 space-y-1">
                    <div>{engine.power_hp} hp • {engine.torque_nm} Nm</div>
                    <div>{engine.displacement} cc</div>
                    {engine.vvt && <div>{engine.vvt}</div>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}