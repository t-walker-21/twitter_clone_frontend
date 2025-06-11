import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    Badge,
} from '@mui/material';
import FeedIcon from '@mui/icons-material/Feed';
import SettingsIcon from '@mui/icons-material/Settings';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useNavigate, Link } from 'react-router-dom';
import tweetService from '../services/tweets';
import authService from '../services/auth';
import userService from '../services/users';
import TweetCard from '../components/TweetCard';

const API_URL = process.env.REACT_APP_API_URL;

function Home() {
    const [tweets, setTweets] = useState([]);
    const [newTweet, setNewTweet] = useState('');
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = React.useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }
        loadTweets();
        
        //setInterval(() => {
            //loadTweets();
       // }, 5000); // Refresh tweets every 5 seconds
        
    }, [navigate]);

    const loadTweets = async () => {
        try {
            const data = await tweetService.getTweets();

            console.log('Fetched tweets:', data);
            setTweets(data);
        } catch (error) {
            setError('Failed to load tweets');
            console.log('Error loading tweets:', error);
        }
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleNewTweet = async (e) => {
        e.preventDefault();
        if (!newTweet.trim() && !selectedImage) return;

        try {
            // Get a presigned URL for the image if selected
            if (selectedImage) {
                const url_response = await userService.get_presigned_url(selectedImage.name);
                const presignedUrl = url_response.presigned_url.replace("minio:9000", API_URL.slice(7) + ":80");
                const blob_name = url_response.blob_name;

                console.log('Presigned URL:', presignedUrl);
                console.log('Blob Name:', blob_name);

                await fetch(presignedUrl, {
                    method: 'PUT',
                    body: fileInputRef.current.files[0],
                    headers: {
                        'Content-Type': fileInputRef.current.files[0].type
                    }
                });

                await tweetService.createTweet(newTweet, blob_name);
                
            }

            else {
                await tweetService.createTweet(newTweet, null);
            }
            
            
            setNewTweet('');
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            loadTweets();
        } catch (error) {
            console.error('Error creating tweet:', error);
            setError('Failed to create tweet');
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <Box>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
            <Container maxWidth="sm" sx={{ mt: 10, pt: 3 }}>
                <Box component="form" onSubmit={handleNewTweet} sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="What's happening?"
                        value={newTweet}
                        onChange={(e) => setNewTweet(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <IconButton 
                            color="primary" 
                            onClick={() => fileInputRef.current.click()}
                        >
                            <Badge 
                                color="secondary" 
                                variant="dot" 
                                invisible={!selectedImage}
                            >
                                <CameraAltIcon />
                            </Badge>
                        </IconButton>
                        
                        {selectedImage && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedImage.name}
                                </Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={handleRemoveImage}
                                    sx={{ color: 'error.main' }}
                                >
                                    ×
                                </IconButton>
                            </Box>
                        )}
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={!newTweet.trim() && !selectedImage}
                    >
                        Tweet
                    </Button>
                </Box>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {tweets.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mt: 4,
                        }}
                    >
                        <FeedIcon
                            sx={{
                                fontSize: 60,
                                color: 'text.secondary',
                                mb: 2,
                            }}
                        />
                        <Typography variant="h6" color="text.secondary">
                            No tweets yet
                        </Typography>
                        <Typography color="text.secondary">
                            Be the first one to tweet!
                        </Typography>
                    </Box>
                ) : (
                    tweets.map((tweet) => (
                        <TweetCard key={tweet.id} tweet={tweet} />
                    ))
                )}
            </Container>
        </Box>
    );
}

export default Home;
