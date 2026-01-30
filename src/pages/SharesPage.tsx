import { SharesList } from '../components/shares/SharesList'

export function SharesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 animate-fade-in">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/30 px-4 py-4">
          <h2 className="text-base font-medium">Shared Items</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your public share links
          </p>
        </div>
        <SharesList />
      </div>
    </div>
  )
}
