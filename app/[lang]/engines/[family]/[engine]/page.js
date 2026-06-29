// app/[lang]/engines/[family]/[engine]/page.js
import RelatedLinks from '@/components/RelatedLinks';
import { getEngineSections } from '@/lib/relatedLinks';

export default async function EnginePage({ params }) {
  const { engine: engineSlug, family: familySlug, lang } = await params;

  // Один запрос с глубокой популяцией всех нужных связей
  const searchParams = new URLSearchParams();
  searchParams.set('locale', lang);
  searchParams.set('filters[slug][$eq]', engineSlug);
  searchParams.set('populate[engine_family]', 'true');
  searchParams.set('populate[generations][populate][series]', 'true');
  searchParams.set('populate[articles]', 'true');
  searchParams.set('populate[special_versions]', 'true');

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/engines?${searchParams.toString()}`;

  let engine;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    engine = data.data?.[0];
  } catch (err) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-red-600">
          {lang === 'ru' ? 'Ошибка загрузки данных' : 'Data loading error'}
        </h1>
        <p className="mt-2 text-gray-700">{err.message}</p>
      </div>
    );
  }

  if (!engine) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/${lang}/engines/${familySlug}`} className="text-blue-700 no-underline">
          ← {lang === 'ru' ? 'К семейству' : 'Back to family'}
        </a>
        <h1 className="text-2xl font-bold mt-4">
          {lang === 'ru' ? 'Двигатель не найден' : 'Engine not found'}
        </h1>
      </div>
    );
  }

  const family = engine.engine_family;
  const relatedSections = getEngineSections(engine, lang);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500 mb-4">
        <a href={`/${lang}/engines`} className="text-blue-700 no-underline hover:underline">
          {lang === 'ru' ? 'Двигатели' : 'Engines'}
        </a>
        {family && (
          <>
            <span className="mx-2">/</span>
            <a href={`/${lang}/engines/${family.slug}`} className="text-blue-700 no-underline hover:underline">
              {family.code}
            </a>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{engine.index}</span>
      </nav>

      <h1 className="text-4xl font-bold mt-2">
        {lang === 'ru' ? 'Двигатель' : 'Engine'} {engine.index}
      </h1>
      {family && (
        <p className="text-gray-600 mt-2 text-lg">
          {lang === 'ru' ? 'Семейство' : 'Family'}: {family.code} • {family.cylinders} cyl
        </p>
      )}

      {/* Характеристики */}
      <SpecsSection engine={engine} lang={lang} />

      {/* Обслуживание */}
      <MaintenanceSection engine={engine} lang={lang} />

      {/* Перелинковка */}
      <RelatedLinks sections={relatedSections} lang={lang} />
    </div>
  );
}

// --- Вспомогательные компоненты (без изменений, только перемещены ниже) ---

function SpecsSection({ engine, lang }) {
  return (
    <div className="mt-8">
      <h2 className="section-title">{lang === 'ru' ? 'Характеристики' : 'Specifications'}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {engine.power_hp && <SpecItem label={lang === 'ru' ? 'Мощность' : 'Power'} value={`${engine.power_hp} hp`} />}
        {engine.torque_nm && <SpecItem label={lang === 'ru' ? 'Крутящий момент' : 'Torque'} value={`${engine.torque_nm} Nm`} />}
        {engine.displacement && <SpecItem label={lang === 'ru' ? 'Объём' : 'Displacement'} value={`${engine.displacement} cc`} />}
        {engine.bore_stroke && <SpecItem label={lang === 'ru' ? 'Диаметр × Ход' : 'Bore × Stroke'} value={engine.bore_stroke} />}
        {engine.compression_ratio && <SpecItem label={lang === 'ru' ? 'Степень сжатия' : 'Compression'} value={engine.compression_ratio} />}
        {engine.valves_per_cylinder && <SpecItem label={lang === 'ru' ? 'Клапанов' : 'Valves'} value={engine.valves_per_cylinder} />}
        {engine.max_rpm && <SpecItem label={lang === 'ru' ? 'Макс. обороты' : 'Max RPM'} value={`${engine.max_rpm} rpm`} />}
        {engine.timing_drive && (
          <SpecItem
            label={lang === 'ru' ? 'ГРМ' : 'Timing'}
            value={engine.timing_drive === 'Chain' ? (lang === 'ru' ? 'Цепь' : 'Chain') : (lang === 'ru' ? 'Ремень' : 'Belt')}
          />
        )}
        {engine.vvt && <SpecItem label={lang === 'ru' ? 'Фазорегуляторы' : 'VVT'} value={engine.vvt} />}
        {engine.injection && <SpecItem label={lang === 'ru' ? 'Впрыск' : 'Injection'} value={engine.injection} />}
        {engine.ecu && <SpecItem label="ECU" value={engine.ecu} />}
      </div>
    </div>
  );
}

function MaintenanceSection({ engine, lang }) {
  if (!engine.oil_type && !engine.oil_capacity && !engine.coolant_type && !engine.coolant_capacity) return null;
  return (
    <div className="mt-10">
      <h2 className="section-title">{lang === 'ru' ? 'Обслуживание' : 'Maintenance'}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {engine.oil_type && <SpecItem label={lang === 'ru' ? 'Масло' : 'Oil'} value={engine.oil_type} />}
        {engine.oil_capacity && <SpecItem label={lang === 'ru' ? 'Объём масла' : 'Oil capacity'} value={`${engine.oil_capacity} L`} />}
        {engine.coolant_type && <SpecItem label={lang === 'ru' ? 'Тип ОЖ' : 'Coolant type'} value={engine.coolant_type} />}
        {engine.coolant_capacity && <SpecItem label={lang === 'ru' ? 'Объём ОЖ' : 'Coolant capacity'} value={`${engine.coolant_capacity} L`} />}
      </div>
    </div>
  );
}

function SpecItem({ label, value }) {
  return (
    <div className="card !p-3">
      <span className="text-xs text-gray-500">{label}</span>
      <br />
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}