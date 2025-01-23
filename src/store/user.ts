import { create } from 'zustand'

type State = {
  id : string
  name: string
  email: string
  token: string
  avatar?: string
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
  setUser: (userData) => set(() => ({ ...userData })),
  updateUser: (data) => set((state) => ({ ...state, ...data })),
}))
