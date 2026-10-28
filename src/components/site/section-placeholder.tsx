type Action = { label: string; href: string };

/**
 * Honest "still being prepared" page for a column that is already in the
 * navigation but not published yet. It says so, points back to the atlas,
 * and offers nothing that is not real.
 */
export function SectionPlaceholder({
  kicker,
  title,
  lede,
  status,
  actions,
}: {
  kicker: string;
  title: string;
  lede: string;
  status: string;
  actions: Action[];
}) {
  return (
    <main className="inner-page">
      <div className="inner-page__frame">
        <p className="atlas-panel-kicker">{kicker}</p>
        <h1 className="inner-page__title">{title}</h1>
        <hr className="inner-page__rule" />
        <p className="inner-page__body">{lede}</p>
        <p className="inner-page__note">{status}</p>
        <div className="inner-page__actions">
          {actions.map((action, i) => (
            <a
              key={action.href}
              className={i === 0 ? "inner-link" : "inner-link inner-link--quiet"}
              href={action.href}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
