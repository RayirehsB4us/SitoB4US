'use strict';

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const { promisify } = require('util');

const execAsync = promisify(exec);
const gzip = promisify(zlib.gzip);

// Repo root is one level up from the Strapi backend/ folder
const REPO_ROOT = path.join(process.cwd(), '..');
const BACKUPS_DIR = path.join(process.cwd(), 'backups');

function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day(s) ago`;
}

module.exports = {
  register({ strapi }) {},
  bootstrap({ strapi }) {},

  controllers: {
    git: {
      async status(ctx) {
        try {
          const { stdout } = await execAsync('git status --porcelain', { cwd: REPO_ROOT });
          const files = stdout
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(line => ({
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
          ctx.body = { error: 'Commit message is required' };
          return;
        }
        try {
          await execAsync('git add -A', { cwd: REPO_ROOT });
          const { stdout } = await execAsync(
            `git commit -m ${JSON.stringify(message)}`,
            { cwd: REPO_ROOT }
          );
          ctx.body = { success: true, output: stdout.trim() };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.stderr ? err.stderr.trim() : err.message };
        }
      },

      async branches(ctx) {
        try {
          const { stdout } = await execAsync('git branch', { cwd: REPO_ROOT });
          const branches = stdout
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(line => ({
              name: line.replace(/^\*?\s+/, '').trim(),
              current: line.startsWith('*'),
            }));
          ctx.body = { branches };
        } catch (err) {
          ctx.body = { branches: [], error: err.message };
        }
      },

      async push(ctx) {
        try {
          const store = strapi.store({ type: 'plugin', name: 'environment-sync' });
          const token = await store.get({ key: 'github_token' });

          if (!token) {
            ctx.status = 400;
            ctx.body = { error: 'GitHub token not configured. Save your token first.' };
            return;
          }

          const { branch } = ctx.request.body;
          if (!branch) {
            ctx.status = 400;
            ctx.body = { error: 'No branch selected.' };
            return;
          }

          const { stdout: rawUrl } = await execAsync('git remote get-url origin', { cwd: REPO_ROOT });
          const cleanUrl = rawUrl.trim().replace(/^https?:\/\/(?:[^@]+@)?/, '');
          const authenticatedUrl = `https://${token}@${cleanUrl}`;

          const { stdout, stderr } = await execAsync(
            `git push ${authenticatedUrl} ${branch}`,
            { cwd: REPO_ROOT }
          );
          ctx.body = { success: true, output: (stdout + stderr).trim() || `Pushed to ${branch} successfully` };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.stderr ? err.stderr.trim() : err.message };
        }
      },

      async getSettings(ctx) {
        try {
          const store = strapi.store({ type: 'plugin', name: 'environment-sync' });
          const token = await store.get({ key: 'github_token' });
          ctx.body = {
            hasToken: !!token,
            tokenMasked: token
              ? `${token.slice(0, 4)}${'•'.repeat(Math.max(0, token.length - 8))}${token.slice(-4)}`
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
          ctx.body = { error: 'Token is required' };
          return;
        }
        const store = strapi.store({ type: 'plugin', name: 'environment-sync' });
        await store.set({ key: 'github_token', value: token });
        ctx.body = { success: true };
      },
    },

    backup: {
      async list(ctx) {
        try {
          ensureBackupsDir();
          const files = fs.readdirSync(BACKUPS_DIR)
            .filter(f => f.endsWith('.json.gz'))
            .map(filename => {
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

          // 1. Collect all API content type UIDs
          const allUids = Object.keys(strapi.contentTypes).filter(uid =>
            uid.startsWith('api::') ||
            (!excludeMedia && uid === 'plugin::upload.file')
          );

          // 2. Export data from each content type
          const data = {};
          for (const uid of allUids) {
            try {
              const entries = await strapi.entityService.findMany(uid, {
                populate: '*',
                pagination: { limit: -1 },
              });
              data[uid] = entries;
            } catch (e) {
              data[uid] = { error: e.message };
            }
          }

          // 3. Collect schema files from disk
          const schemas = {};
          const apiDir = path.join(process.cwd(), 'src', 'api');
          if (fs.existsSync(apiDir)) {
            for (const apiName of fs.readdirSync(apiDir)) {
              const schemaPath = path.join(apiDir, apiName, 'content-types', apiName, 'schema.json');
              if (fs.existsSync(schemaPath)) {
                try {
                  schemas[apiName] = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                } catch (_) {}
              }
            }
          }

          // 4. Collect component schemas
          const componentsDir = path.join(process.cwd(), 'src', 'components');
          const components = {};
          if (fs.existsSync(componentsDir)) {
            for (const category of fs.readdirSync(componentsDir)) {
              const catDir = path.join(componentsDir, category);
              if (fs.statSync(catDir).isDirectory()) {
                for (const file of fs.readdirSync(catDir).filter(f => f.endsWith('.json'))) {
                  try {
                    components[`${category}.${file.replace('.json', '')}`] =
                      JSON.parse(fs.readFileSync(path.join(catDir, file), 'utf8'));
                  } catch (_) {}
                }
              }
            }
          }

          // 5. Build backup payload
          const payload = {
            meta: {
              version: '1.0',
              createdAt: new Date().toISOString(),
              environment: process.env.NODE_ENV || 'development',
              excludeMedia,
              totalEntries: Object.values(data).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0),
            },
            schemas,
            components,
            data,
          };

          // 6. Compress and write
          const compressed = await gzip(JSON.stringify(payload));
          const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          const filename = `backup_${ts}.json.gz`;
          fs.writeFileSync(path.join(BACKUPS_DIR, filename), compressed);

          ctx.body = {
            success: true,
            filename,
            size: formatBytes(compressed.length),
            totalEntries: payload.meta.totalEntries,
          };
        } catch (err) {
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
      },

      async download(ctx) {
        const { filename } = ctx.params;
        // Prevent path traversal
        if (!filename || filename.includes('/') || filename.includes('..') || !filename.endsWith('.json.gz')) {
          ctx.status = 400;
          ctx.body = { error: 'Invalid filename' };
          return;
        }
        const filePath = path.join(BACKUPS_DIR, filename);
        if (!fs.existsSync(filePath)) {
          ctx.status = 404;
          ctx.body = { error: 'Backup file not found' };
          return;
        }
        ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
        ctx.set('Content-Type', 'application/gzip');
        ctx.body = fs.createReadStream(filePath);
      },

      async remove(ctx) {
        const { filename } = ctx.params;
        if (!filename || filename.includes('/') || filename.includes('..') || !filename.endsWith('.json.gz')) {
          ctx.status = 400;
          ctx.body = { error: 'Invalid filename' };
          return;
        }
        const filePath = path.join(BACKUPS_DIR, filename);
        if (!fs.existsSync(filePath)) {
          ctx.status = 404;
          ctx.body = { error: 'Backup file not found' };
          return;
        }
        fs.unlinkSync(filePath);
        ctx.body = { success: true };
      },
    },
  },

  routes: {
    admin: {
      type: 'admin',
      routes: [
        {
          method: 'GET',
          path: '/git/status',
          handler: 'git.status',
          config: { policies: [], auth: false },
        },
        {
          method: 'GET',
          path: '/git/branches',
          handler: 'git.branches',
          config: { policies: [], auth: false },
        },
        {
          method: 'POST',
          path: '/git/commit',
          handler: 'git.commit',
          config: { policies: [], auth: false },
        },
        {
          method: 'POST',
          path: '/git/push',
          handler: 'git.push',
          config: { policies: [], auth: false },
        },
        {
          method: 'GET',
          path: '/settings',
          handler: 'git.getSettings',
          config: { policies: [], auth: false },
        },
        {
          method: 'POST',
          path: '/settings/token',
          handler: 'git.saveToken',
          config: { policies: [], auth: false },
        },
        {
          method: 'GET',
          path: '/backup/list',
          handler: 'backup.list',
          config: { policies: [], auth: false },
        },
        {
          method: 'POST',
          path: '/backup/create',
          handler: 'backup.create',
          config: { policies: [], auth: false },
        },
        {
          method: 'GET',
          path: '/backup/download/:filename',
          handler: 'backup.download',
          config: { policies: [], auth: false },
        },
        {
          method: 'DELETE',
          path: '/backup/:filename',
          handler: 'backup.remove',
          config: { policies: [], auth: false },
        },
      ],
    },
  },
};
