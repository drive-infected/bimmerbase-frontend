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
            <strong className="text-xl">{family.code}</strong>
            <p className="text-sm text-gray-600 mt-2">
              {family.cylinders} cyl • {family.fuel_type === 'Petrol' ? (lang === 'ru' ? 'Бензин' : 'Petrol') : 'Diesel'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {family.production_start?.substring(0, 4)}–{family.production_end?.substring(0, 4)}
            </p>
          </div>
        ))}
      </div>

      <h2 className="section-title">
        {lang === 'ru' ? 'Все двигатели' : 'All Engines'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {enginesData.data && enginesData.data.map((engine) => (
          <a key={engine.id} href={`/${lang}/engines/${engine.slug}`} className="card-link !p-4">
            <strong className="text-lg block">{engine.index}</strong>
            <p className="text-sm text-gray-600 mt-1">
              {engine.power_hp} hp • {engine.displacement} cc
            </p>
            {engine.engine_family && (
              <p className="text-xs text-gray-400 mt-1">
                {lang === 'ru' ? 'Семейство' : 'Family'}: {engine.engine_family.code}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}