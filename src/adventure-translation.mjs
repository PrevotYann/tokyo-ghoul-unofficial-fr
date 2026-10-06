// Babele collection converter. Sparse translations are keyed by stable IDs;
// only supplied prose fields change, including on embedded items and tokens.
export function translateAdventureDocuments(documents, translations) {
  if (!translations) return documents;
  const overlay = (source, patch) => {
    if (Array.isArray(source)) return source.map(document =>
      patch[document._id] ? overlay(document, patch[document._id]) : document);
    if (source && typeof source === "object") {
      return Object.fromEntries(Object.entries(source).map(([key, value]) =>
        [key, Object.hasOwn(patch, key) ? overlay(value, patch[key]) : value]));
    }
    return patch;
  };
  return overlay(documents, translations);
}
