'use strict';

const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Repo root is one level up from the Strapi backend/ folder
const REPO_ROOT = path.join(process.cwd(), '..');

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
      ],
    },
  },
};
