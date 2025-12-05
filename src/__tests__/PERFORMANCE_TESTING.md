# ⚡ Performance Testing Guide

Guide pour les tests de performance avec Lighthouse CI.

## 🎯 Objectifs

- Performance : 90+
- Accessibility : 95+
- Best Practices : 95+
- SEO : 90+

## 🚀 Configuration

Voir `lighthouserc.json` pour la configuration complète.

## 📊 Exécution Locale

```bash
# Installer Lighthouse CI
npm install -g @lhci/cli

# Build l'application
npm run build

# Lancer les tests
lhci autorun
```

## 📈 Métriques Surveillées

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

## 🔧 Amélioration Performance

1. **Code Splitting** : Lazy loading des routes
2. **Image Optimization** : WebP, lazy loading
3. **Bundle Size** : Monitoring avec `vite-bundle-visualizer`
4. **Caching** : Service Worker pour assets statiques

---

**Dernière mise à jour** : Décembre 2024

