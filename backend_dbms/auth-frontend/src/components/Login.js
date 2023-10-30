import React, { useState } from 'react';
import api from '../services/api';
import '../styles/Login.css';
import {useNavigate} from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.login(username, password);
            console.log(response.status);
            if (response.status === 200){
                localStorage.setItem("token", response.data);
                navigate("/welcome");
            }

            else if (response.status === 404){
                console.log("User not found");
            } else if (response.status === 401) {
                console.log("Incorrect Password");
                setError("Incorrect Password");
            }
            // Store the token in local storage or context for future use
        } catch (error) {
            setError(error.message); // Handle login error
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
};

export default Login;
