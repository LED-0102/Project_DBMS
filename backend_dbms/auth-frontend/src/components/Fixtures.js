import React, {useEffect, useState} from 'react';
import {NavLink,Link, useParams} from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/MatchFixtures.css'; // Import your CSS file here
import mainlogo from "../mainlogo.jpg";
const Fixtures = () => {
    const [fixtures, setFixtures] = useState([]);
    const { year } = useParams();
    useEffect(() => {
        // Fetch fixtures data from the backend when the component mounts
        fetch(`http://localhost:8080/api/fixtures/${year}`) // Assuming your backend API endpoint is '/fixtures'
            .then((response) => response.json())
            .then((data) => {
                setFixtures(data); // Set the fixtures state with the received data
                console.log("Fixture data", data);
            })
            .catch((error) => {
                console.error('Error fetching fixtures:', error);
            });
    }, [year]); // Empty dependency array ensures the effect runs once after the initial render

    return (<><Navbar />
        <div style={{ background: '#4a2780', height: '100vh' }}>

            <div className='topbar'>
                <h1 className='heading1'>World Cup Fixtures</h1>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <div className="match-fixtures-container">
                    {fixtures.map((fixture) => (
                        <div key={fixture.match_id} className="match-fixture-box">
                            <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '0px'}}>
                                <Link to={`/arc_match/${fixture.year}/${fixture.match_id}`}>
                                    <p style={{fontSize: '17px', color: '#2E0273', fontWeight: 'bold',}}>{fixture.team1} vs {fixture.team2}</p>
                                    {/* <p className="fixture-id">Match ID: {fixture.match_id}</p> */}
                                </Link>
                                <p style={{marginRight: '8px'}}>Venue: {fixture.venue}, {fixture.city}</p>
                            </div>
                            <div style={{display:'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                <div className="fixture-teams">
                                    <div>
                                        <p className='fixture-team'>{fixture.team1}</p>
                                        <p className='fixture-team'>{fixture.team2}</p>
                                    </div>
                                    <div style={{display: 'flex', paddingTop: '4px'}}>
                                        <div className='score'>
                                            <p>{fixture.run1}/{fixture.wicket1}</p>
                                            <p>{fixture.run2}/{fixture.wicket2}</p>
                                        </div>
                                        <div className='balls'>
                                            {/* <p>First Batting Team: {fixture.first_bat}</p> */}
                                            <p>Balls:{fixture.ball2}</p>
                                            <p>Balls:{fixture.ball1}</p>
                                        </div>
                                    </div>
                                </div>
                                <p style={{marginTop: '0px', paddingTop: '0px', fontSize: '18px', fontWeight: 'bold'}}>Winner: {fixture.winner}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
        </>
    );
};

export default Fixtures;