import api from "../api";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function MyIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [deletingIssueId, setDeletingIssueId] = useState("");
  const [editingIssueId, setEditingIssueId] = useState("");
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    document.title = "My Issues - Civic Issues Reporting";
  }, []);

  useEffect(() => {
    const fetchMyIssues = async () => {
      try {
        const response = await api.get("/issues/user");
        setIssues(response.data.issues);
      } catch (error) {
        setStatusType("error");
        setStatusMessage(
          error.response?.data?.error ||
            "Could not load your issues right now.",
        );
        console.error("Error fetching my issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyIssues();
  }, []);

  const handleDeleteIssue = async (issueId) => {
    const confirmDelete = window.confirm(
      "Delete this issue? This action cannot be undone.",
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingIssueId(issueId);
    setStatusMessage("");

    try {
      const response = await api.delete(`/issues/${issueId}`);
      setIssues((prevIssues) =>
        prevIssues.filter((issue) => issue._id !== issueId),
      );
      setStatusType("success");
      setStatusMessage(response.data?.message || "Issue deleted successfully.");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error.response?.data?.error || "Unable to delete this issue right now.",
      );
    } finally {
      setDeletingIssueId("");
    }
  };

  const beginEditing = (issue) => {
    const [longitude = "", latitude = ""] = issue.location?.coordinates || [];

    setEditingIssueId(issue._id);
    setEditForm({
      title: issue.title || "",
      description: issue.description || "",
      category: issue.category || "roads",
      address: issue.address || "",
      longitude: String(longitude),
      latitude: String(latitude),
    });
    setStatusMessage("");
  };

  const cancelEditing = () => {
    setEditingIssueId("");
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveIssue = async (issueId) => {
    setStatusMessage("");

    try {
      const response = await api.put(`/issues/${issueId}`, editForm);

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId ? response.data.issue : issue,
        ),
      );
      setStatusType("success");
      setStatusMessage(response.data?.message || "Issue updated successfully.");
      cancelEditing();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error.response?.data?.error || "Unable to update this issue right now.",
      );
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="panel">Loading my issues...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <section className="hero">
        <span className="tag">Your reports</span>
        <h1 className="page-title">My Issues</h1>
        <p className="subtext">
          Review the issues you have submitted and check their current status.
        </p>
      </section>

      {statusMessage && (
        <p className={`form-banner form-banner--${statusType}`}>
          {statusMessage}
        </p>
      )}

      {issues.length === 0 ? (
        <div className="empty-state">
          <h2>No issues reported yet</h2>
          <p className="empty-copy">
            When you submit an issue, it will appear here with status updates
            and upvote counts.
          </p>
        </div>
      ) : (
        <ul className="content-list">
          {issues.map((issue) => (
            <li key={issue._id} className="issue-card">
              <header>
                <div>
                  <span className="tag">{issue.status}</span>
                  <h3>{issue.title}</h3>
                </div>
                <span className="status-pill">
                  {issue.upvotes.length} upvotes
                </span>
              </header>
              <p className="muted">{issue.description}</p>
              <div className="summary-grid">
                <div>
                  <p className="stat-label">Category</p>
                  <p className="stat-value" style={{ fontSize: "1rem" }}>
                    {issue.category}
                  </p>
                </div>
                <div>
                  <p className="stat-label">Address</p>
                  <p className="stat-value" style={{ fontSize: "1rem" }}>
                    {issue.address}
                  </p>
                </div>
              </div>
              <div className="toolbar">
                {issue.status === "reported" ||
                issue.status === "under_review" ? (
                  <button
                    className="secondary-button"
                    onClick={() => beginEditing(issue)}
                  >
                    Edit Issue
                  </button>
                ) : null}
                <button
                  className="ghost-button"
                  onClick={() => handleDeleteIssue(issue._id)}
                  disabled={deletingIssueId === issue._id}
                >
                  {deletingIssueId === issue._id
                    ? "Deleting..."
                    : "Delete Issue"}
                </button>
              </div>

              {editingIssueId === issue._id && (
                <div className="panel" style={{ marginTop: "1rem" }}>
                  <h4>Edit issue</h4>
                  <div className="stack-form">
                    <div className="field-group">
                      <label>Title</label>
                      <input
                        value={editForm.title || ""}
                        onChange={(e) =>
                          handleEditChange("title", e.target.value)
                        }
                      />
                    </div>
                    <div className="field-group">
                      <label>Description</label>
                      <textarea
                        value={editForm.description || ""}
                        onChange={(e) =>
                          handleEditChange("description", e.target.value)
                        }
                      />
                    </div>
                    <div className="field-group">
                      <label>Category</label>
                      <select
                        value={editForm.category || "roads"}
                        onChange={(e) =>
                          handleEditChange("category", e.target.value)
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
                        value={editForm.address || ""}
                        onChange={(e) =>
                          handleEditChange("address", e.target.value)
                        }
                      />
                    </div>
                    <div className="summary-grid">
                      <div className="field-group">
                        <label>Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={editForm.longitude || ""}
                          onChange={(e) =>
                            handleEditChange("longitude", e.target.value)
                          }
                        />
                      </div>
                      <div className="field-group">
                        <label>Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={editForm.latitude || ""}
                          onChange={(e) =>
                            handleEditChange("latitude", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="toolbar">
                      <button
                        className="primary-button"
                        onClick={() => handleSaveIssue(issue._id)}
                      >
                        Save Changes
                      </button>
                      <button
                        className="secondary-button"
                        onClick={cancelEditing}
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
    </div>
  );
}

export default MyIssues;
