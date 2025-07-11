import React from 'react';
import { Card, CardContent, Box, Skeleton, Avatar } from '@mui/material';

function TweetCardSkeleton() {
    return (
        <Card sx={{ mb: 2, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Skeleton variant="circular" width={48} height={48}>
                        <Avatar sx={{ width: 48, height: 48 }} />
                    </Skeleton>
                    <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Skeleton variant="text" width={100} height={28} />
                        </Box>
                        <Skeleton variant="text" width="90%" height={32} sx={{ mt: 1 }} />
                        <Skeleton variant="text" width="60%" height={32} sx={{ mt: 0.5 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="text" width={32} height={24} sx={{ mr: 2 }} />
                            <Skeleton variant="circular" width={32} height={32} sx={{ ml: 2 }} />
                            <Skeleton variant="text" width={32} height={24} sx={{ ml: 1 }} />
                        </Box>
                        <Skeleton variant="text" width={120} height={18} sx={{ mt: 1 }} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default TweetCardSkeleton;