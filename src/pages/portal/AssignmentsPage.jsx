import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  BookMarked,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  CloudUpload,
  FileArchive,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  LockKeyhole,
  Mail,
  Menu,
  MessageSquare,
  Paperclip,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Upload,
  UserRound,
  Wallet,
  X,
  SlidersHorizontal,
  Send,
  Award,
  History,
  Code2,
} from "lucide-react";
import "./assignments.css";

const navigation = [
  ["Dashboard", LayoutDashboard, "/dashboard"],
  ["My Courses", BookOpen, "/my-courses"],
  ["Course Catalog", Library, "/catalog"],
  ["Schedule", CalendarDays, "/schedule"],
  ["Assignments", ClipboardCheck, "/assignments"],
  ["Examinations", FileText, "/examinations"],
  ["Textbooks & Library", BookMarked, "/library"],
  ["Results & GPA", Star, "/records"],
  ["Attendance", Activity, "/records"],
  ["Announcements", Bell, "/announcements"],
  ["Messages", MessageSquare, "/announcements"],
  ["Fees & Finance", Wallet, "/finance"],
];
const supportedFile = (file) => /\.(zip|tar\.gz|pdf)$/i.test(file.name);

export default function AssignmentsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Enrolled Courses");
  const [sort, setSort] = useState("Due Date (Earliest)");
  const [assignments, setAssignments] = useState([]);
  const [pageReady, setPageReady] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [activeId, setActiveId] = useState("CS304-04");
  const [file, setFile] = useState(null);
  const [attachmentId, setAttachmentId] = useState("");
  const [draftId, setDraftId] = useState("");
  const [fileError, setFileError] = useState("");
  const [repository, setRepository] = useState("");
  const [notes, setNotes] = useState("");
  const [pledge, setPledge] = useState(true);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState({});
  const [history, setHistory] = useState([]);
  const [account, setAccount] = useState(null);
  const fileRef = useRef(null);
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/assignments", { credentials: "include" }),
      fetch("/api/assignments/submissions", { credentials: "include" }),
      fetch("/api/auth/session", { credentials: "include" }),
    ])
      .then(
        async ([assignmentResponse, submissionResponse, sessionResponse]) => {
          if (
            assignmentResponse.status === 401 ||
            submissionResponse.status === 401 ||
            sessionResponse.status === 401
          ) {
            const next = encodeURIComponent(
              `${location.pathname}${location.search}${location.hash}`,
            );
            location.replace(`/login?next=${next}`);
            return null;
          }
          const assignmentResult = await assignmentResponse
            .json()
            .catch(() => null);
          const submissionResult = await submissionResponse
            .json()
            .catch(() => null);
          const sessionResult = await sessionResponse.json().catch(() => null);
          if (!assignmentResponse.ok || !submissionResponse.ok)
            throw new Error(
              assignmentResult?.error?.message ||
                submissionResult?.error?.message ||
                "Your account cannot access this coursework workspace.",
            );
          return [
            assignmentResult?.data || [],
            submissionResult?.data || [],
            sessionResult?.user || null,
          ];
        },
      )
      .then((result) => {
        if (!active || !result) return;
        const [items, ownSubmissions, sessionUser] = result;
        setAssignments(items);
        setActiveId(
          items.find((item) => !item.submitted)?.id || items[0]?.id || "",
        );
        setHistory(ownSubmissions);
        setAccount(sessionUser);
        setSubmitted(
          Object.fromEntries(
            ownSubmissions
              .filter(
                (item) =>
                  item.status === "Submitted" || item.status === "Graded",
              )
              .map((item) => [item.assignment_id, true]),
          ),
        );
        const draft = ownSubmissions.find(
          (item) => item.status === "In Progress",
        );
        if (draft) {
          setDraftId(draft.id);
          const assignment = items.find(
            (item) => item.id === draft.assignment_id,
          );
          if (assignment) {
            setActiveId(assignment.id);
            setRepository(draft.repository_url || "");
            setNotes(draft.notes || "");
            setAttachmentId(draft.attachments?.[0]?.id || "");
          }
        }
        setPageReady(true);
      })
      .catch((error) => {
        if (active) {
          setRequestError(error.message || "Could not load coursework.");
          setPageReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const selected =
    assignments.find((item) => item.id === activeId) || assignments[0];
  const rubric = (selected?.rubric || []).map(([label, weight]) => [
    label,
    weight,
    `${weight} pts`,
  ]);
  const modalRubric = (modal?.assignment?.rubric || selected?.rubric || []).map(
    ([label, weight]) => [label, weight, `${weight} pts`],
  );
  const gradedItems = history
    .filter((item) => item.status === "Graded" && item.score != null)
    .map((item) => ({
      ...item,
      assignment: assignments.find(
        (assignment) => assignment.id === item.assignment_id,
      ),
    }));
  const reviewCount = history.filter(
    (item) => item.status === "Submitted",
  ).length;
  const draftCount = history.filter(
    (item) => item.status === "In Progress",
  ).length;
  const averageScore = gradedItems.length
    ? Math.round(
        gradedItems.reduce(
          (sum, item) =>
            sum +
            (Number(item.score) / (Number(item.assignment?.score) || 100)) *
              100,
          0,
        ) / gradedItems.length,
      )
    : null;
  const visibleAssignments = useMemo(() => {
    const query = search.toLowerCase();
    let list = assignments.filter(
      (item) =>
        !submitted[item.id] &&
        `${item.code} ${item.course} ${item.title} ${item.instructor}`
          .toLowerCase()
          .includes(query) &&
        (courseFilter === "All Enrolled Courses" || item.code === courseFilter),
    );
    if (activeFilter === "Upcoming & Pending")
      list = list.filter((item) => item.status === "pending");
    if (sort === "Course Code (A–Z)")
      list = [...list].sort((a, b) => a.code.localeCompare(b.code));
    else list = [...list].sort((a, b) => a.dueSort - b.dueSort);
    return list;
  }, [activeFilter, assignments, courseFilter, search, sort, submitted]);
  const notify = (message) => {
    setNotice(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setNotice(""), 2900);
  };

  function setUpload(next) {
    if (!next) return;
    if (!supportedFile(next)) {
      setFileError("Choose a .ZIP, .TAR.GZ, or .PDF file.");
      return;
    }
    if (next.size > 50 * 1024 * 1024) {
      setFileError("The file exceeds the 50 MB upload limit.");
      return;
    }
    setFile(next);
    setAttachmentId("");
    setFileError("");
  }
  async function saveSubmission(isDraft) {
    if (!selected) return;
    if (!isDraft && !pledge) {
      notify("Please confirm the academic integrity pledge before submitting.");
      return;
    }
    if (!isDraft && !file && !attachmentId && !repository.trim()) {
      notify("Add a file or a public repository link to continue.");
      return;
    }
    if (!isDraft && repository.trim()) {
      try {
        const url = new URL(repository);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        if (!file) {
          notify("Enter a valid HTTPS repository URL or attach a file.");
          return;
        }
      }
    }
    let uploadedId = attachmentId;
    if (file && !uploadedId) {
      const upload = await fetch(
        `/api/assignments/${encodeURIComponent(selected.id)}/files`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
            "X-File-Name": encodeURIComponent(file.name),
            ...(draftId ? { "X-Submission-ID": draftId } : {}),
          },
          body: file,
        },
      );
      const uploadResult = await upload.json().catch(() => null);
      if (!upload.ok) {
        notify(
          uploadResult?.error?.message || "The file could not be uploaded.",
        );
        return;
      }
      uploadedId = uploadResult.data.id;
      setAttachmentId(uploadedId);
    }
    const response = await fetch(
      `/api/assignments/${encodeURIComponent(selected.id)}/submissions`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isDraft ? "In Progress" : "Submitted",
          repositoryUrl: repository.trim(),
          notes,
          pledge,
          attachmentId: uploadedId || undefined,
        }),
      },
    );
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      notify(result?.error?.message || "The submission could not be saved.");
      return;
    }
    const entry = result.data;
    setHistory((current) => [
      entry,
      ...current.filter((item) => item.id !== entry.id),
    ]);
    if (isDraft) {
      setDraftId(entry.id);
      notify("Draft saved to your EduCore account.");
    } else {
      setDraftId("");
      const nextSubmitted = { ...submitted, [selected.id]: true };
      setSubmitted(nextSubmitted);
      const nextAssignment = assignments.find(
        (item) => item.id !== selected.id && !nextSubmitted[item.id],
      );
      if (nextAssignment) {
        setActiveId(nextAssignment.id);
        setRepository("");
        setNotes("");
        setAttachmentId("");
      }
      setFile(null);
      setFileError("");
      notify("Submission received and recorded in your coursework history.");
    }
  }
  function activateAssignment(item) {
    const draft = history.find(
      (entry) =>
        entry.assignment_id === item.id && entry.status === "In Progress",
    );
    setActiveId(item.id);
    setFile(null);
    setFileError("");
    setDraftId(draft?.id || "");
    setAttachmentId(draft?.attachments?.[0]?.id || "");
    setRepository(draft?.repository_url || "");
    setNotes(draft?.notes || "");
  }

  if (!pageReady)
    return (
      <main className="assignments-loading" aria-live="polite">
        Loading your coursework workspace…
      </main>
    );
  if (requestError)
    return (
      <main className="assignments-loading">
        <div role="alert">
          <b>Coursework unavailable</b>
          <p>{requestError}</p>
          <button onClick={() => location.reload()}>Try again</button>
        </div>
      </main>
    );
  if (!selected)
    return (
      <main className="assignments-loading">
        No assignments are available for this account.
      </main>
    );

  return (
    <div className="assignments-page">
      {menuOpen && (
        <button
          className="assignments-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`assignments-sidebar${menuOpen ? " open" : ""}`}>
        <a className="assignments-brand" href="/">
          <img src="/supplied-assets/educore-wordmark.svg" alt="" />
          <span>
            <b>EduCore</b>
            <small>UNIVERSITY PORTAL</small>
          </span>
        </a>
        <div className="assignments-nav-label">Academic Suite</div>
        <nav>
          {navigation.map(([label, Icon, href]) => (
            <a
              href={href}
              key={label}
              onClick={() => setMenuOpen(false)}
              className={`assignments-nav-link${label === "Assignments" ? " active" : ""}`}
              aria-current={label === "Assignments" ? "page" : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="assignments-preferences">
          <div className="assignments-nav-label">Preferences</div>
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
      <div className="assignments-main">
        <header className="assignments-topbar">
          <button
            className="assignments-menu-toggle"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={19} />
          </button>
          <label className="assignments-global-search">
            <Search size={16} />
            <input
              placeholder="Search courses, assignments, faculty..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="assignments-term">
            <CalendarDays size={15} />
            <span>
              {assignments[0]?.dueAt
                ? new Date(assignments[0].dueAt).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })
                : "Current term"}
            </span>
          </label>
          <div className="assignments-user-actions">
            <a className="assignments-user" href="/my-courses">
              <span>
                {(account?.name || "Student")
                  .trim()
                  .split(/\s+/)
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <b>
                {account?.name || "Student"}
                <small>
                  {account?.universityId ||
                    account?.email ||
                    "University account"}
                </small>
              </b>
              <ChevronDown size={13} />
            </a>
          </div>
        </header>
        <main className="assignments-content">
          <div className="assignments-heading">
            <div>
              <div className="assignments-breadcrumb">
                <b>YOUR COURSEWORK</b>
                <i />
                Academic Assessment
              </div>
              <h1>Assignments &amp; Coursework</h1>
              <p>
                Review coursework deadlines, submit your work, and follow
                submission and grading updates.
              </p>
            </div>
            <div className="assignments-heading-actions">
              <button
                className="assignment-button light"
                onClick={() => setModal({ type: "rubric-matrix" })}
                disabled={!rubric.length}
              >
                <SlidersHorizontal size={15} />
                Rubric Matrix
              </button>
              <button
                className="assignment-button navy"
                onClick={() => setModal({ type: "history" })}
              >
                <History size={15} />
                Submission History
              </button>
            </div>
          </div>

          <section className="assignment-kpis" aria-label="Coursework summary">
            <article>
              <div>
                <small>TO SUBMIT</small>
                <i className="red">
                  <Clock3 size={17} />
                </i>
              </div>
              <p>
                <strong>
                  {String(
                    assignments.filter((item) => !submitted[item.id]).length,
                  ).padStart(2, "0")}
                </strong>{" "}
                assignments
              </p>
              <footer>
                <b>
                  {assignments.filter((item) => !submitted[item.id]).length
                    ? `${assignments.filter((item) => !submitted[item.id]).length} still open`
                    : "All caught up"}
                </b>
                <span>{assignments[0]?.due || ""}</span>
              </footer>
            </article>
            <article>
              <div>
                <small>UNDER REVIEW</small>
                <i className="lavender">
                  <FileCheck2 size={17} />
                </i>
              </div>
              <p>
                <strong className="blue">
                  {String(reviewCount).padStart(2, "0")}
                </strong>{" "}
                submissions
              </p>
              <footer>
                <span>Awaiting instructor feedback</span>
              </footer>
            </article>
            <article>
              <div>
                <small>GRADED &amp; RETURNED</small>
                <i className="sky">
                  <Star size={17} />
                </i>
              </div>
              <p>
                <strong>{String(gradedItems.length).padStart(2, "0")}</strong>{" "}
                submissions
              </p>
              <footer>
                <span>
                  {averageScore === null
                    ? "No graded work yet"
                    : `Average score: ${averageScore}%`}
                </span>
              </footer>
            </article>
            <article>
              <div>
                <small>SAVED DRAFTS</small>
                <i className="gray">
                  <FileText size={17} />
                </i>
              </div>
              <p>
                <strong>{String(draftCount).padStart(2, "0")}</strong> drafts
              </p>
              <footer>
                <span>Saved to your EduCore account</span>
              </footer>
            </article>
          </section>

          <section className="assignment-filterbar">
            <div
              className="assignment-filter-tabs"
              role="tablist"
              aria-label="Assignment status"
            >
              <button
                className={activeFilter === "All" ? "active" : ""}
                role="tab"
                aria-selected={activeFilter === "All"}
                onClick={() => setActiveFilter("All")}
              >
                All <small>{assignments.length}</small>
              </button>
              <button
                className={
                  activeFilter === "Upcoming & Pending" ? "active" : ""
                }
                role="tab"
                aria-selected={activeFilter === "Upcoming & Pending"}
                onClick={() => setActiveFilter("Upcoming & Pending")}
              >
                Upcoming &amp; Pending
              </button>
            </div>
            <label className="assignment-search">
              <Search size={15} />
              <input
                placeholder="Search by title, course, or instructor..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label className="assignment-select">
              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
              >
                <option>All Enrolled Courses</option>
                {[...new Set(assignments.map((item) => item.code))].map(
                  (code) => (
                    <option key={code}>{code}</option>
                  ),
                )}
              </select>
              <ChevronDown size={13} />
            </label>
            <label className="assignment-select sort">
              <span>Sort:</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option>Due Date (Earliest)</option>
                <option>Course Code (A–Z)</option>
              </select>
              <ChevronDown size={13} />
            </label>
          </section>

          <div className="assignment-workspace">
            <section className="assignment-list-column">
              {assignments[0] && !submitted[assignments[0].id] && (
                <>
                  <div className="assignment-section-title urgent-title">
                    <h2>
                      <CircleAlert size={16} />
                      Next Assignment Deadline
                    </h2>
                    <span>{assignments[0].due}</span>
                  </div>
                  <article
                    className={`urgent-assignment${activeId === assignments[0].id ? " selected" : ""}`}
                    onClick={() => activateAssignment(assignments[0])}
                  >
                    <div className="urgent-meta">
                      <span className="course-badge">
                        {assignments[0].code}
                      </span>
                      <span>{assignments[0].course}</span>
                      <i />
                      {assignments[0].type}
                      <span className="deadline-chip">
                        <Clock3 size={11} />
                        {assignments[0].due}
                      </span>
                    </div>
                    <h3>{assignments[0].title}</h3>
                    <p>{assignments[0].detail}</p>
                    <div className="urgent-facts">
                      <div>
                        <small>INSTRUCTOR</small>
                        <b>{assignments[0].instructor}</b>
                      </div>
                      <div>
                        <small>DEADLINE</small>
                        <b className="critical">{assignments[0].due}</b>
                      </div>
                      <div>
                        <small>FORMAT</small>
                        <b>{assignments[0].format}</b>
                      </div>
                      <div>
                        <small>WEIGHT / SCORE</small>
                        <b>{assignments[0].weight}</b>
                      </div>
                    </div>
                    <div className="urgent-footer">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setModal({
                            type: "rubric",
                            assignment: assignments[0],
                          });
                        }}
                      >
                        <BookOpen size={13} />
                        View rubric
                      </button>
                      <span>
                        {assignments[0].attemptsUsed}/
                        {assignments[0].maxAttempts} attempts used
                      </span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          activateAssignment(assignments[0]);
                          document
                            .querySelector(".submission-panel")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        }}
                      >
                        <Upload size={14} />
                        Submit work
                      </button>
                    </div>
                  </article>
                </>
              )}

              <div className="assignment-section-title upcoming-title">
                <h2>Open Assignments</h2>
                <span>Sorted by closest deadline</span>
              </div>
              <div className="upcoming-list">
                {visibleAssignments.map((item) => (
                  <article
                    className={`upcoming-assignment${activeId === item.id ? " chosen" : ""}`}
                    key={item.id}
                    onClick={() => activateAssignment(item)}
                  >
                    <div className="upcoming-meta">
                      <span className="course-badge pale">{item.code}</span>
                      <span>{item.course}</span>
                      <b>
                        <CalendarDays size={11} />
                        {item.due}
                      </b>
                    </div>
                    <div className="upcoming-content">
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.detail}</p>
                      </div>
                      <div className="upcoming-score">
                        <small>Grading Scale</small>
                        <b>{item.score} Pts</b>
                        <span>
                          Weight: {item.code === "CS312" ? "8%" : "10%"}
                        </span>
                      </div>
                    </div>
                    <footer>
                      <span>
                        <UserRound size={13} />
                        {item.instructor}
                      </span>
                      <span>
                        <FileText size={13} />
                        {item.format}
                      </span>
                      <div>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setModal({ type: "rubric", assignment: item });
                          }}
                        >
                          View Rubric
                        </button>
                        <button
                          className="prepare-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            activateAssignment(item);
                            document
                              .querySelector(".submission-panel")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                            notify(
                              `${item.code} is ready in the submission portal.`,
                            );
                          }}
                        >
                          <FileText size={13} />
                          Prepare Draft
                        </button>
                      </div>
                    </footer>
                  </article>
                ))}
                {visibleAssignments.length === 0 && (
                  <div className="assignment-empty">
                    <Search size={20} />
                    <b>No assignments match these filters</b>
                    <span>Try changing your search or course selection.</span>
                    <button
                      onClick={() => {
                        setSearch("");
                        setCourseFilter("All Enrolled Courses");
                        setActiveFilter("All");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              <div className="assignment-section-title graded-title">
                <h2>Recently Graded &amp; Feedback</h2>
                <button onClick={() => setModal({ type: "graded-history" })}>
                  View All {gradedItems.length} Graded <ArrowRight size={13} />
                </button>
              </div>
              {gradedItems.length ? (
                gradedItems.slice(0, 3).map((item) => (
                  <article className="graded-card" key={item.id}>
                    <div className="graded-score">
                      <b>{item.score}</b>
                      <small>/{item.assignment?.score || 100}</small>
                    </div>
                    <div className="graded-copy">
                      <div className="graded-meta">
                        <b>{item.code}</b>
                        <span>{item.assignment?.course || "Course"}</span>
                        <strong>
                          <Award size={11} />
                          Graded
                        </strong>
                      </div>
                      <h3>{item.title}</h3>
                      <p>
                        {item.feedback ||
                          "Your instructor has returned this work."}
                      </p>
                    </div>
                    <button
                      className="feedback-button"
                      onClick={() => setModal({ type: "feedback", item })}
                    >
                      <GraduationCap size={14} />
                      Full Feedback
                    </button>
                  </article>
                ))
              ) : (
                <div className="assignment-empty">
                  <FileCheck2 size={20} />
                  <b>No graded submissions yet</b>
                  <span>Instructor feedback and marks will appear here.</span>
                </div>
              )}
            </section>

            <aside className="assignment-side-column">
              <section className="submission-panel">
                <header>
                  <h2>
                    <CloudUpload size={18} />
                    Submission Portal
                  </h2>
                  <span>Active: {selected.code}</span>
                </header>
                <div className="active-assignment">
                  <small>ACTIVE ASSIGNMENT</small>
                  <b>{selected.title}</b>
                  <footer>
                    <span>
                      <Clock3 size={12} />
                      Due: {selected.due}
                    </span>
                    <span>
                      Attempts: {selected.attemptsUsed}/{selected.maxAttempts}
                    </span>
                  </footer>
                </div>
                <div className="rubric-preview">
                  <div>
                    <b>EVALUATION RUBRIC</b>
                    <button
                      onClick={() =>
                        setModal({ type: "rubric", assignment: selected })
                      }
                    >
                      {rubric.length} criteria
                    </button>
                  </div>
                  <i className="rubric-bar">
                    <span />
                  </i>
                  <div className="rubric-legend">
                    {rubric.map(([label, , points], index) => (
                      <span key={label}>
                        <i className={`rubric-dot dot-${index}`} />
                        {label} ({points})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="upload-label">
                  SUBMISSION FILE (.ZIP / .TAR.GZ / .PDF)
                </div>
                <button
                  className={`upload-drop${file ? " has-file" : ""}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    setUpload(event.dataTransfer.files[0]);
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".zip,.tar.gz,.pdf,application/pdf,application/zip"
                    onChange={(event) => setUpload(event.target.files[0])}
                    hidden
                  />
                  {file ? (
                    <>
                      <FileArchive size={20} />
                      <b>{file.name}</b>
                      <span>
                        {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to
                        attach
                      </span>
                      <span
                        className="remove-file"
                        onClick={(event) => {
                          event.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Remove file
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">
                        <Upload size={18} />
                      </span>
                      <b>Drag &amp; drop your submission here</b>
                      <small>
                        or <u>browse files</u> from your device
                      </small>
                      <small>ZIP, TAR.GZ, or PDF · Maximum 50 MB</small>
                    </>
                  )}
                </button>
                {fileError && (
                  <p className="upload-error" role="alert">
                    {fileError}
                  </p>
                )}
                <label className="submission-field">
                  <span>
                    <b>PUBLIC GIT REPOSITORY (RECOMMENDED)</b>
                    <small>vcs:// branch-pinned</small>
                  </span>
                  <div>
                    <Code2 size={14} />
                    <input
                      type="url"
                      value={repository}
                      onChange={(event) => setRepository(event.target.value)}
                      placeholder="https://github.com/username/repository"
                    />
                  </div>
                </label>
                <label className="submission-field notes-field">
                  <span>
                    <b>
                      SUBMISSION NOTES / INSTRUCTIONS FOR TEACHING ASSISTANT
                    </b>
                  </span>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Share setup notes or context for your instructor..."
                  />
                </label>
                <label className="integrity-pledge">
                  <input
                    type="checkbox"
                    checked={pledge}
                    onChange={(event) => setPledge(event.target.checked)}
                  />
                  <span>
                    <Check size={12} />
                  </span>
                  <small>
                    I certify that this submission represents my original
                    independent work in full compliance with the{" "}
                    <b>EduCore University Academic Integrity Policy</b>.
                    Automated integrity checks may be applied.
                  </small>
                </label>
                <div className="submission-actions">
                  <button onClick={() => saveSubmission(true)}>
                    Save Draft
                  </button>
                  <button onClick={() => saveSubmission(false)}>
                    <ShieldCheck size={14} />
                    Confirm &amp; Submit ({selected.score} Pts)
                  </button>
                </div>
                <footer className="submission-security">
                  <span>
                    <LockKeyhole size={12} />
                    256-Bit SSL Encrypted Vault
                  </span>
                  <i />
                  Digital Timestamped SHA-256
                </footer>
              </section>
              <section className="clarification-card">
                <span>
                  <MessageSquare size={18} />
                </span>
                <div>
                  <b>Need assignment clarification?</b>
                  <p>
                    Contact {selected.instructor} through your course
                    communication channel.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
      {modal && (
        <div
          className="assignment-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <section
            className="assignment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-modal-title"
          >
            <button
              className="assignment-modal-close"
              aria-label="Close"
              onClick={() => setModal(null)}
            >
              <X size={18} />
            </button>
            {modal.type === "rubric" || modal.type === "rubric-matrix" ? (
              <>
                <span className="assignment-modal-kicker">
                  Assessment criteria ·{" "}
                  {modal.assignment?.code || selected?.code || "Course"}
                </span>
                <h2 id="assignment-modal-title">Evaluation rubric</h2>
                <p>Scoring criteria for this assignment.</p>
                <div className="rubric-modal-list">
                  {modalRubric.length ? (
                    modalRubric.map(([label, weight, points]) => (
                      <div key={label}>
                        <span>
                          <b>{label}</b>
                        </span>
                        <strong>
                          {points}
                          <small>{weight}%</small>
                        </strong>
                      </div>
                    ))
                  ) : (
                    <div className="history-empty">
                      No rubric has been published for this assignment.
                    </div>
                  )}
                </div>
                <button
                  className="assignment-modal-primary"
                  onClick={() => setModal(null)}
                >
                  Close rubric
                </button>
              </>
            ) : modal.type === "history" || modal.type === "graded-history" ? (
              <>
                <span className="assignment-modal-kicker">
                  Coursework activity
                </span>
                <h2 id="assignment-modal-title">
                  {modal.type === "history"
                    ? "Submission history"
                    : "Graded coursework"}
                </h2>
                <p>Submissions saved to your student account.</p>
                <div className="history-list">
                  {(modal.type === "graded-history"
                    ? history.filter((item) => item.status === "Graded")
                    : history
                  ).length ? (
                    (modal.type === "graded-history"
                      ? history.filter((item) => item.status === "Graded")
                      : history
                    ).map((item) => (
                      <div key={item.id}>
                        <i>
                          <FileCheck2 size={15} />
                        </i>
                        <span>
                          <b>
                            {item.code} · {item.title}
                          </b>
                          <small>
                            {item.status} ·{" "}
                            {new Date(item.date).toLocaleString()}
                          </small>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="history-empty">
                      <History size={19} />
                      No submissions in this history yet.
                    </div>
                  )}
                </div>
                <button
                  className="assignment-modal-primary"
                  onClick={() => setModal(null)}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <span className="assignment-modal-kicker">
                  Instructor feedback · {modal.item?.code}
                </span>
                <h2 id="assignment-modal-title">
                  {modal.item?.score}/{modal.item?.assignment?.score || 100}
                </h2>
                <p>{modal.item?.title}</p>
                <div className="feedback-details">
                  <b>Instructor feedback</b>
                  <span>
                    {modal.item?.feedback ||
                      "No written feedback was provided."}
                  </span>
                </div>
                <button
                  className="assignment-modal-primary"
                  onClick={() => setModal(null)}
                >
                  Close feedback
                </button>
              </>
            )}
          </section>
        </div>
      )}
      {notice && (
        <div className="assignment-toast" role="status">
          <CheckCircle2 size={16} />
          {notice}
        </div>
      )}
    </div>
  );
}
