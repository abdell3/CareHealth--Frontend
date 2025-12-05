# 🎨 CareHealth Design System

Design system médical unique et cohérent pour l'application CareHealth.

## 📁 Structure

```
src/design-system/
├── tokens/              # Design tokens (couleurs, typographie, espacement, etc.)
├── components/          # Composants médicaux spécialisés
│   └── medical/
├── themes/              # Configurations de thèmes par rôle
├── providers/           # Providers React (ThemeProvider)
└── README.md           # Cette documentation
```

## 🎨 Tokens de Design

### Couleurs

Les couleurs médicales sont organisées par usage :

- **Medical Blue** : Professionnel, confiance (PRIMARY)
- **Medical Green** : Santé, croissance (SECONDARY)
- **Red** : Urgence, alertes (DANGER)
- **Amber** : Avertissements (WARNING)
- **Purple** : Admin
- **Indigo** : Laboratoire
- **Sky** : Patient

```typescript
import { medicalColors, roleColors } from '@/design-system/tokens'

// Utilisation
<div className="bg-medical-blue-500 text-white">
  Contenu
</div>
```

### Typographie

Hiérarchie claire avec Inter (primary) et DM Sans (secondary) :

```typescript
import { typographyClasses } from '@/design-system/tokens'

<h1 className={typographyClasses.h1}>Titre principal</h1>
<p className={typographyClasses.body}>Texte de corps</p>
<span className={typographyClasses.medical}>Valeur médicale</span>
```

### Espacement

Système basé sur 4px (0.25rem) :

- Utiliser les classes Tailwind standards : `p-4`, `gap-6`, etc.
- Patterns recommandés dans `spacingPatterns`

### Ombres

Ombres médicales spécialisées :

- `shadow-medical` : Ombre standard médicale
- `shadow-medical-card` : Ombre pour cartes
- `shadow-medical-elevated` : Ombre pour éléments élevés

## 🧩 Composants Médicaux

### MedicalCard

Carte médicale avec variants :

```tsx
import { MedicalCard } from '@/design-system/components/medical'

<MedicalCard
  variant="patient"
  title="Jean Dupont"
  description="Patient depuis 2020"
  badge={{ label: 'Actif', variant: 'success' }}
  role="patient"
  expandable
>
  Contenu de la carte
</MedicalCard>
```

**Variants** : `default`, `patient`, `prescription`, `appointment`, `alert`

### MedicalBadge

Badge médical avec types spécialisés :

```tsx
import { MedicalBadge } from '@/design-system/components/medical'

<MedicalBadge
  type="status"
  label="Actif"
  variant="success"
  pulse
/>

<MedicalBadge
  type="priority"
  label="Urgent"
  priority="urgent"
  glow
/>

<MedicalBadge
  type="number"
  label="Patients"
  count={42}
/>
```

**Types** : `status`, `role`, `priority`, `medical`, `number`

### VitalSignsCard

Affichage des signes vitaux :

```tsx
import { VitalSignsCard, type VitalSign } from '@/design-system/components/medical'

const vitals: VitalSign[] = [
  {
    name: 'Tension artérielle',
    value: '120/80',
    unit: 'mmHg',
    normalRange: { min: 90, max: 140 },
    trend: 'stable',
    status: 'normal',
  },
]

<VitalSignsCard vitals={vitals} showTrends showNormalRange />
```

## 🎭 Thèmes par Rôle

Chaque rôle a son propre thème :

```tsx
import { ThemeProvider, useTheme } from '@/design-system/providers/ThemeProvider'

// Dans votre app
<ThemeProvider>
  <App />
</ThemeProvider>

// Dans un composant
const { theme, role } = useTheme()
// theme.primary, theme.secondary, theme.sidebarBg, etc.
```

**Rôles supportés** :
- `admin` : Purple
- `doctor` : Blue
- `nurse` : Green
- `patient` : Sky
- `pharmacist` : Amber
- `lab_technician` : Indigo
- `receptionist` : Blue

## ✨ Animations

Animations médicales disponibles :

- `animate-medical-pulse` : Pulse médical (2s)
- `animate-heartbeat` : Battement de cœur (1.5s)
- `animate-slide-in-medical` : Slide in depuis la droite
- `animate-fade-up` : Fade up avec translation
- `animate-fade-in` : Fade in simple

```tsx
<div className="animate-medical-pulse">
  Élément animé
</div>
```

## 📐 Guidelines d'Usage

### 1. Utiliser les tokens

Toujours utiliser les tokens plutôt que des valeurs hardcodées :

```tsx
// ✅ Bon
<div className="bg-medical-blue-500 text-white">

// ❌ Mauvais
<div className="bg-[#3b82f6] text-white">
```

### 2. Respecter la hiérarchie typographique

Utiliser les classes de typographie pour la cohérence :

```tsx
// ✅ Bon
<h1 className={typographyClasses.h1}>Titre</h1>

// ❌ Mauvais
<h1 className="text-4xl font-bold">Titre</h1>
```

### 3. Composants médicaux pour le contenu médical

Utiliser les composants médicaux pour les données médicales :

```tsx
// ✅ Bon
<MedicalCard variant="patient">...</MedicalCard>

// ❌ Mauvais
<Card>...</Card>
```

### 4. Thèmes dynamiques

Le thème s'adapte automatiquement au rôle de l'utilisateur. Ne pas forcer les couleurs :

```tsx
// ✅ Bon
const { theme } = useTheme()
<div style={{ backgroundColor: theme.primary }}>

// ❌ Mauvais
<div className="bg-blue-500">
```

## 🔄 Migration

Pour migrer un composant existant :

1. Remplacer les couleurs hardcodées par les tokens
2. Utiliser les composants médicaux si approprié
3. Appliquer les classes de typographie
4. Utiliser les animations médicales si nécessaire

## 📚 Ressources

- [Tailwind CSS](https://tailwindcss.com)
- [Design Tokens](https://www.designtokens.org)
- [Medical UI Patterns](https://www.healthcareitnews.com)

## 🤝 Contribution

Lors de l'ajout de nouveaux composants :

1. Suivre la structure existante
2. Utiliser les tokens de design
3. Documenter les props et usage
4. Ajouter des exemples si nécessaire

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024

