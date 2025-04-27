import { fetchAuthSession } from "aws-amplify/auth";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import awsmobile from "../../aws-exports.js";

// Configure the Cognito client with Amplify credentials
const configureCognitoClient = async () => {
  try {
    const { credentials } = await fetchAuthSession(); // Fetch the current auth session
    const { accessKeyId, secretAccessKey, sessionToken } = credentials;

    // Create and return the Cognito client
    return new CognitoIdentityProvider({
      region: "ap-southeast-2",
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      },
    });
  } catch (error) {
    console.error("Error configuring Cognito client:", error);
    throw error;
  }
};

// List users from Cognito User Pool
export const listUsers = async () => {
  try {
    const cognito = await configureCognitoClient();

    const params = {
      UserPoolId: awsmobile.aws_user_pools_id, // Replace with your User Pool ID
      Limit: 10, // Optional: Limit the number of users returned
    };

    const data = await cognito.listUsers(params); // Call the listUsers API
    // console.log("List of users:", JSON.stringify(data.Users, null, 2)); // Log users to the console
    return data.Users; // Return the list of users
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
};

// Update the custom:user-role attribute for a user
export const updateUserRole = async (username, role) => {
  try {
    const cognito = await configureCognitoClient();

    const params = {
      UserPoolId: awsmobile.aws_user_pools_id, // Replace with your User Pool ID
      Username: username,
      UserAttributes: [
        {
          Name: "custom:user_role",
          Value: role, // Role can be "admin" or "client"
        },
      ],
    };

    await cognito.adminUpdateUserAttributes(params); // Call the update API
    console.log(`User ${username} role updated to ${role}`);
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};
