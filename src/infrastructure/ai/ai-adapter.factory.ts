import { AnthropicAdapter } from './anthropic-adapter'
import { OpenAIAdapter } from './openai-adapter'
import type { AIProviderPort } from '@/domain/ports/ai-provider.port'
import type { AIProviderName } from './ai-provider.types'

export function getAIAdapter(): AIProviderPort {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase() as AIProviderName

  switch (provider) {
    case 'anthropic':
      return new AnthropicAdapter()
    case 'openai':
      return new OpenAIAdapter()
    default:
      throw new Error(`AI_PROVIDER inválido: "${provider}". Use "openai" ou "anthropic".`)
  }
}
