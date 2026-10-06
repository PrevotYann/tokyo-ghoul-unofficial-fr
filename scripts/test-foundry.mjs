import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1366,height:1000}});
const errors=[];
page.on("pageerror",error=>errors.push(error.message));
const checks=[];
try {
  await page.goto(process.env.TG_QA_URL ?? "http://localhost:30014");
  await page.waitForTimeout(1200);
  if (await page.locator("[name=username]").count()) {
    await page.locator("[name=username]").fill("Gamemaster");
    await page.locator("button[name=join]").click();
  }
  await page.waitForFunction(()=>game?.ready);
  await page.evaluate(async()=>{
    if(game.world.id!=="tg-qa") throw new Error("Only disposable tg-qa world is allowed");
    const modules=game.settings.get("core","moduleConfiguration");
    if(!modules["tokyo-ghoul-unofficial-fr"]) {
      await game.settings.set("core","moduleConfiguration",{...modules,"tokyo-ghoul-unofficial-fr":true});
    }
    await game.settings.set("core","language","fr");
  });
  await page.reload();
  await page.waitForFunction(()=>game?.ready);
  await page.waitForTimeout(1000);
  const result=await page.evaluate(async()=>{
    const checks=[];
    const assert=(value,name)=>{if(!value) throw new Error(name);checks.push(name);};
    assert(game.version==="14.368","Foundry 14.368");
    assert(game.modules.get("tokyo-ghoul-unofficial-fr").active,"module active");
    assert(game.i18n.localize("TG.builder.title")==="Création de personnage","French dictionary overrides system stubs");
    const api=await import("/modules/tokyo-ghoul-unofficial-fr/src/translation.mjs");
    const actor=await game.tokyoGhoul.createActorFromCharacterDraft({name:"[TG FR QA] Goule",actorClass:"ghoul",kaguneType:"rinkaku",kaguneEdges:["Sharpened"]});
    try {
      const edgeRecord=(await game.packs.get("tokyo-ghoul-unofficial.edges").getDocuments()).find(i=>i.name==="Sharpened" && i.system.category==="ghoul");
      await actor.createEmbeddedDocuments("Item",[edgeRecord.toObject()]);
      await actor.sheet.render({force:true});
      assert(actor.sheet.element.textContent.includes("Tranchant"),"actor sheet displays French atout");
      assert(actor.items.some(i=>i.name==="Sharpened"),"canonical atout name retained");
      const edge=actor.items.find(i=>i.name==="Sharpened");
      assert(actor.getEdgeModifiers(actor.items.find(i=>i.type==="kagune"))!=null,"edge mechanics available");
      await edge.sheet.render({force:true});
      assert(edge.sheet.element.querySelector('[name="name"]').value==="Sharpened","sheet name input remains canonical");
      assert(edge.sheet.element.querySelector(".tg-fr-preview").textContent==="Tranchant","sheet shows French name beside identifier");
      await edge.sheet.close();
      await actor.sheet.close();
      const builder=await game.tokyoGhoul.openCharacterBuilder();
      await builder.render({force:true});
      const option=builder.element.querySelector('select[name="kaguneEdges"] option[value="Sharpened"]');
      assert(option?.textContent==="Tranchant (1)","builder French label with canonical option value");
      await builder.close();
      for(const pack of game.packs.filter(p=>p.collection.startsWith("tokyo-ghoul-unofficial."))) {
        const docs=await pack.getDocuments();
        for(const doc of docs) {
          await doc.sheet.render({force:true});
          const textarea=doc.sheet.element.querySelector('textarea[name="system.notes"],textarea[name="system.description"]');
          if(doc.system.notes || doc.system.description) assert(doc.sheet.element.querySelectorAll(".tg-fr-preview").length>0,`${doc.name}: translation preview`);
          await doc.sheet.close();
        }
        const compendium=new pack.applicationClass({collection:pack});
        await compendium.render({force:true});
        const apps=Object.values(pack.apps);
        if(pack.metadata.name==="edges") {
          if(!compendium.element.textContent.includes("Tranchant")) console.log(compendium.element.innerHTML);
          assert(compendium.element.textContent.includes("Tranchant"),"compendium labels translated");
        }
        await compendium.close();
        for(const app of apps) await app.close();
      }
      const container=document.createElement("div");
      container.innerHTML='<option value="Sharpened">Sharpened</option><textarea name="system.description">Make a basic attack with an eligible source.</textarea><p>My Sharpened blade</p>';
      api.translateElement(container);
      assert(container.querySelector("option").value==="Sharpened","option value unchanged");
      assert(container.querySelector("textarea").value==="Make a basic attack with an eligible source.","stored prose untouched");
      assert(container.querySelector("p").textContent==="My Sharpened blade","user prose untouched");
      return {checks,language:game.i18n.lang,version:game.version};
    } finally {await actor.delete();}
  });
  checks.push(...result.checks);
  await fs.mkdir("artifacts",{recursive:true});
  await page.evaluate(async()=>{
    const builder=await game.tokyoGhoul.openCharacterBuilder();
    builder.setPosition({height:850,top:60});
  });
  await page.screenshot({path:"artifacts/foundry-fr-builder.png",fullPage:true});
  await page.evaluate(async()=>{
    for(const app of Object.values(ui.windows)) if(app.id==="tg-character-builder") await app.close();
    const edge=(await game.packs.get("tokyo-ghoul-unofficial.edges").getDocuments()).find(i=>i.name==="Sharpened"&&i.system.category==="ghoul");
    await edge.sheet.render({force:true});
  });
  await page.screenshot({path:"artifacts/foundry-fr-item.png",fullPage:true});
  await page.evaluate(async()=>{
    for(const app of Object.values(ui.windows)) await app.close();
    await game.settings.set("core","language","en");
  });
  await page.reload();
  await page.waitForFunction(()=>game?.ready);
  await page.waitForTimeout(1000);
  await page.evaluate(async()=>{
    if(game.i18n.localize("TG.builder.title")!=="Character Builder") throw new Error("English dictionary restoration failed");
    const builder=await game.tokyoGhoul.openCharacterBuilder();
    if(builder.element.querySelector('option[value="Sharpened"]').textContent!=="Sharpened (1)") throw new Error("French content leaked into English mode");
    await builder.close();
    await game.settings.set("core","language","fr");
  });
  result.checks.push("English dictionary and canonical labels restored when changing language");
  await page.reload();
  await page.waitForFunction(()=>game?.ready);
  await fs.writeFile("artifacts/foundry-results.json",JSON.stringify({...result,errors},null,2));
  if(errors.length) throw new Error(errors.join("\n"));
  console.log(`${result.checks.length} live Foundry checks passed on ${result.version}; language ${result.language}.`);
} catch(error) {
  await fs.mkdir("artifacts",{recursive:true});
  await page.screenshot({path:"artifacts/failure.png",fullPage:true});
  console.error("QA failure screenshot: artifacts/failure.png");
  throw error;
} finally {await browser.close();}
