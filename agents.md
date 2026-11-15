# AGENTS.md

## Présentation du projet

Ce dépôt contient le **portfolio personnel** de Julien Marchand (Lead Software Engineer). Il a pour but de faire comprendre rapidement qui il est et de mettre en avant :

- son **parcours** et ses **expériences** professionnelles ;
- ses **compétences** (technique, IA, produit, leadership) ;
- ses **écrits** (articles Medium) et projets ;
- sa **formation**, ses certifications et ses langues ;
- les **recommandations** reçues, et un moyen simple de le **contacter**.

Le portfolio doit rester clair, soigné et facile à parcourir : c'est une vitrine professionnelle.

## Hébergement

Le portfolio est hébergé sur **GitHub Pages** (`https://jmarch031.github.io/cv-portfolio/`). Les contraintes suivantes en découlent :

- le site doit rester **statique** (HTML, CSS, JavaScript côté client), sans backend ;
- le build Vite utilise `base: '/cv-portfolio/'` (voir `vite.config.ts`) : les ressources doivent passer par Vite ou être référencées en chemins relatifs ;
- la branche `main` est publiée automatiquement par `.github/workflows/deploy.yml` (`npm run build` → `dist/`).

## Stack

- **Vite + TypeScript** (pas de framework UI).
- **GSAP 3** avec **ScrollTrigger** et **SplitText** pour toutes les animations ; **Lenis** pour le smooth scroll (synchronisé sur le ticker GSAP).
- Fond de la Hero : petit shader **WebGL** maison (`src/scripts/shader.ts`), avec repli CSS si WebGL est indisponible.
- Police : **Inter** (Google Fonts), substitut documenté de Roobert.
- Tests : **Vitest** + jsdom (`npm run test:run`). Un hook Husky lance les tests au commit.

## Structure

```
index.html                    Structure de toutes les sections (textes par défaut en FR)
public/locales/{fr,en}.json   Tous les textes traduits (clés data-i18n) — mêmes clés dans les deux fichiers
src/data/recommendations.json Recommandations LinkedIn
src/style.css                 Tokens (design.md) + styles de toutes les sections
src/main.ts                   Orchestration : i18n, Lenis, intro, animations, changement de langue
src/scripts/animations.ts     Intro (preloader + reveal de la Hero) et animations au scroll
src/scripts/interactions.ts   Curseur, boutons magnétiques, navigation, accordéon du parcours
src/scripts/shader.ts         Fond iridescent de la Hero
src/scripts/i18n.ts           Application des traductions + effet "text roll" des liens
src/scripts/recommendations.ts Rendu des recommandations
```

## Contenu

- **Ne rien inventer.** Les sources de vérité sont l'export LinkedIn (`Julien Marchand Profile.pdf`, à mettre à jour avec les nouveaux exports) et le contenu existant du site. Les reformulations sont permises, pas les faits nouveaux (chiffres, dates, missions, clients).
- Tout texte visible passe par une clé `data-i18n` présente dans **les deux** fichiers de locales (un test le vérifie).
- Les valeurs de locale peuvent contenir du HTML de confiance (listes `ul.bullets`) ; les données externes (recommandations) sont insérées via `textContent`.

## Design

Le style visuel est décrit dans [`design.md`](./design.md). Toute modification d'interface doit le respecter, en particulier :

- interface strictement **noir / blanc / gris** ; la seule couleur est le fond iridescent de la Hero (média, jamais un contrôle) ;
- rayons de **0px** partout, sauf les boutons / tags en pilule (**75px**) ; aucune ombre ;
- grands titres en graisse **300 ou 400** uniquement ;
- alternance de bandes claires et sombres : les sections avec `data-theme-band="dark"` font basculer toute la page en sombre (classe `is-dark` sur `body`).

## Animations

- Courbe signature `cubic-bezier(0.19, 1, 0.22, 1)` (≈ `expo.out` dans GSAP), durées longues (0,8 à 1,6 s) : les éléments glissent, ils ne claquent pas.
- Toutes les ScrollTrigger sont créées dans `initScrollAnimations()` (un `gsap.context`) pour pouvoir être détruites et recréées au changement de langue. Les triggers des bandes clair/sombre sont créés **en dernier** pour tenir compte de l'espace ajouté par la section épinglée (Expertise).
- Le défilement horizontal de l'Expertise n'est actif qu'au-dessus de 960px (`gsap.matchMedia`).
- `prefers-reduced-motion: reduce` doit toujours donner un site lisible et statique.
- Ne pas mettre de `transition` CSS sur une propriété animée par GSAP (conflit sur `transform`).

## Consignes pour les agents

- Vérifier `npm run build` et `npm run test:run` avant de proposer un changement ; contrôler visuellement (desktop et mobile) toute modification d'interface.
- Ne pas introduire de dépendance ou d'outil qui empêche un déploiement statique sur GitHub Pages.
- Ne pas committer de données sensibles (secrets, clés, coordonnées privées autres que celles déjà publiques sur le site).
- Ne pousser que sur la branche de travail indiquée, et ne créer une pull request que sur demande explicite.
