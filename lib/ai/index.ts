// AI Module - Simplified Architecture
// Following Bolt.new / Replit / V0 patterns

export { Generator, getGenerator } from './generator'
export type { GeneratorEvent, GeneratorFile, GeneratorEventType } from './generator'

export { templates, matchTemplate, getTemplates } from './templates'
export type { Template, TemplateFile } from './templates'

export { SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT, MODIFY_SYSTEM_PROMPT, isGenerationRequest } from './prompts'
