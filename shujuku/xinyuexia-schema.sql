CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS app_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'novel',
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '未分类',
  synopsis TEXT NOT NULL DEFAULT '',
  cover_id TEXT,
  word_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volumes (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_expanded BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  volume_id TEXT REFERENCES volumes(id) ON DELETE SET NULL,
  serial_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plot_points (
  id TEXT PRIMARY KEY,
  source_work_id TEXT REFERENCES works(id) ON DELETE SET NULL,
  source_chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  score NUMERIC(4, 1),
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL DEFAULT '设定库',
  work_id TEXT REFERENCES works(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  title TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT 'manual',
  author TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  original_filename TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_chunks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chapter_title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  token_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_items (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
  source_chunk_id TEXT REFERENCES source_chunks(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  canonical_name TEXT NOT NULL DEFAULT '',
  aliases TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  category TEXT NOT NULL DEFAULT '未分类',
  subcategory TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  summary TEXT NOT NULL DEFAULT '',
  original_text TEXT NOT NULL DEFAULT '',
  organized_text TEXT NOT NULL DEFAULT '',
  evidence_text TEXT NOT NULL DEFAULT '',
  evidence_location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '待确认',
  confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.65,
  allow_rag BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  importance TEXT NOT NULL DEFAULT '普通',
  rag_weight NUMERIC(6, 3) NOT NULL DEFAULT 1,
  worldline TEXT NOT NULL DEFAULT '主线',
  version TEXT NOT NULL DEFAULT '',
  related_items TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_embeddings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  setting_item_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  embedding_model TEXT NOT NULL DEFAULT '',
  embedding vector(1536),
  embedding_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_relations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_setting_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  to_setting_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL DEFAULT 'related_to',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS retrieval_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'local-user',
  query TEXT NOT NULL DEFAULT '',
  retrieved_setting_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  retrieved_chunk_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  purpose TEXT NOT NULL DEFAULT 'writing',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_chapter_bindings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  work_id TEXT REFERENCES works(id) ON DELETE CASCADE,
  chapter_id TEXT REFERENCES chapters(id) ON DELETE CASCADE,
  setting_item_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL DEFAULT 'writing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setting_change_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  setting_item_id TEXT NOT NULL REFERENCES setting_items(id) ON DELETE CASCADE,
  action TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS covers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'upload',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '正文',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model_id TEXT NOT NULL,
  base_url TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  temperature NUMERIC(3, 2),
  top_p NUMERIC(3, 2),
  enabled BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS call_records (
  id TEXT PRIMARY KEY,
  model_config_id TEXT REFERENCES model_configs(id) ON DELETE SET NULL,
  model_id TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT '',
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success',
  error TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapters_work_serial ON chapters(work_id, serial_number);
CREATE INDEX IF NOT EXISTS idx_plot_points_tags ON plot_points USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_plot_points_not_deleted ON plot_points(created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_materials_collection ON materials(collection);
CREATE INDEX IF NOT EXISTS idx_sources_project ON sources(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_chunks_source ON source_chunks(source_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_setting_items_project_category ON setting_items(project_id, category);
CREATE INDEX IF NOT EXISTS idx_setting_items_project_status ON setting_items(project_id, status);
CREATE INDEX IF NOT EXISTS idx_setting_items_tags ON setting_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_setting_items_keywords ON setting_items USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_setting_items_rag ON setting_items(project_id, allow_rag, is_verified, importance);
CREATE INDEX IF NOT EXISTS idx_setting_embeddings_project ON setting_embeddings(project_id);
CREATE INDEX IF NOT EXISTS idx_setting_relations_from ON setting_relations(project_id, from_setting_id);
CREATE INDEX IF NOT EXISTS idx_retrieval_logs_project ON retrieval_logs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_records_created_at ON call_records(created_at DESC);
