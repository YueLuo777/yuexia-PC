# Embedded PostgreSQL runtime

Put a portable PostgreSQL distribution here before packaging if you want the app to ship with its own database runtime.

Expected layout:

```text
runtime/postgres/
  bin/
    postgres.exe
    initdb.exe
    pg_ctl.exe
    psql.exe
  lib/
  share/
```

The PostgreSQL build must include pgvector. The app will initialize user data separately under the configured database data directory, so this folder should contain only runtime files.

If PostgreSQL is already installed on this machine, you can prepare this folder with:

```powershell
npm.cmd run prepare:postgres -- "C:\Program Files\PostgreSQL\16"
```

If `psql` is already in PATH, the path argument can be omitted:

```powershell
npm.cmd run prepare:postgres
```
