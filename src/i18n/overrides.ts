// Admin text overrides on top of the dictionaries. Only plain strings and lists of
// strings are editable; functions (plural helpers) and numbers stay in code.
import type { TextOverrides } from "@/lib/content/types";

export type TextField = { path: string; value: string | string[] };

const isStringList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

// Identifiers inside lists (footer.legal[].slug, checkout.methods[].id) are code, not copy.
const IDENTIFIER_KEYS = new Set(["id", "slug"]);

/** Every editable leaf of a dictionary, in source order. */
export function listTextFields(dict: object): TextField[] {
  const fields: TextField[] = [];
  const walk = (value: unknown, path: string) => {
    if (IDENTIFIER_KEYS.has(path.split(".").at(-1)!)) return;
    if (typeof value === "string") fields.push({ path, value });
    else if (isStringList(value)) fields.push({ path, value });
    else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}.${i}`));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
  };
  walk(dict, "");
  return fields;
}

function setIn(node: unknown, keys: string[], value: string | string[]): unknown {
  if (keys.length === 0) {
    if (typeof node === "string" && typeof value === "string") return value;
    if (isStringList(node) && isStringList(value)) return value;
    return node; // shape changed in code since the override was saved - ignore it
  }
  const [key, ...rest] = keys;
  if (Array.isArray(node)) {
    const i = Number(key);
    if (!(i in node)) return node;
    const copy = [...node];
    copy[i] = setIn(node[i], rest, value);
    return copy;
  }
  if (node && typeof node === "object" && key in node) {
    return { ...node, [key]: setIn((node as Record<string, unknown>)[key], rest, value) };
  }
  return node;
}

export function applyOverrides<T extends object>(dict: T, overrides: TextOverrides | undefined): T {
  if (!overrides) return dict;
  let result: unknown = dict;
  for (const [path, value] of Object.entries(overrides)) {
    const keys = path.split(".");
    if (!IDENTIFIER_KEYS.has(keys.at(-1)!)) result = setIn(result, keys, value);
  }
  return result as T;
}
