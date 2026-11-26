# Cristy's Home Street Food

A local web app for recording daily sales, tracking product and ingredient stock, and managing business accounts. It runs on PHP and MySQL/MariaDB and is intended to be served through Apache (for example, with XAMPP).

## Requirements

- Windows with [XAMPP](https://www.apachefriends.org/) or another PHP/Apache/MySQL setup
- PHP with PDO MySQL and OpenSSL enabled
- MySQL or MariaDB
- A modern browser
- Google Authenticator or another app that supports time-based one-time passwords (TOTP)

## Run locally with XAMPP

1. Place this project folder in `C:\xampp\htdocs\cristys-street-food`.
2. Start **Apache** and **MySQL** in the XAMPP Control Panel.
3. Open `http://localhost/phpmyadmin`, create/import the database by importing `streetfood_mysql.sql`. The script creates and selects the `cristy_street_food` database and adds starter inventory if missing.
4. Configure the database and encryption key in `.env` (see below).
5. Open `http://localhost/cristys-street-food/` in your browser.

The first visitor sees the initial setup screen. Create the first administrator with a unique username and a password of at least 12 characters that is not commonly used. Follow the QR-code instructions to add the account to Google Authenticator, then enter the current six-digit code to finish setup. In **Accounts & security**, the administrator can create staff accounts and assign roles.

## Environment configuration

Keep `.env` on the server. Do not share it or commit it to source control. Use this format, filling in the values for your own database:

```dotenv
DB_HOST=localhost
DB_NAME=cristy_street_food
DB_USER=root
DB_PASS=
APP_ENCRYPTION_KEY=replace_with_64_hex_characters
```

Generate a random 32-byte encryption key in a terminal with PHP:

```powershell
php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
```

Copy the generated 64-character value into `APP_ENCRYPTION_KEY`. The project `.htaccess` blocks web access to `.env`, and `.gitignore` excludes it from Git. Keep a separate secure copy of the key: encrypted sales and payment references cannot be read from the database or backups without the same key. Do not replace the key after sales have been recorded unless you first plan and perform a data re-encryption.

## Accounts and data protection

- Passwords must be at least 12 characters and are checked against the included common-password list.
- Passwords are saved as Argon2id hashes when available, with bcrypt as a fallback.
- Sign-in uses a password and an authenticator-app code. Sensitive actions request a fresh code.
- Five failed password attempts lock the account temporarily.
- Admin and staff roles are checked by the server. Staff can access their permitted sales and stock views; administration functions require an administrator.
- Sales details and optional payment reference numbers are encrypted with AES-256-GCM before storage. Existing sales are encrypted when the API first runs after this feature is installed.
- Activity records track security and business changes without storing passwords, authenticator codes, or payment references.

## Backups

Administrators can download a JSON backup and its SHA-256 sidecar from **Accounts & security**. To configure a daily Windows Task Scheduler backup, follow [BACKUP_SETUP.md](BACKUP_SETUP.md). Scheduled backups are written outside the web root and keep the latest 30 backup sets.

Backups contain encrypted sales data, so also keep the `.env` encryption key secure and separate from backup files. The checksum can help detect accidental changes to a backup; it does not encrypt the backup or prove who created it.

## Project files

- `index.html`, `app.js`, `style.css` — browser interface
- `api.php` — authentication, MFA, authorization, inventory, sales, audit, and downloadable backup API
- `config.php` — loads local `.env` settings
- `streetfood_mysql.sql` — MySQL/MariaDB schema and starter inventory
- `backup.php` — CLI script for scheduled JSON backups and SHA-256 checksum files
- `BACKUP_SETUP.md` — Windows Task Scheduler setup
- `common_passwords.txt` — passwords rejected by the password policy

## Troubleshooting

- **Cannot connect to database:** check that MySQL is running, the database import completed, and the `DB_*` values in `.env` are correct.
- **Encryption key error:** make sure `APP_ENCRYPTION_KEY` is exactly 64 hexadecimal characters.
- **MFA code rejected:** check the device time is set automatically and use the current code before it changes.
- **Page/API errors:** open the site through `http://localhost/cristys-street-food/` with Apache running; do not open `index.html` as a local file.
