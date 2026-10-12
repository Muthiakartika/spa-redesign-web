/**
 * A treatment page body written as data: the element tree of the former
 * src/content/treatments/<slug>.tsx (see tools/treatments/tsx-to-json.mjs).
 * The public page renders it (components/treatments/TreatmentBody.tsx) and
 * /admin/ edits it. Shared by server and browser code, so no imports.
 */

/** JSX passed as a prop, e.g. topContent={<SessionOptions … />}. */
export type JsxValue = { $jsx: TreeNode };

export type TreeValue =
  | string
  | number
  | boolean
  | null
  | TreeValue[]
  | JsxValue
  | { [key: string]: TreeValue };

/** An element: a lowercase HTML tag, "Fragment", or a section component's name. */
export type TreeNode = {
  type: string;
  props?: Record<string, TreeValue>;
  children?: (TreeNode | string)[];
};

/** What /admin/ can change on a treatment page besides its body. */
export type TreatmentSeo = { title: string; description: string };

export const isJsx = (value: unknown): value is JsxValue =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value) && "$jsx" in (value as object);

export const isNode = (value: unknown): value is TreeNode =>
  Boolean(value) &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  typeof (value as TreeNode).type === "string" &&
  !("$jsx" in (value as object));

/** Deep equality that ignores the order of object keys. */
export function sameContent(a: unknown, b: unknown): boolean {
  const canon = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(canon)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, canon((v as Record<string, unknown>)[k])])
          )
        : v;
  return JSON.stringify(canon(a)) === JSON.stringify(canon(b));
}
