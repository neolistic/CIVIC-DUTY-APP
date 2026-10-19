import api from "../api";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";

// Detailed issue page.
// Shows issue metadata, history, and allows the user to upvote the report.
function IssueDetails() {
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);

  // Load the selected issue by ID and store its details in local state.
  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await api.get(`/issues/${issueId}`);
        setIssue(response.data.issue);

        try {
          const historyResponse = await api.get(
            `/issues/${issueId}/history/details`,
          );
          setHistory(historyResponse.data.history || []);
        } catch (historyError) {
          console.error("Error fetching issue history:", historyError);
          setHistory(response.data.issue.history || []);
        }
      } catch (error) {
        console.error("Error fetching issue:", error);
      }
    };

    fetchIssue();
  }, [issueId]);

  useEffect(() => {
    document.title = `Issue Details - Civic Issues Reporting`;
  }, []);

  // Upvote the issue and refresh the issue data with updated vote count.
  const handleUpvote = async () => {
    try {
      const response = await api.post(`/issues/${issueId}/upvote`);
      setIssue(response.data.issue);
    } catch (error) {
      console.error("Error upvoting issue:", error);
    }
  };

  if (!issue) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="panel">Loading issue details...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <div className="detail-card">
        <div className="detail-hero">
          <div>
            <span className="tag">{issue.status}</span>
            <h1>{issue.title}</h1>
            <p className="subtext">{issue.description}</p>
          </div>
          <button className="primary-button" onClick={handleUpvote}>
            Upvote
          </button>
        </div>

        <div className="summary-grid">
          <div className="stat-card">
            <p className="stat-label">Category</p>
            <p className="stat-value" style={{ fontSize: "1rem" }}>
              {issue.category}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Address</p>
            <p className="stat-value" style={{ fontSize: "1rem" }}>
              {issue.address}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Upvotes</p>
            <p className="stat-value" style={{ fontSize: "1rem" }}>
              {issue.upvotes.length > 0
                ? issue.upvotes.length
                : "No upvotes yet"}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Reported by</p>
            <p className="stat-value" style={{ fontSize: "1rem" }}>
              {issue.reporter.name}
            </p>
          </div>
        </div>

        <div className="panel">
          <h2>Issue History</h2>
          {history && history.length > 0 ? (
            <ul className="content-list">
              {history.map((entry, index) => (
                <li key={index} className="issue-card">
                  <p>
                    {entry.action} by {entry.performedBy?.name || "Unknown"}
                  </p>
                  <p className="muted">
                    {entry.timestamp
                      ? new Date(entry.timestamp).toLocaleString()
                      : "No timestamp"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No history available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueDetails;
