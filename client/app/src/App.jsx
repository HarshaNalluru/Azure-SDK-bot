import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Azure SDK chat bot",
      sender: "bot",
    },
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };
    const newMessages = [...messages, newMessage]; // all old messages + new message
    // update messages state
    setMessages(newMessages);
    // set typing indicator (bot is typing)
    setTyping(true);
    // process message to server (send and get response)
  };

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              typingIndicator={
                typing ? <TypingIndicator content="the bot is typing" /> : null
              }
            >
              {messages.map((message, index) => {
                return <Message model={message} key={index} />;
              })}
            </MessageList>
            <MessageInput placeholder="Type Message..." onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
