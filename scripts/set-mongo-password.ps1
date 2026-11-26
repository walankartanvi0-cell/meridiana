<#
  Updates the password inside MONGO_URI in backend/.env without echoing it.

  Usage (from the project root):
    powershell -ExecutionPolicy Bypass -File scripts\set-mongo-password.ps1
#>

param(
  [string]$User = 'walankartejal_db_user',
  [string]$Cluster = 'cluster0.o5bzlh7.mongodb.net',
  [string]$Database = 'meridiana'
)

$secure = Read-Host "Enter the Atlas password for $User" -AsSecureString
$plain = [System.Net.NetworkCredential]::new('', $secure).Password
$encoded = [uri]::EscapeDataString($plain)

$envPath = Join-Path $PSScriptRoot '..' 'backend' '.env'
$lines = Get-Content $envPath
$found = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '^\s*MONGO_URI\s*=') {
    $lines[$i] = 'MONGO_URI=mongodb+srv://{0}:{1}@{2}/{3}' -f $User, $encoded, $Cluster, $Database
    $found = $true
  }
}

if (-not $found) {
  throw 'MONGO_URI line not found in backend/.env'
}

Set-Content -Path $envPath -Value $lines -Encoding utf8
$plain = $null
Write-Host 'MONGO_URI updated in backend/.env (password was not displayed).'
