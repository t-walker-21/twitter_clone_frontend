import React, { useState, useEffect } from 'react';
import {
    Typography,
    Avatar,
    Paper,
    Grid,
    Box,
    Button,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import authService from '../services/auth';
import userService from '../services/users';

function UserProfileCard({ user }) {
    const [isFollowing, setIsFollowing] = useState(false);
    const currentUser = authService.getCurrentUser();
    const [profilePicUrl, setProfilePicUrl] = useState('');
    
    useEffect(() => {
        if (user.followers) {
            // Check if the current user is in the followers list of the user
            const currentUserId = parseInt(currentUser?.sub, 10);
            setIsFollowing(user.followers.includes(currentUserId));
        }

        // Set profile picture URL if available
        if (user.profile_picture_url) {
            const pictureUrl = userService.getUserProfilePictureUrl(user.profile_picture_url);
            setProfilePicUrl(pictureUrl);
        }
    }, [user.followers, user.profile_picture_url, currentUser]);

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await userService.unfollowUser(user.id);
            } else {
                await userService.followUser(user.id);
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('Failed to update follow status:', error);
        }
    };

    // Check if this is the current user's profile
    const isOwnProfile = currentUser?.sub == user.id;

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    <Avatar
                        sx={{ 
                            width: 80, 
                            height: 80,
                            bgcolor: 'primary.main'
                        }}
                        src={profilePicUrl}
                        alt={user.username}
                    >
                        <PersonIcon sx={{ width: 40, height: 40 }} />
                    </Avatar>
                </Grid>
                <Grid item xs>
                    <Typography variant="h5">@{user.username}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Typography variant="body2">
                            <strong>{user.following.length}</strong> Following
                        </Typography>
                        <Typography variant="body2">
                            <strong>{user.followers.length}</strong> Followers
                        </Typography>
                    </Box>

                    {!isOwnProfile && (
                        <Button
                            variant={isFollowing ? "outlined" : "contained"}
                            color="primary"
                            startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                            onClick={handleFollowToggle}
                            sx={{ mt: 2 }}
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
}

export default UserProfileCard;
