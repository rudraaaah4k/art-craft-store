export interface EmailMessageInput {
  to: string
  subject: string
  text: string
  html?: string
}

export interface EmailProvider {
  sendMessage(input: EmailMessageInput): Promise<{ accepted: boolean; provider: string }>
}

export class MockEmailProvider implements EmailProvider {
  constructor(public readonly provider = 'mock') {}

  async sendMessage(input: EmailMessageInput): Promise<{ accepted: boolean; provider: string }> {
    return { accepted: Boolean(input.to && input.subject && input.text), provider: this.provider }
  }
}

export function getEmailProvider(): EmailProvider {
  const configured = Boolean(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('your-'))
  return new MockEmailProvider(configured ? 'resend-mock' : 'mock')
}
