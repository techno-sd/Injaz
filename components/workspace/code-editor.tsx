'use client'

import { useEffect, useRef, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { updateFile } from '@/app/actions/files'
import { debounce } from '@/lib/utils'
import type { File } from '@/types'
import { Loader2 } from 'lucide-react'

interface CodeEditorProps {
  file: File | undefined
  projectId: string
  onFileUpdate: (file: File) => void
}

export function CodeEditor({ file, projectId, onFileUpdate }: CodeEditorProps) {
  const [content, setContent] = useState(file?.content || '')
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
      await updateFile(fileId, newContent)
    }, 1000)
  ).current

  function handleChange(value: string | undefined) {
    if (!file || value === undefined) return

    setContent(value)
    onFileUpdate({ ...file, content: value })
    debouncedSave(file.id, value)
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
    <div className="h-full flex flex-col">
      <div className="bg-muted/50 px-4 py-2.5 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">{file.path}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {file.language}
          </span>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={file.language}
          value={content}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
          loading={
            <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-400">Loading editor...</p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}
