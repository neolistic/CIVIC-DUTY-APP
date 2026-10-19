import { Navigate } from "react-router-dom";
import { getValidToken } from "../utils/auth";

function ProtectedRoute({ children }) {
  const token = getValidToken();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
