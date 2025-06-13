import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw } from 'lucide-react';
import { useGoogleDrive, GoogleDriveFile } from '@/services/googleDrive';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export function GoogleDriveConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);

  const { login, isConnected: checkConnection, getAccessToken, disconnect: googleDisconnect, listFiles } = useGoogleDrive();

  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const connected = checkConnection();
        if (connected) {
          setIsConnected(true);
          await loadFiles();
        }
      } catch (err) {
        console.error('Error checking connection:', err);
        setError('Failed to check Google Drive connection');
      }
    };

    checkConnectionStatus();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }
      const fileList = await listFiles(token);
      setFiles(fileList);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await login();
      setIsConnected(true);
      await loadFiles();
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    try {
      googleDisconnect();
      setIsConnected(false);
      setFiles([]);
    } catch (err) {
      console.error('Disconnection error:', err);
      setError('Failed to disconnect from Google Drive');
    }
  };

  const handleRefresh = () => {
    loadFiles();
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <h2 className="text-xl font-semibold">Connect to Google Drive</h2>
        <Button
          onClick={handleLogin}
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

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {files.length === 0 ? (
            <p className="text-center text-gray-500">No files found</p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(file.modifiedTime).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Open
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}