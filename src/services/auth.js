import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; // Replace with your backend URL

const register = async (username, email, password, dateOfBirth) => {
    try {
        const userData = {
            username,
            email,
            password,
            date_of_birth: '1995-06-07',
            first_name: 'John',
            last_name: 'Doe',
        };

        const response = await axios.post(`${API_URL}/users/users/`, userData);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            // Set the default Authorization header for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const login = async (email_address, password) => {
    try {
        console.log("THE API URL IS:", API_URL);
        const response = await axios.post(`${API_URL}/users/login/?email_address=${encodeURIComponent(email_address)}&password=${encodeURIComponent(password)}`);
        
        if (response.data.jwt_token) {
            // Store the token without JSON.stringify
            localStorage.setItem('user', response.data.jwt_token);
            // Set the default Authorization header for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.jwt_token}`;
        }
        return;
    } catch (error) {
        throw error.response.data;
    }
};

const logout = () => {
    localStorage.removeItem('user');
    // Remove the Authorization header
    delete axios.defaults.headers.common['Authorization'];
};

const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

const getCurrentUser = () => {
    const token = localStorage.getItem('user');
    if (!token) return null;
    
    try {
        // Remove quotes if they exist (tokens shouldn't be stored with quotes)
        const cleanToken = token.replace(/^"(.*)"$/, '$1');
        return decodeJWT(cleanToken);
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser
};

export default authService;
