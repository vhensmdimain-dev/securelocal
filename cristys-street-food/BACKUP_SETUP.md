# Daily database backups on XAMPP

The administrator backup button downloads a current JSON copy and a `.sha256` checksum file. To create a daily copy automatically on this Windows machine:

1. Open **Task Scheduler** and choose **Create Basic Task**.
2. Name it `Cristy's Street Food daily backup` and set the trigger to **Daily**.
3. Choose **Start a program**.
4. Program: `C:\xampp\php\php.exe`
5. Arguments: `C:\xampp\htdocs\cristys-street-food\backup.php`
6. Finish, then run the task once and confirm a JSON file and matching `.json.sha256` file appear in `C:\xampp\cristys-street-food-backups`.

The script retains the latest 30 backup sets and writes them outside the web root. Verify a backup with `Get-FileHash .\cristys-backup-YYYY-MM-DD-HHMMSS.json -Algorithm SHA256` and compare the hash with the first value in its `.sha256` sidecar. Backups contain encrypted sales data. Keep a secure copy of the project's `.env` encryption key separately: restoring sales requires the same `APP_ENCRYPTION_KEY`. Do not store that key beside an unprotected backup. Set database credentials and the encryption key in `.env`; the API and backup script read database settings from that file.
