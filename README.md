# APPS — Rural Health Unit Clinic, San Manuel, Isabela

Automated Prescription Processing System (V2). Runs on the clinic's own computer — no internet hosting needed.

## For clinic staff: start here

1. Install **XAMPP** (with PHP + MySQL) on the clinic computer.
2. Double-click **`start.bat`**. That's it — it sets everything up on first run and opens the system in your browser.
3. Log in with the account given to you. Change your password on day one (Profile page).

Full guide (accounts, Gmail confirmations, backups): see **`LOCALHOST.md`**.

## For developers

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
# point DB_* in .env at your MySQL, then:
php artisan migrate --seed
npm run build
php artisan serve
```

- Tests: `php artisan test` (60 tests)
- Stack: Laravel 12 + React/Inertia + MySQL, Tailwind 4
- Product spec: `PRODUCT.md` · Handover guide: `LOCALHOST.md`
