import AWS from "aws-sdk";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "../aws-exports.js";

// Function to invoke the Lambda function
export const invokeLambdaFunction = async (
  selectedTagId,
  timeRange = "7days"
) => {
  try {
    // Get the AWS credentials from Amplify Auth
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    // Initialize the Lambda client
    const lambda = new AWS.Lambda({
      region: awsconfig.aws_project_region,
      credentials,
    });

    // Lambda function ARN
    const functionName =
      "arn:aws:lambda:ap-southeast-2:183631334799:function:consumption_trends";

    // Payload to pass to the Lambda function
    const payload = {
      baseId: selectedTagId, // Pass the selectedTagId as the baseId
      timeRange: timeRange, // Add time range parameter
    };

    console.log("Invoking Lambda function with payload:", payload);

    // Invoke the Lambda function
    const response = await lambda
      .invoke({
        FunctionName: functionName,
        InvocationType: "RequestResponse", // Synchronous invocation
        Payload: JSON.stringify(payload), // Pass the payload as a JSON string
      })
      .promise();

    // Parse the response from the Lambda function
    const result = JSON.parse(response.Payload);
    console.log("Lambda function response:", result);

    // Check if the response has the expected format
    if (
      !result.hourlyAverages ||
      !result.hourlyPower ||
      !result.dailyPowerSummary
    ) {
      console.warn("Lambda response missing expected fields:", result);
    }

    return result;
  } catch (error) {
    console.error("Error invoking Lambda function:", error);
    throw error;
  }
};
