# WebContainer Integration Guide

## Overview

iEditor uses **WebContainer** from StackBlitz to run Node.js projects directly in the browser. This enables users to:
- Create and edit web applications in real-time
- See live previews without deploying
- Run npm commands and dev servers
- Install dependencies automatically
- Hot reload changes instantly

---

## Current Implementation

### ✅ What's Already Integrated

#### 1. **WebContainer API Package**
```json
"@webcontainer/api": "^1.6.1"
```

#### 2. **Security Headers** ([next.config.js](d:\my projects\iEditor\next.config.js))
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'require-corp',
        },
      ],
    },
  ]
}
```

These headers enable **SharedArrayBuffer**, required for WebContainer to work.

#### 3. **WebContainer Context** ([lib/webcontainer-context.tsx](d:\my projects\iEditor\lib\webcontainer-context.tsx))
- Singleton instance management
- Auto-boot on app load
- Error handling for browser compatibility
- Global state via React Context

#### 4. **Preview Component** ([components/workspace/webcontainer-preview.tsx](d:\my projects\iEditor\components\workspace\webcontainer-preview.tsx))
- Automatic file mounting
- npm install on project load
- Dev server startup (Vite/Next.js)
- Live preview iframe
- Real-time file updates
- Terminal logs display

#### 5. **Interactive Terminal** ([components/workspace/webcontainer-terminal.tsx](d:\my projects\iEditor\components\workspace\webcontainer-terminal.tsx))
- Run custom commands
- Quick command buttons
- Process management (Ctrl+C)
- Output streaming
- Auto-scroll

---

## Features

### 🎯 Automatic Workflow

When a user opens a project:

1. **WebContainer boots** (happens once on first load)
2. **Files mount** to WebContainer filesystem
3. **Dependencies install** (`npm install`)
4. **Dev server starts** (`npm run dev`)
5. **Preview loads** in iframe
6. **Hot reload enabled** - edits update live

### 🔧 Manual Controls

Users can:
- **Refresh server** - Restart dev process
- **View logs** - See npm install/dev output
- **Open terminal** - Run custom commands
- **Open in new tab** - Full-screen preview

### ⚡ Performance Features

- **Debounced file updates** (300ms) - Prevents excessive writes
- **Batch file writes** - Updates all changed files at once
- **Singleton instance** - One WebContainer per browser
- **Memoized file tree** - Efficient re-renders
- **Background processes** - Dev server runs continuously

---

## File Structure Integration

### Required Files for WebContainer

For a project to work in WebContainer, it needs:

#### **Vite Projects** (10 files)
```
project/
├── package.json          ← Dependencies + scripts
├── vite.config.ts        ← Vite configuration
├── tsconfig.json         ← TypeScript config
├── tsconfig.node.json    ← TS for Node
├── tailwind.config.js    ← Tailwind CSS
├── postcss.config.js     ← PostCSS
├── index.html            ← HTML entry
└── src/
    ├── main.tsx          ← React bootstrap
    ├── App.tsx           ← Main component
    └── index.css         ← Global styles
```

#### **Next.js Projects** (6+ files)
```
project/
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── app/
    └── page.tsx
```

### File Tree Format

WebContainer expects this structure:

```typescript
{
  'package.json': {
    file: {
      contents: '...'
    }
  },
  'src': {
    directory: {
      'App.tsx': {
        file: {
          contents: '...'
        }
      }
    }
  }
}
```

---

## Browser Compatibility

### ✅ Supported Browsers

- **Chrome 92+** (best performance)
- **Edge 92+**
- **Firefox 95+**
- **Safari 16.4+** (macOS only)

### ❌ Not Supported

- Mobile browsers (iOS Safari, Chrome Mobile)
- Internet Explorer
- Older browser versions

### Requirements

- **SharedArrayBuffer** support
- **Web Workers**
- **HTTPS or localhost** (for security headers)

---

## API Usage

### 1. Boot WebContainer

```typescript
import { WebContainer } from '@webcontainer/api'

const webcontainer = await WebContainer.boot()
```

### 2. Mount Files

```typescript
await webcontainer.mount({
  'package.json': {
    file: {
      contents: JSON.stringify({
        name: 'my-app',
        scripts: {
          dev: 'vite'
        },
        dependencies: {
          'react': '^18.2.0',
          'vite': '^5.0.0'
        }
      }, null, 2)
    }
  }
})
```

### 3. Install Dependencies

```typescript
const installProcess = await webcontainer.spawn('npm', ['install'])

// Stream output
installProcess.output.pipeTo(
  new WritableStream({
    write(data) {
      console.log(data)
    }
  })
)

// Wait for completion
const exitCode = await installProcess.exit
```

### 4. Start Dev Server

```typescript
// Listen for server ready
webcontainer.on('server-ready', (port, url) => {
  console.log(`Server ready at ${url}`)
  // Load in iframe
})

// Start dev server
const devProcess = await webcontainer.spawn('npm', ['run', 'dev'])
```

### 5. Update Files

```typescript
// Write single file
await webcontainer.fs.writeFile('src/App.tsx', newContent)

// Read file
const content = await webcontainer.fs.readFile('package.json', 'utf-8')

// Create directory
await webcontainer.fs.mkdir('src/components', { recursive: true })
```

---

## Configuration

### Vite Config for WebContainer

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',  // ← Critical for WebContainer!
    strictPort: true
  }
})
```

**Important**: `host: '0.0.0.0'` allows WebContainer to bind the server properly.

### Next.js Config

```javascript
// next.config.js
module.exports = {
  // Enable server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },

  // WebContainer headers
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }
      ]
    }]
  }
}
```

---

## Troubleshooting

### Issue: "WebContainer boot failed"

**Causes**:
- Browser doesn't support SharedArrayBuffer
- Missing security headers
- Multiple instances running

**Solutions**:
1. Check browser compatibility
2. Verify headers in Network tab
3. Close other tabs with WebContainer
4. Use Chrome/Edge for best support

---

### Issue: "Waiting for preview..." stuck

**Causes**:
- Server-ready listener added after spawn
- Dev server failed to start
- Wrong port configuration

**Solutions**:
1. Check terminal logs for errors
2. Verify `server-ready` listener is before `spawn()`
3. Ensure Vite config has `host: '0.0.0.0'`
4. Click refresh button to restart

---

### Issue: "No package.json found"

**Causes**:
- Old projects with incomplete file structure
- Database has wrong files

**Solutions**:
1. Delete old projects (see [DELETE_OLD_PROJECTS_NOW.md](DELETE_OLD_PROJECTS_NOW.md))
2. Create new projects with Vite templates
3. Verify database has 10 files per project

---

### Issue: "npm install failed"

**Causes**:
- Invalid package.json
- Network issues
- Unsupported packages

**Solutions**:
1. Validate JSON syntax
2. Check browser has internet
3. Try simpler dependencies first
4. Look at terminal logs for specific errors

---

### Issue: "Hot reload not working"

**Causes**:
- File update debounce too long
- WebContainer fs.writeFile failed
- Dev server needs restart

**Solutions**:
1. Check browser console for errors
2. Click refresh button
3. Reduce debounce time (edit webcontainer-preview.tsx line 198)

---

## Advanced Features

### Custom Commands

Use the interactive terminal to run:

```bash
# Install specific package
npm install lodash

# Run build
npm run build

# List files
ls -la

# Check Node version
node --version

# Run TypeScript compiler
tsc --noEmit
```

### File Operations

```typescript
// Create new file
await webcontainer.fs.writeFile('src/utils.ts', 'export const hello = () => "world"')

// Delete file
await webcontainer.fs.rm('src/old-file.ts')

// Rename file
await webcontainer.fs.rename('old.ts', 'new.ts')

// Check if file exists
const exists = await webcontainer.fs.readdir('src').then(
  () => true,
  () => false
)
```

### Process Management

```typescript
// Run in background
const devProcess = await webcontainer.spawn('npm', ['run', 'dev'])

// Kill process
devProcess.kill()

// Run multiple commands
const build = await webcontainer.spawn('npm', ['run', 'build'])
await build.exit

const serve = await webcontainer.spawn('npm', ['run', 'preview'])
```

---

## Component Usage

### Basic Preview

```tsx
import { WebContainerPreview } from '@/components/workspace/webcontainer-preview'

<WebContainerPreview
  projectId={project.id}
  files={projectFiles}
/>
```

### With Terminal

```tsx
import { WebContainerTerminal } from '@/components/workspace/webcontainer-terminal'

<WebContainerTerminal
  onClose={() => setShowTerminal(false)}
  className="h-96"
/>
```

### With Context

```tsx
import { useWebContainer } from '@/lib/webcontainer-context'

function MyComponent() {
  const { webcontainer, isBooting, error } = useWebContainer()

  if (isBooting) return <div>Booting...</div>
  if (error) return <div>Error: {error}</div>

  // Use webcontainer...
}
```

---

## Performance Tips

### 1. File Updates

Batch updates and debounce:

```typescript
// Bad - updates one by one
files.forEach(async file => {
  await webcontainer.fs.writeFile(file.path, file.content)
})

// Good - batch with Promise.all
await Promise.all(
  files.map(file =>
    webcontainer.fs.writeFile(file.path, file.content)
  )
)
```

### 2. Process Output

Limit terminal output:

```typescript
const logs = []
const MAX_LOGS = 1000

process.output.pipeTo(
  new WritableStream({
    write(data) {
      logs.push(data)
      if (logs.length > MAX_LOGS) {
        logs.shift() // Remove oldest
      }
    }
  })
)
```

### 3. Cleanup

Kill processes when done:

```typescript
useEffect(() => {
  let process: any

  const startServer = async () => {
    process = await webcontainer.spawn('npm', ['run', 'dev'])
  }

  startServer()

  return () => {
    if (process) {
      process.kill()
    }
  }
}, [])
```

---

## Security Considerations

### Sandbox Attributes

The iframe has these security settings:

```html
<iframe
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
/>
```

### Limitations

WebContainer runs in a sandboxed environment:
- ✅ Can run Node.js and npm
- ✅ Can install packages from npm
- ✅ Can bind to localhost ports
- ❌ Cannot access user's filesystem
- ❌ Cannot make arbitrary network requests
- ❌ Cannot spawn native processes

### Best Practices

1. **Validate user input** before writing to filesystem
2. **Limit package installations** to trusted sources
3. **Monitor resource usage** (memory, CPU)
4. **Show clear error messages** for security violations

---

## Migration Guide

### From Old Next.js Templates → New Vite Templates

**Problem**: Old templates had 2-6 files, missing critical config files

**Solution**: Use new Vite templates with 10 files each

**Steps**:

1. **Delete old projects** (see [DELETE_OLD_PROJECTS_NOW.md](DELETE_OLD_PROJECTS_NOW.md))
2. **Create new projects** with "Try Demo" button
3. **Verify 10 files** in each project

**What Changed**:

| Old (Next.js) | New (Vite) |
|--------------|-----------|
| 2-6 files | 10 files |
| Next.js 14 | Vite 5 |
| 3-5s startup | ~500ms startup |
| Often broken | Always works |

---

## References

- **Official Docs**: https://webcontainers.io/
- **API Reference**: https://webcontainers.io/api
- **StackBlitz Blog**: https://blog.stackblitz.com/
- **GitHub Repo**: https://github.com/stackblitz/webcontainer-core

---

## Summary

✅ **WebContainer is fully integrated** in iEditor
✅ **Security headers configured** for SharedArrayBuffer
✅ **Auto-boot and file mounting** working
✅ **Interactive terminal** available
✅ **Vite templates** with 10 files each
✅ **Hot reload** and live preview

**Next Step**: Delete old projects and create new Vite ones! See [DELETE_OLD_PROJECTS_NOW.md](DELETE_OLD_PROJECTS_NOW.md)

---

**Last Updated**: 2025-11-21
**Version**: 1.0.0
**Status**: Production Ready ✨
