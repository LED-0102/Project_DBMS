import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check if there is a token in local storage
        const tokenString = localStorage.getItem('token');

        if (!tokenString) {
            // If no token, redirect to the login page
            navigate('/login');
            return;
        }

        try {
            // Parse the token from a string to a JSON object
            const token = JSON.parse(tokenString);

            // Send a POST request with the token in the header
            axios.post('http://localhost:8080/welcome', {}, {
                headers: {
                    'token': `${token.token}`
                }
            })
                .then(response => {
                    // Set the response content to be displayed
                    setContent(response.data);
                })
                .catch(error => {
                    console.error(error);
                    // Handle error, maybe redirect to login page
                    navigate('/login');
                });
        } catch (error) {
            console.error(error);
            // Handle error, maybe redirect to login page
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div>
            <h2>Welcome</h2>
            <p>{content}</p>
            <h2>Courses at IIT Indore BTech CSE</h2>
            <table id="courses" className="courselist"><tbody><tr><th>Course Code</th><th>Course Name</th><th>L-P-T</th><th>Credit</th></tr> <tr><td>CS 103</td><td>Computer Programming</td><td>2-0-0</td><td>2</td></tr><tr><td>CS 153</td><td>Computer Programming Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 201</td><td>Discrete Mathematical Structures</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 202</td><td>Automata Theory and Logic</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 203</td><td>Data Structure and Algorithms</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 253</td><td>Data Structure and Algorithms Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 204</td><td>Design and Analysis  of Algorithms</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 254</td><td>Design and Analysis  of Algorithms Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 206</td><td>Login Design </td><td>2-1-0</td><td>3</td></tr><tr><td>CS 206</td><td>Login Design Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 207</td><td>Database and Information System</td><td>3-0-0</td><td>3</td></tr><tr><td>CS 357</td><td>Database and Information System Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 208</td><td>Software Engineering</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 258</td><td>Software Engineering Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 302</td><td>Computer Graphics and Visualization</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 352</td><td>Computer Graphics and Visualization Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 304N</td><td>Computer Intelligence</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 354N</td><td>Computer Intelligence Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 306</td><td>Computer Networks</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 356</td><td>Computer Networks Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 309</td><td>Parallel Computing</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 359</td><td>Parallel Computing Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 303</td><td>Operating Systems</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 353</td><td>Operating Systems Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 305</td><td>Computer Architecture</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 355</td><td>Computer Architecture Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 307</td><td>Optimization Algorithms and Techniques</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 357</td><td>Optimization Algorithms and Techniques</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 308</td><td>Compiler Techniques</td><td>2-1-0</td><td>3</td></tr><tr><td>CS 358</td><td>Compiler Techniques Lab</td><td>0-0-3</td><td>1.5</td></tr><tr><td>CS 493</td><td>B Tech Project (BTP)</td><td>0-0-40</td><td>20</td></tr></tbody></table>
        </div>
    );
};

export default Welcome;
