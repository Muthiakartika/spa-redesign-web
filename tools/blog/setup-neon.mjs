/**
 * Prepare the blog database on Neon:
 *   1. create the `posts` table and its indexes (db/schema.sql), then
 *   2. load the nine built-in guide articles (src/data/guide/seed-posts.json)
 *      with their original ids and dates.
 *
 *   npm run blog:setup
 *
 * Needs DATABASE_URL in .env.local. Safe to run again: the table is only
 * created when missing, and articles already there (same id or same slug)
 * are left alone, so edits made in /admin/ are never overwritten.
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL (the Neon connection string) in .env.local first.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

// 1. Schema, one statement at a time (the HTTP driver runs one per query).
const statements = read("../../db/schema.sql")
  .replace(/--[^\n]*/g, "")
  .split(/;\s*(?:\n|$)/)
  .map((s) => s.trim())
  .filter(Boolean);
for (const statement of statements) await sql.query(statement);
console.log(`Schema ready (${statements.length} statements).`);

// 2. The nine built-in articles.
const posts = JSON.parse(read("../../src/data/guide/seed-posts.json"));
let added = 0;
for (const p of posts) {
  const rows = await sql`
    INSERT INTO posts (id, slug, title, excerpt, cover_image, content_html, category, tags, author, status,
                       seo_title, seo_description, show_date, published_at, created_at, updated_at)
    VALUES (${p.id}, ${p.slug}, ${p.title}, ${p.excerpt}, ${p.cover_image}, ${p.content_html}, ${p.category},
            ${p.tags}, ${p.author}, ${p.status}, ${p.seo_title}, ${p.seo_description}, ${p.show_date !== false},
            ${p.published_at}, ${p.created_at}, ${p.updated_at})
    ON CONFLICT DO NOTHING
    RETURNING id`;
  added += rows.length;
}
console.log(`Added ${added} article(s); ${posts.length - added} were already there.`);
