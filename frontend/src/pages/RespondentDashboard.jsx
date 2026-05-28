import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as Icons from "react-icons/lu";
import { Icon, getEmergencyColor } from "../components/Icon";
import api from "../api";

function RespondentDashboard({ 
  reports: propReports, 
  fetchReports: propFetchReports,
  pendingReports: layoutPendingReports
}) {
  const location = useLocation();
const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("queue");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Track which action is loading
  const [error, setError] = useState("");
  
  const userId = localStorage.getItem("userId");
  const useLayoutData = !!layoutPendingReports;

  useEffect(() => {
    if (location.state?.view === "responses") {
      setFilter("responses");
    } else if (location.state?.view === "queue" || !location.state?.view) {
      setFilter("queue");
    }
  }, [location.state]);

  useEffect(() => {
    if (!useLayoutData && !propReports) {
      fetchReports();
    }
  }, [useLayoutData, propReports]);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch reports");
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

const handleStatusUpdate = async (id, status, action = null) => {
    setActionLoading(id);
    try {
      await api.patch(`/reports/${id}/status`, { status, action });
      if (useLayoutData) {
        propFetchReports();
      } else {
        fetchReports();
      }
    } catch (err) {
      setError(err.message || "Failed to update report");
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(null);
    }
  };



  const reportsData = useLayoutData 
    ? propReports 
    : (propReports || reports);

  const pendingReports = reportsData.filter(r => r.status === "Pending");
  const myRespondingReports = reportsData.filter(r => 
    r.status === "Responding" && r.assignedTo?.respondentId === userId
  );
  // Reports assigned to this respondent (from admin) - show in queue
  const assignedToMe = reportsData.filter(r => 
    r.assignedTo?.respondentId === userId && r.status === "Responding"
  );

  let displayReports = [];
  if (filter === "queue") {
    // Show pending reports (not yet assigned)
    displayReports = [...pendingReports];
  } else if (filter === "assigned") {
    // Show reports assigned to this respondent by admin
    displayReports = [...assignedToMe];
  } else if (filter === "responses") {
    displayReports = myRespondingReports;
  }

  // Deduplicate in case assignedToMe overlaps with pendingReports
  const uniqueReports = [];
  const seenIds = new Set();
  displayReports.forEach(r => {
    if (!seenIds.has(r._id)) {
      seenIds.add(r._id);
      uniqueReports.push(r);
    }
  });
  displayReports = uniqueReports;

  const pendingCount = pendingReports.length;
  const activeCount = myRespondingReports.length;
  // Count reports assigned to this respondent
  const assignedCount = assignedToMe.length;

  const getEmergencyIcon = (type) => {
    switch (type) {
      case "Fire": return <Icons.LuFlame size={20} color="#ef4444" />;
      case "Flood": return <Icons.LuWaves size={20} color="#3b82f6" />;
      case "Medical Emergency": return <Icons.LuHeart size={20} color="#10b981" />;
      case "Vehicular Accident": return <Icons.LuCar size={20} color="#f59e0b" />;
      case "Crime/Violence": return <Icons.LuShield size={20} color="#8b5cf6" />;
      case "Natural Disaster": return <Icons.LuCloud size={20} color="#f97316" />;
      default: return <Icons.LuAlertTriangle size={20} color="#6b7280" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="status-badge" style={{ background: "#fef3c7", color: "#92400e" }}><Icons.LuClock size={14} style={{ marginRight: "4px" }} />Pending</span>;
      case "Responding":
        return <span className="status-badge" style={{ background: "#fee2e2", color: "#991b1b" }}><Icons.LuSiren size={14} style={{ marginRight: "4px" }} />Responding</span>;
      case "Resolved":
        return <span className="status-badge" style={{ background: "#d1fae5", color: "#065f46" }}><Icons.LuCheckCircle size={14} style={{ marginRight: "4px" }} />Resolved</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
   };

   // Action handlers
   const handleAccept = async (report) => {
     await handleStatusUpdate(report._id, "Responding", "accept");
   };

   const handleDecline = async (report) => {
     await handleStatusUpdate(report._id, "Declined", "decline");
   };

   const handleResolve = async (report) => {
     await handleStatusUpdate(report._id, "Resolved");
   };

   return (
    <div className="respondent-dashboard">
      {/* Header Stats */}
      <div className="dashboard-stats" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        <div 
          className="stat-card" 
          onClick={() => setFilter("queue")}
          style={{
            background: filter === "queue" ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" : "white",
            color: filter === "queue" ? "white" : "inherit",
            cursor: "pointer",
            padding: "1.5rem",
            borderRadius: "16px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            transform: filter === "queue" ? "scale(1.02)" : "scale(1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Icons.LuSiren size={32} />{pendingCount}</div>
          <div style={{ opacity: 0.9 }}>Emergency Queue</div>
        </div>
        
        <div 
          className="stat-card" 
          onClick={() => setFilter("assigned")}
          style={{
            background: filter === "assigned" ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" : "white",
            color: filter === "assigned" ? "white" : "inherit",
            cursor: "pointer",
            padding: "1.5rem",
            borderRadius: "16px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            transform: filter === "assigned" ? "scale(1.02)" : "scale(1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Icons.LuClipboardList size={32} />{assignedCount}</div>
          <div style={{ opacity: 0.9 }}>Assigned to Me</div>
        </div>
        
        <div 
          className="stat-card"
          onClick={() => setFilter("responses")}
          style={{
            background: filter === "responses" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "white",
            color: filter === "responses" ? "white" : "inherit",
            cursor: "pointer",
            padding: "1.5rem",
            borderRadius: "16px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            transform: filter === "responses" ? "scale(1.02)" : "scale(1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Icons.LuActivity size={32} />{activeCount}</div>
          <div style={{ opacity: 0.9 }}>My Responses</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ 
        display: "flex", 
        gap: "1rem", 
        marginBottom: "1.5rem",
        borderBottom: "2px solid #e5e7eb",
        paddingBottom: "0.5rem"
      }}>
        <button
          onClick={() => setFilter("queue")}
          style={{
            padding: "0.75rem 1.5rem",
            border: "none",
            background: filter === "queue" ? "#f97316" : "transparent",
            color: filter === "queue" ? "white" : "#6b7280",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
        >
          <Icons.LuSiren size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />Emergency Queue ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("assigned")}
          style={{
            padding: "0.75rem 1.5rem",
            border: "none",
            background: filter === "assigned" ? "#8b5cf6" : "transparent",
            color: filter === "assigned" ? "white" : "#6b7280",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
        >
          <Icons.LuClipboardList size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />Assigned to Me ({assignedCount})
        </button>
        <button
          onClick={() => setFilter("responses")}
          style={{
            padding: "0.75rem 1.5rem",
            border: "none",
            background: filter === "responses" ? "#10b981" : "transparent",
            color: filter === "responses" ? "white" : "#6b7280",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
        >
          <Icons.LuActivity size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />My Responses ({activeCount})
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: "16px",
          background: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          marginBottom: "24px",
          color: "#991b1b",
          fontSize: "0.875rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icons.LuAlertCircle size={18} color="#dc2626" />
            <span>Error loading emergencies: {error}</span>
          </div>
          <button 
            onClick={() => {
              setError("");
              fetchReports();
            }}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.8125rem",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          Loading emergencies...
        </div>
      ) : displayReports.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "4rem 2rem", 
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {filter === "queue" ? <Icons.LuCheckCircle size={56} color="#10b981" /> : filter === "assigned" ? <Icons.LuClipboardList size={56} color="#8b5cf6" /> : <Icons.LuInbox size={56} color="#6b7280" />}
          </div>
          <h3 style={{ color: "#374151", marginBottom: "0.5rem", marginTop: "16px" }}>
            {filter === "queue" ? "No Emergencies in Queue" : filter === "assigned" ? "No Assigned Tasks" : "No Active Responses"}
          </h3>
          <p style={{ color: "#6b7280" }}>
            {filter === "queue" 
              ? "All emergencies have been assigned. Check back soon!" 
              : filter === "assigned"
              ? "You have no tasks assigned by the admin."
              : "You haven't accepted any emergency responses yet."}
          </p>
        </div>
      ) : (
        <div className="reports-grid" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {displayReports.map((report) => (
            <div 
              key={report._id}
              className="report-card"
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                border: "1px solid #e5e7eb"
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", background: `${getEmergencyColor(report.emergencyType)}15` }}>
                    {getEmergencyIcon(report.emergencyType)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600", color: "#1f2937" }}>
                      {report.emergencyType}
                    </h3>
                    <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                </div>
                {getStatusBadge(report.status)}
              </div>

              {/* Location */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4b5563" }}>
                  <Icons.LuMapPinned size={14} />
                  <span style={{ fontWeight: "500" }}>{report.location}</span>
                </div>
              </div>

              {/* Description */}
              <div style={{ 
                marginBottom: "1rem", 
                padding: "0.75rem", 
                background: "#f9fafb", 
                borderRadius: "8px",
                fontSize: "0.875rem",
                color: "#4b5563"
              }}>
                {report.description?.substring(0, 100)}
                {report.description?.length > 100 ? "..." : ""}
              </div>

              {/* Assigned by Admin Badge */}
              {report.assignedTo?.respondentId === userId && (
                <div style={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  background: "#f3e8ff",
                  color: "#7c3aed",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  marginBottom: "0.75rem"
                }}>
                  <Icons.LuClipboardList size={12} /> Assigned by Admin
                </div>
              )}

              {/* Reporter Info */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "1rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid #e5e7eb"
              }}>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  <Icons.LuUser size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />{report.reporterName || "Anonymous"}
                </div>
                {report.assignedTo?.respondentName && (
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    <Icons.LuAmbulance size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />{report.assignedTo.respondentName}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {/* Show for reports NOT assigned to this respondent */}
              {report.status === "Pending" && report.assignedTo?.respondentId !== userId && (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => handleAccept(report)}
                    disabled={!!actionLoading}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      transition: "all 0.2s",
                      opacity: actionLoading === report._id ? 0.6 : 1,
                      pointerEvents: actionLoading === report._id ? "none" : "auto"
                    }}
                  >
                    {actionLoading === report._id ? <Icons.LuLoader2 size={16} className="spin" /> : <Icons.LuSiren size={16} />}
                    Accept & Respond
                  </button>
                  <button
                    onClick={() => handleDecline(report)}
                    disabled={!!actionLoading}
                    style={{
                      padding: "0.75rem 1rem",
                      background: "#f3f4f6",
                      color: "#6b7280",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      opacity: actionLoading === report._id ? 0.6 : 1,
                      pointerEvents: actionLoading === report._id ? "none" : "auto"
                    }}
                  >
                    {actionLoading === report._id ? <Icons.LuLoader2 size={16} className="spin" /> : <Icons.LuXCircle size={16} />}
                    Decline
                  </button>
                </div>
              )}

              {/* Show for reports assigned to this respondent (by admin, still Pending) */}
              {report.status === "Pending" && report.assignedTo?.respondentId === userId && (
                <div style={{ 
                  padding: "1rem", 
                  background: "#fef3c7",
                  borderRadius: "8px",
                  textAlign: "center",
                  marginBottom: "0.75rem"
                }}>
                  <div style={{ fontSize: "0.875rem", color: "#92400e", fontWeight: "600", marginBottom: "0.75rem" }}>
                    <Icons.LuSiren size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />This emergency has been assigned to you!
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => handleAccept(report)}
                      disabled={!!actionLoading}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        transition: "all 0.2s",
                        opacity: actionLoading === report._id ? 0.6 : 1,
                        pointerEvents: actionLoading === report._id ? "none" : "auto"
                      }}
                    >
                      {actionLoading === report._id ? <Icons.LuLoader2 size={16} className="spin" /> : <Icons.LuCheckCircle size={16} />}
                      Accept & Respond
                    </button>
                    <button
                      onClick={() => handleDecline(report)}
                      disabled={!!actionLoading}
                      style={{
                        padding: "0.75rem 1rem",
                        background: "#fff",
                        color: "#92400e",
                        border: "1px solid #d97706",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        opacity: actionLoading === report._id ? 0.6 : 1,
                        pointerEvents: actionLoading === report._id ? "none" : "auto"
                      }}
                    >
                      {actionLoading === report._id ? <Icons.LuLoader2 size={16} className="spin" /> : <Icons.LuXCircle size={16} />}
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Show for reports assigned to this respondent (by admin) */}
              {report.status === "Responding" && report.assignedTo?.respondentId === userId && (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => handleResolve(report)}
                    disabled={!!actionLoading}
                    style={{
                      flex: 1,
                      padding: "0.875rem",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      transition: "all 0.2s",
                      opacity: actionLoading === report._id ? 0.6 : 1,
                      pointerEvents: actionLoading === report._id ? "none" : "auto"
                    }}
                  >
                    {actionLoading === report._id ? <Icons.LuLoader2 size={18} className="spin" /> : <Icons.LuCheckCircle size={18} />}
                    Resolve Emergency
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RespondentDashboard;
