import { LibSQLStore } from "@mastra/libsql";

/**
 * Shared, file-backed storage for the demo agents.
 *
 * File-backed (not ":memory:") on purpose: with connection pooling an in-memory
 * libsql gives each connection its own empty DB, so migrated tables
 * (e.g. mastra_workflow_snapshot) vanish and suspend/resume can't load the
 * suspended snapshot. A single file keeps one shared, migrated DB — required by
 * the `interrupt` (suspend/resume) and `background-tasks` demos, and used by the
 * agents that keep Memory (shared-state working memory, observational memory).
 */
let store: LibSQLStore | undefined;
const STORAGE_URL = process.env.TURSO_DATABASE_URL || "file:./.mastra-demo.db"

export function getStorage(): LibSQLStore {
  if (!store) {
    store = new LibSQLStore({
      id: "demo-storage",
      url: STORAGE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || "",
    });
  }
  return store;
}
