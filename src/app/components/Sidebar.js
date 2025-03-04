// components/Sidebar.js
"use client";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen, signOut }) => {
  return (
    <div
      style={{
        width: sidebarOpen ? "250px" : "60px",
        backgroundColor: "#333",
        color: "#fff",
        transition: "width 0.3s",
        padding: "20px",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: "24px",
          cursor: "pointer",
        }}
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>
      {sidebarOpen && (
        <div>
          <h3 style={{ marginTop: "20px" }}>Menu</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ margin: "10px 0" }}>
              <Link
                to="/tables"
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "16px",
                  textDecoration: "none",
                }}
              >
                Tables
              </Link>
            </li>
            <li style={{ margin: "10px 0" }}>
              <Link
                to="/page2"
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "16px",
                  textDecoration: "none",
                }}
              >
                Battery Stats
              </Link>
            </li>
            <li style={{ margin: "10px 0" }}>
              <Link
                to="/page3"
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "16px",
                  textDecoration: "none",
                }}
              >
                Page 3
              </Link>
            </li>
            <li style={{ margin: "10px 0" }}>
              <button
                onClick={signOut}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
