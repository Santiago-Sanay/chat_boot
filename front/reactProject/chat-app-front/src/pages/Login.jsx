import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const connect = (event) => {
        event.preventDefault();
        const nickname = event.target.nickname.value.trim();
        const fullname = event.target.fullname.value.trim();

        if (nickname && fullname) {
            navigate('/chat', { state: { nickname, fullname } });
        }
    };

    return (
        <div className="user-form" id="username-page">
            <h2>Enter Chatroom</h2>
            <form id="usernameForm" onSubmit={connect}>
                <label htmlFor="nickname">Nickname:</label>
                <input type="text" id="nickname" name="nickname" required />

                <label htmlFor="fullname">Real Name:</label>
                <input type="text" id="fullname" name="realname" required />

                <button type="submit">Enter Chatroom</button>
            </form>
        </div>
    );
};

export default Login;
