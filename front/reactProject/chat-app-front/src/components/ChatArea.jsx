import { useEffect, useRef, useState } from "react";

function ChatArea({ messages, onSendMessage, currentUser, selectedUser, selectedRoom }) {
  const [messageInput, setMessageInput] = useState("");
  const chatAreaRef = useRef(null);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (messageInput.trim() && (selectedUser || selectedRoom)) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const formatTimestamp = (timestamp) => {
    let date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.error("Invalid timestamp:", timestamp);
      date = new Date(); // Si el timestamp no es válido, usa la hora actual
    }
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="chat-area">
      <div className="chat-messages" id="chat-messages" ref={chatAreaRef}>
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`message ${msg.senderId === currentUser.nickname ? "sender" : "receiver"
              }`}
          >
            {selectedRoom && <span className="sender-name">{msg.senderId}</span>}
            <p>{msg.content}</p>
            <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={(selectedUser || selectedRoom) ? "" : "hidden"}>
        <div className="message-input">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
          />
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  );
}

export default ChatArea;
