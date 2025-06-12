import React from 'react';
import { Button, CircularProgress, Typography, Box, Avatar } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import useGoogleAuth from '../hooks/useGoogleAuth';

const GoogleAuthButton: React.FC = () => {
  const { 
    isInitialized, 
    isAuthenticated, 
    user, 
    loading, 
    error, 
    signIn, 
    signOut 
  } = useGoogleAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
      // You can add additional logic after successful sign-in here
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // You can add additional logic after sign-out here
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!isInitialized || loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box color="error.main" p={2}>
        <Typography variant="body2">
          Error: {error.message}
        </Typography>
      </Box>
    );
  }

  if (isAuthenticated && user) {
    const profile = user.getBasicProfile();
    return (
      <Box display="flex" alignItems="center" p={1}>
        <Avatar 
          src={profile.getImageUrl()} 
          alt={profile.getName()} 
          sx={{ width: 32, height: 32, mr: 1 }}
        />
        <Box flexGrow={1}>
          <Typography variant="subtitle2" noWrap>
            {profile.getName()}
          </Typography>
          <Typography variant="caption" color="textSecondary" noWrap>
            {profile.getEmail()}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleSignOut}
          sx={{ ml: 1 }}
        >
          Sign Out
        </Button>
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<GoogleIcon />}
      onClick={handleSignIn}
      fullWidth
      sx={{
        backgroundColor: '#4285F4',
        '&:hover': {
          backgroundColor: '#357ABD',
        },
      }}
    >
      Sign in with Google
    </Button>
  );
};

export default GoogleAuthButton;
