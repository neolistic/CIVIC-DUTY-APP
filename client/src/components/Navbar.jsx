import { NavLink, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext";
import { getDecodedToken } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const decodedToken = getDecodedToken();
  const role = decodedToken?.role;
  const organizationRole = decodedToken?.organizationRole;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar-shell">
      <button
        type="button"
        className="navbar-brand"
        onClick={() => navigate("/")}
        aria-label="Go to home"
      >
        <div className="navbar-mark">CD</div>
        <div>
          <p className="navbar-eyebrow">Civic reporting platform</p>
          <h1 className="navbar-title">Civic Duty</h1>
        </div>
      </button>

      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/create-issue"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Report Issue
        </NavLink>
        <NavLink
          to="/my-issues"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          My Issues
        </NavLink>
        <button
          className="nav-link nav-button"
          onClick={() => navigate("/notifications")}
        >
          Notifications
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>

        {role === "admin" && (
          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Admin
          </NavLink>
        )}

        {role === "organization" && organizationRole === "admin" && (
          <NavLink
            to="/organization-dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Organization
          </NavLink>
        )}

        {role === "organization" && organizationRole === "employee" && (
          <NavLink
            to="/employee-dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Employee
          </NavLink>
        )}
      </div>

      <div className="navbar-actions">
        <button className="ghost-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
