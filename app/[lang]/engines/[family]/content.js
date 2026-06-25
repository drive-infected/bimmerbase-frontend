'use client';

export default function FamilyContent({ lang, engines, familySlug }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {engines.map((engine) => (
        <a key={engine.id} href={`/${lang}/engines/${familySlug}/${engine.slug}`} className="card-link">
          <span className="card-title">{engine.index}</span>
          <div className="card-text mt-2 space-y-1">
            <div>{engine.power_hp} hp • {engine.torque_nm} Nm</div>
            <div>{engine.displacement} cc</div>
            {engine.vvt && engine.vvt !== 'None' && <div>{engine.vvt}</div>}
          </div>
        </a>
      ))}
    </div>
  );
}