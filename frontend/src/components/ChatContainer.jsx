import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";

// ChatContainer component
const ChatContainer = ({ currentChat, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  // useEffect to fetch messages when the currentChat changes
  useEffect(async () => {
    // Fetch user data from localStorage
    const userData = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

    // If user data exists, proceed with fetching messages
    if (currentChat) {
      try {
        // Send a POST request to the server to retrieve messages for the current chat
        const response = await axios.post(recieveMessageRoute, {
          from: currentUser._id,
          to: currentChat._id,
        });

        // Set the retrieved messages in the state
        setMessages(response.data);
      } catch (error) {
        // Handle Axios errors
        if (axios.isAxiosError(error)) {
          // Axios error (e.g., network error, request/response issue)
          console.error("Axios error:", error.message);

          // Handle network error
          if (error.isAxiosError && !error.response) {
            console.error(
              "Network error. Please check your internet connection."
            );
          }

          // Handle response status codes
          if (error.response) {
            const status = error.response.status;
            switch (status) {
              case 401:
                console.error(
                  "Unauthorized. Please check your authentication."
                );
                // Redirect to login page or perform other actions
                break;
              case 404:
                console.error("Resource not found.");
                // Handle the resource not found scenario
                break;
              case 500:
                console.error("Internal server error. Please try again later.");
                // Handle the internal server error scenario
                break;
              default:
                console.error(`Server responded with status ${status}`);
                // Handle other status codes as needed
                break;
            }
          }
        } else {
          // Something happened in setting up the request that triggered an error
          console.error("Error setting up the request:", error.message);
        }
      }
    }
  }, [currentChat]);

  // Placeholder function for handling sending messages
  const handleSendMsg = async (msg) => {
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  // useEffect to listen for incoming messages from the socket
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  // useEffect to update messages when arrivalMessage changes
  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  // useEffect to scroll to the bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // JSX structure for the ChatContainer
  return (
    <>
      {currentChat && (
        <Container>
          {/* Chat Header */}
          <div className="chat-header">
            <div className="user-details">
              {/* User Avatar */}
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                  alt=""
                />
              </div>
              {/* User Username */}
              <div className="username">
                <h3>{currentChat.username}</h3>
              </div>
            </div>
            {/* Logout button */}
            <Logout />
          </div>

          {/* Chat Messages */}
          {/* Placeholder for displaying messages */}
          <div className="chat-messages">
            {messages.map((message) => {
              return (
                <div ref={scrollRef} key={uuidv4()}>
                  <div
                    className={`message ${
                      message.fromSelf ? "sended" : "recieved"
                    }`}
                  >
                    <div className="content ">
                      <p>{message.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <ChatInput handleSendMsg={handleSendMsg} />
        </Container>
      )}
    </>
  );
};

export default ChatContainer;

// Styled components for ChatContainer
const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;

  // Responsive layout adjustments
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  // Chat Header styling
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;

    // User details styling
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;

      // Avatar styling
      .avatar {
        img {
          height: 3rem;
        }
      }

      // Username styling
      .username {
        h3 {
          color: white;
        }
      }
    }
  }

  // Chat Messages styling
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;

    // Styling for scrollbar
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    // Message styling
    .message {
      display: flex;
      align-items: center;

      // Content styling
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;

        // Responsive layout adjustments
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }

    // Styling for sent messages
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }

    // Styling for received messages
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
