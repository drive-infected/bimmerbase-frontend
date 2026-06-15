'use client';

import { useState } from 'react';

function formatDate(dateString) {
  if (!dateString) return '...';
  const d = new Date(dateString);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}.${year}`;
}

function renderRichText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  const html = blocks.map((block) => {
    if (block.type === 'paragraph') {
      const text = block.children?.map((c) => {
        let content = c.text || '';
        if (c.bold) content = `<strong>${content}</strong>`;
        if (c.italic) content = `<em>${content}</em>`;
        return content;
      }).join('');
      return text ? `<p>${text}</p>` : '';
    }
    if (block.type === 'heading') {
      const level = block.level || 2;
      const text = block.children?.map((c) => c.text).join('');
      return `<h${level}>${text}</h${level}>`;
    }
    if (block.type === 'list') {
      const tag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = renderListItems(block.children);
      return `<${tag}>${items}</${tag}>`;
    }
    return '';
  }).join('');
  return html;
}

function renderListItems(children) {
  if (!children || !Array.isArray(children)) return '';
  return children.map((child) => {
    if (child.type === 'list-item') {
      const text = child.children?.filter((c) => c.type === 'text')?.map((c) => c.text || '').join('') || '';
      return `<li>${text}</li>`;
    }
    if (child.type === 'list') {
      const tag = child.format === 'ordered' ? 'ol' : 'ul';
      const items = renderListItems(child.children);
      return `<${tag}>${items}</${tag}>`;
    }
    return '';
  }).join('');
}

function translateFuelType(type, lang) {
  if (lang === 'ru') {
    if (type === 'Petrol') return 'Бензин';
    if (type === 'Diesel') return 'Дизель';
  }
  return type;
}

export default function Tabs({ lang, gen, modifications, modelCodes }) {
  const [activeTab, setActiveTab] = useState('main');

  const tabs = [
    { key: 'main', ru: 'Главное', en: 'Main' },
    { key: 'lci', ru: 'Рестайлинг', en: 'Facelift' },
    { key: 'codes', ru: 'Коды моделей', en: 'Model Codes' },
  ];

  return (
    <div className="mt-8">
      {/* Табы */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-white border border-gray-200 border-b-white text-blue-700 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {lang === 'ru' ? tab.ru : tab.en}
          </button>
        ))}
      </div>

      {/* Вкладка: Главное */}
      {activeTab === 'main' && (
        <>
          {gen.description && (
            <div className="rich-text">
              <h2 className="section-title">{lang === 'ru' ? 'Обзор' : 'Overview'}</h2>
              <div dangerouslySetInnerHTML={{ __html: renderRichText(gen.description) }} />
            </div>
          )}

          {gen.engines?.length > 0 && (
            <div className="mt-10">
              <h2 className="section-title">{lang === 'ru' ? 'Двигатели' : 'Engines'}</h2>
              {/* Бензиновые */}
              {gen.engines.filter(e => e.fuel_type === 'Petrol').length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">{lang === 'ru' ? 'Бензиновые' : 'Petrol'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gen.engines.filter(e => e.fuel_type === 'Petrol').map((engine) => (
                      <a
                        key={engine.id}
                        href={engine.engine_family?.slug ? `/${lang}/engines/${engine.engine_family.slug}/${engine.slug}` : '#'}
                        className="card-link"
                      >
                        <strong className="text-lg block">{engine.index}</strong>
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          <div>{engine.power_hp} hp • {engine.torque_nm} Nm</div>
                          <div>{engine.displacement} cc</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {/* Дизельные */}
              {gen.engines.filter(e => e.fuel_type === 'Diesel').length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">{lang === 'ru' ? 'Дизельные' : 'Diesel'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gen.engines.filter(e => e.fuel_type === 'Diesel').map((engine) => (
                      <a
                        key={engine.id}
                        href={engine.engine_family?.slug ? `/${lang}/engines/${engine.engine_family.slug}/${engine.slug}` : '#'}
                        className="card-link"
                      >
                        <strong className="text-lg block">{engine.index}</strong>
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          <div>{engine.power_hp} hp • {engine.torque_nm} Nm</div>
                          <div>{engine.displacement} cc</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {modifications.length > 0 && (
            <div className="mt-10">
              <h2 className="section-title">{lang === 'ru' ? 'Модификации' : 'Modifications'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modifications.map((mod) => (
                  <div key={mod.id} className="card">
                    <div className="flex justify-between items-start gap-2">
                      <strong className="text-lg">{mod.title}</strong>
                      {mod.lci && (
                        <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${mod.lci === 'LCI' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {mod.lci === 'LCI' ? 'LCI' : 'Pre-LCI'}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div>{translateFuelType(mod.fuel_type, lang)}</div>
                      {mod.engines?.length > 0 && (
                        <div>{mod.engines[0].index} • {mod.engines[0].displacement} cc</div>
                      )}
                      {mod.acceleration_0_100 && <div>0–100: {mod.acceleration_0_100} s</div>}
                      {mod.max_speed && <div>{lang === 'ru' ? 'Макс. скорость' : 'Max speed'}: {mod.max_speed} km/h</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gen.articles?.length > 0 && (
            <div className="mt-10">
              <h2 className="section-title">{lang === 'ru' ? 'Статьи' : 'Articles'}</h2>
              <div className="flex flex-col gap-3">
                {gen.articles.map((article) => (
                  <a key={article.id} href={`/${lang}/articles/${article.slug}`} className="card-link !p-4">
                    <strong>{article.title}</strong>
                    {article.intro && <p className="text-sm text-gray-600 mt-1">{article.intro}</p>}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Вкладка: Рестайлинг */}
      {activeTab === 'lci' && (
        gen.lci_info ? (
          <div className="rich-text">
            <div dangerouslySetInnerHTML={{ __html: renderRichText(gen.lci_info) }} />
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{lang === 'ru' ? 'Информация о рестайлинге будет добавлена.' : 'Facelift information will be added.'}</p>
        )
      )}

      {/* Вкладка: Коды моделей */}
      {activeTab === 'codes' && (
        modelCodes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Код' : 'Code'}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Период выпуска' : 'Production period'}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Модель' : 'Model'}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Кузов' : 'Body'}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Двигатель' : 'Engine'}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Мощность' : 'Power'}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Привод' : 'Drivetrain'}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Руль' : 'Steering'}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{lang === 'ru' ? 'Регион' : 'Region'}</th>
                </tr>
              </thead>
              <tbody>
                {modelCodes.map((mc) => (
                  <tr key={mc.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono font-semibold">{mc.code || '—'}</td>
                    <td className="p-3">
                      {mc.production_start
                        ? `${formatDate(mc.production_start)} – ${formatDate(mc.production_end)}`
                        : '—'}
                    </td>
                    <td className="p-3">{mc.modification?.title || '—'}</td>
                    <td className="p-3">
                      {mc.body?.title
                        ? (lang === 'ru'
                            ? { Sedan: 'Седан', Touring: 'Универсал', Coupe: 'Купе', Cabriolet: 'Кабриолет', Compact: 'Компакт', Hatchback: 'Хэтчбек', 'Long wheelbase': 'Лонг' }[mc.body.title] || mc.body.title
                            : mc.body.title)
                        : '—'}
                    </td>
                    <td className="p-3">{mc.engine?.index || '—'}</td>
                    <td className="p-3">{mc.engine?.power_hp ? `${mc.engine.power_hp} hp` : '—'}</td>
                    <td className="p-3">
                      {mc.drivetrain
                        ? (lang === 'ru'
                            ? { RWD: 'Задний', FWD: 'Передний', AWD: 'Полный' }[mc.drivetrain] || mc.drivetrain
                            : mc.drivetrain)
                        : '—'}
                    </td>
                    <td className="p-3">
                      {mc.steering?.code
                        ? (lang === 'ru'
                            ? { 'LHD': 'Левый', 'RHD': 'Правый' }[mc.steering.code] || mc.steering.code
                            : mc.steering.code)
                        : '—'}
                    </td>
                    <td className="p-3">
                      {mc.market?.title
                        ? (lang === 'ru'
                            ? {
                                Russia: 'Россия', Germany: 'Германия', Europe: 'Европа', USA: 'США', Japan: 'Япония',
                                Egypt: 'Египет', Malaysia: 'Малайзия', Indonesia: 'Индонезия', Thailand: 'Таиланд',
                                Philippines: 'Филиппины', Vietnam: 'Вьетнам', Mexico: 'Мексика',
                              }[mc.market.title] || mc.market.title
                            : mc.market.title)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{lang === 'ru' ? 'Коды моделей будут добавлены.' : 'Model codes will be added.'}</p>
        )
      )}
    </div>
  );
}