# 🚀 RÉSUMÉ RAPIDE - BACKEND VERCEL SETUP

## 3 étapes principales

### 1️⃣ Créer le projet
- URL: https://vercel.com
- Cliquez: **Add New** → **Project**
- Repository: **JPdeala81/Chura_Beauty**
- Project Name: `chura-beauty-backend`

### 2️⃣ Configurer les 5 variables (Settings → Environment Variables)
```
SUPABASE_URL = https://crpokewlpjqujxojmmsz.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc... (copier depuis Supabase Settings)
JWT_SECRET = votre-clé-secrète-longue-ici
NODE_ENV = production
PORT = 5000
```

**Important:** Cochez ✅ Production pour CHAQUE variable!

### 3️⃣ Configurer le build (Settings → Build & Development Settings)
```
Build Command: npm install
Output Directory: (vide)
Install Command: npm install
```

**Note:** Root Directory doit être défini à `backend` (voir étape 1)

---

## Déployer
- Allez à: **Deployments**
- Cliquez: **Deploy**
- Attendez: ✅ Success

---

## Vérifier
1. Allez sur: `/api/health`
2. Réponse: `{"status": "ok"}`?
3. Vérifiez: `/api/site-settings/maintenance-status`
4. Logs montrent "✅ Supabase connecté"?

---

## URLs à retenir

- **Backend**: https://chura-beauty-backend.vercel.app/api
- **Pour Frontend**: Utilisez cette URL dans `VITE_API_URL`

---

**Backend prêt? → Passez au Frontend Setup!**

