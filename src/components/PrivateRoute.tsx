import { Navigate } from "react-router-dom";
import { isLoggedIn } from "@/lib/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * PrivateRoute — wraps any page that requires authentication.
 * Redirects unauthenticated users to /login.
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
