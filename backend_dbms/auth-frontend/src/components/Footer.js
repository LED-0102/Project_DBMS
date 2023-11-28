import React from 'react';
import { FaGithub } from "react-icons/fa";

const footerStyle = {
    background: '#2E0273',
    color: '#fff',
    textAlign: 'center',
    padding: '0.7rem',
    position: 'fixed',
    left: '0',
    bottom: '0',
    width: '100%',
    fontSize: '15px',
};

const githubLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: '#fff',
};

const githubIconStyle = {
    width: '15px', // Adjust the size as needed
    height: '20px', // Adjust the size as needed
    marginRight: '8px', // Add spacing between the icon and text
};

const Footer = () => {
    return (
        <footer style={footerStyle}>
            &copy; 2023 Cricket World Cup
            <a
                href="https://github.com/your-github-repo"
                style={githubLinkStyle}
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaGithub style={githubIconStyle} /> GitHub Repo
            </a>
        </footer>
    );
};

export default Footer;