# 🛠️ CORRECTION DU BUG PDF - Noms de fichiers Windows

## ❌ **PROBLÈME IDENTIFIÉ**
```
Error: ENOENT: no such file or directory, open 'inscription-29-testee-test-Test-2026\2027-2025-09-24T07-35-29-491Z.pdf'
```

**Cause:** Le caractère `/` dans l'année scolaire `2026/2027` n'est pas autorisé dans les noms de fichiers Windows.

## ✅ **CORRECTION APPLIQUÉE**

### Code modifié dans `directeurController.js`:

**AVANT:**
```javascript
const archiveFilename = `inscription-${id}-${request.parentLastName}${childName}-${request.anneeScolaire || '2025-2026'}-${timestamp}.pdf`;
```

**APRÈS:**
```javascript
// Fonction pour nettoyer les noms de fichiers
const sanitizeFilename = (str) => {
    return str ? str.replace(/[\/\\:*?"<>|]/g, '-').replace(/\s+/g, '_') : '';
};

const childName = children.length > 0 ? `-${sanitizeFilename(children[0].firstName)}-${sanitizeFilename(children[0].lastName)}` : '';
const parentNameSafe = sanitizeFilename(request.parentLastName);
const anneeScolaireSafe = sanitizeFilename(request.anneeScolaire || '2025-2026');

const archiveFilename = `inscription-${id}-${parentNameSafe}${childName}-${anneeScolaireSafe}-${timestamp}.pdf`;
```

## 🔧 **CARACTÈRES NETTOYÉS**

La fonction `sanitizeFilename()` remplace tous les caractères interdits par Windows :
- `/` → `-`
- `\` → `-` 
- `:` → `-`
- `*` → `-`
- `?` → `-`
- `"` → `-`
- `<` → `-`
- `>` → `-`
- `|` → `-`
- Espaces multiples → `_`

## 📋 **EXEMPLES DE TRANSFORMATION**

| Original | Transformé |
|----------|------------|
| `2026/2027` | `2026-2027` |
| `Jean:Pierre` | `Jean-Pierre` |
| `Test"Parent` | `Test-Parent` |
| `Marie Claire` | `Marie_Claire` |

## ✅ **RÉSULTAT**

### Noms de fichiers maintenant générés:
- **Avant:** `inscription-29-testee-test-Test-2026\2027-...pdf` ❌
- **Après:** `inscription-29-testee-test-Test-2026-2027-...pdf` ✅

### Status:
- ✅ Serveur redémarré sur port 3007
- ✅ Fonction de nettoyage implémentée
- ✅ Tests de validation passés
- ✅ Caractères Windows interdits supprimés
- ✅ PDF peut maintenant être archivé sans erreur

## 🎯 **PROCHAINE ÉTAPE**

Essayez maintenant d'accéder au PDF via votre navigateur :
**http://localhost:3007/directeur/inscriptions/29/pdf**

Le PDF devrait maintenant se générer et s'archiver correctement sans crash du serveur !

---

**Note:** Cette correction s'applique à tous les futurs PDF générés et garantit la compatibilité avec le système de fichiers Windows.