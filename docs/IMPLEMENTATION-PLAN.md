# ScoutMe - Plan d'Implémentation

**Date de création:** 2026-02-02
**Basé sur:** PRD.md v1.0 + Liste des changements OpenSpec
**Statut:** En cours - Sprint 1 MVP

---

## 📊 Vue d'Ensemble

**Total Spécifications:** 57 specs
- **MVP:** 22 specs (8 semaines / 4 sprints)
- **V1:** 18 specs (6-8 semaines post-MVP)
- **V2:** 17 specs (8-12 semaines post-V1)

---

## 🎯 Phase MVP - Sprint 1 (Semaines 1-2)

### Objectif
Implémenter l'authentification et les profils de base (joueur + recruteur + admin)

### Spécifications Sprint 1

| Spec ID | Titre | Priorité | Statut | Fichier |
|---------|-------|----------|--------|---------|
| SPEC-MVP-001 | Authentification Utilisateur de Base | Critique | ✅ Créée | [SPEC-MVP-001](./specs/MVP/SPEC-MVP-001-authentification-basique.md) |
| SPEC-MVP-002 | Validation Email Double Opt-In | Haute | ✅ Créée | [SPEC-MVP-002](./specs/MVP/SPEC-MVP-002-validation-email.md) |
| SPEC-MVP-003 | Récupération Mot de Passe | Moyenne | ⏳ À créer | SPEC-MVP-003-recuperation-mdp.md |
| SPEC-MVP-004 | Création Profil Joueur | Critique | ✅ Créée | [SPEC-MVP-004](./specs/MVP/SPEC-MVP-004-profil-joueur.md) |
| SPEC-MVP-005 | Upload Photo Profil Joueur | Haute | ✅ Créée | [SPEC-MVP-005](./specs/MVP/SPEC-MVP-005-photo-joueur.md) |
| SPEC-MVP-006 | Gestion Vidéos YouTube Joueur | Haute | ✅ Créée | [SPEC-MVP-006](./specs/MVP/SPEC-MVP-006-videos-joueur.md) |
| SPEC-MVP-007 | Création Profil Recruteur | Critique | ⏳ À créer | SPEC-MVP-007-profil-recruteur.md |
| SPEC-MVP-008 | Dashboard Admin Validation Recruteurs | Critique | ⏳ À créer | SPEC-MVP-008-admin-validation.md |

---

## 🏗️ Sprint 2 - Recherche et Affichage (Semaines 3-4)

### Spécifications Sprint 2

| Spec ID | Titre | Priorité | Statut |
|---------|-------|----------|--------|
| SPEC-MVP-009 | API Recherche Joueurs Basique | Critique | ⏳ À créer |
| SPEC-MVP-010 | Interface Recherche Joueurs (Frontend) | Critique | ⏳ À créer |
| SPEC-MVP-011 | Page Profil Joueur Public | Critique | ⏳ À créer |
| SPEC-MVP-012 | Page Dashboard Joueur | Haute | ⏳ À créer |
| SPEC-MVP-013 | Middleware RBAC | Critique | ⏳ À créer |

---

## 🎨 Sprint 3 - Polish et Intégration (Semaines 5-6)

### Spécifications Sprint 3

| Spec ID | Titre | Priorité | Statut |
|---------|-------|----------|--------|
| SPEC-MVP-014 | Page d'Accueil Publique | Moyenne | ⏳ À créer |
| SPEC-MVP-015 | Gestion Erreurs Globale | Haute | ⏳ À créer |
| SPEC-MVP-016 | Tests Responsiveness Mobile | Haute | ⏳ À créer |
| SPEC-MVP-017 | Rate Limiting et Sécurité API | Critique | ⏳ À créer |

---

## 🧪 Sprint 4 - Tests et Lancement (Semaines 7-8)

### Spécifications Sprint 4

| Spec ID | Titre | Priorité | Statut |
|---------|-------|----------|--------|
| SPEC-MVP-018 | Tests E2E Parcours Joueur | Critique | ⏳ À créer |
| SPEC-MVP-019 | Tests E2E Parcours Recruteur | Critique | ⏳ À créer |
| SPEC-MVP-020 | Dashboard Admin Modération Joueurs | Moyenne | ⏳ À créer |
| SPEC-MVP-021 | Documentation API (Swagger/OpenAPI) | Basse | ⏳ À créer |
| SPEC-MVP-022 | Déploiement Production | Critique | ⏳ À créer |

---

## 📈 Phase V1 - Évolution (Post-MVP)

### Sprint V1-1 - Profils Enrichis (Semaines 1-2)

| Spec ID | Titre | Priorité |
|---------|-------|----------|
| SPEC-V1-001 | Galerie Photos Joueur Étendue (5 photos) | Haute |
| SPEC-V1-002 | Biographie Joueur | Moyenne |
| SPEC-V1-003 | Statistiques Joueur Basiques | Moyenne |
| SPEC-V1-004 | Statut Disponibilité Joueur | Haute |
| SPEC-V1-005 | Langues Parlées Joueur | Basse |

### Sprint V1-2 - Dashboard et Notifications (Semaines 3-4)

| Spec ID | Titre | Priorité |
|---------|-------|----------|
| SPEC-V1-006 | Dashboard Joueur avec Statistiques de Vues | Haute |
| SPEC-V1-007 | Tracking Vues Profil Joueur | Haute |
| SPEC-V1-008 | Notifications Email Basiques | Moyenne |

### Sprint V1-3 - Recherche Avancée et Favoris (Semaines 5-6)

| Spec ID | Titre | Priorité |
|---------|-------|----------|
| SPEC-V1-009 | Filtres Recherche Avancés | Haute |
| SPEC-V1-010 | Tri Résultats Recherche | Moyenne |
| SPEC-V1-011 | Watchlist / Favoris Recruteur | Haute |
| SPEC-V1-012 | Historique Recherches Recruteur | Basse |
| SPEC-V1-013 | Export Liste Joueurs (PDF/CSV) | Basse |

### Sprint V1-4 - Système de Badges et Multilingue (Semaines 7-8)

| Spec ID | Titre | Priorité |
|---------|-------|----------|
| SPEC-V1-014 | Badges de Confiance | Moyenne |
| SPEC-V1-015 | Système de Signalement | Moyenne |
| SPEC-V1-016 | Internationalisation (i18n) FR/EN | Critique |
| SPEC-V1-017 | Pages Légales (CGU, Privacy, About) | Haute |
| SPEC-V1-018 | Préparation Système de Paiement (Inactif) | Basse |

---

## 🚀 Phase V2 - Consolidation et Écosystème (Post-V1)

### Sprint V2-1 - Activation Monétisation Joueurs (Semaines 1-3)

| Spec ID | Titre | Priorité |
|---------|-------|----------|
| SPEC-V2-001 | Système de Boost Profil Joueur | Critique |
| SPEC-V2-002 | Interface Achat Boost Joueur | Haute |
| SPEC-V2-003 | Webhooks Paiement (Fedapay/Stripe) | Critique |
| SPEC-V2-004 | Statistiques Détaillées Profils Boostés | Moyenne |

### Sprint V2-2 - Activation Monétisation Recruteurs (Semaines 4-6)

| Spec ID | Titre | Priorité |
|---------|-------|----------|
| SPEC-V2-005 | Système de Crédits Recruteur | Critique |
| SPEC-V2-006 | Interface Achat Crédits Recruteur | Haute |
| SPEC-V2-007 | Dashboard Consommation Crédits | Moyenne |
| SPEC-V2-008 | Abonnement Recruteur Illimité | Moyenne |

### Sprint V2-3 - Messagerie Interne (Semaines 7-9)

| Spec ID | Titre | Priorité |
|---------|-------|----------|
| SPEC-V2-009 | Messagerie Interne Sécurisée | Haute |
| SPEC-V2-010 | Interface Messagerie (Frontend) | Haute |
| SPEC-V2-011 | Notifications Messages Non Lus | Moyenne |

### Sprint V2-4 - Écosystème et Opportunités (Semaines 10-12)

| Spec ID | Titre | Priorité |
|---------|-------|----------|
| SPEC-V2-012 | Annuaire Clubs et Académies | Moyenne |
| SPEC-V2-013 | Section Opportunités (Tryouts/Recrutements) | Moyenne |
| SPEC-V2-014 | Comparaison de Joueurs (Side-by-Side) | Basse |
| SPEC-V2-015 | Système de Réputation Recruteurs | Basse |
| SPEC-V2-016 | Upload Vidéos Direct (Cloudinary) | Basse |
| SPEC-V2-017 | Support 2FA (Authentification à Deux Facteurs) | Basse |

---

## 📋 Suivi de l'Implémentation

### Workflow par Spécification

1. **Créer la spec** dans `docs/specs/[PHASE]/SPEC-XXX-YYY.md`
2. **Réviser la spec** (validation requirements)
3. **Implémenter** backend + frontend
4. **Tester** (unitaires + intégration + E2E si applicable)
5. **Documenter** (API docs, README updates)
6. **Déployer** staging puis production
7. **Marquer comme ✅ Complète**

### Conventions de Nommage

**Fichiers Spec:**
```
SPEC-[PHASE]-[NUM]-[nom-court].md

Exemples:
- SPEC-MVP-001-authentification-basique.md
- SPEC-V1-009-filtres-avances.md
- SPEC-V2-001-boost-profil.md
```

---

## 🎯 Priorités Actuelles

### ⚡ En cours (Sprint 1 MVP)
- [x] SPEC-MVP-001: Authentification Basique
- [x] SPEC-MVP-002: Validation Email
- [x] SPEC-MVP-003: Récupération Mot de Passe (spec créée)
- [x] SPEC-MVP-004: Profil Joueur (spec créée + implémentée)
- [x] SPEC-MVP-005: Photo Joueur (spec créée + implémentée)
- [x] SPEC-MVP-006: Vidéos YouTube (spec créée + implémentée)
- [ ] SPEC-MVP-007: Profil Recruteur
- [ ] SPEC-MVP-008: Admin Validation

### 📅 Prochainement (Sprint 2 MVP)
- SPEC-MVP-009 à SPEC-MVP-013

### 🔮 Plus tard
- V1 (18 specs) - Après validation MVP
- V2 (17 specs) - Après KPIs V1 atteints

---

## 📊 Métriques de Progression

### MVP
- **Specs créées:** 6/22 (27%)
- **Specs implémentées:** 3/22 (14%)
- **Tests écrits:** 0/22 (0%)

### Timeline Globale
- **Phase MVP:** Semaines 1-8 (en cours)
- **Phase V1:** Semaines 9-16
- **Phase V2:** Semaines 17-28

---

## 🔗 Liens Utiles

- [PRD.md](./PRD.md) - Product Requirements Document
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture Technique
- [CLAUDE.md](./CLAUDE.md) - Guide Claude Code
- [Specs MVP](./specs/MVP/) - Spécifications MVP
- [Specs V1](./specs/V1/) - Spécifications V1
- [Specs V2](./specs/V2/) - Spécifications V2

---

**Dernière mise à jour:** 2026-02-02
**Statut:** Sprint 1 MVP en cours
