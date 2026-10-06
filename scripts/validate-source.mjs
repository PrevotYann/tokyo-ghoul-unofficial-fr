import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import {buildAdventureTranslation} from "./adventure-translations.mjs";
const source = process.env.TG_SYSTEM_PATH ?? "../tokyo-ghoul-unofficial-foundry";
const read = async file => JSON.parse(await fs.readFile(file, "utf8"));
const english = await read(path.join(source, "lang/en.json"));
const french = await read("lang/fr.json");
const content = await read("lang/content-fr.json");
const placeholders = text => (text.match(/\{[^}]+\}/g) ?? []).sort();
for (const [key, value] of Object.entries(english)) {
  assert.ok(french[key]?.trim(), `Missing translation: ${key}`);
  assert.deepEqual(placeholders(french[key]), placeholders(value), `Placeholders: ${key}`);
}
let records = 0;
for (const file of await fs.readdir(path.join(source, "src/packs-source"))) {
  if (!file.endsWith(".json")) continue;
  for (const record of await read(path.join(source, "src/packs-source", file))) {
    assert.ok(content[record.name], `Missing name: ${record.name}`);
    for (const key of ["description", "notes", "dynamicNotes", "dynamicEffect"]) {
      if (record.system[key]) assert.ok(content[record.system[key]], `Missing prose: ${record.name}.${key}`);
    }
    records++;
  }
}
let packs = 0;
for (const file of await fs.readdir(path.join(source, "babele/en"))) {
  if (!file.endsWith(".json")) continue;
  const original = await read(path.join(source, "babele/en", file));
  const translated = await read(path.join("compendium/fr", file));
  assert.deepEqual(translated.mapping, original.mapping, `Mapping: ${file}`);
  assert.deepEqual(Object.keys(translated.entries), Object.keys(original.entries), `Stable IDs: ${file}`);
  assert.deepEqual(Object.keys(translated.folders ?? {}), Object.keys(original.folders ?? {}), `Folder keys: ${file}`);
  if (original.label) assert.equal(translated.label, content[original.label], `Pack title: ${file}`);
  for (const [key, value] of Object.entries(original.folders ?? {})) {
    assert.equal(translated.folders[key], content[value], `Folder: ${file}.${key}`);
  }
  for (const [id, entry] of Object.entries(original.entries)) {
    if (typeof entry === "string") {
      assert.equal(translated.entries[id], content[entry], `Folder: ${file}.${id}`);
      continue;
    }
    assert.deepEqual(Object.keys(translated.entries[id]), Object.keys(entry), `Narrative fields: ${file}.${id}`);
    for (const [field, value] of Object.entries(entry)) {
      assert.equal(translated.entries[id][field], value ? content[value] : value, `Translation: ${file}.${id}.${field}`);
    }
  }
  packs++;
}
assert.deepEqual(await read("compendium/fr/tokyo-ghoul-unofficial.last-delivery.json"), await buildAdventureTranslation(source), "Complete adventure translation matches authoring source");
console.log(`${Object.keys(english).length} interface keys, ${records} rule records, ${packs + 1} Babele files and the complete adventure covered; placeholders, IDs and mappings preserved.`);
