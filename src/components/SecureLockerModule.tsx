import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Trash2, File, Image, Video, FileText, FolderOpen, Lock, Eye, EyeOff, Shield, Cloud, KeyRound } from 'lucide-react';
import { StoredFile } from '../types';
import { useGoogleDrive } from '@/services/googleDrive';
import { PasswordManager } from '@/services/passwordManager';
import GoogleDriveConnect from './GoogleDriveConnect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SecureLockerModuleProps {
  files: StoredFile[];
  setFiles: (files: StoredFile[]) => void;
  children: React.ReactNode;
}

const SecureLockerModule = ({ files, setFiles, children }: SecureLockerModuleProps) => {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [filePassword, setFilePassword] = useState('');
  const [showFilePassword, setShowFilePassword] = useState(false);
  const [protectWithPassword, setProtectWithPassword] = useState(false);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Master password states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  const { uploadFile, downloadFile, getAccessToken, listFiles: listDriveFiles } = useGoogleDrive();
  const passwordManager = PasswordManager.getInstance();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const hasAccess = await passwordManager.checkAccess();
        setIsUnlocked(hasAccess);
        const hasPassword = await passwordManager.hasPassword();
        setIsSetup(hasPassword);
      } catch (err) {
        console.error('Error checking access:', err);
        setError('Failed to check access. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  const handleGoogleDriveConnect = async (accessToken: string) => {
    try {
      setIsGoogleDriveConnected(true);
      // Load existing files from Google Drive
      const driveFiles = await listDriveFiles(accessToken);
      const storedFiles: StoredFile[] = driveFiles.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size || 0,
        type: file.mimeType,
        url: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        uploadedAt: new Date(file.createdTime || Date.now()),
        isProtected: file.isEncrypted || false,
      }));
      setFiles(storedFiles);
    } catch (error) {
      console.error('Error loading files from Google Drive:', error);
      setError('Failed to load files from Google Drive. Please try reconnecting.');
    }
  };

  const handleGoogleDriveDisconnect = () => {
    setIsGoogleDriveConnected(false);
    setFiles([]);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const isValid = await passwordManager.verifyPassword(password);
      if (isValid) {
        setIsUnlocked(true);
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      setError('Failed to verify password. Please try again.');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await passwordManager.setPassword(password);
      setIsUnlocked(true);
      setIsSetup(true);
    } catch (err) {
      console.error('Error setting password:', err);
      setError('Failed to set password. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setUploading(true);
    setError(null);
    const newFiles: StoredFile[] = [];

    const accessToken = getAccessToken();
    if (!accessToken) {
      setError('Google Drive is not connected. Please connect first.');
      setUploading(false);
      return;
    }

    try {
      for (const file of Array.from(selectedFiles)) {
        const uploadedFile = await uploadFile(
          file, 
          accessToken, 
          protectWithPassword ? filePassword : undefined
        );
        
        const storedFile: StoredFile = {
          id: uploadedFile.id,
          name: uploadedFile.name,
          size: file.size,
          type: uploadedFile.mimeType,
          url: uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`,
          uploadedAt: new Date(),
          isProtected: uploadedFile.isEncrypted || false,
        };

        newFiles.push(storedFile);
      }

      setFiles([...files, ...newFiles]);
      setFilePassword('');
      setProtectWithPassword(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileDownload = async (file: StoredFile) => {
    try {
      setDownloading(file.id);
      setError(null);

      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('Google Drive is not connected');
      }

      let password: string | undefined;
      if (file.isProtected) {
        password = prompt('Enter password to decrypt file:');
        if (!password) {
          throw new Error('Password is required for encrypted file');
        }
      }

      const blob = await downloadFile(file.id, accessToken, password);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      setError(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const deleteFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.includes('text') || type.includes('document') || type.includes('pdf')) return FileText;
    return File;
  };

  const canPreview = (type: string) => {
    return type.startsWith('image/') || type.startsWith('video/') || type.includes('pdf') || type.includes('text');
  };

  const renderFilePreview = (file: StoredFile) => {
    if (!canPreview(file.type)) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-card dark:bg-card rounded-lg max-w-4xl max-h-full overflow-auto">
          <div className="p-4 border-b border-border dark:border-border flex justify-between items-center">
            <h3 className="font-semibold text-card-foreground dark:text-card-foreground">{file.name}</h3>
            <button
              onClick={() => setPreviewFile(null)}
              className="text-muted-foreground hover:text-card-foreground dark:text-muted-foreground dark:hover:text-card-foreground"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            {file.type.startsWith('image/') && (
              <img src={file.url} alt={file.name} className="max-w-full max-h-96 object-contain mx-auto" />
            )}
            {file.type.startsWith('video/') && (
              <video controls className="max-w-full max-h-96 mx-auto">
                <source src={file.url} type={file.type} />
              </video>
            )}
            {file.type.includes('pdf') && (
              <iframe src={file.url} className="w-full h-96 border-0" title={file.name} />
            )}
            {file.type.includes('text') && (
              <div className="bg-muted dark:bg-muted p-4 rounded-lg">
                <p className="text-muted-foreground dark:text-muted-foreground">Text file preview not available. Click download to view content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">
            {isSetup ? 'Unlock Secure Locker' : 'Set Up Secure Locker'}
          </h1>
          <p className="text-muted-foreground">
            {isSetup
              ? 'Enter your password to access your secure files'
              : 'Create a password to protect your secure files'}
          </p>
        </div>

        <form onSubmit={isSetup ? handleUnlock : handleSetup} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full">
            {isSetup ? 'Unlock' : 'Set Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SecureLockerModule;
