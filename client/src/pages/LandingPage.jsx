import { Link, Navigate } from "react-router-dom";
import { getValidToken } from "../utils/auth";
import { useEffect } from "react";

function LandingPage() {
  const token = getValidToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    document.title = "Civic Duty - Civic Issues Reporting";
  }, []);

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <div className="landing-brand">
          <div className="navbar-mark">CD</div>
          <div>
            <p className="navbar-eyebrow">Civic reporting platform</p>
            <h1 className="navbar-title">Civic Duty</h1>
          </div>
        </div>

        <div className="landing-nav-actions">
          <Link className="secondary-button" to="/login">
            Login
          </Link>
          <Link className="primary-button" to="/register">
            Sign up
          </Link>
        </div>
      </header>

      <section className="landing-hero panel">
        <div className="landing-hero-copy">
          <span className="tag">Community infrastructure reporting</span>
          <h2 className="page-title">
            Report civic issues, follow progress, and help your city respond
            faster.
          </h2>
          <p className="subtext">
            Civic Duty makes it easy to report potholes, broken streetlights,
            drainage problems, and other public issues from one polished
            platform.
          </p>

          <div className="landing-cta-row">
            <Link className="primary-button" to="/register">
              Get started
            </Link>
            <Link className="secondary-button" to="/login">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="landing-hero-side">
          <div className="stat-card">
            <p className="stat-label">Fast reporting</p>
            <p className="muted">
              Submit issues in a few steps with category, location, and a clear
              description.
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Live tracking</p>
            <p className="muted">
              Follow issue status as teams review, assign, and resolve reports.
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Role-based workflow</p>
            <p className="muted">
              Separate views for residents, employees, organizations, and
              admins.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-grid">
        <article className="feature-card">
          <span className="tag">Map view</span>
          <h3>See issues near you.</h3>
          <p>
            A location-aware map helps residents and teams discover nearby
            problems quickly.
          </p>
        </article>

        <article className="feature-card">
          <span className="tag">Status updates</span>
          <h3>Know what is happening.</h3>
          <p>
            Reports move through review, assignment, in-progress, and resolved
            states.
          </p>
        </article>

        <article className="feature-card">
          <span className="tag">Notifications</span>
          <h3>Stay in the loop.</h3>
          <p>
            Users receive updates when issues are assigned or their status
            changes.
          </p>
        </article>
      </section>
    </main>
  );
}

export default LandingPage;
