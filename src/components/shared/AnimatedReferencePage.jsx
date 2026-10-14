import { useRef } from "react";

export default function AnimatedReferencePage({ title, src, activePath }) {
  const frameRef = useRef(null);

  function animateFrame() {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.head || doc.getElementById("educore-reference-motion")) return;
    const style = doc.createElement("style");
    style.id = "educore-reference-motion";
    const selectedPath = /^[a-z-]+$/.test(activePath || "") ? activePath : "";
    if (selectedPath) {
      const selectedLink = doc.querySelector(`a[data-path="${selectedPath}"]`);
      selectedLink?.setAttribute("aria-current", "page");
    }
    style.textContent = `
      @keyframes reference-page-enter{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
      body>*{animation:reference-page-enter 650ms cubic-bezier(.2,.7,.2,1) both}
      body>*:nth-child(2){animation-delay:75ms}body>*:nth-child(3){animation-delay:140ms}
      ${selectedPath ? `a[data-path="${selectedPath}"]{background:#e8edff!important;color:#173c91!important;font-weight:700!important}` : ""}
      @media(prefers-reduced-motion:reduce){body>*{animation:none!important}}
    `;
    doc.head.appendChild(style);
  }

  return (
    <iframe
      ref={frameRef}
      className="reference-page"
      title={title}
      src={src}
      onLoad={animateFrame}
    />
  );
}
