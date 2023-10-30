import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MatchFixtures.css'; // Import your CSS file here

const Fixtures = () => {
    const [fixtures, setFixtures] = useState([]);

    useEffect(() => {
        // Fetch fixtures data from the backend when the component mounts
        fetch('http://localhost:8080/api/fixtures') // Assuming your backend API endpoint is '/fixtures'
            .then((response) => response.json())
            .then((data) => {
                setFixtures(data); // Set the fixtures state with the received data
            })
            .catch((error) => {
                console.error('Error fetching fixtures:', error);
            });
    }, []); // Empty dependency array ensures the effect runs once after the initial render

    return (
        <div className="match-fixtures-container">
            <h1>Cricket World Cup Fixtures</h1>
            {fixtures.map((fixture) => (
                <Link
                    to={`/match/${fixture.match_id}`} // Define the route parameter for match_id
                    key={fixture.match_id}
                    className="match-fixture-box"
                >
                    <div className="fixture-info">
                        <p className="fixture-header">Match ID: {fixture.match_id}</p>
                        <p>Teams: {fixture.team1} vs {fixture.team2}</p>
                        <p>Venue ID: {fixture.venue_id}</p>
                        <p>
                            Runs scored by {fixture.team1}: {fixture.run1}, Wickets: {fixture.wicket1}
                        </p>
                        <p>
                            Runs scored by {fixture.team2}: {fixture.run2}, Wickets: {fixture.wicket2}
                        </p>
                        <p>First Batting Team: {fixture.first_bat}</p>
                        <p>Balls Bowled by {fixture.team1}: {fixture.ball1}</p>
                        <p>Balls Bowled by {fixture.team2}: {fixture.ball2}</p>
                        <p>Winner: {fixture.winner}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default Fixtures;