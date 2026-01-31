import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { TooltipProvider } from './components/ui/Tooltip'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BrowserPage } from './pages/BrowserPage'
import { SharesPage } from './pages/SharesPage'
import { ThemeToggle } from './components/ThemeToggle'
import { NotificationContainer } from './components/notifications/NotificationContainer'
import { UploadTray } from './components/upload/UploadTray'

function NavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={`group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <span className={`transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`}>
        {icon}
      </span>
      {children}
    </Link>
  )
}

function FolderIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )
}

function AppContent() {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-md">
        <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 group cursor-default">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25">
                <svg className="h-5 w-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight transition-colors duration-200 group-hover:text-primary">
                File Browser
              </span>
            </div>
            <nav className="flex items-center gap-2">
              <NavLink to="/browse" icon={<FolderIcon />}>Files</NavLink>
              <NavLink to="/shares" icon={<ShareIcon />}>Shares</NavLink>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/browse" replace />} />
            <Route path="/browse/*" element={<BrowserPage />} />
            <Route path="/shares" element={<SharesPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <UploadTray />
      <NotificationContainer />
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
