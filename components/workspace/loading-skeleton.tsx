"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export function WorkspaceSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header Skeleton */}
      <div className="h-14 border-b bg-muted/30 flex items-center px-4 gap-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex">
        {/* File Tree Skeleton */}
        <div className="w-64 border-r bg-muted/20 p-4 space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-2 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Editor Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="h-10 border-b bg-muted/30 flex items-center px-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex-1 p-4 space-y-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ width: `${Math.random() * 40 + 40}%` }}
              />
            ))}
          </div>
        </div>

        {/* Right Panel Skeleton */}
        <div className="w-80 border-l bg-muted/20 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EditorSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab bar */}
      <div className="h-10 border-b bg-muted/30 flex items-center px-4 gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      {/* Editor content */}
      <div className="flex-1 p-4 space-y-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-8 opacity-50" />
            <Skeleton
              className="h-4"
              style={{ width: `${Math.random() * 50 + 20}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PreviewSkeleton() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-muted/20">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Loading preview...</p>
      <p className="text-xs text-muted-foreground mt-1">Starting WebContainer...</p>
    </div>
  )
}

export function TerminalSkeleton() {
  return (
    <div className="h-full bg-black p-4 font-mono text-sm">
      <div className="flex items-center gap-2 text-green-500 mb-2">
        <span>$</span>
        <Skeleton className="h-4 w-32 bg-green-900/50" />
      </div>
      <div className="space-y-1 text-gray-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 bg-gray-800"
            style={{ width: `${Math.random() * 40 + 30}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] space-y-2 ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
              <Skeleton className={`h-4 w-16 ${i % 2 === 0 ? 'ml-auto' : ''}`} />
              <Skeleton
                className="h-20 rounded-lg"
                style={{ width: `${Math.random() * 100 + 150}px` }}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="border-t p-4">
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function FileTreeSkeleton() {
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
            style={{ paddingLeft: `${Math.floor(Math.random() * 3) * 16}px` }}
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1 max-w-[120px]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function GitPanelSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DeploymentSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
