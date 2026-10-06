import { createCatalog, translateText, translateList } from "./catalog.mjs";

const MODULE_ID = "tokyo-ghoul-unofficial-fr";
const SYSTEM_ID = "tokyo-ghoul-unofficial";
let catalog = {};
const enabled = () => game.system.id === SYSTEM_ID && game.i18n.lang === "fr";

async function loadJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${MODULE_ID}: ${url} (${response.status})`);
  return response.json();
}

Hooks.once("i18nInit", async () => {
  if (game.system.id !== SYSTEM_ID) return;
  const [content, english, french] = await Promise.all([
    loadJSON(`modules/${MODULE_ID}/lang/content-fr.json`),
    loadJSON(`systems/${SYSTEM_ID}/lang/en.json`),
    loadJSON(`modules/${MODULE_ID}/lang/fr.json`)
  ]);
  catalog = createCatalog(content, english, french);
});

/** Only presentation changes. Document data, option values and drag payloads stay canonical. */
export function translateElement(element) {
  if (!element?.querySelectorAll) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (node.parentElement?.closest("textarea, input, script, style, .tg-fr-original, .editor-content, prose-mirror")) continue;
    node.textContent = translateText(node.textContent, catalog);
  }
  for (const control of element.querySelectorAll("[title], [aria-label]")) {
    for (const attribute of ["title", "aria-label"]) {
      if (control.hasAttribute(attribute)) control.setAttribute(attribute, translateText(control.getAttribute(attribute), catalog));
    }
  }
}

function addFieldTranslations(element) {
  // Keep submitted values untouched, including editable names used by system mechanics.
  for (const field of element.querySelectorAll('input[name="name"], input[name^="system."], textarea[name^="system."]')) {
    if (field.parentElement.querySelector(`[data-tg-fr-field="${field.name}"]`)) continue;
    const translated = ["system.edges", "system.sourceEdges", "system.grantedEdges"].includes(field.name)
      ? translateList(field.value, catalog) : translateText(field.value, catalog);
    if (!field.value || translated === field.value) continue;
    const preview = document.createElement("div");
    preview.className = "tg-fr-preview";
    preview.dataset.tgFrField = field.name;
    preview.textContent = translated;
    if (field.tagName === "TEXTAREA") {
      const details = document.createElement("details");
      details.className = "tg-fr-original";
      const summary = document.createElement("summary");
      summary.textContent = "Texte d’origine (modifiable)";
      field.before(preview, details);
      details.append(summary, field);
    } else field.after(preview);
  }
}

function renderApplication(app, element) {
  if (!enabled()) return;
  const root = element instanceof HTMLElement ? element : element?.[0];
  if (!root) return;
  if (root.matches(".tg-system") || root.querySelector(".tg-system")) {
    translateElement(root);
    addFieldTranslations(root);
  } else if (app.collection?.metadata?.packageName === SYSTEM_ID || app.collection?.collection?.startsWith(`${SYSTEM_ID}.`)) {
    translateElement(root);
  }
  // Limit sidebar translation to this system's packs and items.
  for (const row of root.querySelectorAll("[data-pack]")) {
    if (row.dataset.pack.startsWith(`${SYSTEM_ID}.`)) translateElement(row);
  }
  if (app.id === "items") {
    for (const row of root.querySelectorAll("[data-document-id], [data-entry-id]")) {
      const item = game.items.get(row.dataset.documentId ?? row.dataset.entryId);
      if (item) translateElement(row);
    }
  }
}

Hooks.on("renderApplicationV2", renderApplication);
Hooks.on("renderApplication", renderApplication);
Hooks.on("renderChatMessageHTML", (message, element) => {
  if (!enabled()) return;
  // Translate source item labels, never defender/target names or arbitrary chat prose.
  for (const card of element.querySelectorAll(".tg-chat-card")) {
    const labels = Array.from(card.querySelectorAll("dt"));
    const source = labels.find(label => label.textContent.trim() === game.i18n.localize("TG.chat.source"));
    if (source?.nextElementSibling) translateElement(source.nextElementSibling);
  }
});
