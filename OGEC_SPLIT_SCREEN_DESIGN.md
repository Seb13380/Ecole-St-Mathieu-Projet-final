# 🎨 PAGE OGEC - DESIGN SPLIT SCREEN (50/50)

## 🎯 NOUVEAU DESIGN CONFORME À LA CAPTURE

### 📐 **Structure Split Screen**
Chaque section est maintenant divisée en **2 moitiés de 50%** :
- **Moitié gauche** : Image ou couleur de fond
- **Moitié droite** : Contenu texte

```css
.section-split {
    display: flex;
    min-height: 60vh;
}

.section-half {
    width: 50%;
    padding: 60px 40px;
}
```

## 🎨 **Palette de Couleurs Inspirée de Saint-Michel**

### 🟢 **Vert Turquoise** : `#6fc7b7`
- Header principal
- Section "Ses Membres" (texte)
- Section "Ses Réalisations" (texte)

### 🟡 **Rose Saumon** : `#f7b5a8`
- Section "Présentation" 
- Section "Ses Missions"

### 🔵 **Bleu Foncé** : `#4a90a4`
- Section Contact

## 📋 **Structure Complète**

### 1️⃣ **Header** (Vert pleine largeur)
- Titre "L'OGEC"
- Sous-titre explicatif

### 2️⃣ **Présentation** (50/50 - Rose)
- **Gauche** : Zone image/motif
- **Droite** : Texte de présentation OGEC

### 3️⃣ **Ses Membres** (50/50 - Vert)
- **Gauche** : Texte détaillé des membres
- **Droite** : Zone image équipe

### 4️⃣ **Ses Missions** (50/50 - Rose)
- **Gauche** : Zone image missions
- **Droite** : Texte des 4 missions principales

### 5️⃣ **Ses Réalisations** (50/50 - Vert)
- **Gauche** : Texte des réalisations
- **Droite** : Zone image travaux

### 6️⃣ **Contact** (Bleu pleine largeur)
- Informations de contact centrées

## 🖼️ **Gestion des Images**

### Images de Fond Prévues
```css
.presentation-image {
    background-image: url('/assets/images/enfant-presentation.jpg');
}

.membres-image {
    background-image: url('/assets/images/equipe-membres.jpg');
}

.missions-image {
    background-image: url('/assets/images/missions-ecole.jpg');
}

.realisations-image {
    background-image: url('/assets/images/travaux-ecole.jpg');
}
```

### Fallback CSS
Si les images n'existent pas, des motifs CSS sont appliqués :
```css
.presentation-image::before {
    background: url('data:image/svg+xml,<svg>...');
    background-size: 50px 50px;
}
```

## 📱 **Responsive Design**

### Mobile (< 768px)
```css
.section-split {
    flex-direction: column; /* Passage en vertical */
}

.section-half {
    width: 100%;
    min-height: 40vh;
}
```

- Les sections 50/50 deviennent verticales
- Chaque moitié prend 100% de largeur
- Hauteur adaptée pour mobile

## 🎨 **Typographie**

### Titres Sections
```css
.section-title {
    font-size: 2.5rem;
    font-weight: bold;
    letter-spacing: 2px;
    text-transform: uppercase;
}
```

### Sous-titres
```css
.section-subtitle {
    font-size: 1.3rem;
    font-style: italic;
    font-weight: 300;
}
```

### Corps de Texte
```css
.section-text {
    font-size: 1.1rem;
    line-height: 1.7;
}
```

## ✨ **Caractéristiques Visuelles**

### ✅ **Exactement comme la capture :**
- **Sections alternées** en couleurs
- **50% image / 50% texte**
- **Typographie moderne** avec espacement
- **Couleurs douces** et professionnelles
- **Pleine largeur** sans marges

### ✅ **Améliorations apportées :**
- **Responsive** adaptatif
- **Contenu structuré** selon Saint-Michel
- **CSS fallback** pour les images
- **Accessibilité** optimisée

## 🧪 **Test de la Page**

**URL :** http://localhost:3007/gestion-ecole

### À vérifier :
1. **Desktop** : Sections 50/50 correctes
2. **Mobile** : Passage en vertical fluide
3. **Couleurs** : Alternance vert/rose/bleu
4. **Typographie** : Lisibilité et hiérarchie
5. **Pleine largeur** : Aucune marge sur les côtés

---

**🎉 La page OGEC correspond maintenant exactement au design demandé !**

- ✅ **Split screen 50/50** comme dans la capture
- ✅ **Couleurs alternées** vert/rose
- ✅ **Design moderne** et professionnel  
- ✅ **Pleine largeur** sans marges
- ✅ **Responsive** et accessible
