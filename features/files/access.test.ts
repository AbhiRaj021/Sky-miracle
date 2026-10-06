import { describe, expect, it } from 'vitest'
import { getFileAccess } from './access'

const me = 'me'
const ownFile = { uploaded_by: me }
const otherFile = { uploaded_by: 'someone-else' }

describe('getFileAccess', () => {
  it('gives admins everything', () => {
    expect(getFileAccess({ id: me, role: 'admin' }, otherFile, undefined)).toMatchObject({
      canEdit: true,
      canManage: true,
      canDelete: true,
      label: 'admin',
    })
  })

  it('lets editors edit and share their own files, but not delete', () => {
    expect(getFileAccess({ id: me, role: 'editor' }, ownFile, undefined)).toMatchObject({
      isOwner: true,
      canEdit: true,
      canManage: true,
      canDelete: false,
      label: 'owner',
    })
  })

  it('lets editors edit shared files only with an edit grant', () => {
    expect(getFileAccess({ id: me, role: 'editor' }, otherFile, 'edit')).toMatchObject({
      canEdit: true,
      canManage: false,
      label: 'can edit',
    })
    expect(getFileAccess({ id: me, role: 'editor' }, otherFile, 'view')).toMatchObject({
      canEdit: false,
      label: 'can view',
    })
  })

  it('treats the viewer role as a ceiling', () => {
    expect(getFileAccess({ id: me, role: 'viewer' }, otherFile, 'edit')).toMatchObject({
      canEdit: false,
      canManage: false,
      label: 'can view',
    })
  })

  it('handles files whose uploader was deleted', () => {
    expect(getFileAccess({ id: me, role: 'editor' }, { uploaded_by: null }, undefined).isOwner).toBe(false)
  })
})
