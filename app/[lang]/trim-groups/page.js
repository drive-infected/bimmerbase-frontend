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

  // Группируем по типу
  const grouped = {};
  if (data.data) {
    data.data.forEach((tg) => {
      const type = tg.type || 'Другое';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(tg);
    });
  }

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '30px' }}>
        {lang === 'ru' ? 'Тематические подборки' : 'Thematic Collections'}
      </h1>

      {Object.keys(grouped).length === 0 && (
        <p style={{ color: '#888' }}>{lang === 'ru' ? 'Раздел наполняется.' : 'Section is being filled.'}</p>
      )}

      {Object.entries(grouped).map(([type, groups]) => (
        <div key={type} style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '2px solid #0066cc', paddingBottom: '8px' }}>
            {typeLabels[type]?.[lang] || type}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {groups.map((tg) => (
              <a
                key={tg.id}
                href={`/${lang}/trim-groups/${tg.slug}`}
                style={{
                  padding: '20px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: '#333',
                  background: '#fafafa',
                }}
              >
                <strong style={{ fontSize: '18px', display: 'block' }}>{tg.title}</strong>
                {tg.series && (
                  <p style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>
                    {tg.series.title}
                  </p>
                )}
                {tg.options && (
                  <p style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                    {tg.options.length} {lang === 'ru' ? 'опций' : 'options'}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}