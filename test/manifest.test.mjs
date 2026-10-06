import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const manifest=JSON.parse(await fs.readFile(new URL("../module.json",import.meta.url),"utf8"));
test("module manifest restricts activation to the compatible system and v14",()=>{
  assert.equal(manifest.compatibility.minimum,"14");
  assert.equal(manifest.compatibility.verified,"14.368");
  assert.equal(manifest.compatibility.maximum,"14");
  assert.equal(manifest.relationships.systems[0].id,"tokyo-ghoul-unofficial");
  assert.equal(manifest.languages[0].lang,"fr");
  assert.ok(manifest.download.includes(`/v${manifest.version}/`));
});
test("every runtime manifest path exists",async()=>{
  for(const file of [...manifest.esmodules,...manifest.styles,...manifest.languages.map(l=>l.path)]) await fs.access(new URL("../"+file,import.meta.url));
  await fs.access(new URL("../lang/content-fr.json",import.meta.url));
});
