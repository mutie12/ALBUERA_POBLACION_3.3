import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { Icon } from "../components/Icon";

function ResidentMessage() {
  const navigate = useNavigate();

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "resident") {
      navigate("/login");
    }
  }, [navigate]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("general");
  const [emergencyType, setEmergencyType] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState("");

  const userId = localStorage.getItem("userId") || "";
  const userName = localStorage.getItem("name") || "";

  // ── Barangay lists ─────────────────────────────────────────────────────────
  const barangays = [
    "Poblacion", "Balugo", "Damula-an", "Antipolo", "Benolho",
    "Doña Maria (Kangkuirina)", "Mahayag", "Mahayahay", "Salvacion",
    "San Pedro", "Seguinon", "Sherwood", "Tabgas", "Talisayan", "Tinag-an",
  ];

  const poblacionSubAreas = [
    "Canlalin / Canlalen", "Gungab", "Malitbog", "Soob", "Bagtan",
    "Sudlon", "San Andres", "Urban", "GK Village",
  ];

  const balugoSubAreas = ["Lawis", "Marka Baling", "Beachfront Area", "Balugo Proper"];

  // ── OTP countdown ──────────────────────────────────────────────────────────
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  // ── Emergency-type icon map (local — no sub-component render, avoids crashes) ──
  const emergencyIconMap = {
    "Fire":               { emoji: "🔥", color: "#ef4444" },
    "Flood":              { emoji: "🌊", color: "#3b82f6" },
    "Earthquake":         { emoji: "🌍", color: "#78716c" },
    "Typhoon":            { emoji: "🌀", color: "#06b6d4" },
    "Landslide":          { emoji: "⛰️", color: "#a16207" },
    "Medical Emergency":  { emoji: "🏥", color: "#10b981" },
    "Vehicular Accident": { emoji: "⚡", color: "#f59e0b" },
    "Crime/Violence":     { emoji: "🛡️", color: "#8b5cf6" },
    "Infrastructure Damage": { emoji: "🔧", color: "#78716c" },
    "Power Outage":       { emoji: "💡", color: "#f59e0b" },
    "Water Supply Issue": { emoji: "💧", color: "#3b82f6" },
    "Other":              { emoji: "⚠️", color: "#6b7280" },
  };

  const getEmergencyIcon = (type) => {
    const c = emergencyIconMap[type] || emergencyIconMap["Other"];
    return <span role="img" aria-label={type} style={{ fontSize: "1.25rem" }}>{c.emoji}</span>;
  };

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB"); return; }
    if (!file.type.startsWith("image/")) { setError("Choose a valid image file"); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ── Validation ──
    if (messageType === "general") {
      if (!subject.trim()) { setError("Enter a subject for your message"); return; }
    }
    if (messageType === "emergency") {
      if (!emergencyType) { setError("Select an emergency type"); return; }
      if (!location)       { setError("Select your barangay location");   return; }
    }
    if (!message.trim()) { setError("Enter a message"); return; }

    setLoading(true);
    try {
      const fullLocation = location && subLocation
        ? `${location} - ${subLocation}`
        : location;

      const payload = {
        residentId: userId,
        residentName: userName,
        subject: messageType === "emergency" && emergencyType
          ? `[${emergencyType}] Emergency Report`
          : subject,
        message: message.trim(),
        messageType,
        location: fullLocation,
        ...(image && { image }),
      };

      await api.post("/notifications/resident-message", payload);

      setSuccess(
        <><Icon name="checkCircle" size={18} style={{ marginRight: "6px", color: "#10b981" }} />
          Your message has been sent to the admin successfully!</>
      );
      // Reset form
      setSubject("");
      setMessage("");
      setEmergencyType("");
      setLocation("");
      setSubLocation("");
      setImage("");
      setMessageType("general");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="resident-message-page">
      <div className="rmp-inner">

        {/* ── Page heading ── */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{
            fontSize: "1.5rem", fontWeight: "700", color: "#1f2937",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Icon name="inbox" size={24} style={{ color: "#3b82f6" }} />
            Message Admin
          </h2>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>
            Send a private message to the admin. This will not be posted publicly.
          </p>
        </div>

        {/* ── Success banner ── */}
        {success && (
          <div style={{
            padding: "12px 16px", borderRadius: "8px", marginBottom: "20px",
            background: "#d1fae5", color: "#065f46",
            display: "flex", alignItems: "center", gap: "8px",
          }}>{success}</div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: "8px", marginBottom: "20px",
            background: "#fee2e2", color: "#991b1b",
            display: "flex", alignItems: "center", gap: "8px",
          }}><Icon name="alertTriangle" size={18} />{error}</div>
        )}

        {/* ── Form card ── */}
        <div className="rmp-form-card">
          <form onSubmit={handleSubmit}>

            {/* Message type selector */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Message Type
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                {/* General */}
                <label style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 16px", borderRadius: "8px", flex: 1,
                  border: messageType === "general" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  background: messageType === "general" ? "#eff6ff" : "white",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}>
                  <input
                    type="radio"
                    name="rm-messageType"
                    value="general"
                    checked={messageType === "general"}
                    onChange={() => { setMessageType("general"); setEmergencyType(""); setImage(""); }}
                    style={{ margin: 0 }}
                  />
                  <Icon name="send" size={14} style={{ color: "#3b82f6" }} />
                  <span style={{ fontWeight: 500 }}>General Message</span>
                </label>

                {/* Report Emergency */}
                <label style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 16px", borderRadius: "8px", flex: 1,
                  border: messageType === "emergency" ? "2px solid #ef4444" : "1px solid #d1d5db",
                  background: messageType === "emergency" ? "#fef2f2" : "white",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}>
                  <input
                    type="radio"
                    name="rm-messageType"
                    value="emergency"
                    checked={messageType === "emergency"}
                    onChange={() => { setMessageType("emergency"); setEmergencyType(""); setImage(""); }}
                    style={{ margin: 0 }}
                  />
                  <Icon name="siren" size={14} style={{ color: "#ef4444" }} />
                  <span style={{ fontWeight: 500 }}>Report Emergency</span>
                </label>
              </div>

              <p style={{
                fontSize: "0.875rem", color: "#6b7280", marginTop: "8px",
              }}>
                {messageType === "emergency"
                  ? "Use this to report an emergency that requires immediate attention. The admin will be notified immediately."
                  : "Use this for general inquiries, concerns, or non-urgent matters."
                }
              </p>
            </div>

            {/* Subject — general only */}
            {messageType === "general" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Subject <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="What is this about?"
                  style={{
                    width: "100%", padding: "12px", borderRadius: "8px",
                    border: "1px solid #d1d5db", fontSize: "1rem",
                  }}
                />
              </div>
            )}

             {/* Location */}
             <div style={{ marginBottom: "20px" }}>
               <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                 Location (Barangay)
                 {messageType === "emergency" && <span style={{ color: "#ef4444" }}> *</span>}
               </label>
               <select
                 value={location}
                 onChange={(e) => { setLocation(e.target.value); setSubLocation(""); }}
                 required={messageType === "emergency"}
                 style={{
                   width: "100%", padding: "12px", borderRadius: "8px",
                   border: "1px solid #d1d5db", fontSize: "1rem", background: "white",
                 }}
               >
                 <option value="">-- Select a location --</option>
                 {barangays.map((b) => <option key={b} value={b}>{b}</option>)}
               </select>
             </div>

            {/* Sub-area for Poblacion / Balugo */}
            {(location === "Poblacion" || location === "Balugo") && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  {location} Sub-Area
                </label>
                <select
                  value={subLocation}
                  onChange={(e) => setSubLocation(e.target.value)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "8px",
                    border: "1px solid #d1d5db", fontSize: "1rem", background: "white",
                  }}
                >
                  <option value="">All {location}</option>
                  {(location === "Poblacion" ? poblacionSubAreas : balugoSubAreas).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Emergency types — emergency only */}
            {messageType === "emergency" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Emergency Type <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "8px",
                }}>
                  {Object.keys(emergencyIconMap).map((type) => {
                    const cfg = emergencyIconMap[type];
                    const active = emergencyType === type;
                    return (
                      <div
                        key={type}
                        role="button"
                        tabIndex={0}
                        onClick={() => setEmergencyType(type)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setEmergencyType(type); }}
                        style={{
                          padding: "12px 8px", borderRadius: "8px", textAlign: "center",
                          border: active ? `2px solid ${cfg.color}` : "1px solid #d1d5db",
                          background: active ? `${cfg.color}18` : "white",
                          cursor: "pointer", fontSize: "0.8125rem", fontWeight: active ? 600 : 400,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{cfg.emoji}</div>
                        <div>{type}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Message textarea */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Message <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder={
                  messageType === "emergency"
                    ? "Provide details about the emergency:\n- Location (address/area)\n- What's happening\n- Any immediate dangers\n- Your contact number if different from profile"
                    : "Type your message here..."
                }
                style={{
                  width: "100%", padding: "12px", borderRadius: "8px",
                  border: "1px solid #d1d5db", fontSize: "1rem",
                  resize: "vertical", fontFamily: "inherit",
                }}
              />
            </div>

            {/* Image upload */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Attach Image <span style={{ color: "#6b7280", fontWeight: "400" }}>(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
              />
              {image && (
                <div style={{ marginTop: "12px", position: "relative", display: "inline-block" }}>
                  <img
                    src={image}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", border: "1px solid #d1d5db", display: "block" }}
                  />
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    style={{
                      position: "absolute", top: "4px", right: "4px",
                      background: "rgba(0,0,0,0.6)", color: "white", border: "none",
                      borderRadius: "50%", width: "24px", height: "24px",
                      fontSize: "0.75rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon name="x" size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 24px",
                background: loading ? "#9ca3af" : messageType === "emergency" ? "#ef4444" : "#3b82f6",
                color: "white", border: "none", borderRadius: "8px",
                fontSize: "1rem", fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {loading ? (
                "Sending..."
              ) : messageType === "emergency" ? (
                <><Icon name="siren" size={18} /> Submit Emergency Report</>
              ) : (
                <><Icon name="send" size={18} /> Send Message</>
              )}
            </button>
          </form>

          {/* Note footer */}
          <div style={{
            marginTop: "24px", padding: "16px", background: "#f3f4f6",
            borderRadius: "8px", fontSize: "0.875rem", color: "#6b7280",
          }}>
            <p style={{ margin: 0, fontWeight: "500", marginBottom: "8px" }}>
              <Icon name="info" size={14} style={{ marginRight: "4px" }} />Note:
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li>Your message is sent privately to the admin only</li>
              <li>Emergency reports will be prioritized by the admin</li>
              <li>For life-threatening emergencies, please also dial 911</li>
              <li>For public emergency reports, use the "Report Emergency" button on the home page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResidentMessage;
