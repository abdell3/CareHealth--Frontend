# 📋 Résumé Détaillé du Projet CareHealth Frontend

## 🎯 Vue d'Ensemble

**CareHealth Frontend** est une application web moderne de gestion médicale (Système de Gestion Hospitalière - SGH) développée avec React, TypeScript et Vite. L'application permet la gestion complète d'un établissement de santé avec des fonctionnalités pour les rendez-vous, patients, prescriptions, laboratoire, documents et utilisateurs.

---

## 🛠️ Stack Technologique

### **Core Technologies**
- **React 19.2.0** - Bibliothèque UI moderne
- **TypeScript 5.9.3** - Typage statique strict
- **Vite 7.2.4** - Build tool et dev server ultra-rapide
- **React Router DOM 7.9.6** - Routing côté client

### **State Management & Data Fetching**
- **Zustand 5.0.3** - State management léger avec persist middleware
- **TanStack React Query 5.90.11** - Gestion des requêtes serveur, cache, mutations
- **Axios 1.13.2** - Client HTTP avec interceptors personnalisés

### **Form Management & Validation**
- **React Hook Form 7.66.1** - Gestion performante des formulaires
- **Zod 4.1.13** - Validation de schémas TypeScript-first
- **@hookform/resolvers 5.2.2** - Intégration Zod + React Hook Form

### **Styling & UI**
- **Tailwind CSS 3.4.14** - Framework CSS utility-first
- **Tailwind Animate 1.0.7** - Animations CSS
- **ShadCN UI 0.9.5** - Composants UI accessibles (configuration)
- **Lucide React 0.469.0** - Bibliothèque d'icônes
- **clsx & tailwind-merge** - Utilitaires pour classes CSS conditionnelles

### **Development Tools**
- **ESLint 9.39.1** - Linter avec règles TypeScript et React
- **Prettier 3.7.1** - Formateur de code
- **TypeScript ESLint 8.48.0** - Règles ESLint pour TypeScript
- **React Query Devtools** - Outils de débogage pour React Query

### **Testing** (dépendances installées)
- **Jest 30.2.0** - Framework de tests
- **ts-jest 29.4.5** - Preset Jest pour TypeScript
- **@testing-library/react 16.3.0** - Utilitaires de test React
- **@testing-library/jest-dom 6.9.1** - Matchers DOM personnalisés
- **@testing-library/user-event 14.6.1** - Simulation d'interactions utilisateur

---

## 📁 Structure du Projet

```
CareHealth-Frontend/
├── public/                    # Assets statiques
│   └── vite.svg
├── src/
│   ├── __tests__/            # Tests unitaires
│   ├── api/                   # Configuration API
│   │   ├── axios.ts          # Instance Axios avec interceptors
│   │   └── endpoints.ts      # Définition des endpoints API
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # Composants réutilisables (Atomic Design)
│   │   ├── atoms/            # Composants atomiques
│   │   ├── molecules/        # Composants moléculaires
│   │   ├── organisms/        # Composants organismes
│   │   ├── ui/               # Composants UI ShadCN
│   │   └── index.ts          # Exports centralisés
│   ├── hooks/                # Custom React Hooks
│   │   ├── useAuth.ts       # Hook d'authentification
│   │   └── index.ts         # Exports
│   ├── layouts/              # Layouts de pages
│   │   ├── AuthLayout.tsx    # Layout pour pages auth
│   │   └── DashboardLayout.tsx # Layout principal dashboard
│   ├── libs/                 # Bibliothèques utilitaires
│   │   └── utils.ts          # Utilitaires (cn, clsx, etc.)
│   ├── pages/                # Pages de l'application
│   │   ├── auth/             # Pages d'authentification
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   └── dashboard/         # Pages du dashboard
│   │       ├── index.tsx     # Page d'accueil dashboard
│   │       ├── appointments/  # Gestion rendez-vous
│   │       ├── patients/    # Gestion patients
│   │       ├── users/        # Gestion utilisateurs
│   │       ├── prescriptions/ # Gestion prescriptions
│   │       ├── lab/          # Gestion laboratoire
│   │       └── documents/    # Gestion documents
│   ├── router/               # Configuration routing
│   │   ├── index.tsx        # Définition des routes
│   │   └── protected-route.tsx # HOC pour routes protégées
│   ├── store/                # Stores Zustand
│   │   ├── auth.store.ts     # Store authentification
│   │   ├── user.store.ts     # Store utilisateur
│   │   └── index.ts         # Exports
│   ├── styles/               # Styles globaux
│   │   └── globals.css       # Variables CSS, thème
│   ├── utils/                # Utilitaires
│   │   ├── helpers.ts        # Fonctions helper
│   │   ├── role-based-access.ts # Gestion RBAC
│   │   └── index.ts          # Exports
│   ├── App.css
│   ├── index.css
│   └── main.tsx              # Point d'entrée React
├── .env.example              # Variables d'environnement exemple
├── components.json           # Configuration ShadCN UI
├── docker-compose.yml        # Configuration Docker Compose
├── dockerfile               # Image Docker
├── eslint.config.js/ts       # Configuration ESLint
├── index.html               # HTML principal
├── package.json             # Dépendances et scripts
├── postcss.config.js         # Configuration PostCSS
├── tailwind.config.js        # Configuration Tailwind
├── tsconfig.json             # Configuration TypeScript
├── tsconfig.app.json         # TS config pour app
├── tsconfig.node.json        # TS config pour Node
└── vite.config.ts            # Configuration Vite
```

---

## 🔐 Système d'Authentification

### **Implémentation Complète**

#### **1. Store d'Authentification (`src/store/auth.store.ts`)**
- **Zustand avec persist middleware** - Persistance dans localStorage
- **État géré** :
  - `accessToken` : Token d'accès JWT
  - `refreshToken` : Token de rafraîchissement
  - `user` : Objet utilisateur complet
  - `isAuthenticated` : Boolean d'état
- **Actions** :
  - `setAuth()` : Définit tokens + user
  - `clearAuth()` : Nettoie l'état
  - `logout()` : Appel API + nettoyage
  - `getAccessToken()`, `getRefreshToken()`, `getUser()` : Getters
- **Sécurité** : TODO pour migration vers HttpOnly cookies

#### **2. Instance Axios (`src/api/axios.ts`)**
- **Base URL** : `VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'`
- **Request Interceptor** : Ajoute automatiquement `Authorization: Bearer <token>`
- **Response Interceptor** : Gestion intelligente du refresh token
  - **Queue de requêtes** : Suspension des requêtes pendant le refresh
  - **Refresh unique** : Un seul refresh à la fois (protection reentrancy)
  - **Retry automatique** : Retry unique après refresh réussi
  - **Logout automatique** : Si refresh échoue (401/403)
- **Instance séparée** : `refreshInstance` sans interceptors pour éviter les boucles

#### **3. Hook useAuth (`src/hooks/useAuth.ts`)**
- **React Query Mutations** :
  - `login()` : Connexion avec email/password
  - `register()` : Inscription avec validation
  - `logout()` : Déconnexion avec nettoyage
- **Fonction impérative** : `refreshAccessToken()` pour refresh manuel
- **Gestion d'erreurs** : Erreurs exposées via `error` state

#### **4. Pages d'Authentification**

**Login (`src/pages/auth/Login.tsx`)**
- Formulaire React Hook Form + Zod
- Validation : email valide, password min 8 caractères
- Redirection après succès
- Gestion erreurs backend
- État de chargement

**Register (`src/pages/auth/Register.tsx`)**
- Champs : firstName, lastName, email, password, confirmPassword, phone (optionnel), role
- Validation complète avec Zod
- Role par défaut : 'patient'
- Redirection vers login après succès

**ForgotPassword (`src/pages/auth/ForgotPassword.tsx`)**
- Appel API `POST /auth/request-password-reset`
- Message de succès avec instructions
- Gestion d'erreurs

**ResetPassword (`src/pages/auth/ResetPassword.tsx`)**
- Récupération token depuis query params
- Appel API `POST /auth/reset-password`
- Validation password min 8 caractères
- Auto-redirect vers login après succès

---

## 🛣️ Système de Routing

### **Configuration (`src/router/index.tsx`)**

#### **Routes Publiques**
- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/forgot-password` - Mot de passe oublié
- `/reset-password` - Réinitialisation mot de passe

#### **Routes Protégées** (sous `/dashboard`)
- `/dashboard` - Page d'accueil (tous rôles)
- `/dashboard/appointments` - Liste rendez-vous (tous)
- `/dashboard/appointments/new` - Nouveau rendez-vous (admin, doctor, nurse, receptionist)
- `/dashboard/appointments/:id` - Détail rendez-vous (tous)
- `/dashboard/patients` - Liste patients (admin, doctor, nurse, receptionist)
- `/dashboard/patients/:id` - Détail patient (admin, doctor, nurse, receptionist)
- `/dashboard/users` - Liste utilisateurs (admin uniquement)
- `/dashboard/users/:id` - Détail utilisateur (admin uniquement)
- `/dashboard/prescriptions` - Liste prescriptions (admin, doctor, nurse)
- `/dashboard/prescriptions/:id` - Détail prescription (admin, doctor, nurse)
- `/dashboard/lab-orders` - Liste ordres labo (admin, doctor, nurse)
- `/dashboard/lab-orders/:id` - Détail ordre labo (admin, doctor, nurse)
- `/dashboard/documents` - Liste documents (tous)

#### **Protection des Routes (`src/router/protected-route.tsx`)**
- Vérification authentification
- Vérification rôles avec prop `allowedRoles`
- Redirection automatique si non autorisé
- Navigation state préservée

#### **React Query Integration**
- `QueryClientProvider` au niveau root
- Configuration : staleTime 5min, retry 1, no refetch on focus
- React Query Devtools activé

---

## 👥 Gestion des Rôles (RBAC)

### **Rôles Disponibles**
1. **admin** - Accès complet
2. **doctor** - Personnel médical
3. **nurse** - Personnel infirmier
4. **patient** - Patient
5. **receptionist** - Réceptionniste

### **Permissions par Route (`src/utils/role-based-access.ts`)**
- Mapping complet des routes avec rôles autorisés
- Fonctions utilitaires :
  - `hasRouteAccess()` : Vérifie accès route
  - `getAccessibleRoutes()` : Liste routes accessibles pour un rôle
  - `hasRole()` : Vérifie rôle spécifique
  - `isAdmin()` : Vérifie admin
  - `isMedicalStaff()` : Vérifie doctor ou nurse

### **Application dans l'UI**
- **Sidebar** : Filtrage des items selon rôle utilisateur
- **Routes** : Protection avec `ProtectedRoute` + `allowedRoles`
- **Navigation** : Masquage automatique des items non accessibles

---

## 🎨 Design System & UI

### **Tailwind CSS Configuration**
- **Thème médical personnalisé** :
  - Couleurs medical-blue (50-900)
  - Couleurs medical-green (50-900)
- **Variables CSS** : Support thème clair/sombre
- **Composants** : border, input, ring, background, foreground, primary, secondary, etc.
- **Animations** : accordion-down/up, transitions

### **Layouts**

**AuthLayout (`src/layouts/AuthLayout.tsx`)**
- Design centré avec gradient médical
- Logo CareHealth avec icône Heart
- Card blanche avec shadow
- Footer copyright

**DashboardLayout (`src/layouts/DashboardLayout.tsx`)**
- Sidebar responsive (mobile/desktop)
- Header sticky avec menu mobile
- Navigation filtrée par rôle
- Section utilisateur avec avatar initials
- Bouton déconnexion
- Overlay mobile pour sidebar

### **Composants UI**
- Structure Atomic Design préparée (atoms, molecules, organisms)
- Configuration ShadCN UI prête
- Composants basiques avec Tailwind + Lucide icons

---

## 📊 Pages Dashboard

### **Page d'Accueil (`src/pages/dashboard/index.tsx`)**
- Message de bienvenue personnalisé
- Cards statistiques (rendez-vous, patients, prescriptions)
- Section activité récente (placeholder)

### **Modules Fonctionnels** (structure préparée)
Toutes les pages suivent un pattern similaire :
- Header avec titre + description
- Bouton d'action (nouveau, créer, etc.)
- Liste/tableau de données (placeholder)
- Navigation vers détails

**Modules disponibles** :
1. **Appointments** - Rendez-vous médicaux
2. **Patients** - Gestion patients
3. **Users** - Gestion utilisateurs (admin)
4. **Prescriptions** - Prescriptions médicales
5. **Lab Orders** - Ordres de laboratoire
6. **Documents** - Gestion documents

---

## 🔧 Utilitaires & Helpers

### **Helpers (`src/utils/helpers.ts`)**
- `formatDate()` - Format date FR
- `formatDateTime()` - Format date + heure FR
- `formatPhoneNumber()` - Format téléphone FR
- `debounce()` - Debounce function
- `capitalize()` - Capitalisation
- `getUserInitials()` - Initiales utilisateur
- `isEmpty()` - Vérification valeur vide

### **Utils (`src/libs/utils.ts`)**
- `cn()` - Merge classes CSS (clsx + tailwind-merge)

### **Stores**
- **authStore** : Authentification complète
- **userStore** : Store utilisateur séparé (pour usage futur)

---

## 🌐 Configuration API

### **Endpoints (`src/api/endpoints.ts`)**
Endpoints relatifs (baseURL inclut `/api/v1`) :

**Auth**
- `/auth/login`
- `/auth/register`
- `/auth/refresh`
- `/auth/logout`
- `/auth/request-password-reset`
- `/auth/reset-password`
- `/auth/me`

**Resources**
- `/users`, `/users/:id`
- `/patients`, `/patients/:id`
- `/appointments`, `/appointments/:id`
- `/prescriptions`, `/prescriptions/:id`
- `/laboratory`, `/laboratory/:id`
- `/documents`, `/documents/:id/download`

### **Configuration Axios**
- Base URL depuis variable d'environnement
- Headers JSON par défaut
- `withCredentials: true` pour cookies
- Interceptors pour auth automatique

---

## 🧪 Tests

### **Structure de Tests**
- Dossier `src/__tests__/` préparé
- Jest + Testing Library configurés
- Test d'exemple pour refresh token (à compléter)

### **Dépendances de Test**
- Jest 30.2.0
- ts-jest 29.4.5
- @testing-library/react 16.3.0
- @testing-library/jest-dom 6.9.1
- @testing-library/user-event 14.6.1

---

## 🐳 Docker

### **Configuration**
- **dockerfile** : Image de production
- **docker-compose.yml** : Orchestration (vide/préparé)

---

## ⚙️ Configuration

### **TypeScript**
- **tsconfig.json** : Config principale avec références
- **tsconfig.app.json** : Config pour application
- **tsconfig.node.json** : Config pour Node.js
- **Strict mode** : Activé
- **Path aliases** : `@/` → `./src/`

### **Vite**
- Plugin React
- Alias `@` configuré
- HMR activé
- Build optimisé

### **ESLint**
- Configuration moderne (flat config)
- Règles React + TypeScript
- Prettier intégré
- Accessibilité (jsx-a11y)

### **Tailwind**
- Dark mode support (class-based)
- Variables CSS pour thème
- Animations personnalisées
- Couleurs médicales étendues

### **PostCSS**
- Autoprefixer configuré
- Intégration Tailwind

---

## 📦 Scripts NPM

```json
{
  "dev": "vite",              // Serveur de développement
  "build": "tsc -b && vite build",  // Build production
  "lint": "eslint .",        // Linter
  "preview": "vite preview"  // Preview build
}
```

---

## 🔒 Sécurité

### **Implémenté**
- ✅ Tokens JWT avec refresh automatique
- ✅ Interceptors Axios pour auth automatique
- ✅ Protection routes avec vérification rôles
- ✅ Validation formulaires côté client (Zod)
- ✅ Gestion erreurs API
- ✅ Logout automatique si refresh échoue

### **À Améliorer**
- ⚠️ Migration refreshToken vers HttpOnly cookies (TODO dans code)
- ⚠️ CSRF protection (si nécessaire)
- ⚠️ Rate limiting côté client
- ⚠️ Sanitization inputs (si backend ne le fait pas)

---

## 🚀 Fonctionnalités Implémentées

### **✅ Complètes**
1. ✅ Authentification complète (login, register, logout)
2. ✅ Gestion tokens avec refresh automatique
3. ✅ Protection routes avec RBAC
4. ✅ Layouts responsive (Auth + Dashboard)
5. ✅ Navigation filtrée par rôle
6. ✅ Formulaires avec validation (Zod + RHF)
7. ✅ Gestion état avec Zustand + React Query
8. ✅ Structure pages dashboard
9. ✅ Helpers et utilitaires
10. ✅ Configuration complète (TS, Vite, Tailwind, ESLint)

### **🔄 En Placeholder (Structure Prête)**
1. ⏳ Pages de liste (Appointments, Patients, etc.)
2. ⏳ Pages de détail
3. ⏳ Composants UI ShadCN
4. ⏳ Intégration API complète (endpoints définis)
5. ⏳ Tests unitaires complets

---

## 📝 Variables d'Environnement

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_ENV=development
```

---

## 🎯 Points Forts du Projet

1. **Architecture Moderne** : React 19, TypeScript strict, Vite
2. **State Management Robuste** : Zustand + React Query
3. **Sécurité** : Auth complète avec refresh automatique
4. **RBAC** : Gestion rôles complète et flexible
5. **Type Safety** : TypeScript strict, aucun `any`
6. **DX Excellente** : ESLint, Prettier, DevTools
7. **Design System** : Tailwind + ShadCN prêt
8. **Responsive** : Mobile-first design
9. **Scalable** : Structure modulaire, Atomic Design
10. **Production Ready** : Docker, build optimisé

---

## 🔮 Prochaines Étapes Recommandées

1. **Compléter les pages** : Implémenter listes et détails avec React Query
2. **Composants UI** : Ajouter composants ShadCN nécessaires
3. **Tests** : Compléter tests unitaires et intégration
4. **API Integration** : Connecter toutes les pages au backend
5. **Optimisations** : Lazy loading, code splitting
6. **Accessibilité** : ARIA labels, keyboard navigation
7. **Internationalisation** : i18n si nécessaire
8. **PWA** : Service workers, offline support

---

## 📊 Statistiques du Projet

- **Langages** : TypeScript, CSS (Tailwind)
- **Fichiers Source** : ~30+ fichiers React/TS
- **Pages** : 4 auth + 1 dashboard + 10+ modules
- **Stores** : 2 (auth + user)
- **Hooks** : 1 custom (useAuth)
- **Routes** : 15+ routes configurées
- **Rôles** : 5 rôles avec permissions granulaires

---

**Date de dernière mise à jour** : 2024
**Version** : 0.0.0 (développement)
**Statut** : En développement actif

