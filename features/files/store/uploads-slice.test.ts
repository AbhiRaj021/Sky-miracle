import { describe, expect, it } from 'vitest'
import { sessionCleared } from '@/features/auth/store/session-slice'
import { makeStore } from '@/lib/store/store'
import {
  finishedUploadsCleared,
  selectAllUploads,
  selectUploadsForTarget,
  targetKeyOf,
  uploadDismissed,
  uploadFailed,
  uploadRegistering,
  uploadStarted,
  uploadSucceeded,
} from './uploads-slice'

const start = (id: string, targetKey = 'new', startedAt = 1) =>
  uploadStarted({ id, fileName: `${id}.pdf`, size: 10, targetKey, startedAt })

describe('uploads slice', () => {
  it('tracks an upload through its lifecycle', () => {
    const store = makeStore()
    store.dispatch(start('a'))
    expect(selectAllUploads(store.getState())[0].status).toBe('uploading')

    store.dispatch(uploadRegistering('a'))
    expect(selectAllUploads(store.getState())[0].status).toBe('registering')

    store.dispatch(uploadSucceeded({ id: 'a', fileId: 'f1', version: 1 }))
    expect(selectAllUploads(store.getState())[0]).toMatchObject({ status: 'done', fileId: 'f1', version: 1 })
  })

  it('records errors', () => {
    const store = makeStore()
    store.dispatch(start('a'))
    store.dispatch(uploadFailed({ id: 'a', error: 'Too big' }))
    expect(selectAllUploads(store.getState())[0]).toMatchObject({ status: 'error', error: 'Too big' })
  })

  it('lists uploads per target, newest first', () => {
    const store = makeStore()
    store.dispatch(start('old', 'new', 1))
    store.dispatch(start('recent', 'new', 2))
    store.dispatch(start('version', 'file-1', 3))

    expect(selectUploadsForTarget(store.getState(), 'new').map((u) => u.id)).toEqual(['recent', 'old'])
    expect(selectUploadsForTarget(store.getState(), 'file-1').map((u) => u.id)).toEqual(['version'])
  })

  it('clears only finished uploads for a target', () => {
    const store = makeStore()
    store.dispatch(start('done'))
    store.dispatch(start('failed'))
    store.dispatch(start('busy'))
    store.dispatch(start('other', 'file-1'))
    store.dispatch(uploadSucceeded({ id: 'done', fileId: 'f', version: 1 }))
    store.dispatch(uploadFailed({ id: 'failed', error: 'x' }))
    store.dispatch(uploadSucceeded({ id: 'other', fileId: 'file-1', version: 2 }))

    store.dispatch(finishedUploadsCleared('new'))
    expect(selectAllUploads(store.getState()).map((u) => u.id).sort()).toEqual(['busy', 'other'])
  })

  it('dismisses single uploads and resets on sign out', () => {
    const store = makeStore()
    store.dispatch(start('a'))
    store.dispatch(start('b'))
    store.dispatch(uploadDismissed('a'))
    expect(selectAllUploads(store.getState()).map((u) => u.id)).toEqual(['b'])

    store.dispatch(sessionCleared())
    expect(selectAllUploads(store.getState())).toEqual([])
  })

  it('derives target keys', () => {
    expect(targetKeyOf({ kind: 'new' })).toBe('new')
    expect(targetKeyOf({ kind: 'version', fileId: 'abc' })).toBe('abc')
  })
})
