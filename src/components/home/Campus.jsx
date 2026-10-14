import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  MapPin,
  Network,
  TreePine,
  Users,
  X,
} from "lucide-react";

const facts = [
  [TreePine, "240-Acre Quad"],
  [Users, "180+ Clubs"],
  [Network, "NCAA Division I"],
  [MapPin, "12 Residence Halls"],
];
const campusSpots = [
  {
    id: "quad",
    name: "Central Quadrangle",
    detail:
      "A 240-acre campus framed by historic sandstone buildings and modern academic spaces.",
    position: "spot-quad",
  },
  {
    id: "sciences",
    name: "Faculty of Sciences",
    detail:
      "Home to the Center for Academic Excellence and interdisciplinary learning spaces.",
    position: "spot-sciences",
  },
  {
    id: "residences",
    name: "Residence Halls",
    detail:
      "Twelve residence halls keep student life connected to the heart of campus.",
    position: "spot-residences",
  },
  {
    id: "athletics",
    name: "Athletics & Recreation",
    detail:
      "NCAA Division I athletics and recreation facilities bring the campus community together.",
    position: "spot-athletics",
  },
];

export default function Campus() {
  const [tourOpen, setTourOpen] = useState(false);
  const [activeSpot, setActiveSpot] = useState(campusSpots[0]);
  const tourRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!tourOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setTourOpen(false);
      if (event.key !== "Tab") return;
      const focusable = [
        ...(tourRef.current?.querySelectorAll("button, a[href]") || []),
      ];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable.at(-1).focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === focusable.at(-1)
      ) {
        event.preventDefault();
        focusable[0].focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [tourOpen]);

  return (
    <>
      <section className="section campus-section" id="campus">
        <div className="container campus-grid">
          <div className="campus-copy">
            <span className="kicker">Vibrant Community</span>
            <h2>Life on the North Hill Campus</h2>
            <p>
              Spanning over 240 pristine acres, EduCore University blends
              historic sandstone architecture with energy-efficient glass
              pavilions. Over 180 registered student organizations, championship
              athletics, and open common greens foster an invigorating
              intellectual and social collegiate life.
            </p>
            <div className="campus-facts">
              {facts.map(([Icon, label]) => (
                <div key={label}>
                  <Icon size={15} />
                  {label}
                </div>
              ))}
            </div>
            <button
              className="button button-navy"
              type="button"
              onClick={() => setTourOpen(true)}
            >
              Take Virtual Campus Tour <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="campus-image-wrap">
            <img
              className="campus-image"
              src="/campus.png"
              alt="Students walking across EduCore University's green central quad between modern academic buildings"
            />
            <div className="map-card" id="campus-map">
              <span className="map-dot" />
              <div>
                <b>Center for Academic Excellence</b>
                <small>Central Quadrangle &amp; Faculty of Sciences</small>
              </div>
              <button type="button" onClick={() => setTourOpen(true)}>
                View Campus Highlights <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>
      {tourOpen && (
        <div
          className="campus-tour-backdrop"
          onClick={() => setTourOpen(false)}
        >
          <section
            className="campus-tour"
            ref={tourRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="campus-tour-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeRef}
              className="campus-tour-close"
              type="button"
              aria-label="Close campus tour"
              onClick={() => setTourOpen(false)}
            >
              <X size={19} />
            </button>
            <div className="campus-tour-heading">
              <span className="kicker">Explore North Hill</span>
              <h2 id="campus-tour-title">A campus with room to grow</h2>
              <p>
                Choose a highlight to explore. This illustrated guide is for
                orientation, not turn-by-turn navigation.
              </p>
            </div>
            <div className="campus-tour-layout">
              <div
                className="campus-tour-map"
                role="group"
                aria-label="Illustrated campus highlights"
              >
                {campusSpots.map((spot, index) => (
                  <button
                    key={spot.id}
                    type="button"
                    className={`campus-map-pin ${spot.position}${activeSpot.id === spot.id ? " active" : ""}`}
                    aria-pressed={activeSpot.id === spot.id}
                    onClick={() => setActiveSpot(spot)}
                  >
                    <span>{index + 1}</span>
                    <small>{spot.name}</small>
                  </button>
                ))}
              </div>
              <div className="campus-tour-detail">
                <span className="campus-tour-number">
                  {String(
                    campusSpots.findIndex((spot) => spot.id === activeSpot.id) +
                      1,
                  ).padStart(2, "0")}
                </span>
                <h3>{activeSpot.name}</h3>
                <p>{activeSpot.detail}</p>
                <a href="#admissions" onClick={() => setTourOpen(false)}>
                  Plan a campus visit <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
