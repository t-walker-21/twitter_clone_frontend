import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL; // Replace with your local development URL

const API_URL = `${baseURL}/users`; // Adjust the endpoint as needed
const BLOB_API_URL = `${baseURL}/user-images`; // Adjust the endpoint as needed

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_URL
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use((config) => {
    const user = localStorage.getItem('user');
    const auth_header = `Bearer ${user}`;
    
    if (user) {
        config.headers.Authorization = auth_header;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

const getUserProfile = async (user_id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/users/${user_id}`);
        return response.data.user;
    } catch (error) {
        throw error.response.data;
    }
};

const getFollowers = async (user_id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/followers/${user_id}`);
        return response.data.users;
    } catch (error) {
        throw error.response.data;
    }
};
const getFollowing = async (user_id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/following/${user_id}`);
        return response.data.users;
    } catch (error) {
        throw error.response.data;
    }
};

const followUser = async (user_id) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/follows/${user_id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const unfollowUser = async (user_id) => {
    try {
        const response = await axiosInstance.delete(`${API_URL}/follow/${user_id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const setProfilePictureURL = async (filename) => {
    try {
        
        const response = await axiosInstance.post(`${API_URL}/profile_picture/`+filename);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getUserProfilePictureUrl = (filename) => {
    return `${BLOB_API_URL}/${filename}`;
}

const get_presigned_url = async (filename) => {
 
    try {
        const response = await axiosInstance.get(`${API_URL}/get_presigned_url/${filename}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const userService = {
    getUserProfile,
    getFollowers,
    getFollowing,
    followUser,
    unfollowUser,
    setProfilePictureURL,
    getUserProfilePictureUrl,
    get_presigned_url
};

export default userService;
