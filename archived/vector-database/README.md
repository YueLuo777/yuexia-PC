# Vector Database Archive

This folder preserves the removed PostgreSQL/pgvector database implementation after the app stopped using the vector database path.

Archived from the live app on 2026-06-09.

Contents:
- electron/main.cjs: original main-process database IPC, embedded PostgreSQL, pgvector schema, RAG retrieval, and collection persistence code.
- electron/preload.cjs: original xinyuexiaDatabase preload bridge.
- src/features/settings/*: original database settings model, collection sync helper, and database settings page.
- shujuku/xinyuexia-schema.sql: original pgvector PostgreSQL schema.
- shujuku/xinyuexia-db-config.json: original pgvector database config snapshot.
- runtime/postgres/README.md: original embedded PostgreSQL/pgvector runtime notes.
- prepare-embedded-postgres.cjs: original helper for staging portable PostgreSQL files.

Do not import these files from the current app directly. Treat them as source material for a future resurrection/refactor.
