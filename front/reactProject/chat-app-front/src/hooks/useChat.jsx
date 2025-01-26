import { Stomp } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://192.168.100.93:8080/chat-websocket";

export function useChat(user) {
  const [stompClient, setStompClient] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const subscribedRooms = useRef(new Set());
  const processedMessages = useRef(new Set());

  useEffect(() => {
    if (user) {
      const socket = new SockJS(SOCKET_URL);
      const client = Stomp.over(socket);

      client.connect(
        {},
        () => {
          setStompClient(client);

          client.subscribe(
            `/user/${user.nickname}/queue/messages`,
            onMessageReceived
          );
          client.subscribe("/user/public", onMessageReceived);
          client.subscribe(`/user/${user.nickname}/queue/rooms`, onRoomUpdated);
          client.subscribe(`/topic/rooms/${user.nickname}`, onRoomUpdated);

          client.send(
            "/app/user.addUser",
            {},
            JSON.stringify({
              nickName: user.nickname,
              fullName: user.fullname,
              status: "ONLINE",
            })
          );

          fetchConnectedUsers();
          fetchUserRooms();
        },
        onError
      );
    }

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    if (stompClient && rooms.length > 0) {
      rooms.forEach((room) => {
        if (!subscribedRooms.current.has(room.roomId)) {
          stompClient.subscribe(
            `/topic/rooms/${room.roomId}`,
            onMessageReceived
          );
          subscribedRooms.current.add(room.roomId);
        }
      });
    }
  }, [stompClient, rooms]);

  const fetchConnectedUsers = useCallback(async () => {
    const response = await fetch("http://192.168.100.93:8080/users");
    const users = await response.json();
    setConnectedUsers(users.filter((u) => u.nickName !== user.nickname));
  }, [user]);

  const fetchUserRooms = useCallback(async () => {
    const response = await fetch(
      `http://192.168.100.93:8080/user/${user.nickname}/rooms`
    );
    const userRooms = await response.json();
    setRooms(userRooms);
  }, [user.nickname]);

  const fetchMessagesForUser = useCallback(
    async (userId) => {
      if (userId) {
        const response = await fetch(
          `http://192.168.100.93:8080/messages/${user.nickname}/${userId}`
        );
        const fetchedMessages = await response.json();
        setMessages((prev) => ({ ...prev, [userId]: fetchedMessages }));
        setUnreadMessages((prev) => ({ ...prev, [userId]: 0 }));

        // Add fetched messages to processedMessages set
        fetchedMessages.forEach((msg) => {
          const messageId = `${msg.senderId}-${msg.content}-${msg.timestamp}`;
          processedMessages.current.add(messageId);
        });
      }
    },
    [user.nickname]
  );

  const fetchMessagesForRoom = useCallback(async (roomId) => {
    if (roomId) {
      const response = await fetch(
        `http://192.168.100.93:8080/messages/rooms/${roomId}`
      );
      const fetchedMessages = await response.json();
      setMessages((prev) => ({ ...prev, [roomId]: fetchedMessages }));

      // Add fetched messages to processedMessages set
      fetchedMessages.forEach((msg) => {
        const messageId = `${msg.senderId}-${msg.content}-${msg.timestamp}`;
        processedMessages.current.add(messageId);
      });
    }
  }, []);

  const selectUser = useCallback(
    (userId) => {
      setSelectedUserId(userId);
      setSelectedRoomId(null);
      fetchMessagesForUser(userId);
      setUnreadMessages((prev) => ({ ...prev, [userId]: 0 }));
    },
    [fetchMessagesForUser]
  );

  const selectRoom = useCallback(
    (roomId) => {
      setSelectedRoomId(roomId);
      setSelectedUserId(null);
      fetchMessagesForRoom(roomId);
    },
    [fetchMessagesForRoom]
  );

  const onMessageReceived = useCallback(
    (payload) => {
      const message = JSON.parse(payload.body);
      console.log("Received message:", message);
      const chatId =
        message.roomId ||
        (message.senderId === user.nickname
          ? message.recipientId
          : message.senderId);

      // Create a unique identifier for the message
      const messageId = `${message.senderId}-${message.content}-${message.timestamp}`;

      // Only process the message if we haven't seen it before
      if (!processedMessages.current.has(messageId)) {
        processedMessages.current.add(messageId);

        setMessages((prev) => {
          const chatMessages = prev[chatId] || [];
          return {
            ...prev,
            [chatId]: [...chatMessages, message],
          };
        });

        if (chatId !== selectedUserId && chatId !== selectedRoomId) {
          setUnreadMessages((prev) => ({
            ...prev,
            [chatId]: (prev[chatId] || 0) + 1,
          }));
        }
      }
      fetchConnectedUsers();
    },
    [user.nickname, selectedUserId, selectedRoomId, fetchConnectedUsers]
  );

  const sendMessage = useCallback(
    (content) => {
      if (stompClient && (selectedUserId || selectedRoomId)) {
        const chatMessage = {
          senderId: user.nickname,
          content: content,
          timestamp: new Date().toISOString(),
        };

        if (selectedUserId) {
          chatMessage.recipientId = selectedUserId;
          stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));

          // Immediately update the messages state for one-to-one chats
          setMessages((prev) => {
            const chatMessages = prev[selectedUserId] || [];
            return {
              ...prev,
              [selectedUserId]: [...chatMessages, chatMessage],
            };
          });
        } else if (selectedRoomId) {
          stompClient.send(
            `/app/messages/rooms/${selectedRoomId}`,
            {},
            JSON.stringify(chatMessage)
          );
          // For rooms, we'll let the server echo back the message
        }
      }
    },
    [stompClient, selectedUserId, selectedRoomId, user.nickname]
  );

  const onRoomUpdated = useCallback(() => {
    fetchUserRooms();
  }, [fetchUserRooms]);

  const createRoom = useCallback(
    (roomId) => {
      return new Promise((resolve, reject) => {
        if (stompClient) {
          const roomData = {
            roomId: roomId,
            creatorId: user.nickname,
          };
          stompClient.send("/app/group/create", {}, JSON.stringify(roomData));
          fetchUserRooms().then(resolve).catch(reject);
        } else {
          reject(new Error("Stomp client not connected"));
        }
      });
    },
    [stompClient, user.nickname, fetchUserRooms]
  );

  const addParticipants = useCallback(
    (roomId, participants) => {
      console.log("roomId", roomId);
      console.log("participants", participants);
      console.log("rooms", rooms);
      if (stompClient) {
        let room = null;
        rooms.forEach((r) => {
          console.log("r", r);
          if (r.roomId === roomId) {
            room = r;
          }
        });
        if (room != null) {
          let inRoom = room.participants;
          let newParticipants = participants.filter((p) => !inRoom.includes(p));
          if (newParticipants.length > 0) {
            newParticipants.forEach((userId) => {
              stompClient.send(
                `/app/group/${roomId}/${userId}`,
                {},
                JSON.stringify({})
              );
            });
          }
        }
      }
    },
    [stompClient, rooms]
  );

  const onError = useCallback((error) => {
    console.error("WebSocket error:", error);
  }, []);

  const logout = useCallback(() => {
    if (stompClient) {
      stompClient.send(
        "/app/user.disconnectUser",
        {},
        JSON.stringify({
          nickName: user.nickname,
          fullName: user.fullname,
          status: "OFFLINE",
        })
      );
      stompClient.disconnect();
    }
  }, [stompClient, user]);

  return {
    connectedUsers,
    rooms,
    messages: messages[selectedUserId] || messages[selectedRoomId] || [],
    unreadMessages,
    sendMessage,
    logout,
    selectUser,
    selectRoom,
    createRoom,
    addParticipants,
  };
}
