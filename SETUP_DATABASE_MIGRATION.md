# Guide: Exécuter la migration client_email

Si vous recevez l'erreur: `Could not find the 'client_email' column`, suivez ces étapes:

## Solution Rapide pour Supabase

### 1. Ouvrez Supabase
- Allez sur [https://app.supabase.com](https://app.supabase.com)
- Sélectionnez votre projet

### 2. Exécutez la migration SQL

**Allez dans:** `SQL Editor` → Click `+ New Query` → Copiez et exécutez:

```sql
-- Migration: Add client_email to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Mise à jour du schéma Supabase
-- (Supabase actualisera automatiquement le cache après ~30 secondes)

-- Optional: Add index pour performance
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(client_email);
```

### 3. Attendez 30-60 secondes
- Supabase rafraîchit le cache de schéma automatiquement
- L'erreur disparaîtra

### 4. Testez
- Essayez de faire une nouvelle réservation
- L'email devrait s'enregistrer correctement ✅

---

## Alternative: Si vous utilisez Postgres en local

```bash
psql -U your_user -d your_database -f backend/config/migration-add-email.sql
```

---

## Note
Si vous avez créé une nouvelle base de données avec `database.sql`, la colonne `client_email` y est **déjà** incluse ✅
