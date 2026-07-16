'use client';

import { useState } from 'react';

export default function FamilyTabs({ lang, engines, groupedBySeries, technicalUpdateHtml, familySlug }) {
  const tabs = [
    { key: 'modifications', ru: 'Модификации', en: 'Modifications' },
    { key: 'applications', ru: 'Применяемость', en: 'Applications' },
    ...(technicalUpdateHtml ? [{ key: 'tu', ru: 'TU', en: 'TU' }] : []),
  ];
  const [activeTab, setActiveTab] = useState('modifications');

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

      {activeTab === 'modifications' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {engines.map(engine => (
            <a key={engine.id} href={`/${lang}/engines/${familySlug}/${engine.slug}`} className="card-link">
              <span className="card-title">{engine.index}</span>
              <div className="card-text mt-2 space-y-1 text-sm">
                {engine.power_hp && <div>{engine.power_hp} hp • {engine.displacement} cc</div>}
              </div>
            </a>
          ))}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6">
          {groupedBySeries.map(group => (
            <div key={group.slug}>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                <a href={`/${lang}/models/${group.slug}`} className="text-blue-700 hover:underline">
                  {group.title}
                </a>
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.modifications.map(mod => (
                  <span key={mod.id} className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {mod.title}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tu' && (
        <div className="rich-text">
          <div dangerouslySetInnerHTML={{ __html: technicalUpdateHtml }} />
        </div>
      )}
    </div>
  );
}