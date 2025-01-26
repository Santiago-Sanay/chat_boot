'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');
const createRoomForm = document.querySelector('#createRoomForm');
const addParticipantsForm = document.querySelector('#addParticipantsForm');
const availableUsersList = document.querySelector('#availableUsersList');

const createRoomLink = document.querySelector('#createRoom');
const createRoomSection = document.querySelector('#createRoomSection');


const ruta = "http://localhost:8088";

let stompClient = null;
let nickname = null;
let fullname = null;
let selectedUserId = null;
let selectedRoomId = null;

function connect(event) {
  usernamePage.classList.add('hidden');
  chatPage.classList.remove('hidden');
  nickname = document.querySelector('#nickname').value.trim();
  fullname = document.querySelector('#fullname').value.trim();

  if (nickname && fullname) {
    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    const socket = new SockJS(ruta + '/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
  }
  event.preventDefault();
}

async function findAndDisplayConnectedUsers() {
  const connectedUsersResponse = await fetch(ruta + '/users');
  let connectedUsers = await connectedUsersResponse.json();

  connectedUsers = connectedUsers.filter(user => user.nickName !== nickname);

  const connectedUsersList = document.getElementById('connectedUsers');
  const availableUsersList = document.getElementById('availableUsersList');

  connectedUsersList.innerHTML = '';
  availableUsersList.innerHTML = '';

  connectedUsers.forEach(user => {
    appendUserElement(user, connectedUsersList);
    if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
      const separator = document.createElement('li');
      separator.classList.add('separator');
      connectedUsersList.appendChild(separator);
    }
  });
  connectedUsers.forEach(user => {
    appendUserElement(user, availableUsersList);
  });
}

function userItemClick(event) {
  document.querySelectorAll('.user-item').forEach(item => {
    item.classList.remove('active');
  });
  messageForm.classList.remove('hidden');

  const clickedUser = event.currentTarget;
  clickedUser.classList.add('active');

  selectedUserId = clickedUser.getAttribute('id');
  selectedRoomId = null; // Restablece la selección de sala
  fetchAndDisplayUserChat().then();

  const nbrMsg = clickedUser.querySelector('.nbr-msg');
  nbrMsg.classList.add('hidden');
  nbrMsg.textContent = '0';
}


function userItemClickForAdding(event) {
  const clickedUser = event.currentTarget;
  clickedUser.classList.toggle('active'); // Alterna la clase 'active' para marcar el usuario seleccionado.

}


function appendUserElement(user, userList) {
  const listItem = document.createElement('li');
  listItem.classList.add('user-item');
  listItem.id = user.nickName;

  if (userList.id === 'availableUsersList') {
    listItem.classList.add('available-user');
  }

  const userImage = document.createElement('img');
  userImage.src = '../img/user_icon.png';
  userImage.alt = user.fullName;

  const usernameSpan = document.createElement('span');
  usernameSpan.textContent = user.fullName;

  const receivedMsgs = document.createElement('span');
  receivedMsgs.textContent = '0';
  receivedMsgs.classList.add('nbr-msg', 'hidden');

  listItem.appendChild(userImage);
  listItem.appendChild(usernameSpan);
  listItem.appendChild(receivedMsgs);

  if (listItem.classList.contains('available-user')) {
    listItem.addEventListener('click', userItemClickForAdding);
  } else {
    listItem.addEventListener('click', userItemClick);
  }

  userList.appendChild(listItem);
}



function displayMessage(senderId, content) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message');
  if (senderId === nickname) {
    messageContainer.classList.add('sender');
  } else {
    messageContainer.classList.add('receiver');
  }
  const message = document.createElement('p');
  message.textContent = content;
  messageContainer.appendChild(message);
  chatArea.appendChild(messageContainer);
}

async function fetchAndDisplayUserChat() {
  const userChatResponse = await fetch(ruta + `/messages/${nickname}/${selectedUserId}`);
  const userChat = await userChatResponse.json();
  chatArea.innerHTML = '';
  userChat.forEach(chat => {
    displayMessage(chat.senderId, chat.content);
  });
  chatArea.scrollTop = chatArea.scrollHeight;
}

async function fetchAndDisplayRoomChat() {
  const roomChatResponse = await fetch(ruta +`/messages/rooms/${selectedRoomId}`);
  const roomChat = await roomChatResponse.json();
  chatArea.innerHTML = '';
  roomChat.forEach(chat => {
    displayMessage(chat.senderId, chat.content);
  });
  chatArea.scrollTop = chatArea.scrollHeight;
}

function onError() {
  connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
  connectingElement.style.color = 'red';
}

function sendMessage(event) {
  const messageContent = messageInput.value.trim();
  if (messageContent && stompClient) {
    const chatMessage = {
      senderId: nickname,
      content: messageInput.value.trim(),
      timestamp: new Date()
    };
    if (selectedRoomId) {
      stompClient.send(`/app/messages/rooms/${selectedRoomId}`, {}, JSON.stringify(chatMessage));
    } else if (selectedUserId) {
      chatMessage.recipientId = selectedUserId;
      stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
      displayMessage(nickname, messageInput.value.trim());
    }


    messageInput.value = '';
  }
  chatArea.scrollTop = chatArea.scrollHeight;
  event.preventDefault();
}
async function onMessageReceived(payload) {
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
}


function onGroupMessage(payload) {
  const message = JSON.parse(payload.body);
  if (selectedRoomId && selectedRoomId === message.roomId) {
    displayMessage(message.senderId, message.content);
    chatArea.scrollTop = chatArea.scrollHeight;
  }
}


function findAndDisplayUserRooms() {
  fetch(ruta + `/user/${nickname}/rooms`)
    .then(response => response.json())
    .then(userRooms => {
      const roomsList = document.getElementById('roomsList');
      roomsList.innerHTML = '';
      userRooms.forEach(room => {
        const listItem = document.createElement('li');
        listItem.textContent = room.roomId;
        listItem.id = `room-${room.roomId}`;
        listItem.classList.add('room-item');
        listItem.addEventListener('click', roomItemClick);

        roomsList.appendChild(listItem);
      });
    })
    .catch(error => console.error('Error fetching rooms:', error));
}


function onConnected() {
  stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
  stompClient.subscribe(`/user/public`, onMessageReceived);
  stompClient.subscribe(`/user/${nickname}/queue/rooms`, onRoomUpdated);
  stompClient.subscribe(`/topic/rooms/${nickname}`, onRoomUpdated);

  stompClient.send("/app/user.addUser",
    {},
    JSON.stringify({ nickName: nickname, fullName: fullname, status: 'ONLINE' })
  );
  document.querySelector('#connected-user-fullname').textContent = fullname;
  findAndDisplayConnectedUsers();
  findAndDisplayUserRooms();
}

function onRoomUpdated(payload) {
  const updatedRoom = JSON.parse(payload.body);
  findAndDisplayUserRooms();
}

let currentRoomSubscription = null;

function roomItemClick(event) {
  document.querySelectorAll('.room-item').forEach(item => {
    item.classList.remove('active');
  });
  messageForm.classList.remove('hidden');

  const clickedRoom = event.currentTarget;
  clickedRoom.classList.add('active');

  const newRoomId = clickedRoom.id.replace('room-', '');

  if (currentRoomSubscription) {
    currentRoomSubscription.unsubscribe();
  }

  selectedRoomId = newRoomId;
  selectedUserId = null;

  currentRoomSubscription = stompClient.subscribe(`/topic/rooms/${selectedRoomId}`, onGroupMessage);

  fetchAndDisplayRoomChat().then();
}



function createRoom(event) {
  event.preventDefault();
  const roomId = document.querySelector('#roomId').value.trim();
  if (roomId && stompClient) {
    const roomData = {
      roomId: roomId,
      creatorId: nickname
    };
    stompClient.send("/app/group/create", {}, JSON.stringify(roomData));
    document.querySelector('#roomId').value = '';
  }
}

async function addParticipants(event) {
  event.preventDefault();
  const roomId = document.querySelector('#roomToAddParticipants').value.trim();
  if (roomId && stompClient) {
    const userElements = availableUsersList.querySelectorAll('.user-item');
    userElements.forEach(userElement => {
      if (userElement.classList.contains('active')) {
        const userId = userElement.getAttribute('id');
        stompClient.send(`/app/group/${roomId}/${userId}`, {}, JSON.stringify({}));
      }
    });
    document.querySelector('#roomToAddParticipants').value = '';
  }
}

function onLogout() {
  stompClient.send("/app/user.disconnectUser",
    {},
    JSON.stringify({nickName: nickname, fullName: fullname, status: 'OFFLINE'})
  );
  window.location.reload();
}

function createGroup() {
  createRoomSection.classList.remove('hidden');
  chatArea.classList.add('hidden');
}

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
createRoomForm.addEventListener('submit', createRoom, true);
addParticipantsForm.addEventListener('submit', addParticipants, true);
logout.addEventListener('click', onLogout, true);
createRoomLink.addEventListener('click', createGroup);


window.onbeforeunload = () => onLogout();
