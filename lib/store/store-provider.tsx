'use client'

import { useState } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from './store'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // One store per browser tab, created lazily on first render.
  const [store] = useState(makeStore)
  return <Provider store={store}>{children}</Provider>
}
