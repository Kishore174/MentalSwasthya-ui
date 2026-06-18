import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  console.log("ProtectedRoute:", { token, loading });

  if (loading) return null;
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};


export default ProtectedRoute;
