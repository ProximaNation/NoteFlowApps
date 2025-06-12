import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, File, Image, Video, FileText, FolderOpen, Lock, Eye, EyeOff, Shield, Cloud } from 'lucide-react';
import { StoredFile } from '../types';

interface SecureLockerModuleProps {
  files: StoredFile[];
  setFiles: (files: StoredFile[]) => void;
}

const SecureLockerModule = ({ files, setFiles }: SecureLockerModuleProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [protectWithPassword, setProtectWithPassword] = useState(false);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive integration placeholder
  const uploadToGoogleDrive = async (file: File, password?: string): Promise<string> => {
    // This is a placeholder for Google Drive integration
    // In a real implementation, you would use the Google Drive API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate upload and return a mock URL
        resolve(`https://drive.google.com/file/mock-${Date.now()}/view`);
      }, 2000);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setUploading(true);
    const newFiles: StoredFile[] = [];

    try {
      for (const file of Array.from(selectedFiles)) {
        console.log('Uploading file to Google Drive:', file.name);
        const url = await uploadToGoogleDrive(file, protectWithPassword ? password : undefined);
        console.log('Upload successful:', url);
        
        const storedFile: StoredFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          url: url,
          uploadedAt: new Date(),
        };

        newFiles.push(storedFile);
      }

      setFiles([...files, ...newFiles]);
      setPassword('');
      setProtectWithPassword(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    <div className="flex-1 p-8 bg-background dark:bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield size={32} className="text-purple-600 dark:text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-foreground">Locker</h1>
              <p className="text-muted-foreground dark:text-muted-foreground">Secure cloud storage powered by Google Drive</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Cloud size={24} className="text-blue-500" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-300 disabled:opacity-50"
            >
              <Upload size={20} />
              <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
            </button>
          </div>
        </div>

        {/* Upload Options */}
        <div className="mb-6 p-4 bg-card dark:bg-card border border-border dark:border-border rounded-lg">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={protectWithPassword}
                onChange={(e) => setProtectWithPassword(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-card-foreground dark:text-card-foreground">Protect with password</span>
            </label>
            {protectWithPassword && (
              <div className="flex items-center space-x-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="px-3 py-2 border border-border dark:border-border rounded-md bg-background dark:bg-background text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-muted-foreground hover:text-card-foreground dark:text-muted-foreground dark:hover:text-card-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
        />

        {files.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen size={64} className="mx-auto text-muted-foreground dark:text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">No files uploaded yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground mb-6">Upload your documents, images, and files to keep them safe in the cloud</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-300"
            >
              <Upload size={20} />
              <span>Upload Your First File</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div key={file.id} className="bg-card dark:bg-card rounded-lg border border-border dark:border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-400">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FileIcon size={32} className="text-purple-600 dark:text-purple-400" />
                      {protectWithPassword && <Lock size={16} className="text-yellow-500" />}
                    </div>
                    <div className="flex space-x-2">
                      {canPreview(file.type) && (
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600 transition-colors duration-300"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 transition-colors duration-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-card-foreground dark:text-card-foreground mb-2 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-2">
                    {formatFileSize(file.size)}
                  </p>
                  
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-4">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                  
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors duration-300 w-full justify-center"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {previewFile && renderFilePreview(previewFile)}
      </div>
    </div>
  );
};

export default SecureLockerModule;
