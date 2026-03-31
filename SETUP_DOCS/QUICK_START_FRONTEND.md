# 🚀 RÉSUMÉ RAPIDE - FRONTEND VERCEL SETUP

## 3 étapes principales

### 1️⃣ Créer le projet
- URL: https://vercel.com
- Cliquez: **Add New** → **Project**
- Repository: **JPdeala81/Chura_Beauty**
- Project Name: `chura-beauty-frontend`

### 2️⃣ Configurer les variables (Settings → Environment Variables)
```
VITE_SUPABASE_URL = https://crpokewlpjqujxojmmsz.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
VITE_API_URL = https://chura-beauty-backend.vercel.app/api
```

### 3️⃣ Configurer le build (Settings → Build & Development Settings)
```
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/dist
Install Command: npm install --prefix frontend
```

---

## Déployer
- Allez à: **Deployments**
- Cliquez: **Deploy**
- Attendez: ✅ Success

---

## Vérifier
1. Bouton vert **"✅ BUILD TEST"** visible?
2. Login avec: `developer@chura-beauty.dev`
3. Dashboard 6 onglets affiche?

---

## Videos de référence

- [Vercel + Monorepo Setup](https://vercel.com/docs/monorepos)
- [Environment Variables Vercel](https://vercel.com/docs/environment-variables)

---

## Support

Fichiers de documentation:
- `FRONTEND_VERCEL_CHECKLIST.md` - Checklist complète
- `FRONTEND_ENV_VALUES.md` - Valeurs à copier

