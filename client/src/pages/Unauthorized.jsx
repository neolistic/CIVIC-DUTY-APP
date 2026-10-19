import Navbar from "../components/Navbar";
import { useEffect } from "react";
function Unauthorized() {
  useEffect(() => {
    document.title = "Unauthorized - Civic Issues Reporting";
  }, []);
  return (
    <div className="page-shell">
      <Navbar />
      <div className="empty-state">
        <span className="tag">Access denied</span>
        <h2>Unauthorized</h2>
        <p className="empty-copy">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}

export default Unauthorized;
