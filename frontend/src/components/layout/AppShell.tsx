import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { BackgroundMesh } from './BackgroundMesh'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CommandPalette } from './CommandPalette'

export function AppShell() {
  return (
    <div className="min-h-screen">
      <BackgroundMesh />
      <Sidebar />
      <div className="md:pl-60">
        <Topbar />
        <main className="mx-4 my-6 md:mx-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
      <Toaster richColors position="top-right" theme="dark" />
    </div>
  )
}
