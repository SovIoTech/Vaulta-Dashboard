import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const ChatBot = ({ primaryColor = "#696cff" }) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Enterprise-level Knowledge Base
  const knowledgeBase = [
    {
      id: "bms-overview",
      questions: ["What is BMS?", "Tell me about the Battery Management System", "BMS definition"],
      answer: `A Battery Management System (BMS) is an electronic system that monitors and manages rechargeable battery cells or packs. It tracks parameters such as voltage, current, temperature, and state of charge to ensure safe and efficient operation while maximizing battery life and performance.`,
      tags: ["overview", "introduction"]
    },
    {
      id: "soc-explanation",
      questions: ["What is SOC?", "How do I read SOC percentage?", "State of Charge meaning"],
      answer: `State of Charge (SOC) represents the available capacity of a battery as a percentage of its rated capacity. 100% indicates a fully charged battery, while 0% indicates complete discharge. This metric is visible in the Battery Metrics section and is calculated using coulomb counting and voltage reference methods.`,
      tags: ["metrics", "battery status"]
    },
    {
      id: "soh-explanation",
      questions: ["What is SOH?", "State of Health meaning", "Battery health indicator"],
      answer: `State of Health (SOH) indicates the general condition of a battery and its ability to deliver the specified performance compared to a new battery. It accounts for factors like capacity degradation, increased internal resistance, and decreased charge acceptance. The dashboard shows this as a percentage, with 100% representing a new battery's condition.`,
      tags: ["metrics", "battery status", "health"]
    },
    {
      id: "cell-balancing",
      questions: ["What is cell balancing?", "Why is cell balancing important?", "How does balancing work?"],
      answer: `Cell balancing is the process of equalizing the voltage or state of charge across all cells in a battery pack. This is crucial because individual cells can develop different charge levels over time, which affects overall battery performance and lifespan. The system uses active or passive balancing techniques to redistribute energy among cells. The Cell & Temperature Data section shows individual cell voltages and balance status.`,
      tags: ["technical", "battery management"]
    },
    {
      id: "temperature-readings",
      questions: ["How to interpret temperature readings?", "What are safe battery temperatures?", "Temperature monitoring"],
      answer: `Temperature readings in the dashboard show both individual cell temperatures and pack temperature metrics. The optimal operating range is typically 15°C to 35°C (59°F to 95°F). Temperatures above 45°C (113°F) can accelerate degradation and pose safety risks, while temperatures below 0°C (32°F) may reduce performance and charging capabilities. The system actively manages thermal conditions through cooling systems or by limiting charge/discharge rates when necessary.`,
      tags: ["technical", "safety", "monitoring"]
    },
    {
      id: "system-navigation",
      questions: ["How do I navigate the dashboard?", "Where can I find detailed cell data?", "Dashboard navigation"],
      answer: `The dashboard offers two main views: System Overview and Detailed Data. System Overview presents Battery Status, Battery Performance, Weather conditions, and System Metrics cards. For cell-specific information, switch to the Detailed Data tab, which displays comprehensive voltage and temperature readings for each cell across battery nodes. Use the tab buttons in the top navigation bar to switch between views.`,
      tags: ["usage", "interface"]
    },
    {
      id: "data-refresh",
      questions: ["How often does data update?", "How to refresh data?", "Real-time monitoring"],
      answer: `Data automatically refreshes every 20 seconds to provide near real-time monitoring. You can also manually refresh the data by clicking the "Refresh Data" button in the top navigation area. The last update time is displayed in the user dropdown menu in the top right corner.`,
      tags: ["usage", "interface", "data"]
    },
    {
      id: "alerts-warnings",
      questions: ["What do warning indicators mean?", "How are alerts displayed?", "Battery warning system"],
      answer: `The system uses color-coded indicators to signal battery status. Green generally indicates normal operation, yellow suggests caution or values approaching limits, and red indicates critical conditions requiring attention. These visual indicators appear throughout the dashboard, particularly in the Battery Metrics and Cell Data sections. Alerts for critical conditions may also appear as toast notifications.`,
      tags: ["safety", "monitoring", "interface"]
    },
    {
      id: "dark-mode",
      questions: ["How to enable dark mode?", "Can I change the interface theme?", "Night mode"],
      answer: `You can toggle between light and dark mode by clicking the moon/sun icon in the top right corner of the dashboard. Dark mode reduces eye strain in low-light environments and may conserve energy on some displays.`,
      tags: ["interface", "preferences"]
    },
    {
      id: "export-data",
      questions: ["Can I export battery data?", "How to download reports?", "Data export options"],
      answer: `Currently, the system doesn't provide direct data export functionality through the main dashboard. For data export needs, please use the Analytics section or contact your system administrator to enable API access for external data processing and reporting tools.`,
      tags: ["data", "reporting"]
    }
  ];

  // Initialize welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: "welcome-1",
            text: "Welcome to the BMS Assistant. How can I help you today?",
            sender: "bot",
            timestamp: new Date()
          },
          {
            id: "welcome-2",
            text: "You can ask me questions about battery management, dashboard functions, or specific metrics.",
            sender: "bot",
            timestamp: new Date()
          }
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle unread count
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const userMessages = messages.filter(msg => msg.sender === "user");
      const botMessages = messages.filter(msg => msg.sender === "bot");
      
      // If there are more bot messages than user has seen
      if (botMessages.length > userMessages.length) {
        setUnreadCount(botMessages.length - userMessages.length);
      }
    } else {
      setUnreadCount(0);
    }
  }, [isOpen, messages]);

  // Process user query against knowledge base
  const processQuery = (query) => {
    // Normalize query for matching
    const normalizedQuery = query.toLowerCase().trim();
    
    // Find matching knowledge base entry
    const result = knowledgeBase.find(entry => 
      entry.questions.some(q => 
        normalizedQuery.includes(q.toLowerCase()) || 
        q.toLowerCase().includes(normalizedQuery)
      )
    );
    
    return result;
  };

  // Get suggested questions excluding those already answered
  const getSuggestedQuestions = () => {
    const answeredQuestions = new Set(
      messages
        .filter(m => m.knowledgeId)
        .map(m => m.knowledgeId)
    );
    
    // Return 3 random unanswered questions
    return knowledgeBase
      .filter(entry => !answeredQuestions.has(entry.id))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(entry => ({ id: entry.id, text: entry.questions[0] }));
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    
    const userQuery = inputValue.trim();
    const userMessage = {
      id: `user-${Date.now()}`,
      text: userQuery,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    // Simulate processing time
    setTimeout(() => {
      const result = processQuery(userQuery);
      
      if (result) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: result.answer,
            sender: "bot",
            knowledgeId: result.id,
            timestamp: new Date()
          }
        ]);
      } else {
        // No direct match, suggest other topics
        const suggestedQuestions = getSuggestedQuestions();
        
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: "I don't have specific information on that query. Here are some topics I can help with:",
            sender: "bot",
            suggestions: suggestedQuestions,
            timestamp: new Date()
          }
        ]);
      }
      
      setIsTyping(false);
    }, 1500);
  };

  // Handle clicking a suggested question
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.text);
    const userMessage = {
      id: `user-${Date.now()}`,
      text: suggestion.text,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Find the knowledge base entry for this suggestion
    const result = knowledgeBase.find(entry => entry.id === suggestion.id);
    
    setTimeout(() => {
      if (result) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: result.answer,
            sender: "bot",
            knowledgeId: result.id,
            timestamp: new Date()
          }
        ]);
      }
      setIsTyping(false);
    }, 1000);
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([]);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: primaryColor,
          color: "white",
          border: "none",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          position: "absolute",
          bottom: "0",
          right: "0",
          transition: "transform 0.3s ease, background-color 0.3s ease",
          zIndex: 1001,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isOpen ? (
          "×"
        ) : (
          <>
            <span role="img" aria-hidden="true">💬</span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "#ff3e1d",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                }}
              >
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "0",
            width: "380px",
            height: "500px",
            backgroundColor: "white",
            borderRadius: "15px",
            boxShadow: "0 5px 25px rgba(0, 0, 0, 0.18)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            animation: "slideIn 0.3s ease",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              backgroundColor: primaryColor,
              color: "white",
              padding: "16px 20px",
              fontWeight: "600",
              fontSize: "16px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span role="img" aria-hidden="true" style={{ fontSize: "18px" }}>🔋</span>
              <span>BMS Support Assistant</span>
            </div>
            <div>
              <button
                onClick={handleClearConversation}
                aria-label="Clear conversation"
                title="Clear conversation"
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  opacity: "0.7",
                  cursor: "pointer",
                  padding: "4px",
                  marginRight: "8px",
                  fontSize: "14px",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                }}
              >
                <span role="img" aria-hidden="true">🗑️</span>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.map((message) => (
              <div 
                key={message.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: message.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "100%",
                }}
              >
                <div
                  style={{
                    backgroundColor: message.sender === "user" ? "#e7f5ff" : "white",
                    color: "#34495e",
                    borderRadius: message.sender === "user" 
                      ? "18px 18px 0 18px" 
                      : "18px 18px 18px 0",
                    padding: "12px 16px",
                    maxWidth: "80%",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    border: message.sender === "user" 
                      ? "1px solid #e1f0ff" 
                      : "1px solid #e9ecef",
                    wordBreak: "break-word",
                    lineHeight: "1.5",
                    fontSize: "14px",
                  }}
                >
                  {message.text}
                  
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#adb5bd",
                      marginTop: "4px",
                      textAlign: message.sender === "user" ? "right" : "left",
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                
                {/* Suggested questions after bot response */}
                {message.suggestions && (
                  <div 
                    style={{ 
                      marginTop: "10px", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "5px",
                      width: "100%",
                    }}
                  >
                    {message.suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          backgroundColor: "white",
                          border: `1px solid ${primaryColor}`,
                          color: primaryColor,
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "13px",
                          textAlign: "left",
                          transition: "all 0.2s ease",
                          width: "80%",
                          alignSelf: "flex-start",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                        }}
                      >
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div
                style={{
                  backgroundColor: "white",
                  color: "#34495e",
                  borderRadius: "18px 18px 18px 0",
                  padding: "12px 16px",
                  maxWidth: "80%",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e9ecef",
                  alignSelf: "flex-start",
                  display: "flex",
                  gap: "4px",
                }}
              >
                <span className="typing-dot" style={{ animationDelay: "0s" }}>.</span>
                <span className="typing-dot" style={{ animationDelay: "0.3s" }}>.</span>
                <span className="typing-dot" style={{ animationDelay: "0.6s" }}>.</span>
                <style>{`
                  .typing-dot {
                    font-size: 20px;
                    font-weight: bold;
                    animation: typingAnimation 1.5s infinite;
                  }
                  
                  @keyframes typingAnimation {
                    0%, 100% { opacity: 0.3; transform: translateY(0px); }
                    50% { opacity: 1; transform: translateY(-3px); }
                  }
                `}</style>
              </div>
            )}
            
            {/* Empty state */}
            {messages.length === 0 && !isTyping && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  opacity: 0.7,
                  gap: "15px",
                }}
              >
                <span role="img" aria-label="Battery" style={{ fontSize: "32px" }}>🔋</span>
                <p style={{ fontSize: "14px", textAlign: "center", margin: 0 }}>
                  Ask me anything about the Battery Management System!
                </p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            style={{
              display: "flex",
              padding: "15px",
              borderTop: "1px solid #e9ecef",
              backgroundColor: "white",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              aria-label="Type your message"
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "25px",
                border: "1px solid #e9ecef",
                outline: "none",
                marginRight: "10px",
                fontSize: "14px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = primaryColor;
                e.target.style.boxShadow = `0 0 0 2px rgba(105, 108, 255, 0.2)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e9ecef";
                e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
              }}
            />
            <button
              onClick={handleSendMessage}
              aria-label="Send message"
              style={{
                backgroundColor: primaryColor,
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s ease, background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              disabled={isTyping}
            >
              <SendIcon color="white" />
            </button>
          </div>

          {/* Animation styles */}
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

// Send icon component
const SendIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

ChatBot.propTypes = {
  primaryColor: PropTypes.string,
};

export default ChatBot;