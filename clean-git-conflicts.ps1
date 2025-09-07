# Script de nettoyage des marqueurs de conflit Git
Write-Host "Recherche et suppression des marqueurs de conflit Git..." -ForegroundColor Yellow

$markersToFind = @(
    "<<<<<<< HEAD",
    "=======",
    ">>>>>>> e971b22"
)

$foundFiles = @()

# Recherche dans tous les fichiers du projet
$files = Get-ChildItem -Recurse -File -Include *.twig,*.html,*.js,*.css,*.php,*.json -ErrorAction SilentlyContinue

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $hasMarkers = $false
            foreach ($marker in $markersToFind) {
                if ($content -match [regex]::Escape($marker)) {
                    $hasMarkers = $true
                    break
                }
            }
            
            if ($hasMarkers) {
                $foundFiles += $file.FullName
                Write-Host "Marqueurs trouvés dans: $($file.FullName)" -ForegroundColor Red
                
                # Nettoyer le contenu
                $cleanContent = $content
                foreach ($marker in $markersToFind) {
                    $cleanContent = $cleanContent -replace [regex]::Escape($marker), ""
                }
                
                # Supprimer les lignes vides multiples
                $cleanContent = $cleanContent -replace "`r`n`r`n`r`n", "`r`n`r`n"
                
                # Sauvegarder le fichier nettoyé
                Set-Content -Path $file.FullName -Value $cleanContent -Encoding UTF8
                Write-Host "Fichier nettoyé: $($file.FullName)" -ForegroundColor Green
            }
        }
    }
    catch {
        # Ignorer les erreurs de lecture de fichiers
    }
}

if ($foundFiles.Count -eq 0) {
    Write-Host "Aucun marqueur de conflit Git trouvé dans les fichiers." -ForegroundColor Green
} else {
    Write-Host "$($foundFiles.Count) fichier(s) nettoyé(s)." -ForegroundColor Cyan
}

Write-Host "Nettoyage terminé !" -ForegroundColor Green
