export default function DesignGallery({ designs, suppliedAssets }) {
  return (
    <main className="design-gallery">
      <header className="gallery-header">
        <a
          className="gallery-brand"
          href="/"
          aria-label="EduCore University home"
        >
          <img
            src="/supplied-assets/educore-wordmark.svg"
            alt="EduCore University LMS Portal"
          />
        </a>
        <div className="gallery-caption">Original page designs</div>
      </header>
      <section className="gallery-intro">
        <span className="gallery-kicker">EduCore University</span>
        <h1>Explore the website designs</h1>
        <p>Open a page to view its supplied HTML design as provided.</p>
      </section>
      <section className="gallery-grid" aria-label="Website design pages">
        {designs.map((design) => (
          <a
            className="gallery-card"
            href={`/${design.slug}`}
            key={design.slug}
          >
            <div className="gallery-preview">
              <img
                src={`/reference-pages/${design.folder}/screen.png`}
                alt=""
                loading="lazy"
              />
            </div>
            <div className="gallery-card-copy">
              <div>
                <h2>{design.title}</h2>
                <p>{design.description}</p>
              </div>
              <span aria-hidden="true">{"\u2197"}</span>
            </div>
          </a>
        ))}
      </section>
      <section className="asset-section">
        <div className="asset-heading">
          <h2>Supplied image and brand assets</h2>
          <p>
            Original assets from the campus, student portrait, and wordmark
            folders.
          </p>
        </div>
        <div className="asset-grid">
          {suppliedAssets.map((asset) => (
            <a
              className="asset-card"
              key={asset.file}
              href={`/supplied-assets/${asset.file}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={`/supplied-assets/${asset.file}`}
                alt=""
                loading="lazy"
              />
              <span>
                <b>{asset.title}</b>
                <small>{asset.description}</small>
              </span>
            </a>
          ))}
        </div>
      </section>
      <footer className="gallery-footer">
        EduCore University {"\u00b7"} Design previews
      </footer>
    </main>
  );
}
