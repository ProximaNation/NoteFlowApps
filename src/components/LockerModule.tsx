
import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, File, Image, Video, FileText, FolderOpen } from 'lucide-react';
import { StoredFile } from '../types';

interface LockerModuleProps {
  files: StoredFile[];
  setFiles: (files: StoredFile[]) => void;
}

const LockerModule = ({ files, setFiles }: LockerModuleProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCatbox = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    try {
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.text();
      
      if (!result || result.includes('error') || result.includes('Error')) {
        throw new Error('Upload failed: Invalid response from server');
      }

      return result.trim();
    } catch (error) {
      console.error('Catbox upload error:', error);
      throw new Error('Upload failed. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setUploading(true);
    const newFiles: StoredFile[] = [];

    try {
      for (const file of Array.from(selectedFiles)) {
        console.log('Uploading file:', file.name);
        const url = await uploadToCatbox(file);
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
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error instanceof Error ? error.message : 'Upload failed. Please try again.');
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
    if (type.includes('text') || type.includes('document')) return FileText;
    return File;
  };

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">File Locker</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-300 disabled:opacity-50"
          >
            <Upload size={20} />
            <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
          </button>
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
            <FolderOpen size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No files uploaded yet</h3>
            <p className="text-muted-foreground mb-6">Upload your documents, images, and files to keep them safe</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-300"
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
                <div key={file.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-400">
                  <div className="flex items-start justify-between mb-4">
                    <FileIcon size={32} className="text-purple-600" />
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-card-foreground mb-2 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatFileSize(file.size)}
                  </p>
                  
                  <p className="text-xs text-muted-foreground mb-4">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                  
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors duration-300 w-full justify-center"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LockerModule;
