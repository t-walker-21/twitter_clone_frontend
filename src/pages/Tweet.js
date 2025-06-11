import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Avatar, 
    IconButton, 
    TextField, 
    Button, 
    Card, 
    CardContent,
    AppBar,
    Toolbar
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useParams } from 'react-router-dom';
import { useNavigate, Link } from 'react-router-dom';
import tweetService from '../services/tweets';
import authService from '../services/auth';

const API_URL = process.env.REACT_APP_API_URL;

function Tweet() {
    const { id } = useParams(); // Get tweet ID from the URL
    const currentUser = authService.getCurrentUser();
    const [tweet, setTweet] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTweet = async () => {
            try {
                const fetchedTweet = await tweetService.getTweetById(id);
                const comments = await tweetService.getTweetReplies(id);
                console.log('Fetched twesdet:', fetchedTweet);
                console.log('Fetched comments:', comments);
                console.log('Comments lenght:', comments.length);
                setTweet(fetchedTweet);
                setLikesCount(fetchedTweet.likes?.length || 0);
                setComments(comments || []);
                setIsLiked(fetchedTweet.likes?.includes(currentUser.id));
                if (fetchedTweet.user?.profilePic) {
                    setProfilePicUrl(`${API_URL}/uploads/${fetchedTweet.user.profilePic}`);
                }
            } catch (error) {
                console.error('Error fetching tweet:', error);
            }
        };

        fetchTweet();
    }, []);

    const handleLike = async () => {
        try {
            if (isLiked) {
                await tweetService.unlikeTweet(id);
                setLikesCount(likesCount - 1);
            } else {
                await tweetService.likeTweet(id);
                setLikesCount(likesCount + 1);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Error liking/unliking tweet:', error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {

            // Add the new comment to the tweet
            const addedComment = await tweetService.createTweetReply(newComment, id, null);

            // Reload the comments
            const updatedComments = await tweetService.getTweetReplies(id);
            setComments(updatedComments || []);

            setNewComment('');
            }
         catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    if (!tweet) {
        return <Typography>Loading...</Typography>;
    }

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
                    >
                        Twitter Clone
                    </Typography>
                    <IconButton
                        color="inherit"
                        component={Link}
                        to="/settings"
                        sx={{ mr: 2 }}
                    >
                        <SettingsIcon />
                    </IconButton>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Add spacing below the AppBar */}
            <Box sx={{ marginTop: 2, padding: 2 }}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" marginBottom={2}>
                            <Avatar src={profilePicUrl} alt="Profile Picture">
                                {!profilePicUrl && <PersonIcon />}
                            </Avatar>
                            <Box marginLeft={2}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {tweet.username || 'Unknown User'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {new Date(tweet.created_at['$date']).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body1" marginBottom={2}>
                            {tweet.tweet_content}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Box marginTop={4} sx={{ marginX: 2 }}> {/* Add horizontal margin */}
                <Typography variant="h6" marginBottom={2}>
                    Comments
                </Typography>
                {comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <Card key={index} sx={{ marginBottom: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {comment.username || 'Anonymous'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {new Date(comment.created_at['$date']).toLocaleString()}
                                </Typography>
                                <Typography variant="body1" marginTop={1}>
                                    {comment.tweet_content}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography>No comments yet.</Typography>
                )}
            </Box>

            <Box marginTop={4}>
                <Typography variant="h6" marginBottom={2}>
                    Add a Comment
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Write your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 2 }}
                    onClick={handleAddComment}
                >
                    Post Comment
                </Button>
            </Box>
        </Box>
    );
}

export default Tweet;