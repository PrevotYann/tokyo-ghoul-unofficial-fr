# Tokyo Ghoul : traduction française

Module français pour le système [Tokyo Ghoul: Unofficial TTRPG](https://github.com/PrevotYann/tokyo-ghoul-unofficial-foundry), à partir de la version **0.2.1**, pour **Foundry VTT 14.368**.

## Installation

1. Dans la configuration de Foundry, ouvrez **Modules complémentaires → Installer un module**.
2. Collez cette adresse dans le champ d’URL du manifeste :

   ```text
   https://github.com/PrevotYann/tokyo-ghoul-unofficial-fr/releases/latest/download/module.json
   ```

3. Ouvrez un monde utilisant le système Tokyo Ghoul et activez **Tokyo Ghoul : traduction française** dans la gestion des modules.
4. Choisissez **Français** dans les paramètres de langue de Foundry, puis rechargez le monde.

La release fournit également `manifest.json`, identique à `module.json`. Pour une installation manuelle, décompressez l’archive dans `Data/modules/` : le fichier doit se trouver à `Data/modules/tokyo-ghoul-unofficial-fr/module.json`.

## Contenu

Le module traduit les 312 entrées de l’interface du système : fiches, création de personnage, jets, combat, progression, fabrication, notifications et paramètres. Il traduit aussi l’affichage des noms et du texte descriptif des 83 entrées des compendiums existants, sans dépendance à Babele et sans créer de compendiums en double.

Les termes de l’univers sont conservés : kagune, quinque, kakuhou, kakuja, Quinx et cellules RC. Les enquêteurs du CCG sont désignés comme **inspecteurs**. « Edge » devient **atout** et « Gimmick » devient **capacité spéciale**. Les distances restent en pieds pour respecter les calculs du système.

Le système utilise certains noms anglais pour identifier les atouts et appliquer leurs règles. Le module traduit les étiquettes visibles mais conserve les noms enregistrés, les valeurs des listes, les formules et les données de glisser-déposer. Sur les fiches d’objet, une indication française accompagne le nom d’origine. Les champs d’atouts saisis à la main doivent conserver leurs identifiants anglais ; la correspondance est disponible dans [le glossaire](docs/glossaire.md). Les recherches de compendium continuent à utiliser les noms d’origine anglais.

Les descriptions connues sont présentées en français sur les fiches. Le texte original reste accessible dans un volet **Texte d’origine (modifiable)**. Les textes personnels et les noms personnalisés ne sont pas traduits automatiquement. Le module ne migre pas les données du monde. En changeant de langue ou en désactivant le module puis en rechargeant, on retrouve l’affichage d’origine.

Ce module traduit le système et son contenu existant ; il ne constitue pas une traduction intégrale du livre de règles ni de l’interface générale de Foundry. Aucun visuel officiel ni PDF du livre n’est distribué.

## Développement et publication

Node.js 24 et Python 3. Le dépôt du système voisin est utilisé uniquement pour vérifier la couverture : `../tokyo-ghoul-unofficial-foundry`. Pour un autre emplacement, définissez `TG_SYSTEM_PATH`.

```text
npm ci
npm test
npm run validate:source
npx playwright install chromium
npm run test:foundry
npm run release:package
```

Les tests Foundry nécessitent un serveur v14.368 sur `http://localhost:30014`, un monde jetable `tg-qa`, un utilisateur `Gamemaster` sans mot de passe et les deux paquets installés. `TG_QA_URL` permet de modifier l’URL. Ils activent ce module dans le monde QA et configurent le navigateur en français. Ils refusent de modifier tout autre monde. Les rapports et captures sont placés dans `artifacts/`, exclu du dépôt.

Le paquet installable et ses deux manifestes sont produits dans `dist/`. Après validation, `python scripts/publish-release.py` crée si nécessaire le dépôt public du compte `PrevotYann`, pousse le commit et le tag de version, puis publie les trois fichiers de release. Ce script utilise les identifiants GitHub du gestionnaire d’identifiants Git, sans les écrire dans le dépôt. Pour une nouvelle version, mettez à jour `module.json`, `package.json`, l’URL de téléchargement et le changelog avant de reconstruire le paquet.

## Attribution

Adaptation communautaire non officielle de l’univers créé par Sui Ishida. Le système de jeu d’origine et ses règles restent attribués à leurs auteurs. La traduction des résumés porte sur le contenu fourni par le système ; les règles et arbitrages du MJ restent ceux de votre table.
