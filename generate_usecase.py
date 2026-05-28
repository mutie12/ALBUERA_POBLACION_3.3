#!/usr/bin/env python3
"""
Albuera EMS Use Case Diagram Generator
Generates use case diagrams for the Albuera Emergency Management System

Usage:
    python generate_usecase.py [output.png|output.svg] [method]

Methods:
    mermaid - Uses mermaid CLI (default if available)
    d3 - Uses D3.js SVG generation
    plantuml - Uses PlantUML server API
    svg - Generates SVG directly
"""

import sys
import os
import json
import base64
import urllib.request
import urllib.parse

def generate_mermaid_diagram():
    """Mermaid diagram definition for Albuera EMS"""
    return """
graph TD
    subgraph Actors
        A[Resident]:::actor
        B[Emergency Respondent]:::actor
        C[System Administrator]:::actor
    end
    
    subgraph System[Albuera EMS System]
        UC1[Report Emergency]
        UC2[Track Report Status]
        UC3[View Emergency Alerts]
        UC4[Respond to Emergency]
        UC5[Assign Tasks]
        UC6[Send Notifications]
        UC7[Verify Residents]
        UC8[Manage Users]
        UC9[Post News]
        UC10[View Dashboard]
    end
    
    A -->|Report| UC1
    A -->|Track| UC2
    A -->|View| UC3
    A -->|Access| UC10
    
    B -->|Monitor| UC2
    B -->|Respond| UC4
    B -->|Access| UC10
    
    C -->|Monitor| UC1
    C -->|Manage| UC5
    C -->|Send| UC6
    C -->|Verify| UC7
    C -->|Manage| UC8
    C -->|Publish| UC9
    C -->|Manage| UC10
    
    classDef actor fill:#EAB308,stroke:#B45309,stroke-width:2px
    classDef system fill:#EFF6FF,stroke:#1E40AF,stroke-width:2px
    classDef usecase fill:#FFFFFF,stroke:#3B82F6,stroke-width:2px
    
    class A,B,C actor
    class System system
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10 usecase
    """

def generate_plantuml_diagram():
    """PlantUML diagram definition"""
    return """@startuml
actor "Resident" as R
actor "Respondent" as E
actor "Admin" as A

rectangle "Albuera EMS System" {
  usecase "Report Emergency" as UC1
  usecase "Track Status" as UC2
  usecase "View Alerts" as UC3
  usecase "Respond" as UC4
  usecase "Assign Tasks" as UC5
  usecase "Send SMS" as UC6
  usecase "Verify" as UC7
  usecase "Manage Users" as UC8
  usecase "Post News" as UC9
  usecase "Dashboard" as UC10
}

R --> UC1
R --> UC2
R --> UC3
R --> UC10
E --> UC2
E --> UC4
E --> UC10
A --> UC1
A --> UC2
A --> UC3
A --> UC4
A --> UC5
A --> UC6
A --> UC7
A --> UC8
A --> UC9
A --> UC10
@enduml"""

def generate_svg():
    """Generate SVG directly"""
    width = 900
    height = 600
    
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <style>
      .actor-text {{ font: bold 14px Arial; fill: #B45309; }}
      .usecase-text {{ font: 12px Arial; fill: #1F2937; }}
      .title {{ font: bold 18px Arial; fill: #1E40AF; }}
      .actor-icon {{ fill: #EAB308; stroke: #B45309; stroke-width: 2; }}
      .usecase-box {{ fill: white; stroke: #3B82F6; stroke-width: 2; }}
      .system-box {{ fill: none; stroke: #64748B; stroke-width: 2; stroke-dasharray: 10,5; }}
      .relation {{ stroke: #94A3B8; stroke-width: 1.5; stroke-dasharray: 5,5; }}
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="{width}" height="{height}" fill="white"/>
  
  <!-- Title -->
  <text x="{width//2}" y="30" text-anchor="middle" class="title">Albuera EMS - Use Case Diagram</text>
  
  <!-- System Boundary -->
  <rect x="260" y="60" width="580" height="480" class="system-box"/>
  <text x="270" y="55" class="usecase-text">Albuera EMS System</text>
  
  <!-- Actors -->
  <!-- Resident -->
  <g id="resident" transform="translate(120, 130)">
    <circle cx="0" cy="-50" r="20" class="actor-icon"/>
    <text x="0" y="-44" text-anchor="middle" fill="white" font-size="12">👤</text>
    <line x1="0" y1="-30" x2="0" y2="0" stroke="#EAB308" stroke-width="3"/>
    <line x1="-20" y1="-20" x2="20" y2="-20" stroke="#EAB308" stroke-width="3"/>
    <line x1="0" y1="0" x2="-15" y2="25" stroke="#EAB308" stroke-width="3"/>
    <line x1="0" y1="0" x2="15" y2="25" stroke="#EAB308" stroke-width="3"/>
    <text x="0" y="45" text-anchor="middle" class="actor-text">Resident</text>
  </g>
  
  <!-- Respondent -->
  <g id="respondent" transform="translate(120, 300)">
    <circle cx="0" cy="-50" r="20" class="actor-icon"/>
    <text x="0" y="-44" text-anchor="middle" fill="white" font-size="12">👤</text>
    <line x1="0" y1="-30" x2="0" y2="0" stroke="#3B82F6" stroke-width="3"/>
    <line x1="-20" y1="-20" x2="20" y2="-20" stroke="#3B82F6" stroke-width="3"/>
    <line x1="0" y1="0" x2="-15" y2="25" stroke="#3B82F6" stroke-width="3"/>
    <line x1="0" y1="0" x2="15" y2="25" stroke="#3B82F6" stroke-width="3"/>
    <text x="0" y="45" text-anchor="middle" class="actor-text" fill="#3B82F6">Respondent</text>
  </g>
  
  <!-- Admin -->
  <g id="admin" transform="translate(120, 470)">
    <circle cx="0" cy="-50" r="20" class="actor-icon"/>
    <text x="0" y="-44" text-anchor="middle" fill="white" font-size="12">👤</text>
    <line x1="0" y1="-30" x2="0" y2="0" stroke="#8B5CF6" stroke-width="3"/>
    <line x1="-20" y1="-20" x2="20" y2="-20" stroke="#8B5CF6" stroke-width="3"/>
    <line x1="0" y1="0" x2="-15" y2="25" stroke="#8B5CF6" stroke-width="3"/>
    <line x1="0" y1="0" x2="15" y2="25" stroke="#8B5CF6" stroke-width="3"/>
    <text x="0" y="45" text-anchor="middle" class="actor-text" fill="#8B5CF6">Admin</text>
  </g>
  
  <!-- Use Cases -->
  <ellipse cx="400" cy="100" rx="90" ry="30" class="usecase-box"/>
  <text x="400" y="104" text-anchor="middle" class="usecase-text">Report Emergency</text>
  
  <ellipse cx="400" cy="160" rx="90" ry="30" class="usecase-box"/>
  <text x="400" y="164" text-anchor="middle" class="usecase-text">Track Report Status</text>
  
  <ellipse cx="400" cy="220" rx="90" ry="30" class="usecase-box"/>
  <text x="400" y="224" text-anchor="middle" class="usecase-text">View Emergency Alerts</text>
  
  <ellipse cx="400" cy="280" rx="100" ry="30" class="usecase-box"/>
  <text x="400" y="284" text-anchor="middle" class="usecase-text">Respond to Emergency</text>
  
  <ellipse cx="400" cy="340" rx="100" ry="30" class="usecase-box"/>
  <text x="400" y="344" text-anchor="middle" class="usecase-text">Assign Tasks</text>
  
  <ellipse cx="400" cy="400" rx="100" ry="30" class="usecase-box"/>
  <text x="400" y="404" text-anchor="middle" class="usecase-text">Send Notifications</text>
  
  <ellipse cx="400" cy="460" rx="100" ry="30" class="usecase-box"/>
  <text x="400" y="464" text-anchor="middle" class="usecase-text">Verify Residents</text>
  
  <ellipse cx="620" cy="160" rx="90" ry="30" class="usecase-box"/>
  <text x="620" y="164" text-anchor="middle" class="usecase-text">Manage Users</text>
  
  <ellipse cx="620" cy="240" rx="90" ry="30" class="usecase-box"/>
  <text x="620" y="244" text-anchor="middle" class="usecase-text">Post News</text>
  
  <ellipse cx="620" cy="320" rx="90" ry="30" class="usecase-box"/>
  <text x="620" y="324" text-anchor="middle" class="usecase-text">View Dashboard</text>
  
  <!-- Relationships -->
  <line x1="140" y1="125" x2="310" y2="100" class="relation"/>
  <line x1="140" y1="135" x2="310" y2="160" class="relation"/>
  <line x1="140" y1="145" x2="310" y2="220" class="relation"/>
  <line x1="140" y1="150" x2="310" y2="320" class="relation"/>
  
  <line x1="140" y1="295" x2="310" y2="280" class="relation"/>
  <line x1="140" y1="305" x2="310" y2="340" class="relation"/>
  <line x1="140" y1="310" x2="310" y2="460" class="relation"/>
  
  <line x1="140" y1="465" x2="310" y2="100" class="relation"/>
  <line x1="140" y1="470" x2="310" y2="160" class="relation"/>
  <line x1="140" y1="475" x2="310" y2="220" class="relation"/>
  <line x1="140" y1="480" x2="310" y2="280" class="relation"/>
  <line x1="140" y1="485" x2="310" y2="340" class="relation"/>
  <line x1="140" y1="490" x2="310" y2="400" class="relation"/>
  <line x1="140" y1="495" x2="310" y2="460" class="relation"/>
  <line x1="140" y1="500" x2="530" y2="160" class="relation"/>
  <line x1="140" y1="505" x2="530" y2="240" class="relation"/>
  <line x1="140" y1="510" x2="530" y2="320" class="relation"/>
  
  <!-- Legend -->
  <circle cx="750" cy="530" r="10" fill="#EAB308" stroke="#B45309" stroke-width="2"/>
  <text x="765" y="535" font-size="12" fill="#4B5563">Resident</text>
  
  <circle cx="830" cy="530" r="10" fill="#3B82F6" stroke="#2563EB" stroke-width="2"/>
  <text x="845" y="535" font-size="12" fill="#4B5563">Respondent</text>
  
  <circle cx="750" cy="550" r="10" fill="#8B5CF6" stroke="#7C3AED" stroke-width="2"/>
  <text x="765" y="555" font-size="12" fill="#4B5563">Admin</text>
</svg>'''
    return svg

def save_plantuml():
    """Generate image via PlantUML server"""
    diagram = generate_plantuml_diagram()
    
    # Compress and encode for PlantUML
    compressed = base64.b64encode(diagram.encode('utf-8')).decode('ascii')
    
    url = f"http://www.plantuml.com/plantuml/png/{compressed}"
    
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read()
            filename = 'albuera-ems-usecase-plantuml.png'
            with open(filename, 'wb') as f:
                f.write(data)
            print(f"Saved: {filename}")
            return filename
    except Exception as e:
        print(f"PlantUML error: {e}")
        return None

def save_svg():
    """Save SVG file"""
    svg = generate_svg()
    filename = 'albuera-ems-usecase.svg'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Saved: {filename}")
    return filename

def main():
    output = sys.argv[1] if len(sys.argv) > 1 else 'albuera-ems-usecase.png'
    method = sys.argv[2] if len(sys.argv) > 2 else 'svg'
    
    print("Albuera EMS - Use Case Diagram Generator")
    print(f"Output: {output}")
    print(f"Method: {method}")
    print()
    
    if method == 'plantuml':
        result = save_plantuml()
        if not result:
            print("Falling back to SVG...")
            save_svg()
    elif method in ['d3', 'mermaid']:
        print(f"For {method} output, use the frontend component:")
        print("  frontend/src/components/UseCaseDiagram.jsx")
        save_svg()
    else:
        save_svg()
    
    print("\nDone!")

if __name__ == '__main__':
    main()
