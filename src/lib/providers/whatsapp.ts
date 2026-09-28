export interface WhatsAppMessageInput {
  to: string
  template: string
  variables?: Record<string, string>
}

export interface WhatsAppProvider {
  sendMessage(input: WhatsAppMessageInput): Promise<{ accepted: boolean; provider: string }>
}

export class MockWhatsAppProvider implements WhatsAppProvider {
  constructor(public readonly provider = 'mock') {}

  async sendMessage(input: WhatsAppMessageInput): Promise<{ accepted: boolean; provider: string }> {
    return { accepted: Boolean(input.to && input.template), provider: this.provider }
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  return new MockWhatsAppProvider('mock')
}
