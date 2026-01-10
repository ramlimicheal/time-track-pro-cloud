import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const PageLoader = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
};
