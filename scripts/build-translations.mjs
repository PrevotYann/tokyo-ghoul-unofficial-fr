import fs from "node:fs/promises";
import path from "node:path";

const source = process.env.TG_SYSTEM_PATH ?? "../tokyo-ghoul-unofficial-foundry";
const content = JSON.parse(await fs.readFile("lang/content-fr.json", "utf8"));
const directory = "compendium/fr";
await fs.mkdir(directory, {recursive: true});
const translate = value => {
  if (!value) return value;
  if (!Object.hasOwn(content, value)) throw new Error(`Missing French translation: ${value}`);
  return content[value];
};

// The system templates own IDs and mappings; only narrative values change.
for (const file of await fs.readdir(path.join(source, "babele/en"))) {
  if (!file.endsWith(".json")) continue;
  const pack = JSON.parse(await fs.readFile(path.join(source, "babele/en", file), "utf8"));
  if (pack.label) pack.label = translate(pack.label);
  for (const key of Object.keys(pack.folders ?? {})) pack.folders[key] = translate(pack.folders[key]);
  for (const entry of Object.values(pack.entries)) {
    for (const key of Object.keys(entry)) entry[key] = translate(entry[key]);
  }
  await fs.writeFile(path.join(directory, file), JSON.stringify(pack, null, 2) + "\n");
}
console.log(`French Babele translations written to ${directory}.`);
