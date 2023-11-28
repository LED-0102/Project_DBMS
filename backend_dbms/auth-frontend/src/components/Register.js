import React, { useEffect, useState } from "react";
import  "../styles/Login.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate, NavLink } from "react-router-dom";
import api from "../services/api";


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


    const validateForm = (values) => {
        const error = {};
        const regex = /^[^\s+@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if (!values.fname) {
            error.fname = "First Name is required";
        }
        if (!values.lname) {
            error.lname = "Last Name is required";
        }
        if (!values.email) {
            error.email = "Email is required";
        } else if (!regex.test(values.email)) {
            error.email = "This is not a valid email format!";
        }
        if (!values.password) {
            error.password = "Password is required";
        } else if (values.password.length < 4) {
            error.password = "Password must be more than 4 characters";
        } else if (values.password.length > 10) {
            error.password = "Password cannot exceed more than 10 characters";
        }
        if (!values.cpassword) {
            error.cpassword = "Confirm Password is required";
        } else if (values.cpassword !== values.password) {
            error.cpassword = "Confirm password and password should be same";
        }
        return error;
    };
    return (
        <>
            <Navbar/>
            <div className="register">
                <form onSubmit={handleRegister}>
                    <h1 style={{color: "white",paddingBottom: '30px'}}>Create your account</h1>
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
                    <input
                        type="password"
                        name="cpassword"
                        id="cpassword"
                        placeholder="Confirm Password"
                    />
                    <button className="button_common" type="submit">
                        Register
                    </button>
                    {error && <p>{error}</p>}
                </form>
                <NavLink to="/login" style={{color: 'white'}}>Already registered? Login</NavLink>
            </div>
            <Footer/>
        </>
    );
};
export default Register;