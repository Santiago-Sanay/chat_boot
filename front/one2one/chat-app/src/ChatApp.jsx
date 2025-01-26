import React, { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './main.css';

const ChatApp = () => {
    const [nickname, setNickname] = useState('');
    const [fullname, setFullname] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [client, setClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [messageContent, setMessageContent] = useState('');

    useEffect(() => {
        if (client) {
            client.connect({}, onConnected, onError);
        }
        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [client]);

    const connect = (event) => {
        event.preventDefault();
        if (nickname && fullname) {
            setConnected(true);
            const socket = new SockJS('http://192.168.100.93:8080/chat-websocket');
            const stompClient = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {},
                debug: (str) => {
                    console.log(str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: onConnected,
                onStompError: (frame) => {
                    console.error('STOMP error:', frame);
                }
            });
            setClient(stompClient);
        }
    };

    const onConnected = useCallback(() => {
        if (client) {
            client.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
            client.subscribe(`/user/public`, onMessageReceived);

            client.publish({
                destination: "/app/user.addUser",
                body: JSON.stringify({ nickName: nickname, fullName: fullname, status: 'ONLINE' }),
            });
            findAndDisplayConnectedUsers();
        }
    }, [client, nickname, fullname]);

    const onError = (error) => {
        console.error('STOMP error:', error);
    };

    const findAndDisplayConnectedUsers = async () => {
        const response = await fetch('http://192.168.100.93:8080/users');
        let users = await response.json();
        users = users.filter(user => user.nickName !== nickname);
        setConnectedUsers(users);
    };

    const onMessageReceived = (message) => {
        const payload = JSON.parse(message.body);
        setMessages(prevMessages => [...prevMessages, payload]);

        if (selectedUserId === payload.senderId) {
            setMessages(prevMessages => [...prevMessages, payload]);
        } else {
            setConnectedUsers(prevUsers =>
                prevUsers.map(user => {
                    if (user.nickName === payload.senderId) {
                        return { ...user, newMessages: true };
                    }
                    return user;
                })
            );
        }
    };

    const sendMessage = (event) => {
        event.preventDefault();
        if (messageContent.trim() && client) {
            client.publish({
                destination: "/app/chat",
                body: JSON.stringify({
                    senderId: nickname,
                    recipientId: selectedUserId,
                    content: messageContent.trim(),
                    timestamp: new Date()
                })
            });
            setMessages(prevMessages => [...prevMessages, { senderId: nickname, content: messageContent }]);
            setMessageContent('');
        }
    };

    const onLogout = () => {
        if (client) {
            client.publish({
                destination: "/app/user.disconnectUser",
                body: JSON.stringify({ nickName: nickname, fullName: fullname, status: 'OFFLINE' })
            });
            client.deactivate();
        }
        setConnected(false);
    };

    return (
        <div>
            <h2>Grupo 4</h2>

            {!connected ? (
                <div className="user-form" id="username-page">
                    <h2>Enter Chatroom</h2>
                    <form id="usernameForm" onSubmit={connect}>
                        <label htmlFor="nickname">Nickname:</label>
                        <input
                            type="text"
                            id="nickname"
                            name="nickname"
                            required
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />

                        <label htmlFor="fullname">Real Name:</label>
                        <input
                            type="text"
                            id="fullname"
                            name="realname"
                            required
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                        />

                        <button type="submit">Enter Chatroom</button>
                    </form>
                </div>
            ) : (
                <div className="chat-container" id="chat-page">
                    <div className="users-list">
                        <div className="users-list-container">
                            <h2>Online Users</h2>
                            <ul id="connectedUsers">
                                {connectedUsers.map(user => (
                                    <li
                                        key={user.nickName}
                                        className={`user-item ${selectedUserId === user.nickName ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedUserId(user.nickName);
                                            setMessages([]);
                                        }}
                                    >
                                        <img src='../one2one/img/user_icon.png' alt={user.fullName} />
                                        <span>{user.fullName}</span>
                                        {user.newMessages && <span className="nbr-msg">New</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p id="connected-user-fullname">{fullname}</p>
                            <a className="logout" href="javascript:void(0)" id="logout" onClick={onLogout}>Logout</a>
                        </div>
                    </div>

                    <div className="chat-area">
                        <div className="chat-messages" id="chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message ${msg.senderId === nickname ? 'sender' : 'receiver'}`}>
                                    <p>{msg.content}</p>
                                </div>
                            ))}
                        </div>
                        <form id="messageForm" name="messageForm" className={selectedUserId ? '' : 'hidden'} onSubmit={sendMessage}>
                            <div className="message-input">
                                <input
                                    autocomplete="off"
                                    type="text"
                                    id="message"
                                    placeholder="Type your message..."
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                />
                                <button>Send</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatApp;
