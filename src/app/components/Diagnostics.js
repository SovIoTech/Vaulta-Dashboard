import React, { useState, useEffect } from "react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import {
  SNSClient,
  ListTopicsCommand,
  SubscribeCommand,
  ListSubscriptionsCommand,
  UnsubscribeCommand,
} from "@aws-sdk/client-sns";

const Diagnostics = ({ bmsData, user }) => {
  const currentData = bmsData?.lastMinuteData?.[0] || {};

  // Define colors for consistent styling (matching dashboard)
  const colors = {
    primary: "#818181", // Base gray
    secondary: "#c0c0c0", // Light gray
    accentGreen: "#4CAF50", // Vibrant green
    accentRed: "#F44336", // Strategic red
    accentBlue: "#2196F3", // Complementary blue
    background: "rgba(192, 192, 192, 0.1)",
    textDark: "#333333",
    textLight: "#555555",
    highlight: "#FFC107", // Accent yellow
  };

  // State variables
  const [userEmail, setUserEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [fetchError, setFetchError] = useState(null);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [activeTab, setActiveTab] = useState("subscribe"); // 'subscribe' or 'manage'
  const [isLoadingUserEmail, setIsLoadingUserEmail] = useState(true);

  // Get user email from Cognito on component mount
  // Modify the getUserEmail function in the Diagnostics component

  // Get user email from Cognito on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      setIsLoadingUserEmail(true);
      try {
        // First try to get email from the user prop (passed directly from AppWithAuth)
        if (user && user.attributes && user.attributes.email) {
          console.log("Found email from user prop:", user.attributes.email);
          setUserEmail(user.attributes.email);
        }
        // Second approach: try to get email from user's username (often this is the email)
        else if (user && user.username && user.username.includes("@")) {
          console.log("Using username as email:", user.username);
          setUserEmail(user.username);
        }
        // Third approach: try using fetchUserAttributes from Amplify Auth
        else {
          try {
            const { fetchUserAttributes } = await import("aws-amplify/auth");
            const userAttributes = await fetchUserAttributes();

            if (userAttributes && userAttributes.email) {
              console.log(
                "Found email from fetchUserAttributes:",
                userAttributes.email
              );
              setUserEmail(userAttributes.email);
            } else {
              throw new Error("No email in user attributes");
            }
          } catch (attrError) {
            console.error(
              "Failed to get email from fetchUserAttributes:",
              attrError
            );

            // Fourth approach: try to get current user
            try {
              const { getCurrentUser } = await import("aws-amplify/auth");
              const userData = await getCurrentUser();

              console.log("Current user data:", userData);

              if (
                userData &&
                userData.username &&
                userData.username.includes("@")
              ) {
                console.log(
                  "Using current user username as email:",
                  userData.username
                );
                setUserEmail(userData.username);
              } else {
                throw new Error("No email format username in current user");
              }
            } catch (currentUserError) {
              console.error(
                "Failed to get email from getCurrentUser:",
                currentUserError
              );
              throw new Error("Could not retrieve user email from any source");
            }
          }
        }
      } catch (error) {
        console.error("Failed to get user email:", error);
        setFetchError(
          `Error retrieving your email: ${error.message}. Please refresh or try again later.`
        );
      } finally {
        setIsLoadingUserEmail(false);
      }
    };

    getUserEmail();
  }, [user]);

  // Create SNS client
  const createSNSClient = async () => {
    const { credentials } = await fetchAuthSession();
    return new SNSClient({
      region: process.env.REACT_APP_AWS_REGION || "ap-southeast-2",
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });
  };

  // Fetch available SNS topics
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      setFetchError(null);

      try {
        const client = await createSNSClient();

        // Initialize an empty array to hold all topics
        let allTopics = [];
        let nextToken = undefined;

        // Loop to handle pagination for large numbers of topics
        do {
          const input = nextToken ? { NextToken: nextToken } : {};
          const command = new ListTopicsCommand(input);
          const response = await client.send(command);

          if (response.Topics) {
            allTopics = [...allTopics, ...response.Topics];
          }

          nextToken = response.NextToken;
        } while (nextToken);

        if (allTopics.length === 0) {
          throw new Error("No SNS topics found in your AWS account");
        }

        // Format the topics to include readable names
        const formattedTopics = allTopics.map((topic) => {
          const name = topic.TopicArn.split(":").pop();
          return {
            name: name,
            arn: topic.TopicArn,
            description: `Receive notifications from ${name}`,
          };
        });

        setAvailableTopics(formattedTopics);

        if (formattedTopics.length > 0) {
          setSelectedTopic(formattedTopics[0].arn);
        }
      } catch (error) {
        console.error("Failed to fetch SNS topics:", error);
        setFetchError(`Error loading SNS topics: ${error.message}`);
        setAvailableTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  // Fetch user's existing subscriptions
  const fetchSubscriptions = async () => {
    if (!userEmail) {
      setSubscriptionStatus(
        "User email not available. Cannot fetch subscriptions."
      );
      return;
    }

    setIsLoadingSubscriptions(true);

    try {
      const client = await createSNSClient();
      let allSubscriptions = [];
      let nextToken = undefined;

      // Loop to handle pagination
      do {
        const input = nextToken ? { NextToken: nextToken } : {};
        const command = new ListSubscriptionsCommand(input);
        const response = await client.send(command);

        if (response.Subscriptions) {
          // Filter to only include email subscriptions for the current user's email
          const userSubs = response.Subscriptions.filter(
            (sub) => sub.Protocol === "email" && sub.Endpoint === userEmail
          );
          allSubscriptions = [...allSubscriptions, ...userSubs];
        }

        nextToken = response.NextToken;
      } while (nextToken);

      // Format the subscriptions with topic names
      const formattedSubscriptions = allSubscriptions.map((sub) => {
        const topicName = sub.TopicArn.split(":").pop();
        const endpoint = sub.Endpoint;
        const status = sub.SubscriptionArn.includes("PendingConfirmation")
          ? "Pending Confirmation"
          : "Confirmed";

        return {
          topicName,
          topicArn: sub.TopicArn,
          endpoint,
          status,
          subscriptionArn: sub.SubscriptionArn,
        };
      });

      setUserSubscriptions(formattedSubscriptions);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      setSubscriptionStatus(`Error loading subscriptions: ${error.message}`);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  // Load subscriptions when tab changes to "manage"
  useEffect(() => {
    if (activeTab === "manage" && userEmail) {
      fetchSubscriptions();
    }
  }, [activeTab, userEmail]);

  // Handle subscribe button click
  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      setSubscriptionStatus("Cannot subscribe: Your email is not available");
      return;
    }

    if (!selectedTopic) {
      setSubscriptionStatus("Please select a topic to subscribe to");
      return;
    }

    setIsSubscribing(true);
    setSubscriptionStatus("");

    try {
      const client = await createSNSClient();

      const input = {
        Protocol: "email",
        TopicArn: selectedTopic,
        Endpoint: userEmail,
        ReturnSubscriptionArn: true,
      };

      const command = new SubscribeCommand(input);
      const response = await client.send(command);

      if (response.SubscriptionArn) {
        const topicName = availableTopics.find(
          (topic) => topic.arn === selectedTopic
        )?.name;
        setSubscriptionStatus(
          `Successfully subscribed to "${topicName}"! Please check your email (${userEmail}) to confirm the subscription.`
        );
      } else {
        throw new Error(
          "Failed to create subscription - no subscription ARN returned"
        );
      }
    } catch (error) {
      console.error("Subscription error:", error);

      // Handle specific AWS errors
      if (error.name === "AuthorizationErrorException") {
        setSubscriptionStatus(
          "Authorization error: You don't have permission to subscribe to this topic."
        );
      } else if (error.name === "InvalidParameterException") {
        setSubscriptionStatus("Error: Invalid parameters for subscription.");
      } else if (error.name === "NotFoundException") {
        setSubscriptionStatus("Error: The selected topic was not found.");
      } else if (error.name === "FilterPolicyLimitExceededException") {
        setSubscriptionStatus(
          "Error: Subscription filter policy limit exceeded."
        );
      } else {
        setSubscriptionStatus(`Failed to subscribe: ${error.message}`);
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  // Handle unsubscribe button click
  const handleUnsubscribe = async (subscriptionArn) => {
    // Prevent unsubscribing from pending confirmations (which don't have a real ARN)
    if (subscriptionArn.includes("PendingConfirmation")) {
      setSubscriptionStatus(
        "Cannot unsubscribe from pending confirmations. Please check your email to confirm or ignore to cancel."
      );
      return;
    }

    setIsUnsubscribing(true);
    setSubscriptionStatus("");

    try {
      const client = await createSNSClient();

      const input = {
        SubscriptionArn: subscriptionArn,
      };

      const command = new UnsubscribeCommand(input);
      await client.send(command);

      setSubscriptionStatus("Successfully unsubscribed!");

      // Refresh the subscriptions list
      fetchSubscriptions();
    } catch (error) {
      console.error("Unsubscribe error:", error);

      if (error.name === "AuthorizationErrorException") {
        setSubscriptionStatus(
          "Authorization error: You don't have permission to unsubscribe from this topic."
        );
      } else if (error.name === "InvalidParameterException") {
        setSubscriptionStatus("Error: Invalid subscription ARN.");
      } else if (error.name === "NotFoundException") {
        setSubscriptionStatus(
          "Error: The subscription was not found. It may have already been deleted."
        );
        // Refresh list to ensure UI is updated
        fetchSubscriptions();
      } else {
        setSubscriptionStatus(`Failed to unsubscribe: ${error.message}`);
      }
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color: colors.primary,
          marginBottom: "20px",
          borderBottom: `1px solid ${colors.secondary}`,
          paddingBottom: "10px",
        }}
      >
        Battery Diagnostics
      </h1>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "10px",
        }}
      >
        <div
          style={{
            backgroundColor: colors.background,
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "15px",
              color: colors.textDark,
            }}
          >
            System Health Check
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "10px",
                  color: colors.textDark,
                }}
              >
                Battery Status
              </h3>
              <p style={{ color: colors.textLight }}>
                State of Charge: {currentData.SOCPercent?.N || "N/A"}%
              </p>
              <p style={{ color: colors.textLight }}>
                Health Status:{" "}
                <span
                  style={{
                    color:
                      parseFloat(currentData.SOH_Estimate?.N || 0) > 90
                        ? colors.accentGreen
                        : parseFloat(currentData.SOH_Estimate?.N || 0) > 70
                        ? colors.highlight
                        : colors.accentRed,
                  }}
                >
                  {parseFloat(currentData.SOH_Estimate?.N || 0) > 90
                    ? "Excellent"
                    : parseFloat(currentData.SOH_Estimate?.N || 0) > 70
                    ? "Good"
                    : "Needs Attention"}
                </span>
              </p>
              <p style={{ color: colors.textLight }}>
                Temperature: {currentData.MaxCellTemp?.N || "N/A"}°C
              </p>
              <p style={{ color: colors.textLight }}>
                Voltage: {currentData.TotalBattVoltage?.N || "N/A"}V
              </p>
            </div>

            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "10px",
                  color: colors.textDark,
                }}
              >
                System Alerts
              </h3>
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#e8f5e9",
                  borderRadius: "5px",
                  color: colors.accentGreen,
                  marginBottom: "10px",
                }}
              >
                No active alerts
              </div>
              <p style={{ color: colors.textLight }}>
                Last Diagnostic Run: {new Date().toLocaleDateString()}
              </p>
              <p style={{ color: colors.textLight }}>
                Alert History: 0 alerts in the past 30 days
              </p>

              {/* SNS Alert Subscription Section */}
              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  backgroundColor: colors.background,
                  borderRadius: "5px",
                  border: `1px solid ${colors.secondary}`,
                }}
              >
                <h4
                  style={{
                    fontSize: "0.9rem",
                    marginBottom: "15px",
                    color: colors.textDark,
                    borderBottom: `1px solid ${colors.secondary}`,
                    paddingBottom: "8px",
                  }}
                >
                  SNS Notification Management
                </h4>

                {isLoadingUserEmail ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "15px",
                      color: colors.textLight,
                    }}
                  >
                    Loading your profile information...
                  </div>
                ) : !userEmail ? (
                  <div
                    style={{
                      padding: "10px",
                      backgroundColor: "#ffebee",
                      borderRadius: "4px",
                      color: colors.accentRed,
                      marginBottom: "10px",
                    }}
                  >
                    Could not retrieve your email address. Notification
                    management is unavailable.
                  </div>
                ) : (
                  <>
                    {/* User Email Display */}
                    <div
                      style={{
                        marginBottom: "15px",
                        padding: "10px",
                        backgroundColor: "rgba(33, 150, 243, 0.1)",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: colors.accentBlue,
                          color: "white",
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        @
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: colors.textLight,
                            margin: 0,
                          }}
                        >
                          Managing notifications for:
                        </p>
                        <p
                          style={{
                            fontSize: "0.95rem",
                            color: colors.textDark,
                            fontWeight: "500",
                            margin: "3px 0 0 0",
                          }}
                        >
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div
                      style={{
                        display: "flex",
                        marginBottom: "15px",
                        borderBottom: `1px solid ${colors.secondary}`,
                      }}
                    >
                      <button
                        onClick={() => setActiveTab("subscribe")}
                        style={{
                          padding: "8px 16px",
                          backgroundColor:
                            activeTab === "subscribe"
                              ? colors.accentBlue
                              : "transparent",
                          color:
                            activeTab === "subscribe"
                              ? "#fff"
                              : colors.textDark,
                          border: "none",
                          borderBottom:
                            activeTab === "subscribe"
                              ? `2px solid ${colors.accentBlue}`
                              : "none",
                          borderTopLeftRadius: "5px",
                          borderTopRightRadius: "5px",
                          cursor: "pointer",
                          fontWeight:
                            activeTab === "subscribe" ? "600" : "normal",
                          fontSize: "0.85rem",
                          marginRight: "5px",
                          marginBottom: "-1px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Subscribe
                      </button>
                      <button
                        onClick={() => setActiveTab("manage")}
                        style={{
                          padding: "8px 16px",
                          backgroundColor:
                            activeTab === "manage"
                              ? colors.accentBlue
                              : "transparent",
                          color:
                            activeTab === "manage" ? "#fff" : colors.textDark,
                          border: "none",
                          borderBottom:
                            activeTab === "manage"
                              ? `2px solid ${colors.accentBlue}`
                              : "none",
                          borderTopLeftRadius: "5px",
                          borderTopRightRadius: "5px",
                          cursor: "pointer",
                          fontWeight: activeTab === "manage" ? "600" : "normal",
                          fontSize: "0.85rem",
                          marginBottom: "-1px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Manage Subscriptions
                      </button>
                    </div>

                    {fetchError ? (
                      <div
                        style={{
                          padding: "10px",
                          backgroundColor: "#ffebee",
                          borderRadius: "4px",
                          color: colors.accentRed,
                          marginBottom: "10px",
                        }}
                      >
                        {fetchError}
                      </div>
                    ) : (
                      <>
                        {/* Subscribe Tab */}
                        {activeTab === "subscribe" && (
                          <form onSubmit={handleSubscribe}>
                            {/* Topic Selection */}
                            <div style={{ marginBottom: "15px" }}>
                              <label
                                htmlFor="sns-topic"
                                style={{
                                  display: "block",
                                  fontSize: "0.85rem",
                                  marginBottom: "5px",
                                  color: colors.textLight,
                                }}
                              >
                                Select notification topic:
                              </label>
                              {isLoadingTopics ? (
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    color: colors.textLight,
                                    padding: "8px 0",
                                  }}
                                >
                                  Loading available topics...
                                </div>
                              ) : availableTopics.length === 0 ? (
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    color: colors.accentRed,
                                    padding: "8px 0",
                                  }}
                                >
                                  No topics available. Please check your AWS SNS
                                  configuration.
                                </div>
                              ) : (
                                <select
                                  id="sns-topic"
                                  value={selectedTopic}
                                  onChange={(e) =>
                                    setSelectedTopic(e.target.value)
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    marginBottom: "5px",
                                    border: `1px solid ${colors.secondary}`,
                                    borderRadius: "4px",
                                    fontSize: "0.9rem",
                                    backgroundColor: "#fff",
                                    color: colors.textDark,
                                  }}
                                  disabled={isLoadingTopics}
                                >
                                  {availableTopics.map((topic) => (
                                    <option key={topic.arn} value={topic.arn}>
                                      {topic.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {selectedTopic && availableTopics.length > 0 && (
                                <p
                                  style={{
                                    fontSize: "0.8rem",
                                    margin: "5px 0",
                                    color: colors.textLight,
                                    fontStyle: "italic",
                                  }}
                                >
                                  {
                                    availableTopics.find(
                                      (t) => t.arn === selectedTopic
                                    )?.description
                                  }
                                </p>
                              )}
                            </div>

                            {/* Subscribe Button */}
                            <button
                              type="submit"
                              disabled={
                                isSubscribing ||
                                isLoadingTopics ||
                                availableTopics.length === 0
                              }
                              style={{
                                backgroundColor: colors.accentBlue,
                                color: "white",
                                border: "none",
                                padding: "8px 15px",
                                borderRadius: "4px",
                                cursor:
                                  isSubscribing ||
                                  isLoadingTopics ||
                                  availableTopics.length === 0
                                    ? "default"
                                    : "pointer",
                                width: "100%",
                                opacity:
                                  isSubscribing ||
                                  isLoadingTopics ||
                                  availableTopics.length === 0
                                    ? 0.7
                                    : 1,
                              }}
                            >
                              {isSubscribing
                                ? "Subscribing..."
                                : `Subscribe ${userEmail} to Notifications`}
                            </button>
                          </form>
                        )}

                        {/* Manage Subscriptions Tab */}
                        {activeTab === "manage" && (
                          <div>
                            {isLoadingSubscriptions ? (
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "15px",
                                  color: colors.textLight,
                                }}
                              >
                                Loading your subscriptions...
                              </div>
                            ) : userSubscriptions.length === 0 ? (
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "15px",
                                  color: colors.textLight,
                                  backgroundColor: "rgba(0,0,0,0.05)",
                                  borderRadius: "4px",
                                }}
                              >
                                You don't have any active SNS subscriptions.
                                Switch to the Subscribe tab to add one.
                              </div>
                            ) : (
                              <div>
                                <p
                                  style={{
                                    marginBottom: "10px",
                                    fontSize: "0.85rem",
                                    color: colors.textLight,
                                  }}
                                >
                                  Your current subscriptions:
                                </p>
                                <div
                                  style={{
                                    maxHeight: "250px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {userSubscriptions.map((sub, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        padding: "10px",
                                        borderBottom:
                                          index < userSubscriptions.length - 1
                                            ? `1px solid ${colors.secondary}`
                                            : "none",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div>
                                        <p
                                          style={{
                                            fontSize: "0.9rem",
                                            fontWeight: "500",
                                            color: colors.textDark,
                                          }}
                                        >
                                          {sub.topicName}
                                        </p>
                                        <p
                                          style={{
                                            fontSize: "0.8rem",
                                            color:
                                              sub.status === "Confirmed"
                                                ? colors.accentGreen
                                                : colors.highlight,
                                            fontStyle: "italic",
                                            marginTop: "3px",
                                          }}
                                        >
                                          Status: {sub.status}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleUnsubscribe(sub.subscriptionArn)
                                        }
                                        disabled={
                                          isUnsubscribing ||
                                          sub.status === "Pending Confirmation"
                                        }
                                        style={{
                                          backgroundColor:
                                            sub.status ===
                                            "Pending Confirmation"
                                              ? colors.secondary
                                              : colors.accentRed,
                                          color: "white",
                                          border: "none",
                                          padding: "6px 12px",
                                          borderRadius: "4px",
                                          cursor:
                                            sub.status ===
                                              "Pending Confirmation" ||
                                            isUnsubscribing
                                              ? "default"
                                              : "pointer",
                                          opacity:
                                            sub.status ===
                                              "Pending Confirmation" ||
                                            isUnsubscribing
                                              ? 0.6
                                              : 1,
                                          fontSize: "0.8rem",
                                        }}
                                      >
                                        {sub.status === "Pending Confirmation"
                                          ? "Pending"
                                          : "Unsubscribe"}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div
                                  style={{
                                    marginTop: "10px",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <button
                                    onClick={fetchSubscriptions}
                                    style={{
                                      backgroundColor: "transparent",
                                      color: colors.accentBlue,
                                      border: "none",
                                      padding: "5px 10px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "0.8rem",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span style={{ marginRight: "5px" }}>
                                      ↻
                                    </span>{" "}
                                    Refresh
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Status Message - shows in both tabs */}
                    {subscriptionStatus && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          marginTop: "12px",
                          padding: "8px",
                          backgroundColor: subscriptionStatus.includes(
                            "Successfully"
                          )
                            ? "rgba(76, 175, 80, 0.1)"
                            : "rgba(244, 67, 54, 0.1)",
                          color: subscriptionStatus.includes("Successfully")
                            ? colors.accentGreen
                            : colors.accentRed,
                          borderRadius: "4px",
                          borderLeft: `3px solid ${
                            subscriptionStatus.includes("Successfully")
                              ? colors.accentGreen
                              : colors.accentRed
                          }`,
                        }}
                      >
                        {subscriptionStatus}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: colors.background,
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              marginBottom: "15px",
              color: colors.textDark,
            }}
          >
            Diagnostic Tools
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "10px",
                  color: colors.textDark,
                }}
              >
                Run Diagnostics
              </h3>
              <div style={{ marginBottom: "15px" }}>
                <select
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: `1px solid ${colors.secondary}`,
                    borderRadius: "5px",
                    color: colors.textDark,
                  }}
                >
                  <option>Full System Check</option>
                  <option>Battery Health Test</option>
                  <option>Cell Balancing Test</option>
                  <option>Temperature Sensor Check</option>
                  <option>Voltage Calibration</option>
                </select>
              </div>
              <button
                style={{
                  backgroundColor: colors.accentBlue,
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Start Diagnostic
              </button>
            </div>

            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "10px",
                  color: colors.textDark,
                }}
              >
                Export Logs
              </h3>
              <p style={{ marginBottom: "15px", color: colors.textLight }}>
                Download system logs for advanced troubleshooting and analysis.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  style={{
                    backgroundColor: colors.accentGreen,
                    color: "white",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  System Logs
                </button>
                <button
                  style={{
                    backgroundColor: colors.highlight,
                    color: "white",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  Error Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
