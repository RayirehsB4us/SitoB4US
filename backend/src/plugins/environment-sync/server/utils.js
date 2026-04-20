"use strict";

/**
 * Pure utility functions extracted from environment-sync plugin for testability.
 */

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

/**
 * Strip any path from the master URL — keeps only protocol://host:port
 * Handles cases where the user pastes the full admin panel URL
 */
function normalizeMasterUrl(raw) {
  try {
    const u = new URL(raw.trim());
    return `${u.protocol}//${u.host}`;
  } catch (_) {
    return raw.trim().replace(/\/+$/, "");
  }
}

/**
 * Valida un filename di backup (niente path traversal, solo .json.gz)
 */
function isValidBackupFilename(filename) {
  if (!filename) return false;
  if (filename.includes("/") || filename.includes("..")) return false;
  if (!filename.endsWith(".json.gz")) return false;
  return true;
}

module.exports = {
  formatBytes,
  timeAgo,
  normalizeMasterUrl,
  isValidBackupFilename,
};
