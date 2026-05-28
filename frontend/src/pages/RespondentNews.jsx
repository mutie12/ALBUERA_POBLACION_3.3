import { useState, useEffect } from "react";
import api from "../api";
import { Icon } from "../components/Icon";
import * as Icons from "react-icons/lu";

function RespondentNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState(null);
  const [createMsgOk, setCreateMsgOk] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("announcement");
  const [newPriority, setNewPriority] = useState("normal");
  const [error, setError] = useState("");
  const userDepartment = localStorage.getItem("department") || "";

  const fetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/news");
      setNews(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch news");
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreateLoading(true);
    setCreateMessage(null);
    try {
      await api.post("/news", {
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        priority: newPriority
      });
      setCreateMsgOk(true);
      setCreateMessage(<><Icon name="checkCircle" size={18} /> News posted successfully!</>);
      setNewTitle("");
      setNewContent("");
      setNewCategory("announcement");
      setNewPriority("normal");
      setShowCreateForm(false);
      fetchNews();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to post news";
      setCreateMsgOk(false);
      setCreateMessage(<><Icon name="xCircle" size={18} /> {msg}</>);
      setError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = news.filter(item =>
    !searchTerm ||
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case "alert": return <Icon name="siren" size={20} color="#ef4444" />;
      case "safety-tip": return <Icons.LuLamp size={20} color="#f59e0b" />;
      case "update": return <Icons.LuRefreshCw size={20} color="#06b6d4" />;
      default: return <Icon name="bellRing" size={20} color="#3730a3" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "alert": return { bg: "#fee2e2", color: "#991b1b" };
      case "safety-tip": return { bg: "#d1fae5", color: "#065f46" };
      case "update": return { bg: "#fef3c7", color: "#92400e" };
      default: return { bg: "#dbeafe", color: "#1e40af" };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high": return { borderLeft: "4px solid #ef4444" };
      case "normal": return { borderLeft: "4px solid #3b82f6" };
      default: return { borderLeft: "4px solid #10b981" };
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner"></div>
          <h3 style={{ marginTop: "24px", color: "var(--text-secondary)" }}>Loading news...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 8px" }}>
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
            <span>Error loading news: {error}</span>
          </div>
          <button 
            onClick={() => {
              setError("");
              fetchNews();
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

      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "8px", color: "#1f2937" }}>
          <><Icon name="fileText" size={24} style={{ marginRight: "6px" }} /> News & Updates</>
        </h1>
        <p style={{ color: "#6b7280" }}>
          Stay informed with the latest announcements and safety tips from the admin
        </p>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-secondary">
            <><Icon name="plus" size={16} style={{ marginRight: "4px" }} /> {showCreateForm ? "Cancel" : "Create News"}</>
          </button>
        </div>
      </div>

      {/* Create News Form */}
      {showCreateForm && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, color: "#1f2937" }}><Icon name="fileText" size={20} style={{ marginRight: "6px" }} /> Post a News Article</h3>
            <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary" style={{ padding: "6px 14px" }}>✕</button>
          </div>

          {createMessage && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              background: createMsgOk ? "#d1fae5" : "#fee2e2",
              color: createMsgOk ? "#065f46" : "#991b1b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.875rem"
            }}>
              {createMessage}
            </div>
          )}

          <form onSubmit={handleCreateNews}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "0.875rem" }}>Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter news title"
                required
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "8px",
                  border: "1px solid #d1d5db", fontSize: "1rem"
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "0.875rem" }}>Content *</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Enter news content"
                required
                rows={4}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "8px",
                  border: "1px solid #d1d5db", fontSize: "1rem",
                  resize: "vertical", fontFamily: "inherit"
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "0.875rem" }}>Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem" }}
                >
                  <option value="announcement">Announcement</option>
                  <option value="safety-tip">Safety Tip</option>
                  <option value="update">Update</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "0.875rem" }}>Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem" }}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={createLoading}
              style={{
                padding: "12px 24px",
                background: createLoading ? "#9ca3af" : "#7c3aed",
                color: "white", border: "none", borderRadius: "8px",
                fontSize: "1rem", fontWeight: "500", cursor: createLoading ? "not-allowed" : "pointer",
                width: "100%"
              }}
            >
              {createLoading ? "Posting..." : <><Icon name="send" size={16} style={{ marginRight: "4px" }} /> Post News</>}
            </button>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ position: "relative", maxWidth: "100%" }}>
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px 14px 48px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              fontSize: "1rem",
              background: "white",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          />
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem" }}>
            <Icons.LuSearch size={18} color="#9ca3af" />
          </span>
        </div>
      </div>

      {/* News List */}
      {filteredNews.length === 0 ? (
        <div className="empty-state">
          <span className="icon"><Icon name="fileText" size={18} color="#f59e0b" /></span>
          <h3>{searchTerm ? "No Results Found" : "No News Available"}</h3>
          <p>
            {searchTerm 
              ? `No news matching "${searchTerm}"`
              : "Check back later for updates from the admin"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredNews.map((item, index) => (
            <div
              key={item._id}
              className="report-card animate-slide-up"
              style={{
                ...getPriorityStyle(item.priority),
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className="report-card-body">
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start", 
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "12px"
                }}>
                  <h3 style={{ 
                    fontSize: "1.125rem", 
                    fontWeight: "600",
                    color: "#1f2937",
                    flex: "1 1 200px"
                  }}>
                    {item.title}
                  </h3>
                  <span style={{ 
                    fontSize: "0.8125rem", 
                    padding: "20px 30px", 
                    borderRadius: "10px",
                    background: getCategoryColor(item.category).bg,
                    color: getCategoryColor(item.category).color,
                    fontWeight: "500",
                    whiteSpace: "nowrap"
                  }}>
                    {getCategoryIcon(item.category)} {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                </div>
                
                <p style={{ 
                  fontSize: "0.9375rem", 
                  color: "var(--text-secondary)", 
                  lineHeight: "1.7",
                  marginBottom: "16px"
                }}>
                  {item.content}
                </p>
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--gray-100)",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                      {item.author?.name && (
                        <span style={{ marginRight: "8px" }}>
                          <><Icon name="user" size={14} style={{ marginRight: "4px" }} />{item.author.name}</>
                        </span>
                      )}
                      {item.author?.department && (
                        <span style={{ marginRight: "8px", background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "500" }}>
                          {item.author.department}
                        </span>
                      )}
                    <span>
                      <><Icon name="clock" size={14} style={{ marginRight: "4px" }} />{new Date(item.createdAt).toLocaleString()}</>
                    </span>
                  </div>
                  
                  {item.priority === "high" && (
                    <span style={{ 
                      fontSize: "0.75rem", 
                      padding: "4px 8px", 
                      background: "#fef2f2", 
                      color: "#dc2626",
                      borderRadius: "4px",
                      fontWeight: "600"
                    }}>
                      <><Icon name="alertTriangle" size={14} style={{ marginRight: "4px" }} /> Important</>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <button onClick={fetchNews} className="btn btn-secondary">
          <><Icon name="refreshCw" size={18} style={{ marginRight: "4px" }} /> Refresh News</>
        </button>
      </div>
    </div>
  );
}

export default RespondentNews;
