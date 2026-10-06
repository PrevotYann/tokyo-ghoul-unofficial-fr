# Validation de la version 1.0.0

Vérifiée le 6 octobre 2026 sur Foundry VTT **14.368**, système **0.2.1**, dans le monde jetable `tg-qa`.

- 312 clés d’interface contrôlées automatiquement ; tous les paramètres `{…}` des messages sont conservés.
- 83 entrées de compendium contrôlées : noms, descriptions, notes et effets personnalisés non vides.
- 5 tests Node : correspondances exactes, conservation des formules et textes personnels, listes d’atouts, compatibilité et présence des fichiers du manifeste.
- 97 vérifications dans Chromium et Foundry : activation du module, dictionnaire français, fiches des 83 entrées, aperçu français des descriptions, noms canoniques, listes de création, étiquettes de compendium et retour à l’anglais.
- Aucune exception JavaScript relevée pendant la vérification dans Foundry.
- Captures de la création de personnage et d’une fiche d’atout inspectées.
- Archive ZIP contrôlée : neuf fichiers distribués, chemins corrects, intégrité valide, manifestes `module.json` et `manifest.json` identiques.

La vérification porte sur la traduction et la conservation des données utilisées par les règles. Elle ne remplace pas les tests de l’ensemble des mécaniques du système. Les recherches dans les compendiums et les champs d’identifiants saisis à la main restent en anglais ; les textes personnalisés ne sont pas traduits.
