# APPS V2 — Localhost Handover Guide
Rural Health Unit Clinic, San Manuel, Isabela

This build is meant to run on the clinic's own computer (localhost). No online hosting needed.

## 1. Daily use (clinic staff)

**Double-click `start.bat`. That's it.**

It checks everything itself (first run installs + prepares the database, which takes a few minutes), then opens http://127.0.0.1:8000 in the browser. Keep the black window open while using the system; press CTRL+C in it to stop.

- If it says it can't reach the database: open **XAMPP Control Panel**, press **Start** on Apache and MySQL, then double-click `start.bat` again.
- If anything else fails: take a photo of the window and send it to Mat.

Default logins are in §2 — change the passwords on day one.

## 1b. Manual setup (only if start.bat can't be used)

Requirements: PHP 8.2+, Composer, Node 18+, and MySQL/MariaDB (XAMPP works).

```bash
cd APPS
composer install
npm install
copy .env.example .env        # Windows (Git Bash / cmd)
php artisan key:generate
```

Edit `.env` for the clinic database:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=apps
DB_USERNAME=root
DB_PASSWORD=
```

Then:

```bash
php artisan migrate --seed
npm run build
php artisan serve
```

Open http://127.0.0.1:8000 — the welcome page shows **Rural Health Unit Clinic · V2**.

To run from source during development instead: `npm run dev` in a second terminal.

## 2. Login accounts (seeded)

Public registration is closed in V2, so these are the way in. **Change the passwords on day one** (Profile page after login).

| Role       | Email              | Password |
| ---------- | ------------------ | -------- |
| Doctor     | doctor@apps.test   | password |
| Pharmacist | pharmacist@apps.test | password |
| Staff      | staff@apps.test    | password |

Adding a real staff member (run in the project folder):

```bash
php artisan tinker
```

```php
App\Models\User::create([
  'name' => 'Maria Santos',
  'email' => 'maria.santos@gmail.com',
  'password' => 'temporary-password-123',
  'role' => 'staff', // doctor | pharmacist | staff
]);
```

The new user gets a verification email (see §3). Tell them to change the password after first login.

## 3. Gmail confirmations (email verification)

Every login needs a verified email. Unverified users land on a "verify your email" page with a resend button.

**Option A — real Gmail (recommended for the clinic PC with internet):**

1. On the clinic Gmail account, turn on 2-Step Verification, then create an **App Password** (Google Account → Security → 2-Step Verification → App passwords → Mail → Windows Computer). Copy the 16-letter code.
2. In `.env`:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your.clinic.gmail@gmail.com
MAIL_PASSWORD="xxxx xxxx xxxx xxxx"
MAIL_FROM_ADDRESS="your.clinic.gmail@gmail.com"
```

3. Restart `php artisan serve`.

**Option B — no internet / testing:** leave `MAIL_MAILER=log`. Verification links are written to `storage/logs/laravel.log` instead of being emailed — open the log, copy the `verify-email/...` URL into the browser. Nothing crashes offline.

## 4. Archive auto-delete (runs daily)

Medicines moved to the archive are permanently deleted after 6 months (medicines tied to prescription history are kept, never destroyed). The check runs daily, but **only when the scheduler ticks**. On the clinic PC, add a Windows Task Scheduler job:

- Trigger: Daily, e.g. 6:00 AM.
- Action: `php.exe C:\path\to\APPS\artisan schedule:run`
- Working directory: `C:\path\to\APPS`

Or run the purge by hand anytime: `php artisan medicines:purge-archive`.

## 5. Version badge

The welcome-page footer shows the release label (`V2`). Bump it per handover in `.env`:

```
APP_VERSION=V3
```

## 6. Backups (do this weekly)

```bash
# Database dump (XAMPP shell):
mysqldump -u root apps > backup-apps-YYYY-MM-DD.sql
```

Keep the last few dumps on a USB stick. To restore: create the `apps` database, import the newest dump, done.

## 7. What's new in V2 (for Kamille)

- Welcome page: Rural Health Unit Clinic branding, version badge, no more "Register an account".
- Login: Gmail email confirmation before anyone can use the system.
- Staff: patient form split into Personal Information (first) then Medical Information; dates reject impossible days.
- Doctor: patient list shows the newest patient first; each prescription item picks per piece / per banig / per box; prescriptions print automatically after saving.
- Pharmacist: no more validate step — dispense straight away, and it prints automatically; dead medicines go to the archive (auto-deleted after 6 months); dashboard Low Stock / Expiring Soon cards open exactly those lists.
