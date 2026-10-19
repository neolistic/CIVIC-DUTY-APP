import api from "../api";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrganizations, setSelectedOrganizations] = useState({});
  const [actionMessage, setActionMessage] = useState("");
  const [actionStatus, setActionStatus] = useState("success");
  const [organizationForm, setOrganizationForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "roads",
    address: "",
    description: "",
  });
  const [employeeForm, setEmployeeForm] = useState({
    organizationId: "",
    email: "",
    organizationRole: "employee",
  });
  const [editingOrganizationId, setEditingOrganizationId] = useState("");
  const [editingOrganizationForm, setEditingOrganizationForm] = useState({});

  useEffect(() => {
    document.title = "Admin Dashboard - Civic Issues Reporting";
  }, []);

  const loadDashboardData = async () => {
    const [usersResponse, organizationsResponse, issuesResponse] =
      await Promise.all([
        api.get("/issues/allusers"),
        api.get("/issues/allorganizations"),
        api.get("/issues/organization"),
      ]);

    setUsers(usersResponse.data.users);
    setOrganizations(organizationsResponse.data.organizations);
    setIssues(issuesResponse.data.issues);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await loadDashboardData();
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        setError(
          error.response?.data?.error || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleOrganizationSelect = (issueId, organizationId) => {
    setSelectedOrganizations((prev) => ({
      ...prev,
      [issueId]: organizationId,
    }));
  };

  const handleOrganizationFormChange = (field, value) => {
    setOrganizationForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmployeeFormChange = (field, value) => {
    setEmployeeForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const beginOrganizationEdit = (organization) => {
    setEditingOrganizationId(organization._id);
    setEditingOrganizationForm({
      name: organization.name || "",
      email: organization.email || "",
      phone: organization.phone || "",
      category: organization.category || "roads",
      address: organization.address || "",
      description: organization.description || "",
    });
  };

  const cancelOrganizationEdit = () => {
    setEditingOrganizationId("");
    setEditingOrganizationForm({});
  };

  const handleEditingOrganizationChange = (field, value) => {
    setEditingOrganizationForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateOrganization = async (organizationId) => {
    try {
      const response = await api.put(
        `/admin/organizations/${organizationId}`,
        editingOrganizationForm,
      );

      setOrganizations((prevOrganizations) =>
        prevOrganizations.map((organization) =>
          organization._id === organizationId
            ? response.data.organization
            : organization,
        ),
      );
      setActionStatus("success");
      setActionMessage("Organization updated successfully.");
      cancelOrganizationEdit();
    } catch (updateError) {
      console.error("Error updating organization:", updateError);
      setActionStatus("error");
      setActionMessage(
        updateError.response?.data?.error || "Failed to update organization.",
      );
    }
  };

  const handleDeleteOrganization = async (organizationId) => {
    const confirmDelete = window.confirm(
      "Delete this organization? Existing users will remain in the system.",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/admin/organizations/${organizationId}`);
      setOrganizations((prevOrganizations) =>
        prevOrganizations.filter(
          (organization) => organization._id !== organizationId,
        ),
      );
      setActionStatus("success");
      setActionMessage("Organization deleted successfully.");
    } catch (deleteError) {
      console.error("Error deleting organization:", deleteError);
      setActionStatus("error");
      setActionMessage(
        deleteError.response?.data?.error || "Failed to delete organization.",
      );
    }
  };

  const handleCreateOrganization = async (event) => {
    event.preventDefault();
    setActionMessage("");

    try {
      const response = await api.post("/admin/organizations", organizationForm);
      setOrganizations((prevOrganizations) => [
        ...prevOrganizations,
        response.data.organization,
      ]);
      setOrganizationForm({
        name: "",
        email: "",
        phone: "",
        category: "roads",
        address: "",
        description: "",
      });
      setActionStatus("success");
      setActionMessage("Organization created successfully.");
    } catch (createError) {
      console.error("Error creating organization:", createError);
      setActionStatus("error");
      setActionMessage(
        createError.response?.data?.error || "Failed to create organization.",
      );
    }
  };

  const handleAddEmployee = async (event) => {
    event.preventDefault();
    setActionMessage("");

    if (!employeeForm.organizationId) {
      setActionStatus("error");
      setActionMessage("Select an organization before adding an employee.");
      return;
    }

    try {
      await api.put(`/organizations/${employeeForm.organizationId}/employees`, {
        email: employeeForm.email,
        organizationRole: employeeForm.organizationRole,
      });

      setEmployeeForm({
        organizationId: "",
        email: "",
        organizationRole: "employee",
      });
      await loadDashboardData();
      setActionStatus("success");
      setActionMessage("Employee added to organization successfully.");
    } catch (employeeError) {
      console.error("Error adding employee:", employeeError);
      setActionStatus("error");
      setActionMessage(
        employeeError.response?.data?.message ||
          employeeError.response?.data?.error ||
          "Failed to add employee.",
      );
    }
  };

  const handleForwardIssue = async (issueId) => {
    const organizationId = selectedOrganizations[issueId];

    if (!organizationId) {
      setActionMessage("Select an organization before forwarding an issue.");
      return;
    }

    try {
      const response = await api.put(`/issues/${issueId}/assign`, {
        assignedOrganization: organizationId,
      });

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId ? response.data.issue : issue,
        ),
      );
      setActionMessage("Issue forwarded successfully.");
    } catch (forwardError) {
      console.error("Error forwarding issue:", forwardError);
      setActionMessage(
        forwardError.response?.data?.error || "Failed to forward issue.",
      );
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="panel">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="panel">
          <h1>Admin Dashboard</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      <section className="hero">
        <span className="tag">System overview</span>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="subtext">
          Review platform usage, organizations, and issue activity from one
          control center.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Overview</h2>
            <p className="muted">
              High-level platform activity and account counts.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{users.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Organizations</p>
            <p className="stat-value">{organizations.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Issues</p>
            <p className="stat-value">{issues.length}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Organization Tools</h2>
            <p className="muted">
              Create organizations and add employees to a team.
            </p>
          </div>
        </div>

        {actionMessage && (
          <p className={`form-banner form-banner--${actionStatus}`}>
            {actionMessage}
          </p>
        )}

        <div className="summary-grid">
          <form className="issue-card" onSubmit={handleCreateOrganization}>
            <h3>Create organization</h3>
            <div className="stack-form">
              <div className="field-group">
                <label>Name</label>
                <input
                  value={organizationForm.name}
                  onChange={(e) =>
                    handleOrganizationFormChange("name", e.target.value)
                  }
                  placeholder="Organization name"
                />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input
                  type="email"
                  value={organizationForm.email}
                  onChange={(e) =>
                    handleOrganizationFormChange("email", e.target.value)
                  }
                  placeholder="contact@organization.org"
                />
              </div>
              <div className="field-group">
                <label>Phone</label>
                <input
                  value={organizationForm.phone}
                  onChange={(e) =>
                    handleOrganizationFormChange("phone", e.target.value)
                  }
                  placeholder="Phone number"
                />
              </div>
              <div className="field-group">
                <label>Category</label>
                <select
                  value={organizationForm.category}
                  onChange={(e) =>
                    handleOrganizationFormChange("category", e.target.value)
                  }
                >
                  <option value="roads">Roads</option>
                  <option value="streetlights">Streetlights</option>
                  <option value="garbage">Garbage</option>
                  <option value="water">Water</option>
                  <option value="drainage">Drainage</option>
                  <option value="traffic">Traffic</option>
                  <option value="public_spaces">Public spaces</option>
                  <option value="parks">Parks</option>
                  <option value="public_property">Public property</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="field-group">
                <label>Address</label>
                <input
                  value={organizationForm.address}
                  onChange={(e) =>
                    handleOrganizationFormChange("address", e.target.value)
                  }
                  placeholder="Organization address"
                />
              </div>
              <div className="field-group">
                <label>Description</label>
                <textarea
                  value={organizationForm.description}
                  onChange={(e) =>
                    handleOrganizationFormChange("description", e.target.value)
                  }
                  placeholder="Short description"
                />
              </div>
              <button className="primary-button" type="submit">
                Create Organization
              </button>
            </div>
          </form>

          <form className="issue-card" onSubmit={handleAddEmployee}>
            <h3>Add employee to organization</h3>
            <div className="stack-form">
              <div className="field-group">
                <label>Organization</label>
                <select
                  value={employeeForm.organizationId}
                  onChange={(e) =>
                    handleEmployeeFormChange("organizationId", e.target.value)
                  }
                >
                  <option value="">Select an organization</option>
                  {organizations.map((organization) => (
                    <option key={organization._id} value={organization._id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>Employee email</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) =>
                    handleEmployeeFormChange("email", e.target.value)
                  }
                  placeholder="employee@example.com"
                />
              </div>
              <div className="field-group">
                <label>Role</label>
                <select
                  value={employeeForm.organizationRole}
                  onChange={(e) =>
                    handleEmployeeFormChange("organizationRole", e.target.value)
                  }
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <button className="primary-button" type="submit">
                Add Employee
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel">
        <h2>All Users</h2>

        {users.length === 0 ? (
          <p className="muted">No users found.</p>
        ) : (
          <ul className="content-list">
            {users.map((user) => (
              <li key={user._id} className="issue-card">
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                {user.organization && (
                  <p>
                    Organization:{" "}
                    {typeof user.organization === "object"
                      ? user.organization.name || user.organization._id
                      : user.organization}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>All Organizations</h2>

        {organizations.length === 0 ? (
          <p className="muted">No organizations found.</p>
        ) : (
          <ul className="content-list">
            {organizations.map((organization) => (
              <li key={organization._id} className="issue-card">
                <p>Name: {organization.name}</p>
                <p>Email: {organization.email}</p>
                <p>Phone: {organization.phone || "Not provided"}</p>
                <p>Category: {organization.category}</p>
                <p>Address: {organization.address}</p>
                {organization.description && <p>{organization.description}</p>}
                <div className="toolbar">
                  <button
                    className="secondary-button"
                    onClick={() => beginOrganizationEdit(organization)}
                  >
                    Edit
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => handleDeleteOrganization(organization._id)}
                  >
                    Delete
                  </button>
                </div>
                {editingOrganizationId === organization._id && (
                  <div className="panel" style={{ marginTop: "1rem" }}>
                    <h4>Edit organization</h4>
                    <div className="stack-form">
                      <div className="field-group">
                        <label>Name</label>
                        <input
                          value={editingOrganizationForm.name || ""}
                          onChange={(e) =>
                            handleEditingOrganizationChange(
                              "name",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="field-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={editingOrganizationForm.email || ""}
                          onChange={(e) =>
                            handleEditingOrganizationChange(
                              "email",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="field-group">
                        <label>Phone</label>
                        <input
                          value={editingOrganizationForm.phone || ""}
                          onChange={(e) =>
                            handleEditingOrganizationChange(
                              "phone",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="field-group">
                        <label>Category</label>
                        <select
                          value={editingOrganizationForm.category || "roads"}
                          onChange={(e) =>
                            handleEditingOrganizationChange(
                              "category",
                              e.target.value,
                            )
                          }
                        >
                          <option value="roads">Roads</option>
                          <option value="streetlights">Streetlights</option>
                          <option value="garbage">Garbage</option>
                          <option value="water">Water</option>
                          <option value="drainage">Drainage</option>
                          <option value="traffic">Traffic</option>
                          <option value="public_spaces">Public spaces</option>
                          <option value="parks">Parks</option>
                          <option value="public_property">
                            Public property
                          </option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="field-group">
                        <label>Address</label>
                        <input
                          value={editingOrganizationForm.address || ""}
                          onChange={(e) =>
                            handleEditingOrganizationChange(
                              "address",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="field-group">
                        <label>Description</label>
                        <textarea
                          value={editingOrganizationForm.description || ""}
                          onChange={(e) =>
                            handleEditingOrganizationChange(
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="toolbar">
                        <button
                          className="primary-button"
                          onClick={() =>
                            handleUpdateOrganization(organization._id)
                          }
                        >
                          Save
                        </button>
                        <button
                          className="secondary-button"
                          onClick={cancelOrganizationEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>All Issues</h2>

        {actionMessage && <p className="muted">{actionMessage}</p>}

        {issues.length === 0 ? (
          <p className="muted">No issues found.</p>
        ) : (
          <ul className="content-list">
            {issues.map((issue) => (
              <li key={issue._id} className="issue-card">
                <h3>{issue.title}</h3>
                <p>Category: {issue.category}</p>
                <p>Status: {issue.status}</p>
                <p>Address: {issue.address || "Not provided"}</p>
                <div className="field-group" style={{ marginTop: "1rem" }}>
                  <label>Forward to organization</label>
                  <select
                    value={selectedOrganizations[issue._id] || ""}
                    onChange={(e) =>
                      handleOrganizationSelect(issue._id, e.target.value)
                    }
                  >
                    <option value="">Select an organization</option>
                    {organizations.map((organization) => (
                      <option key={organization._id} value={organization._id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="primary-button"
                  style={{ marginTop: "1rem" }}
                  onClick={() => handleForwardIssue(issue._id)}
                >
                  Forward Issue
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
