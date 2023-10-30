import React, { useState, useEffect } from 'react';
import {useNavigate} from "react-router-dom";
import './MatchFixtures.css';

const CricketMatchInfo = () => {
    const [message, setMessage] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const tokenString = localStorage.getItem('token');
        if (!tokenString) {
            navigate('/login');
            return;
        }
        const socket = new WebSocket('ws://localhost:8000');

        socket.onopen = () => {
            console.log('WebSocket connection opened.');
            const token = JSON.parse(tokenString);
            const jsonData = {
                token: token.token,
                id: 1,
            };
            socket.send(JSON.stringify(jsonData));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(data);
                if (data.json_id === 1){
                    setMessage(data);
                }

                console.log(data.player1);
            } catch (error) {
                console.error('Error parsing incoming JSON:', error);
            }
        };

        socket.onclose = (event) => {
            if (event.code === 1000) {
                console.log('WebSocket connection closed cleanly, no errors.');
            } else {
                console.error('WebSocket connection closed with error:', event);
            }
        };

        // Cleanup the socket connection when the component is unmounted
        return () => {
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        };
    }, []);

    if (!message) {
        return <div>Loading match data...</div>;
    }

    const team1Bowlers = message.player1.filter(player => player.player_type === 'Bowler' || player.player_type === 'All-rounder');
    const team2Bowlers = message.player2.filter(player => player.player_type === 'Bowler' || player.player_type === 'All-rounder');

    return (
        <div className="cricket-match-info">
            <h1>{message.team1.team} vs {message.team2.team}</h1>
            <h2>Venue: {message.venue.venue_name}, {message.venue.city}, {message.venue.country}</h2>

            {/* Display scores, wickets, balls taken for both teams */}
            <div className="team-info">
                <div className="team">
                    <h3>{message.team1.team}</h3>
                    <p>Scores: {message.team1.runs}</p>
                    <p>Wickets: {message.team1.wickets}</p>
                    <p>Balls Taken: {message.team1.overs}</p>
                </div>
                <div className="team">
                    <h3>{message.team2.team}</h3>
                    <p>Scores: {message.team2.runs}</p>
                    <p>Wickets: {message.team2.wickets}</p>
                    <p>Balls Taken: {message.team2.overs}</p>
                </div>
            </div>
            <div>
                <p>Striker: {message.striker}</p>
                <p>Non-Striker: {message.non_striker}</p>
                <p>Cur_bat_team: {message.cur_bat_team}</p>
                <p>Bowler: {message.bowler}</p>
            </div>

            {/* Display over-by-over happenings for both teams */}
            <div className="over-happenings">
                {/* Display 6 slots for the happenings of an over for team 1 */}
                {Array.from({ length: 6 }, (_, index) => (
                    <div className="over-slot" key={`team1-over-${index + 1}`}>...</div>
                ))}
                {/* Display 6 slots for the happenings of an over for team 2 */}
                {Array.from({ length: 6 }, (_, index) => (
                    <div className="over-slot" key={`team2-over-${index + 1}`}>...</div>
                ))}
            </div>

            {/* Display player names for team 1 batting, team 2 batting, team 1 bowling, and team 2 bowling */}
            <div className="table-selector">
                <div
                    className={`table-name ${selectedTable === 'team1-batting' ? 'active' : ''}`}
                    onClick={() => setSelectedTable('team1-batting')}
                >
                    Team 1 Batting
                </div>
                <div
                    className={`table-name ${selectedTable === 'team2-batting' ? 'active' : ''}`}
                    onClick={() => setSelectedTable('team2-batting')}
                >
                    Team 2 Batting
                </div>
                <div
                    className={`table-name ${selectedTable === 'team1-bowling' ? 'active' : ''}`}
                    onClick={() => setSelectedTable('team1-bowling')}
                >
                    Team 1 Bowling
                </div>
                <div
                    className={`table-name ${selectedTable === 'team2-bowling' ? 'active' : ''}`}
                    onClick={() => setSelectedTable('team2-bowling')}
                >
                    Team 2 Bowling
                </div>
            </div>

            {/* Render respective table based on selectedTable */}
            {selectedTable && (
                <div className="table-content">
                    {selectedTable === 'team1-batting' && (
                        <div className="table">
                            <h3>{message.team1.team} Batting</h3>
                            <ul>
                                {message.player1.map(player => (
                                    <li key={player.player_id}>{player.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {selectedTable === 'team2-batting' && (
                        <div className="table">
                            <h3>{message.team2.team} Batting</h3>
                            <ul>
                                {message.player2.map(player => (
                                    <li key={player.player_id}>{player.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {selectedTable === 'team1-bowling' && (
                        <div className="table">
                            <h3>{message.team1.team} Bowling</h3>
                            <ul>
                                {team1Bowlers.map(player => (
                                    <li key={player.player_id}>{player.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {selectedTable === 'team2-bowling' && (
                        <div className="table">
                            <h3>{message.team2.team} Bowling</h3>
                            <ul>
                                {team2Bowlers.map(player => (
                                    <li key={player.player_id}>{player.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CricketMatchInfo;
