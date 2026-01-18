
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
};
