import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Icon, getEmergencyIconAsComponent, getStatusIconComponent } from "../components/Icon";

function Home() {
  const [reports, setReports] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicReports();
    fetchNews();
  }, []);

  // Update loading state when both are done
  useEffect(() => {
    if (!reportsLoading && !newsLoading) {
      setLoading(false);
    }
  }, [reportsLoading, newsLoading]);

  const fetchPublicReports = async () => {
    try {
      const res = await api.get("/reports/public");
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load reports";
      setError(msg);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await api.get("/news");
      setNews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const getEmergencyColor = (type) => {
    switch (type) {
      case "Fire": return "#ef4444";
      case "Flood": return "#3b82f6";
      case "Medical Emergency": return "#10b981";
      case "Vehicular Accident": return "#f59e0b";
      case "Crime/Violence": return "#8b5cf6";
      case "Natural Disaster": return "#f97316";
      case "Earthquake": return "#78716c";
      case "Typhoon": return "#06b6d4";
      case "Landslide": return "#a16207";
      default: return "#6b7280";
    }
  };

  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const respondingCount = reports.filter(r => r.status === "Responding").length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;

  if (loading) {
    return (
      <div className="public-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="empty-state" style={{ boxShadow: "none", padding: "60px 40px" }}>
          <div className="loading-spinner"></div>
          <h3 style={{ marginTop: "24px" }}>Loading emergency updates...</h3>
          <p style={{ marginTop: "8px" }}>Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      {/* Header */}
      <header className="public-header">
        <div className="public-header-content">
          <div className="public-header-left">
            <span className="logo-icon"><Icon name="siren" size={28} color="#ef4444" /></span>
            <div>
              <h1>Albuera Poblacion Emergency Portal</h1>
              <p className="subtitle">Real-time emergency updates for our community</p>
            </div>
          </div>
          <div className="public-header-right">
            <Link to="/login" className="btn btn-outline">
              <Icon name="lock" size={16} /> Staff Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              <Icon name="fileText" size={16} /> Register
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="public-content">
        <div className="public-stats">
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-value">{reports.length}</span>
              <span className="stat-label">Total Reports</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-value" style={{ color: "#f59e0b" }}>{pendingCount}</span>
              <span className="stat-label"><Icon name="clock" size={14} style={{ marginRight: "4px" }} />Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-value" style={{ color: "#ef4444" }}>{respondingCount}</span>
              <span className="stat-label"><Icon name="siren" size={14} style={{ marginRight: "4px" }} />Responding</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-value" style={{ color: "#10b981" }}>{resolvedCount}</span>
              <span className="stat-label"><Icon name="checkCircle" size={14} style={{ marginRight: "4px" }} />Resolved</span>
            </div>
          </div>
        </div>

        {/* Admin Announcements Section */}
        {news.length > 0 && (
          <div className="public-section">
            <h2><Icon name="bellRing" size={20} style={{ marginRight: "8px" }} />Admin Announcements & News</h2>
            <div className="news-grid">
              {news.map((item) => (
                <div key={item._id} className="news-card animate-slide-up" style={{ animationDelay: `${news.indexOf(item) * 0.1}s` }}>
                  <div className="news-card-header">
                    <div className="news-category" data-category={item.category}>
                      {item.category === "announcement" && <Icon name="bellRing" size={14} style={{ marginRight: "4px" }} />}
                      {item.category === "safety-tip" && <Icon name="alertCircle" size={14} style={{ marginRight: "4px" }} />}
                      {item.category === "update" && <Icon name="refresh" size={14} style={{ marginRight: "4px" }} />}
                      {item.category === "alert" && <Icon name="siren" size={14} style={{ marginRight: "4px" }} />}
                      {item.category}
                    </div>
                    {item.priority === "high" && (
                      <span className="priority-badge high"><Icon name="flame" size={12} style={{ marginRight: "4px" }} />High Priority</span>
                    )}
                  </div>
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-content">{item.content}</p>
                  <div className="news-meta">
                    <span className="meta-item">
                      <Icon name="user" size={14} style={{ marginRight: "4px" }} />
                      {item.author?.name || "Admin"}
                    </span>
                    {item.author?.department && (
                      <span className="meta-item" style={{ background: "#e0e7ff", color: "#3730a3", borderRadius: "999px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: "500" }}>
                        {item.author.department}
                      </span>
                    )}
                    <span className="meta-item">
                      <Icon name="clock" size={14} style={{ marginRight: "4px" }} />
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Reports */}
        <div className="public-section">
          <h2><Icon name="fileText" size={20} style={{ marginRight: "8px" }} />Latest Emergency Reports</h2>
          
          {error && (
            <div className="error-message" style={{ marginBottom: "24px" }}>
              <Icon name="alertTriangle" size={18} style={{ marginRight: "6px" }} />
              <span>{error}</span>
            </div>
          )}

          {reports.length === 0 ? (
            <div className="empty-state">
              <Icon name="shield" size={48} color="#9ca3af" />
              <h3>No Emergency Reports</h3>
              <p>The community is safe at the moment. Stay vigilant and report any emergencies promptly.</p>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: "16px" }}>
                Register to Report
              </Link>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report._id} className="report-card animate-slide-up" style={{ animationDelay: `${reports.indexOf(report) * 0.1}s` }}>
                  <div className="report-card-header">
                    <div className="emergency-info">
                      <div className="emergency-icon" style={{ background: `${getEmergencyColor(report.emergencyType)}20`, color: getEmergencyColor(report.emergencyType) }}>
                        {getEmergencyIconAsComponent(report.emergencyType, 22)}
                      </div>
                      <div>
                        <span className="emergency-type">{report.emergencyType}</span>
                        <span className="emergency-location" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Icon name="mapPinned" size={14} style={{ marginRight: "2px" }} /> {report.location}
                        </span>
                      </div>
                    </div>
                    <span className={`status-badge ${report.status === 'Pending' ? 'status-badge-pending' : report.status === 'Responding' ? 'status-badge-responding' : 'status-badge-resolved'}`}>
                      {getStatusIconComponent(report.status, 16)} {report.status}
                    </span>
                  </div>
                  <div className="report-card-body">
                    <p className="description">{report.description}</p>
                    <div className="report-card-meta">
                      <span className="meta-item">
                        <Icon name="user" size={14} style={{ marginRight: "4px" }} />
                        {report.reporterName || "Anonymous"}
                      </span>
                      <span className="meta-item">
                        <Icon name="clock" size={14} style={{ marginRight: "4px" }} />
                        {new Date(report.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="public-section" style={{ marginTop: "48px" }}>
          <h2><Icon name="siren" size={22} style={{ marginRight: "8px" }} />Are You A resident Of Albuera Poblacion? Register Na!</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "20px" }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <Icon name="siren" size={18} /> Report Emergency
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="public-footer">
        <p><Icon name="siren" size={16} style={{ marginRight: "6px" }} />Albuera Poblacion Emergency Management System — Keeping our community safe</p>
        <p className="footer-note">
          For life-threatening emergencies, always dial 911 immediately.
        </p>
      </footer>
    </div>
  );
}

export default Home;
