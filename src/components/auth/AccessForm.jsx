import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

const personas = ["Student", "Faculty / Staff", "Applicant", "Alumni"];

export default function AccessForm({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [persona, setPersona] = useState("Student");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");
  const [pending, setPending] = useState(false);
  const [lastIdentifier, setLastIdentifier] = useState("");

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get(
      "authError",
    );
    if (authError) {
      const messages = {
        provider_cancelled:
          "Sign-in was cancelled. You can try again whenever you are ready.",
        google_unconfigured:
          "Google sign-in is not configured yet. Add the server-side Google OAuth credentials described in AUTH_SETUP.md.",
        microsoft_unconfigured:
          "Microsoft sign-in is not configured yet. Add the server-side Microsoft OAuth credentials described in AUTH_SETUP.md.",
      };
      setNoticeType("error");
      setNotice(
        messages[authError] ||
          "Provider sign-in could not be completed. Please try again.",
      );
    }
  }, []);

  function changeMode(next) {
    setMode(next);
    if (next === "signup" && persona === "Faculty / Staff")
      setPersona("Student");
    setNotice("");
  }
  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.persona = persona;
    if (
      (mode === "signup" || mode === "reset-confirm") &&
      payload.password !== payload.confirmPassword
    ) {
      setNoticeType("error");
      setNotice("The passwords do not match. Check both fields and try again.");
      return;
    }
    delete payload.confirmPassword;
    const apiBase = (import.meta.env.VITE_AUTH_API_BASE || "/api").replace(
      /\/$/,
      "",
    );
    const endpoint =
      mode === "login"
        ? "/auth/login"
        : mode === "signup"
          ? "/auth/signup"
          : mode === "reset-confirm"
            ? "/auth/password-reset/confirm"
            : "/auth/password-reset";
    const requestUrl = `${apiBase}${endpoint}`;
    setPending(true);
    setNotice("");
    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const result = isJson ? await response.json().catch(() => null) : null;
      if (!result && response.status === 404)
        throw new Error(
          `The request to ${new URL(requestUrl, window.location.href).href} from ${window.location.origin} returned 404. The project API works at http://127.0.0.1:5173; this response came from a different or stale server.`,
        );
      if (!result)
        throw new Error(
          `The account service returned an unexpected response (HTTP ${response.status}). Open the site using the URL printed by “npm run dev”.`,
        );
      if (!response.ok)
        throw new Error(
          result.message ||
            `The request failed (HTTP ${response.status}). Check your details and try again.`,
        );
      setNoticeType("success");
      setNotice(
        result.message ||
          (mode === "login"
            ? "You are signed in. Opening your student portal…"
            : mode === "signup"
              ? "Your account request was submitted successfully."
              : "If your account exists, password reset instructions have been sent."),
      );
      if (mode === "signup")
        setLastIdentifier(payload.email || payload.registrationId || "");
      if (mode === "reset-confirm") setLastIdentifier("");
      if (mode === "login") {
        const requestedNext = new URLSearchParams(window.location.search).get(
          "next",
        );
        let destination = result.redirectTo || "/dashboard";
        if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
          try {
            const nextUrl = new URL(requestedNext, window.location.origin);
            if (nextUrl.origin === window.location.origin)
              destination = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
          } catch {
            /* Ignore malformed return paths and use the server's safe default. */
          }
        }
        window.location.assign(destination);
      } else if (mode === "signup" || mode === "reset-confirm") {
        setMode("login");
      }
    } catch (error) {
      setNoticeType("error");
      setNotice(
        error.message ||
          "Unable to reach the identity service. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  function startProvider(provider) {
    const apiBase = (import.meta.env.VITE_AUTH_API_BASE || "/api").replace(
      /\/$/,
      "",
    );
    window.location.assign(`${apiBase}/auth/${provider}`);
  }

  const accountIdLabel =
    persona === "Student"
      ? "Student registration ID"
      : persona === "Faculty / Staff"
        ? "Staff or faculty ID"
        : persona === "Applicant"
          ? "Application ID"
          : "Alumni ID";
  const accountIdPlaceholder =
    persona === "Student"
      ? "e.g. STU-2026-9102"
      : persona === "Faculty / Staff"
        ? "e.g. EMP-2026-1042"
        : persona === "Applicant"
          ? "e.g. APP-2026-9102"
          : "e.g. ALU-2026-3104";
  const availablePersonas =
    mode === "signup"
      ? personas.filter((item) => item !== "Faculty / Staff")
      : personas;

  return (
    <section className="auth-panel access-panel">
      <div className="access-topline">
        <div>
          <span className="auth-eyebrow">
            ADMISSIONS &amp; UNIVERSITY ACCOUNT
          </span>
          <h1>
            {mode === "login"
              ? "Institutional Access"
              : mode === "signup"
                ? "Claim Your Account"
                : "Reset Your Password"}
          </h1>
        </div>
        <div
          className="auth-tabs"
          role="tablist"
          aria-label="Account access options"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={mode === "login" ? "selected" : ""}
            onClick={() => changeMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={mode === "signup" ? "selected" : ""}
            onClick={() => changeMode("signup")}
          >
            New Account Claim
          </button>
        </div>
      </div>
      {mode !== "reset" && (
        <div className="persona-group">
          <span className="field-label">Select Persona</span>
          <div
            className="persona-options"
            role="group"
            aria-label="Select account type"
          >
            {availablePersonas.map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={persona === item}
                className={persona === item ? "active" : ""}
                onClick={() => setPersona(item)}
              >
                <UserRound size={15} />
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
      {mode === "login" && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="login-id">
            University ID / Official Email{" "}
            <span>e.g. stu-882194@educore.edu.gh</span>
          </label>
          <div className="input-wrap">
            <UserRound />
            <input
              id="login-id"
              name="identifier"
              autoComplete="username"
              defaultValue={lastIdentifier}
              required
              placeholder="username@educore.edu.gh or 8-digit ID"
            />
          </div>
          <div className="field-label-row">
            <label className="field-label" htmlFor="login-password">
              Institutional Passphrase
            </label>
            <button
              className="text-action"
              type="button"
              onClick={() => changeMode("reset")}
            >
              Forgot credentials?
            </button>
          </div>
          <div className="input-wrap">
            <LockKeyhole />
            <input
              id="login-password"
              name="password"
              autoComplete="current-password"
              required
              type={showPassword ? "text" : "password"}
              placeholder="Enter secure password"
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <div className="form-options">
            <label className="remember-option">
              <input
                type="checkbox"
                name="rememberMe"
                value="on"
                defaultChecked
              />{" "}
              Remember this device for 30 days
            </label>
            <span>
              <i /> Two-step verification
            </span>
          </div>
          <button className="submit-button" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Access Academic Suite"}{" "}
            <ArrowRight size={18} />
          </button>
          {notice && (
            <p
              className={`form-notice ${noticeType}`}
              role={noticeType === "error" ? "alert" : "status"}
            >
              {notice}
            </p>
          )}
          <div className="divider">
            <span>OR CONTINUE WITH</span>
          </div>
          <div className="federated-options">
            <button type="button" onClick={() => startProvider("microsoft")}>
              <b className="microsoft-mark">
                <i />
                <i />
                <i />
                <i />
              </b>
              Continue with Microsoft
            </button>
            <button type="button" onClick={() => startProvider("google")}>
              <b className="google-mark">G</b>Continue with Google
            </button>
          </div>
        </form>
      )}
      {mode === "signup" && (
        <form className="auth-form signup-form" onSubmit={handleSubmit}>
          <p className="form-lead">
            Create a student, applicant, or alumni account. Faculty and staff
            portal access is assigned by an authorized university administrator.
          </p>
          <label className="field-label" htmlFor="claim-id">
            {accountIdLabel}
          </label>
          <div className="input-wrap">
            <KeyRound />
            <input
              id="claim-id"
              name="registrationId"
              autoComplete="off"
              required
              placeholder={accountIdPlaceholder}
            />
          </div>
          <label className="field-label" htmlFor="claim-name">
            Full name
          </label>
          <div className="input-wrap">
            <UserRound />
            <input
              id="claim-name"
              name="fullName"
              autoComplete="name"
              required
              placeholder="As stated in university records"
            />
          </div>
          <label className="field-label" htmlFor="claim-email">
            Official university email
          </label>
          <div className="input-wrap">
            <Mail />
            <input
              id="claim-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="assigned@educore.edu.gh"
            />
          </div>
          <label className="field-label" htmlFor="claim-college">
            College or faculty
          </label>
          <select
            className="claim-select"
            id="claim-college"
            name="college"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select your college or faculty
            </option>
            <option>College of Applied Sciences</option>
            <option>College of Health Sciences</option>
            <option>College of Humanities &amp; Business</option>
            <option>Faculty of Computer Science</option>
            <option>Alumni Relations</option>
          </select>
          <label className="field-label" htmlFor="claim-password">
            Create a password
          </label>
          <div className="input-wrap">
            <LockKeyhole />
            <input
              id="claim-password"
              name="password"
              autoComplete="new-password"
              required
              minLength={12}
              type={showPassword ? "text" : "password"}
              placeholder="At least 12 characters"
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <label className="field-label" htmlFor="claim-confirm-password">
            Confirm password
          </label>
          <div className="input-wrap">
            <LockKeyhole />
            <input
              id="claim-confirm-password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={12}
              type={showPassword ? "text" : "password"}
              placeholder="Enter the same password again"
            />
          </div>
          <p className="password-hint">
            Choose at least 12 characters. Use a unique password you don’t use
            elsewhere.
          </p>
          <button className="submit-button" type="submit" disabled={pending}>
            {pending ? "Creating account…" : "Create University Account"}{" "}
            <ArrowRight size={18} />
          </button>
          {notice && (
            <p
              className={`form-notice ${noticeType}`}
              role={noticeType === "error" ? "alert" : "status"}
            >
              {notice}
            </p>
          )}
        </form>
      )}
      {mode === "reset" && (
        <form className="auth-form reset-form" onSubmit={handleSubmit}>
          <p className="form-lead">
            Enter your university ID or official email and we’ll help you
            recover access.
          </p>
          <label className="field-label" htmlFor="reset-id">
            University ID / Official Email
          </label>
          <div className="input-wrap">
            <Mail />
            <input
              id="reset-id"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              placeholder="username@educore.edu.gh"
            />
          </div>
          <button className="submit-button" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Request Reset Instructions"}{" "}
            <ArrowRight size={18} />
          </button>
          {notice && (
            <p
              className={`form-notice ${noticeType}`}
              role={noticeType === "error" ? "alert" : "status"}
            >
              {notice}
            </p>
          )}
          <button
            className="back-to-login"
            type="button"
            onClick={() => changeMode("login")}
          >
            Back to sign in
          </button>
        </form>
      )}
      {mode === "reset-confirm" && (
        <form className="auth-form reset-form" onSubmit={handleSubmit}>
          <p className="form-lead">
            Choose a new password for your EduCore account.
          </p>
          <input
            type="hidden"
            name="token"
            value={
              new URLSearchParams(window.location.search).get("token") || ""
            }
          />
          <label className="field-label" htmlFor="new-password">
            New password
          </label>
          <div className="input-wrap">
            <LockKeyhole />
            <input
              id="new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
              required
              placeholder="At least 12 characters"
            />
          </div>
          <label className="field-label" htmlFor="confirm-new-password">
            Confirm new password
          </label>
          <div className="input-wrap">
            <LockKeyhole />
            <input
              id="confirm-new-password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
              required
              placeholder="Enter it again"
            />
          </div>
          <button className="submit-button" type="submit" disabled={pending}>
            {pending ? "Updating password…" : "Save New Password"}{" "}
            <ArrowRight size={18} />
          </button>
          {notice && (
            <p
              className={`form-notice ${noticeType}`}
              role={noticeType === "error" ? "alert" : "status"}
            >
              {notice}
            </p>
          )}
          <button
            className="back-to-login"
            type="button"
            onClick={() => changeMode("login")}
          >
            Back to sign in
          </button>
        </form>
      )}
      <p className="auth-privacy">
        Secure sign-in and account creation connect to the university identity
        service. Your password is never saved in this browser.
      </p>
    </section>
  );
}
