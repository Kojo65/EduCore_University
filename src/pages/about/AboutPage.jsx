import { useRef } from "react";

const destinations = {
  home: "/",
  about: "/about",
  academics: "/about#collegiate-structure",
  admissions: "/admissions",
  research: "/about#collegiate-structure",
  "campus-life": "/#campus",
  "news-and-events": "/#news",
  "student-portal": "/login",
  "sign-in-apply": "/admissions",
};

export default function AboutPage({ design }) {
  const frameRef = useRef(null);

  function connectNavigation() {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    let style = doc.getElementById("about-navbar-layout");
    if (!style) {
      style = doc.createElement("style");
      style.id = "about-navbar-layout";
      doc.head.appendChild(style);
    }
    style.textContent = `
      header{position:sticky!important;top:0!important;z-index:50!important}
      header>div{max-width:100%!important;padding-inline:clamp(12px,2.2vw,32px)!important;gap:clamp(6px,1vw,16px)!important}
      header nav[data-active-classes]{display:flex!important;align-items:center;justify-content:center;gap:2px!important;flex:1 1 auto;min-width:0}
      header nav[data-active-classes] a{font-size:clamp(10px,.85vw,13px)!important;line-height:1.2!important;padding:6px 5px!important;white-space:nowrap}
      header>div>div:last-child{gap:6px!important}
      .about-home-brand{display:block;flex:none;line-height:0}
      .about-home-brand img{display:block;width:164px;height:auto}
      main{padding-top:0!important}
      @keyframes about-section-enter{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:none}}
      header{animation:about-section-enter 550ms cubic-bezier(.2,.7,.2,1) both}
      main>*{animation:about-section-enter 620ms cubic-bezier(.2,.7,.2,1) both}
      main>*:nth-child(2){animation-delay:70ms}main>*:nth-child(3){animation-delay:130ms}main>*:nth-child(4){animation-delay:190ms}main>*:nth-child(5){animation-delay:240ms}
      @media(prefers-reduced-motion:reduce){header,main>*{animation:none!important}}
      @media(max-width:1000px){header>div{flex-wrap:wrap!important}header nav[data-active-classes]{order:3;flex:1 0 100%;justify-content:flex-start;flex-wrap:wrap;padding-bottom:6px}header>div>div:last-child{margin-left:auto}}
      @media(max-width:520px){.about-home-brand img{width:148px}header nav[data-active-classes] a{font-size:10px!important;padding:5px 4px!important}header>div>div:last-child>a:first-child{display:none}}
    `;
    doc.querySelectorAll("[data-path]").forEach((link) => {
      const destination = destinations[link.dataset.path];
      if (destination) link.setAttribute("href", destination);
    });

    const brandContainer = doc.querySelector("header>div>div:first-child");
    if (brandContainer) {
      const brand = doc.createElement("a");
      brand.className = "about-home-brand";
      brand.href = "/";
      brand.setAttribute("aria-label", "EduCore University home");
      brand.innerHTML =
        '<img src="/supplied-assets/educore-wordmark.svg" alt="EduCore University" />';
      brandContainer.replaceChildren(brand);
    }

    const aboutLink = doc.querySelector('nav [data-path="about"]');
    if (aboutLink) {
      aboutLink.classList.remove("text-on-surface-variant");
      aboutLink.classList.add("bg-primary-container", "text-on-primary");
      aboutLink.setAttribute("aria-current", "page");
    }
  }

  return (
    <iframe
      ref={frameRef}
      className="reference-page"
      title={design.title}
      src={`/reference-pages/${design.folder}/code.html`}
      onLoad={connectNavigation}
    />
  );
}
