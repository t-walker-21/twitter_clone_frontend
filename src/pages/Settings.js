import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    AppBar,
    Toolbar,
    Button,
    Box,
    Paper,
    TextField,
    Grid,
    Avatar,
    CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth';
import userService from '../services/users';

const user = localStorage.getItem('user');
const auth_header = `Bearer ${user}`;

const API_URL = process.env.REACT_APP_API_URL;

const Settings = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        birthday: '',
        profilePicUrl: ''
    });
    
    // Add new state for file upload
    const [isUploading, setIsUploading] = useState(false);

    // Add ref for file input
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // Get user info from localStorage or your auth service
                const user = authService.getCurrentUser();
                const userId = user ? parseInt(user.sub) : null;
                
                if (userId) {
                    const user_info = await userService.getUserProfile(userId);
                    console.log('Current user:', user_info);
                    
                    if (user_info) {

                        if (user_info.profile_picture_url) {
                            user_info.profile_picture_url = userService.getUserProfilePictureUrl(user_info.profile_picture_url);
                        }

                        setUserInfo({
                            username: user_info.username || '',
                            email: user_info.email || '',
                            firstName: user_info.first_name || '',
                            lastName: user_info.last_name || '',
                            birthday: user_info.date_of_birth || '',
                            profilePicUrl: user_info.profile_picture_url || ''
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // First, get the presigned URL
            const response = await fetch(process.env.REACT_APP_API_URL + '/users/get_presigned_url/' + file.name, {
                method: 'GET',
                headers: {
                    'Authorization': auth_header
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetching presigned URL for file:', data);

                const presigned_url = data.presigned_url.replace("minio:9000", API_URL.slice(7) + ":80");
                console.log('Presigned URL:', presigned_url);

                // Then, upload the file to S3 using the presigned URL
                await fetch(presigned_url, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type
                    }
                });

                
                    setUserInfo(prev => ({
                        ...prev,
                        profilePicUrl: userService.getUserProfilePictureUrl(data.blob_name)
                    }));

                    console.log('File uploaded successfully:', data.blob_name);
                    
                    const prof_pic_update = await userService.setProfilePictureURL(data.blob_name);

                    console.log('Profile picture updated:', prof_pic_update);

                
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box>
            <AppBar position="fixed">
                <Toolbar>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/"
                        sx={{ 
                            flexGrow: 1, 
                            justifyContent: 'flex-start',
                            textTransform: 'none',
                            fontSize: '1.25rem'
                        }}
                    >
                        Twitter Clone
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="sm" sx={{ mt: 10, pt: 3 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <Avatar
                            sx={{ 
                                width: 100, 
                                height: 100,
                                mb: 2,
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8
                                }
                            }}
                            src={userInfo.profilePicUrl}
                            onClick={handleAvatarClick}
                        >
                            {isUploading ? (
                                <CircularProgress size={30} />
                            ) : (
                                <PersonIcon sx={{ fontSize: 60 }} />
                            )}
                        </Avatar>
                        <Typography variant="h4" gutterBottom>
                            User Settings
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={userInfo.username}
                            disabled
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            value={userInfo.email}
                            disabled
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="First Name"
                            value={userInfo.firstName}
                            disabled
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={userInfo.lastName}
                            disabled
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Birthday"
                            value={userInfo.birthday}
                            disabled
                            variant="outlined"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Settings;
