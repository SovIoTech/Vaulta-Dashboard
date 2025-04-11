import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate(); // Use the useNavigate hook directly

  const menuItems = [
    {
      icon: "📊",
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      icon: "👥",
      label: "User Management",
      onClick: () => navigate("/page2"),
    },
    {
      icon: "📈",
      label: "Data Analytics",
      onClick: () => navigate("/page3"),
    },
    {
      icon: "⚙️",
      label: "System Settings",
      onClick: () => navigate("/page4"),
    },
    {
      icon: "🔋",
      label: "Energy Monitor",
      onClick: () => navigate("/page5"),
    },
  ];

  // Function to handle logout
  const handleSignOut = async () => {
    try {
      await signOut(); // Sign out the user
      navigate("/"); // Redirect to the login page after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      style={{
        width: sidebarOpen ? "250px" : "80px",
        backgroundColor: "#fff", // White background
        color: "#000000", // OneUI default text color
        transition: "width 0.3s ease",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        borderRight: "1px solid #e6e6e6", // Light border for separation
        boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          background: "none",
          border: "none",
          color: "#1259c3", // OneUI primary blue color
          cursor: "pointer",
          alignSelf: "flex-end",
          marginRight: "15px",
          marginBottom: "20px",
          fontSize: "1.2rem",
        }}
        autoFocus={true}
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
              color: "#1259c3", // OneUI primary blue color
              fontWeight: "600",
              paddingLeft: "20px",
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            Menu
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
                    color: "#000000", // OneUI default text color
                    cursor: "pointer",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "10px",
                    borderRadius: "25px", // Rounded corners for OneUI
                    transition: "background-color 0.2s ease",
                  }}
                  className="hover:bg-[#f2f2f2]" // Light hover effect - OneUI color
                >
                  <span
                    style={{
                      marginRight: "12px",
                      color: "#1259c3", // OneUI primary blue color
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
                  background: "#1259c3", // OneUI primary blue color
                  color: "#fff", // White text
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  width: "calc(100% - 40px)",
                  padding: "10px",
                  borderRadius: "25px", // Rounded corners for OneUI
                  boxShadow: "0 2px 4px rgba(18, 89, 195, 0.4)", // Subtle shadow
                  transition: "background-color 0.3s ease",
                }}
                tabIndex="-1" // Prevent the button from being focusable
                className="logout-button hover:bg-[#0c3f82]" // Add the class here
              >
                🚪 Sign Out
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
                color: "#1259c3", // OneUI primary blue color
                cursor: "pointer",
                padding: "15px",
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
              color: "#1259c3", // OneUI primary blue color
              cursor: "pointer",
              marginTop: "auto",
              padding: "15px",
              fontSize: "1.2rem",
            }}
            tabIndex="-1" // Prevent the button from being focusable
          >
            🚪
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
