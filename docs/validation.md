# Validation de la version 1.2.0

- Couverture vérifiée depuis les sources du système **0.4.1** : 337 clés d’interface, 83 entrées de règles et huit fichiers Babele, dont l’aventure complète.
- Sept tests Node réussis : couverture, conservation des données mécaniques, textes des douze journaux, structure HTML, tableaux, UUID et libellés liés, noms des objets et pions, absence de mutation des sources et manifeste.
- Import natif de **La Dernière Livraison** contrôlé dans Foundry **14.368**, Babele **2.9.1** : douze personnages, quinze objets, douze journaux, trois scènes, six dossiers et dix repères traduits. Liens résolus, journaux privés et biographies affichées sur les fiches. Documents de test supprimés après vérification.
- Le contrôle des textes importés tient compte de la normalisation HTML appliquée par Foundry, tout en comparant le texte affiché. Les tests Node vérifient en plus les balises et UUID avant import.
- **2 017 vérifications Foundry réussies**, sans exception JavaScript : import de l’aventure, traductions des compendiums existants, recherche, fiches, fonctionnement des atouts traduits et retour à l’anglais. Rapport dans `artifacts/foundry-results.json`.
- Archive installable v1.2.0 construite et contrôlée ; traduction de l’aventure et convertisseur inclus.

## Validation historique de la version 1.1.0

Vérifiée le 6 octobre 2026 sur Foundry VTT **14.368**, système **0.3.0**, Babele **2.9.1** et libWrapper **1.13.5.1**, dans le monde jetable `tg-qa`, avec les compendiums reconstruits depuis les sources du système.

- 336 clés d’interface contrôlées ; paramètres `{…}` conservés.
- 83 entrées, six compendiums et sept fichiers Babele : noms, descriptions, notes, notes dynamiques et effets, titres et dossiers.
- Identifiants de documents, clés des dossiers et mappings identiques aux modèles anglais ; aucune propriété mécanique ajoutée aux traductions.
- Quatre tests Node : couverture Babele, doublons de noms, enregistrement, visibilité française, groupes de compendium v14 et manifeste.
- 467 vérifications dans Chromium et Foundry : documents et index français, champs éditables des fiches, recherche française, dossiers, import, identifiants mécaniques, bonus de blocage de Robuste, création de personnage et retour à l’anglais.
- Affichage Babele des noms d’origine désactivé malgré une préférence antérieure active ; option masquée en français ; aucun volet de texte d’origine.
- Aucune exception JavaScript pendant la vérification finale. Rapport et capture dans `artifacts/`.
- Les deux groupes du système bénéficient d’un complément de traduction en mémoire pour la collection de dossiers de compendium de Foundry 14, que Babele 2.9.1 ne traite pas directement.

Les compendiums d’origine ne sont pas traduits sur disque. Les objets importés conservent leur texte français lors d’un changement de langue ; les contenus personnalisés ne sont pas réécrits.

## Validation historique de la version 1.0.0

Vérifiée le 6 octobre 2026 sur Foundry VTT **14.368**, système **0.2.1**, dans le monde jetable `tg-qa`.

- 312 clés d’interface contrôlées automatiquement ; tous les paramètres `{…}` des messages sont conservés.
- 83 entrées de compendium contrôlées : noms, descriptions, notes et effets personnalisés non vides.
- 5 tests Node : correspondances exactes, conservation des formules et textes personnels, listes d’atouts, compatibilité et présence des fichiers du manifeste.
- 97 vérifications dans Chromium et Foundry : activation du module, dictionnaire français, fiches des 83 entrées, aperçu français des descriptions, noms canoniques, listes de création, étiquettes de compendium et retour à l’anglais.
- Aucune exception JavaScript relevée pendant la vérification dans Foundry.
- Captures de la création de personnage et d’une fiche d’atout inspectées.
- Archive ZIP contrôlée : neuf fichiers distribués, chemins corrects, intégrité valide, manifestes `module.json` et `manifest.json` identiques.

La vérification porte sur la traduction et la conservation des données utilisées par les règles. Elle ne remplace pas les tests de l’ensemble des mécaniques du système. Les recherches dans les compendiums et les champs d’identifiants saisis à la main restent en anglais ; les textes personnalisés ne sont pas traduits.
