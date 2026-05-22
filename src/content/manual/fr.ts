import type { ManualSection, ManualCategory } from './types';

export const categoriesFR: ManualCategory[] = [
  { id: 'introducere', label: 'Premiers pas', order: 1 },
  { id: 'calculatoare', label: 'Configurateurs 3D', order: 2 },
  { id: 'vanzari', label: 'Ventes', order: 3 },
  { id: 'productie', label: 'Production', order: 4 },
  { id: 'operational', label: 'Opérationnel', order: 5 },
  { id: 'setari', label: 'Paramètres', order: 6 },
];

export const sectionsFR: ManualSection[] = [
  {
    id: 'getting-started', category: 'introducere', roles: ['all'], order: 1,
    title: 'Bienvenue dans iSoftGlass',
    image: '/manual/setari-companie.png',
    imageAlt: 'Écran iSoftGlass — Informations sur l\'entreprise',
    content: `# Bienvenue dans iSoftGlass

iSoftGlass est la plateforme **SaaS** pour les fabricants et distributeurs de verre. Elle couvre l'ensemble du flux : configuration 3D → offre → commande → production → livraison → service.

## Ce que vous pouvez faire en 5 minutes

1. **Complétez les données de votre entreprise** dans *Paramètres → Entreprise* (CUI, adresse, IBAN, logo).
2. **Vérifiez les prix** dans *Paramètres → Prix* — le catalogue standard est chargé automatiquement, vous n'ajustez que ce qui diffère.
3. **Ajoutez votre premier client** dans *Clients → Nouveau client* (ou laissez-le se créer automatiquement lors de la sauvegarde de la première offre).
4. **Ouvrez un configurateur 3D** depuis le menu latéral (ex. : *Cabines de douche*) et configurez en 6 étapes.
5. **Enregistrez en tant qu'offre** — elle apparaît dans *Commandes* avec un PDF prêt à être envoyé.
6. **Envoyez en production** lorsque le client confirme — le stock est déduit automatiquement.`,
    tips: [
      'La barre supérieure dispose d\'un sélecteur RON / EUR — les prix internes sont toujours en RON, il s\'agit uniquement d\'un affichage.',
      'Cliquez sur l\'icône 📖 (bleu sarcelle) à tout moment pour rouvrir ce manuel exactement à la section actuelle.',
    ],
  },
  {
    id: 'header-icons', category: 'introducere', roles: ['all'], order: 2,
    title: 'Barre supérieure et raccourcis',
    content: `# Barre supérieure

Dans le coin supérieur droit, vous avez toutes les commandes globales :

1. 🔔 **Cloche jaune (ambre)** — annonces et nouveautés publiées par l'équipe iSoftGlass. Le nombre rouge = annonces non lues.
2. 📖 **Manuel (contour bleu sarcelle)** — le manuel que vous consultez actuellement. Il s'ouvre sur la section pertinente pour la page en cours.
3. **RON / EUR** — change la devise affichée dans toute l'application. La conversion utilise le taux de change de *Paramètres → Entreprise*.
4. **🇷🇴 RO** — sélecteur de langue. Nous prenons en charge 9 langues (RO, EN, IT, DE, PL, FR, ES, NL, HR).
5. **Logout** — déconnexion sécurisée du compte.

## Barre latérale — menu de gauche

- **Principal** — Tableau de bord, Configurateurs 3D, Paramètres
- **Opérationnel** — Commandes, Production, Scanner, Clients, Rapports, Pose
- Cliquez sur le bouton **⬅** à côté du logo pour réduire la barre latérale (plus d'espace à l'écran).`,
    tips: [
      'Le stockage interne des prix est toujours en RON — le passage à l\'EUR n\'est qu\'un affichage.',
      'Le changement de langue n\'affecte que l\'interface ; les données saisies restent dans la langue d\'origine.',
    ],
  },
  {
    id: 'calc-flow-6-steps', category: 'calculatoare', roles: ['all'], order: -1,
    title: 'Les 6 étapes d\'un configurateur 3D',
    image: '/manual/calc-step6-finalizare.png',
    imageAlt: 'Étape 6 - finalisation de l\'offre avec les données client et les boutons PDF/Enregistrer/Ajouter au panier',
    content: `# Les 6 étapes d'un configurateur 3D

Tout configurateur 3D (cabine de douche, porte, garde-corps, miroir, crédence de cuisine, panneau) suit **le même flux linéaire en 6 étapes**. À chaque étape, vous avez à droite la visualisation 3D qui se met à jour en temps réel, et la progression est marquée dans la barre supérieure.

---

## Étape 1 — Type de produit

Vous choisissez la forme ou la typologie (ex. : **Angle 90°**, **Walk-in / Niche**, **Pentagone**, **Paroi de baignoire**, **Panneau fixe**). Chaque type précharge la géométrie de base et la liste des profilés appropriés.

![Étape 1 - sélection du type de produit](/manual/calc-step1-tip.png)

## Étape 2 — Système d'ouverture

Vous choisissez le mode d'opération : **à charnières** (classique), **pivot** haut-bas (minimaliste) ou **coulissant** sur rail (gain de place). Votre sélection ici détermine automatiquement les accessoires que vous pourrez ajouter à l'étape 5.

![Étape 2 - système d'ouverture](/manual/calc-step2-dimensiuni.png)

## Étape 3 — Verre

Vous définissez l'**épaisseur** (6/8/10/12 mm), la **finition** (transparent, gris, bronze, sablé) et les options : **traitement anti-calcaire**, **polissage des bords**, **trempe**, **lamination**. Le prix du verre est recalculé instantanément.

![Étape 3 - choix du verre](/manual/calc-step3-sticla.png)

## Étape 4 — Configuration de la porte & dimensions

Vous définissez le **côté d'ouverture** (frontal / latéral), la **direction** (intérieur / extérieur), le **côté de la charnière** (gauche / droite) et les **dimensions** finales (largeur × hauteur × profondeur). Cliquez sur n'importe quelle cote dans la scène 3D pour une édition rapide (Entrée / Tabulation enregistre).

![Étape 4 - porte et dimensions](/manual/calc-step4-profile.png)

## Étape 5 — Profilés & accessoires

Vous choisissez parmi des listes personnalisées : **profilés de joint**, **profilés en U / de périmètre**, **barres de stabilisation**, **kits supplémentaires**. Pour tous les détails sur le fonctionnement de cette étape, consultez la section **« Comment fonctionnent les accessoires dans les configurateurs »**.

![Étape 5 - profilés et accessoires](/manual/calc-step5-accesorii.png)

---

## Étape 6 — Finalisation de l'offre (détaillé)

Ici, vous transformez la configuration en action commerciale. L'étape 6 comporte 3 zones claires : **données client**, **montant supplémentaire & total**, **boutons d'action**.

![Étape 6 - finalisation](/manual/calc-step6-finalizare.png)

### Données client (Client info)

- **Type de Client** — Particulier / Entreprise / Distributeur. **Très important** : le type choisi ici applique automatiquement la majoration configurée dans **Paramètres → Majorations Clients**, le prix affiché tient donc déjà compte de la marge par type.
- **Nom du client** — le nom qui apparaît sur l'offre et le PDF.
- **Téléphone** & **Email** — coordonnées utilisées dans le CRM et pour l'envoi de l'offre.

> Lors de l'enregistrement, si le nom du client n'existe pas dans la base CRM, le système **crée automatiquement une nouvelle fiche**. S'il existe, il utilise la fiche existante (correspondance par nom).

### Montant supplémentaire (Extra amount)

Le champ **« Extra amount » / « Montant supplémentaire »** vous permet d'ajouter un montant libre au sous-total calculé. À quoi sert-il en pratique :

- **Transport** vers le client (ex : +150 RON pour la livraison).
- **Pose supplémentaire** au-delà du forfait standard.
- **Main-d'œuvre spéciale** (ex : perçage dans le granit, pièces non standard).
- **Surtaxe d'urgence** lorsque le travail doit être exécuté en priorité.
- **Remise commerciale** — vous saisissez une valeur **négative** (ex : -50 RON) et elle est déduite du total.

Le montant s'ajoute au sous-total **avant** TVA et apparaît séparément sur le PDF, de manière transparente pour le client.

### Sous-total, TVA et total

La carte affiche en temps réel : **Sous-total (hors TVA)**, **TVA %** (depuis les paramètres) et **Total TTC**. La modification de n'importe quel paramètre (verre, accessoire, montant supplémentaire) recalcule instantanément.

### Les 3 boutons d'action

1. **Télécharger le PDF** — génère l'offre PDF (logo de l'entreprise, données client, liste de produits avec un aperçu 3D de 70×47 px, accessoires regroupés par code, main-d'œuvre, total TTC). **Utilisé pour** un envoi rapide par e-mail / WhatsApp, **sans** enregistrer dans le système. Utile lorsque vous souhaitez seulement un devis indicatif.

2. **Enregistrer l'offre** — crée dans la base de données une offre avec un numéro **OFR-YYYYMMDD-HHMMSS** et une **commande avec le statut « Offre »**. **Utilisé lorsque** l'offre est ferme et que vous souhaitez la retrouver plus tard dans **Commandes**, la rééditer ou la transformer en commande ferme.

3. **Ajouter au panier** — ajoute le produit actuel au **panier actif** (icône en bas à droite avec un compteur) **sans** finaliser la commande. **Utilisé pour** les offres avec plusieurs produits : ex. douche + miroir + crédence de cuisine pour le même client — vous les ajoutez un par un, puis finalisez l'ensemble du panier en une seule commande.

---

## Que se passe-t-il après « Ajouter au panier »

![Le panier avec les produits ajoutés](/manual/cos-flow.png)

### 1. Le panier (icône en bas à droite)

Cliquez sur l'icône du panier avec le compteur et le panneau latéral **Produits de la commande** s'ouvre :

- Liste tous les produits ajoutés, chacun avec ses **dimensions**, son **épaisseur de verre** et son **prix**.
- Boutons **+ / -** pour la quantité de chaque article.
- L'icône de **poubelle** rouge supprime l'article.
- Le bouton **« Empty » / « Vider »** supprime tout le panier.
- En bas : **Total de la commande** (somme de tous les produits).

### 2. Finaliser la commande

Vous appuyez sur **« Finalize » / « Finaliser »** et la boîte de dialogue **Créer la commande depuis le panier** s'ouvre :

![Boîte de dialogue de finalisation de la commande](/manual/cos-finalizare.png)

- **Produits du panier** — récapitulatif des produits du panier avec le total.
- **Client** — les données du client (reprises automatiquement du dernier produit ajouté).
- **Adresse de livraison** — adresse de livraison / de pose.
- **Date de livraison** — date estimée.
- **Notes** — observations internes.

Vous appuyez sur **Create Order** : le système génère un numéro de commande unique et place la commande dans la **Gestion des Commandes** avec le statut **« Offre »**.

### 3. Dans la Gestion des Commandes

La commande apparaît immédiatement dans la liste. À partir de là :

- **Téléchargez le PDF** consolidé (tous les produits regroupés, les accessoires totalisés par code).
- **Envoyez en production** — déduit automatiquement le stock, crée la fiche de production et la carte Kanban.
- **Émettez une facture** ou une **facture proforma (acompte)**.
- **Planifiez la pose** pour l'équipe d'installation.
- **Ouvrez la commande** (clic sur la ligne) pour accéder aux onglets **Détails / Produits / Historique / Aperçu**.

### 4. Édition ultérieure

Depuis l'onglet **Produits** d'une commande, le bouton **Éditer** vous renvoie au configurateur d'origine avec **toute la configuration restaurée** depuis \`full_config\` — y compris le type de client, le montant supplémentaire et les accessoires. Vous modifiez → Vous enregistrez → la commande se met à jour automatiquement.`,
    tips: [
      'À l\'étape 6, le changement de **Type de Client** entre Particulier / Entreprise / Distributeur recalcule instantanément l\'ensemble du sous-total avec la majoration correcte.',
      'Utilisez **Télécharger le PDF** pour des devis rapides par e-mail, et **Enregistrer l\'offre** uniquement lorsque l\'offre est ferme — vous éviterez de remplir l\'historique de brouillons.',
      'Le panier vous permet de configurer plusieurs produits pour le même client et de les envoyer dans une **seule commande** avec un PDF unique et consolidé.',
      'Toute la configuration (y compris le montant supplémentaire et le type de client) est enregistrée dans `full_config` — à la réouverture, tout revient exactement comme c\'était.',
    ],
    warnings: [
      'Le montant supplémentaire négatif (remise) NE vérifie PAS si le total passe en dessous de zéro — soyez attentif à la valeur.',
      'Si vous modifiez les prix dans les Paramètres **après** avoir enregistré une offre, les anciennes offres ne sont **pas** recalculées automatiquement — elles conservent leurs valeurs initiales.',
    ],
  },
  {
    id: 'accessory-flow', category: 'calculatoare', roles: ['all'], order: 0,
    title: 'Comment fonctionnent les accessoires dans les configurateurs',
    image: '/manual/accesorii-import.png',
    imageAlt: 'Catalogue d\'accessoires — bouton Importer dans ma liste',
    content: `# Comment fonctionnent les accessoires dans les configurateurs

Tous les configurateurs 3D (Cabine de douche, Portes, Garde-corps, Miroir, Crédence de cuisine, Cloisons) utilisent **le même système** pour les accessoires : charnières, poignées, profilés en U, barres de stabilisation, kits coulissants, butées, serrures, etc.

La logique est simple et se fait **une seule fois** :

> **Vous importez depuis le catalogue → ils sont mémorisés dans « Sélectionner un produit » → vous les utilisez partout, dans n'importe quelle offre.**

Vous n'avez pas besoin de rechercher l'accessoire à nouveau pour chaque projet — une fois importé, il reste dans votre liste personnelle jusqu'à ce que vous décidiez de le retirer.

---

## Étape 1 — Ouvrir le catalogue d'accessoires

Allez dans **Paramètres → Prix → Accessoires** (ou directement **Paramètres → Catalogue d'accessoires**, selon la version de l'interface).

Ici, vous voyez le catalogue global du système — des milliers de codes regroupés par catégories : charnières, poignées, profilés en U, kits coulissants, joints, barres de stabilisation, butées, serrures, supports, capuchons.

![Catalogue d'accessoires](/manual/accesorii-import.png)

- Utilisez la **recherche transversale** (en haut) — recherchez par code, nom ou finition, dans toutes les catégories.
- Les filtres latéraux affinent par catégorie / sous-catégorie.

## Étape 2 — Importer les accessoires dont vous avez besoin

Sur la ligne de chaque accessoire du catalogue, vous avez un bouton **« Importer »** (ou « Ajouter à ma liste »). Cliquez dessus — l'accessoire est immédiatement ajouté à **votre liste personnelle**, isolée par entreprise (RLS strict).

Cochez plusieurs lignes et appuyez sur **« Importer la sélection »** pour ajouter un groupe entier (ex. : tout le jeu de charnières pour les cabines de douche).

> **Vous ne faites cela qu'une seule fois.** Après l'importation, l'accessoire est disponible pour tous les utilisateurs de l'entreprise, dans tous les configurateurs.

## Étape 3 — Vérifier les prix et les unités

Dans votre liste locale, chaque accessoire affiche :

- **Code** et **dénomination** (repris du catalogue).
- **Prix** (vous pouvez définir votre propre surcharge — cela n'affecte pas le catalogue global).
- **Unité** (pce, ml, set) — prend également en charge les valeurs décimales pour les ml.
- **Finition** disponible (chrome, mat, brossé, etc.).

Modifiez le prix directement dans la cellule — il est enregistré automatiquement et apparaît immédiatement dans les configurateurs.

## Étape 4 — Dans le configurateur, ouvrez « Sélectionner un produit »

Vous entrez dans un configurateur (ex. : **Cabines de douche**), vous arrivez à l'étape **Accessoires** (charnières, poignée, profilé en U, barre, etc.).

Pour chaque emplacement, le menu déroulant **« Sélectionner un produit »** n'affiche **que les accessoires que vous avez importés** — limité au type approprié (ex. : pour l'emplacement Poignée, vous ne voyez que des poignées).

![Menu déroulant Sélectionner un produit dans le configurateur](/manual/accesorii-selecteaza-produs.png)

- La liste est épurée : vous ne vous perdez pas dans des milliers de codes non pertinents.
- Recherche rapide dans le menu déroulant par code ou dénomination.

## Étape 5 — Ajuster la quantité et la finition

Après avoir choisi l'accessoire :

- **Quantité** — pour les charnières, vous pouvez en choisir 2 ou 3 (votre choix fait autorité, il remplace la règle automatique).
- **Finition** — couleur/finition parmi les variantes disponibles (avec repli sur le parent si la variante exacte manque).
- **Position** — les charnières se mesurent de haut en bas, la poignée de bas en haut (convention du secteur, déjà préconfigurée).

## Étape 6 — Enregistrer la configuration → les accessoires entrent dans l'offre

Vous appuyez sur **« Enregistrer comme offre »** ou **« Ajouter au panier »**. Les accessoires sélectionnés :

1. Sont attachés au produit avec leur prix en RON (affichage convertible en EUR).
2. Apparaissent dans l'**Aperçu de la commande (OrderPreview)** et dans le PDF de l'offre, regroupés automatiquement par code (même code = somme des quantités).
3. Sont mémorisés dans le JSON \`full_config\` — la source de vérité pour le PDF, le DXF et l'édition ultérieure.
4. Lors de l'envoi en production, le **stock diminue automatiquement** en fonction des quantités de l'offre.

![Accessoire ajouté à l'offre](/manual/accesorii-in-oferta.png)`,
    tips: [
      'Vous importez une seule fois — ensuite, les accessoires restent dans « Sélectionner un produit » pour tous les collègues de l\'entreprise.',
      'Les prix peuvent être surchargés localement (override par entreprise) sans affecter le catalogue système.',
      'Vous utilisez le même flux dans TOUS les configurateurs : douche, portes, garde-corps, miroir, crédence de cuisine, parois.',
    ],
    warnings: [
      'Si vous retirez un accessoire de votre liste personnelle, les anciennes offres restent valides (la configuration est enregistrée dans `full_config`), mais vous ne pourrez plus le sélectionner dans de nouveaux projets tant que vous ne l\'aurez pas réimporté.',
    ],
  },
  {
    id: 'calc-shower', category: 'calculatoare', roles: ['all'], order: 1,
    title: 'Configurateur de Cabine de Douche',
    image: '/manual/calc-dus.png',
    imageAlt: 'Configurateur 3D de cabine de douche',
    content: `# Configurateur de Cabine de Douche

Configurez visuellement en 3D tout type de cabine : angle 90°, walk-in, pentagone, baignoire, panneau fixe.

## Les 6 étapes

1. **Type de cabine** — vous choisissez la forme (angle 90°, niche, pentagone, paroi de baignoire, fixe).
2. **Dimensions** — cliquez sur la cote dans la scène 3D pour la modifier (Entrée / Tabulation enregistre).
3. **Verre** — épaisseur (8/10/12 mm), finition (clair, gris, bronze), trempe optionnelle.
4. **Profilés** — en U, mural, d'angle 90°, kit coulissant (le cas échéant).
5. **Accessoires** — charnières (2 ou 3), poignée, barre de stabilisation, joints.
6. **Enregistrer** — en tant qu'offre ou directement comme nouveau projet.`,
    tips: [
      'Les charnières se mesurent de **haut en bas**, et la poignée de **bas en haut** — c\'est la convention du secteur.',
      'Le panneau fixe N\'A PAS de déduction implicite de 10 mm — uniquement les profilés + les joints cumulés.',
      'Le système coulissant ne nécessite pas de charnières et calcule automatiquement le chevauchement à partir du kit.',
    ],
    warnings: [
      'Pour un angle de 90°, les profilés en U sont forcés d\'être masqués à l\'intersection pour éviter la duplication.',
    ],
  },
  {
    id: 'calc-door', category: 'calculatoare', roles: ['all'], order: 2,
    title: 'Configurateur de Portes en Verre',
    image: '/manual/calc-usa.png',
    imageAlt: 'Configurateur 3D de porte en verre',
    content: `# Configurateur de Portes

Pour les portes intérieures à charnières, à pivot ou coulissantes sur rail.

## Étapes

1. **Système** — À charnières, Pivot haut-bas, Coulissant sur rail.
2. **Dimensions** — largeur, hauteur, ouverture de la porte.
3. **Verre** — épaisseur et finition.
4. **Joints latéraux** — array \`lateralSelections\` avec des options séparées gauche/droite/haut/bas.
5. **Découpes** — pour la poignée ou la serrure (seuil > 50 mm = grande, ≤ 50 mm = petite).
6. **Accessoires** — charnières, poignée, butée, serrure.`,
    tips: [
      'Le pivot est calculé automatiquement en fonction du poids du verre.',
      'Pour le système coulissant, le rail et le guide sont inclus dans le kit — ne les ajoutez pas séparément.',
    ],
  },
  {
    id: 'calc-balustrade', category: 'calculatoare', roles: ['all'], order: 3,
    title: 'Configurateur de Garde-corps',
    image: '/manual/calc-balustrada.png',
    imageAlt: 'Configurateur 3D de garde-corps',
    content: `# Configurateur de Garde-corps

Configuration de garde-corps en verre : intérieur, extérieur (laminé obligatoire), escaliers (panneaux inclinés).

## Étapes

1. **Type** — Intérieur, Extérieur, Escaliers.
2. **Longueur totale** et **hauteur** — en mm.
3. **Verre** — laminé 8+8, 10+10 ou trempé simple (intérieur uniquement).
4. **Fixation** — profilé en U continu, pinces ponctuelles, poteaux.
5. **Main courante** — optionnelle (bois, inox, aluminium).
6. **Capuchons** — pour le profilé en U.`,
    warnings: [
      'Pour l\'extérieur, le verre DOIT être laminé — c\'est une norme de sécurité obligatoire.',
    ],
  },
  {
    id: 'calc-mirror', category: 'calculatoare', roles: ['all'], order: 4,
    title: 'Configurateur de Miroirs',
    image: '/manual/calc-oglinda.png',
    imageAlt: 'Configurateur 3D de miroir',
    content: `# Configurateur de Miroirs

Pour les miroirs simples ou avec des façonnages spéciaux.

## Étapes

1. **Forme** — Rectangle, Carré, Cercle, Ovale, Personnalisée.
2. **Dimensions** — en mm ; pour une forme personnalisée, vous dessinez dans l'éditeur CAO.
3. **Type de miroir** — argenté standard, vieilli, fumé, bronze.
4. **Bord** — poli, biseauté, rectifié.
5. **Découpes** — pour interrupteurs, prises, supports.
6. **Éclairage LED** — optionnel, périmétrique ou arrière.`,
  },
  {
    id: 'calc-kitchen', category: 'calculatoare', roles: ['all'], order: 5,
    title: 'Configurateur de Crédences de Cuisine',
    image: '/manual/calc-front-bucatarie.png',
    imageAlt: 'Configurateur 3D de crédence de cuisine',
    content: `# Configurateur de Crédences de Cuisine

Crédences de mobilier en verre laqué, impression numérique ou sablé mat.

## Étapes

1. **Finition** — Laqué RAL, Impression numérique, Sablé mat.
2. **Dimensions** — largeur × hauteur par crédence ; vous multipliez le nombre de crédences.
3. **Couleur / Impression** — vous sélectionnez le RAL ou téléchargez le fichier d'impression.
4. **Découpes** — pour poignées ou push-to-open.
5. **Système de fixation** — adhésif sur MDF, vis arrière, profilé en aluminium.
6. **Enregistrement** — agrégation automatique pour des cuisines entières.`,
    tips: [
      'Pour l\'impression numérique, la résolution minimale recommandée est de 150 dpi à la taille finale.',
    ],
  },
  {
    id: 'calc-panels', category: 'calculatoare', roles: ['all'], order: 6,
    title: 'Panneaux & Cloisons',
    image: '/manual/calc-panouri.png',
    imageAlt: 'Configurateur 3D de panneau et de cloison',
    content: `# Panneaux et Cloisons

Deux sous-modules :

- **Panneau simple** — verre sans façonnage (vitrage sur mesure).
- **Cloison** — grille configurable avec portes intégrées.

## Cloisons — étapes clés

1. **Grille** — vous définissez le nombre de colonnes × rangées ; vous redimensionnez par glisser-déposer (la somme des largeurs reste constante).
2. **Profilés périmétriques** — haut, bas, latéral ; s'interrompent automatiquement là où il y a des portes.
3. **Profilés intérieurs** — verticaux et horizontaux ; \`usableWidth/Height\` assure des panneaux adaptés.
4. **Portes intégrées** — dans n'importe quelle cellule ; déduisent automatiquement du profilé périmétrique.
5. **Panneaux latéraux à 90°** — la hauteur se synchronise avec celle de la porte.
6. **Verre & finitions** — par cellule ou globalement.`,
    warnings: [
      'Lors du redimensionnement d\'une colonne, les colonnes voisines s\'ajustent automatiquement pour conserver la largeur totale.',
    ],
  },
  {
    id: 'orders', category: 'vanzari', roles: ['all'], order: 1,
    title: 'Gestion des Commandes',
    image: '/manual/comenzi-deschide.png',
    imageAlt: 'Liste des commandes avec statuts',
    content: `# Commandes

Toutes les offres et commandes, avec des filtres rapides par statut : Offre → Confirmée → En production → Terminée → Livrée → Annulée.

## Actions rapides sur la ligne de commande

1. **Changer le statut** — boutons colorés directement sur la ligne (Confirmer, Terminer, Livrer).
2. **Envoyer en production** — déduit automatiquement le stock et crée la fiche de production.
3. **Générer le DXF** — pour la CNC, sur chaque panneau.
4. **Éditer** — rouvre l'offre dans le configurateur d'origine (toutes les données restaurées).
5. **Supprimer** — seulement si elle n'est pas encore en production.

## Ouverture d'une commande en détail

Cliquez sur le numéro de la commande (ou sur sa ligne) dans la **Liste des Commandes** et une boîte de dialogue s'ouvre avec l'en-tête de la commande (n°, statut, bouton **Télécharger le PDF**) et 4 onglets :

![Boîte de commande ouverte](/manual/comenzi-detalii.png)

### 1. Détails
Données client, date de création, sous-total, TVA, total. Ici, vous vérifiez rapidement les données commerciales et vous avez les boutons pour **Planifier la pose**, **Émettre une facture** et **Proforma (acompte)**.

### 2. Produits
Liste des produits configurés, avec quantité, prix unitaire et montant supplémentaire (s'il y en a un). Le bouton **Éditer** sur chaque produit vous renvoie dans le configurateur pour des ajustements.

![Onglet Produits](/manual/comenzi-produse.png)

### 3. Historique
Journal des modifications : changements de statut, éditions, paiements, générations de documents. Utile pour la traçabilité et l'audit — voyez qui a fait chaque modification et quand.

![Onglet Historique](/manual/comenzi-istoric.png)

### 4. Aperçu
Rendu détaillé de l'offre tel qu'il apparaît sur le **PDF envoyé au client** : pour chaque produit, vous voyez le type de configuration, les dimensions et la surface du verre, les façonnages appliqués, la liste des accessoires avec code et prix unitaire, la main-d'œuvre et le total. **Utilisé pour la vérification finale** avant d'envoyer l'offre au client ou la commande en production — vous confirmez que les prix des produits, des accessoires et de la main-d'œuvre sont corrects.

![Onglet Aperçu](/manual/comenzi-previzualizare.png)

## Les cartes du haut

Résumé instantané : total des commandes, valeur en RON, répartition par statuts.`,
    tips: [
      'La configuration complète (`full_config`) est conservée intacte du panier à la commande — aucune donnée n\'est perdue.',
      'Les accessoires identiques sont automatiquement regroupés sur le PDF final (somme des quantités, code unique).',
      'L\'onglet Aperçu reflète toujours les valeurs actuelles — si vous modifiez un prix dans les Paramètres, il est mis à jour ici.',
    ],
  },
  {
    id: 'invoicing', category: 'vanzari', roles: ['all'], order: 2,
    title: 'Facturation',
    image: '/manual/facturare.png',
    imageAlt: 'Module de facturation avec KPI et graphiques',
    content: `# Facturation

Émission de factures à partir de commandes confirmées, avec des séries personnalisées et exportation e-Factura (CIUS-RO et FatturaPA pour IT).

## Étapes

1. **Configurez les séries** dans *Paramètres → Facturation → Séries* (préfixe, année, compteur).
2. **Générez une facture** à partir d'une commande : bouton **€** sur la ligne de la commande.
3. **Éditez les lignes** — ajoutez/supprimez, ajustez les prix, la TVA par ligne.
4. **Émettez** — numéro attribué automatiquement, le statut devient "Émise".
5. **Enregistrez un paiement** — dialogue partiel ou total.
6. **Exportez en XML** — pour ANAF (RO) ou SDI (IT).

## KPI

Cartes du haut : facturé, encaissé, en attente, annulé.`,
    warnings: [
      'Une facture émise ne peut pas être supprimée — seulement annulée avec un motif et remplacée par un avoir.',
    ],
  },
  {
    id: 'clients-crm', category: 'vanzari', roles: ['all'], order: 3,
    title: 'Clients & CRM',
    image: '/manual/clienti-crm.png',
    imageAlt: 'Liste de clients CRM avec types',
    content: `# Clients

Base de données complète des clients : particuliers, entreprises, distributeurs.

## Étapes

1. **Ajouter un client** — bouton "Nouveau client" ou automatiquement lors de l'enregistrement d'une offre pour un nouvel e-mail.
2. **Type de client** — Particulier / Entreprise / Distributeur (avec une remise globale).
3. **Coordonnées** — téléphone, e-mail, adresse, CUI (si c'est une entreprise).
4. **Pipeline CRM** (admin) — prospects, étapes, conversions.
5. **Historique** — toutes les offres et commandes du client en un seul endroit.
6. **Majoration spécifique** — dans *Paramètres → Majoration Client*, vous définissez une majoration différente par type.`,
    tips: [
      'Les clients sont créés automatiquement depuis les configurateurs 3D lorsque vous enregistrez la première offre avec un nouvel e-mail.',
    ],
  },
  {
    id: 'production-kanban', category: 'productie', roles: ['all'], order: 1,
    title: 'Flux de Production Kanban',
    image: '/manual/productie-kanban.png',
    imageAlt: 'Tableau Kanban avec les colonnes Découpe, Façonnage, Trempe',
    content: `# Production Kanban

Le flux visuel par étapes : **Découpe → Façonnage → Trempe → Revêtement/Impression → Assemblage → Prêt pour la livraison**.

## Étapes quotidiennes

1. **Vérifiez les KPI** du haut : total actif, en cours, en attente, prêt à livrer.
2. **Glissez-déposez** une carte entre les colonnes pour avancer manuellement.
3. **Cliquez sur la carte** — ouvre la fiche de production avec les dessins techniques, les matériaux, les accessoires.
4. **Assignation de l'opérateur** — pré-planifiée dans *Commandes → Planification opérateur* ; est sauvegardé dans \`operator_name\` pour la traçabilité.
5. **Vue Calendrier** — onglet alternatif pour la planification par date.

## Étiquettes avec code-barres

Depuis la fiche de chaque commande de production (et depuis la page **Scanner**), vous avez le bouton **« Imprimer l'Étiquette »** :

- Le code-barres est **CODE128**, généré automatiquement à partir du numéro de la fiche (avec la bibliothèque JsBarcode).
- L'étiquette contient : **n° de fiche**, **n° de commande**, **client**, **date de livraison** et **étape actuelle**.
- Le dialogue d'impression du navigateur s'ouvre directement — vous pouvez utiliser des imprimantes A4 normales ou des imprimantes d'étiquettes dédiées (Zebra, Brother, etc.).
- Vous collez l'étiquette sur le verre / le châssis / le colis et la réutilisez à chaque étape du flux.

## Scan en atelier

La page **Production → Scanner** est optimisée pour le rythme de l'atelier :

1. **Mise au point automatique** sur le champ de scan — pas besoin de cliquer avant chaque scan.
2. **Lecteurs HID** — tout scanner USB de type « clavier » fonctionne en plug-and-play (aucun pilote requis).
3. **Scannez le code** sur l'étiquette → la commande **avance automatiquement** à l'étape suivante du flux.
4. **Confirmation visuelle** instantanée : la carte affiche le nouveau statut, et le Kanban se met à jour.

Ainsi, les opérateurs ne perdent plus de temps avec le glisser-déposer manuel et il n'y a plus d'erreurs du type « j'ai oublié de marquer comme terminé ».

## Suivi en temps réel

Le tableau Kanban se **rafraîchit automatiquement** en arrière-plan :

- Les scans effectués en atelier apparaissent **immédiatement** sur les écrans de bureau — sans rafraîchissement manuel.
- Les KPI du haut (actifs, en cours, prêts à livrer) se recalculent en direct.
- Plusieurs opérateurs peuvent travailler simultanément sur différentes étapes, sans se gêner.
- Le manager voit à tout moment **où se trouve chaque commande** et **qui travaille dessus**.

## Date de livraison estimée

Elle est calculée automatiquement lorsqu'une commande entre en production, en fonction de la charge des colonnes.`,
    tips: [
      'Imprimez l\'étiquette avec le code-barres dès que la commande entre en production et collez-la sur le colis — elle devient la source de vérité pour tout le flux.',
      'Laissez la page Scanner ouverte sur une tablette/un ordinateur portable dans l\'atelier ; la mise au point automatique garantit que chaque scan est capturé même si personne n\'est au clavier.',
      'Pour un flux 24/7, ouvrez le Kanban sur un grand écran de télévision — vous voyez la progression en temps réel sans rien toucher.',
    ],
  },
  {
    id: 'inventory', category: 'productie', roles: ['all'], order: 2,
    title: 'Stock & Inventaire',
    image: '/manual/stoc.png',
    imageAlt: 'Module d\'inventaire avec listes de matériaux',
    content: `# Stock

Gestion des matériaux : verre, accessoires (quincaillerie), consommables. Déduction automatique à l'entrée en production.

## Étapes

1. **Ajouter un matériau** — bouton "Nouveau matériau" (code, type, prix, stock minimum).
2. **Ajuster le stock** — bouton par ligne pour les entrées/sorties manuelles.
3. **Mouvements de stock** — onglet avec l'historique des transactions (entrées, sorties, motif).
4. **Rapport de consommation mensuel** — bouton en haut, exportation CSV/Excel.
5. **Alertes de stock minimum** — KPI rouge "Stock Min." sur la carte supérieure.
6. **Emplacement** — optionnel, pour plusieurs entrepôts.

## Auto-déduction

Lorsqu'une commande passe au statut **"En production"**, le stock diminue automatiquement selon la liste de matériaux de chaque produit.`,
    warnings: [
      'Le stock négatif est autorisé mais marqué en rouge — le gestionnaire doit effectuer un inventaire physique et un ajustement.',
    ],
  },
  {
    id: 'cutting', category: 'productie', roles: ['all'], order: 3,
    title: 'Optimisation de la Découpe',
    image: '/manual/optimizare-debitare.png',
    imageAlt: 'Module d\'optimisation de la découpe avec sélection de plateaux',
    content: `# Optimisation de la Découpe

Algorithme de nesting en guillotine pour jusqu'à 50 commandes simultanément — minimise la chute de verre.

## Étapes

1. **Type de plateau** — vous sélectionnez dans le catalogue (ex. : 3210×2250 mm).
2. **Épaisseur de la lame** — 3 mm par défaut, ajustable.
3. **Sélectionnez les commandes** — depuis la liste avec recherche et filtre par statut (vous pouvez faire "Tout sélectionner 26").
4. **Appuyez sur Optimiser** — l'algorithme s'exécute et affiche les plateaux avec les panneaux imbriqués.
5. **Visualisez en SVG** — chaque plateau avec ses cotes, les étiquettes de panneau, la chute colorée.
6. **Exportez en DXF/PDF** — pour envoyer à la machine de découpe.

## Gérer les feuilles de verre

![Boîte de dialogue Gérer les feuilles avec les tailles standard sur la page Optimisation de Découpe](/manual/manage-glass-sheets.png)

Les tailles standard (2550×3210, 2250×3210, Jumbo 6000×3210) sont chargées automatiquement à la première utilisation. Tu peux les modifier à tout moment sans quitter la page de découpe — clique sur **⚙ Gérer les feuilles** à côté du sélecteur *Type de feuille*.

1. **Ajouter une nouvelle feuille** — remplis *Nom* (ex. "Custom 2000×3000"), *Largeur (mm)* et *Hauteur (mm)*, puis clique sur **+ Ajouter**.
2. **Activer / désactiver** — l'interrupteur près de chaque taille la masque du sélecteur *Type de feuille* sans la supprimer (utile pour les tailles saisonnières).
3. **Supprimer** — le bouton rouge (corbeille) retire définitivement une taille ; à utiliser seulement si tu es sûr.
4. **Fermer la boîte de dialogue** — les changements s'appliquent immédiatement et le sélecteur *Type de feuille* se met à jour automatiquement avec les nouvelles dimensions et la surface en m².

> Les feuilles sont stockées par entreprise — toute ton équipe voit la même liste, isolée des autres comptes.

## Statistiques

Pourcentage d'utilisation, surface de chute, nombre de plateaux.`,
    tips: [
      'Limite de 50 commandes par session pour conserver un temps de calcul raisonnable.',
    ],
  },
  {
    id: 'service', category: 'operational', roles: ['all'], order: 1,
    title: 'Réclamations & Interventions SAV',
    image: '/manual/service.png',
    imageAlt: 'Module de réclamations avec graphiques et liste de tickets',
    content: `# Réclamations & SAV

Gestion des incidents post-livraison : réclamations clients, défauts d'usine, interventions planifiées.

## Étapes

1. **Nouvelle réclamation** — bouton en haut à droite.
2. **Associer une commande** — optionnel, pour la traçabilité.
3. **Priorité** — Basse / Moyenne / Haute / Critique.
4. **Type de défaut** — Réclamation client, Défaut d'usine, Dommages de transport, Garantie.
5. **Planifier une intervention** — vous choisissez la date et l'équipe de pose.
6. **Clôturer le ticket** — avec la résolution et les coûts.

## Graphiques

Fréquence des défauts, répartition des priorités, statut des tickets.`,
  },
  {
    id: 'installation', category: 'operational', roles: ['all'], order: 2,
    title: 'Pose & Équipes',
    image: '/manual/montaj.png',
    imageAlt: 'Calendrier de pose avec onglets Équipes, Véhicules, Checklist',
    content: `# Pose

Planification des poses, équipes, véhicules, checklists et optimisation d'itinéraire.

## Onglets

1. **Calendrier de Pose** — vue mensuelle avec glisser-déposer.
2. **Équipes de Pose** — vous ajoutez des membres, les affectez à des équipes.
3. **Checklist** — modèles clonés sur chaque tâche à sa création.
4. **Optimisation d'Itinéraire** — calcule l'ordre optimal des poses de la journée.
5. **Véhicules** — flotte avec des alertes à 30 jours pour le contrôle technique (ITP) et l'assurance (RCA).

## Étapes de planification

1. Bouton **"Planifier la pose"** en haut à droite.
2. Sélectionnez la commande, l'équipe, le véhicule, la date.
3. Attachez une checklist (par défaut ou personnalisée).
4. Enregistrez — apparaît dans le calendrier.
5. **Report** — clôture la tâche en cours et pré-remplit une nouvelle.`,
    tips: [
      'Les véhicules dont le contrôle technique (ITP) ou l\'assurance (RCA) expire dans moins de 30 jours reçoivent une alerte automatique.',
    ],
  },
  {
    id: 'settings-company', category: 'setari', roles: ['all'], order: 1,
    title: 'Paramètres de l\'Entreprise & Branding',
    image: '/manual/setari-companie.png',
    imageAlt: 'Paramètres de l\'entreprise — informations générales',
    content: `# Paramètres → Entreprise

Les données qui apparaissent sur TOUS les documents générés (offres, commandes, factures, fiches de production).

## Champs essentiels

1. **Nom de l'entreprise** — apparaît dans l'en-tête du PDF.
2. **CUI / CIF** — avec le préfixe RO pour la Roumanie.
3. **Adresse complète** — Rue, N°, Ville, Département, Code Postal.
4. **Téléphone et Email** — pour le contact sur les documents.
5. **Compte Bancaire et BIC/SWIFT** — pour les factures.
6. **Logo de l'entreprise** — PNG/JPG/WebP/SVG, max 2 Mo.

## Personnalisation du PDF

- **Taille du logo** et **position** — pour les offres et les factures.
- **Textes personnalisés** — termes, conditions, pied de page (rich-text via Tiptap).
- **Taux de change EUR/RON** — utilisé pour la conversion globale.

## Marque blanche

Les abonnés peuvent entièrement personnaliser les PDF avec leur propre logo et des textes HTML.`,
    tips: [
      'Le logo idéal est un PNG transparent, avec un ratio de 3:1 ou carré, et une taille minimale de 400×400 px pour une bonne qualité d\'impression.',
    ],
  },
  {
    id: 'settings-pricing', category: 'setari', roles: ['all'], order: 2,
    title: 'Paramètres des Prix & Catalogue',
    content: `# Paramètres → Prix

Votre catalogue local de prix : matériaux, accessoires, kits, finitions.

## Étapes

1. **Onglet Matériaux** — verre, profilés, accessoires groupés.
2. **Rechercher** — recherche transversale par catégories.
3. **Éditer le prix** — cliquez sur la cellule, sauvegarde automatique.
4. **Réinitialiser au système** — bouton pour annuler la surcharge et revenir au prix de base.
5. **Variantes privées** — vous ajoutez vos propres matériaux avec un code unique par entreprise.
6. **Import / Export** — Excel + ZIP pour les photos, mapping automatique avec les catégories du système.

## Hiérarchie des prix

Entreprise (surcharge propre) > Utilisateur global > Système (catalogue par défaut).`,
    tips: [
      'Les surcharges de l\'entreprise ne sont pas visibles par les autres entreprises — strictement isolées par RLS.',
      'Les images des matériaux ont un cachebusting avec un timestamp pour voir immédiatement la nouvelle version.',
    ],
    warnings: [
      'La réinitialisation d\'un prix supprime la surcharge et ne peut pas être annulée — vérifiez avant.',
    ],
  },
  {
    id: 'settings-team', category: 'setari', roles: ['all'], order: 3,
    title: 'Paramètres de l\'Équipe & Autorisations',
    content: `# Paramètres → Équipe

Invitez des membres de votre équipe et gérez leurs autorisations par module.

## Étapes

1. **Inviter un membre** — par e-mail ; il reçoit un lien d'inscription.
2. **Rôle** — Abonné (ventes), Production, Pose, Admin entreprise.
3. **Modules autorisés** — vous cochez l'accès : Commandes, Production, Stock, Facturation, SAV, etc.
4. **Activer/Désactiver** — conserve l'historique, bloque seulement la connexion.
5. **Transférer l'admin** — en un seul clic, à un autre membre.
6. **Traçabilité** — toutes les actions sont enregistrées avec \`created_by\`.

## Niveaux d'accès

- **Basic (60)** — Commandes + 1-2 configurateurs.
- **Plus (100)** — Tous les configurateurs + Stock.
- **Opérationnel (150)** — Tout, y compris SAV, Pose, Optimisation.

## Facturation

L'abonnement est lié au **propriétaire de l'entreprise** — les employés sont gratuits.`,
    tips: [
      'Réparation de compte orphelin (admin) — les utilisateurs sans entreprise peuvent être attribués manuellement.',
    ],
  },
  {
    id: 'pricing-client-types', category: 'setari', roles: ['all'], order: 9,
    title: 'Majoration par type de client (Particulier / Entreprise / Distributeur)',
    image: '/manual/setari-adaos-tip-client.png',
    imageAlt: 'Paramètres → Majorations Clients — Particulier, Entreprise, Distributeur',
    content: `# Majoration en pourcentage par type de client

Dans **Paramètres → Majorations Clients**, vous pouvez définir **3 listes de prix différenciées** en partant du même catalogue, sans dupliquer les articles.

## Les 3 types

- **Particulier** — clients finaux (retail). Typiquement, vous appliquez ici une majoration positive (ex. : +10 % … +20 %) car ils ne bénéficient pas de remise commerciale.
- **Entreprise** — sociétés et entreprises partenaires. On laisse généralement **0 %** (prix de base).
- **Distributeur** — partenaires revendeurs. Ici, vous mettez généralement une **valeur négative** (ex. : -10 % … -25 %) pour leur offrir le prix préférentiel.

## Comment ça marche

- Le pourcentage s'applique **automatiquement** sur le prix de base de chaque article de l'offre (verre, accessoires, main-d'œuvre, kits).
- Valeurs **positives** = majoration sur le prix standard. Valeurs **négatives** = remise.
- Le champ accepte des valeurs entre **−100 % et +500 %**, avec un pas de 0,5 %.
- Les modifications deviennent actives après avoir appuyé sur **« Enregistrer les Majorations »** (bouton en bas à droite). La carte met en évidence les lignes modifiées avec le badge « modifié ».

## Où cela s'applique-t-il

Dans chaque **configurateur 3D**, sur la carte **Informations Client**, il y a le sélecteur **Type de Client** (Particulier / Entreprise / Distributeur). Lorsque vous le changez :

1. Le configurateur détecte le type choisi.
2. Il applique automatiquement le pourcentage défini ici sur le sous-total.
3. Le prix affiché dans l'offre (et plus tard dans le PDF) reflète déjà le nouveau type.

## À quoi ça sert

- **Une seule liste de catalogue**, mais des prix différents par catégorie de client — sans dupliquer manuellement les articles.
- Vous pouvez accorder **rapidement une remise aux distributeurs** sans modifier les catalogues de base.
- Les particuliers peuvent être facturés avec une majoration commerciale standard, sans calculs manuels dans chaque offre.
- Les modifications ne sont **rétroactives que pour les nouvelles offres** — les commandes déjà enregistrées conservent leurs prix initiaux (\`full_config\` est la source de vérité).`,
    tips: [
      'Vous pouvez définir des valeurs négatives (ex. : -15 %) pour offrir une remise permanente à une catégorie sans toucher au catalogue.',
      'En cas de doute, commencez avec Entreprise = 0 % (prix de référence) et ajustez les deux autres par rapport à celui-ci.',
      'Le sélecteur Type de Client dans le configurateur est conservé dans l\'offre, donc une offre rouverte garde le type choisi initialement.',
    ],
    warnings: [
      'La modification du pourcentage n\'affecte que les nouvelles offres. Les commandes existantes doivent être rééditées si vous souhaitez les recalculer.',
    ],
  },
  {
    id: 'pricing-overview', category: 'setari', roles: ['all'], order: 10,
    title: 'Prix — présentation générale',
    image: '/manual/setari-preturi.png',
    imageAlt: 'Paramètres → Prix — liste des catégories',
    content: `# Paramètres → Prix

Ici, vous contrôlez **tous les prix** utilisés dans les configurateurs 3D, les offres et les PDF.

## Catégories disponibles

- **Accessoires** — charnières, poignées, barres, roulettes, butées, joints, connecteurs
- **Verre** — par épaisseur et type (clair, mat, fumé, miroir)
- **Main-d'œuvre** — pose, découpe, polissage, perçage, découpage
- **Profilés** — en U, mural, d'angle 90°, profilés coulissants
- **Kits** — groupes d'accessoires vendus comme un seul article
- **Mécanismes coulissants** — systèmes complets (avec profilé + roulettes + butées)

## Catalogue global vs surcharge personnelle

- Le **catalogue global** (géré par l'admin) est le point de départ — vous le voyez automatiquement.
- Lorsque vous modifiez un prix ou une déduction, une **surcharge personnelle** est enregistrée dans votre espace (\`pricing_config\`). Le catalogue global reste intact.
- Vous pouvez à tout moment réinitialiser la surcharge avec le bouton **« Réinitialiser à la valeur du catalogue »** (voir la section dédiée).

## Devise

Les prix sont stockés en interne en **RON**. Le sélecteur **RON / EUR** dans la barre supérieure ne convertit que l'affichage — aucune conversion n'est effectuée dans la base de données.`,
    tips: [
      'Le filtre de recherche fonctionne sur toutes les catégories simultanément (code, dénomination, finition).',
      'Si vous ne voyez pas un article, vérifiez si vous l\'avez désactivé depuis le menu sur la ligne (cloche barrée).',
    ],
  },
  {
    id: 'pricing-add-accessory', category: 'setari', roles: ['all'], order: 11,
    title: 'Ajout d\'un nouvel accessoire',
    image: '/manual/setari-adauga-accesoriu.png',
    imageAlt: 'Boîte de dialogue Ajouter un élément — accessoire',
    content: `# Comment ajouter un nouvel accessoire

1. Allez dans **Paramètres → Prix** et sélectionnez l'onglet **Accessoires**.
2. Appuyez sur **« Ajouter un élément »** (en haut à droite).
3. Complétez :
   - **Code** — unique ; utilisé pour la déduplication, le scan de code-barres et le regroupement dans le PDF.
   - **Dénomination** — affichée dans le configurateur et le PDF.
   - **Catégorie / Type** — charnière, poignée, barre de stabilisation, roulettes, butée, joint, etc.
   - **Prix** — dans la devise active (stocké en RON).
   - **U.M.** — \`pcs\` pour les pièces, \`ml\` pour les mètres linéaires, \`m²\` pour la surface, \`kg\` pour le poids.
   - **Finition & couleur** — choisissez parmi les préréglages ou saisissez un code hexadécimal personnalisé ; est également utilisé dans le rendu 3D.
   - **Image** — téléversée dans le stockage ; apparaît dans le sélecteur d'accessoires et dans le PDF.
4. Cochez les **« Types de produit »** où l'accessoire apparaît (douche, porte, garde-corps, miroir, panneaux, crédence de cuisine).
5. Cochez les **« Types de façonnage »** compatibles (laminé, trempé, mat).
6. **Enregistrer** — l'accessoire devient immédiatement disponible dans les configurateurs cochés.`,
    tips: [
      'Pour une U.M. différente de pcs, vous pouvez utiliser des décimales (ex: 2.5 ml).',
      'Si vous ne définissez pas d\'image, elle est héritée automatiquement de la catégorie parente.',
    ],
    warnings: [
      'Le code doit être unique. S\'il existe déjà, le système met à jour l\'article existant au lieu d\'en créer un nouveau.',
    ],
  },
  {
    id: 'pricing-edit-fields', category: 'setari', roles: ['all'], order: 12,
    title: 'Édition d\'un élément — champs avancés',
    image: '/manual/setari-editare-element.png',
    imageAlt: 'Boîte de dialogue Éditer un élément avec déductions de verre',
    content: `# Édition d'un élément — champ par champ

Cliquez sur le crayon sur la ligne (ou double-cliquez) pour ouvrir **Éditer l'élément**. En plus du prix et de l'U.M., vous avez ces champs techniques :

## Prix & U.M.

- Le prix est saisi dans la devise active de l'en-tête (RON ou EUR) et est stocké en interne en RON.
- L'U.M. détermine comment le prix est multiplié dans le configurateur : \`pcs\` × quantité, \`ml\` × longueur, \`m²\` × surface.

## Finition & couleur

- **Couleur hex** + **rugosité** sont utilisées à la fois dans la liste de prix et dans le rendu 3D — synchronisées via \`MetalMaterial\`.
- Si vous laissez vide, la valeur est héritée de l'élément parent (ex : une variante de profilé hérite de la couleur du profilé de base).

## Déduction de verre par côté (\`glass_deduction\`)

Combien de **mm** le profil pénètre dans le verre sur chaque côté où il est monté. Le configurateur soustrait automatiquement cette valeur de la dimension brute pour obtenir la taille réelle du verre à découper.

> Exemple : profilé en U 8 mm sur verre 8 mm laminé → \`8 + 0.38 + 8 = 16.38 mm\` de déduction totale (profilés + film + profilés, cumulatif).

## Déductions détaillées par côté (\`glass_deductions\`)

JSON avec \`top\`, \`bottom\`, \`left\`, \`right\` séparés. Utilisé lorsque le profilé a des valeurs différentes sur chaque bord (ex : profilé de sol profond + profilé mural fin). **Se cumule** avec les joints.

- **\`profile_height\`** (dans le même JSON) — écrase la somme \`top + bottom\` pour le profilé en U, si vous voulez une seule valeur totale.

## Chevauchement (\`width_overlap\`)

De combien de mm les panneaux coulissants **chevauchent** l'autre panneau ou le mur. Le système soustrait cette valeur de la **largeur utile** du kit coulissant.

> Exemple : kit coulissant 1200 mm avec un chevauchement de 40 mm → largeur utile effective 1160 mm.

## Déduction de la hauteur de la porte (\`door_height_deduction\`)

mm soustraits de la hauteur totale pour la **porte à charnières** (espace pour la charnière en haut + seuil en bas). Typiquement 5–20 mm selon la charnière.

## Déduction de la hauteur du panneau fixe (\`fixed_panel_height_deduction\`)

Identique, mais pour le panneau fixe. **Par défaut 0** — le panneau fixe n'a pas de déduction automatique de 10 mm.

## Types de produit / façonnage

Cochez où l'accessoire apparaît (douche, porte, garde-corps...) et quels façonnages il supporte (laminé, trempé). Non coché = n'apparaît pas dans le configurateur correspondant.`,
    tips: [
      'Les déductions sont **cumulatives** : profilé + joint + film de lamination s\'additionnent sur le même côté.',
      'Les charnières se mesurent de **haut en bas**, la poignée de **bas en haut** — c\'est une convention conservée dans tous les configurateurs.',
      'Le système coulissant **n\'utilise pas de charnières** — le champ de quantité de charnières reste automatiquement à 0.',
    ],
    warnings: [
      'Toute modification des déductions affecte immédiatement **tous les calculs 3D futurs**, y compris les offres non confirmées. Les commandes déjà enregistrées ont leurs données figées dans `full_config` et ne sont pas modifiées.',
    ],
  },
  {
    id: 'pricing-add-glass', category: 'setari', roles: ['all'], order: 13,
    title: 'Ajout d\'un type de verre',
    image: '/manual/setari-sticla.png',
    imageAlt: 'Paramètres → Prix → Verre',
    content: `# Le Verre

1. Onglet **Verre** → **« Ajouter un élément »**.
2. Choisissez l'**épaisseur** : 4 / 6 / 8 / 10 / 12 mm.
3. Choisissez le **type** : clair, fumé, mat (sablé), miroir, bronze, gris.
4. Définissez le **prix / m²** (dans la devise active).
5. Cochez les **façonnages** disponibles pour ce verre : trempé, laminé, poli, mat.

## Trempe

Pour la trempe, le prix est calculé avec la formule :

\`\`\`text
Prix de la trempe = Prix_trempe × Épaisseur_mm × Surface_m²
\`\`\`

Vous définissez un seul prix de base ; le système applique automatiquement la formule en fonction de l'épaisseur et de la surface du verre.

## Laminé

Pour le verre laminé, les déductions sur les côtés se cumulent avec l'**épaisseur du film** (par défaut 0.38 mm) sur chaque bord. Voir l'exemple dans la section « Édition d'un élément ».`,
    tips: [
      'Le verre mat (sablé) a généralement une majoration en pourcentage par rapport au verre clair — vous la configurez comme un multiplicateur dans le champ de façonnage.',
    ],
  },
  {
    id: 'pricing-add-labor', category: 'setari', roles: ['all'], order: 14,
    title: 'Ajout de main-d\'œuvre',
    image: '/manual/setari-manopera.png',
    imageAlt: 'Paramètres → Prix → Main-d\'œuvre',
    content: `# Main-d'œuvre

1. Onglet **Main-d'œuvre** → **« Ajouter un élément »**.
2. Choisissez le **type** : pose, découpe, polissage des bords, perçage, découpage, transport.
3. Définissez l'**U.M.** :
   - \`heure\` — pour la pose
   - \`ml\` — pour le polissage des bords
   - \`pce\` — pour les trous, les découpes
   - \`m²\` — pour la main-d'œuvre de surface
4. **Prix** par unité.
5. **Pourcentage vs valeur fixe** — cochez s'il s'agit d'un multiplicateur (ex : 15 % sur la valeur du verre) ou d'une somme fixe.
6. Associez aux **types de produit** où il s'applique automatiquement.`,
    tips: [
      'La main-d\'œuvre en pourcentage n\'est pas affectée par le sélecteur EUR/RON — elle reste la même quelle que soit la devise.',
    ],
  },
  {
    id: 'pricing-add-kit', category: 'setari', roles: ['all'], order: 15,
    title: 'Kits d\'accessoires',
    image: '/manual/setari-kituri.png',
    imageAlt: 'Paramètres → Kits',
    content: `# Kits

Un **kit** est un groupe d'accessoires vendu comme un seul article. Utile pour les systèmes de douche coulissants : le kit comprend le profilé, les roulettes, les butées, le guide.

## Création d'un kit

1. Allez dans **Paramètres → Kits** (ou l'onglet Kits dans les Prix).
2. **« Ajouter un kit »** → code, dénomination, **prix du kit** (final), **largeur utile** couverte.
3. Ajoutez des **composants** — vous sélectionnez dans la liste des accessoires et mettez la quantité.
4. Les composants sont **dédupliqués par code** — si le même code apparaît deux fois, les quantités sont additionnées.

## Utilisation dans le configurateur

Dans le configurateur de **douche coulissante**, vous choisissez le kit dans le menu déroulant. Le système calcule :

\`\`\`text
Largeur utile effective = Largeur_kit - width_overlap
\`\`\`

et applique automatiquement **0 charnières** (le système coulissant n'a pas de charnières).`,
    tips: [
      'Les prix des composants sont informatifs — le **prix du kit prévaut** dans l\'offre.',
      'L\'image du kit apparaît dans le PDF ; si elle est absente, l\'image du profilé principal est utilisée.',
    ],
  },
  {
    id: 'pricing-reset', category: 'setari', roles: ['all'], order: 16,
    title: 'Réinitialiser à la valeur du catalogue',
    image: '/manual/setari-reset.png',
    imageAlt: 'Bouton Réinitialiser à la valeur du catalogue',
    content: `# Réinitialiser la surcharge personnelle

Si vous avez modifié un prix ou une déduction et que vous souhaitez revenir à la **valeur standard du catalogue global** :

1. Ouvrez **Éditer l'élément**.
2. Appuyez sur **« Réinitialiser à la valeur du catalogue »** (en bas à gauche de la boîte de dialogue).
3. Votre surcharge dans \`pricing_config\` est supprimée et l'article affiche à nouveau la valeur de l'administrateur.

> La réinitialisation n'affecte **que l'article concerné**. Vos autres surcharges restent intactes.`,
    warnings: [
      'L\'action est immédiate et ne peut pas être annulée. Si vous avez besoin d\'un historique, exportez les prix (Paramètres → Exporter les données) avant la réinitialisation.',
    ],
  },

  // ====== New sections — for subscribers ======
// ====== Secțiuni noi — pentru abonați ======
  {
    id: 'dashboard-home', category: 'introducere', roles: ['all'], order: 0,
    title: 'Tableau de bord principal',
    image: '/manual/dashboard-home.png',
    imageAlt: 'Tableau de bord principal',
    content: `# Tableau de bord principal

Après vous être connecté, vous arrivez sur la **page d'accueil (\`/\`)** — un tableau de bord avec les indicateurs clés de votre entreprise, mis à jour en temps réel.

## Ce que vous voyez

- **KPI en haut** : chiffre d'affaires, commandes en cours, commandes livrées le mois en cours, valeur moyenne par commande.
- **Graphique des ventes** sur les 12 derniers mois (barres, avec comparaison à l'année précédente).
- **Graphique des revenus** par catégories de produits (douche, portes, balustrades, miroirs, cuisine, panneaux).
- **Top produits** vendus sur la période sélectionnée.
- **Stock critique** — matériaux dont la quantité est inférieure au seuil minimum configuré.
- **Commandes récentes** — les 10 dernières commandes avec leur statut et client, avec un clic direct sur la commande.

## Filtres

Le sélecteur **RON / EUR** dans la barre supérieure affecte toutes les valeurs affichées ici (conversion dynamique, hors TVA).
`,
    tips: [
      'Le tableau de bord se recharge automatiquement à chaque changement de devise ou de langue.',
      "Pour une vue opérationnelle (production, montage, service), utilisez le menu *Tableau de bord Opérationnel*.",
    ],
  },
  {
    id: 'announcements', category: 'introducere', roles: ['all'], order: 3,
    title: 'Annonces et notifications',
    image: '/manual/announcements.png',
    imageAlt: 'Annonces et notifications',
    content: `# Annonces et notifications

L'icône 🔔 **cloche jaune** dans la barre supérieure affiche les annonces publiées par l'équipe iSoftGlass : mises à jour, nouvelles fonctionnalités, maintenance planifiée.

## Comment ça marche

- Le numéro rouge sur la cloche = annonces **non lues**.
- Cliquez sur la cloche pour ouvrir la liste — chaque annonce a un titre, une catégorie (**Update** ou **Info**), une date et son contenu complet.
- Les annonces sont automatiquement marquées comme lues lorsque vous les ouvrez.
- Les annonces importantes de type **Update** apparaissent également comme une **notification en haut de la page** lors du lancement d'une nouvelle version.

## Catégories

- **Update** — nouvelle version, fonctionnalités ajoutées, corrections.
- **Info** — informations générales, conseils, événements.

Les annonces sont automatiquement traduites dans la langue de votre interface.
`,
    tips: [
      'Consultez régulièrement les annonces pour découvrir les nouvelles fonctionnalités qui peuvent vous faire gagner du temps.',
    ],
  },
  {
    id: 'currency-language', category: 'introducere', roles: ['all'], order: 4,
    title: 'Devise et langue',
    image: '/manual/currency-language.png',
    imageAlt: 'Devise et langue',
    content: `# Devise et langue

## Sélecteur RON / EUR

Le bouton **RON / EUR** dans la barre supérieure change la devise affichée dans toute l'application — calculateurs 3D, offres, commandes, rapports, tableau de bord.

- Le **stockage interne** se fait **toujours en RON**. L'EUR n'est qu'un affichage, calculé dynamiquement au taux de change défini dans *Paramètres → Entreprise*.
- **Toutes les valeurs sont hors TVA** dans les calculs internes ; la TVA n'est appliquée que lors de la génération de la facture.
- Vous pouvez saisir des valeurs en EUR — elles sont automatiquement converties en RON lors de la sauvegarde.

## Sélecteur de langue

Le bouton **🇷🇴 RO** ouvre la liste des **9 langues disponibles** : Română, English, Italiano, Deutsch, Polski, Français, Español, Nederlands, Hrvatski.

- Le changement de langue n'affecte **que l'interface** (menus, boutons, étiquettes, manuel).
- Les données que vous saisissez (noms de clients, descriptions, notes) restent dans leur langue d'origine.
- Le paramètre est conservé pour votre compte entre les sessions.
`,
    tips: [
      "Le taux de change EUR n'est mis à jour que lorsque vous le modifiez manuellement dans Paramètres → Entreprise.",
      "Le manuel d'utilisation est entièrement traduit dans les 9 langues.",
    ],
  },
  {
    id: 'working-in-eur', category: 'introducere', roles: ['all'], order: 5,
    title: 'Travailler exclusivement en EUR (recommandé pour les abonnés non-RO)',
    image: '/manual/working-in-eur.png',
    imageAlt: 'Paramètres → Prix — Taux EUR',
    content: `# Travailler exclusivement en EUR

Ce guide s'adresse aux abonnés qui travaillent **à 100% en EUR** — ils achètent à leurs fournisseurs en EUR et vendent à leurs clients en EUR, sans mélanger le RON dans leur catalogue.

## Comment fonctionne le stockage interne

- Tous les prix sont enregistrés dans la base de données comme un seul nombre.
- L'étiquette technique interne est « RON », mais elle vous est **indifférente** — vous ne la voyez jamais dans l'interface.
- Le commutateur **EUR** dans la barre supérieure effectue une conversion d'affichage en utilisant le taux défini dans *Paramètres → Prix*.

## Le problème que vous évitez

Si vous gardez le taux par défaut (ex. \`Taux EUR = 4,97\`) et entrez une charnière à **100 EUR**, le système stocke en interne \`497\`. Demain, si le taux passe à \`5,02\`, le même produit apparaît comme **99,00 EUR** dans le catalogue — sans que vous ayez rien modifié.

Ce « drift » est mathématiquement correct mais crée de la confusion et ressemble à un bug.

## Configuration recommandée — 3 étapes

1. **Paramètres → Prix** → définissez **Taux EUR = 1**.
2. Dans la barre supérieure, sélectionnez **EUR** comme devise active.
3. Saisissez tous les prix directement en EUR dans *Paramètres → Prix* (et dans les nouvelles commandes).

## Ce que vous gagnez

- Les prix restent **absolument stables** — 100 EUR aujourd'hui = 100 EUR dans un an.
- Aucune conversion à l'enregistrement, **aucun drift**.
- Les PDF de devis, commandes et rapports sortent naturellement en EUR.
- Les commandes historiques ne « bougent » plus dans le temps.

## Ce qui NE change PAS

- L'étiquette technique « RON » reste dans la base de données (invisible dans l'interface).
- Toute la logique de l'application fonctionne à l'identique — aucune fonctionnalité perdue.

## Limites — quand NE PAS utiliser cette configuration

- Si vous avez des **fournisseurs en RON** et des clients en EUR (flux mixte) → vous avez besoin du taux réel.
- Si vous travaillez dans une autre devise (PLN, HRK, etc.) → contactez l'équipe iSoftGlass pour une extension.
`,
    tips: [
      'Définir Taux EUR = 1 n\'affecte que la conversion d\'affichage — cela ne modifie aucune valeur déjà enregistrée.',
      'Il est recommandé de faire cette configuration avant de saisir les premiers prix dans le catalogue.',
    ],
  },
  {
    id: 'production-scanner', category: 'productie', roles: ['all'], order: 2,
    title: 'Scanner de production (codes-barres)',
    image: '/manual/production-scanner.png',
    imageAlt: 'Scanner de production (codes-barres)',
    content: `# Scanner de production

La page **Production → Scanner** (\`/productie/scanner\`) vous permet de faire avancer rapidement les commandes entre les étapes Kanban à l'aide d'un **scanner de codes-barres CODE128** connecté comme un clavier HID.

## Comment ça marche

1. Ouvrez la page **Scanner**. Le champ de saisie a un focus automatique permanent.
2. **Scannez le code-barres** sur la fiche de production ou l'étiquette du produit.
3. L'application identifie automatiquement la commande et la **fait avancer à l'étape suivante** du Kanban (ex : *Découpe* → *Polissage*, *Polissage* → *Trempe*).
4. La confirmation s'affiche à l'écran avec un son et une couleur verte ; l'erreur (code inconnu) avec du rouge.

## Prérequis

- Scanner CODE128 configuré en **clavier HID** (mode standard, sans pilotes).
- Suffix **Entrée (\\r)** après chaque scan (réglage par défaut sur la plupart des modèles).

## Avantages

- L'opérateur n'a plus besoin de rechercher manuellement les commandes dans le Kanban.
- Traçabilité complète : le temps de chaque étape est enregistré automatiquement.
- Fonctionne également sur tablette avec un scanner Bluetooth.
`,
    tips: [
      "Si vous perdez le focus sur le champ de saisie (en cliquant ailleurs), un simple scan le restaure automatiquement.",
      'Le champ ignore la saisie manuelle plus lente que 50 ms — seul le scanner déclenche l\'avancement.',
    ],
    warnings: [
      "Scanner un code qui est déjà à la dernière étape ne produit aucun effet — la commande y reste.",
    ],
  },
  {
    id: 'processing-cad', category: 'productie', roles: ['all'], order: 3,
    title: 'Usinages et Éditeur CAO',
    image: '/manual/processing-cad.png',
    imageAlt: 'Usinages et Éditeur CAO',
    content: `# Usinages et Éditeur CAO

La page **Usinages** (\`/prelucrari\`) est l'atelier technique pour les fiches de production : trous, charnières, poignées, découpes, façonnages de bord — tous visualisés sur le verre dans un éditeur CAO interactif.

## Fiche d'usinage

- Liste complète des panneaux de la commande (avec dimensions et type de verre).
- Pour chaque panneau : la liste des usinages (code de gabarit + paramètres : distance, diamètre, offset).
- De nombreux usinages sont **remplis automatiquement** à partir de la configuration 3D (charnières, poignées, serrures) — vous ne modifiez que les exceptions.

## Éditeur CAO — raccourcis clavier

| Touche | Action |
|---|---|
| **J** | JOIN — fusionne deux usinages proches (tolérance 10 mm) |
| **Ctrl + D** | Dupliquer l'usinage sélectionné |
| **Ctrl + Shift + D** | Dupliquer **tous** les usinages sur un autre panneau (miroir automatique sur X) |
| **Delete** | Supprimer l'usinage sélectionné |
| **Clic gauche + glisser** | Déplacer l'usinage |
| **Molette de la souris** | Zoom |

## Gabarits

Le catalogue **Gabarits d'usinage** (catégories : **30. charnières & cutout-uri**, **51. trous pour poignées**) se synchronise automatiquement avec les accessoires choisis en 3D. L'ajout d'une nouvelle charnière dans le catalogue génère la découpe correcte sur le verre.

## Export

- **DXF** (R9 → R2010) — pour CNC industrielle, avec mappage des calques.
- **PDF** — pour l'atelier, avec cotes et légende des usinages.
- Le bouton **« Envoyer à la CNC »** génère le DXF + la liste de coupe combinée.
`,
    tips: [
      'Le pas de positionnement est de 0.5 mm ; utilisez la virgule pour les décimales.',
      'Les éléments non sélectionnés sont affichés en noir — sélectionnez pour voir les cotes et les paramètres.',
    ],
    warnings: [
      "Les modifications sur le panneau ne sont enregistrées que lorsque vous appuyez sur **Enregistrer l'usinage** — changer de page sans enregistrer les perd.",
    ],
  },
  {
    id: 'operational-dashboard', category: 'operational', roles: ['all'], order: 0,
    title: 'Tableau de bord Opérationnel',
    image: '/manual/operational-dashboard.png',
    imageAlt: 'Tableau de bord Opérationnel',
    content: `# Tableau de bord Opérationnel

La page **Tableau de bord Opérationnel** (\`/operational\`) est le panneau unique pour l'atelier et la logistique : vous voyez en temps réel ce qui se passe en production, montage, service et découpe.

## Fiches de synthèse

- **Production** : nombre de commandes dans chaque étape Kanban (découpe, polissage, trempe, assemblage, emballage).
- **Montage** : travaux planifiés aujourd'hui / cette semaine, retards.
- **Service** : interventions ouvertes, priorité, SLA.
- **Découpe** : panneaux dans la file d'attente d'optimisation, verre alloué par plaque.

## Rafraîchissement automatique

La page se recharge **automatiquement toutes les 60 secondes** — vous pouvez la laisser affichée en permanence sur un écran TV dans l'atelier.

## Actions rapides

- Cliquer sur n'importe quelle fiche vous amène directement à la page détaillée (Kanban de production, liste de montage, etc.).
- Le bouton **« Rafraîchir maintenant »** force une mise à jour immédiate.
`,
    tips: [
      "Utilisez cette page sur un grand écran dans l'atelier pour une visibilité au niveau de l'équipe.",
      "Pour les indicateurs financiers (chiffre d'affaires, marges), utilisez le Tableau de bord principal.",
    ],
  },
  {
    id: 'reports', category: 'operational', roles: ['all'], order: 3,
    title: 'Rapports',
    image: '/manual/reports.png',
    imageAlt: 'Rapports',
    content: `# Rapports

La page **Rapports** (\`/rapoarte\`) vous offre une visibilité complète sur les ventes et la consommation de matériaux.

## Rapports disponibles

1. **Ventes mensuelles** — chiffre d'affaires par mois, ventilé par catégories (douche, portes, balustrades, etc.) et par agent commercial.
2. **Consommation de matériaux** — quantités de verre, profilés et accessoires consommées sur une période, agrégées par code produit.
3. **Top clients** — classement par valeur de commande sur la période sélectionnée.
4. **Marges** — différence entre le coût de production et le prix de vente, par commande.

## Filtres

- **Plage de dates** (calendrier du / au).
- **Catégorie de produit**.
- **Opérateur** (vendeur).
- **Statut de la commande** (offre, confirmée, en production, livrée).

## Export

Tous les rapports sont exportables en **CSV** avec **BOM UTF-8** (Excel ouvre correctement les caractères diacritiques français).

Les valeurs respectent le sélecteur global **RON / EUR**.
`,
    tips: [
      "Pour une analyse externe dans Excel, utilisez l'export CSV — le BOM garantit que les caractères diacritiques s'affichent correctement.",
      'Les filtres sont conservés entre les sessions pour votre compte.',
    ],
  },
  {
    id: 'installation-reports', category: 'operational', roles: ['all'], order: 4,
    title: 'Rapports de montage',
    image: '/manual/installation-reports.png',
    imageAlt: 'Rapports de montage',
    content: `# Rapports de montage

La page **Rapports de montage** (\`/rapoarte-montaj\`) suit la performance des équipes d'installation et optimise la planification.

## Ce que vous voyez

- **Performance par équipe** : nombre de montages terminés, temps moyen par intervention, distance parcourue.
- **Carte avec itinéraires optimisés** — le système propose l'ordre optimal des interventions de la journée pour chaque équipe (algorithme de minimisation de la distance).
- **Checklist de finalisation** — pourcentage de checklists remplies correctement, signatures des clients.
- **Incidents** — interventions reportées, réclamations, retours.

## Filtres

- **Période** (jour / semaine / mois).
- **Équipe** ou **véhicule**.
- **Zone géographique**.

## Actions rapides

- Cliquer sur une intervention ouvre les détails complets : client, adresse, produits, photos avant/après, signature.
- Le bouton **« Reprogrammer »** déplace l'intervention dans le calendrier sans perdre la checklist remplie.
`,
    tips: [
      "L'itinéraire optimisé prend en compte l'horaire de chaque équipe et les créneaux horaires confirmés avec les clients.",
      'Les alertes de contrôle technique/assurance pour les véhicules apparaissent 30 jours avant leur expiration.',
    ],
  },
  {
    id: 'data-export', category: 'setari', roles: ['all'], order: 17,
    title: 'Export et import des données',
    image: '/manual/export-date.png',
    imageAlt: 'Paramètres › Données — export et import',
    accent: 'green',
    content: `# Export et import des données

Dans **Paramètres → Données** tu as le contrôle complet sur les données saisies dans la plateforme. Toutes les données appartiennent à l'abonné, sont strictement isolées par entreprise (RLS sur \`company_id\`) et **peuvent être exportées ou réimportées à tout moment, sans aucune restriction**.

---

## 1. Export des données

![Zone d'export](/manual/export-date.png)

La carte **Export des données** propose 5 boutons :

- **Clients (CSV)** — liste complète avec nom, type, société, contact, adresse, n° TVA, remise, notes.
- **Devis (CSV)** — tous les devis avec n° réf, produit, client, prix, TVA, marge, statut, date.
- **Commandes (CSV)** — commandes avec numéro, statut, sous-total, remise, total, payé, livraison.
- **Matériaux (CSV)** — votre catalogue avec code, nom, type, unité, prix, stock, fournisseur, emplacement.
- **Export complet (JSON)** — un seul fichier avec les 4 tables + horodatage (\`exported_at\`).

### Comment exporter

1. Va dans **Paramètres → onglet Données**.
2. Clique sur le bouton de la catégorie souhaitée (ou **Export complet** pour tout).
3. Le fichier se télécharge automatiquement. Le nom contient la date : \`clients_2026-05-22.csv\`, \`export_complet_2026-05-22.json\`.
4. Ouvre les CSV directement dans Excel / LibreOffice (BOM UTF-8 garantit les caractères corrects) ou le JSON dans un éditeur de texte.

> **Important pour les abonnés :** tu as le droit RGPD à la **portabilité des données**. Tu peux exporter et conserver localement toutes tes données, à tout moment et autant de fois que tu veux, sans limite.

---

## 2. Import des données

![Zone d'import](/manual/export-date-import.png)

La carte **Import des données** te permet de recharger dans la plateforme des fichiers CSV (par catégorie) ou un JSON complet sauvegardé précédemment. Utile pour :

- la **migration** depuis un autre système (préparer le CSV avec les mêmes en-têtes que l'export),
- la **restauration** après une suppression accidentelle (avec le dernier export complet),
- le **chargement en masse** de clients, matériaux ou devis.

### Comment importer

1. Dans la carte **Import des données** clique sur le bouton de catégorie (Clients / Devis / Commandes / Matériaux) pour CSV, ou **Import complet** pour JSON.
2. Sélectionne le fichier depuis ton ordinateur.
3. Une **boîte de dialogue d'aperçu** s'ouvre montrant : la table cible, le nombre d'enregistrements détectés et les premières colonnes trouvées.
4. Vérifie les données et clique sur **Confirmer l'import** (ou Annuler).
5. À la fin un toast affiche le nombre de lignes importées avec succès / erreurs.

### Clés de conflit (doublons)

L'import utilise une clé unique par table :

| Table | Clé de conflit |
|---|---|
| Clients | \`name\` |
| Devis | \`ref_number\` |
| Commandes | \`order_number\` |
| Matériaux | \`code\` |

Les lignes avec une clé déjà existante peuvent être **écrasées** — fais un export avant l'import si tu veux une copie de sauvegarde.

### Format attendu

- **CSV** — même jeu d'en-têtes que dans l'export correspondant, encodage UTF-8.
- **JSON** — exactement la structure produite par l'**Export complet** (\`clients\`, \`quotes\`, \`orders\`, \`materials\` + \`exported_at\`).

---

## Détails techniques

- L'export télécharge **tous les enregistrements**, avec pagination automatique de 1000 en arrière-plan.
- L'import traite des lots de 100 lignes et injecte automatiquement le contexte entreprise (RLS).
- Tout ce que tu exportes/importes est isolé à ton entreprise.
`,
    tips: [
      'Fais un export complet (JSON) chaque mois — c\'est la forme la plus sûre de sauvegarde locale.',
      'Avant tout import en masse, exporte la table cible pour avoir la version précédente à portée de main.',
      'Pour les CSV avec accents, ouvre dans Excel via *Données → À partir d\'un texte/CSV* avec UTF-8.',
    ],
  },
  {
    id: 'data-protection', category: 'setari', roles: ['all'], order: 18,
    title: 'Protection des données',
    image: '/manual/protectia-datelor.png',
    imageAlt: 'Cartes Sauvegarde / Récupération / Sécurité',
    content: `# Protection des données

La sécurité et la disponibilité de vos données sont la priorité absolue. La plateforme fonctionne sur **l\'infrastructure Lovable Cloud**, avec protection multi-couche et conformité RGPD.

## Sauvegarde automatique

- **Sauvegarde automatique quotidienne**, sans intervention de votre part.
- Historique conservé pendant au moins 7 jours (Point-in-Time Recovery).
- Les sauvegardes sont chiffrées et stockées de manière redondante dans des centres de données européens.

## Récupération

- En cas de perte accidentelle, les données peuvent être récupérées sur demande via l\'équipe support.
- Nous recommandons également un **export local périodique** (voir *Export de données*).

## Sécurité

- **Isolation multi-tenant stricte** via Row-Level Security sur \`company_id\`.
- **Chiffrement en transit** (HTTPS/TLS) et **au repos** sur disque.
- **JWT** pour les sessions, **hachage fort** des mots de passe.
- Vérification **HIBP** à la création de compte et au changement de mot de passe.
- Centres de données européens, conformité **RGPD**.

## Vos droits RGPD

| Droit | Comment l\'exercer |
|---|---|
| Portabilité | Export depuis Paramètres → Données |
| Accès | Consultez toutes vos données dans la plateforme |
| Rectification | Modifiez tout champ dans les interfaces dédiées |
| Effacement | Sur demande via support (\`isoftplustech@gmail.com\`) |

## Recommandations

- Utilisez un **mot de passe fort et unique**.
- Ne partagez pas le compte — créez des utilisateurs dédiés pour les collègues (Paramètres → Équipe).
- **Déconnectez-vous** sur les appareils publics ou partagés.
- Faites un **export mensuel** conservé dans un lieu sûr.
- Voir la [Politique de confidentialité](/privacy-policy) et la [Politique de cookies](/cookie-policy).
`,
    tips: [
      'Vos données restent les vôtres : exportables à tout moment en format ouvert (CSV/JSON).',
      'Combinaison la plus sûre : sauvegarde automatique plateforme + export local mensuel.',
    ],
    warnings: [
      'N\'envoyez jamais votre mot de passe par e-mail, chat ou téléphone — le support ne le demandera jamais.',
    ],
  },
];
