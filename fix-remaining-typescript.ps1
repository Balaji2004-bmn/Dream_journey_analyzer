Get-ChildItem -Path "src\components\ui" -Filter "*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    # Fix function parameter type annotations
    $content = $content -replace '\}: [A-Za-z_][A-Za-z0-9_<>|&\[\]]*\)', ')'
    $content = $content -replace ': [A-Za-z_][A-Za-z0-9_<>|&\[\]]*\)', ')'
    # Fix remaining TypeScript syntax
    $content = $content -replace 'interface [^{]*\{[^}]*\}', '// TypeScript interface removed'
    $content = $content -replace 'type [^=]*=[^;]*;', '// TypeScript type removed'
    Set-Content -Path $_.FullName -Value $content
}

# Also fix other files that might have TypeScript syntax
Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    # Fix function parameter type annotations
    $content = $content -replace '\}: [A-Za-z_][A-Za-z0-9_<>|&\[\]]*\)', ')'
    $content = $content -replace ': [A-Za-z_][A-Za-z0-9_<>|&\[\]]*\)', ')'
    Set-Content -Path $_.FullName -Value $content
}

Write-Host "Fixed remaining TypeScript syntax"
