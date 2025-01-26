/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useModal } from "../context/ModalContext.jsx";
import { useChat } from "../hooks/useChat";
import ModalCrearGrupo from "./ModalCrearGrupo";

function UsersList({
    users,
    rooms,
    onSelectUser,
    onSelectRoom,
    onCreateRoom,
    onAddParticipants,
    currentUser,
    onLogout,
    unreadMessages,
}) {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [newRoomId, setNewRoomId] = useState("");
    const [roomToAddParticipants, setRoomToAddParticipants] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [showAddParticipants, setShowAddParticipants] = useState(false);
    const { logout, selectUser } = useChat(currentUser);
    const { isModalOpen, openModal, closeModal } = useModal();
    const [roomWithFormOpen, setRoomWithFormOpen] = useState(null);

    useEffect(() => {
        if (users.length > 0 && !selectedUserId && !selectedRoomId) {
            setSelectedUserId(users[0].nickName);
            onSelectUser(users[0]);
        }
    }, [users, selectedUserId, selectedRoomId, onSelectUser]);

    const handleUserClick = (user) => {
        setSelectedUserId(user.nickName);
        setSelectedRoomId(null);
        onSelectUser(user);
        selectUser(user.nickName);
    };

    const handleRoomClick = (room) => {
        setSelectedRoomId(room.roomId);
        setSelectedUserId(null);
        onSelectRoom(room);
    };

    const crearRoomModal = (roomId) => {
        console.log("crearRoomModal called with roomId:", roomId);
        console.log("onCreateRoom is:", onCreateRoom);
        if (onCreateRoom && typeof onCreateRoom === "function") {
            onCreateRoom(roomId);
            closeModal();
        } else {
            console.error("onCreateRoom is not defined or not a function");
        }
        console.log("Rendering UsersList, onCreateRoom is:", onCreateRoom);
    };

    const handleCreateRoom = (roomId) => {
        if (onCreateRoom && typeof onCreateRoom === "function") {
            onCreateRoom(roomId);
        } else {
            console.error("onCreateRoom is not defined or not a function");
        }
    };

    const handleAddParticipants = (e) => {
        e.preventDefault();
        onAddParticipants(roomToAddParticipants, selectedParticipants);
        setRoomToAddParticipants("");
        setSelectedParticipants([]);
        setShowAddParticipants(false);
    };

    const toggleParticipant = (userId) => {
        setSelectedParticipants((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };
    const handleOpenModal = () => {
        setIsModalCrearOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalCrearOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí puedes manejar la lógica para crear el grupo
        console.log("Formulario enviado");
        handleCloseModal();
    };

    function salir() {
        logout();
        onLogout();
    }

    return (
        <div className="users-list">
            <div className="users-list-container">
                <div className='usuarios'>
                    <h2>Usuarios Conectados</h2>
                    <ul id="connectedUsers">
                        {users.map((user) => (
                            <li
                                key={user.nickName}
                                className={`user-item ${selectedUserId === user.nickName ? "active" : ""
                                    }`}
                                onClick={() => handleUserClick(user)}
                            >
                                <img src="./user-3296.svg" alt={user.fullName} className="icon-white"/>
                                <span>{user.fullName}</span>
                                {unreadMessages[user.nickName] > 0 && (
                                    <span className="new-message-icon">
                                        {Math.ceil(unreadMessages[user.nickName])}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2>Salas</h2>
                    <ul id="roomsList">
                        {rooms.map((room) => (
                            <div id='sala'>
                                <li
                                    key={room.roomId}
                                    className={`room-item ${selectedRoomId === room.roomId ? 'active' : ''}`}
                                    onClick={() => handleRoomClick(room)}
                                >
                                    <div className='fotoynombre'>
                                        <img src="./room.svg" alt={room.roomId} />
                                        <span>{room.roomId}</span>
                                    </div>
                                    <button className='agregarparticipante'
                                        onClick={() => {
                                            if (roomWithFormOpen === room.roomId) {
                                                setRoomWithFormOpen(null);
                                            } else {
                                                setRoomWithFormOpen(room.roomId);
                                            }
                                            setRoomToAddParticipants(room.roomId);
                                        }}
                                    >
                                        {roomWithFormOpen === room.roomId ? 'Ocultar' : 'Agregar participantes'}
                                    </button>

                                    {roomWithFormOpen === room.roomId && (
                                        <form id="addParticipantsForm" onSubmit={handleAddParticipants}>
                                            <div className='usuariosDisponibles'>
                                                <ul id="availableUsersList">
                                                    {users.map((user) => (
                                                        <li
                                                            key={user.nickName}
                                                            className={`available-user ${selectedParticipants.includes(user.nickName) ? 'active' : ''}`}
                                                            onClick={() => toggleParticipant(user.nickName)}
                                                        >
                                                            {user.fullName}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <button type="submit">Agregar</button>
                                        </form>
                                    )}

                                </li>
                            </div>
                        ))}
                    </ul>
                </div>
                {/* <hr></hr>
                <div className='salas'>
                    <h2>Salas</h2>
                    <ul id="roomsList">
                        {rooms.map((room) => (
                            <li
                                key={room.roomId}
                                className={`room-item ${selectedRoomId === room.roomId ? 'active' : ''}`}
                                onClick={() => handleRoomClick(room)}
                            >
                                <img src="./room.svg" alt={room.roomId} />
                                <span>{room.roomId}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <h2>Create Room</h2>
                <form id="createRoomForm" onSubmit={handleCreateRoom}>
                    <input
                        type="text"
                        id="roomId"
                        value={newRoomId}
                        onChange={(e) => setNewRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        required
                    />
                    <button type="submit">Create Room</button>
                </form> */}

                {/* <h2>Add Participants</h2>
                <button onClick={() => setShowAddParticipants(!showAddParticipants)}>
                    {showAddParticipants ? 'Hide' : 'Show'} Add Participants Form
                </button>
                {showAddParticipants && (
                    <form id="addParticipantsForm" onSubmit={handleAddParticipants}>
                        <input
                            type="text"
                            id="roomToAddParticipants"
                            value={roomToAddParticipants}
                            onChange={(e) => setRoomToAddParticipants(e.target.value)}
                            placeholder="Enter room ID"
                            required
                        />
                        <ul id="availableUsersList">
                            {users.map((user) => (
                                <li
                                    key={user.nickName}
                                    className={`available-user ${selectedParticipants.includes(user.nickName) ? 'active' : ''}`}
                                    onClick={() => toggleParticipant(user.nickName)}
                                >
                                    {user.fullName}
                                </li>
                            ))}
                        </ul>
                        <button type="submit">Add Participants</button>
                    </form>
                )} */}
            </div>
            <div className='logoutBox'>
                <div className='NameAndLogout'>
                    <p id="connected-user-fullname">{currentUser.fullname}</p>
                    <button className="logout" href="#" onClick={salir}>Cerrar sesión</button>
                </div>
                <div>
                    <button className='boton-normal' onClick={openModal}> Crear grupo</button>
                </div>
                <ModalCrearGrupo
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onCreateRoomModal={crearRoomModal}
                />
            </div>
        </div>
    );
}

export default UsersList;
