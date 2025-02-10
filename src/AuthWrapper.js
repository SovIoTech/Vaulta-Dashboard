import React, { useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "./AuthWrapper.css"; // Create this CSS file for styling

const AuthWrapper = ({ children }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="auth-container">
          {/* Top Bar */}
          <div className="top-bar">
            <div className="logo">JD-Vaulta</div>
            <div className="user-menu">
              <button onClick={toggleDropdown} className="user-button">
                {user?.username} ▼
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">{user?.username}</div>
                  <button onClick={signOut} className="dropdown-item">
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          {children}
        </div>
      )}
    </Authenticator>
  );
};

export default AuthWrapper;
