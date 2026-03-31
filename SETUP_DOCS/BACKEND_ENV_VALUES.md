# 🔐 BACKEND - VALEURS À ENTRER

## ⚙️ Configuration du Projet

**Root Directory (IMPORTANT):**
```
backend
```

Ceci dit à Vercel que le projet racine est le dossier `/backend`.

---

## Variables d'environnement (Copier-Coller)

### SUPABASE_URL
```
https://crpokewlpjqujxojmmsz.supabase.co
```

### SUPABASE_SERVICE_ROLE_KEY
Allez dans:
- Supabase Dashboard → Settings (bas gauche) → API
- Cherchez: "service_role secret"
- Copier la clé complète (commence par `eyJ...`)

**Exemple (NE PAS copier ceci):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycG9rZXdscGpxdWp4b2ptbXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY5ODI4NiwiZXhwIjoyMDkwMjc0Mjg2fQ.xxxxx...
```

### JWT_SECRET
Générez une clé aléatoire longue. Exemples:

**Option 1: Générer en ligne**
```
https://www.uuidgenerator.net/ + texte aléatoire
```

**Option 2: Clé simple (minimum 32 caractères)**
```
my-super-secret-jwt-key-chura-beauty-2024-production
```

**Option 3: Clé forte (recommandé)**
```
aK9$mP2@xQ7#vN4&bH8^wL1=uTy5!jZ3sRd6CfGe9EoMkL$p
```

### NODE_ENV
```
production
```

### PORT (optionnel)
```
5000
```

---

## Build Configuration

### Build Command
```bash
cd backend && npm install
```

### Output Directory
```
(vide ou .)
```

### Install Command
```bash
npm install --prefix backend
```

---

## URLs Finales

| Service | URL |
|---------|-----|
| Backend API | https://chura-beauty-backend.vercel.app/api |
| Supabase | https://crpokewlpjqujxojmmsz.supabase.co |

---

## Endpoints à tester après déploiement

1. **Healthcheck:**
   ```
   GET https://chura-beauty-backend.vercel.app/api/health
   ```

2. **Services:**
   ```
   GET https://chura-beauty-backend.vercel.app/api/services
   ```

3. **Maintenance Status:**
   ```
   GET https://chura-beauty-backend.vercel.app/api/site-settings/maintenance-status
   ```

4. **Site Settings:**
   ```
   GET https://chura-beauty-backend.vercel.app/api/site-settings
   ```

---

## ⚠️ Clé importante

**Ne partagez JAMAIS:**
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET

Ces clés doivent rester secrètes et uniquement dans Vercel Environment Variables!

