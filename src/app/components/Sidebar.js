import React from "react";
import { signOut } from "aws-amplify/auth"; // Import the signOut function
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const Sidebar = ({ sidebarOpen, setSidebarOpen, navigate }) => {
  const menuItems = [
    {
      icon: "📊",
      label: "Dashboard",
      onClick: () => navigate("/dashboard"), // Navigate to Dashboard
    },
    {
      icon: "📄",
      label: "Userpool",
      onClick: () => navigate("/page2"), // Navigate to Page 2
    },
    {
      icon: "⚙️",
      label: "Settings",
      onClick: () => navigate("/page3"), // Navigate to Page 3
    },
  ];

  // Function to handle logout
  const handleSignOut = async () => {
    try {
      await signOut(); // Sign out the user
      navigate("/login"); // Redirect to the login page after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      style={{
        width: sidebarOpen ? "250px" : "80px",
        backgroundColor: "#fff", // CoreUI uses white background
        color: "#4f5d73", // CoreUI's default text color
        transition: "width 0.3s ease",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        borderRight: "1px solid #e0e0e0", // Light border for separation
        boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          background: "none",
          border: "none",
          color: "#3c4b64", // CoreUI's primary text color
          cursor: "pointer",
          alignSelf: "flex-end",
          marginRight: "15px",
          marginBottom: "20px",
          fontSize: "1.2rem",
        }}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {sidebarOpen ? (
        <div>
          {/* Sidebar Header */}
          <h3
            style={{
              marginTop: "10px",
              marginBottom: "20px",
              color: "#3c4b64", // CoreUI's primary text color
              fontWeight: "600",
              paddingLeft: "20px",
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            Main Menu
          </h3>

          {/* Menu Items */}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {menuItems.map((item, index) => (
              <li
                key={index}
                style={{
                  margin: "10px 0",
                  paddingLeft: "20px",
                }}
              >
                <button
                  onClick={item.onClick}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4f5d73", // CoreUI's default text color
                    cursor: "pointer",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    transition: "background-color 0.2s ease",
                  }}
                  className="hover:bg-[#f0f2f5]" // Light hover effect
                >
                  <span
                    style={{
                      marginRight: "12px",
                      color: "#3c4b64", // CoreUI's primary text color
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </li>
            ))}

            {/* Logout Button */}
            <li
              style={{
                margin: "10px 0",
                paddingLeft: "20px",
                marginTop: "auto",
              }}
            >
              <button
                onClick={handleSignOut}
                style={{
                  background: "#3c4b64", // CoreUI's primary color
                  color: "#fff", // White text
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  width: "calc(100% - 40px)",
                  padding: "10px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(60, 75, 100, 0.4)", // Subtle shadow
                  transition: "background-color 0.3s ease",
                }}
                className="hover:bg-[#2c3a50]" // Darker hover effect
              >
                🚪 Log Out
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Collapsed Menu Icons */}
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              style={{
                background: "none",
                border: "none",
                color: "#4f5d73", // CoreUI's default text color
                cursor: "pointer",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontSize: "1.2rem",
              }}
            >
              {item.icon}
            </button>
          ))}
          {/* Collapsed Logout Icon */}
          <button
            onClick={handleSignOut}
            style={{
              background: "none",
              border: "none",
              color: "#3c4b64", // CoreUI's primary text color
              cursor: "pointer",
              marginTop: "auto",
              padding: "10px",
              fontSize: "1.2rem",
            }}
          >
            🚪
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
