import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/users', label: 'Users' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/orders', label: 'Orders' },
  { to: '/delivery', label: 'Delivery' },
  // Non-MVP
  { to: '/finance', label: 'Finance' },
  { to: '/content', label: 'Content' },
  { to: '/disputes', label: 'Disputes' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/settings', label: 'Settings' },
  { to: '/reports', label: 'Reports' },
  { to: '/comms', label: 'Comms' },
  { to: '/support', label: 'Support' },
]

export function Sidebar() {
  return (
    <div className="h-full p-4 space-y-2">
      <div className="px-2 py-1 text-sm font-semibold">Easy Admin</div>
      <nav className="flex flex-col gap-1">
        {nav.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            className={({ isActive }) =>
              cn(
                'px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground'
              )
            }
          >
            {i.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
