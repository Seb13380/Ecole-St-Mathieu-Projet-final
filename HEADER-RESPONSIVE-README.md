# 📱 Header Responsive - École Saint-Mathieu

## ✨ Fonctionnalités implémentées

### 🎯 Design Responsive
- **Desktop (1024px+)** : Menu horizontal complet avec dropdowns
- **Tablette (768px-1024px)** : Menu adapté avec tailles réduites
- **Mobile (768px et moins)** : Menu burger avec navigation latérale
- **Très petite taille (480px et moins)** : Interface ultra-compacte

### 🍔 Menu Burger Mobile
- Animation fluide d'ouverture/fermeture
- Overlay semi-transparent
- Dropdowns mobiles avec accordéons
- Navigation tactile optimisée
- Fermeture automatique lors du redimensionnement

### ♿ Accessibilité
- Navigation au clavier (Tab, Escape, flèches)
- Focus visible pour tous les éléments interactifs
- Support des lecteurs d'écran
- Respect des préférences de mouvement réduit

---

## 📁 Fichiers modifiés/ajoutés

### 🔧 Fichiers modifiés
1. **`src/views/partials/header.twig`** - Structure HTML responsive
2. **`src/views/layouts/main.twig`** - Inclusion du script mobile
3. **`public/assets/css/style.css`** - Styles CSS responsive
4. **`app.js`** - Route de test ajoutée

### 📂 Nouveaux fichiers
1. **`public/assets/js/mobile-menu.js`** - Logique du menu mobile
2. **`test-responsive.html`** - Page de test complète
3. **`test-responsive.bat`** - Script de test Windows

---

## 🚀 Test de l'implémentation

### Méthode 1 : Script automatique
```bash
# Double-cliquez sur :
test-responsive.bat
```

### Méthode 2 : Manuel
```bash
# 1. Installer les dépendances (si pas déjà fait)
npm install

# 2. Démarrer le serveur
node app.js

# 3. Ouvrir dans le navigateur
http://localhost:3000/test-responsive
```

---

## 🎨 Breakpoints Responsive

| Taille d'écran | Comportement |
|----------------|-------------|
| **≤ 360px** | Très petits smartphones - Logo 50px |
| **361px - 480px** | Petits smartphones - Logo 60px |
| **481px - 768px** | Grands smartphones/tablettes - Logo 70px |
| **769px - 1024px** | Tablettes/petits desktop - Menu réduit |
| **≥ 1025px** | Desktop complet - Tous les éléments |

---

## 🎯 Fonctionnalités du Menu Mobile

### 📱 Interface
- **Bouton burger** : 3 barres horizontales (☰)
- **Slide-in** : Menu qui glisse depuis la droite
- **Overlay** : Arrière-plan semi-transparent cliquable
- **Fermeture** : Bouton X ou touche Escape

### 📋 Navigation
- **Liens simples** : Accueil, OGEC, APEL, etc.
- **Dropdowns** : École, Pastorale, Restauration
- **Accordéons** : Ouverture/fermeture avec animation
- **Icons** : Emojis pour une meilleure UX mobile

### ⌨️ Accessibilité
- **Clavier** : Tab, Escape, flèches directionnelles
- **Focus** : Indication visuelle claire
- **Screen readers** : Attributs ARIA appropriés
- **Touch** : Zones de clic optimisées (44px minimum)

---

## 🔍 Tests à effectuer

### 📐 Responsive
- [ ] Redimensionner le navigateur de 320px à 1920px
- [ ] Tester sur différents appareils (mobile, tablette, desktop)
- [ ] Vérifier l'orientation portrait/paysage
- [ ] Tester les breakpoints critiques (768px, 1024px)

### 🍔 Menu Mobile
- [ ] Ouverture du menu burger
- [ ] Fermeture par le bouton X
- [ ] Fermeture par clic sur l'overlay
- [ ] Fermeture par la touche Escape
- [ ] Dropdowns accordéons fonctionnels

### ♿ Accessibilité
- [ ] Navigation au clavier uniquement
- [ ] Test avec un lecteur d'écran
- [ ] Focus visible sur tous les éléments
- [ ] Préférences de mouvement réduit respectées

### 🎨 Design
- [ ] Cohérence avec le thème Teal existant
- [ ] Animations fluides (300ms)
- [ ] Police Poppins correctement appliquée
- [ ] Couleurs #a7e3dd et #8dd3cc respectées

---

## 🛠️ Personnalisation

### 🎨 Couleurs
```css
/* Dans style.css, modifier : */
.mobile-menu { background: #a7e3dd; }
.hover\\:bg-\\[\\#8dd3cc\\] { background: #8dd3cc; }
```

### ⏱️ Animations
```css
/* Durée des transitions */
.mobile-menu { transition: transform 0.3s ease-in-out; }
.mobile-dropdown-content { transition: max-height 0.3s ease-in-out; }
```

### 📏 Tailles
```css
/* Breakpoints dans style.css */
@media (max-width: 768px) { /* Mobile */ }
@media (min-width: 769px) { /* Desktop */ }
```

---

## 🐛 Dépannage

### ❌ Problèmes courants

**Menu ne s'ouvre pas :**
- Vérifier que `mobile-menu.js` est chargé
- Contrôler les IDs : `mobile-menu-button`, `mobile-menu`
- Vérifier la console JavaScript (F12)

**Responsive ne fonctionne pas :**
- Confirmer la balise viewport : `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Vérifier que `style.css` est chargé après `tailwind.css`
- Vider le cache du navigateur (Ctrl+F5)

**Animations saccadées :**
- Vérifier la performance (trop d'éléments animés)
- Tester sur un autre navigateur
- Contrôler les préférences de mouvement réduit

### 🔧 Debug
```javascript
// Ajouter dans la console pour debug :
console.log('Menu:', document.getElementById('mobile-menu'));
console.log('Button:', document.getElementById('mobile-menu-button'));
console.log('Width:', window.innerWidth);
```

---

## 📋 Checklist de validation

### ✅ Fonctionnel
- [ ] Menu burger apparaît sur mobile (≤768px)
- [ ] Menu desktop affiché sur grands écrans (>768px)
- [ ] Dropdowns fonctionnent dans les deux modes
- [ ] Fermeture du menu par tous les moyens
- [ ] Navigation fluide entre les pages

### ✅ Design
- [ ] Cohérence visuelle avec l'existant
- [ ] Animations fluides et naturelles
- [ ] Tailles de police appropriées par device
- [ ] Espacement correct des éléments
- [ ] Logo adaptatif selon la taille

### ✅ Performance
- [ ] Chargement rapide (< 1 seconde)
- [ ] Pas de lag dans les animations
- [ ] Mémoire stable (pas de fuites)
- [ ] Compatible tous navigateurs modernes

### ✅ Accessibilité
- [ ] Contraste suffisant (4.5:1 minimum)
- [ ] Navigation clavier complète
- [ ] Lecteurs d'écran compatibles
- [ ] Zones de clic suffisantes (44px)

---

## 📞 Support

Si vous rencontrez des problèmes ou souhaitez des améliorations :

1. **Vérifier** cette documentation
2. **Tester** sur la page `/test-responsive`
3. **Consulter** la console développeur (F12)
4. **Valider** que tous les fichiers sont bien présents

Le header est maintenant **entièrement responsive** et prêt pour la production ! 🎉
