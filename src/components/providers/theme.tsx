'use client'

import { createContext, useContext } from 'react'

export type Theme = 'light' | 'guard'
export const ThemeContext = createContext<Theme>('light')
export const useTheme = () => useContext(ThemeContext)
