import { createElement, Fragment, type ComponentType, type ReactNode } from "react";
import AboutIntro from "@/components/sections/AboutIntro";
import AboutSplit from "@/components/sections/AboutSplit";
import AboutSplitAlt from "@/components/sections/AboutSplitAlt";
import FaqSection from "@/components/sections/FaqSection";
import Funfacts from "@/components/sections/Funfacts";
import PageBanner from "@/components/sections/PageBanner";
import ReserveCta from "@/components/sections/ReserveCta";
import ServiceSlider from "@/components/sections/ServiceSlider";
import SessionOptions from "@/components/sections/SessionOptions";
import TreatmentPricing from "@/components/sections/TreatmentPricing";
import TreatmentTestimonials from "@/components/sections/TreatmentTestimonials";
import DecorationMotion from "@/components/ui/DecorationMotion";
import FloralDecoration from "@/components/ui/FloralDecoration";
import { isJsx, type TreeNode, type TreeValue } from "@/lib/treatments/tree";

/** The components a treatment page may use, by the name written in its tree. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each takes its own props; the tree supplies them
const COMPONENTS: Record<string, ComponentType<any>> = {
  AboutIntro,
  AboutSplit,
  AboutSplitAlt,
  DecorationMotion,
  FaqSection,
  FloralDecoration,
  Funfacts,
  PageBanner,
  ReserveCta,
  ServiceSlider,
  SessionOptions,
  TreatmentPricing,
  TreatmentTestimonials,
};

function prop(value: TreeValue): unknown {
  if (isJsx(value)) return element(value.$jsx);
  if (Array.isArray(value)) return value.map(prop);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, prop(v)]));
  }
  return value;
}

function element(node: TreeNode | string): ReactNode {
  if (typeof node === "string") return node;
  const type = node.type === "Fragment" ? Fragment : /^[a-z]/.test(node.type) ? node.type : COMPONENTS[node.type];
  if (!type) throw new Error(`Unknown section "${node.type}" in a treatment page.`);
  const props = Object.fromEntries(Object.entries(node.props ?? {}).map(([k, v]) => [k, prop(v)]));
  // Children as arguments, as JSX compiles them: static, so no keys needed.
  return createElement(type, props, ...(node.children ?? []).map(element));
}

/**
 * A treatment page body, rendered from its tree: the seed file in
 * src/content/treatments/ or the version saved in /admin/. The same tree
 * gives the same HTML as the hand-written page it was converted from.
 */
export default function TreatmentBody({ tree }: { tree: TreeNode }) {
  return element(tree);
}
