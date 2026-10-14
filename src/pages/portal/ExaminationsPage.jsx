import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Flag,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import "./examinations.css";

export default function ExaminationsPage() {
  const [exams, setExams] = useState([]),
    [attempt, setAttempt] = useState(null),
    [answers, setAnswers] = useState({}),
    [flags, setFlags] = useState([]),
    [active, setActive] = useState(0),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [now, setNow] = useState(Date.now());
  async function request(path, options = {}) {
    const response = await fetch(path, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    const body = await response.json().catch(() => null);
    if (response.status === 401) {
      location.replace(`/login?next=${encodeURIComponent(location.pathname)}`);
      throw new Error("Please sign in again.");
    }
    if (!response.ok)
      throw new Error(
        body?.error?.message || "The examination service is unavailable.",
      );
    return body?.data;
  }
  async function refresh() {
    setLoading(true);
    try {
      setExams(await request("/api/examinations"));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    if (!attempt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [attempt]);
  const secondsLeft = attempt
    ? Math.max(
        0,
        Math.floor(
          (Math.min(
            new Date(attempt.closesAt).getTime(),
            new Date(attempt.startedAt).getTime() +
              attempt.durationMinutes * 60000,
          ) -
            now) /
            1000,
        ),
      )
    : 0;
  const clock = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const current = attempt?.questions?.[active];
  const answered = useMemo(
    () =>
      Object.keys(answers).filter(
        (key) => answers[key] !== "" && answers[key] != null,
      ).length,
    [answers],
  );
  async function start(exam) {
    setSaving(true);
    try {
      const data = await request(
        `/api/examinations/${encodeURIComponent(exam.id)}/attempts`,
        { method: "POST", body: "{}" },
      );
      setAttempt(data);
      setAnswers(data.answers || {});
      setFlags([]);
      setActive(0);
      setNotice("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function save() {
    if (!attempt) return;
    setSaving(true);
    try {
      await request(
        `/api/examinations/attempts/${encodeURIComponent(attempt.id)}/save`,
        { method: "POST", body: JSON.stringify({ answers }) },
      );
      setNotice("Answers saved");
      setTimeout(() => setNotice(""), 1800);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function submit() {
    if (!attempt) return;
    if (
      !window.confirm(
        "Submit your examination now? You cannot change answers after submission.",
      )
    )
      return;
    setSaving(true);
    try {
      const result = await request(
        `/api/examinations/attempts/${encodeURIComponent(attempt.id)}/submit`,
        { method: "POST", body: JSON.stringify({ answers }) },
      );
      setAttempt(null);
      setNotice(
        result.objectiveScore === null
          ? "Submitted. Written responses will be graded by your instructor."
          : `Submitted · ${result.objectiveScore} / ${result.objectiveMax} objective points`,
      );
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  useEffect(() => {
    if (secondsLeft === 0 && attempt?.id) {
      submitExpired();
    }
  }, [secondsLeft]);
  async function submitExpired() {
    if (!attempt || saving) return;
    setSaving(true);
    try {
      const result = await request(
        `/api/examinations/attempts/${encodeURIComponent(attempt.id)}/submit`,
        { method: "POST", body: JSON.stringify({ answers }) },
      );
      setAttempt(null);
      setNotice("Time is up. Your saved answers have been submitted.");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  if (loading && !attempt)
    return <main className="exam-loading">Loading examinations…</main>;
  if (attempt)
    return (
      <main className="exam-page">
        <header className="exam-top">
          <a href="/dashboard">
            <ArrowLeft size={16} /> Exit to portal
          </a>
          <span>
            <ShieldCheck size={15} /> Secure examination
          </span>
          <b className={secondsLeft < 300 ? "urgent" : ""}>
            <Clock3 size={16} />
            {clock}
          </b>
        </header>
        <div className="exam-shell">
          <section className="exam-heading">
            <small>{attempt.examinationId}</small>
            <h1>{attempt.title}</h1>
            <p>
              {attempt.instructions ||
                "Read each question carefully. Your answers save to your examination attempt."}
            </p>
            <div className="exam-progress">
              <span>
                {answered} of {attempt.questions.length} answered
              </span>
              <i>
                <b
                  style={{
                    width: `${attempt.questions.length ? (answered / attempt.questions.length) * 100 : 0}%`,
                  }}
                />
              </i>
            </div>
          </section>
          <div className="exam-work">
            <nav className="exam-question-nav" aria-label="Question navigation">
              {attempt.questions.map((question, index) => (
                <button
                  key={question.id}
                  aria-label={`Question ${index + 1}${answers[question.id] != null ? " answered" : ""}${flags.includes(question.id) ? ", flagged" : ""}`}
                  className={`${index === active ? "active " : ""}${answers[question.id] != null ? "answered " : ""}${flags.includes(question.id) ? "flagged" : ""}`}
                  onClick={() => setActive(index)}
                >
                  {index + 1}
                  {flags.includes(question.id) && <Flag size={10} />}
                </button>
              ))}
            </nav>
            <section className="exam-question">
              <div className="exam-question-meta">
                <span>
                  QUESTION {active + 1} / {attempt.questions.length}
                </span>
                <button
                  onClick={() =>
                    setFlags((items) =>
                      items.includes(current.id)
                        ? items.filter((id) => id !== current.id)
                        : [...items, current.id],
                    )
                  }
                  className={flags.includes(current?.id) ? "marked" : ""}
                >
                  <Flag size={14} />
                  {flags.includes(current?.id) ? "Flagged" : "Flag for review"}
                </button>
              </div>
              <h2>{current?.prompt}</h2>
              <small>
                {current?.points} point{current?.points === 1 ? "" : "s"} ·{" "}
                {String(current?.type || "").replaceAll("_", " ")}
              </small>
              <div className="exam-answer">
                {current?.options?.length ? (
                  current.options.map((option, index) => {
                    const value =
                      typeof option === "object"
                        ? (option.id ?? option.value ?? option.label)
                        : option;
                    const label =
                      typeof option === "object"
                        ? (option.label ?? option.text ?? value)
                        : option;
                    return (
                      <label
                        key={index}
                        className={
                          String(answers[current.id]) === String(value)
                            ? "selected"
                            : ""
                        }
                      >
                        <input
                          type="radio"
                          name={current.id}
                          checked={
                            String(answers[current.id] ?? "") === String(value)
                          }
                          onChange={() =>
                            setAnswers((items) => ({
                              ...items,
                              [current.id]: value,
                            }))
                          }
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })
                ) : current?.type?.toLowerCase().includes("essay") ? (
                  <textarea
                    rows="8"
                    value={answers[current.id] || ""}
                    onChange={(event) =>
                      setAnswers((items) => ({
                        ...items,
                        [current.id]: event.target.value,
                      }))
                    }
                    placeholder="Write your response here…"
                  />
                ) : (
                  <input
                    className="exam-short-answer"
                    value={answers[current.id] || ""}
                    onChange={(event) =>
                      setAnswers((items) => ({
                        ...items,
                        [current.id]: event.target.value,
                      }))
                    }
                    placeholder="Enter your answer"
                  />
                )}
              </div>
              <footer>
                <button
                  className="exam-secondary"
                  disabled={active === 0}
                  onClick={() => setActive((value) => value - 1)}
                >
                  <ArrowLeft size={14} /> Previous
                </button>
                <button
                  className="exam-secondary"
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? (
                    "Saving…"
                  ) : (
                    <>
                      <Check size={14} /> Save progress
                    </>
                  )}
                </button>
                {active < attempt.questions.length - 1 ? (
                  <button
                    className="exam-next"
                    onClick={() => setActive((value) => value + 1)}
                  >
                    Next question <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    className="exam-submit"
                    onClick={submit}
                    disabled={saving}
                  >
                    Submit examination <CheckCircle2 size={14} />
                  </button>
                )}
              </footer>
            </section>
          </div>
          {notice && (
            <p className="exam-toast" role="status">
              {notice}
            </p>
          )}
          {error && (
            <p className="exam-error" role="alert">
              {error}
              <button onClick={() => setError("")}>Dismiss</button>
            </p>
          )}
        </div>
      </main>
    );
  return (
    <main className="exam-page">
      <header className="exam-top">
        <a href="/dashboard">
          <ArrowLeft size={16} /> Student portal
        </a>
        <span>
          <GraduationCap size={16} /> Examination center
        </span>
        <i />
      </header>
      <section className="exam-list">
        <div className="exam-list-intro">
          <span>ASSESSMENTS</span>
          <h1>Examinations</h1>
          <p>
            Scheduled assessments for your registered courses. Eligibility and
            attempt limits are verified when you begin.
          </p>
        </div>
        {notice && (
          <p className="exam-toast" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="exam-error" role="alert">
            {error}
            <button onClick={() => setError("")}>Dismiss</button>
          </p>
        )}
        {!exams.length && !error ? (
          <div className="exam-empty">
            <CheckCircle2 size={25} />
            <b>No scheduled examinations</b>
            <p>
              When an examination is published for your registered courses, it
              will appear here.
            </p>
          </div>
        ) : (
          <div className="exam-cards">
            {exams.map((exam) => (
              <article key={exam.id}>
                <div className="exam-card-title">
                  <span>{exam.code}</span>
                  <small className={`exam-badge ${exam.availability}`}>
                    {exam.availability}
                  </small>
                </div>
                <h2>{exam.title}</h2>
                <p>{exam.course_title}</p>
                <div className="exam-card-meta">
                  <span>
                    <Clock3 size={14} />
                    {exam.duration_minutes} minutes
                  </span>
                  <span>{new Date(exam.opens_at).toLocaleString()}</span>
                </div>
                <footer>
                  <small>
                    {exam.attempts_remaining} of {exam.attempt_limit} attempts
                    remaining
                  </small>
                  <button
                    disabled={
                      saving ||
                      exam.availability !== "open" ||
                      exam.attempts_remaining < 1
                    }
                    onClick={() => start(exam)}
                  >
                    {saving ? "Starting…" : "Begin examination"}
                    <ArrowRight size={14} />
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
