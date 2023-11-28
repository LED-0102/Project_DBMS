import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import '../styles/Standings.css';
import Footer from "./Footer";
import {useParams} from "react-router-dom";

const StandingsPage = () => {
    const [standingsData, setStandingsData] = useState([]);
    const { year } = useParams();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/table/${year}`);
                const data = await response.json();
                setStandingsData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ background: '#4a2780', height: '100vh' }}>
            <Navbar />
            <div className='topbar'>
                <h1 className='heading1'>Standings</h1>
            </div>
            <div class="div-with-line">
                <div class="line"></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', alignItems: 'center' }}>
                <table className="standings-table">
                    <thead className='amit3'>
                    <tr className='amit3'>
                        <th>Team</th>
                        <th>Won</th>
                        <th>Lost</th>
                        <th>Points</th>
                    </tr>
                    </thead>
                    <tbody>
                    {standingsData.map((teamData, index) => (
                        <tr key={index}>
                            <td>{teamData.team_playing}</td>
                            <td>{teamData.won}</td>
                            <td>{teamData.lost}</td>
                            <td>{2 * teamData.won + teamData.draw}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <Footer/>
        </div>
    );
};

export default StandingsPage;