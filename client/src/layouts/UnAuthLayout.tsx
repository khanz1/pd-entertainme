import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAppSelector } from "@/hooks/useRedux";

export function UnAuthLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, accessToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Outlet />
    </div>
  );
}
