import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { RootState } from "@/store";
import { logout } from "@/features/auth/auth.slice";

export const useAuthError = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const wasAuthenticated = localStorage.getItem("wasAuthenticated");

    if (wasAuthenticated === "true" && !isAuthenticated) {
      localStorage.removeItem("wasAuthenticated");
      dispatch(logout());
      toast.error("Your session has expired. Please log in again.");
    }

    if (isAuthenticated) {
      localStorage.setItem("wasAuthenticated", "true");
    } else {
      localStorage.removeItem("wasAuthenticated");
    }
  }, [isAuthenticated]);

  const handleAuthError = () => {
    if (!isAuthenticated) {
      dispatch(logout());
      toast.error("Please log in to access this feature");
      navigate("/login");
      return true;
    }

    if (!accessToken) {
      dispatch(logout());
      toast.error("Your session has expired. Please log in again.");
      navigate("/login");
      return true;
    }

    return false;
  };

  const requireAuth = (callback: () => void) => {
    if (handleAuthError()) return;
    callback();
  };

  return {
    isAuthenticated,
    handleAuthError,
    requireAuth,
  };
};
