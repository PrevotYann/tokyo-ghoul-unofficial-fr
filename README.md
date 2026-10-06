# Tokyo Ghoul : traduction française

Module français pour le système [Tokyo Ghoul: Unofficial TTRPG](https://github.com/PrevotYann/tokyo-ghoul-unofficial-foundry), à partir de la version **0.3.0**, pour **Foundry VTT 14.368**, avec **Babele 2.8.0 ou ultérieur**.

## Installation

1. Dans la configuration de Foundry, ouvrez **Modules complémentaires → Installer un module**.
2. Collez cette adresse dans le champ d’URL du manifeste :

   ```text
   https://github.com/PrevotYann/tokyo-ghoul-unofficial-fr/releases/latest/download/module.json
   ```

3. Installez **Babele** et sa dépendance **libWrapper**. Ouvrez un monde utilisant le système Tokyo Ghoul et activez ces deux modules ainsi que **Tokyo Ghoul : traduction française**.
4. Choisissez **Français** dans les paramètres de langue de Foundry, puis rechargez le monde.

La release fournit également `manifest.json`, identique à `module.json`. Pour une installation manuelle, décompressez l’archive dans `Data/modules/` : le fichier doit se trouver à `Data/modules/tokyo-ghoul-unofficial-fr/module.json`.

## Contenu

Le module traduit les 337 entrées de l’interface du système : fiches, création de personnage, jets, combat, progression, fabrication, notifications et paramètres. Babele traduit les 83 entrées des six compendiums de règles et d’équipement : noms, descriptions, notes et effets personnalisés, ainsi que les titres des compendiums et leurs dossiers. Aucun compendium en double n’est créé.

L’aventure **La Dernière Livraison**, disponible avec le système **0.4.1**, est intégralement traduite : douze journaux (guide du MJ, scènes, épilogue, dossiers confidentiels et documents pour les joueurs), six personnages joueurs, six PNJ, quinze objets, trois scènes, leurs pions et dix repères. Les dialogues et textes à lire préservent le rythme du scénario et ses dilemmes. Ouvrez **Tokyo Ghoul — Aventures → La Dernière Livraison • Scénario en une séance**, importez tout le contenu, puis lisez **00 • MJ — Pour commencer**. Prévoyez quatre à six joueurs et quatre à cinq heures. L’import conserve les liens, les caractéristiques et les permissions privées. Une nouvelle importation peut écraser une partie en cours : sauvegardez-la auparavant.

Les termes de l’univers sont conservés : kagune, quinque, kakuhou, kakuja, Quinx et cellules RC. Les enquêteurs du CCG sont désignés comme **inspecteurs**. « Edge » devient **atout** et « Gimmick » devient **capacité spéciale**. Les distances restent en pieds pour respecter les calculs du système.

Les compendiums, leurs fiches et les objets importés portent directement leurs noms et descriptions français. Les recherches de compendium utilisent les noms français. Les identifiants stables des documents, les `system.ruleId` des atouts, les références mécaniques, les formules et les valeurs des listes restent inchangés. Les champs de références d’atouts saisis à la main acceptent les identifiants de règles, par exemple `sharpened` pour **Tranchant**, comme indiqué dans [le glossaire](docs/glossaire.md).

Seul le texte français est affiché pour le contenu traduit. Aucun volet de texte d’origine n’est ajouté ; l’affichage du nom d’origine de Babele est désactivé et son option masquée en français. Les textes personnels et les noms personnalisés ne sont pas traduits automatiquement. Le module ne migre pas les données du monde. En changeant de langue ou en désactivant le module puis en rechargeant, les compendiums retrouvent leur contenu d’origine. Les objets déjà importés conservent leur traduction ; Babele permet de traduire les objets d’un acteur existant depuis sa fiche.

Ce module traduit le système et son contenu existant ; il ne constitue pas une traduction intégrale du livre de règles ni de l’interface générale de Foundry. Aucun visuel officiel ni PDF du livre n’est distribué.

## Développement et publication

Node.js 24 et Python 3. Le dépôt du système voisin est utilisé uniquement pour vérifier la couverture : `../tokyo-ghoul-unofficial-foundry`. Pour un autre emplacement, définissez `TG_SYSTEM_PATH`.

```text
npm ci
npm run build:translations
npm test
npm run validate:source
npx playwright install chromium
npm run test:foundry
npm run release:package
```

`npm run build:translations` reprend les identifiants et mappings des modèles anglais dans `babele/en/` du système et les traduit avec `lang/content-fr.json`. Il construit aussi la traduction de l’aventure à partir de ses sources et de `lang/last-delivery-fr.mjs`. Il refuse les valeurs sans traduction et les références narratives modifiées. `npm run validate:source` vérifie aussi les fichiers Babele, les dossiers, les identifiants, les mappings et la couverture complète de l’aventure. Les tests Foundry vérifient l’import natif en français, puis suppriment leurs documents de test ; ils refusent d’écraser une aventure déjà importée.

Les tests Foundry nécessitent un serveur v14.368 sur `http://localhost:30014`, un monde jetable `tg-qa`, un utilisateur `Gamemaster` sans mot de passe et le système, ce module, Babele et libWrapper installés. `TG_QA_URL` permet de modifier l’URL. Ils activent les modules dans le monde QA et configurent le navigateur en français. Ils refusent de modifier tout autre monde. Les rapports et captures sont placés dans `artifacts/`, exclu du dépôt.

Le paquet installable et ses deux manifestes sont produits dans `dist/`. Après validation, `python scripts/publish-release.py` crée si nécessaire le dépôt public du compte `PrevotYann`, pousse le commit et le tag de version, puis publie les trois fichiers de release. Ce script utilise les identifiants GitHub du gestionnaire d’identifiants Git, sans les écrire dans le dépôt. Pour une nouvelle version, mettez à jour `module.json`, `package.json`, l’URL de téléchargement et le changelog avant de reconstruire le paquet.

## Attribution

Adaptation communautaire non officielle de l’univers créé par Sui Ishida. Le système de jeu d’origine et ses règles restent attribués à leurs auteurs. La traduction des résumés porte sur le contenu fourni par le système ; les règles et arbitrages du MJ restent ceux de votre table.
