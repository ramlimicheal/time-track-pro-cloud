import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";

export function AccountAccessNotice() {
  const { profileError, refreshProfile, signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md">
        <CardHeader><CardTitle>Account access unavailable</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p role="alert">{profileError ?? "Your account is not ready. Contact your administrator."}</p>
          <div className="flex gap-2">
            <Button onClick={() => void refreshProfile()}>Try again</Button>
            <Button variant="outline" onClick={() => void signOut().catch(error => toast.error(errorMessage(error)))}>
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
