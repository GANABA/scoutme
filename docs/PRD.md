# ScoutMe - Product Requirements Document (PRD)

**Version :** 1.0
**Date :** 2026-02-01
**Statut :** Draft initial - Prêt pour développement MVP

---

## 📋 Table des matières

1. [Vision et contexte](#vision-et-contexte)
2. [Problème résolu](#problème-résolu)
3. [Utilisateurs cibles](#utilisateurs-cibles)
4. [Scope et périmètre](#scope-et-périmètre)
5. [Modèle économique](#modèle-économique)
6. [Fonctionnalités par phase](#fonctionnalités-par-phase)
7. [Exigences techniques](#exigences-techniques)
8. [Exigences non-fonctionnelles](#exigences-non-fonctionnelles)
9. [Critères de succès](#critères-de-succès)
10. [Glossaire](#glossaire)

---

## 🌍 Vision et contexte

### Contexte global

ScoutMe est une plateforme pensée pour répondre à un problème réel dans le monde du sport, particulièrement du football au Bénin et dans les pays africains en général : **le manque de visibilité des talents** et **la difficulté pour les recruteurs de trouver les bons profils rapidement**.

#### Situation actuelle

- Beaucoup de joueurs talentueux ne sont jamais repérés
- Les recruteurs perdent du temps à chercher des profils fiables
- Les données des joueurs sont dispersées (vidéos, CV, contacts, stats…)
- La mise en relation repose encore beaucoup sur le réseau et le hasard

### Vision du projet

ScoutMe se positionne comme :

- Un espace où les joueurs peuvent présenter leur potentiel de manière professionnelle
- Un outil où les recruteurs peuvent chercher, analyser et contacter efficacement
- Un écosystème basé sur la méritocratie sportive et la visibilité réelle

**L'objectif :** Créer un pont digital entre ambition sportive et opportunité professionnelle.

### Positionnement émotionnel

**Pour les joueurs :**
- Espoir
- Motivation
- Fierté
- Projection vers le haut niveau

**Pour les recruteurs :**
- Efficacité
- Fiabilité
- Gain de temps
- Vision claire du marché des talents

### Valeurs fondamentales

1. **Transparence** - Pas de fausses promesses
2. **Méritocratie** - Le talent et le travail doivent être visibles
3. **Accessibilité** - Inscription simple, expérience fluide
4. **Professionnalisme** - Même un jeune joueur doit se sentir présenté comme un pro

---

## 💡 Problème résolu

### Côté joueur (AVANT ScoutMe)

- CV PDF non structuré
- Vidéos YouTube perdues ou absentes
- Contacts informels
- Peu de crédibilité digitale
- Peu de connaissance sur les clubs/académies qui existent
- Presque jamais au courant des opportunités

### Côté joueur (AVEC ScoutMe)

- Profil structuré et professionnel
- Parcours lisible
- Vidéos centralisées
- Présentation professionnelle
- Bonne connaissance des clubs et académies disponibles
- Visibilité auprès des recruteurs

### Côté recruteur (AVANT ScoutMe)

- Recherche manuelle chronophage
- Dépendance aux réseaux personnels
- Données incomplètes ou non fiables
- Difficulté à comparer les profils

### Côté recruteur (AVEC ScoutMe)

- Recherche ciblée et efficace
- Profils comparables et structurés
- Accès direct aux joueurs
- Gain de temps considérable

---

## 👥 Utilisateurs cibles

### 1️⃣ Les joueurs

**Profil :**
- Principalement jeunes ou semi-professionnels
- Âge : 16-28 ans (majorité)
- Localisés en Afrique de l'Ouest

**Besoins :**
- Être visibles par les recruteurs
- Montrer leurs vidéos et photos de manière professionnelle
- Structurer leur parcours sportif
- Être contactés pour des opportunités
- Se créer une identité sportive crédible

**Attentes de ScoutMe :**
- Sentiment de professionnalisme
- Simplicité d'utilisation
- Motivation et espoir
- Vitrine valorisante

### 2️⃣ Les recruteurs / clubs / agents / académies

**Profil :**
- Scouts professionnels
- Directeurs techniques de clubs
- Agents de joueurs
- Responsables d'académies

**Besoins :**
- Gagner du temps dans la recherche de talents
- Trouver des profils précis selon critères
- Voir rapidement le potentiel réel d'un joueur
- Contacter facilement les joueurs

**Attentes de ScoutMe :**
- Confiance dans les données
- Clarté et structure des informations
- Outils de recherche puissants
- Données exploitables rapidement

---

## 🎯 Scope et périmètre

### Géographie

- **MVP :** Afrique de l'Ouest (Bénin, Togo, Sénégal, Côte d'Ivoire, Ghana, Nigeria, etc.)
- **V1 :** Afrique de l'Ouest (Bénin, Togo, Sénégal, Côte d'Ivoire, Ghana, Nigeria, etc.)
- **V2+ :** Extension Afrique entière

### Langues

- **MVP :** Français uniquement
- **V1 :** Bilingue Français/Anglais
- **Hors périmètre :** Autres langues (portugais, arabe, langues locales)

### Sports

- **Focus exclusif :** Football
- **Hors périmètre :** Autres sports (basket, handball, etc.)

### Acquisition utilisateurs

- Réseaux sociaux (Instagram, Facebook, TikTok)
- Bouche-à-oreille
- Partenariats avec académies et clubs locaux
- Marketing terrain (affiches, événements sportifs)

---

## 💰 Modèle économique

### Philosophie

- **Phase initiale (MVP + V1) :** Tout gratuit pour construire la masse critique
- **Approche :** Value-first (apporter de la valeur avant de monétiser)
- **Flexibilité :** Modèle économique évolutif selon adoption et feedback

### Modèle de monétisation (V2+)

#### 🎮 Côté JOUEUR : Pay-per-Boost

**Offre gratuite (permanente) :**
- Profil complet avec toutes les informations
- 3 vidéos YouTube
- Visibilité dans les recherches
- Contactable par les recruteurs

**Offre payante (boost ponctuel) :**
- **500 FCFA (~0,80€)** = Profil boosté 7 jours
- **1 500 FCFA (~2,50€)** = Profil boosté 30 jours
- **3 000 FCFA (~5€)** = Profil boosté 90 jours + badge premium

**Avantages boost :**
- Apparaît en haut des résultats de recherche
- Badge "Profil Boosté" visible
- Statistiques de visibilité détaillées
- Priorité dans les notifications recruteurs

**Logique :**
- Pas d'abonnement récurrent (adapté au contexte africain)
- Paiement uniquement quand le joueur en a besoin
- Compatible mobile money (Orange Money, MTN, Moov)

#### 💼 Côté RECRUTEUR : Crédit de contacts

**Offre gratuite (permanente) :**
- Inscription et validation
- Recherche illimitée de joueurs
- Consultation illimitée des profils (infos, vidéos, photos)
- **MAIS pas d'accès direct aux coordonnées**

**Offre payante (crédits) :**
- **1 crédit = révélation de 1 contact joueur** (téléphone/email)
- Pack 10 crédits = **5 000 FCFA (~8€)**
- Pack 50 crédits = **20 000 FCFA (~32€)**
- Pack 100 crédits = **35 000 FCFA (~56€)**

**Alternative abonnement (si usage intensif) :**
- **20 000 FCFA/mois (~32€)** = crédits illimités + features avancées

**Logique :**
- Recruteur paie uniquement pour ce qu'il utilise
- Pas d'engagement mensuel forcé au départ
- Incitation naturelle à l'abonnement si usage fréquent

### Méthodes de paiement (V2)

**Prioritaires (Afrique) :**
- Orange Money
- MTN Mobile Money
- Moov Money
- Wave

**Agrégateur de paiement :**
- Fedapay (recommandé pour Afrique de l'Ouest)
- CinetPay
- Paydunya

**Secondaires :**
- Stripe (pour cartes bancaires internationales)

### Conditions d'activation de la monétisation

**Indicateurs minimums requis :**
- ✅ Au moins 500 joueurs actifs
- ✅ Au moins 30 recruteurs actifs
- ✅ Au moins 50 contacts établis/mois
- ✅ Au moins 3-5 "success stories" documentées (joueurs signés via la plateforme)

---

## 🏗️ Fonctionnalités par phase

### 🎯 MVP - Version Minimale Viable (Phase 1)

**Objectif :** Valider que le concept fonctionne (joueur crée profil → recruteur trouve → contact établi)

**Durée estimée :** 3-4 mois de développement

**Business model :** 100% gratuit

#### Fonctionnalités JOUEUR

**Inscription/Authentification**
- Inscription par email + mot de passe
- Validation email (double opt-in)
- Connexion / Déconnexion
- Récupération mot de passe

**Profil joueur**
- Informations personnelles
  - Nom complet
  - Date de naissance (calcul automatique de l'âge)
  - Nationalité
  - Ville actuelle
  - Pays
- Informations sportives
  - Position principale (Gardien, Défenseur central, Latéral gauche, etc.)
  - Position(s) secondaire(s) (optionnel)
  - Pied fort (Gauche / Droit / Ambidextre)
  - Taille (en cm)
  - Poids (en kg)
- Parcours sportif
  - Clubs précédents (nom + période, format texte libre)
  - Club actuel (optionnel)
- Médias
  - 1 photo de profil (obligatoire)
  - Jusqu'à 3 vidéos YouTube (lien embed)
- Contact
  - Numéro de téléphone
  - Email (automatiquement celui d'inscription)

**Actions joueur**
- Créer/éditer son profil
- Uploader photo de profil
- Ajouter/supprimer vidéos YouTube (max 3)
- Prévisualiser son profil (vue publique)
- Voir son propre profil tel que vu par les recruteurs

#### Fonctionnalités RECRUTEUR

**Inscription/Authentification**
- Inscription par email + mot de passe
- Informations obligatoires
  - Nom complet
  - Structure (club / académie / agence)
  - Pays
  - Email de contact
- **Statut initial :** "En attente de validation"
- Validation manuelle par administrateur (vérification téléphonique recommandée)
- Connexion / Déconnexion

**Recherche de joueurs**
- Filtres de base
  - Position (dropdown)
  - Tranche d'âge (min/max)
  - Pays
- Affichage résultats
  - Vue liste (cards)
  - Informations affichées par card : photo, nom, âge, position, ville, pays
  - Clic sur card → profil complet

**Consultation profil joueur**
- Accès à toutes les informations du profil
- Visionnage des vidéos YouTube
- Accès direct aux coordonnées (téléphone/email affichés)

#### Fonctionnalités ADMIN

**Dashboard administrateur**
- Liste des recruteurs en attente de validation
- Actions : Approuver / Rejeter
- Liste des profils joueurs
- Actions : Masquer / Signaler (modération manuelle)

#### Contraintes MVP

- Interface 100% responsive (mobile-first)
- Design simple et professionnel
- Langue : Français uniquement
- Vidéos : liens YouTube uniquement (pas d'upload direct)
- 100% gratuit (pas de paiement)
- Pas de messagerie interne
- Pas de notifications automatiques

#### KPIs MVP

- 50-100 joueurs inscrits
- 5-10 recruteurs validés
- Au moins 1 contact réel établi via la plateforme

---

### 📈 V1 - Première évolution (Phase 2)

**Objectif :** Améliorer l'expérience, augmenter l'engagement, préparer la monétisation

**Démarrage :** Après validation MVP

**Business model :** Toujours 100% gratuit

#### Nouvelles fonctionnalités JOUEUR

**Profil enrichi**
- Galerie photos étendue (jusqu'à 5 photos)
- Biographie / Présentation personnelle (texte libre, max 500 caractères)
- Statistiques de base (optionnelles)
  - Nombre de matchs joués (saison en cours)
  - Buts marqués
  - Passes décisives
  - Minutes jouées
- Disponibilité
  - Disponible pour transfert
  - En contrat (non disponible)
  - Ouvert à prêt
- Langues parlées (multi-sélection : Français, Anglais, autres)

**Tableau de bord joueur**
- Nombre total de vues du profil
- Date de dernière consultation par un recruteur
- Statistiques basiques (graphique simple)

#### Nouvelles fonctionnalités RECRUTEUR

**Recherche avancée**
- Nouveaux filtres
  - Disponibilité (disponible / en contrat / prêt)
  - Taille (min/max en cm)
  - Poids (min/max en kg)
  - Recherche par nom
- Tri des résultats
  - Plus récents
  - Plus consultés
  - Ordre alphabétique

**Outils recruteur**
- Watchlist / Favoris (sauvegarder des joueurs)
- Historique des recherches récentes (5 dernières)
- Export simple (liste de joueurs en PDF ou CSV)

#### Nouvelles fonctionnalités SYSTÈME

**Badges de confiance**
- "Profil Vérifié" (validé manuellement par admin)
- "Vidéo Récente" (upload < 3 mois)
- "Profil Complet" (toutes sections remplies à 100%)

**Notifications email basiques**
- Joueur : "Votre profil a été consulté par un recruteur"
- Recruteur : "Nouveaux joueurs correspondent à vos critères de recherche"

**Système de signalement**
- Joueurs peuvent signaler un recruteur suspect
- Recruteurs peuvent signaler un profil joueur inapproprié
- Admin reçoit alertes et modère

**Multilingue**
- **Interface bilingue Français/Anglais**
- Sélecteur de langue dans header
- Traduction complète de l'interface

**Pages légales**
- Page "À propos" / "Comment ça marche"
- Conditions Générales d'Utilisation (CGU)
- Politique de Confidentialité (RGPD-friendly)

#### Préparation monétisation

**Intégration système de paiement**
- Configuration Fedapay/CinetPay (mobile money)
- Configuration Stripe (cartes bancaires)
- Interface paiement créée mais **non activée**
- Logique freemium/crédits codée mais **désactivée** (feature flags)

#### KPIs V1

- 500+ joueurs actifs
- 30+ recruteurs actifs
- 20+ contacts établis/mois
- 2-3 partenariats avec académies
- Engagement régulier (retours utilisateurs, sessions répétées)

---

### 🚀 V2 - Consolidation et écosystème (Phase 3)

**Objectif :** Devenir plateforme complète, activer monétisation, développer l'écosystème

**Démarrage :** Quand KPIs V1 atteints + success stories documentées

**Business model :** Activation du modèle freemium (Pay-per-boost + Crédits)

#### Activation monétisation

**Côté joueur**
- Système de boost de profil activé
- Interface achat boost (sélection durée 7/30/90 jours)
- Paiement mobile money
- Badge "Profil Boosté" visible
- Statistiques détaillées pour profils boostés

**Côté recruteur**
- Système de crédits activé
- Barrière sur révélation contacts (nécessite crédits)
- Interface achat de packs de crédits
- Dashboard consommation crédits
- Proposition abonnement si usage intensif

#### Nouvelles fonctionnalités JOUEUR

**Profil avancé**
- Statistiques détaillées (graphiques saison par saison)
- Upload vidéos directement (en plus de YouTube)
- Upload documents (certificats, diplômes sport-études)
- Lien avec agent/représentant (si applicable)
- Biographie multilingue (FR + EN)

**Outils joueur**
- Comparaison de son profil avec profils similaires
- Suggestions d'amélioration profil (complétion %)
- Alertes opportunités (clubs qui cherchent son profil)

#### Nouvelles fonctionnalités RECRUTEUR

**Communication**
- Messagerie interne sécurisée (conversations dans la plateforme)
- Historique des conversations
- Notifications messages non lus

**Outils avancés**
- Notes privées sur profils joueurs
- Comparaison de joueurs (side-by-side, jusqu'à 3 joueurs)
- Alertes personnalisées (nouveaux joueurs matching critères exacts)
- Tableau de bord analytics
  - Joueurs les plus consultés
  - Tendances positions/âges
  - Taux de conversion recherche → contact

#### Écosystème élargi

**Annuaire clubs/académies**
- Page dédiée par structure
- Informations : nom, pays, ville, coordonnées, présentation
- Liste des joueurs affiliés
- Recherche de clubs par pays/ville

**Section Opportunités**
- Clubs peuvent poster des annonces (tryouts, sélections, recrutement)
- Joueurs peuvent consulter et postuler
- Système de candidatures

**Système de réputation**
- Avis anonymes sur recruteurs (optionnel, modéré)
- Indicateur "profil actif" (dernière connexion)
- Badge "Recruteur Premium" (abonnés)

#### Améliorations système

**Sécurité renforcée**
- Vérification identité optionnelle (upload pièce d'identité)
- 2FA (authentification à deux facteurs)

**Modération**
- Détection semi-automatisée contenus inappropriés (photos, textes)
- Système de scoring profils (qualité, complétion)

**Support utilisateurs**
- Chat support ou email dédié
- FAQ dynamique
- Tutoriels vidéo

**Contenu**
- Blog/Ressources
  - Conseils joueurs (comment faire une bonne vidéo highlight)
  - Guides recruteurs (comment identifier un talent)
  - Success stories

#### Expansion géographique

- Marketing actif Afrique de l'Ouest (Sénégal, Côte d'Ivoire, Ghana, Nigeria)
- Partenariats clubs/académies régionaux
- Campagnes réseaux sociaux ciblées par pays

#### KPIs V2

- 2000+ joueurs actifs
- 100+ recruteurs actifs
- Revenus mensuels récurrents (MRR) viable
- Net Promoter Score (NPS) positif
- Au moins 10 success stories documentées

---

### ❌ Hors périmètre (futur lointain ou jamais)

**Fonctionnalités complexes**
- Analyse vidéo par IA (détection automatique highlights, reconnaissance gestes)
- Application mobile native iOS/Android (rester web responsive)
- Système de contrats/signatures digitales
- Gestion financière (salaires, transferts, commissions)
- Streaming live de matchs
- Réseau social complet (fil d'actualité, likes, commentaires publics)
- Marketplace équipements sportifs
- Réservation terrains/infrastructures

**Fonctionnalités juridiques/administratives**
- Gestion complète de carrière (agenda, contrats, calendrier matchs)
- Intégration avec fédérations officielles (FIFA, CAF)
- Vérification juridique des transferts

**Expansion hors-football**
- Autres sports (basket, handball, etc.)
- Extension hors Afrique (Europe, Amérique du Sud)

**Technique complexe**
- API publique pour développeurs tiers
- Infrastructure propre hébergement vidéo (coûts prohibitifs)
- Mode offline complet (PWA avancé)

---

## 🛠️ Architecture technique

**Note :** Tous les détails techniques (stack, infrastructure, base de données, sécurité, déploiement) sont documentés dans **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

### Résumé des choix techniques

**Stack retenue :**
- Frontend : React + Next.js + TailwindCSS
- Backend : Node.js + Express.js + Prisma ORM
- Base de données : PostgreSQL
- Hébergement : Vercel (frontend) + Render (backend + DB)

**Services tiers :**
- Stockage photos : Cloudinary
- Vidéos : YouTube embed (MVP)
- Email : Resend
- Paiements : Fedapay (mobile money) + Stripe (cartes)

Pour plus de détails, consulter **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

## 🎨 Exigences non-fonctionnelles

### Performance

**Temps de chargement**
- Page d'accueil : < 2 secondes
- Recherche joueurs : < 3 secondes
- Profil joueur : < 2 secondes (sans vidéos YouTube)

**Optimisations**
- Lazy loading images
- Pagination résultats recherche (20 joueurs/page)
- Cache côté serveur (Redis optionnel V2)
- CDN pour assets statiques

### Disponibilité

- Uptime cible : 99.5% (tolérance ~3.6h downtime/mois)
- Backup base de données : quotidien (rétention 30 jours)
- Plan de reprise après incident (disaster recovery)

### Accessibilité

- Responsive design (mobile, tablette, desktop)
- Support navigateurs : Chrome, Firefox, Safari, Edge (2 dernières versions)
- Contraste couleurs WCAG AA minimum
- Navigation clavier possible

### UX/UI

**Principes de design**
- Mobile-first (60%+ traffic attendu sur mobile en Afrique)
- Interface claire et épurée
- Call-to-action évidents
- Formulaires guidés (tooltips, exemples)

**Design system**
- Palette couleurs cohérente (définir brand colors)
- Typographie lisible (minimum 16px body text)
- Iconographie cohérente (library type Heroicons, Lucide)

**Gestion des erreurs**
- Messages d'erreur clairs et actionnables (pas de jargon technique)
- Validation en temps réel formulaires (feedback immédiat)
- États de chargement (spinners, skeletons)

### Scalabilité

L'application doit pouvoir supporter la croissance progressive des utilisateurs :
- **MVP :** 100-500 utilisateurs simultanés
- **V1 :** 1000+ utilisateurs simultanés
- **V2 :** 5000+ utilisateurs simultanés

**Note :** Les détails d'architecture pour la scalabilité sont dans [ARCHITECTURE.md](./ARCHITECTURE.md).

### Internationalisation (i18n)

**Langues supportées par phase :**
- **MVP :** Français uniquement
- **V1 :** Français + Anglais (bilingue)
- **V2+ :** Possibles extensions (Portugais, Arabe)

L'utilisateur doit pouvoir choisir sa langue via un sélecteur dans l'interface.

### Conformité légale

**RGPD/Protection données**
- Base légale : consentement (joueurs) + intérêt légitime (recruteurs)
- DPO (Data Protection Officer) désigné (peut être le fondateur au début)
- Registre des traitements
- Politique de confidentialité claire

**Mineurs (<18 ans)**
- Mention obligatoire : "Consentement parental requis pour les moins de 18 ans"
- Vérification âge lors inscription
- Option upload consentement parental (V2)

**Propriété intellectuelle**
- CGU : Joueurs conservent droits sur leurs vidéos/photos
- Licence d'utilisation accordée à ScoutMe (affichage, promotion)
- Droit de retrait (suppression compte = suppression médias)

---

## 📊 Critères de succès

### MVP - Validation du concept

**Métriques quantitatives**
- ✅ 50-100 joueurs inscrits avec profil complet
- ✅ 5-10 recruteurs validés et actifs
- ✅ Au moins 1 contact établi via la plateforme documenté

**Métriques qualitatives**
- ✅ Feedback positif utilisateurs (interviews, retours directs)
- ✅ Taux de complétion profil joueur > 70%
- ✅ Taux d'activation recruteurs (recherche + consultation) > 50%

**Validation business**
- ✅ Au moins 1 joueur signé dans un club via ScoutMe (success story)
- ✅ Intérêt confirmé de 2-3 académies pour partenariat

---

### V1 - Croissance et engagement

**Métriques quantitatives**
- ✅ 500+ joueurs actifs (connectés dans les 30 derniers jours)
- ✅ 30+ recruteurs actifs
- ✅ 20+ contacts établis/mois
- ✅ Taux de rétention J30 joueurs > 40%
- ✅ Taux de rétention J30 recruteurs > 60%

**Métriques qualitatives**
- ✅ NPS (Net Promoter Score) > 30
- ✅ 2-3 partenariats académies formalisés
- ✅ 3-5 success stories documentées (témoignages vidéo)

**Préparation monétisation**
- ✅ Système de paiement testé et fonctionnel (transactions test)
- ✅ 20%+ joueurs déclarent "prêts à payer pour boost" (sondage)
- ✅ 30%+ recruteurs déclarent "prêts à payer pour crédits" (sondage)

---

### V2 - Monétisation et pérennité

**Métriques quantitatives**
- ✅ 2000+ joueurs actifs
- ✅ 100+ recruteurs actifs
- ✅ MRR (Monthly Recurring Revenue) > seuil de rentabilité (à définir selon coûts)
- ✅ Taux de conversion freemium joueurs > 5%
- ✅ Taux de conversion freemium recruteurs > 15%
- ✅ CAC (Customer Acquisition Cost) < LTV (Lifetime Value) × 3

**Métriques qualitatives**
- ✅ NPS > 50
- ✅ Au moins 10 success stories publiques
- ✅ Couverture presse locale (articles, interviews)
- ✅ Reconnaissance dans l'écosystème football africain

**Expansion**
- ✅ Présence active dans 3+ pays Afrique de l'Ouest
- ✅ 5+ partenariats clubs/académies actifs

---

## 📖 Glossaire

**Termes métier**

- **Joueur** : Footballeur inscrit sur la plateforme cherchant visibilité et opportunités
- **Recruteur** : Professionnel (scout, agent, directeur technique) recherchant des talents
- **Académie** : Centre de formation de jeunes joueurs
- **Agent** : Intermédiaire professionnel représentant des joueurs
- **Tryout** : Séance d'essai organisée par un club
- **Success story** : Cas documenté d'un joueur ayant trouvé une opportunité via ScoutMe

**Termes techniques**

- **Boost** : Mise en avant payante d'un profil joueur dans les résultats de recherche
- **Crédit** : Unité permettant à un recruteur de révéler les coordonnées d'un joueur
- **Profil vérifié** : Profil validé manuellement par l'équipe ScoutMe (badge de confiance)
- **Profil complet** : Profil joueur avec toutes les sections renseignées (100%)
- **Watchlist** : Liste de joueurs sauvegardés par un recruteur (favoris)
- **Mobile money** : Système de paiement mobile (Orange Money, MTN, Moov, etc.)

**Acronymes**

- **MVP** : Minimum Viable Product (Produit Minimum Viable)
- **KPI** : Key Performance Indicator (Indicateur Clé de Performance)
- **MRR** : Monthly Recurring Revenue (Revenus Récurrents Mensuels)
- **NPS** : Net Promoter Score (Score de Recommandation Net)
- **CAC** : Customer Acquisition Cost (Coût d'Acquisition Client)
- **LTV** : Lifetime Value (Valeur Vie Client)
- **RGPD** : Règlement Général sur la Protection des Données
- **CGU** : Conditions Générales d'Utilisation
- **2FA** : Two-Factor Authentication (Authentification à Deux Facteurs)
- **RBAC** : Role-Based Access Control (Contrôle d'Accès Basé sur les Rôles)

---

## 🚀 Prochaines étapes recommandées

### Phase 1 : Validation terrain (1-2 semaines)
- Interviewer 5-10 joueurs potentiels (valider besoins réels)
- Interviewer 2-3 recruteurs (valider utilité outil)
- Créer landing page pré-inscription (mesurer intérêt)

### Phase 2 : Design UX/UI (1-2 semaines)
- Wireframes principaux (inscription, profil, recherche)
- User flows critiques
- Maquettes visuelles (optionnel mais recommandé)

### Phase 3 : Développement MVP (8 semaines)
**Objectif :** Livrer version fonctionnelle avec fonctionnalités core

Voir **[ARCHITECTURE.md](./ARCHITECTURE.md)** pour le détail des sprints de développement.

### Phase 4 : Lancement et itération
- Tests utilisateurs (5-10 personnes)
- Lancement soft (cercle restreint)
- Collecte feedback intensif
- Itérations rapides selon learnings

---

## 📝 Notes finales

**Philosophie produit**
- Itération rapide > perfection
- Feedback utilisateurs > assumptions
- Simplicité > fonctionnalités
- Impact réel > vanity metrics

**Risques identifiés**
- Problème poule/œuf (besoin joueurs ET recruteurs simultanément)
- Qualité variable des profils joueurs (vidéos, infos)
- Fraude potentielle (faux profils, arnaques)
- Adoption lente si pas de success stories rapides

**Atouts différenciants**
- Focus exclusif football africain
- Compréhension contexte local (mobile money, réseaux sociaux)
- Approche value-first (gratuit au départ)
- Modèle économique flexible et accessible

---

**Ce PRD est un document vivant.** Il doit être mis à jour régulièrement selon les learnings, feedback utilisateurs et évolutions du marché.

**Version :** 1.0
**Dernière mise à jour :** 2026-02-01
**Prochaine revue :** Post-MVP (après 3 mois de lancement)
