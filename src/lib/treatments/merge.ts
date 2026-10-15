import { SECTIONS, type Field } from "./fields";
import { isJsx, isNode, linkedTextParts, type TreeNode, type TreeValue } from "./tree";

/**
 * Put edited content into a page's built-in tree. Only the fields listed in
 * fields.ts are taken from the edited copy; the element structure and every
 * layout prop come from the built-in tree. So a save can never add elements,
 * HTML or unknown props, and a later code change to a page's layout (a class,
 * a decoration) still reaches pages that were edited before it.
 *
 * `check` (on save): every value is validated and cleaned, and problems are
 * collected in `errors`. Without it (when the page is shown) the saved values
 * are taken as stored.
 */

const MAX_TEXT = 4000;
const MAX_ITEMS = 60;

export class TreeMismatch extends Error {}

type Options = { check: boolean; errors: string[]; imageBases: string[] };

/** One of the site's own photos in /public/images, not an uploaded one. */
const isSitePhoto = (value: unknown): boolean =>
  typeof value === "string" && /^\/images\/[A-Za-z0-9/_.-]+$/.test(value.trim()) && !value.includes("..");

/** A site photo (/images/…) or one uploaded to the image storage. */
function isAllowedImage(value: string, imageBases: string[]) {
  if (isSitePhoto(value)) return true;
  return imageBases.some((base) => value.startsWith(`${base}/`) && /^[A-Za-z0-9/_.:-]+$/.test(value));
}

const isAllowedLink = (value: string) => /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value) && !/\s/.test(value);

/**
 * One field's value, cleaned. `undefined` means "not set": the prop is left
 * out and the component shows its own default (the field's placeholder). The
 * editor only sends a value the owner has touched, or the built-in one.
 */
function clean(field: Field, value: unknown, where: string, o: Options, inItem = false): TreeValue | undefined {
  const fail = (message: string) => {
    o.errors.push(`${where}: ${message}`);
    return undefined;
  };
  switch (field.kind) {
    case "text":
    case "textarea":
    case "link":
    case "image": {
      if (value === undefined || value === null) return inItem ? "" : undefined;
      if (field.links && typeof value !== "string") return cleanLinkedText(field, value, fail);
      if (typeof value !== "string") return fail(`${field.label} must be text.`);
      const text = value.trim();
      if (!text) {
        // Inside a package or question an empty value stays empty. Elsewhere a
        // photo cannot be left empty; a field with a usual text ("Book Now")
        // or an empty link falls back to the component's own; other text
        // stays empty (the line disappears).
        if (inItem) return "";
        if (field.kind === "image") return fail(`${field.label}: choose a photo.`);
        return field.kind === "link" || field.placeholder ? undefined : "";
      }
      if (text.length > MAX_TEXT) return fail(`${field.label} is too long (at most ${MAX_TEXT} characters).`);
      if (field.kind === "link" && !isAllowedLink(text)) {
        return fail(`${field.label} must start with /, https://, mailto: or tel:.`);
      }
      if (field.kind === "image" && !isAllowedImage(text, o.imageBases)) return fail(`${field.label} is not a usable photo.`);
      return text;
    }
    case "list":
    case "images": {
      if (value === undefined || value === null) return [];
      if (!Array.isArray(value)) return fail(`${field.label} must be a list.`);
      if (value.length > MAX_ITEMS) return fail(`${field.label} has too many entries.`);
      const out: string[] = [];
      for (const entry of value) {
        if (typeof entry !== "string") return fail(`${field.label} must contain text only.`);
        const text = entry.trim();
        if (!text) continue;
        if (text.length > MAX_TEXT) return fail(`${field.label} has an entry that is too long.`);
        if (field.kind === "images" && !isAllowedImage(text, o.imageBases)) return fail(`${field.label} has a photo that is not usable.`);
        out.push(text);
      }
      return out;
    }
    case "items": {
      if (value === undefined || value === null) return [];
      if (!Array.isArray(value)) return fail(`${field.label} must be a list.`);
      if (value.length > MAX_ITEMS) return fail(`${field.label} has too many entries.`);
      const out: Record<string, TreeValue>[] = [];
      value.forEach((item, i) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          fail(`${field.itemLabel ?? "Item"} ${i + 1} is not valid.`);
          return;
        }
        const source = item as Record<string, unknown>;
        const cleaned: Record<string, TreeValue> = {};
        for (const sub of field.fields ?? []) {
          const v = clean(sub, source[sub.key], `${where} › ${field.itemLabel ?? "Item"} ${i + 1}`, o, true);
          // An empty optional value (a package without "/ Hr") stays out, as in the built-in data.
          if (sub.optional && (v === "" || (Array.isArray(v) && v.length === 0))) continue;
          if (v !== undefined) cleaned[sub.key] = v;
        }
        const empty = Object.values(cleaned).every((v) => v === "" || (Array.isArray(v) && v.length === 0));
        if (!empty || field.fixedCount) out.push(cleaned);
      });
      return out;
    }
  }
}

/** A paragraph with links: only text and links to allowed addresses, rebuilt clean. */
function cleanLinkedText(field: Field, value: unknown, fail: (message: string) => undefined): TreeValue | undefined {
  const parts = linkedTextParts(value);
  if (!parts) return fail(`${field.label} must be text.`);
  const children: (TreeNode | string)[] = [];
  for (const part of parts) {
    if (typeof part === "string") {
      if (part.length > MAX_TEXT) return fail(`${field.label} is too long.`);
      children.push(part);
      continue;
    }
    const href = part.props.href.trim();
    const words = part.children[0].trim();
    if (!words) return fail(`${field.label} has a link without words.`);
    if (!isAllowedLink(href)) return fail(`${field.label}: the link “${words}” must start with / or https://.`);
    children.push({ type: "Link", props: { prefetch: false, href }, children: [words] });
  }
  return { $jsx: { type: "Fragment", children } };
}

function mergeNode(seed: TreeNode, edited: unknown, where: string, o: Options): TreeNode {
  if (!isNode(edited) || edited.type !== seed.type) throw new TreeMismatch(`${where}: expected ${seed.type}`);
  const schema = SECTIONS[seed.type];
  const props: Record<string, TreeValue> = { ...(seed.props ?? {}) };
  const editedProps = (edited.props ?? {}) as Record<string, unknown>;

  if (schema) {
    const label = `${schema.label}`;
    for (const field of schema.fields) {
      if (field.hideIf?.(props)) continue;
      // The editor only changes a photo by uploading one, so a site photo
      // (/images/…) in an edited page is the built-in one it had when it was
      // saved. The current built-in photo is used instead, so a new photo in
      // the code (the owner's banners of 15 Oct) also reaches edited pages.
      if (field.kind === "image" && isSitePhoto(editedProps[field.key]) && typeof props[field.key] === "string") continue;
      const value = o.check ? clean(field, editedProps[field.key], label, o) : (editedProps[field.key] as TreeValue | undefined);
      if (value === undefined) delete props[field.key];
      else props[field.key] = value;
    }
    if (o.check && schema.fields.some((f) => f.fixedCount)) {
      for (const field of schema.fields.filter((f) => f.fixedCount)) {
        const before = seed.props?.[field.key];
        const after = props[field.key];
        if (Array.isArray(before) && Array.isArray(after) && before.length !== after.length) {
          o.errors.push(`${label}: ${field.label} must stay ${before.length}.`);
        }
      }
    }
  }

  // JSX inside props (the session prices above the packages) is merged the same way.
  for (const [key, value] of Object.entries(seed.props ?? {})) {
    if (!isJsx(value)) continue;
    const inner = editedProps[key];
    props[key] = { $jsx: mergeNode(value.$jsx, isJsx(inner) ? inner.$jsx : undefined, `${where} › ${key}`, o) };
  }

  const seedChildren = seed.children ?? [];
  const editedChildren = Array.isArray(edited.children) ? edited.children : [];
  if (seedChildren.length !== editedChildren.length) throw new TreeMismatch(`${where}: children differ`);
  const children = seedChildren.map((child, i) =>
    typeof child === "string" ? child : mergeNode(child, editedChildren[i], `${where} › ${i}`, o)
  );

  return {
    type: seed.type,
    ...(Object.keys(props).length ? { props } : {}),
    ...(children.length ? { children } : {}),
  };
}

/**
 * On save: the edited tree checked against the built-in one. Returns the tree
 * to store, or the problems found (TreeMismatch when the structure differs).
 */
export function checkEditedTree(
  seed: TreeNode,
  edited: unknown,
  imageBases: string[]
): { tree: TreeNode } | { errors: string[] } {
  const o: Options = { check: true, errors: [], imageBases };
  try {
    const tree = mergeNode(seed, edited, "page", o);
    return o.errors.length ? { errors: o.errors } : { tree };
  } catch (e) {
    if (e instanceof TreeMismatch) return { errors: ["The page structure does not match. Reload the editor and try again."] };
    throw e;
  }
}

/**
 * When the page is shown: the saved content on the current built-in layout.
 * If the layout has changed shape since the save, the saved tree is used as
 * it is (it was checked when it was saved).
 */
export function applySavedTree(seed: TreeNode, saved: TreeNode): TreeNode {
  try {
    return mergeNode(seed, saved, "page", { check: false, errors: [], imageBases: [] });
  } catch (e) {
    if (e instanceof TreeMismatch) {
      console.warn(`treatment page: saved content no longer matches the layout (${e.message}); using it as saved`);
      return saved;
    }
    throw e;
  }
}
