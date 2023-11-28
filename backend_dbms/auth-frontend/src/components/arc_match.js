import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import '../styles/AdminControlPanel.css';
import Navbar from "./Navbar";
import match from "./Match";
const Arc_Match = () => {
    const { year , match_id} = useParams();
    const navigate = useNavigate();
    if (year==="2023" && match_id==="1") {
        navigate("/match/2023/1");
    }
    const ballValues = [
        { id: 0, value: '0'},
        { id: 1, value: '1'},
        { id: 2, value: '2'},
        { id: 3, value: '3'},
        { id: 4, value: '4'},
        { id: 6, value: '6'},
        { id: 7, value: 'W'},
        { id: 8, value: 'WD'},
        { id: 9, value: 'LB'},
        { id: 10, value: 'NB'}
    ];
    const [currentMatchState, setCurrentMatchState] = useState({});
    const [bowlersList, setBowlersList] = useState([]);
    const [selectedBowlerId, setSelectedBowlerId] = useState(null);
    const [message, setMessage] = useState(null);
    const [socket1, setSocket] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [striker, setStriker] = useState(null);
    const [non_striker, setNonStriker] = useState(null);
    const [bowler, setBowler] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [overNum, setOverNum] = useState(0);
    const [ballDrop, setBallDropdown] = useState(false);
    const [ballChoice, setBallChoice] = useState(null);
    const [ballCount, setBallCount] = useState(0);

    useEffect(() => {
        const tokenString = localStorage.getItem('token');

        if (!tokenString) {
            navigate('/login');
            return;
        }
        fetch(`http://localhost:8080/api/match/${year}/${match_id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Set the fetched data to the state
                setMessage(data);
            })
            .catch(error => {
                // Handle errors
                console.error('Error fetching match data:', error);
                // You can set an error message state here if needed
            });

    }, []);
    // Fetch bowlers list and current match state from WebSocket on component mount


    if (!message) {
        return <div>Loading match data...</div>;
    }
    const team1Bowlers = message.player1.filter(player => player.player_type === 'Bowler' || player.player_type === 'All-rounder');
    const team2Bowlers = message.player2.filter(player => player.player_type === 'Bowler' || player.player_type === 'All-rounder');
    let curBowlers;
    if (message.cur_bat_team === message.team1.team){
        curBowlers = message.player2.filter(player => player.player_type === 'Bowler' || player.player_type === 'All-rounder');
    } else {
        curBowlers = message.player1.filter(player => player.player_type === 'Bowler' || player.player_type === 'All-rounder');
    }

    return (<>
            <Navbar/>
            <div className="admin-control-panel">

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
                    {((message.team2.runs <= message.team1.runs) && message.team2.wickets!==10) && (<div>
                        <p>Striker: {striker} and {message.striker}</p>
                        <p>Non-Striker: {non_striker} and {message.non_striker}</p>
                        <p>Cur_bat_team: {message.cur_bat_team}</p>
                        <p>Bowler: {bowler}</p>
                        <p>Over_num: {overNum}</p>
                        <p>Ball_num: {ballCount}</p>
                    </div>)}

                    {((message.team2.runs < message.team1.runs) && message.team2.wickets===10) && (
                        <div style={{display: 'flex',justifyContent: 'center', alignItems: 'center'}}>
                            <p style={{color:'white'}}>{message.team1.team} won by {message.team1.runs - message.team2.runs} runs</p>
                        </div>
                    )}
                    {(message.team2.runs > message.team1.runs)&& (
                        <div style={{display: 'flex',justifyContent: 'center', alignItems: 'center'}}>
                            <p style={{color:'white'}}>{message.team2.team} won by {10-message.team2.wickets} wickets</p>
                        </div>
                    )}


                    {/* Display over-by-over happenings for both teams */}


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
                                    <h3 style={{color:'white'}}>{message.team1.team} Batting</h3>
                                    <table className="tq">
                                        <thead>
                                        <tr>
                                            <th>Batsman</th>
                                            <th>Runs</th>
                                            <th>Balls</th>
                                            <th>4s</th>
                                            <th>6s</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {message.player1.map(player => (
                                            <tr key={player.player_id}>
                                                <td>{player.name}</td>
                                                <td>{player.runs_scored}</td>
                                                <td>{player.balls_faced}</td>
                                                <td>{player.four_bat}</td>
                                                <td>{player.six_bat}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {selectedTable === 'team2-batting' && (
                                <div className="table">
                                    <h3 style={{color:'white'}}>{message.team2.team} Batting</h3>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Batsman</th>
                                            <th>Runs</th>
                                            <th>Balls</th>
                                            <th>4s</th>
                                            <th>6s</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {message.player2.map(player => (
                                            <tr key={player.player_id}>
                                                <td>{player.name}</td>
                                                <td>{player.runs_scored}</td>
                                                <td>{player.balls_faced}</td>
                                                <td>{player.four_bat}</td>
                                                <td>{player.six_bat}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {selectedTable === 'team1-bowling' && (
                                <div className="table">
                                    <h3 style={{color:'white'}}>{message.team1.team} Bowling</h3>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Bowler</th>
                                            <th>Balls</th>
                                            <th>RunsConceded</th>
                                            <th>Wickets</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {team1Bowlers.map(player => (
                                            <tr key={player.player_id}>
                                                <td>{player.name}</td>
                                                <td>{player.balls_bowled}</td>
                                                <td>{player.runs_conceded}</td>
                                                <td>{player.wickets}</td>

                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}


                            {selectedTable === 'team2-bowling' && (
                                <div className="table">
                                    <h3 style={{color:'white'}}>{message.team2.team} Bowling</h3>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Bowler</th>
                                            <th>Balls</th>
                                            <th>RunsConceded</th>
                                            <th>Wickets</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {team2Bowlers.map(player => (
                                            <tr key={player.player_id}>
                                                <td>{player.name}</td>
                                                <td>{player.balls_bowled}</td>
                                                <td>{player.runs_conceded}</td>
                                                <td>{player.wickets}</td>

                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div></>
    );
};

export default Arc_Match;
