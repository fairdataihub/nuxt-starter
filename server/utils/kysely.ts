import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";
import type { DB } from "#shared/generated/kysely";

// Create a single Kysely instance (and connection pool) per server process.
// Creating one per call leaks a new pool on every request.
const kyselySingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Passing the full connection string lets postgres.js handle URL-encoded
  // credentials and query params such as `sslmode`.
  return new Kysely<DB>({
    dialect: new PostgresJSDialect({
      postgres: postgres(connectionString),
    }),
  });
};

declare const globalThis: {
  kyselyGlobal: ReturnType<typeof kyselySingleton>;
} & typeof global;

const db = globalThis.kyselyGlobal ?? kyselySingleton();

if (process.env.NODE_ENV !== "production") {
  // Reuse the instance across HMR reloads in dev
  globalThis.kyselyGlobal = db;
}

export default function () {
  return db;
}
