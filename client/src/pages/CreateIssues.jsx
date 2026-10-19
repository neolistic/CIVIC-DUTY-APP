import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LocationPicker from "../components/LocationPicker";

// Screen for submitting a new civic issue report.
// Includes category, address, coordinates, and duplicate-check handling.
function CreateIssues() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [forceCreate, setForceCreate] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState("success");
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      () => {
        setLocationError(
          "Location access is blocked. You can still pick a point on the map.",
        );
      },
    );
  }, []);

  useEffect(() => {
    document.title = "Create New Issue - Civic Issues Reporting";
  }, []);

  const handleLocationChange = (selectedLatitude, selectedLongitude) => {
    setLatitude(selectedLatitude.toFixed(6));
    setLongitude(selectedLongitude.toFixed(6));
    setLocationError("");
  };

  // Send a new issue report to the backend and include location data.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");

    try {
      const response = await api.post("/issues", {
        title,
        description,
        category,
        address,
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        forceCreate,
      });
      if (response.status === 201) {
        setSubmitStatus("success");
        setSubmitMessage(
          response.data?.message || "Issue created successfully.",
        );
        setTitle("");
        setDescription("");
        setCategory("");
        setAddress("");
        setForceCreate(false);
      }
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error.response?.data?.error || "Unable to create this issue.",
      );
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <section className="hero">
        <span className="tag">New report</span>
        <h1 className="page-title">Create a new issue report</h1>
        <p className="subtext">
          Add the location and details of the problem so it can be reviewed and
          assigned quickly.
        </p>
      </section>

      <div className="layout-two-col">
        <div className="panel">
          {submitMessage && (
            <p className={`form-banner form-banner--${submitStatus}`}>
              {submitMessage}
            </p>
          )}
          {locationError && <p className="form-error">{locationError}</p>}
          <form onSubmit={handleSubmit} className="issue-form">
            <div className="field-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Broken streetlight on Main Street"
                required
              />
            </div>
            <div className="field-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is wrong and why it matters."
                required
              />
            </div>
            <div className="field-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="roads">Roads</option>
                <option value="streetlights">Street Lights</option>
                <option value="garbage">Garbage</option>
                <option value="water">Water</option>
                <option value="drainage">Drainage</option>
                <option value="traffic">Traffic</option>
                <option value="public_spaces">Public Spaces</option>
                <option value="parks">Parks</option>
                <option value="public_property">Public Property</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field-group">
              <label>Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, neighborhood, landmark"
                required
              />
            </div>
            <div className="summary-grid">
              <div className="field-group">
                <label>Latitude</label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  step="0.000001"
                  required
                />
              </div>
              <div className="field-group">
                <label>Longitude</label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  step="0.000001"
                  required
                />
              </div>
            </div>
            <button className="primary-button" type="submit">
              Create Issue
            </button>
          </form>
        </div>

        <div className="location-panel">
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={([selectedLatitude, selectedLongitude]) =>
              handleLocationChange(selectedLatitude, selectedLongitude)
            }
          />

          <aside className="panel">
            <h2>Tips for a better report</h2>
            <ul className="content-list">
              <li className="issue-card">
                <strong>Be specific</strong>
                <p className="muted">
                  Include landmarks, cross streets, or nearby buildings.
                </p>
              </li>
              <li className="issue-card">
                <strong>Add context</strong>
                <p className="muted">
                  Mention whether it is dangerous, blocked, damaged, or urgent.
                </p>
              </li>
              <li className="issue-card">
                <strong>Use the right category</strong>
                <p className="muted">
                  This helps the issue reach the correct team faster.
                </p>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CreateIssues;
