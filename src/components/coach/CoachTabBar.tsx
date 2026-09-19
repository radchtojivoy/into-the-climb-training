import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

export function CoachTabBar() {
  return (
    <nav className="tabbar" aria-label="Навігація">
      <NavLink to="/coach/library" className={({ isActive }) => `tab${isActive ? ' on' : ''}`} end={false}>
        <Icon name="lib" />
        <span>Бібліотека</span>
      </NavLink>
      <NavLink to="/coach/materials" className={({ isActive }) => `tab${isActive ? ' on' : ''}`}>
        <Icon name="book" />
        <span>Матеріали</span>
      </NavLink>
      <NavLink to="/coach" end className={({ isActive }) => `tab${isActive ? ' on' : ''}`}>
        <Icon name="home" />
        <span>Дашборд</span>
      </NavLink>
    </nav>
  )
}
