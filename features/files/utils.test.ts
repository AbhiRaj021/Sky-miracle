import { describe, expect, it } from 'vitest'
import { MAX_FILE_SIZE } from './constants'
import { buildStoragePath, getFileType, parseStoragePath, validateUpload, versionedFileName } from './utils'

const USER = '11111111-1111-4111-8111-111111111111'

describe('getFileType', () => {
  it('recognizes supported extensions case-insensitively', () => {
    expect(getFileType('a.pdf')).toBe('pdf')
    expect(getFileType('Report.DOCX')).toBe('docx')
    expect(getFileType('sheet.final.xlsx')).toBe('xlsx')
  })

  it('rejects everything else', () => {
    expect(getFileType('a.doc')).toBeNull()
    expect(getFileType('pdf')).toBeNull()
    expect(getFileType('a.pdf.exe')).toBeNull()
  })
})

describe('storage paths', () => {
  it('round-trips a built path', () => {
    const path = buildStoragePath(USER, 'docx')
    expect(parseStoragePath(path)).toEqual({ userId: USER, fileType: 'docx' })
  })

  it('rejects traversal and malformed paths', () => {
    expect(parseStoragePath(`${USER}/../x.pdf`)).toBeNull()
    expect(parseStoragePath(`${USER}/not-a-uuid.pdf`)).toBeNull()
    expect(parseStoragePath(`other/${USER}.pdf`)).toBeNull()
    expect(parseStoragePath(`${USER}/${USER}.exe`)).toBeNull()
    expect(parseStoragePath(`${USER}/a/${USER}.pdf`)).toBeNull()
  })
})

describe('validateUpload', () => {
  it('accepts a valid file', () => {
    expect(validateUpload({ name: 'a.pdf', size: 100 })).toBeNull()
  })

  it('rejects bad types, empty and oversized files', () => {
    expect(validateUpload({ name: 'a.png', size: 100 })).toMatch(/Only PDF/)
    expect(validateUpload({ name: 'a.pdf', size: 0 })).toMatch(/empty/)
    expect(validateUpload({ name: 'a.pdf', size: MAX_FILE_SIZE + 1 })).toMatch(/25 MB or smaller/)
  })

  it('enforces the required type for new versions', () => {
    expect(validateUpload({ name: 'a.docx', size: 100 }, 'pdf')).toMatch(/PDF \(\.pdf\)/)
    expect(validateUpload({ name: 'a.pdf', size: 100 }, 'pdf')).toBeNull()
  })
})

describe('versionedFileName', () => {
  it('inserts the version before the extension', () => {
    expect(versionedFileName('Report.pdf', 2)).toBe('Report (v2).pdf')
    expect(versionedFileName('a.b.xlsx', 3)).toBe('a.b (v3).xlsx')
    expect(versionedFileName('noext', 4)).toBe('noext (v4)')
  })
})
