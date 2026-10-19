import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";

// Main application router.
// Protected routes require authentication and some screens also require role checks.
import Register from "./pages/Register";
import Home from "./pages/Home";
import Unauthorized from "./pages/Unauthorized";
import IssueDetails from "./pages/IssueDetails";
import Notifications from "./pages/Notifications";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CreateIssues from "./pages/CreateIssues";
import MyIssues from "./pages/MyIssues";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-issue"
            element={
              <ProtectedRoute>
                <CreateIssues />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/issues/:issueId"
            element={
              <ProtectedRoute>
                <IssueDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-issues"
            element={
              <ProtectedRoute>
                <MyIssues />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organization-dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute
                  allowedRoles={["organization"]}
                  allowedOrganizationRoles={["admin", "manager"]}
                >
                  <OrganizationDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute
                  allowedRoles={["organization"]}
                  allowedOrganizationRoles={["employee"]}
                >
                  <EmployeeDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/unauthorized"
            element={
              <ProtectedRoute>
                <Unauthorized />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
