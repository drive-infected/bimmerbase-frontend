export default async function EnginesListPage({ params }) {
  const { lang } = await params;

  const familiesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engine-families?locale=${lang}&populate=*`,
    { cache: 'no-store' }
  );
  const familiesData = await familiesRes.json();

  const enginesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engines?locale=${lang}&populate=*&sort=index`,
    { cache: 'no-store' }
  );
  const enginesData = await enginesRes.json();

  // Группируем двигатели по типу топлива
  const petrolEngines = (enginesData.data || []).filter(e => e.fuel_type === 'Petrol');
  const dieselEngines = (enginesData.data || []).filter(e => e.fuel_type === 'Diesel');

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'ru' ? 'Двигатели BMW' : 'BMW Engines'}
      </h1>

      <h2 className="section-title">
        {lang === 'ru' ? 'Семейства двигателей' : 'Engine Families'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {familiesData.data && familiesData.data.map((family) => (
          <div key={family.id} className="card">
            <strong className="text-lg">{family.code}</strong>
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <div>{family.cylinders} cyl • {family.fuel_type === 'Petrol' ? (lang === 'ru' ? 'Бензин' : 'Petrol') : 'Diesel'}</div>
              <div>{family.production_start?.substring(0, 4)}–{family.production_end?.substring(0, 4)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Бензиновые двигатели */}
      {petrolEngines.length > 0 && (
        <div className="mb-10">
          <h2 className="section-title">
            {lang === 'ru' ? 'Бензиновые двигатели' : 'Petrol Engines'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {petrolEngines.map((engine) => (
              <a key={engine.id} href={`/${lang}/engines/${engine.slug}`} className="card-link">
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

      {/* Дизельные двигатели */}
      {dieselEngines.length > 0 && (
        <div className="mb-10">
          <h2 className="section-title">
            {lang === 'ru' ? 'Дизельные двигатели' : 'Diesel Engines'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {dieselEngines.map((engine) => (
              <a key={engine.id} href={`/${lang}/engines/${engine.slug}`} className="card-link">
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
  );
}