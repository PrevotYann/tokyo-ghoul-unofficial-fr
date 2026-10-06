import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 1366, height: 1000}});
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const packs = {};
for (const file of await fs.readdir("compendium/fr")) {
  packs[file.replace(/\.json$/, "")] = JSON.parse(await fs.readFile(`compendium/fr/${file}`, "utf8"));
}
const waitForTranslations = () => page.waitForFunction(() =>
  globalThis.game?.ready && game.packs.get("tokyo-ghoul-unofficial.edges")?.index.get("814adc493d0ca42c")?.name === "Tranchant");
try {
  await page.goto(process.env.TG_QA_URL ?? "http://localhost:30014");
  await page.waitForTimeout(1200);
  if (await page.locator("[name=username]").count()) {
    await page.locator("[name=username]").fill("Gamemaster");
    await page.locator("button[name=join]").click();
  }
  await page.waitForFunction(() => globalThis.game?.ready);
  await page.evaluate(async () => {
    if (game.world.id !== "tg-qa") throw new Error("Only disposable tg-qa world is allowed");
    const modules = game.settings.get("core", "moduleConfiguration");
    await game.settings.set("core", "moduleConfiguration", {...modules, "tokyo-ghoul-unofficial-fr": true, babele: true, "lib-wrapper": true});
    await game.settings.set("core", "language", "fr");
  });
  await page.reload();
  await waitForTranslations();
  // A previous user preference must not reveal English names after reload.
  await page.evaluate(() => game.settings.set("babele", "showOriginalName", true));
  await page.reload();
  await waitForTranslations();
  const result = await page.evaluate(async expected => {
    const checks = [];
    const assert = (value, name) => {if (!value) throw new Error(name); checks.push(name);};
    assert(game.version === "14.368", "Foundry 14.368");
    assert(game.system.version === "0.3.0", "system 0.3.0");
    assert(game.modules.get("babele").active, "Babele active");
    assert(game.i18n.localize("TG.edges.sharpened") === "Tranchant", "French rule ID label");
    assert(!game.settings.get("babele", "showOriginalName"), "original-name preference disabled");
    assert(!game.settings.settings.get("babele.showOriginalName").config, "original-name setting hidden");
    assert(document.body.classList.contains("tg-fr-active"), "French visibility rules active");
    for (const pack of game.packs.filter(p => p.collection.startsWith("tokyo-ghoul-unofficial."))) {
      const translation = expected[pack.collection];
      assert(pack.metadata.label === translation.label, `${pack.collection}: French pack title`);
      await pack.getIndex();
      const documents = await pack.getDocuments();
      assert(documents.length === Object.keys(translation.entries).length, `${pack.collection}: every entry present`);
      for (const doc of documents) {
        const entry = translation.entries[doc.id];
        assert(doc.name === entry.name && pack.index.get(doc.id).name === entry.name, `${doc.id}: French document and index name`);
        for (const [field, text] of Object.entries(entry)) {
          if (field !== "name") assert(doc.system[field] === text, `${doc.id}: French ${field}`);
        }
        await doc.sheet.render({force: true});
        assert(doc.sheet.element.querySelector('[name="name"]').value === entry.name, `${doc.id}: French editable sheet name`);
        for (const [field, text] of Object.entries(entry)) {
          if (field === "name") continue;
          const input = doc.sheet.element.querySelector(`[name="system.${field}"]`);
          if (input) assert(input.value === text, `${doc.id}: sheet displays French ${field}`);
        }
        assert(!doc.sheet.element.querySelector(".tg-fr-original, .tg-fr-preview"), `${doc.id}: no source-text panel`);
        await doc.sheet.close();
      }
      for (const folder of pack.folders) {
        assert(Object.values(translation.folders).includes(folder.name), `${pack.collection}: French folder`);
      }
      const compendium = new pack.applicationClass({collection: pack});
      await compendium.render({force: true});
      assert(!Array.from(compendium.element.querySelectorAll(".babele-original-name")).some(el => getComputedStyle(el).display !== "none"), `${pack.collection}: no visible original names`);
      if (pack.metadata.name === "edges") {
        const search = compendium.element.querySelector('input[name="search"]');
        search.value = "Tranchant";
        search.dispatchEvent(new Event("input", {bubbles: true}));
        await new Promise(resolve => setTimeout(resolve, 300));
        const row = compendium.element.querySelector('[data-entry-id="814adc493d0ca42c"], [data-document-id="814adc493d0ca42c"]');
        assert(row && getComputedStyle(row).display !== "none", "French compendium search finds Tranchant");
      }
      await compendium.close();
    }
    const actor = await game.tokyoGhoul.createActorFromCharacterDraft({name: "[TG FR QA]", actorClass: "ghoul", kaguneType: "rinkaku", kaguneEdges: ["sharpened"]});
    try {
      const source = await game.packs.get("tokyo-ghoul-unofficial.edges").getDocument("814adc493d0ca42c");
      const [edge] = await actor.createEmbeddedDocuments("Item", [source.toObject()]);
      assert(edge.name === "Tranchant" && edge.system.ruleId === "sharpened", "import preserves French name and mechanical ID");
      const hardySource = (await game.packs.get("tokyo-ghoul-unofficial.edges").getDocuments()).find(i => i.system.ruleId === "hardy" && i.system.category === "ghoul");
      const [hardy] = await actor.createEmbeddedDocuments("Item", [hardySource.toObject()]);
      assert(hardy.name === "Robuste" && actor.getEdgeModifiers().blockBonus === 3, "translated Hardy still grants +3 Block");
      await actor.sheet.render({force: true});
      assert(actor.sheet.element.textContent.includes("Tranchant"), "actor sheet displays imported French name");
      await actor.sheet.close();
    } finally {await actor.delete();}
    const builder = await game.tokyoGhoul.openCharacterBuilder();
    await builder.render({force: true});
    const option = builder.element.querySelector('select[name="kaguneEdges"] option[value="sharpened"]');
    assert(option?.textContent.trim() === "Tranchant (1)", "builder uses French label and stable ID");
    await builder.close();
    for (const entry of Object.values(expected["tokyo-ghoul-unofficial._packs-folders"].entries)) {
      assert(game.packs.folders.some(folder => folder.name === entry.name), `sidebar folder: ${entry.name}`);
    }
    return {checks, language: game.i18n.lang, version: game.version};
  }, packs);
  await fs.mkdir("artifacts", {recursive: true});
  await page.evaluate(async () => {
    const item = await game.packs.get("tokyo-ghoul-unofficial.edges").getDocument("814adc493d0ca42c");
    await item.sheet.render({force: true});
  });
  await page.screenshot({path: "artifacts/foundry-fr-item.png", fullPage: true});
  await page.evaluate(async () => {
    for (const app of Object.values(ui.windows)) await app.close();
    await game.settings.set("core", "language", "en");
  });
  await page.reload();
  await page.waitForFunction(() => globalThis.game?.ready && game.packs.get("tokyo-ghoul-unofficial.edges")?.index.get("814adc493d0ca42c")?.name === "Sharpened");
  await page.evaluate(async () => {
    if (!game.settings.settings.get("babele.showOriginalName").config) throw new Error("English original-name setting restoration failed");
    if (document.body.classList.contains("tg-fr-active")) throw new Error("French visibility rules leaked into English");
    const item = await game.packs.get("tokyo-ghoul-unofficial.edges").getDocument("814adc493d0ca42c");
    if (item.name !== "Sharpened" || item.system.ruleId !== "sharpened") throw new Error("English source restoration failed");
    await game.settings.set("core", "language", "fr");
  });
  result.checks.push("English compendium content and settings restored when changing language");
  await page.reload();
  await waitForTranslations();
  await fs.writeFile("artifacts/foundry-results.json", JSON.stringify({...result, errors}, null, 2));
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`${result.checks.length} live Foundry checks passed on ${result.version}; language ${result.language}.`);
} catch (error) {
  await fs.mkdir("artifacts", {recursive: true});
  await page.screenshot({path: "artifacts/failure.png", fullPage: true});
  console.error("QA failure screenshot: artifacts/failure.png");
  throw error;
} finally {await browser.close();}
