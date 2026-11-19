import "server-only";

import { Pool } from "pg";

import { getEventConfig } from "../config/event-env.server";

declare global {
  var event1DatabasePool: Pool | undefined;
}

export function getEventDatabase() {
  if (!globalThis.event1DatabasePool) {
    const pool = new Pool({
      ...getEventConfig().database,
      application_name: "hometogether-event-1",
      max: 3,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
      statement_timeout: 5000,
      idle_in_transaction_session_timeout: 5000,
    });
    pool.on("error", () => console.error("event_database_connection_error"));
    globalThis.event1DatabasePool = pool;
  }
  return globalThis.event1DatabasePool;
}
