import React, { useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth"; // Import signOut function
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./AuthWrapper.css";

const AuthWrapper = ({ children }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut(); // Use the signOut function
      console.log("User signed out successfully");
      navigate("/"); // Redirect to the login page after sign-out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Authenticator>
      {({ user }) => (
        <div className="auth-container">
          {/* Top Bar */}
          <div className="top-bar">
            <div className="logo">Vaulta Battery Management System </div>
            <div className="user-menu">
              <button onClick={toggleDropdown} className="user-button">
                {user?.username} ▼
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">{user?.username}</div>
                  <button onClick={handleSignOut} className="dropdown-item">
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Main Content */}
          {children({ user, navigate })} {/* Pass navigate to children */}
        </div>
      )}
    </Authenticator>
  );
};

export default AuthWrapper;
