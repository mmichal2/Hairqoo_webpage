param(
  [int]$Port = 5500
)

$root = $PSScriptRoot
$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".mjs"  = "application/javascript; charset=utf-8"
  ".cjs"  = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".webp" = "image/webp"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
  ".ttf"  = "font/ttf"
}

$prefixes = @("http://+:$Port/", "http://localhost:$Port/", "http://127.0.0.1:$Port/")
$listener = $null
$bound = $false
foreach ($p in $prefixes) {
  $candidate = New-Object System.Net.HttpListener
  try {
    $candidate.Prefixes.Add($p)
    $candidate.Start()
    $listener = $candidate
    Write-Host "LISTENING $p"
    $bound = $true
    break
  } catch {
    Write-Host "FAILED $p : $($_.Exception.Message)"
    try { $candidate.Close() } catch {}
  }
}
if (-not $bound) { Write-Host "Could not bind listener"; exit 1 }

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch { break }
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($rel -eq "/" -or $rel -eq "") { $rel = "/index.html" }
    $rel = $rel.TrimStart("/").Replace("/", "\")
    $full = Join-Path $root $rel
    $fullResolved = [System.IO.Path]::GetFullPath($full)
    if (-not $fullResolved.StartsWith([System.IO.Path]::GetFullPath($root))) {
      $res.StatusCode = 403; $res.Close(); continue
    }
    if (Test-Path $fullResolved -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($fullResolved).ToLower()
      if ($mime.ContainsKey($ext)) { $res.ContentType = $mime[$ext] }
      $res.Headers.Add("Cache-Control", "no-store")
      $bytes = [System.IO.File]::ReadAllBytes($fullResolved)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {
    try { $res.StatusCode = 500 } catch {}
  } finally {
    try { $res.OutputStream.Close() } catch {}
  }
}
