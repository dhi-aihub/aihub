import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectLoggedIn } from "../redux/authSlice";

function ProtectedRoute() {
  const isAuthenticated = useSelector(selectLoggedIn);
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

export default ProtectedRoute;
