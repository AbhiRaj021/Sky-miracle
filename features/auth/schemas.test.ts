import { describe, expect, it } from 'vitest'
import { LoginFormSchema, SignupFormSchema, UpdatePasswordFormSchema } from './schemas'

const valid = { name: 'Alice', email: ' Alice@Example.com ', password: 'secret-123', confirmPassword: 'secret-123' }

describe('SignupFormSchema', () => {
  it('normalizes the email', () => {
    const result = SignupFormSchema.parse(valid)
    expect(result.email).toBe('alice@example.com')
  })

  it('requires a strong password', () => {
    const result = SignupFormSchema.safeParse({ ...valid, password: 'short', confirmPassword: 'short' })
    expect(result.success).toBe(false)
  })

  it('reports mismatched passwords on confirmPassword', () => {
    const result = SignupFormSchema.safeParse({ ...valid, confirmPassword: 'different-1!' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['confirmPassword'])
  })

  it('ignores any role sent by the client', () => {
    const result = SignupFormSchema.parse({ ...valid, role: 'admin' })
    expect(result).not.toHaveProperty('role')
  })
})

describe('LoginFormSchema', () => {
  it('rejects invalid emails', () => {
    expect(LoginFormSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false)
  })
})

describe('UpdatePasswordFormSchema', () => {
  it('accepts matching strong passwords', () => {
    expect(UpdatePasswordFormSchema.safeParse({ password: 'abc123!xyz', confirmPassword: 'abc123!xyz' }).success).toBe(true)
  })
})
