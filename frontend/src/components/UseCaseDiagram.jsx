import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

const UseCaseDiagram = () => {
  const svgRef = useRef();
  const [selectedActor, setSelectedActor] = useState(null);

  const drawDiagram = useCallback(() => {
    const width = 900;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("font-family", "Arial, sans-serif");

    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#1e40af")
      .text("Albuera EMS - Use Case Diagram");

    // Actor positions
    const actors = [
      { id: "resident", name: "Resident", x: 80, y: 120, color: "#ef4444" },
      { id: "respondent", name: "Respondent", x: 80, y: 280, color: "#3b82f6" },
      { id: "admin", name: "Admin", x: 80, y: 440, color: "#8b5cf6" }
    ];

    // Use case positions
    const useCases = [
      { id: "report", name: "Report Emergency", x: 320, y: 80, width: 140, height: 50 },
      { id: "track", name: "Track Reports", x: 320, y: 150, width: 140, height: 50 },
      { id: "respond", name: "Respond to Emergency", x: 320, y: 240, width: 160, height: 50 },
      { id: "assign", name: "Assign Tasks", x: 320, y: 310, width: 140, height: 50 },
      { id: "notify", name: "Send Notifications", x: 320, y: 380, width: 160, height: 50 },
      { id: "verify", name: "Verify Residents", x: 320, y: 450, width: 160, height: 50 },
      { id: "manage", name: "Manage Users", x: 540, y: 150, width: 140, height: 50 },
      { id: "news", name: "Post News", x: 540, y: 240, width: 140, height: 50 },
      { id: "dashboard", name: "View Dashboard", x: 540, y: 330, width: 140, height: 50 }
    ];

    // Relationships (actor -> use case)
    const relationships = [
      { from: "resident", to: "report" },
      { from: "resident", to: "track" },
      { from: "respondent", to: "respond" },
      { from: "respondent", to: "track" },
      { from: "admin", to: "assign" },
      { from: "admin", to: "notify" },
      { from: "admin", to: "verify" },
      { from: "admin", to: "manage" },
      { from: "admin", to: "news" },
      { from: "admin", to: "dashboard" },
      { from: "resident", to: "dashboard" },
      { from: "respondent", to: "dashboard" }
    ];

    // Draw use cases (ellipses)
    useCases.forEach(uc => {
      const isHighlighted = selectedActor && relationships
        .filter(r => r.from === selectedActor)
        .some(r => r.to === uc.id);

      // Background ellipse
      g.append("ellipse")
        .attr("cx", uc.x + uc.width/2)
        .attr("cy", uc.y)
        .attr("rx", uc.width/2)
        .attr("ry", uc.height/2)
        .attr("fill", isHighlighted ? "#dbeafe" : "white")
        .attr("stroke", isHighlighted ? "#1d4ed8" : "#3b82f6")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("click", () => {
          const relatedActors = relationships
            .filter(r => r.to === uc.id)
            .map(r => r.from);
          if (relatedActors.length > 0) {
            setSelectedActor(relatedActors[0]);
          }
        });

      g.append("text")
        .attr("x", uc.x + uc.width/2)
        .attr("y", uc.y + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("fill", "#1e293b")
        .text(uc.name);
    });

    // Draw actors
    actors.forEach(actor => {
      const isSelected = selectedActor === actor.id;

      // Actor stick figure
      const ax = actor.x;
      const ay = actor.y;

      // Highlight box
      if (isSelected) {
        g.append("rect")
          .attr("x", ax - 35)
          .attr("y", ay - 90)
          .attr("width", 70)
          .attr("height", 160)
          .attr("fill", "#fef3c7")
          .attr("stroke", "#f59e0b")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      }

      // Head
      g.append("circle")
        .attr("cx", ax)
        .attr("cy", ay - 60)
        .attr("r", 15)
        .attr("fill", actor.color)
        .style("cursor", "pointer")
        .on("click", () => setSelectedActor(isSelected ? null : actor.id));

      g.append("text")
        .attr("x", ax)
        .attr("y", ay - 55)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "12px")
        .style("fill", "white")
        .text("U");

      // Body
      g.append("line")
        .attr("x1", ax)
        .attr("y1", ay - 45)
        .attr("x2", ax)
        .attr("y2", ay - 15)
        .attr("stroke", actor.color)
        .attr("stroke-width", 3);

      // Arms
      g.append("line")
        .attr("x1", ax - 20)
        .attr("y1", ay - 35)
        .attr("x2", ax + 20)
        .attr("y2", ay - 35)
        .attr("stroke", actor.color)
        .attr("stroke-width", 3);

      // Legs
      g.append("line")
        .attr("x1", ax)
        .attr("y1", ay - 15)
        .attr("x2", ax - 15)
        .attr("y2", ay + 15)
        .attr("stroke", actor.color)
        .attr("stroke-width", 3);

      g.append("line")
        .attr("x1", ax)
        .attr("y1", ay - 15)
        .attr("x2", ax + 15)
        .attr("y2", ay + 15)
        .attr("stroke", actor.color)
        .attr("stroke-width", 3);

      // Actor name
      g.append("text")
        .attr("x", ax)
        .attr("y", ay + 35)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .style("font-weight", isSelected ? "bold" : "normal")
        .style("fill", actor.color)
        .style("cursor", "pointer")
        .on("click", () => setSelectedActor(isSelected ? null : actor.id))
        .text(actor.name);
    });

    // Draw relationships (lines from actors to use cases)
    relationships.forEach(rel => {
      const actor = actors.find(a => a.id === rel.from);
      const uc = useCases.find(u => u.id === rel.to);
      if (!actor || !uc) return;

      const isHighlighted = selectedActor && selectedActor === rel.from;

      g.append("line")
        .attr("x1", actor.x)
        .attr("y1", actor.y - 40)
        .attr("x2", uc.x + uc.width/2)
        .attr("y2", uc.y)
        .attr("stroke", isHighlighted ? "#f59e0b" : "#94a3b8")
        .attr("stroke-width", isHighlighted ? 2.5 : 1.5)
        .attr("stroke-dasharray", "5,5");
    });

    // Draw system boundary box
    g.append("rect")
      .attr("x", 270)
      .attr("y", 40)
      .attr("width", innerWidth - 310)
      .attr("height", innerHeight - 80)
      .attr("fill", "none")
      .attr("stroke", "#64748b")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "10,5");

    g.append("text")
      .attr("x", 280)
      .attr("y", 35)
      .attr("font-size", "12px")
      .style("fill", "#64748b")
      .text("Albuera EMS System");

    // Legend
    const legendY = innerHeight - 60;
    const legendItems = [
      { label: "Resident", color: "#ef4444" },
      { label: "Respondent", color: "#3b82f6" },
      { label: "Admin", color: "#8b5cf6" }
    ];

    legendItems.forEach((item, i) => {
      g.append("circle")
        .attr("cx", 300 + i * 150)
        .attr("cy", legendY)
        .attr("r", 10)
        .attr("fill", item.color);

      g.append("text")
        .attr("x", 315 + i * 150)
        .attr("y", legendY + 4)
        .style("font-size", "11px")
        .style("fill", "#475569")
        .text(item.label);
    });

    // Interaction hint
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#94a3b8")
      .text("Click actors or use cases to highlight related items");
  }, [selectedActor]);

  useEffect(() => {
    drawDiagram();
  }, [drawDiagram]);

  const downloadSVG = () => {
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "albuera-ems-usecase.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = () => {
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 900;
    canvas.height = 600;

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = "albuera-ems-usecase.png";
        a.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      });
    };

    img.src = url;
  };

  return (
    <div className="usecase-diagram-container" style={{ padding: "20px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <h2 style={{ color: "#1e40af", margin: 0 }}>Use Case Diagram</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={downloadSVG}
            className="btn btn-outline-primary"
            style={{
              padding: "8px 16px",
              border: "1px solid #3b82f6",
              borderRadius: "6px",
              background: "white",
              color: "#3b82f6",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            Download SVG
          </button>
          <button
            onClick={downloadPNG}
            className="btn btn-primary"
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              background: "#1e40af",
              color: "white",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            Download PNG
          </button>
          <button
            onClick={() => setSelectedActor(null)}
            className="btn btn-secondary"
            style={{
              padding: "8px 16px",
              border: "1px solid #94a3b8",
              borderRadius: "6px",
              background: selectedActor ? "#f3f4f6" : "white",
              color: "#475569",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            Reset View
          </button>
        </div>
      </div>

      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "auto"
      }}>
        <svg ref={svgRef}></svg>
      </div>

      {selectedActor && (
        <div style={{
          marginTop: "20px",
          padding: "16px",
          background: "#eff6ff",
          borderRadius: "8px",
          border: "1px solid #dbeafe"
        }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#1d4ed8" }}>
            Selected: {selectedActor === "resident" ? "Resident" : selectedActor === "respondent" ? "Respondent" : "Admin"}
          </h4>
          <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>
            Showing all use cases available to {selectedActor === "resident" ? "residents" : selectedActor === "respondent" ? "respondents" : "admins"}.
          </p>
        </div>
      )}
    </div>
  );
};

export default UseCaseDiagram;
