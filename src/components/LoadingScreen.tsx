import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium">Loading your data...</p>
      </div>
    </div>
  );
}

export function ErrorScreen({ error }: { error: Error }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 max-w-md mx-4 text-center">
        <div className="p-3 rounded-full bg-destructive/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-destructive"
          >
            <path d="M12 8v4M12 16h.01" />
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Error Loading Data</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
} 