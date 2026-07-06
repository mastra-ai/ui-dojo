import { LibSQLStore } from "@mastra/libsql";

/**
 * Shared, file-backed storage for the CopilotKit demo agents.
 *
 * File-backed (not ":memory:") on purpose: with connection pooling an in-memory
 * libsql gives each connection its own empty DB, so migrated tables
 * (e.g. mastra_workflow_snapshot) vanish and suspend/resume can't load the
 * suspended snapshot. A single file keeps one shared, migrated DB — required by
 * the `interrupt` (suspend/resume) and `background-tasks` demos, and used by the
 * agents that keep Memory (shared-state working memory, observational memory).
 */
let store: LibSQLStore | undefined;

export function getStorage(): LibSQLStore {
  if (!store) {
    store = new LibSQLStore({
      id: "ck-storage",
      url: process.env.LIBSQL_URL || "file:./.mastra-demo.db",
    });
  }
  return store;
}
