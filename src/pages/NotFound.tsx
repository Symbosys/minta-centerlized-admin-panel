import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";

const NotFound = () => {
  const location = useLocation();
  const { currentConfig } = usePlatform();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Module Coming Soon</h1>
      <p className="text-sm text-muted-foreground max-w-md mt-2">
        The page <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{location.pathname}</code> is currently being migrated to the centralized {currentConfig.name} panel.
      </p>
      <div className="mt-6">
        <Button asChild variant="default">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

