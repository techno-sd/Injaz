import {
  FileIcon,
  FileCode,
  FileJson,
  FileText,
  Image,
  FileType,
  Folder,
  FolderOpen,
} from 'lucide-react'

export function getFileIcon(path: string, isOpen?: boolean) {
  const extension = path.split('.').pop()?.toLowerCase()
  const fileName = path.split('/').pop()?.toLowerCase()

  // Special files
  if (fileName === 'package.json') return <FileJson className="h-4 w-4 text-green-600" />
  if (fileName === 'tsconfig.json') return <FileJson className="h-4 w-4 text-blue-600" />
  if (fileName === '.env' || fileName === '.env.local') return <FileText className="h-4 w-4 text-yellow-600" />
  if (fileName === 'readme.md') return <FileText className="h-4 w-4 text-blue-500" />
  if (fileName === 'dockerfile') return <FileCode className="h-4 w-4 text-blue-700" />

  // By extension
  switch (extension) {
    // JavaScript/TypeScript
    case 'js':
    case 'jsx':
      return <FileCode className="h-4 w-4 text-yellow-500" />
    case 'ts':
    case 'tsx':
      return <FileCode className="h-4 w-4 text-blue-600" />

    // Web
    case 'html':
      return <FileCode className="h-4 w-4 text-orange-600" />
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode className="h-4 w-4 text-blue-500" />

    // Config/Data
    case 'json':
      return <FileJson className="h-4 w-4 text-yellow-600" />
    case 'yaml':
    case 'yml':
      return <FileText className="h-4 w-4 text-purple-600" />
    case 'xml':
      return <FileText className="h-4 w-4 text-orange-500" />
    case 'toml':
      return <FileText className="h-4 w-4 text-gray-600" />

    // Documentation
    case 'md':
    case 'mdx':
      return <FileText className="h-4 w-4 text-blue-600" />
    case 'txt':
      return <FileText className="h-4 w-4 text-gray-600" />

    // Images
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <Image className="h-4 w-4 text-purple-500" />

    // Other code files
    case 'py':
      return <FileCode className="h-4 w-4 text-blue-500" />
    case 'go':
      return <FileCode className="h-4 w-4 text-cyan-600" />
    case 'rs':
      return <FileCode className="h-4 w-4 text-orange-700" />
    case 'java':
      return <FileCode className="h-4 w-4 text-red-600" />
    case 'php':
      return <FileCode className="h-4 w-4 text-purple-600" />
    case 'rb':
      return <FileCode className="h-4 w-4 text-red-500" />

    default:
      return <FileIcon className="h-4 w-4 text-gray-500" />
  }
}

export function getFolderIcon(isOpen?: boolean) {
  return isOpen ? (
    <FolderOpen className="h-4 w-4 text-blue-500" />
  ) : (
    <Folder className="h-4 w-4 text-blue-500" />
  )
}
