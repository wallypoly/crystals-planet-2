export function AnnouncementTicker() {
  const message = (
    <>
      <span className="atlas-ticker__message">
        10% OFF YOUR ORDER · USE CODE{" "}
        <strong className="atlas-ticker__code">WELCOME10</strong> AT CHECKOUT ·
        ONE USE PER CUSTOMER · COMBINES WITH ELIGIBLE DISCOUNTS
        <span className="atlas-ticker__separator" aria-hidden="true" />
      </span>
    </>
  );

  return (
    <aside className="atlas-ticker" aria-label="10% off your order: use code WELCOME10 at checkout">
      <div className="atlas-ticker__track" aria-hidden="true">
        {[0, 1].map((group) => (
          <div className="atlas-ticker__group" key={group}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="contents">
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
