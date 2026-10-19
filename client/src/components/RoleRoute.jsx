import { Navigate } from "react-router-dom";
import { getDecodedToken } from "../utils/auth";

function RoleRoute({ children, allowedRoles, allowedOrganizationRoles }) {
  const decodedToken = getDecodedToken();
  const userRole = decodedToken ? decodedToken.role : null;
  const userOrganizationRole = decodedToken
    ? decodedToken.organizationRole
    : null;

  if (userRole === "admin") {
    return children;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  if (
    allowedOrganizationRoles &&
    !allowedOrganizationRoles.includes(userOrganizationRole)
  ) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export default RoleRoute;
