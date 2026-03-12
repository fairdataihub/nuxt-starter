import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";
import type { DB } from "#shared/generated/kysely";

export default function () {
  const urlString = process.env.DATABASE_URL || "";
  const url = new URL(urlString);

  const config = {
    database: url.pathname.slice(1), // Remove leading slash
    host: url.hostname,
    password: url.password,
    port: url.port,
    user: url.username,
  };

  // const dialect = new PostgresDialect({
  //   pool: new Pool({
  //     database: process.env.DATABASE_NAME,
  //     host: process.env.DATABASE_HOST,
  //     max: 10,
  //     password: process.env.DATABASE_PASSWORD,
  //     port: parseInt(process.env.DATABASE_PORT || "5432"),
  //     user: process.env.DATABASE_USER,
  //   }),
  // });

  const dialect = new PostgresJSDialect({
    postgres: postgres({
      database: config.database,
      host: config.host,
      password: config.password,
      port: parseInt(config.port || "5432"),
      user: config.user,
    }),
  });

  return new Kysely<DB>({ dialect });
}
