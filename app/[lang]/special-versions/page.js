export default async function SpecialVersionsPage({ params }) {
  const { lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/special-versions?locale=${lang}&populate=*&sort=production_start`,
    { cache: 'no-store' }
  );
  const data = await res.json();

  const typeLabels = {
    M: { ru: 'M-версии', en: 'M versions' },
    Alpina: { ru: 'Alpina', en: 'Alpina' },
    'Limited Edition': { ru: 'Limited Edition', en: 'Limited Edition' },
    Individual: { ru: 'BMW Individual', en: 'BMW Individual' },
    'Удлинённая база': { ru: 'Удлинённая база', en: 'Long wheelbase' },
    Protection: { ru: 'Защищённые', en: 'Protection' },
    'Внедорожная': { ru: 'Внедорожные', en: 'Off-road' },
    Спецсерия: { ru: 'Спецсерии', en: 'Special series' },
  };

  const grouped = {};
  if (data.data) {
    data.data.forEach((sv) => {
      const type = sv.type || 'Спецсерия';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(sv);
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'ru' ? 'Специальные версии' : 'Special Versions'}
      </h1>

      {Object.keys(grouped).length === 0 && (
        <p className="text-gray-500">{lang === 'ru' ? 'Раздел наполняется.' : 'Section is being filled.'}</p>
      )}

      {Object.entries(grouped).map(([type, versions]) => (
        <div key={type} className="mb-10">
          <h2 className="section-title">
            {typeLabels[type]?.[lang] || type}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {versions.map((sv) => (
              <a key={sv.id} href={`/${lang}/special-versions/${sv.slug}`} className="card-link">
                <strong className="text-lg block">{sv.title}</strong>
                {sv.series && (
                  <p className="text-sm text-gray-500 mt-1">{sv.series.title}</p>
                )}
                <div className="text-sm text-gray-400 mt-1">
                  {sv.production_start?.substring(0, 4)}–{sv.production_end?.substring(0, 4)}
                  {sv.production_count && ` • ${sv.production_count} ${lang === 'ru' ? 'шт.' : 'units'}`}
                </div>
                {sv.power_hp && (
                  <p className="text-sm text-blue-700 mt-1">{sv.power_hp} hp</p>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}