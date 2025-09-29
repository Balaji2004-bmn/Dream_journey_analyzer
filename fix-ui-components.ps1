# Comprehensive fix for all UI components TypeScript syntax
Get-ChildItem -Path "src\components\ui" -Filter "*.jsx" | ForEach-Object {
    Write-Host "Fixing $($_.Name)..."
    $content = Get-Content $_.FullName -Raw
    
    # Fix corrupted React.forwardRef syntax patterns
    $content = $content -replace 'React\.forwardRef,\s*\n\s*React\.ComponentPropsWithoutRef<[^>]*>\s*\n>', 'React.forwardRef('
    $content = $content -replace 'React\.forwardRef<[^>]*>', 'React.forwardRef'
    
    # Fix any remaining TypeScript type annotations
    $content = $content -replace ': React\.[A-Za-z<>|&\[\]_]*', ''
    $content = $content -replace ': [A-Za-z_][A-Za-z0-9_<>|&\[\]]*\)', ')'
    
    # Fix interface declarations
    $content = $content -replace 'interface [^{]*\{[^}]*\}', '// TypeScript interface removed'
    
    # Fix type declarations
    $content = $content -replace 'type [^=]*=[^;]*;', '// TypeScript type removed'
    
    Set-Content -Path $_.FullName -Value $content
}

Write-Host "Fixed all UI components TypeScript syntax"
