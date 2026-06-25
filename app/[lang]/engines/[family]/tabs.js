'use client';

import { useState } from 'react';

export default function FamilyTabs({ lang, engines, generations, familySlug }) {
  const [activeTab, setActiveTab] = useState('engines');

  const tabs = [
    { key: 'engines', ru: 'Двигатели', en: 'Engines' },
    { key: 'applications', ru: 'Применяемость', en: 'Applications' },
  ];

  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {lang === 'ru' ? tab.ru : tab.en}
          </button>
        ))}
      </div>

      {activeTab === 'engines' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {engines.map((engine) => (
            <a key={engine.id} href={`/${lang}/engines/${familySlug}/${engine.slug}`} className="card-link">
              <span className="card-title">{engine.index}</span>
              <div className="card-text mt-2 space-y-1">
                <div>{engine.power_hp} hp • {engine.torque_nm} Nm</div>
                <div>{engine.displacement} cc</div>
                {engine.vvt && engine.vvt !== 'None' && <div>{engine.vvt}</div>}
              </div>
            </a>
          ))}
        </div>
      )}

      {activeTab === 'applications' && (
        generations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generations.map((gen) => (
              <a
                key={gen.id}
                href={`/${lang}/models/${gen.series?.slug || ''}/${gen.slug}`}
                className="card-link"
              >
                <span className="card-title">{gen.title}</span>
                {gen.series && (
                  <div className="card-text mt-1 text-sm">
                    {gen.series.title}
                  </div>
                )}
                <div className="card-text text-xs mt-1">
                  {gen.production_start?.substring(0, 4)}–{gen.production_end?.substring(0, 4)}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            {lang === 'ru' ? 'Нет данных о применяемости.' : 'No application data.'}
          </p>
        )
      )}
    </div>
  );
}