import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";

export function QueryState({ loading, error, retry }: {
  loading?: boolean; error?: unknown; retry?: () => void;
}) {
  if (loading) return <p role="status" className="p-6 text-gray-600">Loading cloud records...</p>;
  if (!error) return null;
  return <div role="alert" className="rounded border border-red-200 bg-red-50 p-4 space-y-3">
    <p className="text-red-700">{errorMessage(error, "Could not load records. Please try again.")}</p>
    {retry && <Button variant="outline" onClick={retry}>Retry</Button>}
  </div>;
}
