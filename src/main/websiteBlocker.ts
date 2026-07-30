/**
 * WebsiteBlocker Service
 *
 * Manages website blocking via the Windows hosts file during Focus Sessions.
 * All file operations are synchronous to prevent race conditions on the hosts file.
 *
 * This module runs exclusively in the Electron main process and requires
 * administrator privileges to modify the system hosts file.
 *
 * Architecture:
 *   - Marker-based: Entries are wrapped in comment markers for surgical add/remove.
 *   - Backup-based: Full hosts file backup before first modification as safety net.
 *   - Lock file: Sentinel file detects unclean shutdowns for crash recovery.
 *   - Dual IP Redirection: Redirects to 0.0.0.0 (IPv4) and :: (IPv6) for instant connection rejection.
 *   - DoH Fallback: Blocks popular Secure DNS (DNS-over-HTTPS) domains to force browser fallback to system DNS.
 */

import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ─── Constants ──────────────────────────────────────────────────────────────────

const HOSTS_PATH = 'C:\\Windows\\System32\\drivers\\etc\\hosts';

const MARKER_START = '# >>> SOLITUDE FOCUS BLOCK START';
const MARKER_END = '# >>> SOLITUDE FOCUS BLOCK END';
const MARKER_COMMENT = '# Managed by Solitude Productivity Hub — do not edit manually.';

/**
 * Common DNS-over-HTTPS (DoH) resolver hostnames used by Chrome, Edge, Firefox, Brave.
 * Blocking these hostnames forces browsers to fall back to system OS DNS (which reads the hosts file).
 */
const DOH_RESOLVER_DOMAINS: readonly string[] = [
  'dns.google',
  'cloudflare-dns.com',
  'chrome.cloudflare-dns.com',
  'mozilla.cloudflare-dns.com',
  'dns.quad9.net',
  'doh.cleanbrowsing.org',
  'dns.adguard-dns.com',
  'family.adguard-dns.com',
  'dns.nextdns.io',
];

/**
 * Comprehensive list of distracting websites and their subdomains.
 */
const DEFAULT_BLOCKED_SITES: readonly string[] = [
  // YouTube
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  // Reddit
  'reddit.com',
  'www.reddit.com',
  'old.reddit.com',
  'sh.reddit.com',
  'm.reddit.com',
  'pv.reddit.com',
  // Instagram
  'instagram.com',
  'www.instagram.com',
  'm.instagram.com',
  'l.instagram.com',
  // X / Twitter
  'x.com',
  'www.x.com',
  'twitter.com',
  'www.twitter.com',
  'mobile.twitter.com',
  'api.twitter.com',
  't.co',
  'www.t.co',
  // Facebook
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'touch.facebook.com',
  'fb.com',
  'www.fb.com',
  'fb.watch',
  // TikTok
  'tiktok.com',
  'www.tiktok.com',
  'm.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
];

// ─── Result Types ───────────────────────────────────────────────────────────────

export interface BlockerResult {
  success: boolean;
  error?: string;
  log: string[];
}

export interface AdminCheckResult {
  isAdmin: boolean;
  error?: string;
}

// ─── WebsiteBlocker Service ─────────────────────────────────────────────────────

export class WebsiteBlocker {
  private readonly backupPath: string;
  private readonly lockFilePath: string;
  private operationLog: string[] = [];

  constructor() {
    const userDataPath = app.getPath('userData');
    this.backupPath = path.join(userDataPath, 'hosts.solitude-backup');
    this.lockFilePath = path.join(userDataPath, 'solitude-blocking.lock');
  }

  // ── Internal Logging ──────────────────────────────────────────────────────

  private resetLog(): void {
    this.operationLog = [];
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}`;
    this.operationLog.push(entry);
    console.log(`[WebsiteBlocker] ${message}`);
  }

  // ── File Attribute Helper ────────────────────────────────────────────────

  /**
   * Temporarily removes read-only attribute from hosts file if set by Windows/antivirus.
   */
  private ensureWritable(): void {
    try {
      if (fs.existsSync(HOSTS_PATH)) {
        execSync(`attrib -r "${HOSTS_PATH}"`, { windowsHide: true });
      }
    } catch {
      // Non-fatal if attrib command is unavailable
    }
  }

  // ── Admin Privilege Verification ──────────────────────────────────────────

  /**
   * Tests whether the current process has write access to the hosts file.
   */
  verifyAdminPrivileges(): AdminCheckResult {
    this.ensureWritable();
    try {
      fs.accessSync(HOSTS_PATH, fs.constants.R_OK | fs.constants.W_OK);
      return { isAdmin: true };
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'EPERM' || code === 'EACCES') {
        return {
          isAdmin: false,
          error: 'Administrator privileges required. Please right-click Solitude and select "Run as Administrator".',
        };
      }
      return {
        isAdmin: false,
        error: `Cannot access hosts file: ${(err as Error).message}`,
      };
    }
  }

  // ── Hosts File Backup ─────────────────────────────────────────────────────

  /**
   * Creates a backup of the current hosts file if one does not already exist.
   */
  private backupHostsFile(): boolean {
    try {
      if (fs.existsSync(this.backupPath)) {
        this.log('Backup already exists — skipping to prevent overwriting a clean backup.');
        return true;
      }

      if (!fs.existsSync(HOSTS_PATH)) {
        this.log('WARNING: Hosts file does not exist at expected path. Creating empty backup.');
        fs.writeFileSync(this.backupPath, '', 'utf-8');
        return true;
      }

      fs.copyFileSync(HOSTS_PATH, this.backupPath);
      this.log(`Backup created at: ${this.backupPath}`);
      return true;
    } catch (err: unknown) {
      this.log(`ERROR: Failed to create backup — ${(err as Error).message}`);
      return false;
    }
  }

  /**
   * Restores the hosts file from our backup copy.
   */
  private restoreFromBackup(): boolean {
    this.ensureWritable();
    try {
      if (!fs.existsSync(this.backupPath)) {
        this.log('WARNING: No backup file found — cannot restore from backup.');
        return false;
      }

      const backupContent = fs.readFileSync(this.backupPath, 'utf-8');
      fs.writeFileSync(HOSTS_PATH, backupContent, 'utf-8');
      this.log('Hosts file restored from backup.');

      // Verify the write succeeded
      const verifyContent = fs.readFileSync(HOSTS_PATH, 'utf-8');
      if (verifyContent !== backupContent) {
        this.log('ERROR: Post-restore verification failed — content mismatch.');
        return false;
      }

      this.log('Restoration verified — hosts file matches backup.');
      return true;
    } catch (err: unknown) {
      this.log(`ERROR: Restore from backup failed — ${(err as Error).message}`);
      return false;
    }
  }

  /**
   * Deletes the backup file.
   */
  private deleteBackup(): void {
    try {
      if (fs.existsSync(this.backupPath)) {
        fs.unlinkSync(this.backupPath);
        this.log('Backup file deleted.');
      }
    } catch (err: unknown) {
      this.log(`WARNING: Could not delete backup file — ${(err as Error).message}`);
    }
  }

  // ── Marker-Based Entry Management ─────────────────────────────────────────

  /**
   * Removes all content between SOLITUDE markers (inclusive) from a string.
   */
  private removeBlockEntries(content: string): string {
    const lines = content.split(/\r?\n/);
    const result: string[] = [];
    let insideBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === MARKER_START) {
        insideBlock = true;
        continue;
      }
      if (trimmed === MARKER_END) {
        insideBlock = false;
        continue;
      }
      if (!insideBlock) {
        result.push(line);
      }
    }

    while (result.length > 0 && result[result.length - 1].trim() === '') {
      result.pop();
    }

    return result.length > 0 ? result.join('\r\n') + '\r\n' : '';
  }

  /**
   * Reads the hosts file, removes any existing Solitude block entries, and writes it back.
   */
  private removeBlockEntriesFromFile(): boolean {
    this.ensureWritable();
    try {
      if (!fs.existsSync(HOSTS_PATH)) {
        this.log('Hosts file does not exist — nothing to clean.');
        return true;
      }

      const content = fs.readFileSync(HOSTS_PATH, 'utf-8');
      const cleaned = this.removeBlockEntries(content);

      if (cleaned === content) {
        this.log('No Solitude blocking entries found in hosts file.');
        return true;
      }

      fs.writeFileSync(HOSTS_PATH, cleaned, 'utf-8');
      this.log('Blocking entries removed from hosts file via marker cleanup.');
      return true;
    } catch (err: unknown) {
      this.log(`ERROR: Marker-based removal failed — ${(err as Error).message}`);
      return false;
    }
  }

  /**
   * Builds the marker-delimited block of hosts entries for the given sites.
   * Uses BOTH 0.0.0.0 (IPv4) and :: (IPv6) for instant connection failure.
   * Also includes Secure DNS (DoH) resolver hostnames to force browser DNS fallback.
   */
  private buildBlockEntries(sites: readonly string[]): string {
    const lines: string[] = [
      '',
      MARKER_START,
      MARKER_COMMENT,
      '# Secure DNS (DoH) Resolver Hostnames Bypasses',
    ];

    for (const dohDomain of DOH_RESOLVER_DOMAINS) {
      lines.push(`0.0.0.0  ${dohDomain}`);
      lines.push(`::       ${dohDomain}`);
    }

    lines.push('');
    lines.push('# Solitude Focus Mode Blocked Websites (IPv4 & IPv6)');

    for (const site of sites) {
      lines.push(`0.0.0.0  ${site}`);
      lines.push(`::       ${site}`);
    }

    lines.push(MARKER_END);
    lines.push('');

    return lines.join('\r\n');
  }

  // ── DNS Cache Management ──────────────────────────────────────────────────

  /**
   * Flushes the Windows DNS resolver cache using both ipconfig and PowerShell.
   */
  private flushDns(): void {
    try {
      execSync('ipconfig /flushdns', { windowsHide: true, timeout: 5000 });
      this.log('ipconfig /flushdns executed successfully.');
    } catch (err: unknown) {
      this.log(`WARNING: ipconfig /flushdns failed — ${(err as Error).message}`);
    }

    try {
      execSync('powershell -Command "Clear-DnsClientCache"', { windowsHide: true, timeout: 5000 });
      this.log('PowerShell Clear-DnsClientCache executed successfully.');
    } catch (err: unknown) {
      this.log(`WARNING: Clear-DnsClientCache failed — ${(err as Error).message}`);
    }
  }

  // ── Lock File (Crash Recovery Sentinel) ───────────────────────────────────

  private createLockFile(sites: readonly string[]): void {
    try {
      const lockData = {
        startTime: new Date().toISOString(),
        blockedSites: [...sites],
      };
      fs.writeFileSync(this.lockFilePath, JSON.stringify(lockData, null, 2), 'utf-8');
      this.log('Lock file created — active blocking session registered.');
    } catch (err: unknown) {
      this.log(`WARNING: Could not create lock file — ${(err as Error).message}`);
    }
  }

  private deleteLockFile(): void {
    try {
      if (fs.existsSync(this.lockFilePath)) {
        fs.unlinkSync(this.lockFilePath);
        this.log('Lock file deleted — session ended cleanly.');
      }
    } catch (err: unknown) {
      this.log(`WARNING: Could not delete lock file — ${(err as Error).message}`);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  isBlockingActive(): boolean {
    return fs.existsSync(this.lockFilePath);
  }

  getBlockedSites(): string[] {
    return [...DEFAULT_BLOCKED_SITES];
  }

  /**
   * Enables website blocking by modifying the Windows hosts file.
   */
  enableBlocking(sites?: string[]): BlockerResult {
    this.resetLog();
    this.log('=== ENABLE WEBSITE BLOCKING ===');

    const sitesToBlock = sites && sites.length > 0 ? sites : DEFAULT_BLOCKED_SITES;
    this.log(`Preparing to block ${sitesToBlock.length} domains (IPv4 + IPv6 + DoH fallback).`);

    // 1. Verify admin privileges
    const adminCheck = this.verifyAdminPrivileges();
    if (!adminCheck.isAdmin) {
      this.log(`ABORTED: ${adminCheck.error}`);
      return { success: false, error: adminCheck.error, log: [...this.operationLog] };
    }
    this.log('Administrator privileges verified ✓');

    // 2. Clear read-only attributes if present
    this.ensureWritable();

    // 3. Create backup (only if one doesn't exist yet)
    if (!this.backupHostsFile()) {
      this.log('ABORTED: Cannot proceed without a hosts file backup.');
      return {
        success: false,
        error: 'Failed to create hosts file backup. Website blocking aborted for safety.',
        log: [...this.operationLog],
      };
    }

    // 4. Read current hosts file content
    let currentContent: string;
    try {
      currentContent = fs.existsSync(HOSTS_PATH)
        ? fs.readFileSync(HOSTS_PATH, 'utf-8')
        : '';
    } catch (err: unknown) {
      const msg = `Cannot read hosts file: ${(err as Error).message}`;
      this.log(`ERROR: ${msg}`);
      return { success: false, error: msg, log: [...this.operationLog] };
    }

    // 5. Remove any stale entries from a previous session (idempotent)
    const cleanedContent = this.removeBlockEntries(currentContent);
    if (cleanedContent !== currentContent) {
      this.log('Removed stale blocking entries from a previous session.');
    }

    // 6. Append new blocking entries
    const blockEntries = this.buildBlockEntries(sitesToBlock);
    const newContent = cleanedContent + blockEntries;

    try {
      fs.writeFileSync(HOSTS_PATH, newContent, 'utf-8');
      this.log(`${sitesToBlock.length} domain rules written to hosts file (0.0.0.0 & ::) ✓`);
    } catch (err: unknown) {
      const msg = `Failed to write hosts file: ${(err as Error).message}`;
      this.log(`ERROR: ${msg}`);
      this.log('Attempting to restore original hosts file...');
      this.restoreFromBackup();
      return { success: false, error: msg, log: [...this.operationLog] };
    }

    // 7. Flush DNS cache
    this.flushDns();

    // 8. Create lock file for crash recovery
    this.createLockFile(sitesToBlock);

    this.log('=== WEBSITE BLOCKING ENABLED SUCCESSFULLY ===');
    return { success: true, log: [...this.operationLog] };
  }

  /**
   * Disables website blocking by removing entries from the hosts file.
   */
  disableBlocking(): BlockerResult {
    this.resetLog();
    this.log('=== DISABLE WEBSITE BLOCKING ===');

    if (!this.isBlockingActive()) {
      this.log('No active blocking session detected — nothing to disable.');
      return { success: true, log: [...this.operationLog] };
    }

    this.ensureWritable();

    // 1. Remove blocking entries via markers
    let cleaned = this.removeBlockEntriesFromFile();

    // 2. Fallback: restore from backup if marker removal failed
    if (!cleaned) {
      this.log('WARNING: Marker-based removal failed. Falling back to backup restoration...');
      cleaned = this.restoreFromBackup();

      if (!cleaned) {
        this.log('ERROR: Both cleanup methods failed.');
        this.deleteLockFile();
        return {
          success: false,
          error: 'Failed to restore hosts file. You may need to manually edit C:\\Windows\\System32\\drivers\\etc\\hosts.',
          log: [...this.operationLog],
        };
      }
    }

    // 3. Flush DNS cache
    this.flushDns();

    // 4. Clean up sentinel and backup files
    this.deleteLockFile();
    this.deleteBackup();

    this.log('=== WEBSITE BLOCKING DISABLED SUCCESSFULLY ===');
    return { success: true, log: [...this.operationLog] };
  }

  /**
   * Crash recovery — called once at application startup.
   */
  recoverIfNeeded(): void {
    if (!this.isBlockingActive()) {
      return;
    }

    this.resetLog();
    this.log('=== CRASH RECOVERY ===');
    this.log('Detected unclean shutdown — lock file present from a previous session.');

    const adminCheck = this.verifyAdminPrivileges();
    if (!adminCheck.isAdmin) {
      this.log('WARNING: Cannot recover without admin privileges. Lock file preserved for next launch.');
      return;
    }

    this.ensureWritable();
    let recovered = this.removeBlockEntriesFromFile();

    if (!recovered) {
      recovered = this.restoreFromBackup();
    }

    if (recovered) {
      this.flushDns();
      this.deleteLockFile();
      this.deleteBackup();
      this.log('=== CRASH RECOVERY COMPLETED SUCCESSFULLY ===');
    } else {
      this.log('ERROR: Automatic recovery failed.');
      this.deleteLockFile();
    }
  }
}
