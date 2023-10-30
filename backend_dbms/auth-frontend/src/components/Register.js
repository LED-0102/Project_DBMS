import React, { useState } from 'react';
import api from '../services/api';
import '../styles/Register.css';
import {useNavigate} from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await api.register(username, password);
            console.log(response);
            if (response.status === 201) {
                history('/login');
            } else {
                setError("Registration failed. Please try again");
            }
            // Handle successful registration, redirect or show a success message
        } catch (error) {
            setError(error.message); // Handle registration error
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
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
                <button type="submit">Register</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
};

export default Register;
