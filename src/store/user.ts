import { type NotificationTpes } from '@/lib/types'
import { create } from 'zustand'

type State = {
  id : string
  name: string
  email: string
  token: string
  avatar?: string
  isPro? : boolean
  notifications? : NotificationTpes[]
  setUser: (userData: Partial<State>) => void
}

type Action = {
  updateUser: (data: Partial<State>) => void
}

export const usePersonStore = create<State & Action>((set) => ({
  id : '',
  name: '',
  email: '',
  token: '',
  avatar: '',
  isPro : false,
  notifications : [],
  setUser: (userData) => set(() => ({ ...userData })),
  updateUser: (data) => set((state) => ({ ...state, ...data })),
}))
