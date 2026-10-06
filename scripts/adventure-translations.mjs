import path from "node:path";
import {pathToFileURL} from "node:url";
import {journals, strings, biographies} from "../lang/last-delivery-fr.mjs";

export async function buildAdventureTranslation(source) {
  const {createLastDelivery, adventureId} = await import(pathToFileURL(path.resolve(source, "src/packs-source/adventures/last-delivery.mjs")));
  const {journalContent} = await import(pathToFileURL(path.resolve(source, "src/packs-source/adventures/last-delivery-journals.mjs")));
  const adventure = createLastDelivery();
  const dictionary = {...strings};
  const properNames = new Set(adventure.actors.slice(0, 6).map(actor => actor.name));
  for (const [index, actor] of adventure.actors.entries()) {
    for (const [column, field] of ["appearance", "personality", "backstory"].entries()) {
      dictionary[actor.system.biography[field]] = `<p>${biographies[index][column]}</p>`;
    }
    if (index < 6) for (const item of actor.items.filter(item => ["kagune", "quinque"].includes(item.type))) {
      dictionary[item.system.description] = `<p>${item.type === "quinque" ? "Quinque" : "Kagune"} ${item.system.primaryType} d’origine du personnage (${biographies[index][0].toLocaleLowerCase("fr")}). Aucun atout facultatif ; le créateur de personnage convertit les emplacements de départ inutilisés en niveau RC.</p>`;
    }
  }
  for (const [key, title] of journals) {
    dictionary[journalContent.find(entry => entry[0] === key)[1]] = title;
  }
  const translate = value => {
    if (!value || properNames.has(value)) return value;
    if (!Object.hasOwn(dictionary, value)) throw new Error(`Missing adventure translation: ${value}`);
    return dictionary[value];
  };
  const proseFields = new Set(["name", "caption", "description", "appearance", "personality", "backstory", "goals", "ruleNotes"]);
  const patches = value => {
    if (Array.isArray(value)) return Object.fromEntries(value.filter(v => v?._id).map(v => [v._id, patches(v)]));
    const patch = {};
    for (const [key, field] of Object.entries(value)) {
      if (typeof field === "string" && (proseFields.has(key) || key === "text") && field) patch[key] = translate(field);
      else if (field && typeof field === "object") {
        const nested = patches(field);
        if (Object.keys(nested).length) patch[key] = nested;
      }
    }
    return patch;
  };
  const entry = patches({...adventure, journal: []});
  entry.journal = Object.fromEntries(journals.map(([key, name, html]) => {
    const original = journalContent.find(journal => journal[0] === key)[2];
    const references = text => [...text.matchAll(/\{\{(actor|scene|journal|item):([^}]+)\}\}/g)].map(match => match[0]);
    if (JSON.stringify(references(original)) !== JSON.stringify(references(html))) throw new Error(`Changed journal references: ${key}`);
    const document = adventure.journal.find(journal => journal._id === adventureId(`journal:${key}`));
    const labels = [...document.pages[0].text.content.matchAll(/@UUID\[([^\]]+)\]\{([^}]+)\}/g)];
    let index = 0;
    const text = `<article class="tg-system tg-adventure">${html.replace(/\{\{(actor|scene|journal|item):([^}]+)\}\}/g, () => {
      const [, uuid, label] = labels[index++];
      return `@UUID[${uuid}]{${translate(label)}}`;
    })}</article>`;
    return [document._id, {name, pages: {[document.pages[0]._id]: {name, text: {content: text}}}}];
  }));
  return {
    label: strings["The Last Delivery • One-Shot"],
    mapping: Object.fromEntries(["name", "caption", "description", "actors", "items", "journal", "scenes", "folders"].map(field =>
      [field, ["name", "caption", "description"].includes(field) ? field : {path: field, converter: "tgAdventureDocuments"}])),
    entries: {[adventure._id]: entry}
  };
}
