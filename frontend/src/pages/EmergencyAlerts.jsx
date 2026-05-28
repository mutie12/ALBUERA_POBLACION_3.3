import { useState } from "react";
import api from "../api";
import { Icon } from "../components/Icon";

const HAZARD_TYPES = [
  { value: "Flood", label: "Flood", icon: "waves", color: "#3b82f6" },
  { value: "Fire", label: "Fire", icon: "flame", color: "#ef4444" },
  { value: "Earthquake", label: "Earthquake", icon: "activity", color: "#78716c" },
  { value: "Typhoon", label: "Typhoon", icon: "cloud", color: "#06b6d4" },
  { value: "Landslide", label: "Landslide", icon: "activity", color: "#a16207" },
  { value: "Medical Emergency", label: "Medical Emergency", icon: "heart", color: "#10b981" },
  { value: "Vehicular Accident", label: "Vehicular Accident", icon: "car", color: "#f59e0b" },
  { value: "Crime/Violence", label: "Crime/Violence", icon: "shield", color: "#8b5cf6" },
  { value: "Power Outage", label: "Power Outage", icon: "bolt", color: "#f59e0b" },
  { value: "Water Supply Issue", label: "Water Supply Issue", icon: "droplets", color: "#3b82f6" },
  { value: "Natural Disaster", label: "Natural Disaster", icon: "cloud", color: "#f97316" },
  { value: "Infrastructure Damage", label: "Infrastructure Damage", icon: "wrench", color: "#78716c" },
  { value: "Other", label: "Other", icon: "alert", color: "#6b7280" },
];

const ALERT_TEMPLATES = {
  "Typhoon": {
    title: "TYPHOON WARNING: Secure your belongings",
    message: "Typhoon warning issued for your area. Secure your belongings, stay indoors, and prepare for possible evacuation. Monitor official emergency updates.",
    urgency: "critical"
  },
  "Medical Emergency": {
    title: "MEDICAL EMERGENCY ALERT",
    message: "Medical emergency reported in your area. Emergency responders are on the way. Please keep roads clear and assist only when safe to do so.",
    urgency: "high"
  },
  "Power Outage": {
    title: "POWER OUTAGE ALERT",
    message: "Power interruption reported in your area. Please unplug electrical appliances and use flashlights for safety. Updates will be provided once power is restored.",
    urgency: "medium"
  },
  "Crime/Violence": {
    title: "CRIME AND VIOLENCE ALERT",
    message: "Security alert! Please stay indoors and avoid the affected area. Report suspicious activities immediately to barangay officials or local authorities.",
    urgency: "high"
  },
  "Landslide": {
    title: "LANDSLIDE ALERT - Evacuate immediately",
    message: "Possible landslide detected near hazard-prone areas. Residents are advised to evacuate immediately and avoid steep slopes or unstable ground.",
    urgency: "critical"
  },
  "Water Supply Issue": {
    title: "WATER SUPPLY INTERRUPTION ALERT",
    message: "Water supply interruption reported in your area. Residents are advised to conserve water while repair operations are ongoing.",
    urgency: "medium"
  },
  "Natural Disaster": {
    title: "NATURAL DISASTER WARNING",
    message: "Emergency warning issued due to severe natural hazard conditions. Stay alert, prepare emergency kits, and follow instructions from emergency authorities.",
    urgency: "critical"
  },
  "Infrastructure Damage": {
    title: "INFRASTRUCTURE DAMAGE ALERT",
    message: "Damage to roads/buildings/utilities has been reported. Avoid affected areas for your safety and wait for further advisories from barangay officials.",
    urgency: "high"
  }
};

function EmergencyAlerts() {
  const barangays = [
    "Poblacion", "Balugo", "Damula-an", "Antipolo", "Benolho",
    "Doña Maria (Kangkuirina)", "Mahayag", "Mahayahay", "Salvacion",
    "San Pedro", "Seguinon", "Sherwood", "Tabgas", "Talisayan", "Tinag-an"
  ];

  const poblacionSubAreas = [
    "Canlalin / Canlalen", "Gungab", "Malitbog", "Soob", "Bagtan",
    "Sudlon", "San Andres", "Urban", "GK Village"
  ];

  const balugoSubAreas = [
    "Lawis", "Marka Baling", "Beachfront Area", "Balugo Proper"
  ];

  const barangaySubAreas = {
    Poblacion: poblacionSubAreas,
    Balugo: balugoSubAreas
  };

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    urgency: "high",
    barangay: "",
    subLocation: "",
    hazardType: "Flood",
    details: ""
  });

  const applyTemplate = (hazardType) => {
    const template = ALERT_TEMPLATES[hazardType];
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.title,
        message: template.message,
        urgency: template.urgency
      }));
    }
  };

  const handleHazardTypeChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, hazardType: value });
    applyTemplate(value);
  };
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertIsSuccess, setAlertIsSuccess] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "barangay") {
      setFormData({ ...formData, barangay: value, subLocation: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMessage(null);

    try {
      await api.post("/news/emergency-alert", formData);
      setAlertIsSuccess(true);
      setAlertMessage("Emergency alert sent successfully! SMS notifications have been dispatched.");
      setFormData({ title: "", message: "", urgency: "high", barangay: "", subLocation: "", hazardType: "Flood", details: "" });

      setTimeout(() => setAlertMessage(null), 5000);
    } catch (err) {
      console.error("Failed to send emergency alert:", err);
      setAlertIsSuccess(false);
      setAlertMessage(err.response?.data?.message || "Failed to send emergency alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "8px", color: "#dc2626" }}><Icon name="siren" size={28} /> Send Emergency Alert</h2>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>
          Send an urgent emergency alert with SMS notifications to all users (respondents and residents).
        </p>

        {alertMessage && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            background: alertIsSuccess ? "#d1fae5" : "#fee2e2",
            color: alertIsSuccess ? "#065f46" : "#991b1b"
          }}>
            <><Icon name={alertIsSuccess ? "checkCircle" : "xCircle"} size={18} /> {alertMessage}</>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Alert Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
              placeholder="e.g., FLOOD WARNING - AREA A"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Hazard Type
            </label>
            <select
              name="hazardType"
              value={formData.hazardType}
              onChange={handleHazardTypeChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                backgroundColor: "white"
              }}
            >
              {HAZARD_TYPES.map(h => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Urgency Level
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                backgroundColor: "white"
              }}
            >
              <option value="critical">Critical - Immediate action required</option>
              <option value="high">High - Urgent attention needed</option>
              <option value="medium">Medium - Attention required</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Location (Barangay)
            </label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                backgroundColor: "white"
              }}
            >
              <option value="">All Locations</option>
              {barangays.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {barangaySubAreas[formData.barangay] && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                {formData.barangay} Sub-Area
              </label>
              <select
                name="subLocation"
                value={formData.subLocation}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  backgroundColor: "white"
                }}
              >
                <option value="">All {formData.barangay}</option>
                {barangaySubAreas[formData.barangay].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Additional Details (Optional)
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                resize: "vertical",
                fontFamily: "inherit"
              }}
              placeholder="Evacuation center, road closures, safety instructions..."
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Alert Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                resize: "vertical",
                fontFamily: "inherit"
              }}
              placeholder="Enter the emergency details and instructions..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 24px",
              background: loading ? "#9ca3af" : "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%"
            }}
          >
            {loading ? "Sending..." : <><Icon name="siren" size={16} color="white" /> Send Emergency Alert (SMS + In-App)</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmergencyAlerts;
