import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  Search,
  Shield,
  Users,
} from "lucide-react";
import "./admin-users.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/users?limit=100", { credentials: "include" }),
      fetch("/api/admin/roles", { credentials: "include" }),
      fetch("/api/me", { credentials: "include" }),
    ])
      .then(async (responses) => {
        if (responses.some((response) => response.status === 401)) {
          location.replace(
            `/login?next=${encodeURIComponent(location.pathname)}`,
          );
          return null;
        }
        const results = await Promise.all(
          responses.map((response) => response.json().catch(() => null)),
        );
        const failed = responses.findIndex((response) => !response.ok);
        if (failed >= 0)
          throw new Error(
            results[failed]?.error?.message ||
              "You do not have permission to manage university accounts.",
          );
        return results;
      })
      .then((results) => {
        if (!active || !results) return;
        const [userResult, roleResult, identityResult] = results;
        const values = userResult.data || [];
        setUsers(values);
        setRoles(roleResult.data || []);
        setSelected(
          Object.fromEntries(values.map((user) => [user.id, user.roles || []])),
        );
        const canGrantSuper = identityResult.data?.roles?.includes(
          "Super Administrator",
        );
        if (!canGrantSuper) setRoles(roleResult.data || []);
        setLoading(false);
      })
      .catch((reason) => {
        if (active) {
          setError(reason.message || "Account management could not be loaded.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const visible = users.filter((user) =>
    `${user.full_name} ${user.email} ${user.university_id || ""} ${(selected[user.id] || []).join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  function toggle(userId, role) {
    setSelected((current) => {
      const userRoles = current[userId] || [];
      return {
        ...current,
        [userId]: userRoles.includes(role)
          ? userRoles.filter((item) => item !== role)
          : [...userRoles, role],
      };
    });
    setNotice("");
  }
  async function save(user) {
    setSaving(user.id);
    setNotice("");
    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(user.id)}/roles`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roles: selected[user.id] || [] }),
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          result?.error?.message || "Role changes could not be saved.",
        );
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, roles: result.data.roles } : item,
        ),
      );
      setNotice(`Access roles updated for ${user.full_name}.`);
    } catch (reason) {
      setError(reason.message || "Role changes could not be saved.");
    } finally {
      setSaving("");
    }
  }
  return (
    <main className="admin-users">
      <header className="admin-users-top">
        <a href="/dashboard">
          <ArrowLeft size={15} />
          Dashboard
        </a>
        <span>EduCore Administration</span>
      </header>
      <div className="admin-users-content">
        <div className="admin-users-heading">
          <span className="admin-users-icon">
            <Shield size={21} />
          </span>
          <div>
            <small>IDENTITY &amp; ACCESS</small>
            <h1>University accounts</h1>
            <p>
              Review account details and assign institutional roles. Role
              changes are permission-checked and audited.
            </p>
          </div>
        </div>
        {error ? (
          <section className="admin-users-state" role="alert">
            <b>Account management unavailable</b>
            <p>{error}</p>
            <a href="/dashboard">Return to dashboard</a>
          </section>
        ) : loading ? (
          <div className="admin-users-state" aria-live="polite">
            <LoaderCircle size={19} className="admin-users-spin" />
            Loading university accounts…
          </div>
        ) : (
          <>
            <section className="admin-users-summary">
              <span>
                <Users size={17} />
                {users.length} accounts in the current view
              </span>
              <span>
                <Shield size={17} />
                {roles.length} assignable roles
              </span>
            </section>
            <label className="admin-users-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, ID, or assigned role"
              />
            </label>
            {notice && (
              <p className="admin-users-notice" role="status">
                <Check size={15} />
                {notice}
              </p>
            )}
            <section className="admin-user-list">
              {visible.map((user) => (
                <article className="admin-user-card" key={user.id}>
                  <header>
                    <div className="admin-user-avatar">
                      {user.full_name
                        .split(/\s+/)
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="admin-user-identity">
                      <b>{user.full_name}</b>
                      <span>
                        {user.email} · {user.university_id || user.persona}
                      </span>
                    </div>
                    <span
                      className={`admin-account-status${user.disabled ? " disabled" : ""}`}
                    >
                      {user.disabled ? "Disabled" : "Active"}
                    </span>
                  </header>
                  <div className="admin-user-meta">
                    <span>
                      Account type <b>{user.persona}</b>
                    </span>
                    <span>
                      Faculty / college <b>{user.college || "Not provided"}</b>
                    </span>
                    <span>
                      Joined{" "}
                      <b>{new Date(user.created_at).toLocaleDateString()}</b>
                    </span>
                  </div>
                  <div className="admin-role-heading">
                    <b>Institutional roles</b>
                    <small>Select the roles this account needs.</small>
                  </div>
                  <div className="admin-role-grid">
                    {roles.map((role) => (
                      <label
                        key={role}
                        className={
                          (selected[user.id] || []).includes(role)
                            ? "checked"
                            : ""
                        }
                      >
                        <input
                          type="checkbox"
                          checked={(selected[user.id] || []).includes(role)}
                          onChange={() => toggle(user.id, role)}
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                  <footer>
                    <small>
                      {(selected[user.id] || []).length} roles selected
                    </small>
                    <button
                      disabled={
                        saving === user.id ||
                        JSON.stringify(selected[user.id] || []) ===
                          JSON.stringify(user.roles || [])
                      }
                      onClick={() => save(user)}
                    >
                      {saving === user.id ? (
                        <>
                          <LoaderCircle
                            size={14}
                            className="admin-users-spin"
                          />
                          Saving
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          Save role changes
                        </>
                      )}
                    </button>
                  </footer>
                </article>
              ))}
              {visible.length === 0 && (
                <div className="admin-users-state">
                  No accounts match this search.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
