import React from "react";

const Sidebar = ({ sidebarOpen, setSidebarOpen, signOut, navigate }) => {
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

  return (
    <div
      style={{
        width: sidebarOpen ? "250px" : "80px",
        backgroundColor: "white",
        color: "#566a7f",
        transition: "width 0.3s ease",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        borderRight: "1px solid #e0e0e0",
        boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          background: "none",
          border: "none",
          color: "#696cff",
          cursor: "pointer",
          alignSelf: "flex-end",
          marginRight: "15px",
          marginBottom: "20px",
        }}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {sidebarOpen ? (
        <div>
          <h3
            style={{
              marginTop: "10px",
              marginBottom: "20px",
              color: "#696cff",
              fontWeight: "600",
              paddingLeft: "20px",
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            Main Menu
          </h3>

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
                    color: "#566a7f",
                    cursor: "pointer",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    transition: "background-color 0.2s ease",
                  }}
                  className="hover:bg-[#f5f5f9]"
                >
                  <span
                    style={{
                      marginRight: "12px",
                      color: "#696cff",
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

            <li
              style={{
                margin: "10px 0",
                paddingLeft: "20px",
                marginTop: "auto",
              }}
            >
              <button
                onClick={signOut}
                style={{
                  background: "#696cff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  width: "calc(100% - 40px)",
                  padding: "10px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(105, 108, 255, 0.4)",
                  transition: "background-color 0.3s ease",
                }}
                className="hover:bg-[#5a5eff]"
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
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              style={{
                background: "none",
                border: "none",
                color: "#566a7f",
                cursor: "pointer",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {item.icon}
            </button>
          ))}
          <button
            onClick={signOut}
            style={{
              background: "none",
              border: "none",
              color: "#696cff",
              cursor: "pointer",
              marginTop: "auto",
              padding: "10px",
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
