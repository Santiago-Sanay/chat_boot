import { useState } from "react";
import { useChat } from "../hooks/useChat";
import ChatArea from "./ChatArea";
import UsersList from "./UsersList";

function ChatRoom({ user, onLogout }) {
    const { connectedUsers, messages, sendMessage, selectUser, rooms, createRoom, addParticipants, selectRoom, unreadMessages } = useChat(user);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSelectedRoom(null);
        selectUser(user.nickName);
    };

    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
        setSelectedUser(null);
        selectRoom(room.roomId);
    };

    const handleCreateRoom = (roomId) => {
        createRoom(roomId);
    };

    const handleAddParticipants = (roomId, participants) => {
        addParticipants(roomId, participants);
    };

    return (
        <div className="chat-container">
            <UsersList
                users={connectedUsers}
                rooms={rooms}
                onSelectUser={handleSelectUser}
                onSelectRoom={handleSelectRoom}
                onCreateRoom={handleCreateRoom}
                onAddParticipants={handleAddParticipants}
                currentUser={user}
                onLogout={onLogout}
                unreadMessages={unreadMessages}
            />
            <ChatArea
                messages={messages}
                onSendMessage={sendMessage}
                currentUser={user}
                selectedUser={selectedUser}
                selectedRoom={selectedRoom}
            />
        </div>
    );
}

export default ChatRoom;