import React, { useState, useEffect } from 'react';
import { Cloud, Shield, File, Folder, RefreshCw } from 'lucide-react';
import { useGoogleDrive, GoogleDriveFile } from '@/services/googleDrive';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export function GoogleDriveConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();

  const { login: googleLogin, isConnected: checkConnection, getAccessToken, disconnect: googleDisconnect, setToken, listFiles } = useGoogleDrive();

  useEffect(() => {
    // Check if we have a stored token
    const storedToken = localStorage.getItem('googleDriveToken');
    if (storedToken) {
      setToken(storedToken);
      setIsConnected(true);
      loadFiles();
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Store the token
        localStorage.setItem('googleDriveToken', response.access_token);
        setToken(response.access_token);
        setIsConnected(true);
        
        // Load initial files
        await loadFiles();
      } catch (err) {
        setError('Failed to connect to Google Drive');
        console.error('Google Drive connection error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Failed to connect to Google Drive');
      setIsLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
  });

  const loadFiles = async (pageToken?: string) => {
    try {
      setIsLoading(true);
      setError(null);
  
      const result = await listFiles(10, pageToken);
      if (!result.files || result.files.length === 0) {
        throw new Error('No files found');
      }
      setFiles(pageToken ? [...files, ...result.files] : result.files);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      setError('Failed to load files. Please try reconnecting.');
      console.error('Error loading files:', err);
      // Attempt reconnection
      if (!isConnected) {
        try {
          const storedToken = localStorage.getItem('googleDriveToken');
          if (storedToken) {
            setToken(storedToken);
            setIsConnected(true);
            await loadFiles();
          }
        } catch (reconnectError) {
          console.error('Reconnection failed:', reconnectError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    try {
      googleDisconnect();
      setIsConnected(false);
      setFiles([]);
      setNextPageToken(undefined);
    } catch (err) {
      console.error('Disconnection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect from Google Drive');
    }
  };

  const handleRefresh = () => {
    loadFiles();
  };

  const handleLoadMore = () => {
    if (nextPageToken) {
      loadFiles(nextPageToken);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <h2 className="text-xl font-semibold">Connect to Google Drive</h2>
        <Button
          onClick={() => login()}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          Connect with Google Drive
        </Button>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Google Drive Files</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="grid gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground"
          >
            {file.mimeType === 'application/vnd.google-apps.folder' ? (
              <Folder className="h-5 w-5 text-blue-500" />
            ) : (
              <File className="h-5 w-5 text-gray-500" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(file.modifiedTime).toLocaleDateString()}
              </p>
            </div>
            <a
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              Open
            </a>
          </div>
        ))}
      </div>

      {nextPageToken && (
        <Button
          variant="outline"
          onClick={handleLoadMore}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Load More'
          )}
        </Button>
      )}

      {files.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground">
          No files found in your Google Drive
        </p>
      )}
    </div>
  );
}