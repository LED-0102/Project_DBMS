import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Homepage from "./components/Home";
import Fixtures from "./components/Fixtures";
import Match from "./components/Match";
import AdminControlPanel from "./components/AdminControlPanel";
import Playing11 from "./components/Playing11";
import Stats from "./components/Stats";
import Archive from "./components/Archive";
import VenuesPage from "./components/Venue";
import StandingsPage from "./components/Standings";
import Arc_Match from "./components/arc_match";
import Navbar from "./components/Navbar";
const App = () => {
    return (

                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/home" element={<Homepage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/fixtures/:year" element={<Fixtures />} />
                    <Route path="/match/:year/:match_id" element={<Match />} />
                    <Route path="/arc_match/:year/:match_id" element={<Arc_Match />} />
                    <Route path="/admin" element={<AdminControlPanel />} />
                    <Route path="/players/:year" element={<Playing11 />} />
                    <Route path="/stats/:year" element={<Stats />} />
                    <Route path="/archive" element={<Archive />} />
                    <Route path="/venues" element={<VenuesPage/>} />
                    <Route path="/standings/:year" element={<StandingsPage/>} />
                    {/* Add more routes for other components/pages */}
                </Routes>

    );
};

export default App;
