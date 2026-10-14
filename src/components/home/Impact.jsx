import { features } from "./homeData.js";

export default function Impact() {
  return (
    <section className="section impact-section" id="impact">
      <div className="container">
        <div className="section-heading">
          <span className="kicker">Executive Foundation</span>
          <h2>Engineered for Lifelong Impact</h2>
          <p>
            Four essential cornerstones defining EduCore’s institutional
            distinction.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon size={21} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
