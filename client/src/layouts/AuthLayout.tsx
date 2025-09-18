import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAppSelector } from "@/hooks/useRedux";
import { Loader2 } from "lucide-react";

export function AuthLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, accessToken, navigate]);

  if (!isAuthenticated || !accessToken) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
