"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { OldUrlRedirect } from "@/data/redirects";
import type { BlogSetup } from "@/lib/blog/setup";
import type { PublishResult } from "@/lib/redirects/publish";
import {
  internalPath,
  normalizeDestination,
  normalizeSource,
  type RedirectRow,
  type RedirectStatus,
} from "@/lib/redirects/rules";
import AdminNotice from "./AdminNotice";
import AdminShell from "./AdminShell";

type Form = { source: string; destination: string; statusCode: RedirectStatus };
const EMPTY: Form = { source: "", destination: "", statusCode: 301 };

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const Arrow = () => (
  <svg className="rd-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h13m0 0-4.5-4.5M18 12l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Hints under the two address fields: what will match, and anything worth a second look. */
function useHints(form: Form, pages: string[], rows: RedirectRow[], exceptId?: string) {
  return useMemo(() => {
    const src = form.source.trim() ? normalizeSource(form.source) : null;
    const dst = form.destination.trim() ? normalizeDestination(form.destination) : null;
    const notes: { tone: "warn" | "info"; text: string }[] = [];
    if (src && "value" in src && pages.includes(src.value)) {
      notes.push({ tone: "warn", text: `${src.value} is a live page. After this redirect, visitors and Google can no longer open it.` });
    }
    if (dst && "value" in dst) {
      const path = internalPath(dst.value);
      const redirected = path && rows.some((r) => r.id !== exceptId && r.source === path);
      if (path && !redirected && !pages.includes(path)) {
        notes.push({ tone: "warn", text: `There is no page at ${path} on the website: visitors would land on “Page not found”.` });
      }
      if (!path) notes.push({ tone: "info", text: "This sends visitors to another website." });
    }
    return {
      sourceError: src && "error" in src ? src.error : "",
      destinationError: dst && "error" in dst ? dst.error : "",
      sourceValue: src && "value" in src ? src.value : "",
      destinationValue: dst && "value" in dst ? dst.value : "",
      notes,
    };
  }, [form, pages, rows, exceptId]);
}

/**
 * /admin/redirects/: the owner's redirects (add, edit, delete; each change is
 * live on the website within about half a minute) and, read-only, the
 * built-in ones carried over from the old website.
 */
export default function RedirectManager({
  initialRows,
  builtIn,
  pages,
  published,
  setup,
  loadError,
}: {
  initialRows: RedirectRow[];
  builtIn: OldUrlRedirect[];
  pages: string[];
  /** Whether the website answers with the saved list (checked when the page opened). */
  published: PublishResult;
  setup: BlogSetup;
  loadError?: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(loadError ?? "");
  const [notice, setNotice] = useState("");
  const [confirmRow, setConfirmRow] = useState<RedirectRow | null>(null);
  const [query, setQuery] = useState("");
  // The website could not be updated after a save (or when the page opened).
  const [liveError, setLiveError] = useState(published.ok ? "" : published.error || "unknown error");

  const hints = useHints(form, pages, rows);
  const editHints = useHints(editForm, pages, rows, editingId ?? undefined);

  const q = query.trim().toLowerCase();
  const match = (...values: string[]) => !q || values.some((v) => v.toLowerCase().includes(q));
  const shownRows = rows.filter((r) => match(r.source, r.destination));
  const shownBuiltIn = builtIn.filter((r) => match(r.from, r.to));

  // Escape closes the delete dialog, unless the delete is already running.
  useEffect(() => {
    if (!confirmRow) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setConfirmRow(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmRow, busy]);

  const flattenedNote = (n: number, to: string) =>
    n ? ` ${n} older redirect${n > 1 ? "s" : ""} that pointed here now go${n > 1 ? "" : "es"} straight to ${to}.` : "";

  /** After a save: say when it works, or why the website could not be updated. */
  const afterSave = (live: PublishResult | undefined, message: string) => {
    if (live && !live.ok) {
      setLiveError(live.error || "unknown error");
      setNotice(`${message} It is saved, but the website could not be updated yet (see above).`);
    } else {
      setLiveError("");
      setNotice(`${message} It works on the website within about half a minute.`);
    }
  };

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (hints.sourceError || hints.destinationError) return;
    setBusy("new");
    setError("");
    setNotice("");
    const res = await fetch("/api/admin/redirects/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError(data.error || `Failed to save (${res.status})`);
      return;
    }
    const row = data.row as RedirectRow;
    setRows((prev) => {
      const next = prev.map((r) => (data.flattened && r.destination === row.source ? { ...r, destination: row.destination } : r));
      return [row, ...next];
    });
    setForm(EMPTY);
    afterSave(data.live, `Saved: ${row.source} → ${row.destination}.${flattenedNote(data.flattened, row.destination)}`);
  };

  const startEdit = (r: RedirectRow) => {
    setEditingId(r.id);
    setEditForm({ source: r.source, destination: r.destination, statusCode: r.status_code });
    setError("");
  };

  const saveEdit = async (r: RedirectRow) => {
    if (editHints.sourceError || editHints.destinationError) return;
    setBusy(r.id);
    setError("");
    setNotice("");
    const res = await fetch(`/api/admin/redirects/${r.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError(data.error || `Failed to save (${res.status})`);
      return;
    }
    const row = data.row as RedirectRow;
    setRows((prev) =>
      prev.map((x) =>
        x.id === row.id ? row : data.flattened && x.destination === row.source ? { ...x, destination: row.destination } : x
      )
    );
    setEditingId(null);
    afterSave(data.live, `Saved: ${row.source} → ${row.destination}.${flattenedNote(data.flattened, row.destination)}`);
  };

  const remove = async (r: RedirectRow) => {
    setBusy(r.id);
    setError("");
    setNotice("");
    const res = await fetch(`/api/admin/redirects/${r.id}/`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    setConfirmRow(null);
    if (res.ok) {
      setRows((prev) => prev.filter((x) => x.id !== r.id));
      afterSave(data.live, `Deleted the redirect from ${r.source}.`);
    } else {
      setError(`Failed to delete: ${data.error || res.status}`);
    }
  };

  const blocked = !setup.database;

  return (
    <AdminShell active="redirects">
      <div className="adm-dash-head">
        <div>
          <h1>Redirects</h1>
          <p>Send visitors and Google from an old address to a new one.</p>
        </div>
        <div className="adm-stats">
          <div className="adm-stat">
            <span className="adm-num">{rows.length}</span>
            <span className="adm-cap">Yours</span>
          </div>
          <div className="adm-stat">
            <span className="adm-num">{builtIn.length}</span>
            <span className="adm-cap">Built-in</span>
          </div>
        </div>
      </div>

      <AdminNotice setup={{ ...setup, storage: true }} />

      {error && (
        <div className="adm-err" role="alert">
          <span>{error}</span>
          <button type="button" className="adm-err-close" onClick={() => setError("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      {notice && (
        <div className="rd-ok" role="status">
          <span>{notice}</span>
          <button type="button" className="adm-err-close" onClick={() => setNotice("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {liveError && (
        <div className="adm-err" role="alert">
          <span>
            The saved redirects could not be sent to the website: {liveError}. They are kept, and the website is
            updated again on the next save or when this page is opened.
          </span>
        </div>
      )}

      <form className="rd-card rd-add" onSubmit={add}>
        <h2>Add a redirect</h2>
        <div className="rd-fields">
          <div className="rd-field">
            <label htmlFor="rd-source">Old address</label>
            <input
              id="rd-source"
              className="pe-input"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="/old-page/"
              autoComplete="off"
              spellCheck={false}
            />
            {hints.sourceError ? (
              <p className="rd-hint rd-hint-error">{hints.sourceError}</p>
            ) : hints.sourceValue ? (
              <p className="rd-hint">spabalimoon.com{hints.sourceValue}</p>
            ) : (
              <p className="rd-hint">The address that should stop showing, e.g. /old-page/</p>
            )}
          </div>
          <Arrow />
          <div className="rd-field">
            <label htmlFor="rd-destination">New address</label>
            <input
              id="rd-destination"
              className="pe-input"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              placeholder="/seminyak/balinese-massage/"
              autoComplete="off"
              spellCheck={false}
            />
            {hints.destinationError ? (
              <p className="rd-hint rd-hint-error">{hints.destinationError}</p>
            ) : hints.destinationValue ? (
              <p className="rd-hint">
                {hints.destinationValue.startsWith("/") ? `spabalimoon.com${hints.destinationValue}` : hints.destinationValue}
              </p>
            ) : (
              <p className="rd-hint">A page on this site, or a full https:// address</p>
            )}
          </div>
          <div className="rd-field rd-field-type">
            <label htmlFor="rd-status">Type</label>
            <select
              id="rd-status"
              className="pe-input"
              value={form.statusCode}
              onChange={(e) => setForm({ ...form, statusCode: e.target.value === "302" ? 302 : 301 })}
            >
              <option value="301">Permanent (301)</option>
              <option value="302">Temporary (302)</option>
            </select>
            <p className="rd-hint">{form.statusCode === 301 ? "Google moves the page’s ranking over" : "For a short while only"}</p>
          </div>
          <button
            type="submit"
            className="adm-btn adm-btn-primary rd-submit"
            disabled={blocked || busy === "new" || !hints.sourceValue || !hints.destinationValue}
          >
            {busy === "new" ? "Saving…" : "Add redirect"}
          </button>
        </div>
        {hints.notes.map((n) => (
          <p key={n.text} className={`rd-note rd-note-${n.tone}`}>
            {n.text}
          </p>
        ))}
      </form>

      <div className="rd-list-head">
        <h2>Your redirects</h2>
        <input
          type="search"
          className="pe-input rd-search"
          placeholder="Search addresses…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search redirects"
        />
      </div>

      {rows.length === 0 ? (
        <div className="adm-empty rd-empty">
          <h2>No redirects yet</h2>
          <p>Add one above when a page moves or an old address should lead somewhere new.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table rd-table">
            <thead>
              <tr>
                <th>Old address</th>
                <th aria-label="to" />
                <th>New address</th>
                <th>Type</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {shownRows.map((r) =>
                editingId === r.id ? (
                  <tr key={r.id} className="rd-editing">
                    <td colSpan={6}>
                      <div className="rd-fields">
                        <div className="rd-field">
                          <label htmlFor={`rd-s-${r.id}`}>Old address</label>
                          <input
                            id={`rd-s-${r.id}`}
                            className="pe-input"
                            value={editForm.source}
                            onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                            spellCheck={false}
                          />
                          {editHints.sourceError && <p className="rd-hint rd-hint-error">{editHints.sourceError}</p>}
                        </div>
                        <Arrow />
                        <div className="rd-field">
                          <label htmlFor={`rd-d-${r.id}`}>New address</label>
                          <input
                            id={`rd-d-${r.id}`}
                            className="pe-input"
                            value={editForm.destination}
                            onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                            spellCheck={false}
                          />
                          {editHints.destinationError && <p className="rd-hint rd-hint-error">{editHints.destinationError}</p>}
                        </div>
                        <div className="rd-field rd-field-type">
                          <label htmlFor={`rd-t-${r.id}`}>Type</label>
                          <select
                            id={`rd-t-${r.id}`}
                            className="pe-input"
                            value={editForm.statusCode}
                            onChange={(e) => setEditForm({ ...editForm, statusCode: e.target.value === "302" ? 302 : 301 })}
                          >
                            <option value="301">Permanent (301)</option>
                            <option value="302">Temporary (302)</option>
                          </select>
                        </div>
                        <div className="rd-edit-actions">
                          <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="adm-btn adm-btn-primary"
                            onClick={() => saveEdit(r)}
                            disabled={busy === r.id || !editHints.sourceValue || !editHints.destinationValue}
                          >
                            {busy === r.id ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </div>
                      {editHints.notes.map((n) => (
                        <p key={n.text} className={`rd-note rd-note-${n.tone}`}>
                          {n.text}
                        </p>
                      ))}
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id} className={busy === r.id ? "is-busy" : ""}>
                    <td data-label="Old">
                      <code className="rd-path">{r.source}</code>
                      <div className="adm-slug">Added {fmt(r.created_at)}</div>
                    </td>
                    <td className="rd-arrow-cell" aria-hidden="true">
                      <Arrow />
                    </td>
                    <td data-label="New">
                      <code className="rd-path">{r.destination}</code>
                    </td>
                    <td data-label="Type">
                      <span className="adm-cat">{r.status_code === 301 ? "301 Permanent" : "302 Temporary"}</span>
                    </td>
                    <td data-label="Status">
                      {liveError ? (
                        <span className="adm-badge adm-badge-draft" title="Saved, but not sent to the website yet.">
                          <span className="adm-dot" aria-hidden="true" />
                          Saved
                        </span>
                      ) : (
                        <span className="adm-badge adm-badge-published" title="Working on the website.">
                          <span className="adm-dot" aria-hidden="true" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="adm-row-actions">
                      <div className="adm-actions">
                        <a
                          className="adm-act"
                          href={r.source}
                          target="_blank"
                          rel="noreferrer"
                          title="Open the old address in a new tab"
                        >
                          Test
                        </a>
                        <button type="button" className="adm-act" onClick={() => startEdit(r)} disabled={Boolean(busy)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="adm-act adm-act-danger"
                          onClick={() => setConfirmRow(r)}
                          disabled={Boolean(busy)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
              {shownRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="adm-muted">
                    No redirect matches “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <details className="rd-card rd-builtin">
        <summary>
          <span>
            <strong>Built-in redirects</strong> ({builtIn.length}) — old addresses from the previous website
          </span>
          <span className="rd-builtin-note">Read-only</span>
        </summary>
        <p className="rd-hint">
          These are part of the website’s code and are also answered by Cloudflare, so a developer changes them. They
          keep old links and Google results working.
        </p>
        <div className="rd-builtin-list">
          {shownBuiltIn.map((r) => (
            <div key={r.from} className="rd-builtin-row">
              <code>{r.from}</code>
              <Arrow />
              <code>{r.to}</code>
            </div>
          ))}
          {shownBuiltIn.length === 0 && <p className="adm-muted">No built-in redirect matches “{query}”.</p>}
        </div>
      </details>

      {confirmRow && (
        <div className="adm-overlay" role="dialog" aria-modal="true" aria-labelledby="rd-del-title">
          <div className="adm-modal">
            <h2 id="rd-del-title">Delete this redirect?</h2>
            <p>
              {confirmRow.source} will no longer lead to {confirmRow.destination} (after the next publish).
            </p>
            <div className="adm-modal-actions">
              <button
                type="button"
                className="adm-btn adm-btn-ghost"
                onClick={() => setConfirmRow(null)}
                disabled={Boolean(busy)}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-danger"
                onClick={() => remove(confirmRow)}
                disabled={Boolean(busy)}
              >
                {busy ? "Deleting…" : "Delete redirect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
