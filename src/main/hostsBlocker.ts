import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

const HOSTS_TAG_BEGIN = '# BEGIN SOLITUDE BLOCKER';
const HOSTS_TAG_END = '# END SOLITUDE BLOCKER';

function getHostsPath(): string {
  if (process.platform === 'win32') {
    const sysRoot = process.env.SystemRoot || 'C:\\Windows';
    return path.join(sysRoot, 'System32', 'drivers', 'etc', 'hosts');
  }
  return '/etc/hosts';
}

function flushDNS(): void {
  if (process.platform === 'win32') {
    exec('ipconfig /flushdns', (err) => {
      if (err) console.warn('Flush DNS warning:', err);
    });
  }
}

export function enableSystemBlocker(domains: string[]): { success: boolean; error?: string } {
  const hostsPath = getHostsPath();

  try {
    let content = '';
    if (fs.existsSync(hostsPath)) {
      content = fs.readFileSync(hostsPath, 'utf8');
    }

    // Clean existing Solitude section
    const reg = new RegExp(`${HOSTS_TAG_BEGIN}[\\s\\S]*?${HOSTS_TAG_END}`, 'g');
    content = content.replace(reg, '').trim();

    if (domains.length === 0) {
      fs.writeFileSync(hostsPath, content + '\n', 'utf8');
      flushDNS();
      return { success: true };
    }

    // Generate new hosts entries
    const entries: string[] = [HOSTS_TAG_BEGIN];
    domains.forEach((d) => {
      const clean = d.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
      if (clean) {
        entries.push(`127.0.0.1 ${clean}`);
        entries.push(`127.0.0.1 www.${clean}`);
      }
    });
    entries.push(HOSTS_TAG_END);

    const newContent = content + '\n\n' + entries.join('\n') + '\n';
    fs.writeFileSync(hostsPath, newContent, 'utf8');
    flushDNS();
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed writing to hosts file:', errorMsg);

    // If permission denied on Windows, attempt PowerShell elevated execution
    if (process.platform === 'win32' && (errorMsg.includes('EACCES') || errorMsg.includes('PERM'))) {
      try {
        const cleanDomains = domains
          .map((d) => d.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, ''))
          .filter(Boolean);

        const lines = [
          '127.0.0.1 ' + cleanDomains.join(' 127.0.0.1 '),
          '127.0.0.1 ' + cleanDomains.map((d) => 'www.' + d).join(' 127.0.0.1 '),
        ].filter(Boolean);

        const psCommand = `
          $hosts = "${hostsPath.replace(/\\/g, '\\\\')}";
          $raw = Get-Content $hosts -Raw;
          $cleaned = $raw -replace '(?s)# BEGIN SOLITUDE BLOCKER.*?# END SOLITUDE BLOCKER', '';
          $block = "\`n# BEGIN SOLITUDE BLOCKER\`n${lines.join('\`n')}\`n# END SOLITUDE BLOCKER\`n";
          Set-Content -Path $hosts -Value ($cleaned + $block) -Force;
          ipconfig /flushdns;
        `.replace(/\n/g, ' ');

        exec(`powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command \\"${psCommand}\\"' -Verb RunAs"`);
        return { success: true };
      } catch (psErr) {
        console.error('Elevated powershell block failed:', psErr);
      }
    }

    return {
      success: false,
      error: 'Permission denied. Please run Solitude as Administrator to enable system-wide website blocking.',
    };
  }
}

export function disableSystemBlocker(): { success: boolean; error?: string } {
  const hostsPath = getHostsPath();

  try {
    if (!fs.existsSync(hostsPath)) {
      return { success: true };
    }

    let content = fs.readFileSync(hostsPath, 'utf8');
    const reg = new RegExp(`${HOSTS_TAG_BEGIN}[\\s\\S]*?${HOSTS_TAG_END}`, 'g');
    content = content.replace(reg, '').trim() + '\n';

    fs.writeFileSync(hostsPath, content, 'utf8');
    flushDNS();
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed clearing hosts file:', errorMsg);

    if (process.platform === 'win32' && (errorMsg.includes('EACCES') || errorMsg.includes('PERM'))) {
      try {
        const psCommand = `
          $hosts = "${hostsPath.replace(/\\/g, '\\\\')}";
          $raw = Get-Content $hosts -Raw;
          $cleaned = $raw -replace '(?s)# BEGIN SOLITUDE BLOCKER.*?# END SOLITUDE BLOCKER', '';
          Set-Content -Path $hosts -Value $cleaned -Force;
          ipconfig /flushdns;
        `.replace(/\n/g, ' ');

        exec(`powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command \\"${psCommand}\\"' -Verb RunAs"`);
        return { success: true };
      } catch (psErr) {
        console.error('Elevated powershell disable failed:', psErr);
      }
    }

    return { success: false, error: errorMsg };
  }
}
