import Brand from "../shared/Brand.jsx";

export default function AuthFooter() {
  return (
    <footer className="auth-footer">
      <div>
        <Brand />
        <p>
          Academic distinction, rigorous inquiry, and service to our global
          community.
        </p>
      </div>
      <div>
        <h3>Academics</h3>
        <a href="/about">About EduCore</a>
        <a href="/">University Home</a>
        <a href="mailto:support@educore.edu">Contact Support</a>
      </div>
      <div>
        <h3>Account help</h3>
        <a href="mailto:support@educore.edu">IT Help Desk</a>
        <a href="/about">Privacy &amp; governance</a>
        <a href="tel:+15550194357">+1 (555) 019-4357</a>
      </div>
      <small>© 2026 EduCore University. All rights reserved.</small>
    </footer>
  );
}
