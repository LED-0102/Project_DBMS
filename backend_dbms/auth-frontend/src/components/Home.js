import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css'

const Home = () => {
    return (
        <div className="home-container">
            <h1>Welcome to User Registration App</h1>
            <div className="button-container">
                <Link to="/register" className="button">Register</Link>
                <Link to="/login" className="button">Login</Link>
            </div>
        </div>
    );
};

export default Home;
