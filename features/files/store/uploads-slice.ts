import { createEntityAdapter, createSelector, createSlice, type EntityState, type PayloadAction } from '@reduxjs/toolkit'
import { sessionCleared } from '@/features/auth/store/session-slice'

/** Where an upload goes: a brand-new file, or a new version of an existing one. */
export type UploadTarget = { kind: 'new' } | { kind: 'version'; fileId: string; changeSummary?: string }

export type UploadStatus = 'uploading' | 'registering' | 'done' | 'error'

export type Upload = {
  id: string
  fileName: string
  size: number
  /** "new" for new files, otherwise the id of the file receiving a version. */
  targetKey: string
  status: UploadStatus
  error?: string
  fileId?: string
  version?: number
  startedAt: number
}

export const targetKeyOf = (target: UploadTarget) => (target.kind === 'new' ? 'new' : target.fileId)

const uploadsAdapter = createEntityAdapter<Upload, string>({
  selectId: (upload) => upload.id,
  sortComparer: (a, b) => b.startedAt - a.startedAt,
})

const uploadsSlice = createSlice({
  name: 'uploads',
  initialState: uploadsAdapter.getInitialState(),
  reducers: {
    uploadStarted(
      state,
      action: PayloadAction<{ id: string; fileName: string; size: number; targetKey: string; startedAt: number }>,
    ) {
      uploadsAdapter.addOne(state, { ...action.payload, status: 'uploading' })
    },
    uploadRegistering(state, action: PayloadAction<string>) {
      uploadsAdapter.updateOne(state, { id: action.payload, changes: { status: 'registering' } })
    },
    uploadSucceeded(state, action: PayloadAction<{ id: string; fileId: string; version: number }>) {
      const { id, ...changes } = action.payload
      uploadsAdapter.updateOne(state, { id, changes: { ...changes, status: 'done' } })
    },
    uploadFailed(state, action: PayloadAction<{ id: string; error: string }>) {
      const { id, error } = action.payload
      uploadsAdapter.updateOne(state, { id, changes: { status: 'error', error } })
    },
    uploadDismissed(state, action: PayloadAction<string>) {
      uploadsAdapter.removeOne(state, action.payload)
    },
    finishedUploadsCleared(state, action: PayloadAction<string>) {
      const finished = Object.values(state.entities)
        .filter((u) => u.targetKey === action.payload && (u.status === 'done' || u.status === 'error'))
        .map((u) => u.id)
      uploadsAdapter.removeMany(state, finished)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionCleared, () => uploadsAdapter.getInitialState())
  },
})

export const {
  uploadStarted,
  uploadRegistering,
  uploadSucceeded,
  uploadFailed,
  uploadDismissed,
  finishedUploadsCleared,
} = uploadsSlice.actions

const adapterSelectors = uploadsAdapter.getSelectors(
  (state: { uploads: EntityState<Upload, string> }) => state.uploads,
)

export const selectAllUploads = adapterSelectors.selectAll

export const selectUploadsForTarget = createSelector(
  [adapterSelectors.selectAll, (_state: unknown, targetKey: string) => targetKey],
  (uploads, targetKey) => uploads.filter((upload) => upload.targetKey === targetKey),
)

export default uploadsSlice
