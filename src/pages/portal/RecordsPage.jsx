import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import "./records-page.css";

const nav = [
  ["Dashboard", LayoutDashboard, "/dashboard"],
  ["My Courses", BookOpen, "/my-courses"],
  ["Course Catalog", Library, "/catalog"],
  ["Schedule", CalendarDays, "/schedule"],
  ["Assignments", FileText, "/assignments"],
  ["Examinations", ShieldCheck, "/examinations"],
  ["Results & GPA", GraduationCap, "/records"],
  ["Digital Library", Library, "/library"],
  ["Fees & Finance", Wallet, "/finance"],
];
const grades = ["A", "A−", "B+", "B", "B−", "C+", "C", "D", "F"];
const gradePoints = {
  A: 4,
  "A−": 3.7,
  "B+": 3.3,
  B: 3,
  "B−": 2.7,
  "C+": 2.3,
  C: 2,
  D: 1,
  F: 0,
};
const number = (value) =>
  value === null || value === undefined ? "—" : Number(value).toFixed(2);

export default function RecordsPage() {
  const [data, setData] = useState(null),
    [student, setStudent] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [term, setTerm] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [page, setPage] = useState(1),
    [expanded, setExpanded] = useState(""),
    [menuOpen, setMenuOpen] = useState(false),
    [helpOpen, setHelpOpen] = useState(false),
    [chartMode, setChartMode] = useState("GPA");
  const [calc, setCalc] = useState([{ id: 1, credits: 3, grade: "A" }]);
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/records", { credentials: "include" }),
      fetch("/api/me", { credentials: "include" }),
    ])
      .then(async ([recordsResponse, meResponse]) => {
        if (recordsResponse.status === 401) {
          location.replace(
            `/login?next=${encodeURIComponent(location.pathname)}`,
          );
          return null;
        }
        const result = await recordsResponse.json().catch(() => null);
        if (!recordsResponse.ok)
          throw new Error(
            result?.error?.message || "Academic records could not be loaded.",
          );
        const me = meResponse.ok
          ? await meResponse.json().catch(() => null)
          : null;
        return {
          records: result?.data || { semesters: [], courses: [] },
          student: me?.data || null,
        };
      })
      .then((result) => {
        if (active && result) {
          setData(result.records);
          setStudent(result.student);
          const activeTerm = result.records.semesters.find(
            (item) => item.status === "active",
          );
          setTerm(activeTerm?.id || result.records.semesters[0]?.id || "");
          setLoading(false);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason.message || "Academic records could not be loaded.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const terms = data?.semesters || [],
    courses = data?.courses || [],
    selected = terms.find((item) => item.id === term) || null;
  const visible = useMemo(
    () =>
      courses
        .filter(
          (item) =>
            (!term || item.semesterId === term) &&
            (!query ||
              `${item.code} ${item.title}`
                .toLowerCase()
                .includes(query.toLowerCase())) &&
            (status === "all" ||
              (status === "recorded"
                ? item.gradePoint !== null
                : item.gradePoint === null)),
        )
        .sort((a, b) => a.code.localeCompare(b.code)),
    [courses, term, query, status],
  );
  const pageSize = 8,
    pageCount = Math.max(1, Math.ceil(visible.length / pageSize)),
    pageRows = visible.slice((page - 1) * pageSize, page * pageSize);
  const history = [...terms].sort((a, b) =>
    b.start_date.localeCompare(a.start_date),
  );
  const cumulative = terms
    .filter((item) => item.gpa !== null)
    .reduce(
      (acc, item) => ({
        credits: acc.credits + (item.gpaCredits || 0),
        points: acc.points + item.gpa * (item.gpaCredits || 0),
      }),
      { credits: 0, points: 0 },
    );
  const cgpa = cumulative.credits
    ? cumulative.points / cumulative.credits
    : null;
  const calcTotal = calc.reduce(
      (sum, row) => sum + Math.max(0, Number(row.credits) || 0),
      0,
    ),
    calcGpa = calcTotal
      ? calc.reduce(
          (sum, row) =>
            sum +
            Math.max(0, Number(row.credits) || 0) *
              (gradePoints[row.grade] || 0),
          0,
        ) / calcTotal
      : null;
  const notify = (message) => window.alert(message);
  if (loading)
    return (
      <main className="records-loading" aria-live="polite">
        Loading your academic records…
      </main>
    );
  if (error)
    return (
      <main className="records-loading">
        <section role="alert">
          <b>Records unavailable</b>
          <p>{error}</p>
          <button onClick={() => location.reload()}>Try again</button>
        </section>
      </main>
    );
  return (
    <div className="records-page">
      {menuOpen && (
        <button
          className="records-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`records-sidebar${menuOpen ? " open" : ""}`}>
        <a className="records-brand" href="/">
          <img src="/supplied-assets/educore-wordmark.svg" alt="" />
          <span>
            <b>EduCore</b>
            <small>UNIVERSITY PORTAL</small>
          </span>
        </a>
        <div className="records-nav-label">Academic Suite</div>
        <nav>
          {nav.map(([label, Icon, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`records-nav-link${label === "Results & GPA" ? " active" : ""}`}
              aria-current={label === "Results & GPA" ? "page" : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="records-side-footer">
          <span className="records-avatar">
            {(student?.name || "Student")
              .split(/\s+/)
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <div>
            <b>{student?.name || "Student"}</b>
            <small>{student?.email || "University account"}</small>
          </div>
          <button
            aria-label="Sign out"
            onClick={() =>
              location.assign(
                `/signout?from=${encodeURIComponent(location.pathname)}`,
              )
            }
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="records-main">
        <header className="records-topbar">
          <button
            className="records-menu"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="records-top-label">
            <GraduationCap size={16} /> Student Academic Portal
          </div>
          <div className="records-top-term">
            <CalendarDays size={15} />
            {selected
              ? `${selected.name} · ${selected.academicYear}`
              : "Academic records"}
          </div>
          <a
            href="/announcements"
            className="records-bell"
            aria-label="Announcements"
          >
            <Activity size={17} />
          </a>
        </header>
        <main className="records-content">
          <div className="records-heading">
            <div>
              <div className="records-breadcrumb">
                <a href="/dashboard">Dashboard</a>
                <ChevronRight size={13} />
                <span>Academic Records &amp; GPA</span>
              </div>
              <span className="records-kicker">STUDENT ACADEMIC PROFILE</span>
              <h1>Academic Records &amp; GPA</h1>
              <p>
                View your semester results, monitor academic progress, and
                understand your cumulative performance.
              </p>
            </div>
            <div className="records-actions">
              <button
                className="records-secondary"
                onClick={() => setHelpOpen(true)}
              >
                <CircleHelp size={15} /> GPA guide
              </button>
              <button
                className="records-secondary"
                onClick={() => window.print()}
              >
                <FileText size={15} /> Print records
              </button>
              <button
                className="records-primary"
                onClick={() =>
                  notify(
                    "An official transcript is not available to download here. Contact the Registrar for transcript requests.",
                  )
                }
              >
                <ArrowDownToLine size={15} /> Transcript
              </button>
            </div>
          </div>
          <div className="records-term-row">
            <label>
              <CalendarDays size={15} />
              <span>Review academic period</span>
              <select
                value={term}
                onChange={(event) => {
                  setTerm(event.target.value);
                  setPage(1);
                }}
                aria-label="Select semester"
              >
                <option value="">All available periods</option>
                {terms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.academicYear}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>
            <span className="records-data-note">
              <ShieldCheck size={14} /> Based on records currently available to
              your account
            </span>
          </div>
          <section
            className="records-metrics"
            aria-label="Academic performance overview"
          >
            <article>
              <div className="records-metric-top">
                <span>SEMESTER GPA</span>
                <i>
                  <GraduationCap size={17} />
                </i>
              </div>
              <strong>{number(selected?.gpa)}</strong>
              <p>
                {selected
                  ? `${selected.name} · recorded grade items`
                  : "No semester GPA recorded"}
              </p>
            </article>
            <article>
              <div className="records-metric-top">
                <span>CUMULATIVE GPA</span>
                <i>
                  <Award size={17} />
                </i>
              </div>
              <strong>{number(cgpa)}</strong>
              <p>
                {cgpa === null
                  ? "No completed GPA records available"
                  : "Weighted from available semester GPA records"}
              </p>
            </article>
            <article>
              <div className="records-metric-top">
                <span>CREDITS EARNED</span>
                <i>
                  <BookOpen size={17} />
                </i>
              </div>
              <strong>—</strong>
              <p>Credit completion rules are not configured here</p>
            </article>
            <article>
              <div className="records-metric-top">
                <span>ACADEMIC STANDING</span>
                <i>
                  <ShieldCheck size={17} />
                </i>
              </div>
              <strong className="records-unavailable">Not recorded</strong>
              <p>No approved standing data is available</p>
            </article>
          </section>
          <section className="records-panel records-chart-panel">
            <header className="records-panel-head">
              <div>
                <span className="records-kicker">PERFORMANCE HISTORY</span>
                <h2>Semester progression</h2>
                <p>Only semesters with recorded GPA data are plotted.</p>
              </div>
              <div className="records-chart-toggle" aria-label="Chart metric">
                {["GPA", "Credits"].map((item) => (
                  <button
                    key={item}
                    className={chartMode === item ? "active" : ""}
                    onClick={() => setChartMode(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </header>
            {history.some((item) => item.gpa !== null) ? (
              <div className="records-chart-wrap">
                <PerformanceChart
                  terms={history.filter((item) =>
                    chartMode === "Credits"
                      ? item.registeredCredits !== null
                      : item.gpa !== null,
                  )}
                  mode={chartMode}
                  selected={term}
                />
              </div>
            ) : (
              <div className="records-chart-empty">
                <Activity size={22} />
                <b>No semester history yet</b>
                <span>
                  Your progression chart will appear after academic results are
                  recorded.
                </span>
              </div>
            )}
          </section>
          <section className="records-panel records-results-panel">
            <header className="records-panel-head">
              <div>
                <span className="records-kicker">ACADEMIC RESULTS</span>
                <h2>Course results</h2>
                <p>
                  {visible.length} course{visible.length === 1 ? "" : "s"} in
                  this view
                </p>
              </div>
              <label className="records-search">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search course code or title"
                />
              </label>
            </header>
            <div className="records-filters">
              <span>Filter:</span>
              <button
                className={status === "all" ? "active" : ""}
                onClick={() => {
                  setStatus("all");
                  setPage(1);
                }}
              >
                All courses
              </button>
              <button
                className={status === "recorded" ? "active" : ""}
                onClick={() => {
                  setStatus("recorded");
                  setPage(1);
                }}
              >
                Recorded
              </button>
              <button
                className={status === "pending" ? "active" : ""}
                onClick={() => {
                  setStatus("pending");
                  setPage(1);
                }}
              >
                No grade recorded
              </button>
            </div>
            {pageRows.length ? (
              <div className="records-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Credits</th>
                      <th>Coursework / exam</th>
                      <th>Total score</th>
                      <th>Letter grade</th>
                      <th>Grade point</th>
                      <th>Result status</th>
                      <th aria-label="Details" />
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows
                      .map((course) => (
                        <tr key={`${course.semesterId}-${course.code}`}>
                          <td>
                            <b>{course.code}</b>
                            <span>{course.title}</span>
                          </td>
                          <td>{course.credits}</td>
                          <td>
                            {course.items.length
                              ? `${course.items.filter((item) => item.score !== null).length} / ${course.items.length} items`
                              : "—"}
                          </td>
                          <td>
                            {course.totalScore === null
                              ? "—"
                              : `${number(course.totalScore)}%`}
                          </td>
                          <td>{course.letterGrade || "—"}</td>
                          <td>{number(course.gradePoint)}</td>
                          <td>
                            <span
                              className={`records-status ${course.gradePoint === null ? "pending" : ""}`}
                            >
                              <i />
                              {course.gradePoint === null
                                ? "No grade recorded"
                                : "Recorded"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="records-expand"
                              aria-label={`View ${course.code} grade items`}
                              onClick={() =>
                                setExpanded(
                                  expanded === course.code ? "" : course.code,
                                )
                              }
                            >
                              {expanded === course.code ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                      .flatMap((row, index) => {
                        const course = pageRows[index];
                        return expanded === course.code
                          ? [
                              row,
                              <tr
                                className="records-detail-row"
                                key={`${course.code}-items`}
                              >
                                <td colSpan="8">
                                  <div>
                                    {course.items.map((item, i) => (
                                      <span key={`${item.title}-${i}`}>
                                        <b>{item.category || item.title}</b>
                                        <small>
                                          {item.score === null
                                            ? "No score recorded"
                                            : `${number(item.score)} / ${number(item.maxScore)} · ${item.weight}%`}
                                        </small>
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>,
                            ]
                          : [row];
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="records-empty">
                <BookOpen size={24} />
                <b>
                  {query
                    ? "No matching courses"
                    : "No academic results available"}
                </b>
                <p>
                  {query
                    ? "Try a different course search."
                    : "Course registrations and published grade items will appear here when they are recorded."}
                </p>
              </div>
            )}
            <footer className="records-pagination">
              <span>
                Page {Math.min(page, pageCount)} of {pageCount}
              </span>
              <div>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Previous
                </button>
                <button
                  disabled={page >= pageCount}
                  onClick={() =>
                    setPage((value) => Math.min(pageCount, value + 1))
                  }
                >
                  Next
                </button>
              </div>
            </footer>
          </section>
          <div className="records-lower-grid">
            <section className="records-panel records-summary-panel">
              <header className="records-panel-head">
                <div>
                  <span className="records-kicker">SELECTED PERIOD</span>
                  <h2>Semester summary</h2>
                </div>
              </header>
              <div className="records-summary-grid">
                <Summary
                  label="Registered credits"
                  value={selected?.registeredCredits ?? "—"}
                />
                <Summary label="Credits earned" value="Not available" />
                <Summary label="Semester GPA" value={number(selected?.gpa)} />
                <Summary
                  label="Courses with results"
                  value={selected?.completedCourses ?? "—"}
                />
                <Summary
                  label="No grade recorded"
                  value={selected?.outstandingCourses ?? "—"}
                />
                <Summary label="Grading scale" value="Not configured" />
              </div>
              <p className="records-footnote">
                Provisional, approved, withheld, and pending labels are not
                stored in the current records system.
              </p>
            </section>
            <section className="records-panel records-doc-panel">
              <span className="records-kicker">DOCUMENT CENTRE</span>
              <h2>Academic documents</h2>
              <p>
                Use the print-friendly student view for your current records. It
                is not an official transcript.
              </p>
              <div className="records-document">
                <FileText size={19} />
                <div>
                  <b>Unofficial academic record</b>
                  <small>Student view · live data</small>
                </div>
                <span>UNOFFICIAL</span>
              </div>
              <button
                className="records-doc-action"
                onClick={() => window.print()}
              >
                <FileText size={15} /> Print / save as PDF
              </button>
              <p className="records-registrar">
                Official transcript requests are handled by the Registrar.
              </p>
            </section>
          </div>
          <section className="records-panel records-history-panel">
            <header className="records-panel-head">
              <div>
                <span className="records-kicker">
                  CUMULATIVE ACADEMIC RECORD
                </span>
                <h2>Academic history</h2>
                <p>
                  Expand a period to review its registered courses and available
                  results.
                </p>
              </div>
              <span className="records-count">
                {history.length} period{history.length === 1 ? "" : "s"}
              </span>
            </header>
            {history.length ? (
              history.map((item) => {
                const periodCourses = courses.filter(
                  (course) => course.semesterId === item.id,
                );
                return (
                  <article className="records-history-item" key={item.id}>
                    <button
                      onClick={() =>
                        setExpanded(expanded === item.id ? "" : item.id)
                      }
                      aria-expanded={expanded === item.id}
                    >
                      <span className="records-history-chevron">
                        {expanded === item.id ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                      <span className="records-history-name">
                        <b>{item.name}</b>
                        <small>{item.academicYear}</small>
                      </span>
                      <span>
                        <small>SEMESTER GPA</small>
                        <b>{number(item.gpa)}</b>
                      </span>
                      <span>
                        <small>REGISTERED</small>
                        <b>{item.registeredCredits} credits</b>
                      </span>
                      <span>
                        <small>STANDING</small>
                        <b>Not recorded</b>
                      </span>
                      <span className="records-history-link">
                        View results <ArrowRight size={14} />
                      </span>
                    </button>
                    {expanded === item.id && (
                      <div className="records-history-detail">
                        {periodCourses.length ? (
                          periodCourses.map((course) => (
                            <div key={course.code}>
                              <b>{course.code}</b>
                              <span>{course.title}</span>
                              <span>{number(course.gradePoint)} GPA</span>
                              <span>
                                {course.letterGrade || "No grade recorded"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p>
                            No course records are available for this academic
                            period.
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="records-empty">
                <CalendarDays size={23} />
                <b>No academic history available</b>
                <p>Completed and registered semesters will appear here.</p>
              </div>
            )}
          </section>
          <section className="records-calculator">
            <div className="records-calc-intro">
              <span className="records-calc-icon">
                <Activity size={19} />
              </span>
              <span className="records-kicker">PLANNING TOOL</span>
              <h2>GPA calculator</h2>
              <p>
                Add courses to explore an estimated GPA using a standard 4.0
                grade point scale. This estimate is separate from your official
                academic record.
              </p>
              <div className="records-formula">
                GPA = Σ (credit hours × grade points) ÷ Σ GPA-eligible credit
                hours
              </div>
              <small>
                Illustrative only. Repeat courses, withdrawals, incompletes,
                failures, and institutional rules may affect official GPA.
              </small>
            </div>
            <div className="records-calc-workspace">
              <div className="records-calc-result">
                <span>ESTIMATED GPA</span>
                <b>{number(calcGpa)}</b>
                <small>Estimate · 4.0 scale</small>
              </div>
              <div className="records-calc-rows">
                {calc.map((row) => (
                  <div className="records-calc-row" key={row.id}>
                    <label>
                      Credit hours
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={row.credits}
                        onChange={(event) =>
                          setCalc((rows) =>
                            rows.map((item) =>
                              item.id === row.id
                                ? { ...item, credits: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Grade
                      <select
                        value={row.grade}
                        onChange={(event) =>
                          setCalc((rows) =>
                            rows.map((item) =>
                              item.id === row.id
                                ? { ...item, grade: event.target.value }
                                : item,
                            ),
                          )
                        }
                      >
                        {grades.map((grade) => (
                          <option key={grade}>{grade}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      aria-label="Remove course"
                      onClick={() =>
                        setCalc((rows) =>
                          rows.filter((item) => item.id !== row.id),
                        )
                      }
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="records-calc-actions">
                <button
                  onClick={() =>
                    setCalc((rows) => [
                      ...rows,
                      { id: Date.now(), credits: 3, grade: "A" },
                    ])
                  }
                >
                  + Add course
                </button>
                <button onClick={() => setCalc([])}>Reset</button>
              </div>
            </div>
          </section>
          <footer className="records-footer">
            <ShieldCheck size={15} />
            <span>
              Academic results reflect records available in EduCore. For
              corrections or transcript requests, contact the university
              Registrar.
            </span>
            <button onClick={() => setHelpOpen(true)}>
              GPA guide <ArrowRight size={14} />
            </button>
          </footer>
        </main>
      </div>
      {helpOpen && (
        <div
          className="records-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setHelpOpen(false);
          }}
        >
          <section
            className="records-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="records-guide-title"
          >
            <button
              className="records-modal-close"
              aria-label="Close GPA guide"
              onClick={() => setHelpOpen(false)}
            >
              <X size={17} />
            </button>
            <span className="records-kicker">ACADEMIC SUPPORT</span>
            <h2 id="records-guide-title">Understanding your GPA</h2>
            <p>
              Recorded semester GPA is calculated from the grade points stored
              for course grade items, weighted by course credits. Your
              institution's official calculation policy may account for other
              rules.
            </p>
            <div className="records-guide-scale">
              {Object.entries(gradePoints).map(([grade, point]) => (
                <span key={grade}>
                  <b>{grade}</b>
                  {point.toFixed(1)}
                </span>
              ))}
            </div>
            <p>
              The calculator uses an illustrative 4.0 scale and does not change
              or predict your official record. For policy guidance, please
              contact the Registrar.
            </p>
            <button
              className="records-primary"
              onClick={() => setHelpOpen(false)}
            >
              Got it <Check size={15} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}
function PerformanceChart({ terms, mode, selected }) {
  const values = terms.map((item) =>
    mode === "GPA" ? item.gpa : item.registeredCredits,
  );
  const max = mode === "GPA" ? 4 : Math.max(12, ...values),
    min = 0,
    width = 680,
    height = 210,
    pad = { left: 34, right: 18, top: 20, bottom: 35 };
  const x = (index) =>
    pad.left +
    (terms.length === 1
      ? (width - pad.left - pad.right) / 2
      : (index * (width - pad.left - pad.right)) / (terms.length - 1));
  const y = (value) =>
    height -
    pad.bottom -
    ((value - min) / (max - min)) * (height - pad.top - pad.bottom);
  const points = terms
    .map(
      (item, index) =>
        `${x(index)},${y(mode === "GPA" ? item.gpa : item.registeredCredits)}`,
    )
    .join(" ");
  return (
    <svg
      className="records-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${mode} progression by semester`}
    >
      <defs>
        <linearGradient id="recordsChartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2358c5" stopOpacity=".17" />
          <stop offset="1" stopColor="#2358c5" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((tick) => {
        const value = (max * tick) / 4;
        return (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y(value)}
              y2={y(value)}
              stroke="#e9edf3"
              strokeDasharray={tick ? "3 5" : ""}
            />
            <text x={pad.left - 8} y={y(value) + 4} textAnchor="end">
              {mode === "GPA" ? value.toFixed(1) : Math.round(value)}
            </text>
          </g>
        );
      })}
      <polygon
        points={`${x(0)},${height - pad.bottom} ${points} ${x(terms.length - 1)},${height - pad.bottom}`}
        fill="url(#recordsChartFill)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#2458bd"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {terms.map((item, index) => {
        const val = mode === "GPA" ? item.gpa : item.registeredCredits;
        return (
          <g key={item.id}>
            <circle
              cx={x(index)}
              cy={y(val)}
              r={item.id === selected ? 7 : 5}
              fill="#fff"
              stroke="#2458bd"
              strokeWidth="3"
            >
              <title>
                {item.name} {item.academicYear}:{" "}
                {mode === "GPA" ? number(val) : `${val} credits`}
              </title>
            </circle>
            <text
              className="records-chart-x"
              x={x(index)}
              y={height - 10}
              textAnchor="middle"
            >
              {item.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
