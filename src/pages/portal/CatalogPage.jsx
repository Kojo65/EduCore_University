import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Bookmark,
  BookMarked,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import "./catalog.css";

const navigation = [
  ["Dashboard", LayoutDashboard, "/dashboard"],
  ["My Courses", BookOpen, "/my-courses"],
  ["Course Catalog", Library, "/catalog"],
  ["Schedule", CalendarDays, "/schedule"],
  ["Assignments", FileText, "/assignments"],
  ["Examinations", ShieldCheck, "/examinations"],
  ["Textbooks & Library", BookMarked, "/library"],
  ["Results & GPA", Star, "/records"],
  ["Attendance", Activity, "/records"],
  ["Announcements", Bell, "/announcements"],
  ["Messages", MessageSquare, "/announcements"],
  ["Fees & Finance", Wallet, "/finance"],
];
const categories = [
  ["all", "All Courses"],
  ["recommended", "Recommended for You"],
  ["core", "Core Compulsory"],
  ["major", "Major Electives"],
  ["open", "Open Electives"],
];

export default function CatalogPage() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [level, setLevel] = useState("All Levels");
  const [category, setCategory] = useState("all");
  const [openOnly, setOpenOnly] = useState(true);
  const [morningOnly, setMorningOnly] = useState(false);
  const [conflictFree, setConflictFree] = useState(true);
  const [sort, setSort] = useState("Course Code (Ascending)");
  const [courses, setCourses] = useState([]);
  const [cart, setCart] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [pageReady, setPageReady] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(""), 2600);
  };
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/courses?semester=semester-fall-2026", {
        credentials: "include",
      }),
      fetch("/api/enrollments?semester=semester-fall-2026", {
        credentials: "include",
      }),
      fetch("/api/auth/session", { credentials: "include" }),
    ])
      .then(async ([courseResponse, enrollmentResponse, sessionResponse]) => {
        if (
          courseResponse.status === 401 ||
          enrollmentResponse.status === 401
        ) {
          location.replace(
            `/login?next=${encodeURIComponent(location.pathname)}`,
          );
          return null;
        }
        const courseResult = await courseResponse.json().catch(() => null);
        const enrollmentResult = await enrollmentResponse
          .json()
          .catch(() => null);
        const sessionResult = await sessionResponse.json().catch(() => null);
        if (!courseResponse.ok || !enrollmentResponse.ok)
          throw new Error(
            courseResult?.error?.message ||
              enrollmentResult?.error?.message ||
              "The course catalog could not be loaded.",
          );
        return [
          courseResult?.data || [],
          enrollmentResult?.data || [],
          sessionResult?.user || null,
        ];
      })
      .then((result) => {
        if (!active || !result) return;
        const [courseData, enrollmentData, sessionUser] = result;
        setCourses(
          courseData.map((course) => ({
            ...course,
            dept: course.department,
            level: `${course.level} Level`,
            prerequisite: course.prerequisiteText || "None",
            color:
              course.kind === "Core Compulsory"
                ? "amber"
                : course.seats >= course.capacity
                  ? "red"
                  : "green",
          })),
        );
        setRegistrations(enrollmentData);
        setCart(
          enrollmentData
            .filter((item) => item.status === "draft")
            .map((item) => item.code),
        );
        setCurrentUser(sessionUser);
        setPageReady(true);
      })
      .catch((error) => {
        if (active) {
          setRequestError(error.message || "Course data is unavailable.");
          setPageReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const visibleCourses = useMemo(() => {
    let result = courses.filter((course) => {
      const matchesQuery =
        `${course.code} ${course.title} ${course.instructor} ${course.dept}`
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesDepartment =
        department === "All Departments" || course.department === department;
      const matchesLevel = level === "All Levels" || course.level === level;
      const matchesCategory =
        category === "all" ||
        (category === "recommended"
          ? ["CS412", "CS420", "CS480"].includes(course.code)
          : category === "core"
            ? course.kind === "Core Compulsory"
            : category === "major"
              ? course.kind === "Major Elective"
              : course.kind === "University Requirement");
      const matchesSeats = !openOnly || course.seats < course.capacity;
      const matchesTime = !morningOnly || course.time.includes("AM");
      const selectedMeetings = courses
        .filter((item) => cart.includes(item.code))
        .flatMap((item) => item.meeting || []);
      const conflict = course.meeting?.some((candidate) =>
        selectedMeetings.some(
          (current) =>
            candidate.day === current.day &&
            candidate.start < current.end &&
            current.start < candidate.end,
        ),
      );
      const matchesConflict =
        !conflictFree || cart.includes(course.code) || !conflict;
      return (
        matchesQuery &&
        matchesDepartment &&
        matchesLevel &&
        matchesCategory &&
        matchesSeats &&
        matchesTime &&
        matchesConflict
      );
    });
    if (sort === "Course Code (Descending)") result = [...result].reverse();
    if (sort === "Seats Available (Ascending)")
      result = [...result].sort(
        (a, b) => a.capacity - a.seats - (b.capacity - b.seats),
      );
    if (sort === "Credits (Ascending)")
      result = [...result].sort((a, b) => a.credits - b.credits);
    return result;
  }, [
    query,
    department,
    level,
    category,
    openOnly,
    morningOnly,
    conflictFree,
    sort,
    courses,
    cart,
  ]);
  const totalCredits = cart.reduce(
    (sum, code) =>
      sum + (courses.find((course) => course.code === code)?.credits || 0),
    0,
  );
  const toggle = (stateSetter, current, value) =>
    stateSetter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

  async function addCourse(course) {
    const current = registrations.find(
      (item) => item.code === course.code && item.status === "draft",
    );
    try {
      if (current) {
        const response = await fetch(
          `/api/enrollments/drafts/${encodeURIComponent(current.id)}`,
          { method: "DELETE", credentials: "include" },
        );
        const result = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            result?.error?.message || "Could not remove this course.",
          );
        setRegistrations((items) =>
          items.filter((item) => item.id !== current.id),
        );
        setCart((items) => items.filter((code) => code !== course.code));
        notify(`${course.code} removed from your study plan.`);
        return;
      }
      const response = await fetch("/api/enrollments/drafts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: course.sectionId,
          semesterId: "semester-fall-2026",
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(result?.error?.message || "Could not add this course.");
      setRegistrations((items) => [
        ...items,
        {
          id: result.data.id,
          section_id: course.sectionId,
          sectionId: course.sectionId,
          code: course.code,
          title: course.title,
          credits: course.credits,
          status: "draft",
        },
      ]);
      setCart((items) => [...new Set([...items, course.code])]);
      notify(`${course.code} added to your study plan.`);
    } catch (error) {
      notify(error.message || "Registration could not be updated.");
    }
  }
  function register(course) {
    if (!cart.includes(course.code)) addCourse(course);
  }
  async function submitRegistration() {
    if (!cart.length) {
      notify("Add courses to your study plan before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/enrollments/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semesterId: "semester-fall-2026" }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          result?.error?.message || "Registration could not be submitted.",
        );
      setRegistrations((items) =>
        items.map((item) =>
          item.status === "draft" ? { ...item, status: "submitted" } : item,
        ),
      );
      setCart([]);
      notify(
        `Registration submitted · ${result.data.courseCount} courses, ${result.data.credits} credits.`,
      );
    } catch (error) {
      notify(error.message || "Registration could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!pageReady)
    return (
      <main className="catalog-loading" aria-live="polite">
        Loading the course catalog…
      </main>
    );
  if (requestError)
    return (
      <main className="catalog-loading">
        <section role="alert">
          <b>Catalog unavailable</b>
          <p>{requestError}</p>
          <button onClick={() => location.reload()}>Try again</button>
        </section>
      </main>
    );

  return (
    <div className="catalog-page">
      {menuOpen && (
        <button
          className="catalog-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`catalog-sidebar${menuOpen ? " open" : ""}`}>
        <a className="catalog-brand" href="/">
          <img src="/supplied-assets/educore-wordmark.svg" alt="" />
          <span>
            <b>EduCore</b>
            <small>UNIVERSITY PORTAL</small>
          </span>
        </a>
        <div className="catalog-nav-label">Academic Suite</div>
        <nav>
          {navigation.map(([label, Icon, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`catalog-nav-link${label === "Course Catalog" ? " active" : ""}`}
            >
              <Icon size={16} />
              <span>{label}</span>
              {label === "Messages" && <i />}
            </a>
          ))}
        </nav>
        <div className="catalog-preferences">
          <div className="catalog-nav-label">Preferences</div>
          <a href="/my-courses">
            <UserRound size={16} />
            Student Profile
          </a>
          <a href="/my-courses">
            <Settings size={16} />
            Settings
          </a>
        </div>
      </aside>
      <div className="catalog-main">
        <header className="catalog-topbar">
          <button
            className="catalog-menu-toggle"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={19} />
          </button>
          <label className="catalog-global-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search courses, assignments, faculty..."
            />
          </label>
          <label className="catalog-term">
            <CalendarDays size={15} />
            <select aria-label="Academic term">
              <option>Fall Semester 2024 · Week 8</option>
              <option>Spring Semester 2025</option>
              <option>Fall Semester 2025</option>
            </select>
            <ChevronDown size={13} />
          </label>
          <div className="catalog-top-actions">
            <button
              aria-label="Messages"
              onClick={() => notify("You have no unread messages.")}
            >
              <Mail size={17} />
            </button>
            <button
              aria-label="Tasks"
              onClick={() => notify("You have 2 tasks to review.")}
            >
              <FileText size={16} />
              <i>2</i>
            </button>
            <button
              aria-label="Notifications"
              onClick={() => notify("You have 4 new notifications.")}
            >
              <Bell size={17} />
              <i className="red">4</i>
            </button>
            <a className="catalog-user" href="/my-courses">
              <span>
                {(currentUser?.name || "Student")
                  .split(/\s+/)
                  .map((name) => name[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <b>
                {currentUser?.name || "Student"}
                <small>
                  {currentUser?.universityId ||
                    currentUser?.email ||
                    "University account"}
                </small>
              </b>
            </a>
          </div>
        </header>
        <main className="catalog-content">
          <div className="catalog-heading">
            <div>
              <div className="catalog-breadcrumb">
                <b>
                  <GraduationCap size={13} />
                  ACADEMIC REGISTRATION
                </b>
                <i />
                Fall 2026 Course Registration
              </div>
              <h1>Course Catalog &amp; Registration</h1>
              <p>
                Browse, filter, and enroll in accredited undergraduate and
                graduate courses for the upcoming academic semester.
              </p>
            </div>
            <div className="catalog-heading-actions">
              <button
                className="catalog-light-button"
                onClick={() => window.print()}
              >
                <FileText size={14} />
                Registration Guidelines (PDF)
              </button>
              <button
                className="catalog-primary-button"
                onClick={submitRegistration}
                disabled={submitting}
              >
                <BookMarked size={14} />
                Submit Study Plan: <b>{cart.length}</b> / 21 Credits
              </button>
            </div>
          </div>

          <section
            className="catalog-summary"
            aria-label="Registration summary"
          >
            <article>
              <span className="catalog-summary-icon violet">
                <BookMarked size={18} />
              </span>
              <div>
                <small>CART &amp; LOAD STATUS</small>
                <strong>
                  {cart.length} Courses ({totalCredits} Credits)
                </strong>
                <p>
                  <CheckCircle2 size={12} />
                  Max allowable load: 21 Credits
                </p>
              </div>
            </article>
            <article>
              <span className="catalog-summary-icon gray">
                <CalendarDays size={18} />
              </span>
              <div>
                <small>REGISTRATION STATUS</small>
                <strong>Fall 2026</strong>
                <p>Plan changes are saved to your account</p>
              </div>
            </article>
            <article>
              <span className="catalog-summary-icon gray">
                <GraduationCap size={18} />
              </span>
              <div>
                <small>ENROLLMENT RECORD</small>
                <strong>
                  {
                    registrations.filter((item) => item.status === "registered")
                      .length
                  }{" "}
                  Courses Registered
                </strong>
                <p className="summary-positive">
                  <CheckCircle2 size={12} />
                  Registration records are up to date
                </p>
              </div>
            </article>
            <article>
              <span className="catalog-summary-icon violet">
                <ShieldCheck size={18} />
              </span>
              <div>
                <small>REGISTRATION LOAD</small>
                <strong>{totalCredits} / 21 Credits</strong>
                <p className="summary-split">
                  <span>
                    {Math.max(0, 21 - totalCredits)} credits available
                  </span>
                </p>
              </div>
            </article>
          </section>

          <section className="catalog-advisor">
            <div className="advisor-kicker">
              <span>STUDY PLANNING</span>Course selection guidance
            </div>
            <h2>Build a balanced schedule for Fall 2026</h2>
            <p>
              Review course requirements and meeting times before submitting
              your plan. EduCore checks your credit load, prerequisites, and
              timetable conflicts.
            </p>
            <button
              className="advisor-action"
              onClick={() =>
                courses
                  .filter((course) => ["CS412", "CS420"].includes(course.code))
                  .forEach(addCourse)
              }
            >
              <SlidersHorizontal size={14} />
              Add recommended electives
            </button>
            <div className="advisor-watermark" aria-hidden="true">
              E
            </div>
          </section>

          <section className="catalog-filter-panel" aria-label="Course filters">
            <div className="catalog-filter-top">
              <label className="catalog-course-search">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search courses by code, title, topic, or lecturer (e.g. CS412)"
                />
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={13} />
                </button>
              </label>
              <label className="catalog-select">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option>All Departments</option>
                  <option>Computing &amp; Data Science</option>
                  <option>Mathematics &amp; Logic</option>
                  <option>Humanities &amp; Communication</option>
                </select>
                <ChevronDown size={13} />
              </label>
              <label className="catalog-select">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option>400 Level</option>
                  <option>300 Level</option>
                  <option>All Levels</option>
                </select>
                <ChevronDown size={13} />
              </label>
            </div>
            <div
              className="catalog-categories"
              role="tablist"
              aria-label="Course categories"
            >
              {categories.map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={category === id}
                  className={category === id ? "selected" : ""}
                  onClick={() => setCategory(id)}
                >
                  {id === "recommended" && <Star size={12} />} {label} (
                  {id === "all"
                    ? courses.length
                    : visibleCourses.filter((course) =>
                        id === "recommended"
                          ? ["CS412", "CS420", "CS480"].includes(course.code)
                          : id === "core"
                            ? course.kind === "Core Compulsory"
                            : id === "major"
                              ? course.kind === "Major Elective"
                              : course.kind === "University Requirement",
                      ).length}
                  )
                </button>
              ))}
            </div>
            <div className="catalog-filter-bottom">
              <div className="catalog-checks">
                <label className={openOnly ? "checked" : ""}>
                  <input
                    type="checkbox"
                    checked={openOnly}
                    onChange={(e) => setOpenOnly(e.target.checked)}
                  />
                  <span>{openOnly && <Check size={12} />}</span>Open Seats Only
                </label>
                <label className={morningOnly ? "checked" : ""}>
                  <input
                    type="checkbox"
                    checked={morningOnly}
                    onChange={(e) => setMorningOnly(e.target.checked)}
                  />
                  <span>{morningOnly && <Check size={12} />}</span>Morning Slots
                  (08:00 - 12:00)
                </label>
                <label className={conflictFree ? "checked" : ""}>
                  <input
                    type="checkbox"
                    checked={conflictFree}
                    onChange={(e) => setConflictFree(e.target.checked)}
                  />
                  <span>{conflictFree && <Check size={12} />}</span>No Timetable
                  Conflicts
                </label>
              </div>
              <label className="catalog-sort">
                Sort By:
                <span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option>Course Code (Ascending)</option>
                    <option>Course Code (Descending)</option>
                    <option>Seats Available (Ascending)</option>
                    <option>Credits (Ascending)</option>
                  </select>
                  <ChevronDown size={12} />
                </span>
              </label>
            </div>
          </section>

          <div className="catalog-results-heading">
            <h2>
              Available Accredited Courses{" "}
              <span>{visibleCourses.length} Displayed</span>
            </h2>
            <p>
              Showing{" "}
              {visibleCourses.length
                ? `${(page - 1) * 6 + 1}–${(page - 1) * 6 + visibleCourses.length}`
                : "0"}{" "}
              of {courses.length} courses matching current academic criteria
            </p>
          </div>
          {visibleCourses.length ? (
            <section className="catalog-course-grid" aria-live="polite">
              {visibleCourses.map((course) => {
                const available = course.capacity - course.seats;
                const inCart = cart.includes(course.code);
                const isSaved = saved.includes(course.code);
                return (
                  <article className="catalog-course-card" key={course.code}>
                    <div className="catalog-course-body">
                      <div className="catalog-course-meta">
                        <div>
                          <b>{course.code}</b>
                          <span>{course.credits} Credits</span>
                        </div>
                        <button
                          className={isSaved ? "saved" : ""}
                          aria-label={
                            isSaved
                              ? `Remove ${course.code} from saved courses`
                              : `Save ${course.code}`
                          }
                          onClick={() => toggle(setSaved, saved, course.code)}
                        >
                          <Bookmark
                            size={15}
                            fill={isSaved ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                      <span className={`catalog-kind ${course.color}`}>
                        {course.kind}
                      </span>
                      <h3>{course.title}</h3>
                      <p className="catalog-department">Dept. {course.dept}</p>
                      <div className="catalog-instructor">
                        <span>
                          {course.instructor
                            .split(" ")
                            .filter((part) => part.length > 1)
                            .slice(-2)
                            .map((part) => part[0])
                            .join("")}
                        </span>
                        <div>
                          <b>{course.instructor}</b>
                          <small>Office: {course.office}</small>
                        </div>
                      </div>
                      <p className="catalog-description">
                        {course.description}
                      </p>
                      <div
                        className={`catalog-prereq ${course.prerequisite.startsWith("None") ? "info" : ""}`}
                      >
                        <CheckCircle2 size={12} />
                        <span>Prerequisites: {course.prerequisite}</span>
                      </div>
                      <div className="catalog-meeting">
                        <span>
                          <Clock3 size={13} />
                          {course.day} {course.time}
                        </span>
                        <span>
                          <MapPin size={13} />
                          {course.place}
                        </span>
                      </div>
                      <div
                        className={`catalog-seat ${available < 3 ? "low" : ""}`}
                      >
                        <div>
                          <span>Seat Capacity</span>
                          <b>
                            {course.seats} / {course.capacity} Filled (
                            {available} Available
                            {available < 3 ? " · Low Seats!" : ""})
                          </b>
                        </div>
                        <i>
                          <span
                            style={{
                              width: `${(course.seats / course.capacity) * 100}%`,
                            }}
                          />
                        </i>
                      </div>
                    </div>
                    <div className="catalog-card-actions">
                      <button
                        className="catalog-details"
                        onClick={() =>
                          notify(
                            `${course.code}: ${course.credits} credits · ${course.instructor}. ${course.prerequisite}.`,
                          )
                        }
                      >
                        View Details
                      </button>
                      <button
                        className={`catalog-register${inCart ? " in-cart" : ""}`}
                        onClick={() =>
                          inCart ? addCourse(course) : register(course)
                        }
                      >
                        {inCart ? (
                          <>
                            <Check size={13} />
                            In Cart
                          </>
                        ) : (
                          <>
                            <span>＋</span>Register Course
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <div className="catalog-empty">
              <Search size={21} />
              <b>No courses match these filters</b>
              <span>
                Try another search or clear some filters to see available
                courses.
              </span>
              <button
                onClick={() => {
                  setQuery("");
                  setDepartment("All Departments");
                  setLevel("All Levels");
                  setCategory("all");
                  setOpenOnly(false);
                  setMorningOnly(false);
                  setConflictFree(false);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          <footer className="catalog-pagination">
            <span>
              Showing{" "}
              <b>
                {visibleCourses.length
                  ? `${(page - 1) * 6 + 1}–${(page - 1) * 6 + visibleCourses.length}`
                  : "0"}
              </b>{" "}
              of <b>{courses.length}</b> courses matching current academic
              criteria
            </span>
            <div>
              <button
                aria-label="Previous page"
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                <ChevronLeft size={14} />
              </button>
              <button className="current" aria-current="page">
                {page}
              </button>
              <button onClick={() => setPage(page + 1)}>2</button>
              <button onClick={() => setPage(page + 2)}>3</button>
              <span>…</span>
              <button onClick={() => setPage(7)}>7</button>
              <button
                aria-label="Next page"
                onClick={() => setPage(Math.min(7, page + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="catalog-toast" role="status">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
