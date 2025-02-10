import React from "react";

const UserInfo = ({ userDetails }) => {
  if (!userDetails) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>User Details:</h3>
      <pre>{JSON.stringify(userDetails, null, 2)}</pre>
    </div>
  );
};

export default UserInfo;
