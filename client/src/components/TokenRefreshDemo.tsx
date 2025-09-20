import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Clock, RefreshCw } from "lucide-react";
import type { RootState } from "@/store";
import { useGetUserMeQuery } from "@/features/auth/auth.api";

export function TokenRefreshDemo() {
  const { isAuthenticated, accessToken } = useSelector(
    (state: RootState) => state.auth
  );
  const [lastLogin, setLastLogin] = useState<Date | null>(null);

  // Get user data to test authentication
  const { data, isLoading, error, refetch } = useGetUserMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Monitor token changes
  useEffect(() => {
    if (accessToken) {
      setLastLogin(new Date());
    }
  }, [accessToken]);

  const getTokenExpiry = (token: string | null) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "Unknown";
    return date.toLocaleTimeString();
  };

  const isTokenExpired = (token: string | null) => {
    const expiry = getTokenExpiry(token);
    return expiry ? new Date() > expiry : false;
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge variant="secondary">Not Logged In</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Login to see authentication status
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentication System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Access Token</span>
            </div>
            <Badge
              variant={isTokenExpired(accessToken) ? "destructive" : "default"}
            >
              {isTokenExpired(accessToken) ? "Expired" : "Valid"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Expires: {formatTime(getTokenExpiry(accessToken))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Note: No automatic refresh - please login again when expired
            </p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Session Status</span>
            <Badge variant={accessToken ? "default" : "secondary"}>
              {accessToken ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Last login: {formatTime(lastLogin)}</p>
            <p>Session type: Single token (no refresh)</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              "Test API Call"
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This will test if your current session is valid
          </p>
        </div>

        {error && (
          <div className="pt-2 border-t">
            <Badge variant="destructive">Error</Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Check console for details
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
