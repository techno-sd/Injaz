// AI Module - Simplified Architecture
// Fixed base template + AI generates only src/ files

export { generate, isGenerationRequest, BASE_FILES } from './simple-generator'
export type { GeneratorEvent, GeneratorFile, EventType } from './simple-generator'

export { BASE_FILES as baseTemplate, getBaseFilesMap, isBaseFile } from './base-template'
export type { TemplateFile } from './base-template'

export { AI_MODELS, MODEL_IDS, OPENROUTER_CONFIG, DEFAULT_SETTINGS } from './config'
export type { ModelConfig } from './config'
