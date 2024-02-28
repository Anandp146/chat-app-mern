import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

// Chat component
export default function Chat() {
  // Import hook for navigating between pages
  const navigate = useNavigate();

  // Create a reference to the socket connection
  const socket = useRef();

  // State variables to manage contacts, current chat, and current user
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  // Effect hook to check if a user is logged in; if not, redirect to the login page
  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem("chat-app-user")) {
        navigate("/login");
      } else {
        // Set the current user if they are logged in
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
      }
    };

    fetchData();
  }, [navigate, setCurrentUser]);

  // Effect hook to establish a socket connection when the current user is set
  useEffect(() => {
    if (currentUser) {
      // Initialize socket connection and add the current user to the chat
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  // Effect hook to fetch contacts if the current user is set and has an avatar image
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        // Check if the current user has set an avatar image
        if (currentUser.isAvatarImageSet) {
          try {
            // Fetch the list of contacts from the server
            const response = await axios.get(
              `${allUsersRoute}/${currentUser._id}`
            );
            setContacts(response.data);
          } catch (error) {
            // Handle error if axios request fails
            console.error("Error fetching contacts:", error);
          }
        } else {
          // Redirect to the "setAvatar" page if the current user has not set an avatar image
          navigate("/setAvatar");
        }
      }
    };

    fetchData(); // Call the async function
  }, [currentUser, navigate, allUsersRoute, setContacts]);

  // Handler function to update the current chat when a contact is selected
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  // Render the chat application with contacts and chat container components
  return (
    <>
      <Container>
        <div className="container">
          {/* Display the list of contacts and pass the handler function */}
          <Contacts contacts={contacts} changeChat={handleChatChange} />
          {/* Display the welcome screen or the chat container based on the current chat */}
          {currentChat === undefined ? (
            <Welcome currentUser={currentUser} />
          ) : (
            <ChatContainer
              currentChat={currentChat}
              currentUser={currentUser}
              socket={socket}
            />
          )}
        </div>
      </Container>
    </>
  );
}

// Styled components for Chat
const Container = styled.div`
  height: 100vh;
  margin: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
