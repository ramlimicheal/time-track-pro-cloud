import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
};
