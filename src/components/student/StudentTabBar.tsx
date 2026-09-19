import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

export function StudentTabBar() {
  return (
    <nav className="tabbar" aria-label="Навігація">
      <NavLink to="/calendar" end className={({ isActive }) => `tab${isActive ? ' on' : ''}`}>
        <Icon name="cal" />
        <span>Календар</span>
      </NavLink>
      <NavLink to="/materials" className={({ isActive }) => `tab${isActive ? ' on' : ''}`}>
        <Icon name="book" />
        <span>Матеріали</span>
      </NavLink>
      <NavLink to="/dashboard" className={({ isActive }) => `tab${isActive ? ' on' : ''}`}>
        <Icon name="home" />
        <span>Дашборд</span>
      </NavLink>
    </nav>
  )
}
