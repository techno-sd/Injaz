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
        <p>No file selected</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-muted px-4 py-2 border-b text-sm font-medium">
        {file.path}
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
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          }
        />
      </div>
    </div>
  )
}
