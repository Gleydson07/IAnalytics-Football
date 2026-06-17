export abstract class AIProviderPort {
  abstract generate(prompt: string): Promise<string>
}
