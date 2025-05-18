import React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";


const AuthWrapper = ({ children }) => {
  const navigate = useNavigate(); // Initialize the navigate function

  return (
    <Authenticator>
      {({ user }) => (
        <div
          className="auth-container"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            backgroundColor: "#f2f2f2",
          }}
        >
          {/* Main Content - no top bar anymore */}
          {children({ user, navigate })}{" "}
          {/* Pass user and navigate to children */}
        </div>
      )}
    </Authenticator>
  );
};

export default AuthWrapper;
