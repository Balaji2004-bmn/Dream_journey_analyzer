# Fix User Script - Create and confirm user via backend API
# Replace with your actual email and desired password

$email = "bn3736407@gmail.com"
$password = "SecurePassword123!"  # Use a strong password: 8+ chars, upper, lower, number, special

Write-Host "Creating user $email..." -ForegroundColor Cyan

try {
    $signupBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    $signupResponse = Invoke-RestMethod -Method POST `
        -Uri "http://localhost:3001/api/auth/signup" `
        -Headers @{"Content-Type"="application/json"} `
        -Body $signupBody

    Write-Host "Signup response:" -ForegroundColor Green
    $signupResponse | ConvertTo-Json -Depth 5

    Write-Host "`nConfirming email..." -ForegroundColor Cyan

    $confirmBody = @{ email = $email } | ConvertTo-Json

    $confirmResponse = Invoke-RestMethod -Method POST `
        -Uri "http://localhost:3001/api/email/confirm-email" `
        -Headers @{"Content-Type"="application/json"} `
        -Body $confirmBody

    Write-Host "Email confirmation response:" -ForegroundColor Green
    $confirmResponse | ConvertTo-Json -Depth 5

    Write-Host "`nSuccess! You can now sign in with:" -ForegroundColor Green
    Write-Host "  Email: $email"
    Write-Host "  Password: (the one you set above)"

} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host "Details:" $_.ErrorDetails.Message
    }
}
