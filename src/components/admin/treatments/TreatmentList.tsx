"use client";

/* eslint-disable @next/next/no-img-element -- small previews of the site's own card photos */
import Link from "next/link";
import { useState } from "react";
import type { BlogSetup } from "@/lib/blog/setup";
import AdminNotice from "../AdminNotice";
import AdminShell from "../AdminShell";

export type TreatmentListItem = { slug: string; name: string; image: string; editedAt: string | null };

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/** /admin/treatments/: every treatment page, with which ones were edited here. */
export default function TreatmentList({
  items,
  setup,
  loadError,
}: {
  items: TreatmentListItem[];
  setup: BlogSetup;
  loadError?: string;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = items.filter((t) => !q || t.name.toLowerCase().includes(q) || t.slug.includes(q));
  const edited = items.filter((t) => t.editedAt).length;

  return (
    <AdminShell active="treatments">
      <div className="adm-dash-head">
        <div>
          <h1>Treatment Pages</h1>
          <p>Change the words, prices, packages, questions and photos of each treatment page.</p>
        </div>
        <div className="adm-stats">
          <div className="adm-stat">
            <span className="adm-num">{items.length}</span>
            <span className="adm-cap">Pages</span>
          </div>
          <div className="adm-stat">
            <span className="adm-num adm-num-draft">{edited}</span>
            <span className="adm-cap">Edited</span>
          </div>
        </div>
      </div>

      <AdminNotice setup={setup} />
      {loadError && (
        <div className="adm-err" role="alert">
          <span>{loadError}</span>
        </div>
      )}

      <div className="rd-list-head">
        <h2>All pages</h2>
        <input
          type="search"
          className="pe-input rd-search"
          placeholder="Search treatments…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search treatments"
        />
      </div>

      <div className="tl-grid">
        {shown.map((t) => (
          <Link key={t.slug} href={`/admin/treatments/${t.slug}/`} className="tl-card">
            <img src={t.image} alt="" loading="lazy" />
            <span className="tl-body">
              <strong>{t.name}</strong>
              <span className="adm-slug">/seminyak/{t.slug}/</span>
              {t.editedAt ? (
                <span className="adm-badge adm-badge-draft">
                  <span className="adm-dot" aria-hidden="true" />
                  Edited {fmt(t.editedAt)}
                </span>
              ) : (
                <span className="adm-badge adm-badge-published">
                  <span className="adm-dot" aria-hidden="true" />
                  Original
                </span>
              )}
            </span>
            <span className="tl-edit" aria-hidden="true">
              Edit →
            </span>
          </Link>
        ))}
        {shown.length === 0 && <p className="adm-muted">No treatment matches “{query}”.</p>}
      </div>
    </AdminShell>
  );
}
