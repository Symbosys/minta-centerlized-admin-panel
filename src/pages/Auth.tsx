import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePlatform, PLATFORMS, type PlatformId } from "@/context/PlatformContext";
import { useAdminLogin } from "@/api/hooks/admins/admin.hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { Leaf, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isAuthenticated, setAuth } = useAuth();
  const { platform, switchPlatform, currentConfig } = usePlatform();
  const navigate = useNavigate();
  const loginMutation = useAdminLogin();

  // If already authenticated for the active platform, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handlePlatformSelect = (target: PlatformId) => {
    switchPlatform(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      loginSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return;
    }

    loginMutation.mutate(
      { email, password, platform },
      {
        onSuccess: (data) => {
          const adminData = { ...data.data };
          delete adminData.password;
          setAuth(adminData, data.token, data.platform);
          navigate("/", { replace: true });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-tr from-muted/50 via-background to-muted/30 -z-10" />

      <Card className="w-full max-w-md shadow-large border-border">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center transition-colors shadow-md text-white"
              style={{ backgroundColor: currentConfig.theme.brandHex }}
            >
              {platform === "minta-fresh" ? (
                <Leaf className="h-8 w-8" />
              ) : (
                <UtensilsCrossed className="h-8 w-8" />
              )}
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Centralized Admin Console
            </CardTitle>
            <CardDescription className="mt-1">
              Sign in to manage {currentConfig.name} operations
            </CardDescription>
          </div>

          {/* Platform Selector Segmented Control with Configured Theme Colors */}
          <div className="grid grid-cols-2 p-1 bg-muted rounded-lg border border-border">
            <button
              type="button"
              onClick={() => handlePlatformSelect("minta-fresh")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all",
                platform === "minta-fresh"
                  ? "text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={
                platform === "minta-fresh"
                  ? { backgroundColor: PLATFORMS["minta-fresh"].theme.brandHex }
                  : undefined
              }
            >
              <Leaf className="w-4 h-4" />
              <span>Minta Fresh</span>
            </button>
            <button
              type="button"
              onClick={() => handlePlatformSelect("restro")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all",
                platform === "restro"
                  ? "text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={
                platform === "restro"
                  ? { backgroundColor: PLATFORMS["restro"].theme.brandHex }
                  : undefined
              }
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Minta Restro</span>
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={platform === "minta-fresh" ? "admin@mintafresh.com" : "admin@mintarestro.com"}
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-card"
              />
            </div>
            <Button
              type="submit"
              className="w-full font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: currentConfig.theme.brandHex }}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Authenticating..." : `Sign In to ${currentConfig.name}`}
            </Button>

            <div className="text-[11px] text-center text-muted-foreground pt-2">
              Connecting to <span className="font-mono">{currentConfig.apiUrl}</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
