import { useTheme } from '../hooks/useTheme'

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'VideoHub'

export default function Header() {
  const { theme, toggle } = useTheme()

  // Split sitename: last char gets accent color
  const main = SITE_NAME.slice(0, -3)
  const tail = SITE_NAME.slice(-3)

  return (
    <header className="header">
      <div className="header-sitename">
        {main}<span>{tail}</span>
      </div>

      <div className="theme-toggle-wrap">
        <span className="theme-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        />
      </div>
    </header>
  )
}
