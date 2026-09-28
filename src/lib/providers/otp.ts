export interface RequestOtpInput {
  phone: string
}

export interface OtpProvider {
  requestOtp(input: RequestOtpInput): Promise<{ accepted: boolean; provider: string }>
  verifyOtp(phone: string, otp: string): Promise<boolean>
}

export class MockOtpProvider implements OtpProvider {
  constructor(public readonly provider = 'mock') {}

  async requestOtp(input: RequestOtpInput): Promise<{ accepted: boolean; provider: string }> {
    return { accepted: input.phone.length > 0, provider: this.provider }
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    return phone.length > 0 && otp === '123456'
  }
}

export function getOtpProvider(): OtpProvider {
  return new MockOtpProvider('mock')
}
