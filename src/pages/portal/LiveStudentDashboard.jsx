import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import "./live-student-dashboard.css";

const money = (value) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format((value || 0) / 100);

export default function LiveStudentDashboard({ account }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/student/overview", { credentials: "include" })
      .then(async (response) => {
        if (response.status === 401) {
          location.replace(
            `/login?next=${encodeURIComponent(location.pathname)}`,
          );
          return null;
        }
        const result = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            result?.error?.message ||
              "Your academic overview could not be loaded.",
          );
        return result?.data || null;
      })
      .then((result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason.message || "Your academic overview could not be loaded.",
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  function signOut() {
    location.assign(`/signout?from=${encodeURIComponent(location.pathname)}`);
  }
  if (loading)
    return (
      <main className="live-dashboard-state" aria-live="polite">
        Loading your academic overview…
      </main>
    );
  if (error)
    return (
      <main className="live-dashboard-state">
        <section role="alert">
          <b>Dashboard unavailable</b>
          <p>{error}</p>
          <button onClick={() => location.reload()}>Try again</button>
        </section>
      </main>
    );
  const student = data?.student || account;
  const summary = data?.summary || {};
  const courses = data?.courses || [];
  const assignments = data?.assignments || [];
  const schedule = data?.schedule || [];
  const announcements = data?.announcements || [];
  return (
    <div className="live-dashboard">
      {menuOpen && (
        <button
          className="live-dashboard-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`live-dashboard-sidebar${menuOpen ? " open" : ""}`}>
        <a className="live-dashboard-brand" href="/">
          <img src="/supplied-assets/educore-wordmark.svg" alt="" />
          <span>
            <b>EduCore</b>
            <small>UNIVERSITY PORTAL</small>
          </span>
        </a>
        <p className="live-nav-caption">Your learning</p>
        <nav>
          <a className="selected" href="/dashboard">
            <LayoutDashboard size={17} />
            Dashboard
          </a>
          <a href="/my-courses">
            <BookOpen size={17} />
            My Courses <small>{courses.length}</small>
          </a>
          <a href="/catalog">
            <Library size={17} />
            Course Catalog
          </a>
          <a href="/schedule">
            <CalendarDays size={17} />
            Schedule
          </a>
          <a href="/assignments">
            <FileText size={17} />
            Assignments <small>{assignments.length}</small>
          </a>
          <a href="/examinations">
            <ShieldCheck size={17} />
            Examinations <small>{data?.upcomingExams?.length || 0}</small>
          </a>
          <a href="/records">
            <GraduationCap size={17} />
            Results &amp; GPA
          </a>
          <a href="/library">
            <Library size={17} />
            Digital Library
          </a>
          <a href="/finance">
            <Wallet size={17} />
            Fees &amp; Finance
          </a>
          <a href="/announcements">
            <Bell size={17} />
            Announcements
          </a>
        </nav>
        <div className="live-dashboard-sidebar-footer">
          <span>
            {student?.name || "Student"}
            <small>{student?.universityId || student?.email}</small>
          </span>
          <button aria-label="Sign out" onClick={signOut}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className="live-dashboard-main">
        <header className="live-dashboard-topbar">
          <button
            className="live-menu-button"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={19} />
          </button>
          <label>
            <Search size={16} />
            <input placeholder="Search courses, assignments, faculty…" />
          </label>
          <span className="live-current-term">
            <CalendarDays size={15} />
            {data?.semester?.name || "Academic term"}{" "}
            {data?.semester?.academic_year || ""}
          </span>
          <a
            href="/announcements"
            className="live-notification-button"
            aria-label={`${summary.unreadNotifications || 0} unread notifications`}
          >
            <Bell size={18} />
            {summary.unreadNotifications > 0 && (
              <i>{summary.unreadNotifications}</i>
            )}
          </a>
        </header>
        <div className="live-dashboard-content">
          <section className="live-welcome">
            <div>
              <span className="live-eyebrow">
                STUDENT PORTAL · {student?.college || "EduCore University"}
              </span>
              <h1>
                Welcome back,{" "}
                {(student?.name || "Student").trim().split(/\s+/)[0]}
              </h1>
              <p>
                Your overview reflects the academic records currently available
                for your account.
              </p>
            </div>
            <a className="live-primary-action" href="/catalog">
              Plan your courses <ArrowRight size={16} />
            </a>
          </section>
          <section className="live-metrics" aria-label="Academic summary">
            <article>
              <span>
                <GraduationCap size={17} />
              </span>
              <small>Current GPA</small>
              <strong>
                {summary.gpa === null || summary.gpa === undefined
                  ? "—"
                  : `${summary.gpa.toFixed(2)} / 4.00`}
              </strong>
              <p>
                {summary.gpa === null || summary.gpa === undefined
                  ? "No published grades yet"
                  : "Calculated from published grade items"}
              </p>
            </article>
            <article>
              <span>
                <BookOpen size={17} />
              </span>
              <small>Current course load</small>
              <strong>{summary.credits || 0} credits</strong>
              <p>{summary.courses || 0} approved courses this term</p>
            </article>
            <article>
              <span>
                <Activity size={17} />
              </span>
              <small>Attendance</small>
              <strong>
                {summary.attendancePercent === null ||
                summary.attendancePercent === undefined
                  ? "—"
                  : `${summary.attendancePercent}%`}
              </strong>
              <p>
                {summary.attendanceSessions
                  ? `${summary.attendanceSessions} recorded sessions`
                  : "No attendance records yet"}
              </p>
            </article>
            <article>
              <span>
                <Wallet size={17} />
              </span>
              <small>Outstanding balance</small>
              <strong>
                {summary.invoices
                  ? money(summary.outstandingBalanceCents)
                  : "—"}
              </strong>
              <p>
                {summary.invoices
                  ? "From issued invoices"
                  : "No invoices on file"}
              </p>
            </article>
          </section>
          <div className="live-dashboard-grid">
            <section className="live-panel live-courses">
              <header>
                <div>
                  <span className="live-eyebrow">ACADEMIC RECORD</span>
                  <h2>My courses</h2>
                </div>
                <a href="/my-courses">
                  View all <ArrowRight size={14} />
                </a>
              </header>
              {courses.length ? (
                courses.map((course) => (
                  <article className="live-course-row" key={course.code}>
                    <span className="live-course-code">{course.code}</span>
                    <div>
                      <b>{course.title}</b>
                      <small>
                        {course.instructor} · {course.credits} credits
                      </small>
                    </div>
                    <span className="live-status">{course.status}</span>
                  </article>
                ))
              ) : (
                <div className="live-empty">
                  <BookOpen size={20} />
                  <b>No approved courses yet</b>
                  <p>
                    Once your registration is approved, courses will appear
                    here.
                  </p>
                  <a href="/catalog">Browse the catalog</a>
                </div>
              )}
            </section>
            <section className="live-panel live-assignments">
              <header>
                <div>
                  <span className="live-eyebrow">NEXT UP</span>
                  <h2>Coursework deadlines</h2>
                </div>
                <a href="/assignments">
                  Coursework <ArrowRight size={14} />
                </a>
              </header>
              {assignments.length ? (
                assignments.map((item) => (
                  <article className="live-assignment-row" key={item.id}>
                    <span className="live-assignment-icon">
                      <Clock3 size={16} />
                    </span>
                    <div>
                      <small>
                        {item.code} · {item.due}
                      </small>
                      <b>{item.title}</b>
                      <p>{item.detail}</p>
                    </div>
                    <a href="/assignments" aria-label={`Open ${item.title}`}>
                      <ArrowRight size={15} />
                    </a>
                  </article>
                ))
              ) : (
                <div className="live-empty">
                  <CheckCircle2 size={20} />
                  <b>No upcoming deadlines</b>
                  <p>
                    Assignment dates for your enrolled courses will appear here.
                  </p>
                </div>
              )}
            </section>
            <section className="live-panel live-schedule">
              <header>
                <div>
                  <span className="live-eyebrow">WEEKLY OVERVIEW</span>
                  <h2>Class schedule</h2>
                </div>
                <a href="/schedule">
                  Full schedule <ArrowRight size={14} />
                </a>
              </header>
              {schedule.length ? (
                <div className="live-schedule-list">
                  {schedule.map((item, index) => (
                    <article key={`${item.code}-${item.day}-${item.start}`}>
                      <span className="live-schedule-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <b>
                          {item.code} · {item.title}
                        </b>
                        <small>
                          {[
                            "",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ][item.day] || "Meeting"}{" "}
                          · {item.start}–{item.end} · {item.room}
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="live-empty">
                  <CalendarDays size={20} />
                  <b>No class meetings listed</b>
                  <p>
                    Meeting times will appear when an approved course section
                    has a schedule.
                  </p>
                </div>
              )}
            </section>
            <section className="live-panel live-announcements">
              <header>
                <div>
                  <span className="live-eyebrow">UNIVERSITY UPDATES</span>
                  <h2>Announcements</h2>
                </div>
                <a href="/announcements">
                  All updates <ArrowRight size={14} />
                </a>
              </header>
              {announcements.length ? (
                announcements.map((item) => (
                  <article className="live-announcement" key={item.id}>
                    <span>{item.category}</span>
                    <b>{item.title}</b>
                    <p>{item.detail}</p>
                    <small>
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "Recently published"}
                    </small>
                  </article>
                ))
              ) : (
                <div className="live-empty">
                  <Bell size={20} />
                  <b>No announcements right now</b>
                  <p>
                    University-wide notices will appear here when published.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
