import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
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
    for (const key of ["description", "notes", "dynamicEffect"]) {
      if (record.system[key]) assert.ok(content[record.system[key]], `Missing prose: ${record.name}.${key}`);
    }
    records++;
  }
}
console.log(`${Object.keys(english).length} interface keys and ${records} compendium records covered; placeholders preserved.`);
