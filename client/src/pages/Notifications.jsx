import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useNotifications } from "../context/NotificationsContext";
import { useEffect } from "react";

// Notification center for issue updates and activity.
// Users can view item details and mark notifications as read.
function Notifications() {
  const { notifications, markAsRead } = useNotifications();

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Notifications - Civic Issues Reporting";
  }, []);

  // Notification page flow: show updates, open linked issues, and mark items as read.
  return (
    <div className="page-shell">
      <Navbar />
      <section className="hero">
        <span className="tag">Inbox</span>
        <h1 className="page-title">Notifications</h1>
        <p className="subtext">
          Stay updated when your reports change status or get assigned.
        </p>
      </section>
      {notifications.length === 0 ? (
        <div className="empty-state">
          <h2>No notifications yet</h2>
          <p className="empty-copy">
            You’ll see issue updates and system messages here.
          </p>
        </div>
      ) : (
        <ul className="content-list">
          {notifications.map((notification) => (
            <li key={notification._id} className="notification-card">
              <header>
                <div>
                  <span className="tag">{notification.type}</span>
                  <h3>{notification.message}</h3>
                </div>
                <span className="status-pill">
                  {notification.read ? "Read" : "Unread"}
                </span>
              </header>
              {notification.issue && (
                <button
                  className="secondary-button"
                  onClick={async () => {
                    if (!notification.read) {
                      await markAsRead(notification._id);
                    }
                    navigate(`/issues/${notification.issue}`);
                  }}
                >
                  View Issue
                </button>
              )}
              <p className="muted">
                Created at {new Date(notification.createdAt).toLocaleString()}
              </p>
              {!notification.read && (
                <button
                  className="primary-button"
                  onClick={() => markAsRead(notification._id)}
                >
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
