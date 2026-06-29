// components/RelatedLinks.jsx
export default function RelatedLinks({ sections, lang }) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="mt-12 space-y-10">
      {sections.map((section) => (
        <div key={section.key}>
          <h2 className="section-title">{section.title}</h2>
          {section.items.length === 0 ? (
            <p className="text-gray-400 text-sm">
              {lang === 'ru' ? 'Нет данных' : 'No data'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => (
                <div key={item.id} className="card">
                  {item.href ? (
                    <a href={item.href} className="card-link block">
                      <span className="card-title">{item.label}</span>
                      {item.subtitle && (
                        <p className="card-text mt-1">{item.subtitle}</p>
                      )}
                    </a>
                  ) : (
                    <>
                      <span className="card-title">{item.label}</span>
                      {item.subtitle && (
                        <p className="card-text mt-1">{item.subtitle}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}