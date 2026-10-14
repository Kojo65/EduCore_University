import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  GraduationCap,
  KeyRound,
  Library,
  ShieldCheck,
  Users,
  Wallet,
  UserRound,
} from "lucide-react";
import StudentDashboard from "./LiveStudentDashboard.jsx";
import "./role-portal.css";
import "./staff-workspace.css";

function RolePortal({ account }) {
  const [analytics, setAnalytics] = useState(null),
    [analyticsState, setAnalyticsState] = useState("idle");
  const role =
    account.roles?.find(
      (item) => !["Student", "Applicant", "Alumni"].includes(item),
    ) ||
    account.persona ||
    "Student";
  const applicant = role === "Applicant",
    alumni = role === "Alumni";
  useEffect(() => {
    if (!account.permissions?.includes("analytics.read")) return;
    let active = true;
    setAnalyticsState("loading");
    fetch("/api/analytics/overview", { credentials: "include" })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(result?.error?.message || "Overview unavailable");
        return result.data;
      })
      .then((data) => {
        if (active) {
          setAnalytics(data);
          setAnalyticsState("ready");
        }
      })
      .catch(() => {
        if (active) setAnalyticsState("error");
      });
    return () => {
      active = false;
    };
  }, [account]);
  function signOut() {
    window.location.assign(
      `/signout?from=${encodeURIComponent(window.location.pathname)}`,
    );
  }
  const cards = [];
  const add = (condition, title, copy, Icon, href, action) => {
    if (condition) cards.push({ title, copy, Icon, href, action });
  };
  add(
    account.permissions?.includes("users.manage"),
    "Identity & access",
    "Review accounts and manage assigned university roles.",
    ShieldCheck,
    "/admin/users",
    "Manage accounts",
  );
  add(
    account.permissions?.includes("courses.manage") ||
      account.permissions?.includes("courses.teach"),
    "Teaching workspace",
    "Your course and student access follows your teaching permissions.",
    BookOpen,
    "/my-courses",
    "Open courses",
  );
  add(
    account.permissions?.includes("enrollments.approve"),
    "Registration review",
    analytics?.registrationReview != null
      ? `${analytics.registrationReview} requests await review.`
      : "Review submitted student course selections and advisor decisions.",
    ClipboardCheck,
    "/my-courses",
    "Review registrations",
  );
  add(
    account.permissions?.includes("finance.manage"),
    "Finance operations",
    "Review student finance records and payment activity.",
    Wallet,
    "/finance",
    "Open finance",
  );
  add(
    account.permissions?.includes("advising.read"),
    "Academic advising",
    "Support student progress and review advising records.",
    Activity,
    "/dashboard",
    "Advising overview",
  );
  add(
    account.permissions?.includes("announcements.manage"),
    "University communications",
    "Prepare notices for audiences you are authorized to reach.",
    Bell,
    "/announcements",
    "Announcements",
  );
  const metrics = analytics
    ? [
        [
          "Students",
          analytics.students.active,
          `${analytics.students.total} total`,
          Users,
        ],
        [
          "Teaching staff",
          analytics.lecturers,
          "Lecturers and teaching assistants",
          BriefcaseBusiness,
        ],
        ["Courses", analytics.courses, "In the academic catalog", BookOpen],
        [
          "Departments",
          analytics.departments,
          `${analytics.faculties} faculties`,
          GraduationCap,
        ],
        [
          "Enrolled",
          analytics.enrollment,
          "Approved or registered",
          ClipboardCheck,
        ],
        [
          "Outstanding fees",
          new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "USD",
          }).format(analytics.outstandingCents / 100),
          "Unpaid invoice balances",
          Wallet,
        ],
      ]
    : [];
  return (
    <main className="role-portal">
      <header className="role-portal-header">
        <a className="role-portal-brand" href="/">
          <img src="/supplied-assets/educore-wordmark.svg" alt="" />
          <span>
            <b>EduCore</b>
            <small>UNIVERSITY PORTAL</small>
          </span>
        </a>
        <button type="button" onClick={signOut}>
          Sign out <ArrowRight size={15} />
        </button>
      </header>
      <section className="role-portal-content">
        <div className="role-portal-welcome">
          <span className="role-portal-kicker">
            SECURE UNIVERSITY ACCOUNT · {role.toUpperCase()}
          </span>
          <h1>
            {applicant
              ? "Applicant Portal"
              : alumni
                ? "Alumni Portal"
                : `Welcome, ${account.name}`}
          </h1>
          <p>
            {applicant
              ? "Manage your application journey and keep your contact details current."
              : alumni
                ? "Stay connected with EduCore and keep your alumni profile up to date."
                : "Your university workspace for academic and institutional responsibilities."}
          </p>
          <div className="role-portal-meta">
            <span>
              <b>Account type</b>
              {role}
            </span>
            <span>
              <b>University ID</b>
              {account.universityId || "Not provided"}
            </span>
            <span>
              <b>College / Faculty</b>
              {account.college || "Not provided"}
            </span>
          </div>
        </div>
        {!applicant && !alumni && (
          <section className="staff-workspace">
            <header>
              <div>
                <span>AUTHORIZED WORKSPACE</span>
                <h2>
                  {analytics?.activeSemester
                    ? `${analytics.activeSemester.name} · ${analytics.activeSemester.academicYear}`
                    : "University operations"}
                </h2>
              </div>
              <small>
                <ShieldCheck size={14} /> Permissions verified by EduCore
              </small>
            </header>
            {account.permissions?.includes("analytics.read") && (
              <div className="staff-metrics" aria-live="polite">
                {analyticsState === "loading" ? (
                  <p className="staff-state">Loading institutional overview…</p>
                ) : analyticsState === "error" ? (
                  <p className="staff-state">
                    Institutional overview is unavailable. Reload to try again.
                  </p>
                ) : (
                  metrics.map(([label, value, note, Icon]) => (
                    <article key={label}>
                      <span>
                        <Icon size={16} />
                      </span>
                      <small>{label}</small>
                      <b>{value}</b>
                      <p>{note}</p>
                    </article>
                  ))
                )}
              </div>
            )}
            {cards.length ? (
              <div className="staff-cards">
                {cards.map(({ title, copy, Icon, href, action }) => (
                  <article key={title}>
                    <span>
                      <Icon size={17} />
                    </span>
                    <div>
                      <b>{title}</b>
                      <p>{copy}</p>
                      <a href={href}>
                        {action}
                        <ArrowRight size={13} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="staff-state">
                No workspace tools are assigned to this role yet. Contact your
                university administrator.
              </p>
            )}
          </section>
        )}
        <div className="role-portal-grid">
          {(applicant
            ? [
                [
                  "Application access",
                  "Your account is ready. Sign in with this email and application ID when you return.",
                  KeyRound,
                ],
                [
                  "Admissions information",
                  "Review university colleges, programs, and application information.",
                  GraduationCap,
                ],
              ]
            : alumni
              ? [
                  [
                    "Alumni account",
                    "Your profile is associated with Alumni Relations.",
                    UserRound,
                  ],
                  [
                    "University community",
                    "Explore university news and campus information.",
                    Library,
                  ],
                ]
              : [
                  [
                    "University information",
                    "Find college and campus information from the university site.",
                    GraduationCap,
                  ],
                ]
          ).map(([heading, copy, Icon]) => (
            <article key={heading}>
              <span className="role-portal-icon">
                <Icon size={19} />
              </span>
              <small>UNIVERSITY</small>
              <h2>{heading}</h2>
              <p>{copy}</p>
              <a href="/about">
                Explore the university <ArrowRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  const [account, setAccount] = useState(null),
    [sessionReady, setSessionReady] = useState(false);
  useEffect(() => {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const loginUrl = `/login?next=${encodeURIComponent(returnTo)}`;
    Promise.all([
      fetch("/api/auth/session", { credentials: "include" }),
      fetch("/api/me", { credentials: "include" }),
    ])
      .then(async ([sessionResponse, identityResponse]) => {
        const result = sessionResponse.ok ? await sessionResponse.json() : null;
        const identity = identityResponse.ok
          ? await identityResponse.json()
          : null;
        if (result?.user)
          setAccount({
            ...result.user,
            roles: identity?.data?.roles || [],
            permissions: identity?.data?.permissions || [],
          });
        else window.location.replace(loginUrl);
      })
      .catch(() => window.location.replace(loginUrl))
      .finally(() => setSessionReady(true));
  }, []);
  if (!sessionReady || !account)
    return (
      <main className="role-portal-loading" aria-live="polite">
        Checking your EduCore account…
      </main>
    );
  const staffRole = (account.roles || []).some(
    (role) => !["Student", "Applicant", "Alumni"].includes(role),
  );
  const studentWorkspace =
    (account.persona === "Student" && !staffRole) ||
    (account.roles?.includes("Student") && !staffRole);
  return studentWorkspace ? (
    <StudentDashboard account={account} />
  ) : (
    <RolePortal account={account} />
  );
}
