
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-blue-600", sizeClasses[size], className)} />
  );
};

export const LoadingOverlay = ({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        <div className="flex flex-col items-center gap-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
};
