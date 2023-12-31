import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import '../styles/AdminControlPanel.css';
import Navbar from "./Navbar";
const Match = () => {
    const { year , match_id} = useParams();
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
    const navigate = useNavigate();
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
        const socket = new WebSocket('ws://localhost:8000');
        setSocket(socket);
        socket.onopen = () => {
            console.log('WebSocket connection opened.');
            const token = JSON.parse(tokenString);
            const jsonData = {
                token: token.token,
                id: 1,
            };
            const resp = JSON.stringify(jsonData);
            socket.send(resp);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // if (data.json_id === 1){
                console.log("here json_id 1");
                setMessage(data);
                console.log(data);
                if (data.cur_bat_team === data.team1.team){
                    let bowl;
                    let str;
                    let nonstr;
                    if (data.bowler !== 0){
                        bowl = data.player2.find(value => value.player_id === data.bowler).name;
                    } else {
                        bowl=0;
                    }
                    if (data.striker !== 0){
                        str = data.player1.find(value => value.player_id === data.striker).name;
                    } else {
                        str=0;
                    }
                    if (data.non_striker !== 0){
                        nonstr = data.player1.find(value => value.player_id === data.non_striker).name;
                    } else {
                        nonstr=0;
                    }
                    console.log(str);
                    console.log(nonstr);
                    console.log(bowl);
                    setStriker(str);
                    setNonStriker(nonstr);
                    setBowler(bowl);
                    setOverNum(parseInt(data.team1.overs/6) +1);
                    setBallCount(data.team1.overs%6);
                } else {
                    let bowl;
                    let str;
                    let nonstr;
                    if (data.bowler !== 0){
                        bowl = data.player1.find(value => value.player_id === data.bowler).name;
                    } else {
                        bowl=0;
                    }
                    if (data.striker !== 0){
                        str = data.player2.find(value => value.player_id === data.striker).name;
                    } else {
                        str=0;
                    }
                    if (data.non_striker !== 0){
                        nonstr = data.player2.find(value => value.player_id === data.non_striker).name;
                    } else {
                        nonstr=0;
                    }
                    console.log(str);
                    console.log(nonstr);
                    console.log(bowl);
                    setStriker(str);
                    setNonStriker(nonstr);
                    setBowler(bowl);
                    setOverNum(parseInt(data.team1.overs/6) +1);
                    setBallCount(data.team2.overs%6);
                }
            } catch (error) {
                console.error('Error parsing incoming JSON:', error);
            }
        };

        socket.onclose = (event) => {
            if (event.code === 1007) {
                navigate("/login");
            }
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
                    {((message.team2.runs <= message.team1.runs) && message.team2.wickets!==10) && (<div style={{color:'white'}}>
                        <p>Striker: {striker}</p>
                        <p>Non-Striker: {non_striker}</p>
                        <p>Cur_bat_team: {message.cur_bat_team}</p>
                        <p>Bowler: {bowler}</p>
                        <p>Over_num: {overNum}</p>
                        <p>Ball_num: {ballCount}</p>
                    </div>)}

                    {((message.team2.runs < message.team1.runs) && message.team2.wickets===10) && (
                        <div>
                            <p>{message.team1.team} won by {message.team1.runs - message.team2.runs} runs</p>
                        </div>
                    )}
                    {(message.team2.runs > message.team1.runs)&& (
                        <div>
                            <p>{message.team2.team} won by {10-message.team2.wickets} wickets</p>
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
                                    <h3>{message.team1.team} Batting</h3>
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
                                    <h3>{message.team2.team} Batting</h3>
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
                                    <h3>{message.team1.team} Bowling</h3>
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
                                    <h3>{message.team2.team} Bowling</h3>
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

export default Match;
