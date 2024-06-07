# pull_all.ps1

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

# Función para hacer pull en un submódulo
function Pull-Submodule {
    param (
        [string]$submodulePath,
        [string]$branchName
    )
    
    Set-Location -Path $submodulePath
    Checkout-Branch -branchName $branchName
    git pull origin $branchName
    Set-Location -Path ".."
}

# Nombre de la rama que deseas usar
$branchName = "main"

# Pull en los submódulos
Pull-Submodule -submodulePath ".\apiSIA" -branchName $branchName
Pull-Submodule -submodulePath ".\SIA" -branchName $branchName

# Pull en el repositorio principal
Checkout-Branch -branchName $branchName
git pull origin $branchName

# Actualizar los submódulos
git submodule update --init --recursive
