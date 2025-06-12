import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, CircularProgress, Paper } from '@mui/material';
import { CloudUpload, FolderOpen } from '@mui/icons-material';
import { useGoogleDrive } from '../services/googleDrive';

const GoogleDriveTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [files, setFiles] = useState<Array<{id: string, name: string}>>([]);
  const [status, setStatus] = useState<string>('Checking connection...');
  const { login, uploadFile, listFiles, isConnected, getAccessToken } = useGoogleDrive();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = isConnected();
        
        if (connected) {
          await loadFiles();
          setStatus('Connected to Google Drive');
        } else {
          setStatus('Not connected to Google Drive');
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const loadFiles = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const fileList = await listFiles(accessToken);
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
      setStatus(`Error loading files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setStatus('Uploading file...');
      
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      await uploadFile(file, accessToken);
      await loadFiles();
      
      setStatus('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setStatus('Connecting to Google Drive...');
      await login();
      await loadFiles();
      setStatus('Connected to Google Drive');
    } catch (error) {
      console.error('Error during login:', error);
      setStatus(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={3}>
        <CircularProgress />
        <Typography variant="body1" mt={2}>{status}</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        Google Drive Connection Test
      </Typography>
      
      <Box mb={3}>
        <Typography color={isConnected() ? 'success.main' : 'error.main'}>
          Status: {status}
        </Typography>
      </Box>

      {isConnected() ? (
        <>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Files in Google Drive:</Typography>
            {files.length === 0 ? (
              <Typography>No files found in your Google Drive app folder.</Typography>
            ) : (
              <ul>
                {files.map((file) => (
                  <li key={file.id}>
                    {file.name} (ID: {file.id})
                  </li>
                ))}
              </ul>
            )}
          </Box>

          <Box>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                color="primary"
                component="span"
                startIcon={<CloudUpload />}
                disabled={isLoading}
                sx={{ mr: 2 }}
              >
                Upload Test File
              </Button>
            </label>
            
            <Button
              variant="outlined"
              onClick={loadFiles}
              startIcon={<FolderOpen />}
              disabled={isLoading}
            >
              Refresh File List
            </Button>
          </Box>
        </>
      ) : (
        <Box>
          <Typography mb={2}>
            Please sign in with Google to test the Drive connection.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={isLoading}
          >
            Connect to Google Drive
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default GoogleDriveTest;
