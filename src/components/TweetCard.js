import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Link, 
    Box, 
    Avatar, 
    CardActionArea,
    IconButton,
    Tooltip,
    CardMedia // Add this import
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom';
import tweetService from '../services/tweets';
import authService from '../services/auth';
import userService from '../services/users';

const API_URL = process.env.REACT_APP_API_URL;

function TweetCard({ tweet }) {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(tweet.likes?.length || 0);
    const [profilePicUrl, setProfilePicUrl] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUserId = currentUser?.sub;
                setIsLiked(tweet.likes?.includes(currentUserId) || false);

                // Fetch user profile picture
                const userInfo = await userService.getUserProfile(tweet.user_id);
                if (userInfo?.profile_picture_url) {
                    const pictureUrl = userService.getUserProfilePictureUrl(userInfo.profile_picture_url);
                    setProfilePicUrl(pictureUrl);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();
    }, [tweet.user_id, currentUser?.sub, tweet.likes]);

    const handleLikeClick = async (e) => {
        e.stopPropagation(); // Prevent card click event
        try {
            const tweet_id = tweet._id['$oid'];
            if (isLiked) {
                await tweetService.unlikeTweet(tweet_id);
                setLikesCount(prev => prev - 1);
                setIsLiked(false);
            } 
            
            else {
                await tweetService.likeTweet(tweet_id);
                setLikesCount(prev => prev + 1);
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Failed to update like:', error);
        }
    };

    return (
        <Card sx={{ mb: 2, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
            <CardActionArea>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar
                            sx={{ 
                                width: 48, 
                                height: 48,
                                bgcolor: 'primary.main'
                            }}
                            src={profilePicUrl}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/users/${tweet.user_id}`);
                            }}
                        >
                            <PersonIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link
                                    component="button"
                                    variant="subtitle2"
                                    color="text.secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/users/${tweet.user_id}`);
                                    }}
                                    sx={{ textDecoration: 'none' }}
                                >
                                    @{tweet.username}
                                </Link>
                                <Tooltip title={isLiked ? "Unlike" : "Like"}>
                                    <IconButton
                                        onClick={handleLikeClick}
                                        size="small"
                                        color="primary"
                                    >
                                        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                                            {likesCount}
                                        </Typography>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Typography variant="body1">
                                {tweet.tweet_content.split(/(\s+)/).map((word, index) => 
                                    word.startsWith('#') ? (
                                        <Typography key={index} component="span" sx={{ fontWeight: 'bold' }}>
                                            {word}
                                        </Typography>
                                    ) : word
                                )}
                            </Typography>
                            
                            {/* Add image display */}
                            {tweet.media_url && (
                                <Box sx={{ mt: 2, mb: 1 }}>
                                    <CardMedia
                                        component="img"
                                        image={API_URL + "/user-images/" + tweet.media_url}
                                        alt="Tweet image"
                                        sx={{
                                            borderRadius: 2,
                                            maxHeight: 400,
                                            width: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </Box>
                            )}

                            <Typography variant="caption" color="text.secondary">
                                {new Date(tweet.created_at['$date']).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default TweetCard;
