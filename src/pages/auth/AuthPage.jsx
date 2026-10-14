import { BookOpen, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import Brand from "../../components/shared/Brand.jsx";
import AccessForm from "../../components/auth/AccessForm.jsx";
import HelpCard from "../../components/auth/HelpCard.jsx";
import AuthFooter from "../../components/auth/AuthFooter.jsx";
import "../../auth.css";
import "../../auth-enhancements.css";

export default function AuthPage({ initialMode = "login" }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/about#collegiate-structure">Academics</a>
          <a
            href="/admissions"
            aria-current={initialMode === "signup" ? "page" : undefined}
          >
            Admissions
          </a>
          <a href="/about#collegiate-structure">Research</a>
          <a href="/#campus">Campus Life</a>
        </nav>
        <div className="auth-header-actions">
          <a className="portal-shortcut" href="/login">
            Student Portal
          </a>
          <a className="header-apply" href="/signup">
            Apply Now
          </a>
          <a className="header-user" href="/login" aria-label="Student sign in">
            <UserRound size={17} />
          </a>
        </div>
      </header>
      <main className="auth-main">
        <div className="auth-wrap">
          <div className="identity-strip">
            <div className="identity-brand">
              <span className="identity-crest">
                <ShieldCheck size={24} />
              </span>
              <div>
                <div className="identity-title">
                  EduCore University Admissions <span>APPLICANT ACCESS</span>
                </div>
                <p>
                  Sign in or claim an account to continue your university
                  journey
                </p>
              </div>
            </div>
            <div className="identity-caption">
              <ShieldCheck size={15} /> Applicant account access
            </div>
          </div>
          <div className="auth-layout">
            <div className="auth-primary">
              <AccessForm initialMode={initialMode} />
              <div className="service-shortcuts">
                <a href="/dashboard">
                  <BookOpen />
                  <span>
                    <b>LMS &amp; Canvas</b>
                    <small>Course modules &amp; exams</small>
                  </span>
                </a>
                <a href="/dashboard#portals">
                  <KeyRound />
                  <span>
                    <b>Bursar &amp; Fees</b>
                    <small>Tuition &amp; receipts</small>
                  </span>
                </a>
                <a href="/dashboard#portals">
                  <BookOpen />
                  <span>
                    <b>Digital Library</b>
                    <small>Research archives</small>
                  </span>
                </a>
              </div>
            </div>
            <HelpCard />
          </div>
          <div className="legal-row">
            <span>
              <ShieldCheck size={16} /> EduCore University Identity Services ·
              Privacy &amp; governance
            </span>
            <div>
              <a href="/about">Digital Privacy Charter</a>
              <i>•</i>
              <a href="/about">Information Security</a>
              <i>•</i>
              <a href="mailto:support@educore.edu">Data Custodian Contact</a>
            </div>
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
