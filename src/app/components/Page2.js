import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.js";
import { listUsers, updateUserRole } from "./cognito-users.js"; // Import listUsers and updateUserRole
import LoadingSpinner from "./LoadingSpinner.js";

const Page2 = ({ signOut }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]); // State to store the list of users
  const [loading, setLoading] = useState(true); // State to track loading state
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await listUsers(); // Fetch the list of users
        setUsers(userList); // Store users in state
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUsers();
  }, []);

  // Function to extract attribute value from user
  const getAttributeValue = (user, attributeName) => {
    const attribute = user.Attributes.find(
      (attr) => attr.Name === attributeName
    );
    return attribute ? attribute.Value : "N/A";
  };

  // Function to handle role update
  const handleRoleUpdate = async (username, newRole) => {
    const confirmed = window.confirm(
      `Are you sure you want to set the role of ${username} to ${newRole}?`
    );

    if (confirmed) {
      try {
        await updateUserRole(username, newRole); // Update the user role
        alert(`Role updated successfully for ${username}`);

        // Refresh the user list to reflect the updated role
        const updatedUsers = await listUsers();
        setUsers(updatedUsers);
      } catch (error) {
        console.error("Error updating user role:", error);
        alert("Failed to update user role. Please try again.");
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f2f2f2", // OneUI light background
        fontFamily:
          "SamsungOne, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
        navigate={navigate}
      />
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f2f2f2", // OneUI light background
          maxWidth: "calc(100% - 80px)",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "15px", // Rounded corners for OneUI
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)", // OneUI shadow
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1259c3", // OneUI blue
              marginBottom: "20px",
            }}
          >
            User Management
          </h1>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              borderRadius: "15px", // Rounded corners for OneUI
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#1259c3", // OneUI blue
                  color: "white",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "12px 16px" }}>Username</th>
                <th style={{ padding: "12px 16px" }}>Email</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px" }}>User Role</th>
                <th style={{ padding: "12px 16px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #e6e6e6",
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>{user.Username}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {getAttributeValue(user, "email")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{user.UserStatus}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {getAttributeValue(user, "custom:user_role")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      defaultValue={getAttributeValue(user, "custom:user_role")}
                      onChange={(e) =>
                        handleRoleUpdate(user.Username, e.target.value)
                      }
                      style={{
                        padding: "8px 12px",
                        borderRadius: "25px", // Rounded corners for OneUI
                        border: "1px solid #e6e6e6",
                        backgroundColor: "white",
                        cursor: "pointer",
                        color: "#000000", // OneUI text color
                      }}
                    >
                      <option value="admin">Administrator</option>
                      <option value="client">Standard User</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page2;
