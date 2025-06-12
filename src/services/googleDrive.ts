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
        localStorage.setItem('googleDriveToken', tokenResponse.access_token);
        return tokenResponse.access_token;
      } catch (error) {
        console.error('Error during Google Drive login:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('Google Drive login failed:', error);
      throw error;
    },
    scope: 'https://www.googleapis.com/auth/drive',
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
          const decryptedArray = decrypted.toArrayBuffer();
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
      let fileToUpload = file;
      let isEncrypted = false;

      if (password) {
        fileToUpload = await encryptFile(file, password);
        isEncrypted = true;
      }

      const metadata = {
        name: file.name,
        mimeType: file.type,
        properties: {
          isEncrypted: isEncrypted.toString(),
        },
      };

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
        throw new Error(errorData.error?.message || 'Failed to upload file');
      }

      const data = await response.json();
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
    return localStorage.getItem('googleDriveToken');
  };

  const isConnected = (): boolean => {
    return !!getAccessToken();
  };

  const disconnect = (): void => {
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