import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = async file => JSON.parse(await fs.readFile(new URL(`../${file}`, import.meta.url), "utf8"));
const content = await read("lang/content-fr.json");

test("Babele packs cover translated titles, folders and all 83 entries using stable IDs", async () => {
  let count = 0;
  for (const file of await fs.readdir(new URL("../compendium/fr/", import.meta.url))) {
    if (file.endsWith(".last-delivery.json")) continue;
    const pack = await read(`compendium/fr/${file}`);
    if (file.endsWith("._packs-folders.json")) {
      for (const name of ["Tokyo Ghoul - Rules", "Tokyo Ghoul - Arsenal", "Tokyo Ghoul - Adventures"]) assert.equal(pack.entries[name], content[name]);
      continue;
    }
    assert.ok(Object.values(content).includes(pack.label));
    for (const [field, target] of Object.entries(pack.mapping)) {
      assert.ok(["name", "description", "notes", "dynamicNotes", "dynamicEffect"].includes(field));
      assert.equal(target, field === "name" ? "name" : `system.${field}`);
    }
    for (const [id, entry] of Object.entries(pack.entries)) {
      assert.match(id, /^[a-f0-9]{16}$/);
      for (const value of Object.values(entry)) assert.ok(!value || Object.values(content).includes(value));
      count++;
    }
  }
  assert.equal(count, 83);
  const edges = await read("compendium/fr/tokyo-ghoul-unofficial.edges.json");
  assert.equal(Object.values(edges.entries).filter(e => e.name === "Cannibale").length, 2);
});

test("French runtime registers Babele and disables and hides original names only in French", async () => {
  const callbacks = new Map();
  globalThis.Hooks = {once: (name, callback) => callbacks.set(name, callback), on: (name, callback) => callbacks.set(name, callback)};
  let originalName = true;
  const setting = {config: true};
  globalThis.game = {
    system: {id: "tokyo-ghoul-unofficial"}, i18n: {lang: "en"},
    settings: {
      settings: new Map([["babele.showOriginalName", setting]]),
      get: () => originalName,
      set: async (module, key, value) => {assert.equal(module, "babele"); assert.equal(key, "showOriginalName"); originalName = value;}
    }
  };
  const classes = new Set();
  globalThis.document = {body: {classList: {add: name => classes.add(name)}}};
  try {
    const {translatePackFolderNames} = await import("../src/translation.mjs");
    const folders = [{id: "rules", name: "Tokyo Ghoul - Rules"}, {id: "custom", name: "Tokyo Ghoul - Rules"}];
    translatePackFolderNames(folders, [{collection: "tokyo-ghoul-unofficial.edges", folder: "rules"}], {"Tokyo Ghoul - Rules": {name: "Tokyo Ghoul — Règles"}});
    assert.equal(folders[0].name, "Tokyo Ghoul — Règles");
    assert.equal(folders[0].originalName, "Tokyo Ghoul - Rules");
    assert.equal(folders[1].name, "Tokyo Ghoul - Rules");
    const registrations = [];
    const converters = {};
    callbacks.get("babele.init")({register: source => registrations.push(source), registerConverters: values => Object.assign(converters, values)});
    assert.equal(typeof converters.tgAdventureDocuments, "function");
    assert.deepEqual(registrations, [{module: "tokyo-ghoul-unofficial-fr", lang: "fr", dir: "compendium/fr"}]);
    await callbacks.get("ready")();
    assert.equal(originalName, true);
    assert.equal(setting.config, true);
    assert.equal(classes.size, 0);
    game.i18n.lang = "fr";
    await callbacks.get("ready")();
    assert.equal(originalName, false);
    assert.equal(setting.config, false);
    assert.ok(classes.has("tg-fr-active"));
    game.system.id = "another-system";
    callbacks.get("babele.init")({register: source => registrations.push(source)});
    assert.equal(registrations.length, 1);
  } finally {
    delete globalThis.Hooks;
    delete globalThis.game;
    delete globalThis.document;
  }
});
