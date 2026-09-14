import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-50/50">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" className="text-blue-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
};
