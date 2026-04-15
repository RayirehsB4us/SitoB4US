import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
const {
  formatBytes,
  timeAgo,
  normalizeMasterUrl,
  isValidBackupFilename,
} = require("../src/plugins/environment-sync/server/utils");

// ── formatBytes ────────────────────────────────────────────────────

describe("formatBytes", () => {
  it("formatta bytes (< 1KB)", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("formatta kilobytes (1KB - 1MB)", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(10240)).toBe("10.0 KB");
    expect(formatBytes(1024 * 1024 - 1)).toBe("1024.0 KB");
  });

  it("formatta megabytes (>= 1MB)", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
    expect(formatBytes(1024 * 1024 * 5.5)).toBe("5.50 MB");
    expect(formatBytes(1024 * 1024 * 100)).toBe("100.00 MB");
  });
});

// ── timeAgo ────────────────────────────────────────────────────────

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ritorna 'just now' per meno di 60 secondi fa", () => {
    const now = new Date("2026-04-01T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2026-04-01T11:59:30Z"); // 30 sec fa
    expect(timeAgo(date)).toBe("just now");
  });

  it("ritorna minuti per meno di 1 ora fa", () => {
    const now = new Date("2026-04-01T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2026-04-01T11:45:00Z"); // 15 min fa
    expect(timeAgo(date)).toBe("15 min ago");
  });

  it("ritorna ore per meno di 1 giorno fa", () => {
    const now = new Date("2026-04-01T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2026-04-01T09:00:00Z"); // 3 ore fa
    expect(timeAgo(date)).toBe("3 hr ago");
  });

  it("ritorna giorni per piu di 24 ore fa", () => {
    const now = new Date("2026-04-01T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2026-03-29T12:00:00Z"); // 3 giorni fa
    expect(timeAgo(date)).toBe("3 day(s) ago");
  });
});

// ── normalizeMasterUrl ─────────────────────────────────────────────

describe("normalizeMasterUrl", () => {
  it("estrae protocol://host da URL completo", () => {
    expect(normalizeMasterUrl("https://strapi.b4us.it/admin")).toBe(
      "https://strapi.b4us.it"
    );
  });

  it("mantiene la porta se presente", () => {
    expect(normalizeMasterUrl("http://localhost:1337/admin/settings")).toBe(
      "http://localhost:1337"
    );
  });

  it("gestisce URL senza path", () => {
    expect(normalizeMasterUrl("https://strapi.b4us.it")).toBe(
      "https://strapi.b4us.it"
    );
  });

  it("fa trim degli spazi", () => {
    expect(normalizeMasterUrl("  https://strapi.b4us.it/admin  ")).toBe(
      "https://strapi.b4us.it"
    );
  });

  it("gestisce URL non valido come fallback (rimuove trailing slash)", () => {
    expect(normalizeMasterUrl("not-a-url///")).toBe("not-a-url");
  });

  it("gestisce URL con credenziali", () => {
    expect(normalizeMasterUrl("https://user:pass@strapi.b4us.it:1337/admin")).toBe(
      "https://strapi.b4us.it:1337"
    );
  });
});

// ── isValidBackupFilename ──────────────────────────────────────────

describe("isValidBackupFilename", () => {
  it("accetta filename .json.gz validi", () => {
    expect(isValidBackupFilename("backup_2026-04-01T12-00-00.json.gz")).toBe(true);
    expect(isValidBackupFilename("test.json.gz")).toBe(true);
  });

  it("rifiuta filename vuoti/null", () => {
    expect(isValidBackupFilename("")).toBe(false);
    expect(isValidBackupFilename(null)).toBe(false);
    expect(isValidBackupFilename(undefined)).toBe(false);
  });

  it("rifiuta path traversal (..)", () => {
    expect(isValidBackupFilename("../../../etc/passwd")).toBe(false);
    expect(isValidBackupFilename("backup_.._.json.gz")).toBe(false);
  });

  it("rifiuta path con slash", () => {
    expect(isValidBackupFilename("subfolder/backup.json.gz")).toBe(false);
  });

  it("rifiuta estensioni non .json.gz", () => {
    expect(isValidBackupFilename("backup.zip")).toBe(false);
    expect(isValidBackupFilename("backup.json")).toBe(false);
    expect(isValidBackupFilename("backup.tar.gz")).toBe(false);
  });
});
