
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const PageLoader = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
      </div>
    </div>
  );
};
