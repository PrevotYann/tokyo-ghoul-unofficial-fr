import {translateAdventureDocuments} from "./adventure-translation.mjs";

const MODULE_ID = "tokyo-ghoul-unofficial-fr";
const SYSTEM_ID = "tokyo-ghoul-unofficial";
const enabled = () => game.system.id === SYSTEM_ID && game.i18n.lang === "fr";

// Register before Babele loads sources; it translates both indexes and documents.
Hooks.once("babele.init", babele => {
  if (game.system.id !== SYSTEM_ID) return;
  babele.registerConverters({tgAdventureDocuments: translateAdventureDocuments});
  babele.register({module: MODULE_ID, lang: "fr", dir: "compendium/fr"});
});

export function translatePackFolderNames(folders, packs, translations) {
  for (const folder of folders) {
    // Only system groups containing this system's packs, never campaign folders.
    if (!packs.some(pack => pack.collection.startsWith(`${SYSTEM_ID}.`)
      && (pack.folder?.id ?? pack.folder) === folder.id)) continue;
    const original = folder.originalName ?? folder.name;
    const translated = typeof translations[original] === "string" ? translations[original] : translations[original]?.name;
    if (!translated) continue;
    folder.originalName = original;
    folder.name = translated;
  }
}

Hooks.on("babele.ready", async () => {
  if (!enabled()) return;
  // Babele 2.9.1 addresses world folders, while v14 keeps sidebar compendium
  // groups in game.packs.folders. Apply the same source to that collection.
  const response = await fetch(`modules/${MODULE_ID}/compendium/fr/${SYSTEM_ID}._packs-folders.json`);
  if (!response.ok) throw new Error(`${MODULE_ID}: sidebar translations (${response.status})`);
  const {entries} = await response.json();
  translatePackFolderNames(game.packs.folders, game.packs, entries);
  await ui.compendium.render();
});

Hooks.once("ready", async () => {
  if (!enabled()) return;
  document.body.classList.add("tg-fr-active");
  const setting = game.settings.settings.get("babele.showOriginalName");
  if (!setting) return;
  // Keep original-name metadata for identity and migration, but hide its UI.
  setting.config = false;
  if (game.settings.get("babele", "showOriginalName")) {
    await game.settings.set("babele", "showOriginalName", false);
  }
});
