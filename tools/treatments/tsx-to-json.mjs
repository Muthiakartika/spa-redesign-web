/**
 * One-off conversion (October 2026): every treatment page body in
 * src/content/treatments/<slug>.tsx becomes src/content/treatments/<slug>.json,
 * the same element tree written as data so /admin/ can edit it. The page is
 * rendered from that data by src/components/treatments/TreatmentBody.tsx.
 * The .tsx files were deleted after the conversion; they are in git history
 * (commit f99ecb5), and the rendered HTML of all 24 pages was identical.
 *
 *   node tools/treatments/tsx-to-json.mjs            # convert all 24
 *   node tools/treatments/tsx-to-json.mjs facial     # convert one
 *
 * Only what the pages use is supported: elements, fragments, and literal
 * props (strings, numbers, booleans, null, arrays, objects, JSX). Anything
 * else stops the script with the file and the expression.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const DIR = join(import.meta.dirname, "../../src/content/treatments");

function fail(file, node, what) {
  const sf = node.getSourceFile();
  const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
  throw new Error(`${file}:${line + 1}: unsupported ${what}: ${node.getText().slice(0, 80)}`);
}

/** JSX text the way React's JSX transform trims it. */
function jsxText(raw) {
  const lines = raw.split(/\r\n|\n|\r/);
  let out = "";
  lines.forEach((line, i) => {
    let s = line.replace(/\t/g, " ");
    if (i !== 0) s = s.replace(/^ +/, "");
    if (i !== lines.length - 1) s = s.replace(/ +$/, "");
    if (s) out += (out && i !== 0 ? " " : "") + s;
  });
  return out;
}

function tagName(file, name) {
  if (ts.isIdentifier(name)) return name.text;
  fail(file, name, "tag name");
}

function children(file, list) {
  const out = [];
  for (const child of list) {
    if (ts.isJsxText(child)) {
      const text = jsxText(child.text);
      if (text) out.push(text);
    } else if (ts.isJsxExpression(child)) {
      if (!child.expression) continue; // {/* comment */}
      out.push(value(file, child.expression));
    } else {
      out.push(element(file, child));
    }
  }
  return out;
}

function attributes(file, attrs) {
  const props = {};
  for (const attr of attrs.properties) {
    if (!ts.isJsxAttribute(attr)) fail(file, attr, "spread attribute");
    const name = attr.name.getText();
    const init = attr.initializer;
    if (!init) props[name] = true;
    else if (ts.isStringLiteral(init)) props[name] = init.text;
    else if (ts.isJsxExpression(init)) props[name] = value(file, init.expression);
    else fail(file, init, "attribute value");
  }
  return props;
}

/** A JSX element or fragment as { type, props?, children? }. */
function element(file, node) {
  if (ts.isJsxFragment(node)) {
    return { type: "Fragment", children: children(file, node.children) };
  }
  if (ts.isJsxSelfClosingElement(node)) {
    const props = attributes(file, node.attributes);
    return { type: tagName(file, node.tagName), ...(Object.keys(props).length ? { props } : {}) };
  }
  if (ts.isJsxElement(node)) {
    const props = attributes(file, node.openingElement.attributes);
    const kids = children(file, node.children);
    return {
      type: tagName(file, node.openingElement.tagName),
      ...(Object.keys(props).length ? { props } : {}),
      ...(kids.length ? { children: kids } : {}),
    };
  }
  fail(file, node, "JSX node");
}

/**
 * A prop value. JSX becomes { $jsx: element }, except a fragment around one
 * piece of text (title={<>Words</>}), which renders exactly like the text
 * itself and so is stored as a plain string the admin can edit.
 */
function value(file, node) {
  if (ts.isParenthesizedExpression(node)) return value(file, node.expression);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) {
    return -Number(node.operand.text);
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((e) => value(file, e));
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const p of node.properties) {
      if (!ts.isPropertyAssignment(p)) fail(file, p, "object member");
      const key = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : fail(file, p.name, "key");
      obj[key] = value(file, p.initializer);
    }
    return obj;
  }
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
    const el = element(file, node);
    if (el.type === "Fragment" && el.children?.length === 1 && typeof el.children[0] === "string") {
      return el.children[0];
    }
    return { $jsx: el };
  }
  fail(file, node, "expression");
}

/** The JSX returned by the file's default-exported function. */
function pageTree(file) {
  const source = readFileSync(join(DIR, file), "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let tree = null;
  sf.forEachChild((stmt) => {
    if (!ts.isFunctionDeclaration(stmt)) return;
    const isDefault = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
    if (!isDefault) return;
    const ret = stmt.body.statements.find((s) => ts.isReturnStatement(s));
    let expr = ret.expression;
    while (ts.isParenthesizedExpression(expr)) expr = expr.expression;
    tree = element(file, expr);
  });
  if (!tree) throw new Error(`${file}: no default-exported function returning JSX`);
  return tree;
}

/**
 * AboutSplit and AboutSplitAlt switch to the treatment layout when their
 * photo path starts with /images/services/. A photo uploaded in /admin/ lives
 * elsewhere, so the switch is written down explicitly: the page keeps its
 * layout whatever photo the owner picks. (Same HTML: the flag was true anyway.)
 */
function pinTreatmentLayout(node) {
  if (Array.isArray(node)) return node.forEach(pinTreatmentLayout);
  if (!node || typeof node !== "object") return;
  if ((node.type === "AboutSplit" || node.type === "AboutSplitAlt") && node.props) {
    const img = node.props.image;
    if (typeof img === "string" && img.startsWith("/images/services/") && node.props.treatmentLayout === undefined) {
      node.props = { ...node.props, treatmentLayout: true };
    }
  }
  for (const v of Object.values(node)) if (v && typeof v === "object") pinTreatmentLayout(v);
}

const only = process.argv[2];
const files = readdirSync(DIR).filter((f) => f.endsWith(".tsx") && (!only || f === `${only}.tsx`));
for (const file of files) {
  const tree = pageTree(file);
  pinTreatmentLayout(tree);
  const out = join(DIR, file.replace(/\.tsx$/, ".json"));
  writeFileSync(out, JSON.stringify(tree, null, 2) + "\n");
  console.log("wrote", out.replace(/\\/g, "/").replace(/.*src\//, "src/"));
}
