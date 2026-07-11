/*
 * Global loading state.
 * Shown while Server Components are fetching data.
 */

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-light border-t-primary"></div>
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}
