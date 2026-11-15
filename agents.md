# AGENTS.md

## Présentation du projet

Ce dépôt contient le **portfolio personnel** de Julien Marchand (Lead Software Engineer chez Decathlon Digital). C'est une vitrine premium, immersive et très animée, qui doit faire comprendre en quelques secondes qui il est, puis mettre en avant :

- son **histoire** : développeur, puis leader d'équipes, puis retour au code ;
- ses **compétences** (AI engineering, back-end, full-stack, architecture, leadership, management, agilité) ;
- son **parcours** complet (8 postes, 5 entreprises) ;
- ses **écrits** (articles Medium) et **projets personnels** ;
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

Sections, dans l'ordre : Hero « Retour au code. » → Bonjour (présentation) → Histoire (3 actes épinglés) → En chiffres → Savoir-faire → Parcours (liste + panneau collant) → Écrits & projets → Formation → Recommandations → Contact.

## Contenu

- **Ne rien inventer.** Les sources de vérité sont l'export LinkedIn (`Julien Marchand Profile.pdf`, à remplacer par chaque nouvel export, et à copier dans `public/cv-julien-marchand.pdf`). Les articles Medium et les projets perso viennent du propriétaire du site. Le bot de trading est décrit d'après son dépôt (`jmarch031/btc-bot`) : **ne pas mettre de lien vers ce dépôt** ni de chiffres de performance. Les reformulations et traductions sont permises, pas les faits nouveaux (chiffres, dates, missions, clients, technologies).
- Précision du propriétaire (prime sur LinkedIn) : California State University San Marcos était une **année d'échange** validant la 4ᵉ année d'EPITECH, pas un diplôme distinct.
- Les chiffres de « En chiffres » doivent se déduire des dates et du texte LinkedIn (ex. 12 ans depuis l'alternance de 2014, 7 ans chez Decathlon Digital) et être recalculés à chaque nouvel export.
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
- Pas de `snap` ScrollTrigger : il entre en conflit avec Lenis et fige les animations. Dans les sections épinglées (Histoire, Parcours), le **changement d'étape est déclenché** (il se joue toujours en entier, où que le scroll s'arrête) et seul le mouvement à l'intérieur d'une étape suit le scroll (`scrub`) : mots qui s'allument, numéro et lentille qui dérivent, détail du poste qui défile.
- Une animation pilotée par le scroll (`scrub`) doit se terminer à une position atteignable (attention à la dernière section).
- Un dégradé `background-clip: text` ne traverse pas les enfants transformés : sur un texte découpé par SplitText, appliquer le dégradé lettre par lettre.

- Les déclencheurs situés sous une section épinglée doivent tenir compte de son espace : les pins ont un `refreshPriority` plus élevé. L'activité des canvases WebGL est pilotée par `IntersectionObserver`, pas par des positions de scroll.
- **Parcours** : rien n'est imposé par le scroll. Le visiteur choisit le poste à lire (clic) ; panneau collant sur desktop, accordéon sur mobile.
- **Savoir-faire** : chaque compétence liste les rôles et périodes où elle a été appliquée (d'après LinkedIn) et indique si elle est toujours d'actualité.

## Images

- `public/portrait.webp` (+ `portrait-400.webp`) : photo de profil LinkedIn, affichée dans la section « Bonjour ».
- `public/covers/*.webp` : une vignette par écrit ou projet (champ `cover` dans `src/content`). Celle du portfolio est une vraie capture de la Hero ; les autres sont des illustrations abstraites dans la palette iridescente. Les remplacer par de vraies couvertures si le propriétaire en fournit.
- `public/og.jpg` (1200×630) : image de partage ; `favicon.svg` et `apple-touch-icon.png`.
- Images à angles droits (0px), sans ombre ; toujours `width`/`height` et `loading="lazy"` hors du premier écran.
- Les recommandations sont en français d'origine ; `src/data/recommendations.json` contient aussi leur traduction anglaise (`*_en`), affichée en anglais avec la mention « translated from French ».
- Thème clair : fond papier chaud `#f6f3ee`, pas de blanc pur ; le liquide y vire à l'ambre et à la sauge plutôt qu'au rose.

## Performance

- Les surfaces WebGL ne tournent que lorsqu'elles sont visibles. Sur mobile et tablette (`pointer: coarse` ou largeur < 800px), elles passent en version allégée : tampon plus petit, un seul échantillon dans la lentille, 30 images par seconde.
- Sur écrans tactiles : pas de `filter: blur`, de `mix-blend-mode` ni de `backdrop-filter` ; zones tactiles d'au moins ~44px.
- N'animer que `transform` et `opacity` ; pas de `content-visibility` (cela fausse les positions ScrollTrigger).

## Responsive

- Le site doit être parfait de 320px à 1920px+, en portrait comme en paysage, en français comme en anglais (les textes anglais et français n'ont pas la même longueur).
- Contrôle minimal avant de livrer : aucun débordement horizontal (`scrollWidth === clientWidth`) à 320, 360, 390, 768, 1024, 1280, 1440, 1920 et 844×390, et chaque acte de l'Histoire tient entre l'en-tête et la barre de progression quand il est épinglé.
- Les effets de survol sont réservés à `(hover: hover)` ; l'Histoire ne s'épingle que si la hauteur d'écran le permet.

## Consignes pour les agents

- Vérifier `npm run build` et `npm run test:run` avant de proposer un changement ; contrôler visuellement (desktop et mobile) toute modification d'interface.
- Ne pas introduire de dépendance ou d'outil qui empêche un déploiement statique sur GitHub Pages.
- Ne pas committer de données sensibles (secrets, clés, coordonnées privées autres que celles déjà publiques sur le site).
- Ne pousser que sur la branche de travail indiquée, et ne créer une pull request que sur demande explicite.
