export default function Brand({ className = "", href = "/" }) {
  return (
    <a
      className={`brand auth-brand ${className}`.trim()}
      href={href}
      aria-label="EduCore University home"
    >
      <img
        src="/supplied-assets/educore-wordmark.svg"
        alt="EduCore University LMS Portal"
      />
    </a>
  );
}
