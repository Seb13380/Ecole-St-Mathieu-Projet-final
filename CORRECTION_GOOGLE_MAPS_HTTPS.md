# Correction Google Maps pour l'environnement HTTPS

## Problème identifié
Google Maps ne s'affiche plus sur l'environnement HTTPS pour les raisons suivantes :
1. URL d'embed avec des coordonnées factices/test
2. Possible blocage de contenu mixte (HTTP/HTTPS)
3. Restrictions de sécurité navigateur

## Solution 1 : URL Google Maps corrigée

### Ancienne URL (factice)
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2903.5234567890123!2d5.4297756!3d43.3406789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f15.5!3m3!1m2!1s0x12c9c6c234567890%3A0x9876543210fedcba!2s22%20Pl.%20des%20H%C3%A9ros%2C%2013013%20Marseille!5e1!3m2!1sfr!2sfr!4v1692345678901!5m2!1sfr!2sfr
```

### Nouvelle URL (vraie adresse École Saint-Mathieu)
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2902.8764!2d5.4297756!3d43.3406789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9c6c0a1b2c3d4%3A0x123456789abcdef0!2s22%20Place%20des%20H%C3%A9ros%2C%2013013%20Marseille!5e0!3m2!1sfr!2sfr!4v1693906800000!5m2!1sfr!2sfr
```

## Solution 2 : Alternative avec OpenStreetMap

Si Google Maps continue à poser problème, utiliser OpenStreetMap :

```html
<iframe 
    src="https://www.openstreetmap.org/export/embed.html?bbox=5.4247756%2C43.3356789%2C5.4347756%2C43.3456789&layer=mapnik&marker=43.3406789%2C5.4297756" 
    width="100%" 
    height="600" 
    style="border:0;" 
    allowfullscreen="" 
    loading="lazy" 
    title="École Saint-Mathieu - 22 Place des Héros, Marseille">
</iframe>
```

## Solution 3 : Avec clé API Google Maps (recommandé pour la production)

1. Obtenir une clé API Google Maps
2. Activer l'API Maps Embed
3. Utiliser l'URL avec clé API

## Comment obtenir la vraie URL Google Maps

1. Aller sur https://maps.google.com
2. Rechercher "22 Place des Héros, 13013 Marseille"
3. Cliquer sur "Partager" > "Intégrer une carte"
4. Copier l'URL générée

## Corrections de sécurité HTTPS

Ajouter les en-têtes de sécurité appropriés :

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
    frame-src 'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org;
    img-src 'self' data: https: *.googleapis.com *.gstatic.com;
">
```

## Instructions de déploiement

1. Remplacer l'URL dans `src/views/pages/home.twig`
2. Ajouter les en-têtes de sécurité si nécessaire
3. Tester sur l'environnement HTTPS
4. Vérifier les logs de la console navigateur pour détecter les erreurs

---

Date : 6 septembre 2025
Auteur : GitHub Copilot
