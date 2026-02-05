# Script PowerShell pour exécuter les tests sur Windows
# Usage: .\run-tests.ps1 [test-file-pattern]

param(
    [string]$TestPattern = ""
)

# Définir les variables d'environnement
$env:NODE_ENV = "test"

# Charger les variables du fichier .env.test
if (Test-Path .env.test) {
    Get-Content .env.test | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

# Exécuter Jest avec le pattern si fourni
if ($TestPattern) {
    Write-Host "Exécution des tests: $TestPattern" -ForegroundColor Cyan
    npx jest $TestPattern
} else {
    Write-Host "Exécution de tous les tests" -ForegroundColor Cyan
    npx jest
}

# Capturer le code de sortie
$exitCode = $LASTEXITCODE
Write-Host "`nTests terminés avec le code de sortie: $exitCode" -ForegroundColor $(if ($exitCode -eq 0) { "Green" } else { "Red" })
exit $exitCode
