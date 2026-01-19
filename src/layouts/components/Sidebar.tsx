import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { useCapabilities } from '../../contexts/CapabilityContext'
import type { FeatureModule, MenuItem } from '../../types'

type SidebarProps = {
  modules: FeatureModule[]
  collapsed?: boolean
  onToggle?: () => void
}

function MenuItemLink({ item, collapsed }: { item: MenuItem; collapsed?: boolean }) {
  const { hasModule, hasFeature } = useCapabilities()

  const hasAccess = !item.requiredCapabilities || item.requiredCapabilities.every(
    (cap) => hasModule(cap) || hasFeature(cap)
  )

  if (!hasAccess || !item.path) {
    return null
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        clsx('shell-sidebar-link', { active: isActive, collapsed })
      }
      title={collapsed ? item.label : undefined}
    >
      {item.icon && <item.icon className="shell-sidebar-link-icon" />}
      {!collapsed && <span className="shell-sidebar-link-label">{item.label}</span>}
    </NavLink>
  )
}

export function Sidebar({ modules, collapsed = false, onToggle }: SidebarProps) {
  return (
    <aside className={clsx('shell-sidebar', { collapsed })}>
      <button
        type="button"
        onClick={onToggle}
        className="shell-sidebar-toggle"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '→' : '←'}
      </button>

      <nav className="shell-sidebar-nav">
        {modules.map((module) => (
          <div key={module.id} className="shell-sidebar-section">
            {!collapsed && (
              <span className="shell-sidebar-section-title">{module.name}</span>
            )}
            <ul className="shell-sidebar-menu">
              {module.menuItems.map((item) => (
                <li key={item.path || item.label}>
                  <MenuItemLink item={item} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
