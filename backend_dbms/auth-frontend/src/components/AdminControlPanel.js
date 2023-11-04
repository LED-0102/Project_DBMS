import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './AdminControlPanel.css'; // Import your CSS file for styling

const AdminControlPanel = () => {
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
                // } else if (data.json_id === 2){
                //     console.log("here json_id 2");
                //     setMessage(prev => {
                //         let team = [];
                //         if (data.team === prev.team1.team){
                //             team = prev.player1;
                //         } else if (data.team === prev.team2.team){
                //             team = prev.player2;
                //         }
                //         console.log(team);
                //         const str = team.find(value => value.player_id === data.striker).name;
                //         console.log(str);
                //
                //         const nonstr = team.find(value => value.player_id === data.non_striker).name;
                //         console.log(nonstr);
                //         setStriker(str);
                //         setNonStriker(nonstr);
                //         return {
                //             ...prev,
                //             striker: data.striker,
                //             non_striker: data.non_striker,
                //             cur_bat_team: data.team,
                //         };
                //     });
                //     console.log(message.striker);
                //     console.log(message.non_striker);
                // }
                // else if (data.json_id === 3) {
                //     console.log(data);
                //     setMessage(prev => {
                //         let team = [];
                //         if (prev.cur_bat_team === prev.team1.team) {
                //             console.log("Inside 1");
                //             team = prev.player1;
                //         } else if (prev.cur_bat_team === prev.team2.team) {
                //             console.log("Inside 2");
                //             team = prev.player2;
                //         }
                //         console.log("Outside 3");
                //         const str = team.find(value => value.player_id === data.striker).name;
                //         const nonstr = team.find(value => value.player_id === data.non_striker).name;
                //         setStriker(str);
                //         setNonStriker(nonstr);
                //         setOverNum(data.over_num);
                //         return {
                //             ...prev,
                //             striker: data.striker,
                //             non_striker: data.non_striker,
                //             bowler: data.bowler,
                //             over_num: data.over_num,
                //         };
                //     });
                // } else if (data.json_id === 4){
                //     console.log(data);
                //     setMessage(prev => {
                //         let team = [];
                //         let team2= [];
                //         const value = ballValues.find(value => value.id === data.figure).value;
                //         if (prev.cur_bat_team === prev.team1.team) {
                //             console.log("Inside 1");
                //             team = prev.player1;
                //             team2 = prev.player2;
                //         } else if (prev.cur_bat_team === prev.team2.team) {
                //             console.log("Inside 2");
                //             team = prev.player2;
                //             team2 = prev.player1;
                //         }
                //         if (data.figure <= 3)
                //         console.log("Outside 3");
                //         const str = team.find(value => value.player_id === data.striker).name;
                //         const nonstr = team.find(value => value.player_id === data.non_striker).name;
                //         const bowler = team2.find(value => value.player_id === data.bowler).name;
                //         setStriker(str);
                //         setNonStriker(nonstr);
                //         setBowler(bowler);
                //         setOverNum(data.over_num);
                //         return {
                //             ...prev,
                //             striker: data.striker,
                //             non_striker: data.non_striker,
                //             bowler: data.bowler,
                //             over_num: data.over_num,
                //         };
                //     });
                // }
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

    const handleWebSocketConnection = () => {
        const tokenString = localStorage.getItem('token');
        if (!tokenString) {
            navigate('/login');
            return;
        }
        const token = JSON.parse(tokenString);
        if (socket1) {
            const jsonData = {
                token: token.token,
                id: 2,
                team: message.cur_bat_team,
            };

            const jsonString = JSON.stringify(jsonData);
            console.log(jsonString);
            socket1.send(jsonString)
        }
    };
    const handleBallClick = () => {
        setBallDropdown(true);
    }
    const handleStartOverClick = () => {
        setShowDropdown(true);
    };
    const handleStartOver = () => {
        // Assuming selectedBowlerId is the ID of the selected bowler
        // if (message.cur_bat_team === message.team1.team) {
        //     team1Bowlers = message.player2.filter(player => player.player_type === 'Bowler' || player.player_type === 'All-rounder');
        // } else if (message.cur_bat_team === message.team2.team) {
        //     team1Bowlers = message.player1.filter(player => player.player_type === 'Bowler' || player.player_type === 'All-rounder');
        // }

        if (selectedBowlerId) {
            const tokenString = localStorage.getItem('token');
            if (!tokenString) {
                navigate('/login');
                return;
            }
            const token = JSON.parse(tokenString);
            if (socket1) {
                const jsonData = {
                    token: token.token,
                    id: 3,
                    striker: message.striker,
                    non_striker: message.non_striker,
                    bowler: Number(selectedBowlerId)
                };

                const jsonString = JSON.stringify(jsonData);
                console.log(jsonString);
                socket1.send(jsonString)
            }
        } else {
            console.error('Invalid selected bowler ID');
        }

        // Reset dropdown visibility and selectedBowlerId after selection
        setShowDropdown(false);
        setSelectedBowlerId('');
    };

    const handleBallByBallEntry = () => {
        // Implement logic for ball-by-ball entry
        const tokenString = localStorage.getItem('token');
        if (!tokenString) {
            navigate('/login');
            return;
        }
        const token = JSON.parse(tokenString);
        if (ballChoice <= 7){
            setBallCount( prev => prev+1);
        }
        let inn;
        if (message.cur_bat_team === message.team1.team){
            inn = 1;
        } else {
            inn = 2;
        }
        const jsonData = {
            token: token.token,
            bowler: message.bowler,
            striker: message.striker,
            non_striker: message.non_striker,
            ball_num: ballCount,
            inning: inn,
            fig: Number(ballChoice),
            id: 4,
        }
        const jsonString = JSON.stringify(jsonData);
        socket1.send(jsonString);
        console.log(jsonString);
        console.log(ballChoice);
        console.log(ballCount);
        if (ballCount  === 6){
            setBallDropdown(false);
        }
    };

    const handleEndInnings = () => {
        const tokenString = localStorage.getItem('token');
        if (!tokenString) {
            navigate('/login');
            return;
        }
        const token = JSON.parse(tokenString);
        const jsonData = {
            token: token.token,
            id: Number(5),
        }
        socket1.send(JSON.stringify(jsonData));
    };

    const handleEndMatch = () => {
        const tokenString = localStorage.getItem('token');
        if (!tokenString) {
            navigate('/login');
            return;
        }
        const token = JSON.parse(tokenString);
        const jsonData = {
            token: token.token,
            id: Number(6),
        }
        socket1.send(JSON.stringify(jsonData));
    };

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

    return (
        <div className="admin-control-panel">
            <h1>Admin Control Panel</h1>
            <div className="buttons-container">
                <button onClick={handleWebSocketConnection}>Start Match</button>
                <button onClick={handleStartOverClick}>Start Over</button>
                {showDropdown && (
                    <select onChange={(e) => setSelectedBowlerId(e.target.value)}>
                        <option value="">Select Bowler</option>
                        {
                            curBowlers.map(bowler => (
                            <option key={bowler.player_id} value={bowler.player_id}>
                                {bowler.name}
                            </option>
                        ))}
                    </select>
                )}
                {selectedBowlerId && (
                    <button onClick={handleStartOver}>Confirm Selection</button>
                )}
                <button onClick={handleBallClick}>Ball-by-Ball Entry</button>
                {ballDrop && (
                    <select onChange={(e) => setBallChoice(e.target.value)}>
                        <option value="">Select Event</option>
                        {
                            ballValues.map(bowler => (
                                <option key={bowler.id} value={bowler.id}>
                                    {bowler.value}
                                </option>
                            )
                        )}
                    </select>
                )}
                {ballChoice && (
                    <button onClick={handleBallByBallEntry}>Confirm Selection</button>
                )}
                <button onClick={handleEndInnings}>End Innings</button>
                <button onClick={handleEndMatch}>End Match</button>
            </div>
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
                                <ul>
                                    {message.player1.map(player => (
                                        <li key={player.player_id}>{player.name} {player.runs_scored} {player.balls_faced} {player.four_bat} {player.six_bat}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {selectedTable === 'team2-batting' && (
                            <div className="table">
                                <h3>{message.team2.team} Batting</h3>
                                <ul>
                                    {message.player2.map(player => (
                                        <li key={player.player_id}>{player.name} {player.runs_scored} {player.balls_faced} {player.four_bat} {player.six_bat}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {selectedTable === 'team1-bowling' && (
                            <div className="table">
                                <h3>{message.team1.team} Bowling</h3>
                                <ul>
                                    {team1Bowlers.map(player => (
                                        <li key={player.player_id}>{player.name} {player.balls_bowled} {player.runs_conceded} {player.wickets}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {selectedTable === 'team2-bowling' && (
                            <div className="table">
                                <h3>{message.team2.team} Bowling</h3>
                                <ul>
                                    {team2Bowlers.map(player => (
                                        <li key={player.player_id}>{player.name} {player.balls_bowled} {player.runs_conceded} {player.wickets}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminControlPanel;
