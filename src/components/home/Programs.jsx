import { useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { programs } from "./homeData.js";

export default function Programs() {
  const [active, setActive] = useState("Undergraduate");
  return (
    <section className="section programs-section" id="programs">
      <div className="container">
        <div className="section-heading heading-row">
          <div>
            <span className="kicker">Curriculum Distinction</span>
            <h2>Featured Academic Programs</h2>
            <p>
              Rigorously engineered degree paths combining theoretical
              excellence with enterprise-level hands-on laboratory immersions.
            </p>
          </div>
          <div className="tabs" role="tablist" aria-label="Program level">
            {Object.keys(programs).map((name) => (
              <button
                key={name}
                role="tab"
                aria-selected={active === name}
                className={active === name ? "active" : ""}
                onClick={() => setActive(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="program-grid">
          {programs[active].map((item) => (
            <article className="program-card" key={item.title}>
              <div>
                <div className="card-meta">
                  <span className="badge">{item.badge}</span>
                  <span className="duration">
                    <Clock3 size={13} />
                    {item.length}
                  </span>
                </div>
                <div className="faculty">{item.faculty}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <a className="card-link" href="/admissions">
                Program Curriculum <ArrowRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
