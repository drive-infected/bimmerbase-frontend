export default async function TrimGroupsPage({ params }) {
  const { lang } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/trim-groups?locale=${lang}&populate=*&sort=type`,
    { cache: 'no-store' }
  );
  const data = await res.json();

  const typeLabels = {
    'Interior upholstery': { ru: 'Отделка салона', en: 'Interior Trim' },
    'Decorative elements': { ru: 'Декоративные элементы', en: 'Decorative Elements' },
    'Аccessories': { ru: 'Дополнительные опции', en: 'Accessories' },
    'Special vehicles': { ru: 'Спецтранспорт', en: 'Special Vehicles' },
    'Other': { ru: 'Другое', en: 'Other' },
  };

  const grouped = {};
  if (data.data) {
    data.data.forEach((tg) => {
      const type = tg.type || 'Other';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(tg);
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'ru' ? 'Тематические подборки' : 'Thematic Collections'}
      </h1>

      {Object.keys(grouped).length === 0 && (
        <p className="text-gray-500">{lang === 'ru' ? 'Раздел наполняется.' : 'Section is being filled.'}</p>
      )}

      {Object.entries(grouped).map(([type, groups]) => (
        <div key={type} className="mb-10">
          <h2 className="section-title">
            {typeLabels[type]?.[lang] || type}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((tg) => (
              <a key={tg.id} href={`/${lang}/trim-groups/${tg.slug}`} className="card-link">
                <strong className="text-lg block">{tg.title}</strong>
                {tg.series && (
                  <p className="text-sm text-gray-500 mt-1">{tg.series.title}</p>
                )}
                {tg.options && (
                  <p className="text-sm text-gray-400 mt-1">
                    {tg.options.length} {lang === 'ru' ? 'опций' : 'options'}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}