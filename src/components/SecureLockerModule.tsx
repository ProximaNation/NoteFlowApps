import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, File, Image, Video, FileText, FolderOpen, Lock, Eye, EyeOff, Shield, Cloud, KeyRound } from 'lucide-react';
import { StoredFile } from '../types';
import { useGoogleDrive } from '@/services/googleDrive';
import GoogleDriveConnect from './GoogleDriveConnect';

interface SecureLockerModuleProps {
  files: StoredFile[];
  setFiles: (files: StoredFile[]) => void;
}

const SecureLockerModule = ({ files, setFiles }: SecureLockerModuleProps) => {
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
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [masterPasswordError, setMasterPasswordError] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);

  const { uploadFile, downloadFile, getAccessToken, listFiles: listDriveFiles } = useGoogleDrive();

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

  const handleSetMasterPassword = () => {
    if (masterPassword !== confirmMasterPassword) {
      setMasterPasswordError('Passwords do not match.');
      return;
    }
    if (masterPassword.length < 8) {
      setMasterPasswordError('Password must be at least 8 characters long.');
      return;
    }
    setIsMasterPasswordSet(true);
    setMasterPasswordError('');
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

  return (
    <div className="p-8 bg-background text-foreground flex-1">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Secure Locker</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!isGoogleDriveConnected ? (
          <GoogleDriveConnect 
            onConnect={handleGoogleDriveConnect}
            onDisconnect={handleGoogleDriveDisconnect}
          />
        ) : !isMasterPasswordSet ? (
          <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-lg">
            <KeyRound size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">Set Your Locker Password</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a master password to secure your locker. You will need this to access your files.
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <input
                  type={showMasterPassword ? "text" : "password"}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Enter master password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => setShowMasterPassword(!showMasterPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showMasterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showMasterPassword ? "text" : "password"}
                  value={confirmMasterPassword}
                  onChange={(e) => setConfirmMasterPassword(e.target.value)}
                  placeholder="Confirm master password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {masterPasswordError && (
                <p className="text-red-500 text-sm">{masterPasswordError}</p>
              )}

              <button
                onClick={handleSetMasterPassword}
                className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Set Password
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Files</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="protectWithPassword"
                    checked={protectWithPassword}
                    onChange={(e) => setProtectWithPassword(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="protectWithPassword" className="text-sm">
                    Protect with password
                  </label>
                </div>
                {protectWithPassword && (
                  <div className="relative">
                    <input
                      type={showFilePassword ? "text" : "password"}
                      value={filePassword}
                      onChange={(e) => setFilePassword(e.target.value)}
                      placeholder="Enter file password"
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() => setShowFilePassword(!showFilePassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showFilePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || (protectWithPassword && !filePassword)}
                  className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Upload size={20} />
                  <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="bg-card p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <FileIcon size={24} className="text-primary" />
                        <div>
                          <h3 className="font-medium truncate max-w-[200px]">{file.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFileDownload(file)}
                          disabled={downloading === file.id}
                          className="text-primary hover:underline text-sm flex items-center space-x-1"
                        >
                          <Download size={16} />
                          <span>{downloading === file.id ? 'Downloading...' : 'Download'}</span>
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View in Drive
                        </a>
                      </div>
                      {file.isProtected && (
                        <Lock size={16} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureLockerModule;
