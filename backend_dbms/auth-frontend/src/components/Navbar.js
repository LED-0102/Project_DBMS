// Navbar.js

import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {

    return (
        <>
            <nav className="navbar">
                <div className="logohead">
                    <a href='https://www.icc-cricket.com/homepage' >
                        <img src='logo.jpg' alt=" " className="logoImgStyle" />
                    </a>
                    <h2 className="navhead">Cricket World Cup</h2>
                </div>
                <div>
                    <ul style={{ display: 'flex', listStyleType: 'none', padding: '0', margin: '0' }}>
                        <li className="navItemStyle">
                            <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '10px' }}>Home</a>
                        </li>
                        <li className="navItemStyle">
                            <a href="/fixtures/2023" style={{ color: 'white', textDecoration: 'none', padding: '10px' }}>Matches</a>
                        </li>
                        <li className="navItemStyle">
                            <a href="/standings/2023" style={{ color: 'white', textDecoration: 'none', padding: '10px' }}>Standings</a>
                        </li>
                        <li className="navItemStyle">
                            <a href="/venues" style={{ color: 'white', textDecoration: 'none', padding: '10px' }}>Venues</a>
                        </li>
                        <li className="navItemStyle">
                            <a href="/players/2023" style={{ color: 'white', textDecoration: 'none', padding: '10px' }}>Players</a>
                        </li>
                        <li className="navItemStyle">
                            <a href="/stats/2023" style={{ color: 'white', textDecoration: 'none', padding: '10px' }}>Stats</a>
                        </li>
                        <li className="navItemStyle">
                            <a href="/archive" style={{ color: 'white', textDecoration: 'none', padding: '10px' }}>Archive</a>
                        </li>
                    </ul>
                </div>
                <div className="sign">
                    <a href='Login'>
                        <button className="buttonStyle">Sign In</button>
                    </a>
                    <div className="separatorStyle"></div>
                    <a href='register'>
                        <button className="buttonStyle">Sign Up</button>
                    </a>
                </div>
            </nav>
        </>
    );
};

export default Navbar;