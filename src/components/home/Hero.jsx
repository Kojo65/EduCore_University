import { ArrowRight, BookOpen } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-photo" />
      <div className="hero-shade" />
      <div className="hero-content container">
        <div className="eyebrow-pill">
          <span /> Ranked #1 Innovation &amp; Technology Hub
        </div>
        <h1>Empowering the Next Generation of Leaders</h1>
        <p>
          A world-renowned collegiate institution pioneering research,
          cutting-edge engineering, and transformative higher education tailored
          for global impact.
        </p>
        <div className="hero-actions">
          <a className="button button-blue" href="/signup">
            Apply Now <ArrowRight size={15} />
          </a>
          <a className="button button-glass" href="#programs">
            <BookOpen size={15} /> Explore Programs
          </a>
        </div>
      </div>
    </section>
  );
}
