# push_all.ps1

# Función para verificar y cambiar a la rama correcta
function Checkout-Branch {
    param (
        [string]$branchName
    )

    $currentBranch = git symbolic-ref --short HEAD
    if ($currentBranch -ne $branchName) {
        git checkout $branchName
    }
}

# Función para hacer push en un submódulo
function Push-Submodule {
    param (
        [string]$submodulePath,
        [string]$branchName
    )
    
    Set-Location -Path $submodulePath
    Checkout-Branch -branchName $branchName
    git add .
    git commit -m "yves"
    git push origin $branchName
    Set-Location -Path ".."
}

# Nombre de la rama que deseas usar
$branchName = "main"

# Push en los submódulos
Push-Submodule -submodulePath ".\apiSIA" -branchName $branchName
Push-Submodule -submodulePath ".\SIA" -branchName $branchName

# Push en el repositorio principal
Checkout-Branch -branchName $branchName
git add .
git commit -m "yves"
git push origin $branchName

# Actualizar los submódulos
git submodule update --init --recursive
