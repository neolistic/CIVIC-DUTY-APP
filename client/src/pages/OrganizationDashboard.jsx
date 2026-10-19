import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getDecodedToken } from "../utils/auth";

function OrganizationDashboard() {
  const [issues, setIssues] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeRoles, setSelectedEmployeeRoles] = useState({});
  const [actionMessage, setActionMessage] = useState("");
  const [actionStatus, setActionStatus] = useState("success");

  const navigate = useNavigate();

  const deodedToken = getDecodedToken();
  const organizationId = deodedToken ? deodedToken.organization : null;

  useEffect(() => {
    document.title = "Organization Dashboard - Civic Issues Reporting";
  }, []);

  // On dashboard load, fetch the organization's issue list and employees.
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get(
          `/organizations/${organizationId}/employees`,
        );
        setEmployees(response.data.employees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    const fetchIssues = async () => {
      try {
        const response = await api.get("/issues/organization");
        setIssues(response.data.issues);
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
    fetchEmployees();
  }, []);

  const refreshEmployees = async () => {
    const response = await api.get(
      `/organizations/${organizationId}/employees`,
    );
    setEmployees(response.data.employees);
  };

  // Navigate to the full issue details page for a selected report.
  const handleViewIssue = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  // Update the status of an issue from the organization dashboard.
  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const response = await api.patch(`/issues/${issueId}/status`, {
        status: newStatus,
      });

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId ? response.data.issue : issue,
        ),
      );
      console.log("Issue status updated successfully:");
    } catch (error) {
      console.error("Error changing issue status:", error);
    }
  };

  // Track the chosen status in local UI state before applying it to the backend.
  const handleSelectedStatusChange = (issueId, newStatus) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue._id === issueId ? { ...issue, selectedStatus: newStatus } : issue,
      ),
    );
  };

  // Track the selected employee in local state before assigning them to an issue.
  const handleSelectEmployeeChange = (issueId, employeeId) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue._id === issueId
          ? { ...issue, selectedEmployee: employeeId }
          : issue,
      ),
    );
  };

  // Assign an employee to work on a specific report.
  const handleAssignEmployee = async (issueId, employeeId) => {
    try {
      await api.put(`/issues/${issueId}/assignemployee`, {
        assignedTo: employeeId,
      });
      setActionStatus("success");
      setActionMessage("Issue assigned to employee successfully.");

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId
            ? { ...issue, assignedTo: employeeId, status: "in_progress" }
            : issue,
        ),
      );
    } catch (error) {
      console.error("Error assigning employee to issue:", error);
      setActionStatus("error");
      setActionMessage(
        error.response?.data?.error || "Error assigning employee to issue.",
      );
    }
  };

  const handleEmployeeRoleChange = (employeeId, role) => {
    setSelectedEmployeeRoles((prev) => ({
      ...prev,
      [employeeId]: role,
    }));
  };

  const handleUpdateEmployeeRole = async (employee) => {
    try {
      const role =
        selectedEmployeeRoles[employee._id] || employee.organizationRole;
      await api.patch(`/organizations/${organizationId}/employees`, {
        email: employee.email,
        organizationRole: role,
      });
      await refreshEmployees();
      setActionStatus("success");
      setActionMessage("Employee role updated successfully.");
    } catch (error) {
      console.error("Error updating employee role:", error);
      setActionStatus("error");
      setActionMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update employee role.",
      );
    }
  };

  const handleRemoveEmployee = async (employee) => {
    const confirmRemove = window.confirm(
      `Remove ${employee.name} from this organization?`,
    );

    if (!confirmRemove) {
      return;
    }

    try {
      await api.delete(`/organizations/${organizationId}/employees`, {
        data: { email: employee.email },
      });
      await refreshEmployees();
      setActionStatus("success");
      setActionMessage("Employee removed successfully.");
    } catch (error) {
      console.error("Error removing employee:", error);
      setActionStatus("error");
      setActionMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to remove employee.",
      );
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="panel">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <section className="hero">
        <span className="tag">Organization view</span>
        <h1 className="page-title">Organization Dashboard</h1>
        <p className="subtext">
          Monitor incoming reports, assign employees, and keep work moving.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Overview</h2>
            <p className="muted">A quick snapshot of assignment activity.</p>
          </div>
        </div>

        {actionMessage && (
          <p className={`form-banner form-banner--${actionStatus}`}>
            {actionMessage}
          </p>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Issues</p>
            <p className="stat-value">{issues ? issues.length : 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Assigned</p>
            <p className="stat-value">
              {issues ? issues.filter((issue) => issue.assignedTo).length : 0}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Unassigned</p>
            <p className="stat-value">
              {issues ? issues.filter((issue) => !issue.assignedTo).length : 0}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Resolved</p>
            <p className="stat-value">
              {issues
                ? issues.filter((issue) => issue.status === "resolved").length
                : 0}
            </p>
          </div>
        </div>
      </section>

      {issues && issues.length > 0 ? (
        <ul className="content-list">
          {issues.map((issue) => (
            <li key={issue._id} className="issue-card">
              <header>
                <div>
                  <span className="tag">{issue.status}</span>
                  <h3>{issue.title}</h3>
                  <p className="muted">{issue.category}</p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => handleViewIssue(issue._id)}
                >
                  View Issue
                </button>
              </header>

              <p className="muted">{issue.description}</p>

              <div className="summary-grid">
                <div className="field-group">
                  <label>Change status</label>
                  <select
                    value={issue.selectedStatus || issue.status}
                    onChange={(e) =>
                      handleSelectedStatusChange(issue._id, e.target.value)
                    }
                  >
                    <option value="under_review">Under Review</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="rejected">Rejected</option>
                    <option value="duplicate">Duplicate</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>Assign employee</label>
                  <select
                    value={issue.selectedEmployee || ""}
                    onChange={(e) =>
                      handleSelectEmployeeChange(issue._id, e.target.value)
                    }
                  >
                    <option value="">Select an employee</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="toolbar">
                <button
                  className="primary-button"
                  onClick={() =>
                    handleStatusChange(
                      issue._id,
                      issue.selectedStatus || issue.status,
                    )
                  }
                >
                  Update Status
                </button>
                <button
                  className="primary-button"
                  onClick={() =>
                    handleAssignEmployee(issue._id, issue.selectedEmployee)
                  }
                >
                  Assign
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <h2>No issues found</h2>
          <p className="empty-copy">
            New reports will appear here as soon as they are submitted.
          </p>
        </div>
      )}

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Employees</h2>
            <p className="muted">
              Update roles or remove employees from the organization.
            </p>
          </div>
        </div>

        {employees.length === 0 ? (
          <p className="muted">No employees found.</p>
        ) : (
          <ul className="content-list">
            {employees.map((employee) => (
              <li key={employee._id} className="issue-card">
                <p>Name: {employee.name}</p>
                <p>Email: {employee.email}</p>
                <p>Role: {employee.organizationRole}</p>
                <div className="field-group" style={{ marginTop: "1rem" }}>
                  <label>Organization role</label>
                  <select
                    value={
                      selectedEmployeeRoles[employee._id] ||
                      employee.organizationRole
                    }
                    onChange={(e) =>
                      handleEmployeeRoleChange(employee._id, e.target.value)
                    }
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="toolbar">
                  <button
                    className="primary-button"
                    onClick={() => handleUpdateEmployeeRole(employee)}
                  >
                    Save Role
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => handleRemoveEmployee(employee)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default OrganizationDashboard;
