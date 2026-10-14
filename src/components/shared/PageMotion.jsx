import { useEffect } from "react";

const selector = [
  ".auth-page .identity-strip",
  ".auth-page .auth-panel",
  ".auth-page .service-shortcuts a",
  ".auth-page .legal-row",
  ".auth-page .auth-footer",
  ".design-gallery .gallery-intro",
  ".design-gallery .gallery-card",
  ".design-gallery .asset-section",
  ".design-gallery .gallery-footer",
  ".role-portal-welcome",
  ".role-portal-grid article",
  ".role-portal-help",
  ".student-welcome",
  ".student-stat",
  ".priority-action",
  ".student-course-card",
  ".assignments-panel",
  ".schedule-panel",
  ".progress-panel",
  ".bulletins-panel",
  ".records-hero",
  ".records-overview > *",
  ".records-card",
  ".records-modal",
].join(",");

export default function PageMotion() {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let visibleObserver;
    const seen = new WeakSet();
    const attach = (node) => {
      if (!(node instanceof Element)) return;
      const candidates = [];
      if (node.matches(selector)) candidates.push(node);
      candidates.push(...node.querySelectorAll(selector));
      candidates.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        element.classList.add("motion-item");
        visibleObserver.observe(element);
      });
    };

    visibleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("motion-item-visible");
          visibleObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -28px 0px" },
    );

    const mutationObserver = new MutationObserver((records) =>
      records.forEach((record) => record.addedNodes.forEach(attach)),
    );
    mutationObserver.observe(document.getElementById("root"), {
      childList: true,
      subtree: true,
    });
    attach(document.getElementById("root"));

    return () => {
      mutationObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, []);

  return null;
}
