import { SPACE_ENTRIES } from "./spaces";
import "@/app/frame.css";

/**
 * Right rail: the exits into the other spaces, stacked vertically.
 *
 * It echoes the header's right zone without repeating it — the
 * header says where you can go, this says where you are and
 * offers the same four destinations as a persistent frame, so the
 * reader never has to look back up to leave the atlas.
 *
 * Server component: pure links, no state. Below 1024px frame.css
 * hides it; the header cluster and the menu drawer keep every one
 * of these entries reachable.
 */
export function SpaceRail() {
  return (
    <aside className="frame-rail frame-rail--right" aria-label="其他空间">
      <p className="frame-rail__kicker">其他空间 · Spaces</p>
      <ul className="frame-spaces__list frame-spaces">
        {SPACE_ENTRIES.map((space) => {
          const Icon = space.icon;
          return (
            <li key={space.key}>
              <a
                href={space.href}
                className="frame-spaces__item"
                aria-label={`${space.name} · ${space.en}`}
              >
                <span className="frame-spaces__text">
                  <span className="frame-spaces__name">{space.name}</span>
                  <span className="frame-spaces__en" aria-hidden="true">
                    {space.en}
                  </span>
                </span>
                <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
