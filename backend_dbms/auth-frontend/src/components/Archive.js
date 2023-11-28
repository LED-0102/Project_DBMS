import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Archive.css';

const ArchivePage = () => {
    const [archiveData, setArchiveData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/archive');
                const data = await response.json();
                setArchiveData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <Navbar />
            <div className="amit1">
                <h1 className="amit2"> Archive</h1>
            </div>

            <div>
                <table className="standings-table">
                    <thead className="amit3">
                    <tr className="amit3">
                        <th>Year</th>
                        <th>HostingCountry</th>
                        <th>WinningTeam</th>
                        <th>RunnerUpTeam</th>
                        <th>Fixtures</th>
                        <th>Standing</th>
                        <th>Stats</th>
                        <th>Players</th>
                    </tr>
                    </thead>
                    <tbody>
                    {archiveData.map((teamData, index) => (
                        <tr key={index}>
                            <td>{teamData.year}</td>
                            <td>{teamData.hosting_country}</td>
                            <td>{teamData.winning_team}</td>
                            <td>{teamData.runner_up_team}</td>
                            <td>
                                <Link to={`/fixtures/${teamData.year}`}>
                                    <button className="yo">Fixtures</button>
                                </Link>
                            </td>
                            <td>
                                <Link to={`/standings/${teamData.year}`}>
                                    <button className="yo">Standings</button>
                                </Link>
                            </td>
                            <td>
                                <Link to={`/stats/${teamData.year}`}>
                                    <button className="yo">Stats</button>
                                </Link>
                            </td>
                            <td>
                                <Link to={`/players/${teamData.year}`}>
                                    <button className="yo">Players</button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ArchivePage;