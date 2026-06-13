import EngineTabs from './tabs';

export default async function EnginesListPage({ params }) {
  const { lang } = await params;

  const familiesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engine-families?locale=${lang}&populate[engines]=*&sort=code`,
    { cache: 'no-store' }
  );
  const familiesData = await familiesRes.json();
  const families = familiesData.data || [];

  const petrolFamilies = families.filter(f => f.fuel_type === 'Petrol');
  const dieselFamilies = families.filter(f => f.fuel_type === 'Diesel');

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'ru' ? 'Двигатели BMW' : 'BMW Engines'}
      </h1>
      <EngineTabs lang={lang} petrolFamilies={petrolFamilies} dieselFamilies={dieselFamilies} />
    </div>
  );
}