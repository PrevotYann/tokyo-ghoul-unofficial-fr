import { test } from "node:test";
import assert from "node:assert/strict";
import { createCatalog, translateText, translateList } from "../src/catalog.mjs";
const catalog = createCatalog({"Sharpened":"Tranchant", "Bleeding":"Hémorragie"}, {"TG.a":"Attack", "TG.b":"{actor} takes damage"}, {"TG.a":"Attaque", "TG.b":"{actor} subit des dégâts"});
test("known labels preserve whitespace and canonical catalog keys", () => {
  assert.equal(translateText("  Sharpened ",catalog),"  Tranchant ");
  assert.equal(catalog.Sharpened,"Tranchant");
  assert.equal(translateText("Attack",catalog),"Attaque");
  assert.equal(translateText("Sharpened (1)",catalog),"Tranchant (1)");
});
test("user prose and formulas are preserved, including words within sentences", () => {
  for (const value of ["My Sharpened blade", "@stats.str.total + 2", "A character called Bleeding", "{actor} takes damage"]) assert.equal(translateText(value,catalog),value);
});
test("comma-separated display lists preserve unknown custom atouts", () => {
  assert.equal(translateList("Sharpened, My custom edge, Bleeding",catalog),"Tranchant, My custom edge, Hémorragie");
});
