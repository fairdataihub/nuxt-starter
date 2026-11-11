# Nuxt Starter

## Getting started

### Prerequisites/Dependencies

You will need the following installed on your system:

- mise
- Node.js (via mise)
- pnpm (via mise)
- Docker

### Setup

1. Clone the repository

   ```bash
   git clone https://github.com/fairdataihub/nuxt-starter.git
   ```

2. Install the dependencies

   ```bash
   mise trust # only needed if you are using mise on this project for the first time
   mise install
   pnpm install
   ```

3. Add your environment variables. An example is provided at `.env.example`

   ```bash
   cp .env.example .env
   ```

4. Start the development server

   ```bash
   pnpm dev
   ```

5. Open the application in your browser

   ```bash
   open http://localhost:3000
   ```

## Development

### Database

The application uses a PostgreSQL database for storing data. You can use Docker to run these services locally.

```bash
docker-compose -f ./dev-docker-compose.yaml up
docker-compose -f ./dev-docker-compose.yaml up -d # if you want the db to run in the background
```

Close the database with:

```bash
docker-compose -f ./dev-docker-compose.yaml down
```

### Prisma

The application uses Prisma to interact with the database. The schema lives in [prisma/schema.prisma](prisma/schema.prisma) and migrations in [prisma/migrations](prisma/migrations). `pnpm install` runs `prisma generate` automatically; re-run `pnpm prisma:generate` after pulling schema changes.

#### Migrations

Migrations are the source of truth for the database structure. Always commit the generated migration folder together with the schema change.

**First-time setup** (fresh local database):

```bash
docker-compose -f ./dev-docker-compose.yaml up -d
pnpm exec prisma migrate dev
```

**Changing the schema:**

1. Edit `prisma/schema.prisma`
2. Create and apply a migration (also regenerates the Prisma client and Kysely types):

   ```bash
   pnpm exec prisma migrate dev --name describe_your_change
   ```

3. Review the generated SQL in `prisma/migrations/<timestamp>_describe_your_change/migration.sql`, then commit it with the schema change.

Don't edit or delete a migration that has already been deployed. Fix mistakes with a new migration instead.

**Resetting your local database** (drops all data, re-applies every migration):

```bash
pnpm exec prisma migrate reset
```

**Existing database created with `prisma db push`:** `migrate deploy` will fail because the tables already exist. For a local database, run `prisma migrate reset`. For a database whose data you need to keep, first make sure it matches the schema, then mark the initial migration as applied without running it:

```bash
pnpm exec prisma migrate resolve --applied 0_init
```

`pnpm prisma:db:push` is fine for quick local experiments, but always create a proper migration before opening a PR.

#### Kysely support

This template supports both Prisma and Kysely by design.

- Use Prisma for schema management, migrations, and generated types/client.
- Use Kysely when you need more explicit SQL composition, advanced joins, or query-builder ergonomics.

Why both:

- Complex reporting or performance-sensitive queries can be written in Kysely without abandoning type safety.
- You keep one source of truth for schema/migrations while still having low-level control where it matters.

Example API routes are included for both approaches under [server/api/thing](server/api/thing) (Prisma) and [server/api/kysely-thing](server/api/kysely-thing) (Kysely).

### UI

The application uses [Nuxt UI](https://ui.nuxt.com) to build the UI components. It also uses [Tailwind CSS](https://tailwindcss.com) for styling.

## Deployment

Apps built from this template are deployed with [Kamal](https://kamal-deploy.org) from GitHub Actions, using the [Dockerfile](Dockerfile).

### Database migrations on deploy

Migrations run automatically. When a container starts, [scripts/start.sh](scripts/start.sh):

1. Waits for Postgres (from `DATABASE_URL`) to accept connections
2. Runs `prisma migrate deploy`, which applies any migrations in `prisma/migrations` that haven't run yet
3. Starts the Nuxt server

If a migration fails, the container exits before the server starts. The new container never passes Kamal's health check, so Kamal keeps the old version running. Check the logs with `kamal app logs`.

Things to keep in mind:

- **Make migrations backwards compatible.** During a deploy, the old container keeps serving traffic after the new one has migrated the database. Avoid dropping or renaming columns the running version still uses. Split those changes across two deploys: first stop using the column, then drop it.
- **Multiple hosts are safe.** `prisma migrate deploy` takes a Postgres advisory lock, so containers starting at the same time won't apply a migration twice.
- **Long migrations count against the deploy timeout.** Kamal waits for the health check while migrations run. For slow migrations (large backfills, index builds on big tables), raise `deploy_timeout` in `config/deploy.yml` or run the migration separately before deploying.
- **Running a migration manually:** `kamal app exec --reuse "./node_modules/.bin/prisma migrate deploy"`

### Environment variables

Runtime configuration is read from `NUXT_*` environment variables when the container starts, not at build time. Set these as Kamal env/secrets in `config/deploy.yml` (sourced from GitHub Actions secrets):

| Variable                                | Notes                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                          | Used by Prisma, Kysely and the startup migration                                              |
| `NUXT_APP_SECRET`                       | Seals session cookies. Generate with `openssl rand -base64 32`. Changing it logs everyone out |
| `NUXT_PUBLIC_ENABLE_EMAIL_VERIFICATION` | `true` to require email verification on signup                                                |
| `NUXT_EMAIL_VERIFICATION_DOMAIN`        | Absolute app URL used in verification links, e.g. `https://app.example.com`                   |
| `NUXT_MAIL_HOST`, `NUXT_MAIL_PORT`      | SMTP server                                                                                   |
| `NUXT_MAIL_USER`, `NUXT_MAIL_PASS`      | SMTP credentials                                                                              |
| `NUXT_MAIL_FROM`                        | Sender address                                                                                |

Unprefixed names like `MAIL_PASS` are **not** read at runtime. Values set only at build time are ignored, and no secrets are needed to build the image.

The previous Dockerfile is kept as [Dockerfile.old](Dockerfile.old) for reference. It does not include the Prisma CLI, so its startup migration step fails.
