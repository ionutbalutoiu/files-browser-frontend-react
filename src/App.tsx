import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { ToastProvider } from './providers/ToastProvider'
import { TooltipProvider } from './components/ui/Tooltip'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BrowserPage } from './pages/BrowserPage'
import { SharesPage } from './pages/SharesPage'
import { ThemeToggle } from './components/ThemeToggle'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
      }`}
    >
      {children}
    </Link>
  )
}

function AppContent() {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-semibold tracking-tight text-foreground/90">
              File Browser
            </h1>
            <nav className="flex items-center gap-1">
              <NavLink to="/browse">Files</NavLink>
              <NavLink to="/shares">Shares</NavLink>
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
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </QueryProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
