$url = "http://localhost:8080/api/auth/register"
$body = '{"fullName":"Test","email":"gwtest@test.com","username":"gwtest","password":"123456"}'
$r = Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
Write-Host "Status: $($r.StatusCode)"
Write-Host "Response: $($r.Content)"