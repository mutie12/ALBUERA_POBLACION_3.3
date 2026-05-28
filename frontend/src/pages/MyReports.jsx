import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Icon, getEmergencyIcon, getStatusIcon } from "../components/Icon";
import * as Icons from "react-icons/lu";

function MyReports({ myReports, myMessages, fetchReports }) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewReport, setShowNewReport] = useState(false);
  const [newReportType, setNewReportType] = useState("");
  const [newReportLocation, setNewReportLocation] = useState("");
  const [newReportSubLocation, setNewReportSubLocation] = useState("");
  const [newReportDesc, setNewReportDesc] = useState("");
  const [newReportImage, setNewReportImage] = useState("");
  const [newReportLoading, setNewReportLoading] = useState(false);
  const [newReportMsg, setNewReportMsg] = useState(null);
  const [newReportOk, setNewReportOk] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [editReportData, setEditReportData] = useState({
    emergencyType: '',
    location: '',
    description: '',
    subLocation: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Transform messages to match report structure for display
  const transformedMessages = myMessages?.map(msg => ({
    _id: msg._id,
    emergencyType: msg.type === "resident-emergency" ? (msg.emergencyType || "Emergency") : "Message to Admin",
    description: msg.message,
    location: null,
    date: msg.createdAt,
    status: "Sent",
    type: "message",
    subject: msg.title,
    isMessage: true
  })) || [];

  // Combine reports and messages
  const allItems = [
    ...(myReports || []).map(r => ({ ...r, isMessage: false })),
    ...transformedMessages
  ];

  const filteredItems = allItems
    .filter((item) => {
      const matchesFilter = 
        filter === "all" || 
        (item.isMessage ? filter === "sent" : item.status.toLowerCase() === filter.toLowerCase());
      const matchesSearch =
        !searchTerm ||
        (item.emergencyType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.subject || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const stats = {
    total: myReports?.length || 0,
    pending: myReports?.filter((r) => r.status === "Pending").length || 0,
    responding: myReports?.filter((r) => r.status === "Responding").length || 0,
    resolved: myReports?.filter((r) => r.status === "Resolved").length || 0,
    messages: myMessages?.length || 0
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit"
    });
  };

  const getStatusConfig = (status, isMessage, itemType = null) => {
    if (isMessage) {
      if (itemType === "resident-emergency") {
        return { bg: "#fee2e2", color: "#991b1b", icon: <Icons.LuSiren size={18} color="#ef4444" />, border: "#ef4444" };
      }
      return { bg: "#e0e7ff", color: "#3730a3", icon: <Icons.LuBell size={18} color="#6366f1" />, border: "#6366f1" };
    }
    const configs = {
      Pending: { bg: "#fef3c7", color: "#92400e", icon: <Icons.LuClock size={18} color="#f59e0b" />, border: "#f59e0b" },
      "Responding": { bg: "#dbeafe", color: "#1e40af", icon: <Icons.LuRefreshCw size={18} color="#3b82f6" />, border: "#3b82f6" },
      Resolved: { bg: "#dcfce7", color: "#166534", icon: <Icons.LuCheckCircle size={18} color="#22c55e" />, border: "#22c55e" },
    };
    return configs[status] || configs.Pending;
  };

  const getTypeConfig = (type, isMessage) => {
    if (isMessage) {
      if (type === "Emergency" || type?.includes("Emergency")) {
        return { icon: <Icons.LuSiren size={18} color="#ef4444" />, bg: "#fee2e2", color: "#991b1b" };
      }
      return { icon: <Icons.LuInbox size={18} color="#3730a3" />, bg: "#e0e7ff", color: "#3730a3" };
    }
    const configs = {
      Medical: { icon: <Icons.LuAmbulance size={18} color="#ef4444" />, bg: "#fee2e2", color: "#991b1b" },
      Fire: { icon: <Icons.LuFlame size={18} color="#f59e0b" />, bg: "#ffedd5", color: "#c2410c" },
      Crime: { icon: <Icons.LuShield size={18} color="#5b21b6" />, bg: "#ede9fe", color: "#5b21b6" },
      "Natural Disaster": { icon: <Icons.LuWaves size={18} color="#3730a3" />, bg: "#e0e7ff", color: "#3730a3" },
      Accident: { icon: <Icons.LuZap size={18} color="#9d174d" />, bg: "#fce7f3", color: "#9d174d" },
      Other: { icon: <Icons.LuAlertTriangle size={18} color="#6b7280" />, bg: "#f3f4f6", color: "#4b5563" },
    };
    return configs[type] || configs.Other;
  };

  // ── New Report constants ───────────────────────────────────────────────
  const emergencyTypes = [
    "Fire","Flood","Earthquake","Typhoon","Landslide",
    "Medical Emergency","Vehicular Accident","Crime/Violence","Other"
  ];

  const barangays = [
    "Poblacion","Balugo","Damula-an","Antipolo","Benolho",
    "Doña Maria (Kangkuirina)","Mahayag","Mahayahay","Salvacion",
    "San Pedro","Seguinon","Sherwood","Tabgas","Talisayan","Tinag-an",
  ];

  const poblacionSubAreas = ["Canlalin / Canlalen","Gungab","Malitbog","Soob","Bagtan","Sudlon","San Andres","Urban","GK Village"];
  const balugoSubAreas = ["Lawis","Marka Baling","Beachfront Area","Balugo Proper"];
  const barangaySubAreas = { Poblacion: poblacionSubAreas, Balugo: balugoSubAreas };

  const emergencyColorMap = {
    "Fire":               { icon:"flame", color:"#ef4444", bg:"#fee2e2", border:"#ef4444" },
    "Flood":              { icon:"waves", color:"#3b82f6", bg:"#dbeafe", border:"#3b82f6" },
    "Earthquake":         { icon:"activity", color:"#78716c", bg:"#f3f4f6", border:"#78716c" },
    "Typhoon":            { icon:"cloud", color:"#06b6d4", bg:"#e0f2fe", border:"#06b6d4" },
    "Landslide":          { icon:"activity", color:"#a16207", bg:"#ffedd5", border:"#a16207" },
    "Medical Emergency":  { icon:"heart", color:"#10b981", bg:"#d1fae5", border:"#10b981" },
    "Vehicular Accident": { icon:"car", color:"#f59e0b", bg:"#fef3c7", border:"#f59e0b" },
    "Crime/Violence":     { icon:"shield", color:"#8b5cf6", bg:"#ede9fe", border:"#8b5cf6" },
    "Other":              { icon:"alert", color:"#6b7280", bg:"#f3f4f6", border:"#6b7280" },
  };

  const nameFromStorage = localStorage.getItem("name") || "";

  const handleNewReport = async (e) => {
    e.preventDefault();
    if (!newReportType || !newReportLocation || !newReportDesc.trim()) {
      setNewReportOk(false);
      setNewReportMsg("Fill in all required fields.");
      return;
    }
    setNewReportLoading(true);
    setNewReportMsg(null);
    try {
      const fullLocation = newReportLocation && newReportSubLocation
        ? `${newReportLocation} - ${newReportSubLocation}`
        : newReportLocation;
   await api.post("/reports", {
        name: nameFromStorage,
        location: fullLocation,
        emergencyType: newReportType,
        description: newReportDesc.trim(),
        ...(newReportImage && { image: newReportImage }),
      });
      setNewReportOk(true);
      setNewReportMsg("Report submitted successfully! It is now visible to the admin.");
      setNewReportType("");
      setNewReportLocation("");
      setNewReportSubLocation("");
      setNewReportDesc("");
      setNewReportImage("");
      // Notify parent to refresh
      if (fetchReports) fetchReports();
    } catch (err) {
      setNewReportOk(false);
      setNewReportMsg(err.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setNewReportLoading(false);
    }
  };

  // Edit Report Functions
  const handleEditReport = (report) => {
    setEditingReportId(report._id);
    setEditReportData({
      emergencyType: report.emergencyType,
      location: report.location,
      description: report.description,
      subLocation: report.subLocation || '',
    });
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!editReportData.emergencyType || !editReportData.location || !editReportData.description.trim()) {
      setEditError("Fill in all required fields.");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      await api.patch(`/reports/${editingReportId}`, {
        emergencyType: editReportData.emergencyType,
        location: editReportData.location,
        description: editReportData.description.trim(),
        subLocation: editReportData.subLocation || undefined,
      });
      setEditingReportId(null);
      setEditReportData({ emergencyType: '', location: '', description: '', subLocation: '' });
      setEditLoading(false);
      if (fetchReports) fetchReports();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update report.");
      setEditLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Delete this report? This action cannot be undone.")) return;
    try {
      await api.delete(`/reports/${id}`);
      if (fetchReports) fetchReports();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to delete report.");
      console.error("Failed to delete report:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingReportId(null);
    setEditReportData({ emergencyType: '', location: '', description: '' });
    setEditError("");
  };

  return (
    <div className="dashboard-content" style={{ padding: "0" }}>
      {/* Page Header */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            <><Icon name="fileText" size={26} style={{ marginRight: "6px" }} />My Reports & Messages</>
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
            Track and manage your submitted emergency reports and messages to admin
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icons.LuBarChart2 size={28} color="#9ca3af" />
            </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {stats.total}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              Total Reports
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icons.LuClock size={28} color="#f59e0b" />
            </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#92400e",
              }}
            >
              {stats.pending}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              Pending
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icons.LuRefreshCw size={28} color="#3b82f6" />
            </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#1e40af",
              }}
            >
              {stats.responding}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              In Progress
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icons.LuCheckCircle size={28} color="#10b981" />
            </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#166534",
              }}
            >
              {stats.resolved}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              Resolved
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#e0e7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icons.LuInbox size={28} color="#6366f1" />
            </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#3730a3",
              }}
            >
              {stats.messages}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              Messages Sent
            </div>
          </div>
        </div>
      </div>

      {/* ── New Report Form ─────────────────────────────────────────────── */}
      <div className="new-report-section" id="new-report-section">
        <div className="nrs-card">
          <div
            className="nrs-header"
            onClick={() => setShowNewReport(!showNewReport)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowNewReport(!showNewReport); }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="nrs-icon">
                <Icons.LuPlus size={22} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#111827" }}>
                  Submit New Emergency Report
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
                  Reports appear instantly on the admin dashboard
                </p>
              </div>
            </div>
            <Icons.LuChevronDown
              size={20}
              color="#6b7280"
              style={{
                transition: "transform 0.2s",
                transform: showNewReport ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>

          {showNewReport && (
            <form onSubmit={handleNewReport} className="nrs-form">
              {newReportMsg && (
                <div
                  className={`nrs-msg ${newReportOk ? "nrs-msg-ok" : "nrs-msg-err"}`}
                >
                  {typeof newReportMsg === "string"
                    ? newReportMsg
                    : newReportMsg}
                </div>
              )}

              {/* Emergency Type */}
              <div className="nrs-field">
                <label className="nrs-label">
                  Emergency Type <span className="required">*</span>
                </label>
                <div className="nrs-type-grid">
                  {emergencyTypes.map((type) => {
                    const cfg = emergencyColorMap[type] || emergencyColorMap["Other"];
                    const active = newReportType === type;
                    return (
                      <div
                        key={type}
                        role="button"
                        tabIndex={0}
                        onClick={() => setNewReportType(type)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setNewReportType(type); }}
                        className={`nrs-type-chip ${active ? "nrs-type-active" : ""}`}
                        style={{
                          borderColor: active ? cfg.border : "#e5e7eb",
                          background: active ? cfg.bg : "white",
                        }}
                      >
<Icon name={cfg.icon} size={20} color={cfg.color} style={{ marginRight: "4px" }} />
                         <span style={{ fontSize: "0.8125rem", fontWeight: active ? 600 : 400 }}>{type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <div className="nrs-field">
                <label className="nrs-label">
                  <Icons.LuMapPin size={14} style={{ marginRight: "4px" }} />
                  Barangay <span className="required">*</span>
                </label>
                <select
                  value={newReportLocation}
                  onChange={(e) => { setNewReportLocation(e.target.value); setNewReportSubLocation(""); }}
                  required
                  className="nrs-select"
                >
                  <option value="">-- Select barangay --</option>
                  {barangays.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {newReportLocation && barangaySubAreas[newReportLocation] && (
                  <select
                    value={newReportSubLocation}
                    onChange={(e) => setNewReportSubLocation(e.target.value)}
                    className="nrs-select"
                    style={{ marginTop: "8px" }}
                  >
                    <option value="">All {newReportLocation}</option>
                    {barangaySubAreas[newReportLocation].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Description */}
              <div className="nrs-field">
                <label className="nrs-label">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  value={newReportDesc}
                  onChange={(e) => setNewReportDesc(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe what is happening, severity, number of people affected, and any immediate dangers..."
                  className="nrs-textarea"
                />
              </div>

              {/* Image Upload */}
              <div className="nrs-field">
                <label className="nrs-label">
                  <Icon name="fileImage" size={14} style={{ marginRight: "4px" }} />
                  Attach Photo <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { setNewReportMsg("Image must be under 5 MB"); return; }
                    if (!file.type.startsWith("image/")) { setNewReportMsg("Choose a valid image file"); return; }
                    const reader = new FileReader();
                    reader.onload = () => setNewReportImage(reader.result);
                    reader.readAsDataURL(file);
                  }}
                  style={{ padding: "8px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.875rem", background: "white" }}
                />
                {newReportImage && (
                  <div style={{ marginTop: "10px", position: "relative", display: "inline-block" }}>
                    <img
                      src={newReportImage}
                      alt="Preview"
                      style={{ maxWidth: "200px", maxHeight: "140px", borderRadius: "8px", border: "1px solid #d1d5db", display: "block" }}
                    />
                    <button
                      type="button"
                      onClick={() => setNewReportImage("")}
                      style={{
                        position: "absolute", top: "4px", right: "4px",
                        background: "rgba(0,0,0,0.6)", color: "white", border: "none",
                        borderRadius: "50%", width: "22px", height: "22px",
                        fontSize: "0.7rem", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Icon name="x" size={12} color="white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="nrs-actions">
                <button
                  type="submit"
                  disabled={newReportLoading}
                  className="nrs-submit"
                >
                  {newReportLoading ? (
                    <><Icons.LuLoader2 size={16} className="spin" /> Submitting…</>
                  ) : (
                    <><Icons.LuSend size={16} /> Submit Report</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewReport(false); setNewReportMsg(null); }}
                  className="nrs-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Filters & Search & Tabs */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ flex: "1", minWidth: "200px", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            >
              <Icons.LuSearch size={18} color="#9ca3af" />
            </span>
            <input
              type="text"
              placeholder="Search reports and messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "0.95rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { key: "all", label: "All", color: "#6b7280" },
              { key: "pending", label: "Pending", color: "#f59e0b" },
              { key: "responding", label: "In Progress", color: "#3b82f6" },
              { key: "resolved", label: "Resolved", color: "#22c55e" },
              { key: "sent", label: "Sent Messages", color: "#6366f1" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  background: filter === tab.key ? tab.color : "transparent",
                  color: filter === tab.key ? "white" : "#6b7280",
                  fontWeight: "500",
                  fontSize: "0.875rem",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports & Messages List */}
{filteredItems.length === 0 ? (
        <div
          className="empty-state"
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "60px 40px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <Icon name="fileText" size={48} style={{ marginBottom: "16px", color: "#9ca3af" }} />
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            {searchTerm ? "No Results Found" : "No Reports or Messages Yet"}
          </h3>
          <p
            style={{
              color: "#6b7280",
              marginBottom: "24px",
              maxWidth: "100%",
              margin: "0 auto 24px",
            }}
          >
            {searchTerm
              ? `No items matching "${searchTerm}" were found.`
              : "You haven't submitted any emergency reports or messages to the admin yet. When you do, they will appear here."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredItems.map((item) => {
            const statusConfig = getStatusConfig(item.status, item.isMessage, item.type);
            const typeConfig = getTypeConfig(item.emergencyType, item.isMessage);

            // If editing this report, show edit form
            if (editingReportId === item._id) {
              return (
                <div
                  key={item._id}
                  className="report-card"
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    border: "1px solid #e5e7eb",
                    transition: "all 0.2s",
                    borderLeft: item.isMessage ? "4px solid #6366f1" : undefined,
                  }}
                >
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#111827" }}>
                      Edit Report
                    </h4>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "4px" }}>
                      Make changes to your emergency report
                    </p>
                  </div>

                  <form onSubmit={handleUpdateReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="nrs-field">
                      <label className="nrs-label">
                        Emergency Type <span className="required">*</span>
                      </label>
                      <div className="nrs-type-grid">
                        {emergencyTypes.map((type) => {
                          const cfg = emergencyColorMap[type] || emergencyColorMap["Other"];
                          const active = editReportData.emergencyType === type;
                          return (
                            <div
                              key={type}
                              role="button"
                              tabIndex={0}
                              onClick={() => setEditReportData({ ...editReportData, emergencyType: type })}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setEditReportData({ ...editReportData, emergencyType: type }); }}
                              className={`nrs-type-chip ${active ? "nrs-type-active" : ""}`}
                              style={{
                                borderColor: active ? cfg.border : "#e5e7eb",
                                background: active ? cfg.bg : "white",
                              }}
                            >
<Icon name={cfg.icon} size={20} color={cfg.color} style={{ marginRight: "4px" }} />
                               <span style={{ fontSize: "0.8125rem", fontWeight: active ? 600 : 400 }}>{type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="nrs-field">
                      <label className="nrs-label">
                        <Icons.LuMapPin size={14} style={{ marginRight: "4px" }} />
                        Barangay <span className="required">*</span>
                      </label>
                      <select
                        value={editReportData.location}
                        onChange={(e) => setEditReportData({ ...editReportData, location: e.target.value })}
                        required
                        className="nrs-select"
                      >
                        <option value="">-- Select barangay --</option>
                        {barangays.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      {barangaySubAreas[editReportData.location] && (
                        <select
                          value={editReportData.subLocation || ""}
                          onChange={(e) => setEditReportData({ ...editReportData, subLocation: e.target.value })}
                          className="nrs-select"
                          style={{ marginTop: "8px" }}
                        >
                          <option value="">All {editReportData.location}</option>
                          {barangaySubAreas[editReportData.location].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="nrs-field">
                      <label className="nrs-label">
                        Description <span className="required">*</span>
                      </label>
                      <textarea
                        value={editReportData.description}
                        onChange={(e) => setEditReportData({ ...editReportData, description: e.target.value })}
                        required
                        rows={4}
                        placeholder="Describe what is happening, severity, number of people affected, and any immediate dangers..."
                        className="nrs-textarea"
                      />
                    </div>

                    <div className="nrs-actions">
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="nrs-submit"
                        style={{
                          padding: "12px 24px",
                          background: editLoading ? "#9ca3af" : "#f97316",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "1rem",
                          fontWeight: "500",
                          cursor: editLoading ? "not-allowed" : "pointer",
                          width: "100%"
                        }}
                      >
                        {editLoading ? "Updating..." : "Update Report"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="nrs-cancel"
                        style={{ padding: "12px 24px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              );
            }

            // Normal view: show report card with edit/delete buttons for reports (non-messages)
            return (
              <div
                key={item._id}
                className="report-card"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s",
                  borderLeft: item.isMessage ? "4px solid #6366f1" : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: typeConfig.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                      }}
                    >
                      {typeConfig.icon}
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: "2px",
                        }}
                      >
                        {item.isMessage ? (item.subject || "Message to Admin") : item.emergencyType}
                      </h4>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                        }}
                      >
                        {item.isMessage ? "Message to Admin" : `${item.type} Emergency`}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 14px",
                      background: statusConfig.bg,
                      color: statusConfig.color,
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}
                  >
                    <span>{statusConfig.icon}</span>
                    {item.isMessage ? "Sent" : item.status}
                  </div>
                </div>

                <p
                  style={{
                    color: "#374151",
                    lineHeight: "1.6",
                    marginBottom: "16px",
                    fontSize: "0.95rem",
                  }}
                >
                  {item.description}
                </p>

                {item.image && (
                  <div style={{ marginBottom: "16px" }}>
                    <img
                      src={item.image}
                      alt="Report attachment"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "320px",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        objectFit: "contain",
                        display: "block"
                      }}
                      onClick={() => {
                        const w = window.open("", "_blank");
                        if (w) {
                          w.document.write(`<html><head><title>Report Image</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111"><img src="${item.image}" style="max-width:100%;max-height:100vh;object-fit:contain"/></body></html>`);
                        }
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    flexWrap: "wrap",
                    paddingTop: "16px",
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  {item.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="location" size={14} style={{ color: "#6b7280" }} />
                      <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                        {item.location || "Location not specified"}
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Icon name="clock" size={14} style={{ color: "#6b7280" }} />
                    <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                      {formatDate(item.date)}
                    </span>
                  </div>
                  {item.isMessage && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        background: "#e0e7ff",
                        borderRadius: "8px",
                      }}
                    >
                      <Icon name="inbox" size={14} style={{ color: "#3730a3" }} />
                      <span style={{ fontSize: "0.875rem", color: "#3730a3" }}>
                        Sent to Admin
                      </span>
                    </div>
                  )}
                  {!item.isMessage && item.respondentName && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        background: "#f0fdf4",
                        borderRadius: "8px",
                      }}
                    >
                      <Icon name="user" size={14} style={{ color: "#166534" }} />
                      <span style={{ fontSize: "0.875rem", color: "#166534" }}>
                        Assigned to <strong>{item.respondentName}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit/Delete actions for reports (non-messages) */}
                {!item.isMessage && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleEditReport(item)}
                      style={{
                        padding: "6px 12px",
                        background: "#f97316",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        width: "fit-content"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReport(item._id)}
                      style={{
                        padding: "6px 12px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
);
            })}
        </div>
      )}
    </div>
);
  }

export default MyReports;
