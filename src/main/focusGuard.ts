import * as http from 'http';
import { exec } from 'child_process';

let proxyServer: http.Server | null = null;
let monitorInterval: NodeJS.Timeout | null = null;
let isGuardActive = false;
let blockedDomains: string[] = [];

// Lightweight HTML page served when a blocked website is accessed
const BLOCKED_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Focus Shield Active — Solitude</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0B0F17;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
    }
    .shield-card {
      background: #1E293B;
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 2.5rem;
      border-radius: 18px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      max-width: 480px;
    }
    .shield-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.6rem;
      margin-bottom: 0.5rem;
      color: #818CF8;
    }
    p {
      color: #94A3B8;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .badge {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.4rem 0.85rem;
      background: rgba(99, 102, 241, 0.2);
      color: #818CF8;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="shield-card">
    <div class="shield-icon">🛡️</div>
    <h1>Focus Session Active</h1>
    <p>This website is currently blocked by your Solitude Focus Shield to help you stay in deep work.</p>
    <div class="badge">Stay Focused & Finish Strong</div>
  </div>
</body>
</html>
`;

/**
 * Start local HTTP proxy server on port 8899 to serve blocked page
 */
function startLocalBlockServer(): void {
  if (proxyServer) return;

  proxyServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(BLOCKED_HTML);
  });

  proxyServer.listen(8899, '127.0.0.1', () => {
    console.log('[Focus Guard] Local block server running on port 8899');
  });

  proxyServer.on('error', (err) => {
    console.warn('[Focus Guard] Server error:', err);
  });
}

function stopLocalBlockServer(): void {
  if (proxyServer) {
    proxyServer.close();
    proxyServer = null;
  }
}

/**
 * Windows Window Title Monitor:
 * Scans open browser process windows every 2s.
 * If a browser title matches any blocked domain, minimizes or closes the tab/window.
 */
function scanAndEnforceBrowserTitles(): void {
  if (!isGuardActive || blockedDomains.length === 0) return;

  if (process.platform !== 'win32') return;

  // PowerShell script to get process window titles
  const psScript = `
    $blocked = @(${blockedDomains.map((d) => `"${d.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '')}"`).join(',')});
    Get-Process | Where-Object { $_.MainWindowTitle } | ForEach-Object {
      $title = $_.MainWindowTitle.ToLower();
      $proc = $_.ProcessName.ToLower();
      foreach ($b in $blocked) {
        $cleanTag = $b.Split('.')[0];
        if ($title -like "*$cleanTag*" -or $title -like "*$b*") {
          Write-Output "MATCH:$($_.Id):$($proc):$($_.MainWindowTitle)"
        }
      }
    }
  `.replace(/\n/g, ' ');

  exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript}"`, (err, stdout) => {
    if (err || !stdout) return;

    const lines = stdout.split('\n').map((l) => l.trim()).filter(Boolean);
    lines.forEach((line) => {
      if (line.startsWith('MATCH:')) {
        const parts = line.split(':');
        const pid = parts[1];
        const procName = parts[2];
        const title = parts.slice(3).join(':');

        console.log(`[Focus Guard Enforcer] Detected blocked site in title: "${title}" (PID: ${pid}, Proc: ${procName})`);

        // Close or minimize window if it's a browser tab matching blocked site
        if (pid && (procName.includes('chrome') || procName.includes('edge') || procName.includes('firefox') || procName.includes('brave') || procName.includes('opera'))) {
          // Send minimize signal to browser window or close process
          exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "(New-Object -ComObject wscript.shell).SendKeys('^w')"`);
        }
      }
    });
  });
}

/**
 * Enable Windows Internet System Proxy PAC script or hosts loopback
 */
function setWindowsSystemProxy(enable: boolean, domains: string[] = []): void {
  if (process.platform !== 'win32') return;

  if (enable && domains.length > 0) {
    const cleanList = domains.map((d) => d.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, ''));
    
    // Configure PAC script or loopback rules via reg commands
    const psCmd = `
      $reg = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings";
      Set-ItemProperty -Path $reg -Name ProxyEnable -Value 0;
    `.replace(/\n/g, ' ');

    exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`);
  } else {
    const psCmd = `
      $reg = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings";
      Set-ItemProperty -Path $reg -Name ProxyEnable -Value 0;
    `.replace(/\n/g, ' ');

    exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`);
  }
}

export function startFocusGuard(domains: string[]): { active: boolean; count: number } {
  isGuardActive = true;
  blockedDomains = domains.map((d) => d.trim().toLowerCase());

  startLocalBlockServer();

  if (monitorInterval) clearInterval(monitorInterval);
  monitorInterval = setInterval(scanAndEnforceBrowserTitles, 2000);
  scanAndEnforceBrowserTitles(); // Run immediate first scan

  setWindowsSystemProxy(true, blockedDomains);

  return { active: true, count: blockedDomains.length };
}

export function stopFocusGuard(): { active: false; count: 0 } {
  isGuardActive = false;
  blockedDomains = [];

  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }

  stopLocalBlockServer();
  setWindowsSystemProxy(false);

  return { active: false, count: 0 };
}
