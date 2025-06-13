import React, { useState, useEffect } from 'react';
import { Cloud, Shield } from 'lucide-react';
import { useGoogleDrive } from '@/services/googleDrive';

interface GoogleDriveConnectProps {
  onConnect?: (accessToken: string) => void;
  onDisconnect?: () => void;
}

const GoogleDriveConnect: React.FC<GoogleDriveConnectProps> = ({ onConnect, onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isConnected: checkConnection, getAccessToken, disconnect: googleDisconnect } = useGoogleDrive();

  useEffect(() => {
    const checkConnectionStatus = () => {
      const connected = checkConnection();
      setIsConnected(connected);
      if (connected) {
        const token = getAccessToken();
        if (token) {
          onConnect?.(token);
        }
      }
    };

    checkConnectionStatus();
  }, [checkConnection, getAccessToken, onConnect]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear any existing error state
      localStorage.removeItem('googleDriveToken');
      
      await login();
      const accessToken = getAccessToken();
      console.log('Login successful, access token received');
      
      if (!accessToken) {
        throw new Error('Failed to get access token after login');
      }
      
      setIsConnected(true);
      onConnect?.(accessToken);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Google Drive');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    try {
      googleDisconnect();
      setIsConnected(false);
      onDisconnect?.();
    } catch (err) {
      console.error('Disconnection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect from Google Drive');
    }
  };

  if (isConnected) {
    return (
      <div className="text-center py-6">
        <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
          <Shield className="w-5 h-5" />
          <span>Connected to Google Drive</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-lg">
      <Shield size={64} className="mx-auto text-muted-foreground mb-4" />
      <h3 className="text-2xl font-semibold text-foreground mb-2">Connect Your Storage</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Link your Google Drive account to securely upload, store, and manage your files.
      </p>
      
      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Cloud size={20} />
        <span>{isLoading ? 'Connecting...' : 'Connect Google Drive'}</span>
      </button>
    </div>
  );
};

export default GoogleDriveConnect; 