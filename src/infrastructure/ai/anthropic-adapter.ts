import Anthropic from '@anthropic-ai/sdk'
import { AIProviderPort } from '@/domain/ports/ai-provider.port'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
const MAX_TOKENS = 1000

export class AnthropicAdapter extends AIProviderPort {
  readonly name = 'anthropic' as const
  private readonly client: Anthropic

  constructor() {
    super()
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }

  async generate(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    })
    return message.content.find(b => b.type === 'text')?.text ?? ''
  }
}
