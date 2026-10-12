"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BlogSetup } from "@/lib/blog/setup";
import type { TreatmentContent } from "@/lib/treatments/content";
import { SECTIONS, type Field, type SectionSchema } from "@/lib/treatments/fields";
import { isJsx, sameContent, type TreatmentSeo, type TreeNode, type TreeValue } from "@/lib/treatments/tree";
import AdminNotice from "../AdminNotice";
import { phoneCut, webReady } from "../photo";
import { uploadPhoto } from "../upload";
import FieldEditor, { type PhotoUploader } from "./FieldEditor";

type Path = (string | number)[];
type Section = { id: string; path: Path; node: TreeNode; schema: SectionSchema };

/** Every editable section of the page, in page order. Session prices sit inside the packages, and come first. */
function collectSections(node: TreeNode, path: Path = [], out: Section[] = []): Section[] {
  for (const [key, value] of Object.entries(node.props ?? {})) {
    if (isJsx(value)) collectSections(value.$jsx, [...path, "props", key, "$jsx"], out);
  }
  const schema = SECTIONS[node.type];
  if (schema) out.push({ id: path.join(".") || "root", path, node, schema });
  (node.children ?? []).forEach((child, i) => {
    if (typeof child !== "string") collectSections(child, [...path, "children", i], out);
  });
  return out;
}

function getIn(root: unknown, path: Path): unknown {
  return path.reduce<unknown>((at, key) => (at == null ? undefined : (at as Record<string | number, unknown>)[key]), root);
}

/** A copy of `root` with the value at `path` replaced; `undefined` removes it. */
function setIn<T>(root: T, path: Path, value: unknown): T {
  if (!path.length) return value as T;
  const [key, ...rest] = path;
  const copy = (Array.isArray(root) ? [...root] : { ...(root as object) }) as Record<string | number, unknown>;
  const next = setIn(copy[key] ?? {}, rest, value);
  if (next === undefined && !rest.length) delete copy[key];
  else copy[key] = next;
  return copy as T;
}

const fmt = (d: string) =>
  new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** The words that tell sections apart in the list: its small heading, or its heading. */
function sectionCaption(node: TreeNode) {
  const p = node.props ?? {};
  const pick = [p.subTitle, p.title, p.titleSpan].find((v) => typeof v === "string" && v.trim());
  return typeof pick === "string" ? pick : "";
}

/**
 * /admin/treatments/<slug>/: every text, list, price and photo of one
 * treatment page, section by section, plus its SEO title and description.
 * Saving updates the live page at once; "Restore original" brings back the
 * built-in version.
 */
export default function TreatmentEditor({ content, setup }: { content: TreatmentContent; setup: BlogSetup }) {
  const router = useRouter();
  const [tree, setTree] = useState<TreeNode>(content.tree);
  const [seo, setSeo] = useState<TreatmentSeo>(content.seo);
  const [saved, setSaved] = useState({ tree: content.tree, seo: content.seo });
  const [editedAt, setEditedAt] = useState(content.editedAt);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [confirmRestore, setConfirmRestore] = useState(false);

  const sections = useMemo(() => collectSections(tree), [tree]);
  const dirty = !sameContent(tree, saved.tree) || !sameContent(seo, saved.seo);
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Ask before a reload or a closed tab throws away unsaved changes.
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  const upload: PhotoUploader | null = setup.storage
    ? async (file: File, field: Field) => {
        const photo = await webReady(file, field.maxWidth ?? 1200);
        const { url, path } = await uploadPhoto(photo, { folder: "treatments" });
        if (field.banner) await uploadPhoto(await phoneCut(file, photo), { pairKey: path });
        return url;
      }
    : null;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const jumpTo = (id: string) => {
    setOpen((prev) => new Set(prev).add(id));
    requestAnimationFrame(() =>
      document.getElementById(`te-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const leave = () => {
    if (dirty && !window.confirm("You have unsaved changes. Leave this page?")) return;
    dirtyRef.current = false;
    router.push("/admin/treatments/");
  };

  const save = async () => {
    setSaving(true);
    setErrors([]);
    setNotice("");
    try {
      const res = await fetch(`/api/admin/treatments/${content.slug}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tree, seo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors ?? [data.error || `Failed to save (${res.status})`]);
        return;
      }
      setSaved({ tree, seo });
      setEditedAt(data.editedAt);
      setNotice(
        data.editedAt
          ? "Saved. The page on the website now shows these changes."
          : "Saved. Everything matches the original again, so the page is back to its built-in version."
      );
      router.refresh();
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "Failed to save"]);
    } finally {
      setSaving(false);
    }
  };

  const restore = async () => {
    setSaving(true);
    setErrors([]);
    setNotice("");
    try {
      const res = await fetch(`/api/admin/treatments/${content.slug}/`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors([data.error || `Failed to restore (${res.status})`]);
        return;
      }
      setTree(content.original.tree);
      setSeo(content.original.seo);
      setSaved({ tree: content.original.tree, seo: content.original.seo });
      setEditedAt(null);
      setNotice("Restored. The page shows its original content again.");
      router.refresh();
    } finally {
      setSaving(false);
      setConfirmRestore(false);
    }
  };

  const pagePath = `/seminyak/${content.slug}/`;
  const titleLen = seo.title.length;
  const descLen = seo.description.length;

  return (
    <div className="pe te">
      <div className="pe-head">
        <div>
          <button type="button" className="te-back" onClick={leave}>
            ← Treatments
          </button>
          <h1>{content.name}</h1>
        </div>
        <div className="pe-actions">
          {dirty && <span className="te-unsaved">Unsaved changes</span>}
          <a className="pe-btn pe-btn-ghost" href={pagePath} target="_blank" rel="noreferrer">
            View page ↗
          </a>
          <button
            type="button"
            className="pe-btn pe-btn-primary"
            onClick={save}
            disabled={saving || !dirty || !setup.database}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <AdminNotice setup={setup} />
      {errors.length > 0 && (
        <div className="pe-error" role="alert">
          {errors.length === 1 ? (
            errors[0]
          ) : (
            <>
              Please fix these first:
              <ul>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {notice && (
        <div className="rd-ok" role="status">
          <span>
            {notice}{" "}
            <a href={pagePath} target="_blank" rel="noreferrer">
              Open the page ↗
            </a>
          </span>
          <button type="button" className="adm-err-close" onClick={() => setNotice("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className="pe-grid">
        <div className="pe-main">
          <div className="te-toolbar">
            <span>
              {sections.length} sections, top to bottom as on the page. Click one to edit it.
            </span>
            <button
              type="button"
              className="te-link"
              onClick={() => setOpen(open.size ? new Set() : new Set(sections.map((s) => s.id)))}
            >
              {open.size ? "Collapse all" : "Expand all"}
            </button>
          </div>

          {sections.map((section, index) => {
            const isOpen = open.has(section.id);
            const originalNode = getIn(content.original.tree, section.path) as TreeNode | undefined;
            const props = section.node.props ?? {};
            const changed = !sameContent(props, originalNode?.props ?? {});
            const fields = section.schema.fields.filter((f) => !f.hideIf?.(props));
            return (
              <section key={section.id} id={`te-${section.id}`} className={`te-section${isOpen ? " is-open" : ""}`}>
                <button type="button" className="te-section-head" onClick={() => toggle(section.id)} aria-expanded={isOpen}>
                  <span className="te-section-num">{index + 1}</span>
                  <span className="te-section-name">
                    <strong>{section.schema.label}</strong>
                    {sectionCaption(section.node) && <span>{sectionCaption(section.node)}</span>}
                  </span>
                  {changed && <span className="te-section-changed">Edited</span>}
                  <span className="te-chevron" aria-hidden="true">
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div className="te-section-body">
                    {section.schema.note && <p className="te-note">{section.schema.note}</p>}
                    {fields.map((field) => (
                      <FieldEditor
                        key={field.key}
                        field={field}
                        value={props[field.key]}
                        original={originalNode?.props?.[field.key]}
                        hasOriginal
                        upload={upload}
                        onChange={(value: TreeValue | undefined) =>
                          setTree((t) => setIn(t, [...section.path, "props", field.key], value))
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="pe-side">
          <div className="pe-card">
            <span className="pe-label">Status</span>
            {editedAt ? (
              <p className="te-status">
                <span className="adm-badge adm-badge-draft">
                  <span className="adm-dot" aria-hidden="true" />
                  Edited
                </span>
                <span>Saved {fmt(editedAt)}</span>
              </p>
            ) : (
              <p className="te-status">
                <span className="adm-badge adm-badge-published">
                  <span className="adm-dot" aria-hidden="true" />
                  Original
                </span>
                <span>As built for the website</span>
              </p>
            )}
            <p className="pe-hint">Saving updates the page on the website straight away.</p>
            {editedAt && (
              <button
                type="button"
                className="pe-btn pe-btn-ghost pe-btn-sm te-restore-all"
                onClick={() => setConfirmRestore(true)}
                disabled={saving}
              >
                ↺ Restore original page
              </button>
            )}
          </div>

          <div className="pe-card">
            <label className="pe-label" htmlFor="te-seo-title">
              SEO Title
            </label>
            <input
              id="te-seo-title"
              className="pe-input"
              value={seo.title}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
            />
            <p className={`pe-hint${titleLen > 60 ? " te-over" : ""}`}>{titleLen} characters (Google shows about 60)</p>

            <label className="pe-label" htmlFor="te-seo-description">
              SEO Description
            </label>
            <textarea
              id="te-seo-description"
              className="pe-input"
              rows={4}
              value={seo.description}
              onChange={(e) => setSeo({ ...seo, description: e.target.value })}
            />
            <p className={`pe-hint${descLen > 160 ? " te-over" : ""}`}>{descLen} characters (Google shows about 155–160)</p>

            <div className="te-serp" aria-label="Google preview">
              <span className="te-serp-url">spabalimoon.com › seminyak › {content.slug}</span>
              <span className="te-serp-title">{seo.title || content.original.seo.title}</span>
              <span className="te-serp-desc">{seo.description}</span>
            </div>
            {!sameContent(seo, content.original.seo) && (
              <button type="button" className="te-restore te-restore-seo" onClick={() => setSeo(content.original.seo)}>
                ↺ Original SEO texts
              </button>
            )}
          </div>

          <div className="pe-card te-jump">
            <span className="pe-label">Jump to</span>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => jumpTo(s.id)}>
                    {s.schema.label}
                    {sectionCaption(s.node) ? <span> · {sectionCaption(s.node)}</span> : null}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <p className="pe-hint te-side-note">
            The layout, colours and decorations stay as designed; only the words, prices and photos change.{" "}
            <Link href="/admin/treatments/">All treatment pages</Link>
          </p>
        </div>
      </div>

      {confirmRestore && (
        <div className="adm-overlay" role="dialog" aria-modal="true" aria-labelledby="te-restore-title">
          <div className="adm-modal">
            <h2 id="te-restore-title">Restore the original page?</h2>
            <p>
              Every change saved for {content.name}, including the SEO texts, is removed and the page shows its built-in
              content again.
            </p>
            <div className="adm-modal-actions">
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setConfirmRestore(false)} autoFocus>
                Cancel
              </button>
              <button type="button" className="adm-btn adm-btn-danger" onClick={restore} disabled={saving}>
                {saving ? "Restoring…" : "Restore original"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
