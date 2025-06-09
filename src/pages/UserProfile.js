import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    AppBar,
    Toolbar,
    Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../services/users';
import tweetService from '../services/tweets';
import TweetCard from '../components/TweetCard';
import UserProfileCard from '../components/UserProfileCard';
import authService from '../services/auth';

function UserProfile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const { user_id } = useParams();
    const navigate = useNavigate();

    const loadUserProfile = useCallback(async () => {
        try {
            let data = await userService.getUserProfile(user_id);
            const user_followers = await userService.getFollowers(user_id);
            const user_following = await userService.getFollowing(user_id);

            const user_tweet_data = await tweetService.getTweetsOfUser(user_id);
            data.tweets = user_tweet_data;
            data.followers = user_followers;
            data.following = user_following;

            // flatten the followers and following arrays to set of ids
            data.followers = user_followers.map((follower) => follower.follower_id);
            data.following = user_following.map((following) => following.following_id);
            
            setUser(data);
        } catch (error) {
            setError('Failed to load user profile');
        }
    }, [user_id]);

    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (!user) {
        return (
            <Container>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    return (
        <Box>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Twitter Clone
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/')}>
                        Home
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="sm" sx={{ mt: 10, pt: 3 }}>
                <UserProfileCard user={user} />

                <Divider sx={{ mb: 3 }}>
                    <Typography variant="h6">Tweets</Typography>
                </Divider>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {user.tweets?.map((tweet) => (
                    <TweetCard key={tweet.id} tweet={tweet} />
                ))}
            </Container>
        </Box>
    );
}

export default UserProfile;
