export default function Admissions() {
  return (
    <section className="admissions-section" id="admissions">
      <div className="container">
        <div className="admissions-card">
          <div>
            <span className="kicker">Your Academic Journey Begins Here</span>
            <h2>Ready to Shape the Future with Us?</h2>
            <p>
              Connect with an admissions counselor, schedule your bespoke campus
              visit, or begin your digital application today.
            </p>
          </div>
          <div className="admissions-actions">
            <a className="button button-white" href="/signup">
              Start Application
            </a>
            <a
              className="button button-light"
              href="mailto:admissions@educore.edu"
            >
              Request Information
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
