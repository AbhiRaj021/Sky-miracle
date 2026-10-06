import { describe, expect, it } from 'vitest'
import { safeRedirectPath } from './redirect'

describe('safeRedirectPath', () => {
  it('allows same-origin paths', () => {
    expect(safeRedirectPath('/update-password')).toBe('/update-password')
    expect(safeRedirectPath('/dashboard/files/1?x=1')).toBe('/dashboard/files/1?x=1')
  })

  it('falls back for anything that could leave the site', () => {
    for (const path of ['@evil.com', 'https://evil.com', '//evil.com', '/\\evil.com', '/\t/evil.com', '', null]) {
      expect(safeRedirectPath(path)).toBe('/dashboard')
    }
  })
})
