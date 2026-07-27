import * as http from 'http';
import { exec } from 'child_process';
import { BrowserWindow, Notification } from 'electron';

let proxyServer: http.Server | null = null;
let monitorInterval: NodeJS.Timeout | null = null;
let isGuardActive = false;
let blockedDomains: string[] = [];
let targetWindowGetter: () => BrowserWindow | null = () => null;

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
      font-size: 3.5rem;
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
      margin-top: 1.25rem;
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

export function setGuardMainWindow(getWin: () => BrowserWindow | null): void {
  targetWindowGetter = getWin;
}

function startLocalBlockServer(): void {
  if (proxyServer) return;

  proxyServer = http.createServer((_req, res) => {
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

// Track recently terminated PIDs to prevent repeated log spam
const recentlyKilledPids = new Set<string>();

/**
 * Native Windows Process Scanner using tasklist /v /fo csv:
 * Scans open window titles across browsers (Chrome, Edge, Firefox, Brave, Opera).
 * If a window title matches any blocked domain, terminates the tab process & pops Solitude to front!
 */
function scanAndEnforceBrowserTitles(): void {
  if (!isGuardActive || blockedDomains.length === 0 || process.platform !== 'win32') return;

  exec('tasklist /v /fo csv', (err, stdout) => {
    if (err || !stdout) return;

    const lines = stdout.split(/\r?\n/);
    lines.forEach((line) => {
      if (!line || line.startsWith('"Image Name"')) return;

      const parts = line.split('","').map((p) => p.replace(/^"|"$/g, ''));
      if (parts.length < 9) return;

      const procName = parts[0].toLowerCase();
      const pid = parts[1];
      const windowTitle = parts[8].toLowerCase();

      if (!windowTitle || windowTitle === 'n/a' || recentlyKilledPids.has(pid)) return;

      const isBrowser =
        procName.includes('chrome') ||
        procName.includes('msedge') ||
        procName.includes('firefox') ||
        procName.includes('brave') ||
        procName.includes('opera') ||
        procName.includes('applicationframehost');

      if (!isBrowser) return;

      // Check against blocked domains
      const matchedDomain = blockedDomains.find((domain) => {
        const clean = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
        const keyword = clean.split('.')[0]; // e.g. "youtube", "reddit", "twitter", "facebook"

        if (windowTitle.includes(clean)) return true;
        if (keyword.length >= 3 && windowTitle.includes(keyword)) return true;
        return false;
      });

      if (matchedDomain) {
        console.log(`[Focus Guard Enforcer] Closing blocked site window: "${parts[8]}" (PID: ${pid})`);
        recentlyKilledPids.add(pid);
        setTimeout(() => recentlyKilledPids.delete(pid), 5000);

        // Terminate specific browser process tab
        exec(`taskkill /F /PID ${pid}`, (killErr) => {
          if (killErr) {
            // Fallback SendKeys if taskkill was protected
            exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "(New-Object -ComObject wscript.shell).SendKeys('^w')"`);
          }
        });

        // Notify user & bring Solitude to front
        if (Notification.isSupported()) {
          new Notification({
            title: 'Focus Shield Active 🛡️',
            body: `Blocked site "${matchedDomain}" was closed to keep you on track.`,
          }).show();
        }

        const mainWin = targetWindowGetter();
        if (mainWin) {
          mainWin.show();
          mainWin.focus();
        }
      }
    });
  });
}

export function startFocusGuard(domains: string[]): { active: boolean; count: number } {
  isGuardActive = true;
  blockedDomains = domains.map((d) => d.trim().toLowerCase());

  startLocalBlockServer();

  if (monitorInterval) clearInterval(monitorInterval);
  // Run scan every 1000ms (1 second) for instant response
  monitorInterval = setInterval(scanAndEnforceBrowserTitles, 1000);
  scanAndEnforceBrowserTitles(); // Run immediate scan

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

  return { active: false, count: 0 };
}
