'use client'

import { useEffect, useRef, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { updateFile } from '@/app/actions/files'
import { debounce } from '@/lib/utils'
import type { File } from '@/types'
import { Loader2, Save, Check, Sparkles, Code2, Settings, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CodeEditorProps {
  file: File | undefined
  projectId: string
  onFileUpdate: (file: File) => void
}

export function CodeEditor({ file, projectId, onFileUpdate }: CodeEditorProps) {
  const [content, setContent] = useState(file?.content || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [showMinimap, setShowMinimap] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    if (file) {
      setContent(file.content)
    }
  }, [file?.id])

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Configure Monaco theme
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
      },
    })
    monaco.editor.setTheme('custom-dark')
  }

  const debouncedSave = useRef(
    debounce(async (fileId: string, newContent: string) => {
      setSaving(true)
      setSaved(false)
      try {
        await updateFile(fileId, newContent)
        setSaved(true)
      } catch (error) {
        console.error('Save failed:', error)
      } finally {
        setSaving(false)
      }
    }, 1000)
  ).current

  function handleChange(value: string | undefined) {
    if (!file || value === undefined) return

    setContent(value)
    setSaved(false)
    onFileUpdate({ ...file, content: value })
    debouncedSave(file.id, value)
  }

  // Get file icon color based on language
  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      typescript: 'bg-blue-500',
      javascript: 'bg-yellow-500',
      python: 'bg-green-500',
      css: 'bg-emerald-500',
      html: 'bg-orange-500',
      json: 'bg-gray-500',
    }
    return colors[lang] || 'bg-primary'
  }

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-gray-400">
        <div className="text-center space-y-2">
          <p className="text-sm">No file selected</p>
          <p className="text-xs text-gray-500">Select a file from the sidebar to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/10">
      {/* Enhanced Header */}
      <div className="glass-card border-b px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${getLanguageColor(file.language)}`}></div>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{file.path}</span>
          </div>
          <Badge variant="secondary" className="text-xs font-medium">
            {file.language}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Status */}
          <div className="flex items-center gap-1.5 text-xs">
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-muted-foreground">Saving...</span>
              </>
            ) : saved ? (
              <>
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">Saved</span>
              </>
            ) : (
              <>
                <Save className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Unsaved</span>
              </>
            )}
          </div>

          {/* AI Features Badge */}
          <Badge variant="outline" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            AI
          </Badge>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowMinimap(!showMinimap)}>
                <span className="flex-1">Minimap</span>
                <Badge variant={showMinimap ? "default" : "outline"} className="text-xs">
                  {showMinimap ? 'On' : 'Off'}
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFontSize(12)}>
                <span className="flex-1">Font Size: Small</span>
                {fontSize === 12 && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize(14)}>
                <span className="flex-1">Font Size: Medium</span>
                {fontSize === 14 && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize(16)}>
                <span className="flex-1">Font Size: Large</span>
                {fontSize === 16 && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={file.language}
          value={content}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: showMinimap },
            fontSize: fontSize,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
          loading={
            <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-gray-300">Loading Monaco Editor...</p>
                  <p className="text-xs text-gray-500">Initializing IntelliSense</p>
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}
