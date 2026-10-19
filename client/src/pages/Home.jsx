import Navbar from "../components/Navbar";
import Map from "../components/Map";
import { useEffect } from "react";

// Main dashboard/home screen for the app.
// Shows the navigation bar and map with nearby issue reports.
function Home() {
  useEffect(() => {
    document.title = "Home - Civic Issues Reporting";
  }, []);
  return (
    <div className="page-shell">
      <Navbar />

      <section className="hero">
        <div className="hero-badges">
          <span className="hero-badge">Report civic issues</span>
          <span className="hero-badge">Track status in real time</span>
          <span className="hero-badge">Coordinate with local teams</span>
        </div>
        <div>
          <h1 className="page-title">
            A clearer way to report problems in your community.
          </h1>
          <p className="subtext">
            Submit potholes, broken streetlights, drainage issues, and other
            public problems in one polished dashboard built for residents,
            organizations, and city teams.
          </p>
        </div>
      </section>

      <div className="layout-two-col">
        <Map />

        <aside className="panel">
          <h2>How it works</h2>
          <div className="summary-grid">
            <div className="stat-card">
              <p className="stat-label">Step 1</p>
              <p className="stat-value">Report</p>
              <p className="muted">
                Add a title, category, location, and details.
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Step 2</p>
              <p className="stat-value">Review</p>
              <p className="muted">
                Teams triage and assign the issue quickly.
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Step 3</p>
              <p className="stat-value">Resolve</p>
              <p className="muted">Track progress until the issue is closed.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;
