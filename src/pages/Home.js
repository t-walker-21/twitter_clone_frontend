import React, { useState, useEffect, useRef } from 'react';
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
import TweetCardSkeleton from '../components/TweetCardSkeleton';

function Home() {
    const [tweets, setTweets] = useState([]);
    const [newTweet, setNewTweet] = useState('');
    const [error, setError] = useState('');
    const [cursorPosition, setCursorPosition] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const isLoadingRef = useRef(false);
    const fileInputRef = useRef(null);
    const cursorRef = useRef(cursorPosition); // Ref to store the latest cursor position
    const navigate = useNavigate();

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        loadTweets();
        window.addEventListener('scroll', () => {
            //debounce(handleScroll, 300);
            handleScroll();
        });
    }, []);

    const loadTweets = async () => {
        console.log(isLoadingRef.current, 'isLoadingRef');
        if (isLoadingRef.current) return; // Prevent multiple simultaneous calls
        isLoadingRef.current = true;

        console.log('Loading tweets with cursor:', cursorRef.current);

        try {
            const data = await tweetService.getTweets(cursorRef.current); // Use the ref for the latest cursor

            console.log('Fetched tweets:', data);
            setTweets((prevTweets) => [...prevTweets, ...data]);

            // Update cursor position for pagination
            if (data.length > 0) {
                const lastTweet = data[data.length - 1];
                const latestTweetIsoString = new Date(lastTweet.created_at['$date']).toISOString();
                cursorRef.current = latestTweetIsoString;
                console.log('New cursor position:', latestTweetIsoString);
            }
        } catch (error) {
            setError('Failed to load tweets');
            console.log('Error loading tweets:', error);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
            console.log(isLoadingRef.current, 'isLoadingRef');
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

    const debounce = (func, delay) => {
      let timeoutId;
      
      return function (...args) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          func(...args);
        }, delay);
      };
    }

    const handleScroll = () => {

        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Check if the user has scrolled to the bottom
        if (scrollTop + windowHeight >= documentHeight - 100) {
            console.log('Reached the bottom of the page');
            setLoading(true);
            loadTweets(); // Trigger loading more tweets
        }
    };

    const handleNewTweet = async (e) => {
        e.preventDefault();
        if (!newTweet.trim() && !selectedImage) return;

        try {
            // Get a presigned URL for the image if selected
            if (selectedImage) {
                const url_response = await userService.get_presigned_url(selectedImage.name);
                const presignedUrl = url_response.presigned_url.replace("minio:9000", "34.172.224.168:80");
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
                    // <Box
                    //     sx={{
                    //         display: 'flex',
                    //         flexDirection: 'column',
                    //         alignItems: 'center',
                    //         mt: 4,
                    //     }}
                    // >
                    //     <FeedIcon
                    //         sx={{
                    //             fontSize: 60,
                    //             color: 'text.secondary',
                    //             mb: 2,
                    //         }}
                    //     />
                    //     <Typography variant="h6" color="text.secondary">
                    //         No tweets yet
                    //     </Typography>
                    //     <Typography color="text.secondary">
                    //         Be the first one to tweet!
                    //     </Typography>
                    // </Box>
                    <></>
                ) : (
                    tweets.map((tweet) => (
                        <TweetCard key={tweet.id} tweet={tweet} />
                    ))
                )}
            {loading && (
                <Box>
                    <TweetCardSkeleton />
                    <TweetCardSkeleton />
                    <TweetCardSkeleton />
                    <TweetCardSkeleton />
                </Box>
            )}
            </Container>
        </Box>
    );
}

export default Home;
