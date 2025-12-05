# 🔐 API Architecture - CareHealth

Architecture Axios unifiée et sécurisée avec gestion d'erreurs robuste.

## 📁 Structure

```
src/api/
├── axiosInstance.ts      # Instance Axios unique (single source of truth)
├── errorHandler.ts       # Normalisation et gestion des erreurs
├── retryHandler.ts       # Retry avec exponential backoff
├── refreshQueue.ts       # Queue pour refresh token concurrent
├── csrf.ts              # Protection CSRF
├── endpoints.ts          # Tous les endpoints API
├── api.types.ts         # Types TypeScript
├── *.service.ts         # Services API par domaine
└── README.md           # Cette documentation
```

## 🎯 Architecture

### Single Axios Instance

Une seule instance Axios (`axiosInstance`) est utilisée dans toute l'application. **Ne plus utiliser l'ancienne instance `api`**.

```typescript
import { axiosInstance } from '@/api/axiosInstance'

// ✅ Correct
const response = await axiosInstance.get('/endpoint')

// ❌ Incorrect (legacy)
import { api } from '@/api/axios' // Fichier supprimé
```

### Stratégie Tokens

**Stratégie hybride (fallback)** :
- `accessToken` : localStorage (fallback si backend ne supporte pas cookies)
- `refreshToken` : HTTP-only cookie (sécurisé, préféré)

**Stratégie idéale (si backend supporte)** :
- `accessToken` : HTTP-only cookie
- `refreshToken` : HTTP-only cookie

Le système détecte automatiquement la stratégie utilisée par le backend.

### Gestion d'Erreurs

Toutes les erreurs sont normalisées en `ApiError` :

```typescript
import { normalizeError, getUserFriendlyMessage } from '@/api/errorHandler'

try {
  await someApiCall()
} catch (error) {
  const apiError = normalizeError(error)
  const userMessage = getUserFriendlyMessage(error)
  // Afficher userMessage à l'utilisateur
}
```

### Retry Stratégique

Retry automatique avec exponential backoff pour les erreurs retryables :

```typescript
import { retryRequest } from '@/api/retryHandler'

const result = await retryRequest(
  () => axiosInstance.get('/endpoint'),
  {
    maxRetries: 3,
    baseDelay: 1000, // 1 seconde
  }
)
```

**Erreurs retryables** :
- Erreurs réseau (NETWORK_ERROR)
- Erreurs serveur 5xx
- 429 Too Many Requests
- 408 Request Timeout

**Erreurs non-retryables** :
- 4xx (sauf 429, 408)
- 401 Unauthorized (géré par refresh token)

### Refresh Token Queue

Gestion intelligente des requêtes concurrentes pendant le refresh :

```typescript
// Automatique via interceptors
// Si plusieurs requêtes échouent avec 401 en même temps,
// une seule requête de refresh est effectuée
```

### Protection CSRF

Protection CSRF automatique pour toutes les requêtes non-GET :

```typescript
// Le token CSRF est automatiquement ajouté depuis :
// 1. Meta tag: <meta name="csrf-token" content="...">
// 2. Cookie: csrf-token
```

## 🔧 Utilisation

### Services API

Utiliser les services existants :

```typescript
import { patientsService } from '@/api'

const patients = await patientsService.getPatients({
  page: 1,
  limit: 20,
  search: 'Dupont',
})
```

### Gestion d'Erreurs dans les Composants

```typescript
import { useApiError } from '@/hooks/useApiError'
import { getUserFriendlyMessage } from '@/api'

const { error } = useQuery(...)
const errorMessage = useApiError(error) || getUserFriendlyMessage(error)

{errorMessage && <Alert>{errorMessage}</Alert>}
```

### Retry Manuel

```typescript
import { retryRequest } from '@/api'

const fetchData = async () => {
  return retryRequest(
    () => axiosInstance.get('/critical-endpoint'),
    { maxRetries: 5, baseDelay: 2000 }
  )
}
```

## 🔐 Sécurité

### Tokens

- ✅ `accessToken` : Stocké dans localStorage (fallback) ou HTTP-only cookie (idéal)
- ✅ `refreshToken` : HTTP-only cookie (sécurisé contre XSS)
- ✅ Rotation automatique du refresh token
- ✅ Détection d'expiration et refresh automatique

### CSRF

- ✅ Protection automatique pour toutes les requêtes non-GET
- ✅ Token récupéré depuis meta tag ou cookie
- ✅ Validation côté backend requise

### Headers Sécurisés

- ✅ `withCredentials: true` pour cookies HTTP-only
- ✅ `Content-Type: application/json`
- ✅ `Authorization: Bearer <token>` automatique

## 🚀 Migration

### Ancien Code

```typescript
import { api } from '@/api/axios' // ❌ Supprimé

const response = await api.post('/endpoint', data)
```

### Nouveau Code

```typescript
import { axiosInstance } from '@/api/axiosInstance' // ✅

const response = await axiosInstance.post('/endpoint', data)

// Ou mieux, utiliser un service
import { someService } from '@/api'
const response = await someService.createItem(data)
```

## 📝 Services Disponibles

- `authService` - Authentification
- `usersService` - Utilisateurs
- `patientsService` - Patients
- `appointmentsService` - Rendez-vous
- `pharmacyService` - Prescriptions
- `labService` - Laboratoire
- `documentsService` - Documents
- `notificationsService` - Notifications
- `searchService` - Recherche globale

## ⚠️ Notes Importantes

1. **Ne jamais créer de nouvelle instance Axios** - Utiliser `axiosInstance`
2. **Toujours utiliser les services** - Ne pas appeler directement `axiosInstance` dans les composants
3. **Gérer les erreurs** - Utiliser `normalizeError` et `getUserFriendlyMessage`
4. **Respecter les types** - Utiliser `ApiResponse<T>` pour toutes les réponses

## 🔄 Backend Requirements

Le backend doit :

1. **Support HTTP-only cookies** (recommandé) :
   - Set `access_token` et `refresh_token` en cookies HTTP-only
   - `Secure`, `SameSite=Strict`

2. **Endpoint `/auth/refresh`** :
   - Accepte refresh token depuis cookie
   - Retourne nouveau `accessToken`

3. **CSRF Protection** :
   - Fournir token CSRF dans meta tag ou cookie
   - Valider `X-CSRF-Token` header

4. **Format erreurs** :
   ```json
   {
     "message": "Error message",
     "code": "ERROR_CODE",
     "errors": {
       "field": ["validation error"]
     }
   }
   ```

---

**Version** : 2.0.0  
**Dernière mise à jour** : Décembre 2024

