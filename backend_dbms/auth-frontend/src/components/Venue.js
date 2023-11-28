import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import '../styles/Venue.css';

const VenuesPage = () => {
    const [venuesData, setVenuesData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/venues/2023');
                const data = await response.json();
                setVenuesData(data);
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
                <h1 className='amit2'>Venues</h1>
            </div>
            <div class="div-with-line">
            </div>
            <div>
                <table className="standings-table">
                    <thead className='amit3'>
                    <tr className='amit3'>
                        <th>Stadium</th>
                        <th>City</th>
                        <th>Country</th>
                        <th>Capacity</th>
                    </tr>
                    </thead>
                    <tbody>
                    {venuesData.map((venueData, index) => (
                        <tr key={index}>
                            <td>{venueData.name}</td>
                            <td>{venueData.city}</td>
                            <td>{venueData.country}</td>
                            <td>{venueData.capacity}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default VenuesPage;