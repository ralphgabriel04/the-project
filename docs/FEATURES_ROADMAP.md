# 🎯 THE PROJECT — Roadmap Fonctionnalités

> Inspiré de [Hexfit](https://www.myhexfit.com/en/) — Leader du marché avec 6000+ professionnels et 100,000+ athlètes

---

## 📊 Benchmark Hexfit (Référence)

| Métrique | Hexfit | Objectif THE PROJECT |
|----------|--------|----------------------|
| Temps économisé | 4.8h/semaine | 3h+/semaine |
| Satisfaction client | 97% | 95%+ |
| Engagement membres | +300% | +200% |
| Banque d'exercices | 13,000+ | 500+ (MVP) |

---

## 🏗️ Architecture Fonctionnelle

### 🎯 MVP (Phase 1-2) — En cours

| Fonctionnalité | Coach | Athlète | Statut |
|----------------|-------|---------|--------|
| Authentification | ✅ | ✅ | ✅ Fait |
| Dashboard personnalisé | ✅ | ✅ | ✅ Fait |
| Création de programmes | ✅ | ❌ | 🔜 À faire |
| Gestion des athlètes | ✅ | ❌ | 🔜 À faire |
| Consultation programmes | ❌ | ✅ | 🔜 À faire |
| Suivi des séances | ❌ | ✅ | 🔜 À faire |
| Saisie performances | ❌ | ✅ | 🔜 À faire |

---

## 🚀 Fonctionnalités Phares (Inspirées de Hexfit)

### 📋 1. Création de Programmes (Coach)

**Hexfit propose :**
- Circuits, CrossFit, Cardio, HIIT
- Templates réutilisables
- Duplication de programmes
- Périodisation sur plusieurs semaines

**THE PROJECT — Implémentation :**

```
Programme
├── Informations générales
│   ├── Nom du programme
│   ├── Description
│   ├── Durée (semaines)
│   ├── Objectif (force, hypertrophie, endurance, perte de poids)
│   └── Niveau (débutant, intermédiaire, avancé)
│
├── Structure
│   ├── Semaines
│   │   ├── Séances
│   │   │   ├── Exercices
│   │   │   │   ├── Nom
│   │   │   │   ├── Séries x Répétitions
│   │   │   │   ├── Charge suggérée (% 1RM ou kg)
│   │   │   │   ├── Tempo (ex: 3-1-2-0)
│   │   │   │   ├── Repos
│   │   │   │   ├── Notes/instructions
│   │   │   │   └── Vidéo démonstration (optionnel)
│
└── Actions
    ├── Dupliquer le programme
    ├── Créer un template
    ├── Assigner à un athlète
    └── Archiver
```

**Priorité MVP :** ⭐⭐⭐ Critique

---

### 📱 2. Application Mobile / Suivi (Athlète)

**Hexfit propose :**
- Consultation du programme du jour
- Saisie des performances en temps réel
- Commentaires post-séance
- Visualisation des progrès

**THE PROJECT — Implémentation :**

```
Vue Athlète
├── Aujourd'hui
│   ├── Séance du jour (ou prochaine)
│   ├── Rappel motivationnel
│   └── Bouton "Commencer la séance"
│
├── Mode Entraînement (plein écran)
│   ├── Exercice en cours (grand)
│   ├── Timer de repos
│   ├── Saisie rapide : poids + reps
│   ├── RPE (1-10) par série
│   ├── Navigation : Précédent / Suivant
│   └── Bouton "Terminer la séance"
│
├── Fin de séance
│   ├── Résumé (durée, volume total)
│   ├── RPE global
│   ├── Commentaire athlète
│   └── Upload photo (optionnel)
│
└── Historique
    ├── Calendrier des séances
    ├── Détail par séance
    └── Graphiques de progression
```

**Priorité MVP :** ⭐⭐⭐ Critique

---

### 📊 3. Analyses et Visualisation

**Hexfit propose :**
- Graphiques de progression
- Comparaison avant/après
- Statistiques détaillées
- Export de données

**THE PROJECT — Implémentation :**

```
Analyses Coach
├── Vue globale
│   ├── Nombre d'athlètes actifs
│   ├── Séances complétées (semaine/mois)
│   ├── Taux de complétion moyen
│   └── Athlètes les plus/moins actifs
│
├── Par athlète
│   ├── Assiduité (calendrier)
│   ├── Volume d'entraînement
│   ├── Progression des charges
│   ├── Évolution RPE
│   └── Comparaison avec objectifs
│
└── Export
    ├── PDF (rapport athlète)
    └── CSV (données brutes)

Analyses Athlète
├── Ma progression
│   ├── PRs (records personnels)
│   ├── Volume par groupe musculaire
│   ├── Évolution des charges (graphique)
│   └── Streak (jours consécutifs)
│
└── Historique
    ├── Séances par semaine/mois
    └── Comparaison période à période
```

**Priorité MVP :** ⭐⭐ Important (post-lancement)

---

### 📁 4. Gestion de Dossiers (Coach)

**Hexfit propose :**
- Profil complet de l'athlète
- Notes privées
- Historique des échanges
- Documents partagés

**THE PROJECT — Implémentation :**

```
Dossier Athlète (vue Coach)
├── Informations personnelles
│   ├── Nom, prénom, email
│   ├── Date de naissance
│   ├── Objectifs
│   └── Notes médicales / blessures
│
├── Programmes
│   ├── Programme actuel
│   ├── Historique des programmes
│   └── Taux de complétion
│
├── Performances
│   ├── PRs par exercice
│   ├── Graphiques de progression
│   └── Volume total
│
├── Communication
│   ├── Notes privées (coach only)
│   ├── Commentaires sur séances
│   └── Historique des échanges
│
└── Documents
    ├── Photos de progression
    ├── Évaluations
    └── Mesures corporelles
```

**Priorité MVP :** ⭐⭐ Important

---

### 💰 5. Facturation et Abonnements

**Hexfit propose :**
- Gestion des abonnements
- Facturation automatique
- Rappels de paiement
- Historique des transactions

**THE PROJECT — Implémentation (Stripe) :**

```
Modèle de tarification
├── Athlète
│   ├── Gratuit : 1 coach, fonctionnalités de base
│   └── Premium (9.99€/mois) : Multi-coachs, analytics avancés
│
├── Coach
│   ├── Starter (0€) : 3 athlètes max
│   ├── Pro (29€/mois) : 20 athlètes, analytics
│   └── Business (79€/mois) : Illimité, branding, API
│
└── Institution (sur devis)
    ├── Licences annuelles
    └── Support dédié
```

**Priorité MVP :** ⭐⭐⭐ Critique (monétisation)

---

### 🍎 6. Suivis Alimentaires (Post-MVP)

**Hexfit propose :**
- Plans nutritionnels personnalisés
- Suivi des macros
- Base de données alimentaire
- Recettes

**THE PROJECT — Implémentation future :**

```
Module Nutrition
├── Plan alimentaire (Coach)
│   ├── Objectifs caloriques
│   ├── Répartition macros
│   └── Suggestions de repas
│
└── Suivi quotidien (Athlète)
    ├── Journal alimentaire
    ├── Scanner de codes-barres
    ├── Photos de repas
    └── Bilan journalier
```

**Priorité :** ⭐ Post-MVP (Phase 3+)

---

### 🏋️ 7. Banque d'Exercices

**Hexfit propose :**
- 13,000+ exercices
- Vidéos démonstratives
- Filtres par muscle/équipement
- Exercices personnalisés

**THE PROJECT — Implémentation :**

```
Banque d'exercices
├── Exercices prédéfinis (500+ MVP)
│   ├── Nom (FR/EN)
│   ├── Groupe musculaire principal
│   ├── Groupes secondaires
│   ├── Équipement requis
│   ├── Niveau de difficulté
│   ├── Instructions texte
│   └── URL vidéo (YouTube/Vimeo)
│
├── Exercices personnalisés (Coach)
│   ├── Créer un exercice custom
│   ├── Upload vidéo perso
│   └── Partager avec athlètes
│
└── Recherche et filtres
    ├── Par nom
    ├── Par muscle
    ├── Par équipement
    └── Par type (composé/isolation)
```

**Priorité MVP :** ⭐⭐⭐ Critique (50 exercices minimum)

---

### 📅 8. Calendrier et Planning

**Hexfit propose :**
- Vue calendrier
- Planification des séances
- Synchronisation agenda
- Rappels automatiques

**THE PROJECT — Implémentation :**

```
Calendrier
├── Vue Coach
│   ├── Planning de tous les athlètes
│   ├── Séances prévues vs complétées
│   └── Drag & drop pour réorganiser
│
├── Vue Athlète
│   ├── Mon planning de la semaine
│   ├── Séances passées (✓ ou ✗)
│   └── Rappels push/email
│
└── Intégrations (Post-MVP)
    ├── Google Calendar
    ├── Apple Calendar
    └── Outlook
```

**Priorité MVP :** ⭐⭐ Important

---

### 🤖 9. Intelligence Artificielle (Post-MVP)

**Hexfit propose :**
- "Fred" : Assistant IA dans tout le logiciel

**THE PROJECT — Implémentation future :**

```
Assistant IA
├── Suggestions de programmes
│   ├── Basé sur l'objectif
│   ├── Basé sur l'historique
│   └── Progression automatique
│
├── Analyse intelligente
│   ├── Détection de surentraînement
│   ├── Suggestions de déload
│   └── Alertes de plateau
│
└── Génération de contenu
    ├── Descriptions d'exercices
    ├── Plans nutritionnels
    └── Messages de motivation
```

**Priorité :** ⭐ Post-MVP (Phase 4+)

---

## 🎨 Direction Design (Inspirée de Hexfit)

### Palette de couleurs

```css
/* Couleurs principales - déjà implémentées */
--primary: #10b981;        /* Emerald 500 */
--primary-dark: #059669;   /* Emerald 600 */
--background: #0f172a;     /* Slate 900 */
--surface: #1e293b;        /* Slate 800 */
--border: #334155;         /* Slate 700 */
--text: #f8fafc;           /* Slate 50 */
--text-muted: #94a3b8;     /* Slate 400 */

/* Accents */
--success: #22c55e;        /* Green 500 */
--warning: #f59e0b;        /* Amber 500 */
--error: #ef4444;          /* Red 500 */
--info: #3b82f6;           /* Blue 500 */
```

### Principes UI/UX

1. **Dark mode par défaut** (comme Hexfit)
2. **Cards avec backdrop-blur** pour la profondeur
3. **Micro-interactions** sur les boutons et liens
4. **Typographie claire** avec hiérarchie forte
5. **Mobile-first** pour l'expérience athlète
6. **Dashboard épuré** — pas de surcharge d'informations

---

## 📋 Ordre d'implémentation recommandé

### Phase 2 : Espace Coach (Priorité actuelle)
1. ✅ Authentification
2. ⬜ Gestion des athlètes (inviter, accepter)
3. ⬜ Création de programmes
4. ⬜ Banque d'exercices de base
5. ⬜ Assignation programmes → athlètes

### Phase 3 : Espace Athlète
1. ⬜ Vue du programme
2. ⬜ Mode entraînement (saisie performances)
3. ⬜ Historique et progression
4. ⬜ Commentaires et feedback

### Phase 4 : Analytics & Monétisation
1. ⬜ Tableaux de bord analytics
2. ⬜ Intégration Stripe
3. ⬜ Plans d'abonnement

### Phase 5+ : Extensions
1. ⬜ Nutrition
2. ⬜ Chat/Messaging
3. ⬜ App mobile native
4. ⬜ IA/Suggestions

---

## 📝 Notes

- **Différenciateur THE PROJECT** : Focus "athlète-first" — UI simplifiée, motivation, gamification légère
- **Avantage technique** : Stack moderne (Next.js 16, React 19) vs legacy de Hexfit
- **Cible initiale** : Musculation classique (comme défini dans le MASTERPROMPT)

---

*Document créé le : 13 décembre 2024*
*Dernière mise à jour : 13 décembre 2024*

