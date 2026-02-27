"use strict";

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const http = require("http");
const https = require("https");
const { promisify } = require("util");

const execAsync = promisify(exec);
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Repo root is one level up from the Strapi backend/ folder
const REPO_ROOT = path.join(process.cwd(), "..");
const BACKUPS_DIR = path.join(process.cwd(), "backups");
const TRANSFERS_DIR = path.join(BACKUPS_DIR, "transfers");

function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR))
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

function ensureTransfersDir() {
  if (!fs.existsSync(TRANSFERS_DIR))
    fs.mkdirSync(TRANSFERS_DIR, { recursive: true });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day(s) ago`;
}

// HTTP client for cross-server communication — no extra npm deps
function crossFetch(url, method, body, token) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return reject(new Error("Invalid URL: " + url));
    }
    const lib = parsed.protocol === "https:" ? https : http;
    const data = JSON.stringify(body || {});
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: parsed.pathname + (parsed.search || ""),
        method: method || "GET",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          "X-Sync-Token": token || "",
        },
        timeout: 60000,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (_) {
            resolve({ status: res.statusCode, data: { raw } });
          }
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request to master timed out"));
    });
    req.write(data);
    req.end();
  });
}

// Read all api schema JSON files from disk
function collectDiskSchemas() {
  const diskSchemas = {};
  const apiDir = path.join(process.cwd(), "src", "api");
  if (fs.existsSync(apiDir)) {
    for (const apiName of fs.readdirSync(apiDir)) {
      const ctDir = path.join(apiDir, apiName, "content-types");
      if (fs.existsSync(ctDir)) {
        for (const ctName of fs.readdirSync(ctDir)) {
          const schemaPath = path.join(ctDir, ctName, "schema.json");
          if (fs.existsSync(schemaPath)) {
            try {
              diskSchemas[`${apiName}.${ctName}`] = JSON.parse(
                fs.readFileSync(schemaPath, "utf8"),
              );
            } catch (_) {}
          }
        }
      }
    }
  }
  return diskSchemas;
}

// Read all component JSON files from disk
function collectDiskComponents() {
  const diskComponents = {};
  const componentsDir = path.join(process.cwd(), "src", "components");
  if (fs.existsSync(componentsDir)) {
    for (const category of fs.readdirSync(componentsDir)) {
      const catDir = path.join(componentsDir, category);
      if (fs.existsSync(catDir) && fs.statSync(catDir).isDirectory()) {
        for (const file of fs
          .readdirSync(catDir)
          .filter((f) => f.endsWith(".json"))) {
          try {
            diskComponents[`${category}.${file.replace(".json", "")}`] =
              JSON.parse(fs.readFileSync(path.join(catDir, file), "utf8"));
          } catch (_) {}
        }
      }
    }
  }
  return diskComponents;
}

module.exports = {
  register({ strapi }) {},
  bootstrap({ strapi }) {},

  controllers: {
    // ── Git ──────────────────────────────────────────────────────────────────
    git: {
      async status(ctx) {
        try {
          const { stdout } = await execAsync("git status --porcelain", {
            cwd: REPO_ROOT,
          });
          const files = stdout
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => ({
              state: line.substring(0, 2).trim(),
              path: line.substring(3).trim(),
            }));
          ctx.body = { files };
        } catch (err) {
          ctx.body = { files: [], error: err.message };
        }
      },

      async commit(ctx) {
        const { message } = ctx.request.body;
        if (!message) {
          ctx.status = 400;
          ctx.body = { error: "Commit message is required" };
          return;
        }
        try {
          await execAsync("git add -A", { cwd: REPO_ROOT });
          const { stdout } = await execAsync(
            `git commit -m ${JSON.stringify(message)}`,
            { cwd: REPO_ROOT },
          );
          ctx.body = { success: true, output: stdout.trim() };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.stderr ? err.stderr.trim() : err.message };
        }
      },

      async branches(ctx) {
        try {
          const { stdout } = await execAsync("git branch", { cwd: REPO_ROOT });
          const branches = stdout
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => ({
              name: line.replace(/^\*?\s+/, "").trim(),
              current: line.startsWith("*"),
            }));
          ctx.body = { branches };
        } catch (err) {
          ctx.body = { branches: [], error: err.message };
        }
      },

      async push(ctx) {
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const token = await store.get({ key: "github_token" });
          if (!token) {
            ctx.status = 400;
            ctx.body = {
              error: "GitHub token not configured. Save your token first.",
            };
            return;
          }
          const { branch } = ctx.request.body;
          if (!branch) {
            ctx.status = 400;
            ctx.body = { error: "No branch selected." };
            return;
          }
          const { stdout: rawUrl } = await execAsync(
            "git remote get-url origin",
            { cwd: REPO_ROOT },
          );
          const cleanUrl = rawUrl.trim().replace(/^https?:\/\/(?:[^@]+@)?/, "");
          const authenticatedUrl = `https://${token}@${cleanUrl}`;
          const { stdout, stderr } = await execAsync(
            `git push ${authenticatedUrl} ${branch}`,
            { cwd: REPO_ROOT },
          );
          ctx.body = {
            success: true,
            output:
              (stdout + stderr).trim() || `Pushed to ${branch} successfully`,
          };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.stderr ? err.stderr.trim() : err.message };
        }
      },

      async getSettings(ctx) {
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const token = await store.get({ key: "github_token" });
          ctx.body = {
            hasToken: !!token,
            tokenMasked: token
              ? `${token.slice(0, 4)}${"•".repeat(
                  Math.max(0, token.length - 8),
                )}${token.slice(-4)}`
              : null,
          };
        } catch (err) {
          ctx.body = { hasToken: false, tokenMasked: null };
        }
      },

      async saveToken(ctx) {
        const { token } = ctx.request.body;
        if (!token) {
          ctx.status = 400;
          ctx.body = { error: "Token is required" };
          return;
        }
        const store = strapi.store({
          type: "plugin",
          name: "environment-sync",
        });
        await store.set({ key: "github_token", value: token });
        ctx.body = { success: true };
      },
    },

    // ── Backup ───────────────────────────────────────────────────────────────
    backup: {
      async list(ctx) {
        try {
          ensureBackupsDir();
          const files = fs
            .readdirSync(BACKUPS_DIR)
            .filter((f) => f.endsWith(".json.gz"))
            .map((filename) => {
              const stat = fs.statSync(path.join(BACKUPS_DIR, filename));
              return {
                filename,
                size: formatBytes(stat.size),
                sizeBytes: stat.size,
                createdAt: stat.mtime.toISOString(),
                ago: timeAgo(stat.mtime),
              };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          ctx.body = { backups: files };
        } catch (err) {
          ctx.body = { backups: [], error: err.message };
        }
      },

      async create(ctx) {
        try {
          ensureBackupsDir();
          const { excludeMedia = false } = ctx.request.body || {};

          // All content type schemas from Strapi registry
          const allContentTypes = strapi.contentTypes;
          const schemas = {};
          for (const [uid, ct] of Object.entries(allContentTypes)) {
            if (excludeMedia && uid === "plugin::upload.file") continue;
            schemas[uid] = {
              uid: ct.uid,
              kind: ct.kind,
              displayName: ct.info && ct.info.displayName,
              singularName: ct.info && ct.info.singularName,
              pluralName: ct.info && ct.info.pluralName,
              attributes: ct.attributes,
              options: ct.options,
              pluginOptions: ct.pluginOptions,
            };
          }

          // All component schemas from Strapi registry
          const allComponents = strapi.components;
          const components = {};
          for (const [uid, comp] of Object.entries(allComponents)) {
            components[uid] = {
              uid: comp.uid,
              category: comp.category,
              displayName: comp.info && comp.info.displayName,
              attributes: comp.attributes,
              options: comp.options,
            };
          }

          // Data for api:: types + optionally upload.file
          const dataUids = Object.keys(allContentTypes).filter(
            (uid) =>
              uid.startsWith("api::") ||
              (!excludeMedia && uid === "plugin::upload.file"),
          );
          const data = {};
          for (const uid of dataUids) {
            try {
              data[uid] = await strapi.entityService.findMany(uid, {
                populate: "*",
                pagination: { limit: -1 },
              });
            } catch (e) {
              data[uid] = { error: e.message };
            }
          }

          const diskSchemas = collectDiskSchemas();
          const diskComponents = collectDiskComponents();
          const totalEntries = Object.values(data).reduce(
            (n, v) => n + (Array.isArray(v) ? v.length : 0),
            0,
          );

          const payload = {
            meta: {
              version: "2.0",
              createdAt: new Date().toISOString(),
              environment: process.env.NODE_ENV || "development",
              excludeMedia,
              totalContentTypes: Object.keys(schemas).length,
              totalComponents: Object.keys(components).length,
              totalEntries,
            },
            schemas,
            components,
            diskSchemas,
            diskComponents,
            data,
          };

          const compressed = await gzip(JSON.stringify(payload));
          const ts = new Date()
            .toISOString()
            .replace(/[:.]/g, "-")
            .slice(0, 19);
          const filename = `backup_${ts}.json.gz`;
          fs.writeFileSync(path.join(BACKUPS_DIR, filename), compressed);

          ctx.body = {
            success: true,
            filename,
            size: formatBytes(compressed.length),
            totalEntries,
            totalContentTypes: Object.keys(schemas).length,
            totalComponents: Object.keys(components).length,
          };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      async download(ctx) {
        const { filename } = ctx.params;
        if (
          !filename ||
          filename.includes("/") ||
          filename.includes("..") ||
          !filename.endsWith(".json.gz")
        ) {
          ctx.status = 400;
          ctx.body = { error: "Invalid filename" };
          return;
        }
        const filePath = path.join(BACKUPS_DIR, filename);
        if (!fs.existsSync(filePath)) {
          ctx.status = 404;
          ctx.body = { error: "Backup file not found" };
          return;
        }
        ctx.set("Content-Disposition", `attachment; filename="${filename}"`);
        ctx.set("Content-Type", "application/gzip");
        ctx.body = fs.createReadStream(filePath);
      },

      async remove(ctx) {
        const { filename } = ctx.params;
        if (
          !filename ||
          filename.includes("/") ||
          filename.includes("..") ||
          !filename.endsWith(".json.gz")
        ) {
          ctx.status = 400;
          ctx.body = { error: "Invalid filename" };
          return;
        }
        const filePath = path.join(BACKUPS_DIR, filename);
        if (!fs.existsSync(filePath)) {
          ctx.status = 404;
          ctx.body = { error: "Backup file not found" };
          return;
        }
        fs.unlinkSync(filePath);
        ctx.body = { success: true };
      },
    },

    // ── Sync ─────────────────────────────────────────────────────────────────
    sync: {
      async getConfig(ctx) {
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const config = (await store.get({ key: "sync_config" })) || {};
          ctx.body = {
            role: config.role || "master",
            masterUrl: config.masterUrl || "",
            hasToken: !!config.transferToken,
            tokenMasked: config.transferToken
              ? `${config.transferToken.slice(0, 4)}${"•".repeat(
                  Math.max(0, config.transferToken.length - 8),
                )}${config.transferToken.slice(-4)}`
              : null,
          };
        } catch (err) {
          ctx.body = {
            role: "master",
            masterUrl: "",
            hasToken: false,
            tokenMasked: null,
          };
        }
      },

      async saveConfig(ctx) {
        const { role, masterUrl, transferToken } = ctx.request.body;
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const existing = (await store.get({ key: "sync_config" })) || {};
          const updated = {
            role: role || existing.role || "master",
            masterUrl:
              masterUrl !== undefined ? masterUrl : existing.masterUrl || "",
            transferToken: transferToken || existing.transferToken || "",
          };
          await store.set({ key: "sync_config", value: updated });
          ctx.body = { success: true };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      // Slave → proxy: sends sync request to master
      async sendRequest(ctx) {
        const { syncType } = ctx.request.body;
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const config = (await store.get({ key: "sync_config" })) || {};
          if (!config.masterUrl) {
            ctx.status = 400;
            ctx.body = {
              error: "Master URL not configured. Save your Sync Config first.",
            };
            return;
          }
          if (!config.transferToken) {
            ctx.status = 400;
            ctx.body = {
              error:
                "Transfer token not configured. Save your Sync Config first.",
            };
            return;
          }
          const requestId = `req_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;
          const slaveUrl =
            process.env.PUBLIC_URL ||
            `http://localhost:${process.env.PORT || 1337}`;
          const result = await crossFetch(
            `${config.masterUrl.replace(
              /\/$/,
              "",
            )}/environment-sync/sync/receive-request`,
            "POST",
            { requestId, slaveUrl, syncType: syncType || "both" },
            config.transferToken,
          );
          if (result.status !== 200 || !result.data.success) {
            ctx.status = 400;
            ctx.body = {
              error:
                result.data.error || `Master returned HTTP ${result.status}`,
            };
            return;
          }
          ctx.body = { success: true, requestId };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      // Master ← slave: receives incoming sync request
      async receiveRequest(ctx) {
        const token = ctx.request.headers["x-sync-token"];
        const { requestId, slaveUrl, syncType } = ctx.request.body;
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const config = (await store.get({ key: "sync_config" })) || {};
          if (!config.transferToken || token !== config.transferToken) {
            ctx.status = 401;
            ctx.body = { error: "Invalid transfer token" };
            return;
          }
          const requests = (await store.get({ key: "sync_requests" })) || [];
          requests.unshift({
            id: requestId || `req_${Date.now()}`,
            slaveUrl: slaveUrl || "unknown",
            syncType: syncType || "both",
            requestedAt: new Date().toISOString(),
            status: "pending",
          });
          await store.set({
            key: "sync_requests",
            value: requests.slice(0, 50),
          });
          ctx.body = { success: true };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      // Master: list all sync requests (admin UI)
      async listRequests(ctx) {
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const requests = (await store.get({ key: "sync_requests" })) || [];
          ctx.body = { requests };
        } catch (err) {
          ctx.body = { requests: [], error: err.message };
        }
      },

      // Slave → proxy: poll request status from master
      async requestStatus(ctx) {
        const { requestId } = ctx.params;
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const config = (await store.get({ key: "sync_config" })) || {};
          if (!config.masterUrl) {
            ctx.status = 400;
            ctx.body = { error: "Master URL not configured" };
            return;
          }
          const result = await crossFetch(
            `${config.masterUrl.replace(
              /\/$/,
              "",
            )}/environment-sync/sync/status/${requestId}`,
            "GET",
            {},
            config.transferToken,
          );
          ctx.body = result.data;
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      // Master ← slave: return status of a single request
      async status(ctx) {
        const { requestId } = ctx.params;
        const token = ctx.request.headers["x-sync-token"];
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const config = (await store.get({ key: "sync_config" })) || {};
          if (!config.transferToken || token !== config.transferToken) {
            ctx.status = 401;
            ctx.body = { error: "Invalid transfer token" };
            return;
          }
          const requests = (await store.get({ key: "sync_requests" })) || [];
          const request = requests.find((r) => r.id === requestId);
          if (!request) {
            ctx.status = 404;
            ctx.body = { error: "Request not found" };
            return;
          }
          ctx.body = { status: request.status, request };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      // Master: approve → build gzipped transfer file
      async approve(ctx) {
        const { id } = ctx.params;
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const requests = (await store.get({ key: "sync_requests" })) || [];
          const request = requests.find((r) => r.id === id);
          if (!request) {
            ctx.status = 404;
            ctx.body = { error: "Request not found" };
            return;
          }
          if (request.status !== "pending") {
            ctx.status = 400;
            ctx.body = { error: `Request is already ${request.status}` };
            return;
          }

          const { syncType } = request;
          const payload = { syncType, approvedAt: new Date().toISOString() };

          if (syncType === "schemas" || syncType === "both") {
            payload.diskSchemas = collectDiskSchemas();
            payload.diskComponents = collectDiskComponents();
          }

          if (syncType === "data" || syncType === "both") {
            const data = {};
            const dataUids = Object.keys(strapi.contentTypes).filter((uid) =>
              uid.startsWith("api::"),
            );
            for (const uid of dataUids) {
              try {
                data[uid] = await strapi.entityService.findMany(uid, {
                  populate: "*",
                  pagination: { limit: -1 },
                });
              } catch (e) {
                data[uid] = { error: e.message };
              }
            }
            payload.data = data;
          }

          ensureTransfersDir();
          const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
          fs.writeFileSync(
            path.join(TRANSFERS_DIR, `transfer_${safeId}.json.gz`),
            await gzip(JSON.stringify(payload)),
          );

          await store.set({
            key: "sync_requests",
            value: requests.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: "approved",
                    approvedAt: new Date().toISOString(),
                  }
                : r,
            ),
          });

          ctx.body = { success: true };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      // Master: reject request
      async reject(ctx) {
        const { id } = ctx.params;
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const requests = (await store.get({ key: "sync_requests" })) || [];
          if (!requests.find((r) => r.id === id)) {
            ctx.status = 404;
            ctx.body = { error: "Request not found" };
            return;
          }
          await store.set({
            key: "sync_requests",
            value: requests.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: "rejected",
                    rejectedAt: new Date().toISOString(),
                  }
                : r,
            ),
          });
          ctx.body = { success: true };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      // Master ← slave: serve transfer file (token-authenticated)
      async transfer(ctx) {
        const { id } = ctx.params;
        const token = ctx.request.headers["x-sync-token"];
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const config = (await store.get({ key: "sync_config" })) || {};
          if (!config.transferToken || token !== config.transferToken) {
            ctx.status = 401;
            ctx.body = { error: "Invalid transfer token" };
            return;
          }
          const requests = (await store.get({ key: "sync_requests" })) || [];
          const request = requests.find((r) => r.id === id);
          if (!request || request.status !== "approved") {
            ctx.status = 403;
            ctx.body = { error: "Transfer not approved" };
            return;
          }
          const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
          const transferFile = path.join(
            TRANSFERS_DIR,
            `transfer_${safeId}.json.gz`,
          );
          if (!fs.existsSync(transferFile)) {
            ctx.status = 404;
            ctx.body = { error: "Transfer file not found on master" };
            return;
          }
          const payload = JSON.parse(
            (await gunzip(fs.readFileSync(transferFile))).toString(),
          );
          ctx.body = { success: true, payload };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      // Slave: fetch approved data from master + apply locally
      async apply(ctx) {
        const { requestId } = ctx.request.body;
        if (!requestId) {
          ctx.status = 400;
          ctx.body = { error: "requestId is required" };
          return;
        }
        try {
          const store = strapi.store({
            type: "plugin",
            name: "environment-sync",
          });
          const config = (await store.get({ key: "sync_config" })) || {};
          if (!config.masterUrl) {
            ctx.status = 400;
            ctx.body = { error: "Master URL not configured" };
            return;
          }
          if (!config.transferToken) {
            ctx.status = 400;
            ctx.body = { error: "Transfer token not configured" };
            return;
          }

          // Fetch from master
          const result = await crossFetch(
            `${config.masterUrl.replace(
              /\/$/,
              "",
            )}/environment-sync/sync/transfer/${requestId}`,
            "GET",
            {},
            config.transferToken,
          );
          if (result.status !== 200 || !result.data.success) {
            ctx.status = 400;
            ctx.body = {
              error:
                result.data.error || `Master returned HTTP ${result.status}`,
            };
            return;
          }

          const payload = result.data.payload;
          const results = {};

          // Write schema JSON files to disk
          if (payload.diskSchemas) {
            let schemaCount = 0;
            for (const [key, schema] of Object.entries(payload.diskSchemas)) {
              const dot = key.indexOf(".");
              const apiName = key.slice(0, dot);
              const ctName = key.slice(dot + 1);
              const schemaPath = path.join(
                process.cwd(),
                "src",
                "api",
                apiName,
                "content-types",
                ctName,
                "schema.json",
              );
              try {
                fs.mkdirSync(path.dirname(schemaPath), { recursive: true });
                fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
                schemaCount++;
              } catch (_) {}
            }
            let compCount = 0;
            if (payload.diskComponents) {
              for (const [key, schema] of Object.entries(
                payload.diskComponents,
              )) {
                const dot = key.indexOf(".");
                const category = key.slice(0, dot);
                const name = key.slice(dot + 1);
                const compPath = path.join(
                  process.cwd(),
                  "src",
                  "components",
                  category,
                  `${name}.json`,
                );
                try {
                  fs.mkdirSync(path.dirname(compPath), { recursive: true });
                  fs.writeFileSync(compPath, JSON.stringify(schema, null, 2));
                  compCount++;
                } catch (_) {}
              }
            }
            results.schemas = {
              schemaFiles: schemaCount,
              componentFiles: compCount,
              requiresRestart: schemaCount > 0,
            };
          }

          // Clear + reimport data per content type
          if (payload.data) {
            let imported = 0,
              errors = 0;
            for (const [uid, entries] of Object.entries(payload.data)) {
              if (!Array.isArray(entries)) continue;
              try {
                const existing = await strapi.entityService.findMany(uid, {
                  fields: ["id"],
                  pagination: { limit: -1 },
                });
                for (const e of existing)
                  await strapi.entityService.delete(uid, e.id);
                for (const entry of entries) {
                  const {
                    id: _id,
                    createdAt: _ca,
                    updatedAt: _ua,
                    ...data
                  } = entry;
                  await strapi.entityService.create(uid, { data });
                  imported++;
                }
              } catch (e) {
                errors++;
              }
            }
            results.data = { imported, errors };
          }

          ctx.body = { success: true, results };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },
    },
  },

  routes: {
    admin: {
      type: "admin",
      routes: [
        // Git
        {
          method: "GET",
          path: "/git/status",
          handler: "git.status",
          config: { policies: [], auth: false },
        },
        {
          method: "GET",
          path: "/git/branches",
          handler: "git.branches",
          config: { policies: [], auth: false },
        },
        {
          method: "POST",
          path: "/git/commit",
          handler: "git.commit",
          config: { policies: [], auth: false },
        },
        {
          method: "POST",
          path: "/git/push",
          handler: "git.push",
          config: { policies: [], auth: false },
        },
        {
          method: "GET",
          path: "/settings",
          handler: "git.getSettings",
          config: { policies: [], auth: false },
        },
        {
          method: "POST",
          path: "/settings/token",
          handler: "git.saveToken",
          config: { policies: [], auth: false },
        },
        // Backup
        {
          method: "GET",
          path: "/backup/list",
          handler: "backup.list",
          config: { policies: [], auth: false },
        },
        {
          method: "POST",
          path: "/backup/create",
          handler: "backup.create",
          config: { policies: [], auth: false },
        },
        {
          method: "GET",
          path: "/backup/download/:filename",
          handler: "backup.download",
          config: { policies: [], auth: false },
        },
        {
          method: "DELETE",
          path: "/backup/:filename",
          handler: "backup.remove",
          config: { policies: [], auth: false },
        },
        // Sync — config (admin UI)
        {
          method: "GET",
          path: "/sync/config",
          handler: "sync.getConfig",
          config: { policies: [], auth: false },
        },
        {
          method: "POST",
          path: "/sync/config",
          handler: "sync.saveConfig",
          config: { policies: [], auth: false },
        },
        // Sync — slave outbound proxy
        {
          method: "POST",
          path: "/sync/send-request",
          handler: "sync.sendRequest",
          config: { policies: [], auth: false },
        },
        {
          method: "GET",
          path: "/sync/request-status/:requestId",
          handler: "sync.requestStatus",
          config: { policies: [], auth: false },
        },
        {
          method: "POST",
          path: "/sync/apply",
          handler: "sync.apply",
          config: { policies: [], auth: false },
        },
        // Sync — master inbound (called by slave's crossFetch)
        {
          method: "POST",
          path: "/sync/receive-request",
          handler: "sync.receiveRequest",
          config: { policies: [], auth: false },
        },
        {
          method: "GET",
          path: "/sync/status/:requestId",
          handler: "sync.status",
          config: { policies: [], auth: false },
        },
        {
          method: "GET",
          path: "/sync/transfer/:id",
          handler: "sync.transfer",
          config: { policies: [], auth: false },
        },
        // Sync — master admin UI
        {
          method: "GET",
          path: "/sync/requests",
          handler: "sync.listRequests",
          config: { policies: [], auth: false },
        },
        {
          method: "POST",
          path: "/sync/requests/:id/approve",
          handler: "sync.approve",
          config: { policies: [], auth: false },
        },
        {
          method: "POST",
          path: "/sync/requests/:id/reject",
          handler: "sync.reject",
          config: { policies: [], auth: false },
        },
      ],
    },
  },
};
