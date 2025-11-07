import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

function ProtectedRoute() {
  const { user, loading, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // if (!user) {
  //   console.log("user non esiste!,", user);

  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }
  if (!token) {
    console.log("user non esiste!,", user);

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
