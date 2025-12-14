-- Migration: Add Multi-Platform Support with Unified App Schema
-- This migration adds support for the dual-mode AI system (Controller + CodeGen)

-- Create platform type enum
DO $$ BEGIN
  CREATE TYPE platform_type AS ENUM ('website', 'webapp', 'mobile');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create AI mode enum
DO $$ BEGIN
  CREATE TYPE ai_mode AS ENUM ('auto', 'controller', 'codegen');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS platform platform_type DEFAULT 'webapp',
ADD COLUMN IF NOT EXISTS app_schema JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS schema_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_schema_update TIMESTAMPTZ DEFAULT NULL;

-- Create generation_history table for tracking AI outputs
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mode ai_mode NOT NULL,
  input_prompt TEXT NOT NULL,
  controller_output JSONB DEFAULT NULL,
  codegen_output JSONB DEFAULT NULL,
  files_generated TEXT[] DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_generation_history_project_id ON generation_history(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_platform ON projects(platform);

-- Create schema_snapshots table for version history
CREATE TABLE IF NOT EXISTS schema_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  schema JSONB NOT NULL,
  version INTEGER NOT NULL,
  change_description TEXT DEFAULT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for schema snapshots
CREATE INDEX IF NOT EXISTS idx_schema_snapshots_project_id ON schema_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_schema_snapshots_version ON schema_snapshots(project_id, version DESC);

-- Enable RLS on new tables
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for generation_history
CREATE POLICY "Users can view their own generation history"
  ON generation_history FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own generation history"
  ON generation_history FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- RLS policies for schema_snapshots
CREATE POLICY "Users can view their own schema snapshots"
  ON schema_snapshots FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own schema snapshots"
  ON schema_snapshots FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Function to automatically save schema snapshot on update
CREATE OR REPLACE FUNCTION save_schema_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.app_schema IS DISTINCT FROM NEW.app_schema AND NEW.app_schema IS NOT NULL THEN
    INSERT INTO schema_snapshots (project_id, schema, version, change_description)
    VALUES (
      NEW.id,
      NEW.app_schema,
      COALESCE(NEW.schema_version, 1),
      'Auto-saved on schema update'
    );

    NEW.schema_version := COALESCE(NEW.schema_version, 0) + 1;
    NEW.last_schema_update := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to save schema snapshot
DROP TRIGGER IF EXISTS trigger_save_schema_snapshot ON projects;
CREATE TRIGGER trigger_save_schema_snapshot
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION save_schema_snapshot();

-- Add comment for documentation
COMMENT ON TABLE generation_history IS 'Tracks AI generation history for dual-mode system (Controller + CodeGen)';
COMMENT ON TABLE schema_snapshots IS 'Version history of project schemas';
COMMENT ON COLUMN projects.platform IS 'Target platform: website (static), webapp (Next.js), mobile (React Native)';
COMMENT ON COLUMN projects.app_schema IS 'Unified App Schema JSON for multi-platform code generation';
