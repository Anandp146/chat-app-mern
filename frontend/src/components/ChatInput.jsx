import React, { useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { styled } from "styled-components";
import Picker from "emoji-picker-react";

// ChatInput component
export default function ChatInput({ handleSendMsg }) {
  // State for showing/hiding emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // State for storing the message input
  const [msg, setMsg] = useState("");

  // Function to toggle the visibility of the emoji picker
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Function to handle emoji click and add it to the message input
  const handleEmojiClick = (emojiObject) => {
    setMsg((prevMsg) => prevMsg + emojiObject.emoji);
  };

  // Function to send the chat message
  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  return (
    <Container>
      {/* Container for emoji button and picker */}
      <div className="button-container">
        <div className="emoji">
          {/* Emoji button */}
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />

          {/* Emoji picker */}
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
      </div>

      {/* Container for message input and send button */}
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        {/* Message input */}
        <input
          type="text"
          placeholder="type your message here"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />

        {/* Send button */}
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 5% 95%;
  background-color: #080420;
  padding: 0 2rem;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem;
    gap: 1rem;
  }
  .button-container {
    display: flex;
    align-items: center;
    color: white;
    gap: 1rem;
    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #ffff00c8;
        cursor: pointer;
      }
      .EmojiPickerReact {
        position: absolute;
        top: -350px;
        height: 320px !important;
        width: 280px !important;
        background-color: #080420;
        box-shadow: 0 5px 10px #9a86f3;
        border-color: #9a86f3;

        .epr-body::-webkit-scrollbar {
          background-color: #080420;
          width: 5px;
          &-thumb {
            background-color: #9a86f3;
          }
        }
        .epr-category-nav {
          padding: 5px !important;
          button {
            filter: contrast(1);
          }
        }
        .epr-search {
          background-color: transparent;
          border-color: #9186f3;
        }
        .epr-emoji-category-label {
          background-color: #080420;
        }
        .epr-emoji-category {
          .epr-emoji-img {
            height: 10px !important;
            padding: 7px !important;
            width: 25px !important;
          }
        }
        .epr-preview {
          height: 50px;
          .epr-emoji-img {
            height: 25px !important;
            width: 25px !important;
            margin: 5px !important;
          }
        }
      }
    }
  }
  .input-container {
    width: 100%;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    background-color: #ffffff34;
    input {
      width: 90%;
      height: 60%;
      background-color: transparent;
      color: white;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;

      &::selection {
        background-color: #9a86f3;
      }
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 0.3rem 2rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #9a86f3;
      border: none;
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
        }
      }
      svg {
        font-size: 2rem;
        color: white;
      }
    }
  }
`;
