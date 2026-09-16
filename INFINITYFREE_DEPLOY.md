# APPS — InfinityFree deployment

This project is prepared for a small school/demo deployment on InfinityFree.
Build locally, import the database through phpMyAdmin, then upload the
application through FTP. InfinityFree free hosting does not provide SSH,
Composer, Node.js, or Artisan.

## 1. Build the upload copy locally

From the project root:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

Do **not** upload `node_modules/`, `.env`, `public/hot`, test files, or local
logs. The `public/build/` directory **must** be uploaded.

The upload should include `vendor/`, which is required at runtime. It must be
built on a compatible machine before FTP upload because InfinityFree cannot
run Composer.

## 2. Prepare the production environment

Copy `.env.infinityfree.example` to `.env` and replace every placeholder:

- `APP_KEY`: pre-filled with a freshly generated key — keep it unless you want
  to rotate it locally with `php artisan key:generate --show`.
- `APP_URL`: use the final HTTPS InfinityFree domain.
- `DB_*`: copy the database hostname, database name, username, and password
  from the InfinityFree control panel. The database host is **not** `localhost`.

Never upload the local development `.env` file.

## 3. Create the clean school database

The final seed contains:

- 2 login accounts (doctor and pharmacist)
- 72 medicines transcribed from Kamille's San Manuel clinic list
- 223 demo patients (Pedro Penduko, Juana Dela Cruz, 21 named San Manuel
  residents, and 200 deterministic bulk patients)
- 0 fabricated prescriptions
- 0 fabricated inventory batches
- 0 fabricated activity logs

The medicine photo contains no stock quantities, batch numbers, prices, or
expiry dates. The pharmacist must add real stock through the Inventory/Stock In
screen before dispensing can be tested. The demo patients exist so the
Patients page and the prescription flow have data to work with during the
school review; replace or remove them once real patients are entered.

The prepared import file is `database/infinityfree_seed.sql` (61 KB). Import
that file directly in InfinityFree phpMyAdmin. It has been verified against
MariaDB and contains the schema, the two accounts, the 72 catalog rows, and
the 223 demo patients only. Do not run `migrate:fresh` against the hosted
database after real data has been entered.

If the target database already contains tables, either import into a fresh
database or remove the existing application tables first; the dump contains
`DROP TABLE IF EXISTS` statements for the APPS tables.

The seeded demo logins are:

| Role | Email | Temporary password |
|---|---|---|
| Doctor | `doctor@apps.test` | `password` |
| Pharmacist | `pharmacist@apps.test` | `password` |

Change both passwords immediately after the first login. The current school
demo intentionally does not require email verification because InfinityFree's
free hosting does not provide a dependable application mail workflow.

The registration page currently allows a visitor to choose either Doctor or
Pharmacist. This is acceptable for a controlled school review link, but it is
not suitable for a public production system. Before making the site public,
restrict pharmacist account creation to an authorized administrator.

## 4. Upload to InfinityFree

Upload the project root contents into the domain's `htdocs/` directory. Keep
Laravel's `public/` directory intact; the root `.htaccess` routes web requests
to it. Do not move `public/index.php` into the project root.

Required runtime directories:

- `storage/`
- `storage/framework/cache/`
- `storage/framework/sessions/`
- `storage/framework/views/`
- `storage/logs/`
- `bootstrap/cache/`

The PHP process must be able to write to `storage/` and `bootstrap/cache/`.
Use the host's normal writable permissions; do not set `777`.

## 5. First-request checklist

1. Open the HTTPS domain and confirm the login page loads.
2. Log in as doctor and confirm Dashboard, Patients, Prescriptions, and Reports.
3. Log in as pharmacist and add one real inventory batch with quantity,
   unit price, expiry, and reorder level.
4. Create a patient and prescription as doctor.
5. Validate and dispense it as pharmacist.
6. Confirm the stock quantity decreases and the activity log records actions.
7. Confirm Reports loads without a database driver error.

## InfinityFree limitations

This is suitable for school review/demo use, not high-traffic production. The
free plan has no SSH, Composer, Node.js, queue worker, reliable scheduler, or
symlink support. The application therefore uses file sessions/cache and a
`sync` queue in the production template. Password reset emails remain disabled
unless an external SMTP provider is configured.
