import OpenAI from 'openai'
import { AIProviderPort } from '@/domain/ports/ai-provider.port'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const MAX_TOKENS = 1000

export class OpenAIAdapter extends AIProviderPort {
  readonly name = 'openai' as const
  private readonly client: OpenAI

  constructor() {
    super()
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async generate(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    })
    return completion.choices[0]?.message?.content ?? ''
  }
}
