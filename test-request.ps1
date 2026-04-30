$url = "http://localhost:8081/api/auth/register"
$body = '{"fullName":"Test","email":"test999@test.com","username":"test999","password":"123456"}'
$r = Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
Write-Host "Status: $($r.StatusCode)"
Write-Host "Response: $($r.Content)"