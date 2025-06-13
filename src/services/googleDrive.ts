import { useGoogleLogin } from '@react-oauth/google';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  isEncrypted?: boolean;
  thumbnailLink?: string;
  iconLink?: string;
  description?: string;
  starred?: boolean;
  trashed?: boolean;
  parents?: string[];
}

export const useGoogleDrive = () => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        if (!tokenResponse.access_token) {
          throw new Error('No access token received from Google');
        }
        console.log('OAuth flow successful:', {
          hasToken: !!tokenResponse.access_token,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('googleDriveToken', tokenResponse.access_token);
        if (tokenResponse.expires_in) {
          const expiry = Date.now() + (tokenResponse.expires_in * 1000);
          localStorage.setItem('googleDriveTokenExpiry', expiry.toString());
        }
        return tokenResponse.access_token;
      } catch (error) {
        console.error('Error during Google Drive login:', error);
        localStorage.removeItem('googleDriveToken');
        localStorage.removeItem('googleDriveTokenExpiry');
        throw error;
      }
    },
    onError: (error) => {
      console.error('Google Drive login failed:', error);
      localStorage.removeItem('googleDriveToken');
      localStorage.removeItem('googleDriveTokenExpiry');
      throw error;
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
    flow: 'implicit',
  });

  const listFiles = async (accessToken: string): Promise<GoogleDriveFile[]> => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,properties,thumbnailLink,iconLink,description,starred,trashed,parents)',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch files');
      }

      const data = await response.json();
      return (data.files || []).map((file: any) => ({
        ...file,
        isEncrypted: file.properties?.isEncrypted === 'true',
      }));
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  };

  const uploadFile = async (file: File, accessToken: string): Promise<GoogleDriveFile> => {
    try {
      const metadata = {
        name: file.name,
        mimeType: file.type,
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload file');
      }

      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        mimeType: data.mimeType,
        webViewLink: data.webViewLink,
        createdTime: data.createdTime || new Date().toISOString(),
        modifiedTime: data.modifiedTime || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const getAccessToken = (): string | null => {
    const token = localStorage.getItem('googleDriveToken');
    if (!token) {
      console.log('No access token found in localStorage');
      return null;
    }
    return token;
  };

  const isConnected = (): boolean => {
    const token = getAccessToken();
    if (!token) {
      console.log('Not connected: No access token found');
      return false;
    }
    return true;
  };

  const disconnect = (): void => {
    console.log('Disconnecting from Google Drive');
    localStorage.removeItem('googleDriveToken');
    localStorage.removeItem('googleDriveTokenExpiry');
  };

  return {
    login,
    uploadFile,
    listFiles,
    getAccessToken,
    isConnected,
    disconnect,
  };
};