import { useEffect } from "react";
import "../../styles.css";
import Header from "../../components/home/Header.jsx";
import Hero from "../../components/home/Hero.jsx";
import Stats from "../../components/home/Stats.jsx";
import Programs from "../../components/home/Programs.jsx";
import Impact from "../../components/home/Impact.jsx";
import Campus from "../../components/home/Campus.jsx";
import News from "../../components/home/News.jsx";
import Community from "../../components/home/Community.jsx";
import Admissions from "../../components/home/Admissions.jsx";
import Footer from "../../components/home/Footer.jsx";

export default function HomePage() {
  useEffect(() => {
    const targets = document.querySelectorAll(
      ".hero-content, .stat, .section-heading, .program-card, .feature-card, .campus-copy, .campus-image-wrap, .news-card, .quote-card, .admissions-card",
    );
    if (!("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)")
        .matches
    )
      return;
    const selector = ".program-card, .feature-card, .news-card";
    let frame = 0;
    let activeCard = null;
    const onMove = (event) => {
      const card = event.target.closest?.(selector);
      if (!card) return;
      if (activeCard && activeCard !== card) reset(activeCard);
      activeCard = card;
      const rect = card.getBoundingClientRect();
      const tiltX = ((event.clientY - rect.top) / rect.height - 0.5) * -3;
      const tiltY = ((event.clientX - rect.left) / rect.width - 0.5) * 3;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
      });
    };
    const reset = (card) => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    };
    const onLeave = () => {
      if (activeCard) reset(activeCard);
      activeCard = null;
    };
    const onOut = (event) => {
      const card = event.target.closest?.(selector);
      const staysInCard =
        event.relatedTarget instanceof Node &&
        card?.contains(event.relatedTarget);
      if (card && !staysInCard) {
        reset(card);
        if (activeCard === card) activeCard = null;
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const heroPhoto = document.querySelector(".hero-photo");
    if (!heroPhoto) return;
    const updateParallax = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.14, 72);
        heroPhoto.style.setProperty("--hero-shift", `${offset.toFixed(1)}px`);
      });
    };
    window.addEventListener("scroll", updateParallax, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateParallax);
    };
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Programs />
        <Impact />
        <Campus />
        <News />
        <Community />
        <Admissions />
      </main>
      <Footer />
    </>
  );
}
