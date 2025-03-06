import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.js";
import { listUsers, updateUserRole } from "./cognito-users.js"; // Import listUsers and updateUserRole

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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f9",
        fontFamily:
          "Public Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
          backgroundColor: "#f5f5f9",
          maxWidth: "calc(100% - 80px)",
        }}
      >
        <h1>Cognito Users</h1>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#696cff",
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
                    borderBottom: "1px solid #e0e0e0",
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
                        padding: "6px 12px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="client">Client</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Page2;
