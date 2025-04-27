import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import AWS from "aws-sdk";
import awsconfig from "./aws-exports.js";
import { getLastMinuteData } from "./queries.js";

const useDynamoDB = () => {
  const [tableMetadata] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const session = await fetchAuthSession();
        const credentials = session.credentials;

        const dynamoDB = new AWS.DynamoDB({
          apiVersion: "2012-08-10",
          region: awsconfig.region,
          credentials,
        });

        fetchUserDetails(session);
        fetchTableMetadata(dynamoDB);
        await fetchData(dynamoDB, "BAT-0x440");
      } catch (error) {
        console.error("Error fetching AWS credentials:", error);
        setErrorMessage("Failed to fetch AWS credentials.");
        setData(null); // Set data to null if there's an error
      }
    };

    fetchCredentials();
  }, []);

  const fetchUserDetails = (session) => {
    try {
      const user = session?.identityId || null;
      if (user) {
        setUserDetails({
          userPoolId: awsconfig.userPoolId,
          region: awsconfig.region,
          appClientId: awsconfig.clientID,
          identityId: user,
        });
      } else {
        setUserDetails(null);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserDetails(null);
    }
  };

  const fetchTableMetadata = async (dynamoDB) => {
    try {
      // const params = { TableName: "CAN_BMS_Data" };
      // const data = await dynamoDB.describeTable(params).promise();
      // setTableMetadata(data.Table);
    } catch (error) {
      console.error("Error fetching table metadata:", error);
      setErrorMessage("Failed to fetch table metadata.");
    }
  };

  const fetchData = async (dynamoDB, tagID) => {
    try {
      const lastMinuteData = await getLastMinuteData(
        dynamoDB,
        "CAN_BMS_Data",
        tagID
      );
      setData({ lastMinuteData });
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Failed to fetch data.");
      setData(null); // Set data to null if there's an error
    }
  };

  return { tableMetadata, errorMessage, userDetails, data };
};

export default useDynamoDB;
