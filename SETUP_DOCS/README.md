# 📋 INDEX - TOUS LES GUIDES DE SETUP

## 🎯 Par où commencer?

Suivez ces 3 phases dans l'ordre:

---

## ✅ PHASE 1: SUPABASE DATABASE

**Fichier:** [`SUPABASE_SQL_CODE.md`](../SUPABASE_SQL_CODE.md)

**À faire:**
1. Ouvrez Supabase
2. Allez à: SQL Editor
3. Copiez tout le code SQL
4. Allez à: SQL Editor → New Query
5. Collez et exécutez
6. Vérifiez: 9 tables créées + site_settings table

**Durée:** ~5 minutes

---

## 🔧 PHASE 2: BACKEND VERCEL

**Guide complet:** [`BACKEND_VERCEL_CHECKLIST.md`](BACKEND_VERCEL_CHECKLIST.md)
**Valeurs à copier:** [`BACKEND_ENV_VALUES.md`](BACKEND_ENV_VALUES.md)
**Résumé rapide:** [`QUICK_START_BACKEND.md`](QUICK_START_BACKEND.md)

**À faire en résumé:**
1. Créer nouveau projet Vercel
2. Repository: JPdeala81/Chura_Beauty
3. Project Name: `chura-beauty-backend`
4. Ajouter 5 environment variables (copier depuis BACKEND_ENV_VALUES.md)
5. Build Command: `cd backend && npm install`
6. Déployer et vérifier

**Durée:** ~10 minutes

**Checklist détaillée (7 sections):**
- [ ] Créer le projet
- [ ] Réglage du Framework
- [ ] Root Directory
- [ ] 5 Variables d'environnement
- [ ] Build Settings
- [ ] Déploiement
- [ ] Vérification des routes

---

## 🎨 PHASE 3: FRONTEND VERCEL

**Guide complet:** [`FRONTEND_VERCEL_CHECKLIST.md`](FRONTEND_VERCEL_CHECKLIST.md)
**Valeurs à copier:** [`FRONTEND_ENV_VALUES.md`](FRONTEND_ENV_VALUES.md)
**Résumé rapide:** [`QUICK_START_FRONTEND.md`](QUICK_START_FRONTEND.md)

**À faire en résumé:**
1. Créer nouveau projet Vercel
2. Repository: JPdeala81/Chura_Beauty
3. Project Name: `chura-beauty-frontend`
4. Ajouter 3 environment variables (inclure Backend URL du Step 2)
5. Build Command: `cd frontend && npm install && npm run build`
6. Output Directory: `frontend/dist`
7. Déployer et vérifier

**Durée:** ~10 minutes

**Checklist détaillée (7 sections):**
- [ ] Créer le projet
- [ ] Réglage du Framework
- [ ] Root Directory
- [ ] 3 Variables d'environnement
- [ ] Build Settings
- [ ] Déploiement
- [ ] Vérification (bouton vert + login)

---

## 🔍 FICHIERS SUPPLÉMENTAIRES

| Fichier | Description | Utilisation |
|---------|-------------|------------|
| `BACKEND_VERCEL_CHECKLIST.md` | Checklist complète (7 sections) | Suivi pas-à-pas |
| `BACKEND_ENV_VALUES.md` | Variables copier-coller | Copier exactement |
| `QUICK_START_BACKEND.md` | Résumé en 3 étapes | Référence rapide |
| `FRONTEND_VERCEL_CHECKLIST.md` | Checklist complète (7 sections) | Suivi pas-à-pas |
| `FRONTEND_ENV_VALUES.md` | Variables copier-coller | Copier exactement |
| `QUICK_START_FRONTEND.md` | Résumé en 3 étapes | Référence rapide |

---

## 🎯 POST-DÉPLOIEMENT

**Vérifications obligatoires:**
- ✅ Page d'accueil charge sans 404
- ✅ Bouton vert "BUILD TEST" visible
- ✅ Login avec: `developer@chura-beauty.dev` / `Dev@Chura2024!`
- ✅ Redirect vers `/admin/developer`
- ✅ Dashboard avec 6 onglets fonctionnels

**Dépannage:**
- Boutton 404? Vérifiez `VITE_API_URL` dans Frontend
- Backend retourne 500? Vérifiez Supabase variables
- Pas d'accès? Vérifiez JWT_SECRET identique

---

## 📞 COMMANDES UTILES

```bash
# Tester Backend localement
cd backend && npm run dev

# Tester Frontend localement
cd frontend && npm run dev

# Build Frontend
cd frontend && npm run build

# Vérifier Backend déployé
curl https://chura-beauty-backend.vercel.app/api/health
```

---

**Prêt à démarrer? → Commencez par PHASE 1: SUPABASE! ⬇️**

