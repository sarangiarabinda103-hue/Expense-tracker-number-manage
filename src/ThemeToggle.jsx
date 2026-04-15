import { memo } from 'react'
import { useTheme } from './useTheme'

function ThemeToggleComponent() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}

export const ThemeToggle = memo(ThemeToggleComponent)
