import type { Metadata } from "next";
import "@/styles/admin.css";

export const metadata: Metadata = {
  title: { absolute: "Content Studio" },
  robots: { index: false, follow: false },
};

/**
 * The admin (/admin/: articles, treatment pages, redirects): outside
 * (site), so no header or footer, and outside every `.lh` subtree, so the
 * live theme CSS stays away from it.
 * data-lenis-prevent keeps smooth scrolling off the editor's text fields.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-root" data-lenis-prevent="">
      {children}
    </div>
  );
}
