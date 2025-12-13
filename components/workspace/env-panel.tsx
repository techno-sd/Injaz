"use client"

import * as React from "react"
import { Plus, Trash2, Eye, EyeOff, Save, RefreshCw, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface EnvVariable {
  id: string
  key: string
  value: string
  isSecret: boolean
  environment: 'development' | 'staging' | 'production'
}

interface EnvPanelProps {
  projectId: string
  onEnvChange?: (variables: EnvVariable[]) => void
}

export function EnvPanel({ projectId, onEnvChange }: EnvPanelProps) {
  const { toast } = useToast()
  const [variables, setVariables] = React.useState<EnvVariable[]>([])
  const [newKey, setNewKey] = React.useState("")
  const [newValue, setNewValue] = React.useState("")
  const [newIsSecret, setNewIsSecret] = React.useState(false)
  const [selectedEnv, setSelectedEnv] = React.useState<'development' | 'staging' | 'production'>('development')
  const [visibleSecrets, setVisibleSecrets] = React.useState<Set<string>>(new Set())
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Filter variables by selected environment
  const filteredVariables = variables.filter(v => v.environment === selectedEnv)

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const addVariable = () => {
    if (!newKey.trim()) {
      toast({
        title: "Error",
        description: "Variable name is required",
        variant: "destructive",
      })
      return
    }

    // Check for duplicates
    if (variables.some(v => v.key === newKey && v.environment === selectedEnv)) {
      toast({
        title: "Error",
        description: "Variable already exists in this environment",
        variant: "destructive",
      })
      return
    }

    const newVariable: EnvVariable = {
      id: crypto.randomUUID(),
      key: newKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
      value: newValue,
      isSecret: newIsSecret,
      environment: selectedEnv,
    }

    setVariables(prev => [...prev, newVariable])
    setNewKey("")
    setNewValue("")
    setNewIsSecret(false)
    setAddDialogOpen(false)
    setHasChanges(true)

    toast({
      title: "Variable Added",
      description: `${newVariable.key} has been added`,
      variant: "success",
    })
  }

  const deleteVariable = (id: string) => {
    const variable = variables.find(v => v.id === id)
    setVariables(prev => prev.filter(v => v.id !== id))
    setHasChanges(true)

    toast({
      title: "Variable Deleted",
      description: `${variable?.key} has been removed`,
    })
  }

  const updateVariable = (id: string, updates: Partial<EnvVariable>) => {
    setVariables(prev =>
      prev.map(v => (v.id === id ? { ...v, ...updates } : v))
    )
    setHasChanges(true)
  }

  const saveChanges = async () => {
    // TODO: Save to database/API
    toast({
      title: "Changes Saved",
      description: "Environment variables have been saved",
      variant: "success",
    })
    setHasChanges(false)
    onEnvChange?.(variables)
  }

  const generateEnvFile = () => {
    const content = filteredVariables
      .map(v => `${v.key}=${v.isSecret ? '***' : v.value}`)
      .join('\n')

    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to Clipboard",
      description: ".env content copied (secrets masked)",
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Environment Variables</h3>
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedEnv}
            onValueChange={(v) => setSelectedEnv(v as typeof selectedEnv)}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Variables List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredVariables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No environment variables</p>
              <p className="text-xs mt-1">Add variables for {selectedEnv}</p>
            </div>
          ) : (
            filteredVariables.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-medium">
                      {variable.key}
                    </code>
                    {variable.isSecret && (
                      <Badge variant="outline" className="text-xs h-5">
                        Secret
                      </Badge>
                    )}
                  </div>
                  {editingId === variable.id ? (
                    <Input
                      value={variable.value}
                      onChange={(e) =>
                        updateVariable(variable.id, { value: e.target.value })
                      }
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="mt-1 h-8 font-mono text-sm"
                      type={variable.isSecret && !visibleSecrets.has(variable.id) ? "password" : "text"}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-sm text-muted-foreground font-mono truncate mt-1 cursor-pointer hover:text-foreground"
                      onClick={() => setEditingId(variable.id)}
                    >
                      {variable.isSecret && !visibleSecrets.has(variable.id)
                        ? '••••••••'
                        : variable.value || '(empty)'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {variable.isSecret && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleSecretVisibility(variable.id)}
                    >
                      {visibleSecrets.has(variable.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteVariable(variable.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="border-t p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Environment Variable</DialogTitle>
                <DialogDescription>
                  Add a new variable for {selectedEnv} environment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Variable Name</Label>
                  <Input
                    id="key"
                    placeholder="API_KEY"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    placeholder="your-value-here"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    type={newIsSecret ? "password" : "text"}
                    className="font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSecret"
                    checked={newIsSecret}
                    onChange={(e) => setNewIsSecret(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isSecret" className="text-sm">
                    Mark as secret (value will be hidden)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addVariable}>Add Variable</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={generateEnvFile}
            disabled={filteredVariables.length === 0}
          >
            Copy .env
          </Button>
        </div>

        {hasChanges && (
          <Button
            className="w-full"
            size="sm"
            onClick={saveChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>
    </div>
  )
}
