export default function Community() {
  return (
    <section className="section community-section" id="community">
      <div className="container">
        <div className="section-heading centered">
          <span className="kicker">Scholarly Testimonials</span>
          <h2>Perspectives from Our Community</h2>
          <p>
            Hear directly from the students and researchers driving
            transformation across disciplines.
          </p>
        </div>
        <div className="quote-grid">
          <blockquote className="quote-card">
            <p>
              “The interdisciplinary curriculum at EduCore allowed me to bridge
              applied computer hardware with machine intelligence. Between the
              university’s microelectronics laboratory and direct faculty
              sponsorship, I co-authored two peer-reviewed papers before
              completing my junior year.”
            </p>
            <footer>
              <span className="initials">IT</span>
              <span>
                <b>Isaac Thorne</b>
                <small>
                  B.Sc. Artificial Intelligence Scholar, Class of ’25
                </small>
              </span>
            </footer>
          </blockquote>
          <blockquote className="quote-card">
            <p>
              “EduCore’s Law &amp; Technology Fellowship provides an
              unparalleled platform for legal scholars. Our collaborative ties
              with Silicon Valley and international regulatory bodies give our
              research direct policy weight in global judicial forums.”
            </p>
            <footer>
              <span className="initials blue">DR</span>
              <span>
                <b>Dr. Renata Morales</b>
                <small>Doctoral Fellow in International Jurisprudence</small>
              </span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
