-- Migration to add package.json to projects that don't have it
-- This fixes projects created before the package.json fix was implemented

DO $$
DECLARE
  project_record RECORD;
  package_json_content TEXT;
BEGIN
  -- Loop through all projects that don't have a package.json
  FOR project_record IN
    SELECT DISTINCT p.id, p.name
    FROM projects p
    WHERE NOT EXISTS (
      SELECT 1 FROM files f
      WHERE f.project_id = p.id
      AND f.path = 'package.json'
    )
  LOOP
    -- Create package.json content
    package_json_content := json_build_object(
      'name', lower(replace(project_record.name, ' ', '-')),
      'version', '0.1.0',
      'private', true,
      'type', 'module',
      'scripts', json_build_object(
        'dev', 'vite',
        'build', 'vite build',
        'preview', 'vite preview'
      ),
      'dependencies', json_build_object(
        'react', '^18.2.0',
        'react-dom', '^18.2.0'
      ),
      'devDependencies', json_build_object(
        '@types/react', '^18.2.66',
        '@types/react-dom', '^18.2.22',
        '@vitejs/plugin-react', '^4.2.1',
        'autoprefixer', '^10.4.19',
        'postcss', '^8.4.38',
        'tailwindcss', '^3.4.3',
        'typescript', '^5.2.2',
        'vite', '^5.2.0'
      )
    )::text;

    -- Insert package.json
    INSERT INTO files (project_id, path, content, language)
    VALUES (
      project_record.id,
      'package.json',
      package_json_content,
      'json'
    );

    -- Check if vite.config.ts exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM files
      WHERE project_id = project_record.id
      AND path = 'vite.config.ts'
    ) THEN
      INSERT INTO files (project_id, path, content, language)
      VALUES (
        project_record.id,
        'vite.config.ts',
        'import { defineConfig } from ''vite''
import react from ''@vitejs/plugin-react''

export default defineConfig({
  plugins: [react()],
})',
        'typescript'
      );
    END IF;

    -- Check if index.html exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM files
      WHERE project_id = project_record.id
      AND path = 'index.html'
    ) THEN
      INSERT INTO files (project_id, path, content, language)
      VALUES (
        project_record.id,
        'index.html',
        '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>' || project_record.name || '</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>',
        'html'
      );
    END IF;

    -- Check if src/main.tsx exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM files
      WHERE project_id = project_record.id
      AND path = 'src/main.tsx'
    ) THEN
      INSERT INTO files (project_id, path, content, language)
      VALUES (
        project_record.id,
        'src/main.tsx',
        'import React from ''react''
import ReactDOM from ''react-dom/client''
import App from ''./App''
import ''./index.css''

ReactDOM.createRoot(document.getElementById(''root'')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)',
        'typescript'
      );
    END IF;

    -- Check if src/index.css exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM files
      WHERE project_id = project_record.id
      AND path = 'src/index.css'
    ) THEN
      INSERT INTO files (project_id, path, content, language)
      VALUES (
        project_record.id,
        'src/index.css',
        '@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', ''Roboto'', ''Oxygen'',
    ''Ubuntu'', ''Cantarell'', ''Fira Sans'', ''Droid Sans'', ''Helvetica Neue'',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}',
        'css'
      );
    END IF;

    -- Check if tailwind.config.js exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM files
      WHERE project_id = project_record.id
      AND path = 'tailwind.config.js'
    ) THEN
      INSERT INTO files (project_id, path, content, language)
      VALUES (
        project_record.id,
        'tailwind.config.js',
        '/** @type {import(''tailwindcss'').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}',
        'javascript'
      );
    END IF;

    -- Check if postcss.config.js exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM files
      WHERE project_id = project_record.id
      AND path = 'postcss.config.js'
    ) THEN
      INSERT INTO files (project_id, path, content, language)
      VALUES (
        project_record.id,
        'postcss.config.js',
        'export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}',
        'javascript'
      );
    END IF;

    -- Rename app/ files to src/ if they exist
    UPDATE files
    SET path = replace(path, 'app/', 'src/')
    WHERE project_id = project_record.id
    AND path LIKE 'app/%';

    -- Rename page.tsx to App.tsx if it exists
    UPDATE files
    SET path = 'src/App.tsx'
    WHERE project_id = project_record.id
    AND path = 'src/page.tsx';

    -- Delete layout.tsx as it's not needed for Vite
    DELETE FROM files
    WHERE project_id = project_record.id
    AND path = 'src/layout.tsx';

    RAISE NOTICE 'Added missing files to project: %', project_record.name;
  END LOOP;
END $$;
