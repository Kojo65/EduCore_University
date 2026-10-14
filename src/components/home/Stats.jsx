import { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: 24000,
    suffix: "+",
    title: "Enrolled Scholars",
    caption: "Across 4 premier state faculties",
  },
  {
    value: 98.4,
    suffix: "%",
    precision: 1,
    title: "Graduate Employment",
    caption: "Within 6 months of graduation",
  },
  {
    value: 140,
    suffix: "+",
    title: "Accredited Programs",
    caption: "STEM, Juris Doctor, & Management",
  },
  {
    value: 18,
    suffix: ":1",
    title: "Student-Faculty Ratio",
    caption: "Personalized scholarly mentorship",
  },
];

function AnimatedNumber({ value, precision = 0 }) {
  const [count, setCount] = useState(0);
  const numberRef = useRef(null);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frameId;
    let observer;

    const animate = () => {
      const duration = 1800;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(progress === 1 ? value : value * eased);
        if (progress < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    };

    if (prefersReducedMotion) {
      setCount(value);
    } else if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            animate();
          }
        },
        { threshold: 0.35 },
      );
      observer.observe(element);
    } else {
      animate();
    }

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [value]);

  return (
    <span
      ref={numberRef}
      aria-label={value.toLocaleString("en-US", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })}
    >
      {count.toLocaleString("en-US", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="stats" aria-label="University at a glance">
      <div className="container stat-grid">
        {stats.map(({ value, suffix, precision, title, caption }) => (
          <article className="stat" key={title}>
            <div className="stat-number">
              <AnimatedNumber value={value} precision={precision} />
              <span className={suffix === ":1" ? "stat-ratio" : ""}>
                {suffix}
              </span>
            </div>
            <div className="stat-title">{title}</div>
            <p>{caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
