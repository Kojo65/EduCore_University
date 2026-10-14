import { ArrowRight } from "lucide-react";
import { news } from "./homeData.js";

export default function News() {
  return (
    <section className="section news-section" id="news">
      <div className="container">
        <div className="section-heading heading-row">
          <div>
            <span className="kicker">University Gazette · 2024 Archive</span>
            <h2>News &amp; Academic Milestones</h2>
          </div>
          <a className="all-news" href="#news">
            All Announcements <ArrowRight size={14} />
          </a>
        </div>
        <div className="news-grid">
          {news.map((item, index) => (
            <article className="news-card" key={item.title}>
              <div className="news-body">
                <div className="card-meta">
                  <span className={`news-tag tag-${index}`}>{item.kind}</span>
                  <time>{item.date}</time>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <a className="news-link" href="#news">
                {item.link} <ArrowRight size={13} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
