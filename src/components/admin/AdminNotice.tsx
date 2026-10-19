import type { BlogSetup } from "@/lib/blog/setup";

/** The "backend not set up yet" banner shown on the admin pages, naming what is missing. */
export default function AdminNotice({ setup }: { setup: BlogSetup }) {
  if (setup.database && setup.storage) return null;
  return (
    <div className="adm-notice" role="status">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.5v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.3" r="1.05" fill="currentColor" />
      </svg>
      <span>
        {!setup.database && (
          <>
            The blog database is not connected yet. Add <code>DATABASE_URL</code> (Neon) to <code>.env.local</code>,
            then run <code>npm run blog:setup</code>. Until then the public blog shows the nine built-in articles.{" "}
          </>
        )}
        {!setup.storage && (
          <>
            Image uploads need the <code>R2_*</code> settings (Cloudflare R2) in <code>.env.local</code>.
          </>
        )}
      </span>
    </div>
  );
}
