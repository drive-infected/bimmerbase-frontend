// app/[lang]/engines/page.js
import EngineTabs from './tabs';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const title = lang === 'ru' ? 'Двигатели BMW – BimmerBase' : 'BMW Engines – BimmerBase';
  const description = lang === 'ru'
    ? 'Каталог бензиновых и дизельных двигателей BMW с характеристиками, семействами и применяемостью.'
    : 'Catalog of petrol and diesel BMW engines with specifications, families and applications.';

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/${lang}/engines`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/en/engines`,
        ru: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/ru/engines`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/${lang}/engines`,
      siteName: 'BimmerBase',
      type: 'website',
      images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://bimmerbase.ru'}/images/og-default.jpg`],
    },
  };
}

export default async function EnginesListPage({ params }) {
  const { lang } = await params;

  const familiesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/engine-families?locale=${lang}&populate=*&sort=code`,
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