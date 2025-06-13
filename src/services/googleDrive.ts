import { useGoogleLogin } from '@react-oauth/google';
import CryptoJS from 'crypto-js';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  isEncrypted?: boolean;
}

export const useGoogleDrive = () => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        if (!tokenResponse.access_token) {
          throw new Error('No access token received from Google');
        }
        console.log('Received token response:', tokenResponse);
        localStorage.setItem('googleDriveToken', tokenResponse.access_token);
        return tokenResponse.access_token;
      } catch (error) {
        console.error('Error during Google Drive login:', error);
        localStorage.removeItem('googleDriveToken'); // Clear invalid token
        throw error;
      }
    },
    onError: (error) => {
      console.error('Google Drive login failed:', error);
      localStorage.removeItem('googleDriveToken'); // Clear invalid token
      throw error;
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
    flow: 'implicit',
  });

  const encryptFile = async (file: File, password: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileData = e.target?.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(fileData);
          const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();
          const encryptedBlob = new Blob([encrypted], { type: 'application/encrypted' });
          resolve(encryptedBlob);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const decryptFile = async (encryptedData: Blob, password: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const encrypted = e.target?.result as string;
          const decrypted = CryptoJS.AES.decrypt(encrypted, password);
          const decryptedArray = new Uint8Array(decrypted.words.length * 4);
          for (let i = 0; i < decrypted.words.length; i++) {
            const word = decrypted.words[i];
            decryptedArray[i * 4] = (word >> 24) & 0xff;
            decryptedArray[i * 4 + 1] = (word >> 16) & 0xff;
            decryptedArray[i * 4 + 2] = (word >> 8) & 0xff;
            decryptedArray[i * 4 + 3] = word & 0xff;
          }
          const decryptedBlob = new Blob([decryptedArray], { type: 'application/octet-stream' });
          resolve(decryptedBlob);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(encryptedData);
    });
  };

  const uploadFile = async (file: File, accessToken: string, password?: string): Promise<GoogleDriveFile> => {
    try {
      let fileToUpload: File | Blob = file;
      let isEncrypted = false;

      if (password) {
        const encryptedBlob = await encryptFile(file, password);
        fileToUpload = new File([encryptedBlob], file.name, { type: 'application/encrypted' });
        isEncrypted = true;
      }

      const metadata = {
        name: file.name,
        mimeType: file.type,
        properties: {
          isEncrypted: isEncrypted.toString(),
        },
      };

      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        isEncrypted
      });

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', fileToUpload);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error?.message || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      return {
        id: data.id,
        name: data.name,
        mimeType: data.mimeType,
        webViewLink: data.webViewLink,
        isEncrypted,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const downloadFile = async (fileId: string, accessToken: string, password?: string): Promise<Blob> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to download file');
      }

      const blob = await response.blob();
      
      // Check if file is encrypted
      const fileMetadata = await getFile(fileId, accessToken);
      if (fileMetadata.isEncrypted && password) {
        return await decryptFile(blob, password);
      }

      return blob;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  };

  const listFiles = async (accessToken: string): Promise<GoogleDriveFile[]> => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,properties)',
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

  const deleteFile = async (fileId: string, accessToken: string): Promise<void> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const getFile = async (fileId: string, accessToken: string): Promise<GoogleDriveFile> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,properties`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch file');
      }

      const file = await response.json();
      return {
        ...file,
        isEncrypted: file.properties?.isEncrypted === 'true',
      };
    } catch (error) {
      console.error('Error getting file:', error);
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
  };

  return {
    login,
    uploadFile,
    downloadFile,
    listFiles,
    deleteFile,
    getFile,
    getAccessToken,
    isConnected,
    disconnect,
  };
}; 