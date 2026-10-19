import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await api.get("/issues/employee");
        setEmployeeData(response.data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeData();
  }, []);

  useEffect(() => {
    document.title = "Employee Dashboard - Civic Issues Reporting";
  }, []);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const response = await api.patch(`/issues/${issueId}/status`, {
        status: newStatus,
      });

      setEmployeeData((prevData) => ({
        ...prevData,
        issues: prevData.issues.map((issue) =>
          issue._id === issueId
            ? { ...issue, status: newStatus, selectedStatus: newStatus }
            : issue,
        ),
      }));

      console.log("Status updated:", response.data);
    } catch (error) {
      console.log(error.response?.data);
      console.log(error.response?.status);
    }
  };

  const handleSelectedStatusChange = (issueId, newStatus) => {
    setEmployeeData((prevData) => ({
      ...prevData,
      issues: prevData.issues.map((issue) =>
        issue._id === issueId ? { ...issue, selectedStatus: newStatus } : issue,
      ),
    }));
  };

  const handleViewDetails = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  return (
    <div className="page-shell">
      <Navbar />
      <section className="hero">
        <span className="tag">Employee workspace</span>
        <h1 className="page-title">Employee Dashboard</h1>
        <p className="subtext">
          Manage assigned reports and update their progress from one clean
          workspace.
        </p>
      </section>

      {employeeData ? (
        <div className="panel">
          <h2>My Issues</h2>

          <ul className="content-list">
            {employeeData.issues.map((issue) => (
              <li key={issue._id} className="issue-card">
                <header>
                  <div>
                    <span className="tag">{issue.status}</span>
                    <h3>{issue.title}</h3>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => handleViewDetails(issue._id)}
                  >
                    View Details
                  </button>
                </header>
                <p className="muted">{issue.description}</p>

                <div className="toolbar">
                  <div className="field-group" style={{ minWidth: "220px" }}>
                    <label>Update status</label>
                    <select
                      value={issue.selectedStatus || issue.status}
                      onChange={(e) =>
                        handleSelectedStatusChange(issue._id, e.target.value)
                      }
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
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
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="empty-state">
          <h2>Loading your assigned issues</h2>
          <p className="empty-copy">
            Your work queue will appear here shortly.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
