import axios from 'axios';

const BASE_URL = 'http://localhost:8080/auth';

const register = async (username, password) => {
    try {
        return await axios.post(`${BASE_URL}/register`, {
            username,
            password,
        });
    } catch (error) {
        throw error.response;
    }
};

const login = async (username, password) => {
        try {
            // Assuming your backend returns the token directly in response.data
            // const token = response.data;
            //
            // if (token) {
            //     // Login successful, return the token
            //     return token;
            // } else {
            //     // Handle invalid response from the backend
            //     throw new Error('Invalid response from the server');
            // }
            return await axios.post(`${BASE_URL}/login`, {
                username,
                password,
            });
        } catch (error) {

            return error.response;
        }
};

export default {
    register,
    login,
};
