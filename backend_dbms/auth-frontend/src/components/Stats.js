import React from 'react';
import Navbar from "./Navbar";
import {NavLink, useParams} from 'react-router-dom';
import {useState,useEffect} from 'react';
const CricketStats = () => {
    const [topPlayers, setTopPlayers] = useState(null);
    const { year } = useParams();
    useEffect(() => {
        // Fetch fixtures data from the backend when the component mounts
        fetch(`http://localhost:8080/api/stats/${year}`) // Assuming your backend API endpoint is '/fixtures'
            .then((response) => response.json())
            .then((data) => {
                setTopPlayers(data); // Set the fixtures state with the received data
            })
            .catch((error) => {
                console.error('Error fetching fixtures:', error);
            });
    }, []); // Empty dependency array ensures the effect runs once after the initial render

    const topbar = {
        background: "purple",
        marginBottom: '30px',
    };

    const heading1 = {
        fontSize: '50px',
        color: 'white',
        fontFamily: 'Gill Sans, "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
        textTransform: 'uppercase',
        paddingTop: '80px',
        paddingLeft: '50px',
    };

    const containerStyle = {
        display: 'flex', // Make the container a flex container
    };

    const contentStyle = {
        width: '25%', // Each section takes 25% of the container width
        background: 'purple',
    };

    const statCategoryStyle = {
        margin: '20px',
        padding: '20px',
        borderRadius: '5px',
        background: 'rgb(126, 57, 126)',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
    };

    const ulStyle = {
        listStyleType: 'none',
        padding: '0',
    };

    const liStyle = {
        margin: '10px 0',
        fontSize: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    };

    const topPlayerStyle = {
        fontWeight: 'bold',
        fontSize: '20px',
        color: '#333',
    };

    return (
        <>
            <Navbar />
            <div style={topbar}>
                <h1 style={heading1}>World Cup'23 Stats</h1>
            </div>
            {topPlayers && (<div className="cricket-stats" style={containerStyle}>
                <div style={contentStyle}>
                    <div style={statCategoryStyle}>
                        <h2 style={{ fontSize: '28px', marginBottom: '10px', color: '#f9f9f9' }}>Most Runs</h2>
                        <ul style={ulStyle}>
                            {topPlayers.runs.map((player, index) => (
                                <li key={index} style={{ ...liStyle, ...(index === 0 && topPlayerStyle) }}>
                                    <span>{player.name}</span>
                                    <span>{`${player.run}`}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={contentStyle}>
                    <div style={statCategoryStyle}>
                        <h2 style={{ fontSize: '28px', marginBottom: '10px', color: '#f9f9f9' }}>Most Wickets</h2>
                        <ul style={ulStyle}>
                            {topPlayers.wickets.map((player, index) => (
                                <li key={index} style={{ ...liStyle, ...(index === 0 && topPlayerStyle) }}>
                                    <span>{player.name}</span>
                                    <span>{`${player.wickets}`}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={contentStyle}>
                    <div style={statCategoryStyle}>
                        <h2 style={{ fontSize: '28px', marginBottom: '10px', color: '#f9f9f9' }}>Most Fours</h2>
                        <ul style={ulStyle}>
                            {topPlayers.four.map((player, index) => (
                                <li key={index} style={{ ...liStyle, ...(index === 0 && topPlayerStyle) }}>
                                    <span>{player.name}</span>
                                    <span>{`${player.four}`}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={contentStyle}>
                    <div style={statCategoryStyle}>
                        <h2 style={{ fontSize: '28px', marginBottom: '10px', color: '#f9f9f9' }}>Most Sixes</h2>
                        <ul style={ulStyle}>
                            {topPlayers.six.map((player, index) => (
                                <li key={index} style={{ ...liStyle, ...(index === 0 && topPlayerStyle) }}>
                                    <span>{player.name}</span>
                                    <span>{`${player.six}`}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>)}
        </>
    );
};

export default CricketStats;