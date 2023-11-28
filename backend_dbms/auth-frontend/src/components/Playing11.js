import React, { useState, useEffect } from 'react';
import '../styles/Playing11.css';
import Navbar from './Navbar';
import { FaTimes } from "react-icons/fa";
import {useParams} from "react-router-dom";

const PlayerProfile = ({ player, year, onClose }) => {
    const [datap, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/player/${year}/${player.player_id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error fetching player data:', error);
            }
        };
        fetchData();
    }, [player]);
console.log(datap);
    // Styles and rendering for the player profile
    const profileStyle = {
        position: 'fixed',
        zIndex: '1',
        top: '50%',
        left: '50%',
        width: '35%',
        textAlign: 'center',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        borderRadius: '10px',
        background: 'rgb(126, 57, 126)',
        boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.2)',
        color: '#f9f9f9',
        margin: 'auto',
    };

    const playerNameStyle = {
        fontSize: '35px',
        fontWeight: 'bold',
        marginBottom: '5px',
    };

    const countryStyle = {
        fontSize: '20px',
    };

    const statsStyle = {
        fontSize: '18px',
        fontWeight: '600',
        margin: '20px 0',
        padding: '0px 0px',
    };


    return (
        <div className="main">
            {datap && (
                <div style={profileStyle}>
                    <div className='yoga'>
                        <FaTimes alt="Close" onClick={onClose} style={{ height: "20px", width: "30px", borderRadius: "50%", cursor: "pointer" }} />
                    </div>
                    <div>
                        <div style={playerNameStyle}>{datap[0].name}</div>
                        <div style={countryStyle}>{player.country}</div>
                    </div>
                    <div style={statsStyle}>
                        <p>Player Type: {datap[0].player_type}</p>
                        <p>Player Sequence: {datap[0].player_seq}</p>
                        <p>Hand: {datap[0].hand}</p>
                        <p>Runs: {datap[0].run}</p>
                        <p>Sixes: {datap[0].six}</p>
                        <p>Fours: {datap[0].four}</p>
                        <p>Balls Faced: {datap[0].ball_faced}</p>
                        <p>Balls Bowled: {datap[0].balls_bowled}</p>
                        <p>Runs Conceded: {datap[0].runs_conceded}</p>
                        <p>Wickets: {datap[0].wickets}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const Playing11 = () => {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const {year} = useParams();
    useEffect(() => {
        fetch(`http://localhost:8080/api/table/${year}`)
            .then((response) => response.json())
            .then((data) => {
                setTeams(data);
                setSelectedTeam(data[0]?.team_playing);
            })
            .catch((error) => console.error('Error fetching teams:', error));
    }, []);

    useEffect(() => {
        if (selectedTeam) {
            fetch(`http://localhost:8080/api/teams/${year}/${selectedTeam}`)
                .then((response) => response.json())
                .then((data) => {
                    setPlayers(data);
                    setSelectedPlayer(null);
                })
                .catch((error) => console.error('Error fetching players:', error));
        }
    }, [selectedTeam]);

    const displayPlayerProfile = (player) => {
        setSelectedPlayer(player);
    };

    const closePlayerProfile = () => {
        setSelectedPlayer(null);
    };

    return (
        <>
            <Navbar />
            <div className={`aru ${selectedPlayer ? 'blur-background' : ''}`}>

                <div className="team-list">
                    {teams.map((team) => (
                        <div
                            key={team.team_playing}
                            className={`team-box ${selectedTeam === team.team_playing ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedTeam(team.team_playing);
                            }}
                        >
                            {team.team_playing}
                        </div>
                    ))}
                </div>
                {selectedTeam && (
                    <div className="players-table" id="playersTable">
                        <table>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Hand</th>
                                <th>Sequence</th>
                            </tr>
                            </thead>
                            <tbody>
                            {players.map((player, index) => (
                                <tr
                                    key={index}
                                    onClick={() => displayPlayerProfile(player)}
                                >
                                    <td>{player.name}</td>
                                    <td>{player.player_type}</td>
                                    <td>{player.hand}</td>
                                    <td>{player.player_seq}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {selectedPlayer && (
                    <div className='player-profile-wrapper'>
                        <div className="player-profile-box">
                            <PlayerProfile player={selectedPlayer} onClose={closePlayerProfile} year={year}/>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Playing11;























