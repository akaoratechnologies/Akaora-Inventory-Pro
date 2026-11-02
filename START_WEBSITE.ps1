# Akaora Inventory Pro v95: mobile billing simplified, dashboard polished, backup actions aligned.
# Exact hostname + port retained for existing browser data. Never clears site storage.
$ErrorActionPreference = 'Stop'
$port = 8765
$build = 'v95'
$folder = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path -LiteralPath (Join-Path $folder 'index.html'))) {
  Write-Host 'ERROR: index.html missing. Extract ALL ZIP files first.' -ForegroundColor Red
  exit 1
}
# Explicit static resource list prevents traversal and accidental access to backups.
$allowed = @{
  '/' = @('index.html','text/html; charset=utf-8')
  '/index.html' = @('index.html','text/html; charset=utf-8')
  '/akaora-build-v95.json' = @('akaora-build-v95.json','application/json; charset=utf-8')
  '/akaora-upgrade-v95.html' = @('akaora-upgrade-v95.html','text/html; charset=utf-8')
  '/service-worker.js' = @('service-worker.js','application/javascript; charset=utf-8')
  '/akaora-offline.js' = @('akaora-offline.js','application/javascript; charset=utf-8')
  '/manifest.webmanifest' = @('manifest.webmanifest','application/manifest+json')
  '/icon-192.png' = @('icon-192.png','image/png')
  '/icon-512.png' = @('icon-512.png','image/png')
  '/invoice-studio.css' = @('invoice-studio.css','text/css; charset=utf-8')
  '/invoice-studio.js' = @('invoice-studio.js','application/javascript; charset=utf-8')
  '/invoice-studio-v49.css' = @('invoice-studio-v49.css','text/css; charset=utf-8')
  '/studio-workspace-v52.css' = @('studio-workspace-v52.css','text/css; charset=utf-8')
  '/v60-glass-motion.css' = @('v60-glass-motion.css','text/css; charset=utf-8')
  '/v60-glass-motion.js' = @('v60-glass-motion.js','application/javascript; charset=utf-8')
  '/v62-typography-barcode.css' = @('v62-typography-barcode.css','text/css; charset=utf-8')
  '/v79-premium-mobile.css' = @('v79-premium-mobile.css','text/css; charset=utf-8')
  '/v79-premium-mobile.js' = @('v79-premium-mobile.js','application/javascript; charset=utf-8')
  '/v79-structured.css' = @('v79-structured.css','text/css; charset=utf-8')
  '/v79-structured.js' = @('v79-structured.js','application/javascript; charset=utf-8')
  '/v80-topbar-lock.js' = @('v80-topbar-lock.js','application/javascript; charset=utf-8')
  '/v80-topbar-lock.css' = @('v80-topbar-lock.css','text/css; charset=utf-8')
  '/v82-android-mobile.js' = @('v82-android-mobile.js','application/javascript; charset=utf-8')
  '/v82-android-mobile.css' = @('v82-android-mobile.css','text/css; charset=utf-8')
  '/v86-products-mobile.css' = @('v86-products-mobile.css','text/css; charset=utf-8')
  '/v87-unified-light.css' = @('v87-unified-light.css','text/css; charset=utf-8')
  '/v88-light-modal-fixes.css' = @('v88-light-modal-fixes.css','text/css; charset=utf-8')
  '/v89-toolbar-account-fixes.css' = @('v89-toolbar-account-fixes.css','text/css; charset=utf-8')
  '/v89-toolbar-account-fixes.js' = @('v89-toolbar-account-fixes.js','application/javascript; charset=utf-8')
  '/v90-responsive-stock.css' = @('v90-responsive-stock.css','text/css; charset=utf-8')
  '/v91-light-contrast.css' = @('v91-light-contrast.css','text/css; charset=utf-8')
  '/v95-printer-settings.css' = @('v95-printer-settings.css','text/css; charset=utf-8')
  '/v95-printer-settings.js' = @('v95-printer-settings.js','application/javascript; charset=utf-8')
  '/v90-responsive-stock.js' = @('v90-responsive-stock.js','application/javascript; charset=utf-8')
  '/quotation-builder.css' = @('quotation-builder.css','text/css; charset=utf-8')
  '/quotation-builder.js' = @('quotation-builder.js','application/javascript; charset=utf-8')
  '/accounts-v65.css' = @('accounts-v65.css','text/css; charset=utf-8')
  '/accounts-v65.js' = @('accounts-v65.js','application/javascript; charset=utf-8')
  '/cloud-sync-v81.js' = @('cloud-sync-v81.js','application/javascript; charset=utf-8')
}

# A previous version sometimes remained on the same port. Stop only an identified
# Akaora Windows PowerShell launcher; never terminate an arbitrary port owner.
function Find-Prior-AkaoraServer {
  try {
    $listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop)
    foreach ($item in $listeners) {
      $ownerPid = [int]$item.OwningProcess
      if ($ownerPid -eq $PID -or $ownerPid -le 0) { continue }
      $old = Get-CimInstance Win32_Process -Filter "ProcessId = $ownerPid" -ErrorAction Stop
      if ($old -and ($old.Name -ieq 'powershell.exe' -or $old.Name -ieq 'pwsh.exe') -and
          $old.CommandLine -match '(?i)START_WEBSITE\.ps1') {
        return $ownerPid
      }
    }
  } catch { }
  return $null
}

$server = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$started = $false
try {
  try {
    $server.Start(); $started = $true
  } catch {
    $oldPid = Find-Prior-AkaoraServer
    if ($null -ne $oldPid) {
      Write-Host "An earlier Akaora launcher is running on port $port (PID $oldPid)." -ForegroundColor Yellow
      Write-Host 'Restarting that local static server so the newest app loads...' -ForegroundColor Cyan
      try { Stop-Process -Id $oldPid -ErrorAction Stop }
      catch { Write-Host 'Could not stop the previous launcher. Please close its PowerShell window.' -ForegroundColor Red }
      # Give Windows time to release the listener. No browser storage is modified.
      for ($tryNum=0; $tryNum -lt 10 -and -not $started; $tryNum++) {
        Start-Sleep -Milliseconds 500
        try {
          $server = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
          $server.Start(); $started = $true
        } catch { }
      }
    }
  }
  if (-not $started) {
    Write-Host "ERROR: Port $port is already in use by another application." -ForegroundColor Red
    Write-Host 'Close the old server/window, then double-click START_WEBSITE.bat again.' -ForegroundColor Yellow
    exit 1
  }
  Write-Host ''
  Write-Host '================================================' -ForegroundColor Green
  Write-Host "  AKAORA INVENTORY PRO $build - READY" -ForegroundColor Green
  Write-Host '================================================' -ForegroundColor Green
  Write-Host "Website:   http://localhost:$port/" -ForegroundColor Green
  Write-Host "Build test: http://localhost:$port/akaora-build-v95.json" -ForegroundColor Cyan
  Write-Host "Repair page: http://localhost:$port/akaora-upgrade-v95.html" -ForegroundColor Cyan
  Write-Host 'Keep this window open. Ctrl+C stops the app.' -ForegroundColor Gray
  Write-Host 'Your existing local browser data is not cleared.' -ForegroundColor DarkGray
  Write-Host ''
  try { Start-Process "http://localhost:$port/akaora-upgrade-v95.html" }
  catch { Write-Host "Open http://localhost:$port/akaora-upgrade-v95.html manually in your browser." -ForegroundColor Yellow }
  while ($true) {
    $client = $null
    try {
      $client = $server.AcceptTcpClient()
      $client.ReceiveTimeout = 3000; $client.SendTimeout = 3000
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream,[System.Text.Encoding]::ASCII,$false,2048,$true)
      $first = $reader.ReadLine()
      if ([string]::IsNullOrEmpty($first)) { continue }
      do { $line = $reader.ReadLine() } while ($null -ne $line -and $line.Length -gt 0)
      $parts = $first -split ' '
      $method = $parts[0]
      $path = ($parts[1] -split '\?')[0]
      if (($method -ne 'GET' -and $method -ne 'HEAD') -or -not $allowed.ContainsKey($path)) {
        $content = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
        $status = '404 Not Found'; $contentType = 'text/plain; charset=utf-8'
      } else {
        $spec = $allowed[$path]
        $filename = Join-Path $folder $spec[0]
        if (Test-Path -LiteralPath $filename) {
          $content = [System.IO.File]::ReadAllBytes($filename)
          $status = '200 OK'; $contentType = $spec[1]
        } else {
          $content = [System.Text.Encoding]::UTF8.GetBytes('Missing app asset')
          $status = '500 Internal Server Error'; $contentType = 'text/plain; charset=utf-8'
        }
      }
      $header = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($content.Length)`r`nCache-Control: no-store, max-age=0`r`nConnection: close`r`nX-Content-Type-Options: nosniff`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($headerBytes,0,$headerBytes.Length)
      if ($method -ne 'HEAD' -and $content.Length -gt 0) { $stream.Write($content,0,$content.Length) }
      $stream.Flush()
    } catch [System.IO.IOException] {
      # Browsers often close obsolete/reloaded connections mid-response.
      # This does not indicate a failed startup or lost business data.
    } catch [System.Net.Sockets.SocketException] {
      # Normal disconnect/abort during refresh; do not flood the terminal.
    } catch {
      # Windows PowerShell wraps a closed-browser Write() IOException in
      # MethodInvocationException; inspect inner exceptions before logging.
      $cause = $_.Exception
      $normalDisconnect = $false
      while ($null -ne $cause) {
        if ($cause -is [System.IO.IOException] -or $cause -is [System.Net.Sockets.SocketException]) {
          $normalDisconnect = $true
          break
        }
        $cause = $cause.InnerException
      }
      if (-not $normalDisconnect) {
        Write-Host "Request warning: $($_.Exception.Message)" -ForegroundColor DarkYellow
      }
    } finally {
      if ($null -ne $client) { $client.Close() }
    }
  }
} finally {
  if ($started) { $server.Stop() }
}
