import React, { useState, useEffect } from "react";
import api from '../services/api';
import "../styles/Login.css";
import { useNavigate, NavLink} from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

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
                navigate("/home")
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

    return (<>

            <Navbar/>

            <div className="login">
                <form onSubmit={handleLogin}>
                    <h1 style={{color: "white",paddingBottom: '30px'}}>Login</h1>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}

                    />
                    {/*<p className="error">{formErrors.email}</p>*/}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}

                    />
                    {/*<p className="error">{formErrors.password}</p>*/}
                    <button className="button_common" type="submit">
                        Login
                    </button>
                    {error && <p>{error}</p>}
                </form>
                <NavLink to="/register" style={{color: 'white'}}>Not Registered Yet! Register Now</NavLink>
            </div>

        </>
    );
};
export default Login;