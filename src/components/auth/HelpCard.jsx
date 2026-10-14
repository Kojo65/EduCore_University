import {
  Check,
  ChevronRight,
  Headphones,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function HelpCard() {
  return (
    <aside
      className="auth-aside"
      aria-label="Account help and service information"
    >
      <section className="auth-panel help-panel">
        <div className="help-heading">
          <span className="help-icon">
            <Headphones size={20} />
          </span>
          <div>
            <h2>IT Help Desk</h2>
            <p>Center for Digital Services</p>
          </div>
        </div>
        <p className="help-intro">
          Need help accessing your account? Contact the university support team
          for assistance.
        </p>
        <a className="help-option" href="tel:+15550194357">
          <Phone />
          <span>
            <b>Priority Hotline</b>
            <small>+1 (555) 019-4357 (Ext 404)</small>
          </span>
          <ChevronRight />
        </a>
        <a className="help-option" href="mailto:support@educore.edu">
          <MessageSquare />
          <span>
            <b>Email Support</b>
            <small>support@educore.edu</small>
          </span>
          <ChevronRight />
        </a>
        <div className="support-desk">
          <b>PHYSICAL SUPPORT DESK</b>
          <span>Balme Memorial Library, Ground Wing B09</span>
          <span>Mon – Sat: 07:30 – 22:00 GMT</span>
        </div>
      </section>
      <section className="service-panel">
        <div className="service-kicker">
          <ShieldCheck size={16} /> ACCOUNT ACCESS
        </div>
        <h2>One place for your university services</h2>
        <p>
          Sign in to access learning resources, academic records, and campus
          services.
        </p>
        <div className="service-note">
          <Check size={15} /> Your account credentials stay private
        </div>
      </section>
      <section className="auth-panel governance-panel">
        <b>IDENTITY &amp; PRIVACY</b>
        <div>
          <span>Privacy focused</span>
          <span>Secure account access</span>
        </div>
        <small>
          Never share your password or verification codes with anyone.
        </small>
      </section>
    </aside>
  );
}
