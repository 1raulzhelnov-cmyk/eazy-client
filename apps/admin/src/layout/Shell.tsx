import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function Shell() {
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="border-r bg-card/50">
        <Sidebar />
      </aside>
      <main className="min-h-screen flex flex-col">
        <Topbar />
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
