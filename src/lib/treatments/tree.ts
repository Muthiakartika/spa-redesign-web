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

/**
 * Paragraphs with links. On the page such a text is a fragment of strings and
 * <Link> elements; in the admin it is written as plain text with
 * [words](/address/) for each link. A text without links stays a string.
 */
type LinkNode = { type: "Link"; props: { prefetch: false; href: string }; children: [string] };

const isLinkNode = (v: unknown): v is LinkNode =>
  isNode(v) &&
  v.type === "Link" &&
  typeof v.props?.href === "string" &&
  Array.isArray(v.children) &&
  v.children.length === 1 &&
  typeof v.children[0] === "string";

/** A fragment made only of text and links, or null. */
export function linkedTextParts(value: unknown): (string | LinkNode)[] | null {
  if (!isJsx(value) || value.$jsx.type !== "Fragment") return null;
  const parts = value.$jsx.children ?? [];
  return parts.every((p) => typeof p === "string" || isLinkNode(p)) ? (parts as (string | LinkNode)[]) : null;
}

/** The admin's way of writing a text: links become [words](/address/). */
export function toMarkup(value: unknown): string {
  if (typeof value === "string") return value;
  const parts = linkedTextParts(value);
  if (!parts) return "";
  return parts.map((p) => (typeof p === "string" ? p : `[${p.children[0]}](${p.props.href})`)).join("");
}

/** Back from the admin's text: a string, or a fragment when it has [words](/address/) links. */
export function fromMarkup(text: string): TreeValue {
  const pattern = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;
  const parts: (string | LinkNode)[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ type: "Link", props: { prefetch: false, href: m[2] }, children: [m[1]] });
    last = m.index + m[0].length;
  }
  if (!parts.length) return text;
  if (last < text.length) parts.push(text.slice(last));
  return { $jsx: { type: "Fragment", children: parts as (TreeNode | string)[] } };
}

/** The questions and answers of a page's FAQ sections, for its FAQPage structured data. */
export function faqItems(tree: TreeNode): { question: string; answer: string }[] {
  const out: { question: string; answer: string }[] = [];
  const walk = (node: TreeNode) => {
    const items = node.type === "FaqSection" ? node.props?.items : null;
    if (Array.isArray(items)) {
      for (const item of items) {
        const { question, answer } = (item ?? {}) as Record<string, unknown>;
        if (typeof question === "string" && typeof answer === "string" && question.trim() && answer.trim()) {
          out.push({ question: question.trim(), answer: answer.trim() });
        }
      }
    }
    for (const child of node.children ?? []) if (typeof child !== "string") walk(child);
  };
  walk(tree);
  return out;
}

/** A copy of the tree with `props` added to every element of the given type. */
export function withProps(tree: TreeNode, type: string, props: Record<string, TreeValue>): TreeNode {
  const visit = (node: TreeNode): TreeNode => ({
    ...node,
    ...(node.type === type ? { props: { ...(node.props ?? {}), ...props } } : {}),
    ...(node.children ? { children: node.children.map((c) => (typeof c === "string" ? c : visit(c))) } : {}),
  });
  return visit(tree);
}

/** Whether an element, or anything inside it, is of one of the given types. */
function contains(node: TreeNode, types: string[]): boolean {
  return types.includes(node.type) || (node.children ?? []).some((c) => typeof c !== "string" && contains(c, types));
}

/**
 * A copy of the tree with `node` added just before the section that holds an
 * element of one of `types` (at the level where that section sits beside its
 * neighbours). Unchanged when no such section exists.
 */
export function insertBefore(tree: TreeNode, types: string[], node: TreeNode): TreeNode {
  const children = tree.children ?? [];
  const index = children.findIndex((c) => typeof c !== "string" && contains(c, types));
  if (index === -1) return tree;
  const holder = children[index] as TreeNode;
  // Go down while the section is the only real element on its level.
  const elements = children.filter((c) => typeof c !== "string");
  if (elements.length === 1 && !types.includes(holder.type)) {
    return { ...tree, children: children.map((c, i) => (i === index ? insertBefore(holder, types, node) : c)) };
  }
  return { ...tree, children: [...children.slice(0, index), node, ...children.slice(index)] };
}

/**
 * A copy of the tree with `node` added as the last child of the first element of
 * `type` (it comes after that element's own children). Unchanged when there is none.
 */
export function appendChild(tree: TreeNode, type: string, node: TreeNode): TreeNode {
  let done = false;
  const visit = (n: TreeNode): TreeNode => {
    if (!done && n.type === type) {
      done = true;
      return { ...n, children: [...(n.children ?? []), node] };
    }
    if (!n.children) return n;
    return { ...n, children: n.children.map((c) => (typeof c === "string" || done ? c : visit(c))) };
  };
  return visit(tree);
}

/**
 * A copy of the tree with `node` added just after the section that holds an
 * element of one of `types`, found as insertBefore finds it. Unchanged when no
 * such section exists.
 */
export function insertAfter(tree: TreeNode, types: string[], node: TreeNode): TreeNode {
  const children = tree.children ?? [];
  const index = children.findIndex((c) => typeof c !== "string" && contains(c, types));
  if (index === -1) return tree;
  const holder = children[index] as TreeNode;
  const elements = children.filter((c) => typeof c !== "string");
  if (elements.length === 1 && !types.includes(holder.type)) {
    return { ...tree, children: children.map((c, i) => (i === index ? insertAfter(holder, types, node) : c)) };
  }
  return { ...tree, children: [...children.slice(0, index + 1), node, ...children.slice(index + 1)] };
}
