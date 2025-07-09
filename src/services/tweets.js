import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/tweets'; // Replace with your backend URL

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

const createTweet = async (content, blob_name) => {
    try {
        const tweetData = {
            tweet_content: content,
            likes: [],
            hashtags: extractHashtags(content),
            mentions: extractMentions(content),
            media_url: blob_name ? blob_name : null
        };
        const response = await axiosInstance.post('/tweets/', tweetData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const createTweetReply = async (content, parent_tweet_id, blob_name) => {
    try {
        const tweetData = {
            tweet_content: content,
            tweet_id: parent_tweet_id,
            likes: [],
            hashtags: extractHashtags(content),
            mentions: extractMentions(content),
            media_url: blob_name ? blob_name : null
        };
        const response = await axiosInstance.post('/tweets/' + parent_tweet_id + '/replies', tweetData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const getTweetReplies = async (tweet_id) => {
    try {
        const response = await axiosInstance.get('/tweets/' + tweet_id + '/replies');
        return response.data.tweets;
    } catch (error) {
        throw error.response.data;
    }
};

// Helper function to extract hashtags from tweet content
const extractHashtags = (content) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
};

// Helper function to extract mentions from tweet content
const extractMentions = (content) => {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map(mention => mention.slice(1)) : [];
};

const getTweets = async (cursor) => {
    try {
        // If cursor is provided, append it to the request
        const url = cursor ? `/tweets/?cursor=${cursor}` : '/tweets/';
        const response = await axiosInstance.get(url);
        return response.data.tweets;
    } catch (error) {
        console.error('Error fetching tweets:', error);
        throw error.response.data;
    }
};

const getTweetById = async (tweetId) => {
    try {
        const response = await axiosInstance.get('/tweets/' + tweetId);
        return response.data.tweets;
    } catch (error) {
        console.error('Error fetching tweets:', error);
        throw error.response.data;
    }
};

const getTweetsOfUser = async (user_id) => {
    try {
        const response = await axiosInstance.get('/users/' + user_id);
        return response.data.tweets;
    } catch (error) {
        throw error.response.data;
    }
};

const likeTweet = async (tweetId) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/tweets/${tweetId}/likes`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const unlikeTweet = async (tweetId) => {
    try {
        const response = await axiosInstance.delete(`${API_URL}/tweets/${tweetId}/likes`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const tweetService = {
    createTweet,
    getTweets,
    likeTweet,
    unlikeTweet,
    getTweetsOfUser,
    getTweetById,
    createTweetReply,
    getTweetReplies
};

export default tweetService;
