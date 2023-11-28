
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/Home.css'; // Import your CSS file
    // return (
    //     <div className="home-container">
    //         <h1>Welcome to User Registration App</h1>
    //         <div className="button-container">
    //             <Link to="/register" className="button">Register</Link>
    //             <Link to="/login" className="button">Login</Link>
    //         </div>
    //     </div>
    // );


    const Homepage = () => {
        const imagesLeft = [
            "slideLeft/img8.jpg",
            "slideLeft/img1.jpg",
            "slideLeft/img2.jpg",
            "slideLeft/img3.jpg",
            "slideLeft/img4.webp",
            "slideLeft/img5.webp",
            "slideLeft/img6.webp",
            // "slideLeft/img7.jpeg",
            "slideLeft/main.jpeg",
        ];

        const imagesRight = [
            'slideRight/btt1.png',
            'slideRight/btt2.png',
            'slideRight/btt3.png',
            'slideRight/btt4.png',
            'slideRight/btt5.png',
            'slideRight/btt6.png',
            'slideRight/btt7.png',
            'slideRight/btt8.png',
        ];

        const [currentImageLeft, setCurrentImageLeft] = useState(0);
        const [currentImageRight, setCurrentImageRight] = useState(0);

        const nextImageLeft = () => {
            setCurrentImageLeft((prevImage) => (prevImage + 1) % imagesLeft.length);
        };

        const prevImageLeft = () => {
            setCurrentImageLeft((prevImage) => (prevImage - 1 + imagesLeft.length) % imagesLeft.length);
        };

        const nextImageRight = () => {
            setCurrentImageRight((prevImage) => (prevImage + 1) % imagesRight.length);
        };

        const prevImageRight = () => {
            setCurrentImageRight((prevImage) => (prevImage - 1 + imagesRight.length) % imagesRight.length);
        };

        useEffect(() => {
            const timerLeft = setTimeout(() => {
                nextImageLeft();
            }, 1500);

            const timerRight = setTimeout(() => {
                nextImageRight();
            }, 1500);

            return () => {
                clearTimeout(timerLeft);
                clearTimeout(timerRight);
            };
        }, [currentImageLeft, currentImageRight]);

        return (

            <div style={{background: '#4a2780', height: '100vh'}}>
                <Navbar/>
                <div className='home'>
                    <div className="slideshow-container-left">
                        <div className='dark-layer'></div>
                        <div className="arrow left-arrow" onClick={prevImageLeft}>&#8249;</div>
                        <img className="slideshow-image" src={imagesLeft[currentImageLeft]} alt={`Slide ${currentImageLeft + 1}`} />
                        <div className="arrow right-arrow" onClick={nextImageLeft}>&#8250;</div>
                    </div>
                    <div className="slideshow-container-right">
                        <img className="slideshow-image" src={imagesRight[currentImageRight]} alt={`Slide ${currentImageRight + 1}`} />
                    </div>
                </div>
                <Footer/>
            </div>
        );
    };

    export default Homepage;
