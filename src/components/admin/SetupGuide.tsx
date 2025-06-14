
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";

interface SetupGuideProps {
  onCreateFirstAdmin: () => void;
}

export const SetupGuide = ({ onCreateFirstAdmin }: SetupGuideProps) => {
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to Admin Setup</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            It looks like this is your first time accessing the admin panel. 
            Let's get you set up with your first admin account.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Create your admin account with username and password</li>
              <li>• Set up employee accounts for your team</li>
              <li>• Configure timesheet and leave management</li>
            </ul>
          </div>
          
          <Button 
            onClick={onCreateFirstAdmin}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Create Admin Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
