import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {translateAdventureDocuments} from "../src/adventure-translation.mjs";
import {buildAdventureTranslation} from "../scripts/adventure-translations.mjs";

const source = process.env.TG_SYSTEM_PATH ?? "../tokyo-ghoul-unofficial-foundry";
const {createLastDelivery} = await import(pathToFileURL(path.resolve(source, "src/packs-source/adventures/last-delivery.mjs")));
const pack = JSON.parse(await fs.readFile(new URL("../compendium/fr/tokyo-ghoul-unofficial.last-delivery.json", import.meta.url), "utf8"));
const english = createLastDelivery();
const entry = pack.entries[english._id];
const french = {...english, ...Object.fromEntries(Object.entries(entry).map(([key, value]) =>
  [key, Array.isArray(english[key]) ? translateAdventureDocuments(english[key], value) : value]))};

test("full adventure translation is current, covers every document and preserves mechanics", async () => {
  assert.deepEqual(pack, await buildAdventureTranslation(source));
  const prose = new Set(["name", "caption", "description", "appearance", "personality", "backstory", "goals", "ruleNotes"]);
  function check(original, translated, location = "adventure") {
    if (Array.isArray(original)) {
      assert.equal(translated.length, original.length, location);
      original.forEach((value, index) => check(value, translated[index], `${location}.${index}`));
    } else if (original && typeof original === "object") {
      assert.deepEqual(Object.keys(translated), Object.keys(original), location);
      for (const [key, value] of Object.entries(original)) {
        if (typeof value === "string" && (prose.has(key) || (key === "text" && location.includes("notes")) || (key === "content" && location.includes("pages")))) {
          if (value) assert.ok(translated[key]?.trim(), `${location}.${key}`);
        } else check(value, translated[key], `${location}.${key}`);
      }
    } else assert.deepEqual(translated, original, location);
  }
  check(english, french);
  assert.equal(french.name, "La Dernière Livraison");
  assert.equal(french.actors.length, 12);
  assert.equal(french.items.length, 15);
  assert.equal(french.journal.length, 12);
  assert.equal(french.scenes.length, 3);
  assert.equal(french.folders.length, 6);
  assert.equal(french.scenes.flatMap(scene => scene.notes).length, 10);
  assert.equal(french.actors.find(actor => actor.name.includes("Kurose")).system.resources.vitality.value, 96);
  assert.equal(french.actors[0].items[0].name, "Signal neuf");
  assert.ok(french.actors.every(actor => actor.prototypeToken.name === actor.name));
  assert.ok(french.scenes.every(scene => scene.tokens.every(token => token.name === french.actors.find(actor => actor._id === token.actorId).name)));
});

test("French journals preserve every UUID, link label, section and table", () => {
  const links = html => [...html.matchAll(/@UUID\[([^\]]+)\]\{([^}]+)\}/g)];
  const targets = new Map([...french.actors, ...french.items, ...french.journal, ...french.scenes].map(document => [document._id, document.name]));
  const tags = html => html.match(/<\/?[a-z][^>]*>/g);
  for (const [index, journal] of french.journal.entries()) {
    const original = english.journal[index].pages[0].text.content;
    const translated = journal.pages[0].text.content;
    assert.deepEqual(tags(translated), tags(original), journal.name);
    assert.deepEqual(links(translated).map(link => link[1]), links(original).map(link => link[1]), journal.name);
    for (const [, uuid, label] of links(translated)) assert.equal(label, targets.get(uuid.split(".")[1]).replace(uuid.startsWith("Scene.") ? /^\d+ • / : /^$/, ""), uuid);
    assert.doesNotMatch(translated, /\{\{(?:actor|scene|journal|item):/);
  }
});

test("converter does not mutate originals and ignores unrelated or missing document IDs", () => {
  const snapshot = structuredClone(english.actors);
  assert.deepEqual(english.actors, snapshot);
  assert.deepEqual(translateAdventureDocuments([{_id: "custom", name: "My NPC"}], entry.actors), [{_id: "custom", name: "My NPC"}]);
  assert.equal(translateAdventureDocuments(english.actors), english.actors);
  assert.deepEqual(translateAdventureDocuments(french.actors, entry.actors), french.actors);
  translateAdventureDocuments(english.actors, entry.actors);
  assert.deepEqual(english.actors, snapshot);
});
