export default async function OptionsPage({ params }) {
  const { lang } = await params;

  const catRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/option-categories?locale=${lang}&populate=*&sort=sort_order`,
    { cache: 'no-store' }
  );
  const catData = await catRes.json();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {lang === 'ru' ? 'Каталог опций' : 'Options Catalog'}
      </h1>
      <p className="text-gray-500 mb-8">
        {lang === 'ru' ? 'Заводские SA-коды BMW' : 'BMW factory SA codes'}
      </p>

      {(!catData.data || catData.data.length === 0) && (
        <p className="text-gray-500">{lang === 'ru' ? 'Каталог наполняется.' : 'Catalog is being filled.'}</p>
      )}

      {catData.data && catData.data.map((cat) => (
        <div key={cat.id} className="mb-8">
          <h2 className="section-title">{cat.title}</h2>
          {cat.options && cat.options.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {cat.options.map((opt) => (
                <a key={opt.id} href={`/${lang}/options/${opt.slug || opt.sa_code}`}
                  className="card-link !p-3 flex items-center gap-3">
                  <span className="tag">{opt.sa_code}</span>
                  <span className="text-sm">{opt.title}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">
              {lang === 'ru' ? 'Нет опций в этой категории' : 'No options in this category'}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}