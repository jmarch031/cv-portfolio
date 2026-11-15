# AGENTS.md

## Présentation du projet

Ce dépôt contient le **portfolio personnel** de Julien Marchand (Lead Software Engineer chez Decathlon Digital). C'est une vitrine premium, immersive et très animée, qui doit faire comprendre en quelques secondes qui il est, puis mettre en avant :

- son **histoire** : développeur, puis leader d'équipes, puis retour au code ;
- ses **compétences** (AI engineering, back-end, full-stack, architecture, leadership, management, agilité) ;
- son **parcours** complet (8 postes, 5 entreprises) ;
- sa **formation**, sa certification et ses langues ;
- les **recommandations** reçues, et un moyen simple de le **contacter**.

Ambition : un niveau de finition digne d'une candidature Awwwards, sans effet gadget.

## Hébergement

Le portfolio est hébergé sur **GitHub Pages** (`https://jmarch031.github.io/cv-portfolio/`). Les contraintes suivantes en découlent :

- le site doit rester **statique** (HTML, CSS, JavaScript côté client), sans backend ;
- le build Vite utilise `base: '/cv-portfolio/'` (voir `vite.config.ts`) : les ressources doivent passer par Vite ou être référencées en chemins relatifs ;
- la branche `main` est publiée automatiquement par `.github/workflows/deploy.yml` (`npm run build` → `dist/`).

## Stack

- **Vite + TypeScript** (pas de framework UI).
- **GSAP 3** avec **ScrollTrigger** et **SplitText** pour toutes les animations ; **Lenis** pour le smooth scroll (synchronisé sur le ticker GSAP).
- Visuels : petit moteur **WebGL** maison (`src/motion/shader.ts`, « liquid light » + lentille de verre), trois surfaces (Hero, Histoire, Contact) qui ne tournent que lorsqu'elles sont visibles, avec repli CSS si WebGL est indisponible.
- Polices : **Inter** (substitut documenté de Roobert) et **Raleway** pour un unique titre d'accent, via Google Fonts.
- Tests : **Vitest** + jsdom (`npm run test:run`). Un hook Husky lance les tests au commit.

## Structure

```
index.html                       Coquille : intro, rideau, header, #app (tout le reste est rendu en TS)
src/content/types.ts             Modèle de contenu
src/content/fr.ts, en.ts         Tout le texte du site, une structure identique par langue (test)
src/data/recommendations.json    Recommandations LinkedIn (texte original FR + extrait verbatim)
src/render.ts                    Gabarits HTML des sections (texte échappé via esc())
src/main.ts                      Orchestration : rendu, Lenis, intro, animations, changement de langue
src/motion/intro.ts              Intro : les rôles de la carrière défilent, puis la Hero s'ouvre
src/motion/scroll.ts             Toutes les animations ScrollTrigger (dans un gsap.context)
src/motion/interactions.ts       Curseur, pilules magnétiques, navigation, compétences, recommandations
src/motion/shader.ts             Liquide lumineux WebGL (palette, lentille, thème clair/sombre)
src/style.css                    Tokens design.md + styles
public/cv-julien-marchand.pdf    Export LinkedIn téléchargeable (lien « CV »)
```

Sections, dans l'ordre : Hero « Retour au code. » → Bonjour (présentation) → Histoire (3 actes épinglés) → En chiffres → Savoir-faire → Parcours (liste + panneau collant) → Formation → Recommandations → Contact.

## Contenu

- **Ne rien inventer.** La source de vérité est l'export LinkedIn (`Julien Marchand Profile.pdf`, à remplacer par chaque nouvel export, et à copier dans `public/cv-julien-marchand.pdf`). Les reformulations et traductions sont permises, pas les faits nouveaux (chiffres, dates, missions, clients, technologies).
- Toute modification de texte se fait dans `src/content/fr.ts` **et** `src/content/en.ts` (un test vérifie qu'ils ont la même structure, les mêmes entreprises et les mêmes années).
- Les extraits de recommandations doivent être des citations exactes du texte original (test).

## Design

Le style visuel est décrit dans [`design.md`](./design.md), avec deux écarts voulus par le propriétaire du site :

- **Thèmes sombre et clair**, au choix du visiteur, **sombre par défaut** (`data-theme` sur `<html>`, mémorisé dans `localStorage`, appliqué avant le premier rendu par le script de `index.html`). Plus d'alternance de bandes noires et blanches.
- **La couleur iridescente circule dans tout le site** (inspiration monopo.vn), pas seulement dans la Hero : liquide lumineux WebGL avec sphère de verre (Hero, Histoire avec une palette par acte, Contact), traînées de lumière (`.glow`) qui dérivent dans les sections, texte iridescent (`.iri`) pour quelques accents (chiffres, fin du titre de contact, compétence ouverte), barres de progression et filets dégradés.

Le reste de `design.md` s'applique toujours :

- les **contrôles restent monochromes** (pilules, liens, navigation) : la couleur est de la lumière, jamais un bouton ;
- rayons de **0px** partout, sauf les pilules / tags (**75px**) ; aucune ombre ;
- grands titres en graisse **300 ou 400** uniquement ;
- toute nouvelle couleur passe par les tokens `--sage`, `--amber`, `--oxblood` et `--iri` (dont une variante plus soutenue pour le thème clair, pour le contraste).

## Animations

- Courbe signature `cubic-bezier(0.19, 1, 0.22, 1)` (≈ `expo.out` dans GSAP), durées longues (0,8 à 1,6 s) : les éléments glissent, ils ne claquent pas.
- Le changement de langue re-rend toute la page : les ScrollTrigger vivent dans des `gsap.context` (`initScroll()` puis les interactions) et les écouteurs sont liés à un `AbortSignal`, pour tout détruire et reconstruire proprement. Les triggers des bandes clair/sombre et des interactions sont créés **après** les sections épinglées (Hero, Histoire) pour que leurs positions intègrent l'espace d'épinglage.
- Une même propriété d'un même élément ne doit être animée que par un seul tween ou une seule timeline (sinon les valeurs de départ se mélangent).
- L'Histoire n'est épinglée que si l'écran fait au moins 620px de haut ; sinon les actes s'empilent (`.story.is-static`).
- `prefers-reduced-motion: reduce` doit toujours donner un site lisible et statique.
- Ne pas mettre de `transition` CSS sur une propriété animée par GSAP (conflit sur `transform`).

## Consignes pour les agents

- Vérifier `npm run build` et `npm run test:run` avant de proposer un changement ; contrôler visuellement (desktop et mobile) toute modification d'interface.
- Ne pas introduire de dépendance ou d'outil qui empêche un déploiement statique sur GitHub Pages.
- Ne pas committer de données sensibles (secrets, clés, coordonnées privées autres que celles déjà publiques sur le site).
- Ne pousser que sur la branche de travail indiquée, et ne créer une pull request que sur demande explicite.
