'use client';

import { useState } from 'react';

export default function FamilyTabs({ lang, featuresHtml, technicalUpdateHtml, engines, seriesMap, familySlug }) {
  const tabs = [
    { key: 'main', ru: 'Главное', en: 'Main' },
    { key: 'modifications', ru: 'Модификации', en: 'Modifications' },
    { key: 'applications', ru: 'Применяемость', en: 'Applications' },
  ];
  const [activeTab, setActiveTab] = useState('main');

  const translateFuel = (type) => {
    if (lang === 'ru') {
      if (type === 'Petrol') return 'Бензин';
      if (type === 'Diesel') return 'Дизель';
    }
    return type;
  };

  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto max-w-full">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#0066B1] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {lang === 'ru' ? tab.ru : tab.en}
          </button>
        ))}
      </div>

      {activeTab === 'main' && (
        <div className="space-y-6">
          {featuresHtml ? (
            <div className="rich-text">
              <div dangerouslySetInnerHTML={{ __html: featuresHtml }} />
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              {lang === 'ru' ? 'Нет информации об особенностях.' : 'No features information.'}
            </p>
          )}
          {technicalUpdateHtml && (
            <div className="rich-text">
              <h2 className="section-title">TU</h2>
              <div dangerouslySetInnerHTML={{ __html: technicalUpdateHtml }} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'modifications' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {engines.map(engine => (
            <a key={engine.id} href={`/${lang}/engines/${familySlug}/${engine.slug}`} className="card-link">
              <span className="card-title">{engine.index}</span>
              <div className="card-text mt-2 space-y-1 text-sm">
                {engine.power_hp && <div>{engine.power_hp} hp • {engine.displacement} cc</div>}
                {engine.fuel_type && <div className="text-xs text-gray-400">{translateFuel(engine.fuel_type)}</div>}
              </div>
            </a>
          ))}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-8">
          {Array.from(seriesMap.values()).map(series => (
            <div key={series.slug}>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                <a href={`/${lang}/models/${series.slug}`} className="text-blue-700 hover:underline">
                  {series.title}
                </a>
              </h3>
              {Array.from(series.generations.values()).map(gen => (
                <div key={gen.slug} className="ml-4 mb-4">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    <a href={`/${lang}/models/${series.slug}/${gen.slug}`} className="text-blue-600 hover:underline">
                      {gen.title}
                    </a>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                    {gen.modifications.map(mod => (
                      <div key={mod.id} className="card !p-3 flex flex-col">
                        <span className="font-semibold text-sm">{mod.title}</span>
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                          {mod.power_hp && <div>{mod.power_hp} hp • {mod.torque_nm} Nm</div>}
                          {mod.displacement && <div>{mod.displacement} cc</div>}
                          {mod.fuel_type && <div>{translateFuel(mod.fuel_type)}</div>}
                          {mod.markets && mod.markets.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mod.markets.map(market => (
                                <span key={market.id} className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                  {market.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}