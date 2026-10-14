import { ShieldCheck } from "lucide-react";
import Brand from "../shared/Brand.jsx";

export default function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Brand />
            <p>
              Dedicated to academic distinction, rigorous inquiry, and preparing
              transformational leaders for service across the global community.
            </p>
            <b>Institutional Accreditation</b>
            <p>
              Accredited by the Higher Learning Commission (HLC) and certified
              by the Academic Council for Graduate Education.
            </p>
          </div>
          <div>
            <h3>Academics</h3>
            <a href="#programs">Undergraduate Programs</a>
            <a href="#programs">Graduate &amp; Doctoral</a>
            <a href="#programs">Schools &amp; Colleges</a>
            <a href="#programs">Academic Calendar</a>
            <a href="#programs">Libraries &amp; Repositories</a>
          </div>
          <div>
            <h3>Campus &amp; Community</h3>
            <a href="#campus">Visit &amp; Campus Tours</a>
            <a href="#campus">Student Life &amp; Housing</a>
            <a href="#campus">Athletics &amp; Recreation</a>
            <a href="#community">Diversity &amp; Inclusion</a>
            <a href="#community">Alumni Network</a>
          </div>
          <div>
            <h3>Campus Safety</h3>
            <div className="safety-card">
              <b>
                <ShieldCheck size={13} /> Emergency Hotlines
              </b>
              <span>Campus Police: (555) 019-9111</span>
              <span>Health Services: (555) 019-4357</span>
              <small>
                24/7 Crisis Response &amp; Safe Walk dispatch available to all
                students and staff.
              </small>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © 2024 EduCore University. All rights reserved. Equal opportunity
            institution.
          </span>
          <div>
            <a href="#footer">Privacy Statement</a>
            <a href="#footer">Terms of Use</a>
            <a href="#footer">Title IX Compliance</a>
            <a href="#footer">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
