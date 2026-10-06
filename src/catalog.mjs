/** Exact matches only: formulas, identifiers and user prose are never rewritten. */
export function translateText(value, catalog) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  const translated = Object.hasOwn(catalog, trimmed) ? catalog[trimmed] : null;
  if (translated != null) return value.replace(trimmed, translated);
  // The character builder appends the slot cost to each option's label.
  const counted = trimmed.match(/^(.*)( \(\d+\))$/);
  if (counted && Object.hasOwn(catalog, counted[1])) return value.replace(trimmed, catalog[counted[1]] + counted[2]);
  return value;
}

export function translateList(value, catalog) {
  return String(value).split(",").map(part => translateText(part, catalog)).join(",");
}

export function createCatalog(content, english, french) {
  const catalog = {...content};
  for (const [key, value] of Object.entries(english)) {
    if (typeof french[key] === "string" && !value.includes("{")) catalog[value] ??= french[key];
  }
  return catalog;
}
