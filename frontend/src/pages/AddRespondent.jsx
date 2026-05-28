import { useState } from "react";
import api from "../api";
import { Icon } from "../components/Icon";

function AddRespondent() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    badgeNumber: "",
    vehicleNumber: "",
    department: "",
    barangay: "",
    role: "respondent"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageIsSuccess, setMessageIsSuccess] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post("/auth/register", formData);
      setMessageIsSuccess(true);
      setMessage(<><Icon name="checkCircle" size={18} /> Respondent added successfully!</>);
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        badgeNumber: "",
        vehicleNumber: "",
        department: "",
        barangay: "",
        role: "respondent"
      });
    } catch (err) {
      console.error("Failed to add respondent:", err);
      // Show more detailed error message
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Server error during registration";
      setMessageIsSuccess(false);
      setMessage(<><Icon name="xCircle" size={18} /> {errorMsg}</>);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "24px", color: "#1f2937" }}><Icon name="ambulance" size={28} /> Add New Respondent</h2>
        
        {message && (
          <div style={{ 
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            background: messageIsSuccess ? "#d1fae5" : "#fee2e2",
            color: messageIsSuccess ? "#065f46" : "#991b1b",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
              placeholder="Enter full name"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
              placeholder="Optional - will be auto-generated if left empty"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
              placeholder="Enter email address (optional)"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
              placeholder="Enter password"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
              placeholder="Enter phone number"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Badge Number
              </label>
              <input
                type="text"
                name="badgeNumber"
                value={formData.badgeNumber}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem"
                }}
                placeholder="Enter badge number"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem"
                }}
                placeholder="Enter vehicle number"
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Barangay
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
                fontSize: "1rem"
              }}
            >
              <option value="">Select barangay</option>
              <option value="Poblacion">Poblacion</option>
              <option value="Balugo">Balugo</option>
              <option value="San Isidro">San Isidro</option>
              <option value="San Juan">San Juan</option>
              <option value="San Pedro">San Pedro</option>
              <option value="San Roque">San Roque</option>
              <option value="Damula-an">Damula-an</option>
              <option value="Mahayag">Mahayag</option>
              <option value="Talisayan">Talisayan</option>
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
            >
              <option value="">Select department</option>
              <option value="Fire Department">Fire Department</option>
              <option value="Police Department">Police Department</option>
              <option value="Barangay Tanod">Barangay Tanod</option>
              <option value="MDRRMC Department">MDRRMC Department</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 24px",
              background: loading ? "#9ca3af" : "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%"
            }}
          >
            {loading ? "Adding Respondent..." : <><Icon name="plus" size={16} /> Add Respondent</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRespondent;
