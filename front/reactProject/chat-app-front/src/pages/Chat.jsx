import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import ModalCrearGrupo from '../components/ModalCrearGrupo.JSX';

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { nickname, fullname } = location.state || {};
    const [stompClient, setStompClient] = useState(null);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isModalCrearOpen, setIsModalCrearOpen] = useState(false);
    const messageInputRef = useRef(null);
    const chatAreaRef = useRef(null);
    const ruta = "http://192.168.100.93:8080";

    useEffect(() => {
        if (!nickname || !fullname) {
            navigate('/');
        } else {
            connect();
        }
        // Cleanup on unmount
        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, [nickname, fullname]);

    const connect = () => {
        const socket = new SockJS(ruta + '/chat-websocket');
        const client = Stomp.over(socket);
        client.connect({}, () => onConnected(client), onError);
    };

    const onConnected = (client) => {
        setStompClient(client);
        client.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
        client.subscribe(`/user/public`, onMessageReceived);
        client.send("/app/user.addUser", {}, JSON.stringify({ nickName: nickname, fullName: fullname, status: 'ONLINE' }));
        document.querySelector('#connected-user-fullname').textContent = fullname;
        findAndDisplayConnectedUsers();
    };

    const onError = (error) => {
        console.error('Could not connect to WebSocket server. Please refresh this page to try again!', error);
    };

    const findAndDisplayConnectedUsers = async () => {
        const connectedUsersResponse = await fetch(ruta + '/users');
        let connectedUsers = await connectedUsersResponse.json();
        connectedUsers = connectedUsers.filter(user => user.nickName !== nickname);
        setConnectedUsers(connectedUsers);
    };

    const onMessageReceived = async (payload) => {
        await findAndDisplayConnectedUsers();
        const message = JSON.parse(payload.body);
        if (selectedUserId && selectedUserId === message.senderId) {
            displayMessage(message.senderId, message.content);
        }

        const notifiedUser = document.querySelector(`#${message.senderId}`);
        if (notifiedUser && !notifiedUser.classList.contains('active')) {
            const nbrMsg = notifiedUser.querySelector('.nbr-msg');
            nbrMsg.classList.remove('hidden');
            nbrMsg.textContent = 'New';
        }
    };

    const displayMessage = (senderId, content) => {
        setMessages((prevMessages) => [...prevMessages, { senderId, content }]);
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    };

    const handleSendMessage = (event) => {
        event.preventDefault();
        const content = messageInputRef.current.value.trim();
        if (content && stompClient) {
            const chatMessage = {
                senderId: nickname,
                recipientId: selectedUserId,
                content,
                timestamp: new Date()
            };
            stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
            displayMessage(nickname, content);
            messageInputRef.current.value = '';
        }
    };

    const handleUserClick = (user) => {
        setSelectedUserId(user.nickName);
        fetchAndDisplayUserChat(user.nickName);
    };

    const fetchAndDisplayUserChat = async (userId) => {
        const userChatResponse = await fetch(`${ruta}/messages/${nickname}/${userId}`);
        const userChat = await userChatResponse.json();
        setMessages(userChat.map(chat => ({ senderId: chat.senderId, content: chat.content })));
    };

    const handleLogout = () => {
        if (stompClient) {
            stompClient.send("/app/user.disconnectUser", {}, JSON.stringify({ nickName: nickname, fullName: fullname, status: 'OFFLINE' }));
            stompClient.disconnect();
        }
        navigate('/');
    };

    return (
        <div className="chat-container">
            <ModalCrearGrupo 
                    isOpen={isModalCrearOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
            />

            <div className="users-list">
                <div className="users-list-container">
                    <h2>Online Users</h2>
                    <ul>
                        {connectedUsers.map(user => (
                            <li key={user.nickName} className={`user-item ${selectedUserId === user.nickName ? 'active' : ''}`} onClick={() => handleUserClick(user)}>
                                <img src="./user_icon.png" alt={user.fullName} />
                                <span>{user.fullName}</span>
                                <span className="nbr-msg hidden">0</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p id="connected-user-fullname">{fullname}</p>
                    <a className="logout" href="javascript:void(0)" onClick={handleLogout}>Logout</a>
                </div>
            </div>

            <div className="chat-area">
                <div className="chat-area overflow" ref={chatAreaRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.senderId === nickname ? 'sender' : 'receiver'}`}>
                            <p>{msg.content}</p>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSendMessage} className={`message-form ${selectedUserId ? '' : 'hidden'}`}>
                    <div className="message-input">
                        <input type="text" ref={messageInputRef} placeholder="Type your message..." autoComplete="off" />
                        <button type="submit">Send</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Chat;
