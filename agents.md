# AGENTS.md

## Présentation du projet

Ce dépôt contient le **portfolio personnel** de son propriétaire. Il a pour but de mettre en avant :

- son **CV** ;
- ses **compétences** ;
- ses **expériences** professionnelles ;
- ses projets, formations et toute autre information utile pour se présenter (contact, liens, etc.).

Le portfolio doit être clair, soigné et facile à parcourir : c'est une vitrine professionnelle.

## Hébergement

Le portfolio est hébergé sur **GitHub Pages**. Les contraintes suivantes en découlent :

- le site doit rester **statique** (HTML, CSS, JavaScript côté client), sans backend ;
- les chemins vers les ressources (images, CSS, JS) doivent fonctionner depuis l'URL de GitHub Pages (privilégier les chemins relatifs) ;
- la branche `main` est celle qui est publiée.

## Design

Le style visuel du site est décrit dans [`design.md`](./design.md) (couleurs, typographie, espacements, composants, mouvement). Toute modification d'interface doit respecter cette référence.

## Consignes pour les agents

- Garder le contenu orienté vers la mise en valeur du CV, des compétences et des expériences.
- Ne pas introduire de dépendance ou d'outil qui empêche un déploiement statique sur GitHub Pages.
- Ne pas committer de données sensibles (coordonnées privées, secrets, clés).
- Ne pousser que sur la branche de travail indiquée, et ne créer une pull request que sur demande explicite.
