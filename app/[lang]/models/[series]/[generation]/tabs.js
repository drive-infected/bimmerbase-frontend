'use client';

import { useState } from 'react';  // useEffect больше не нужен

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

export default function Tabs({ lang, gen, modifications, specialVersions, modelCodes }) {
  const [activeTab, setActiveTab] = useState('main');

  // Двигатели теперь приходят уже с engine_family, просто берём gen.engines
  const enginesWithFamily = gen?.engines || [];

  // Уникальные семейства из двигателей
  const familyMap = {};
  enginesWithFamily.forEach((engine) => {
    const fam = engine.engine_family;
    if (fam && !familyMap[fam.slug]) {
      familyMap[fam.slug] = fam;
    }
  });
  const families = Object.values(familyMap).sort((a, b) => (a.code || '').localeCompare(b.code || ''));

  // Группировка семейств по типу топлива и конфигурации
  const groupedFamilies = {};
  families.forEach((family) => {
    const fuel = family.fuel_type;
    const config = family.engine_type === 'Inline'
      ? (lang === 'ru' ? 'Рядный' : 'Inline') + ' ' + family.cylinders
      : family.engine_type + family.cylinders;

    if (!groupedFamilies[fuel]) groupedFamilies[fuel] = {};
    if (!groupedFamilies[fuel][config]) groupedFamilies[fuel][config] = [];
    groupedFamilies[fuel][config].push(family);
  });

  const tabs = [
    { key: 'main', ru: 'Главное', en: 'Main' },
    { key: 'engines', ru: 'Двигатели', en: 'Engines' },
    { key: 'modifications', ru: 'Модификации', en: 'Modifications' },
    { key: 'codes', ru: 'Коды моделей', en: 'Model Codes' },
  ];

  return (
    <div className="mt-8">
      {/* Табы с горизонтальной прокруткой */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#0066B1] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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

          {gen.lci_info && (
            <div className="mt-10 rich-text">
              <h2 className="section-title">LCI</h2>
              <div dangerouslySetInnerHTML={{ __html: renderRichText(gen.lci_info) }} />
            </div>
          )}
        </>
      )}

      {/* Вкладка: Двигатели */}
      {activeTab === 'engines' && (
        <div className="space-y-8">
          {Object.keys(groupedFamilies).length === 0 && (
            <p className="text-gray-400 text-sm">{lang === 'ru' ? 'Нет данных о двигателях.' : 'No engine data.'}</p>
          )}
          {Object.entries(groupedFamilies)
            .sort(([a], [b]) => {
              if (a === 'Petrol') return -1;
              if (b === 'Petrol') return 1;
              return 0;
            })
            .map(([fuel, configs]) => (
              <div key={fuel}>
                <h2 className="section-title mb-4">
                  {fuel === 'Petrol' ? (lang === 'ru' ? 'Бензиновые' : 'Petrol') : (lang === 'ru' ? 'Дизельные' : 'Diesel')}
                </h2>
                {Object.entries(configs).map(([config, familiesInConfig]) => (
                  <div key={config} className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">{config}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {familiesInConfig.map((family) => (
                        <a key={family.slug} href={`/${lang}/engines/${family.slug}`} className="card-link">
                          <span className="card-title">{family.code}</span>
                          <div className="card-text mt-2 space-y-1">
                            <div>
                              {family.cylinders} cyl •{' '}
                              {family.layout === 'Longitudinal'
                                ? lang === 'ru' ? 'Продольное' : 'Longitudinal'
                                : lang === 'ru' ? 'Поперечное' : 'Transverse'}
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
            ))}
        </div>
      )}

      {/* Вкладка: Модификации */}
      {activeTab === 'modifications' && (
        <div className="space-y-10">
          {modifications.length > 0 && (
            <div>
              <h2 className="section-title">{lang === 'ru' ? 'Модификации' : 'Modifications'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modifications.map((mod) => (
                  <div key={mod.id} className="card">
                    <div className="flex justify-between items-start gap-2">
                      <span className="card-title !mb-0">{mod.title}</span>
                      {mod.lci && (
                        <span className={`card-badge ${mod.lci === 'LCI' ? 'card-badge-green' : 'card-badge-gray'}`}>
                          {mod.lci === 'LCI' ? 'LCI' : 'Pre-LCI'}
                        </span>
                      )}
                    </div>
                    <div className="card-text mt-2 space-y-1">
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

          {specialVersions.length > 0 && (
            <div>
              <h2 className="section-title">{lang === 'ru' ? 'Спецверсии' : 'Special Versions'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialVersions.map((sv) => (
                  <a key={sv.id} href={`/${lang}/special-versions/${sv.slug}`} className="card-link">
                    <span className="card-title">{sv.title}</span>
                    {sv.engine && (
                      <div className="card-text mt-2 space-y-1">
                        <div>{sv.engine.index} • {sv.engine.power_hp} hp</div>
                      </div>
                    )}
                    <div className="card-text text-xs mt-1">
                      {sv.production_start?.substring(0, 4)}–{sv.production_end?.substring(0, 4)}
                      {sv.production_count && ` • ${sv.production_count} ${lang === 'ru' ? 'шт.' : 'units'}`}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
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