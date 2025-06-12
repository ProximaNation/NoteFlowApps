
import React, { useRef } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import { Note, Todo, AppData, StoredFile, StoredLink } from '../types';

interface ExportImportProps {
  notes: Note[];
  todos: Todo[];
  files: StoredFile[];
  links: StoredLink[];
  focusedTasks: string[];
  setNotes: (notes: Note[]) => void;
  setTodos: (todos: Todo[]) => void;
  setFiles: (files: StoredFile[]) => void;
  setLinks: (links: StoredLink[]) => void;
  setFocusedTasks: (tasks: string[]) => void;
}

const ExportImport = ({ 
  notes, 
  todos, 
  files,
  links,
  focusedTasks, 
  setNotes, 
  setTodos, 
  setFiles,
  setLinks,
  setFocusedTasks 
}: ExportImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const appData: AppData = {
      notes,
      todos,
      files,
      links,
      focusedTasks
    };

    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `noteflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData: AppData = JSON.parse(e.target?.result as string);
        
        if (importedData.notes) setNotes(importedData.notes);
        if (importedData.todos) setTodos(importedData.todos);
        if (importedData.files) setFiles(importedData.files);
        if (importedData.links) setLinks(importedData.links);
        if (importedData.focusedTasks) setFocusedTasks(importedData.focusedTasks);
        
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setNotes([]);
      setTodos([]);
      setFiles([]);
      setLinks([]);
      setFocusedTasks([]);
      localStorage.clear();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4 text-foreground">Export & Import</h2>
        <p className="text-muted-foreground mb-6">
          Backup your notes and tasks or restore from a previous backup.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-border rounded-lg bg-card">
            <div className="flex items-center space-x-3 mb-4">
              <Download size={24} className="text-green-600" />
              <h3 className="text-lg font-medium text-card-foreground">Export Data</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Download all your notes and tasks as a JSON file.
            </p>
            <button
              onClick={exportData}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <Download size={18} />
              <span>Export Backup</span>
            </button>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card">
            <div className="flex items-center space-x-3 mb-4">
              <Upload size={24} className="text-blue-600" />
              <h3 className="text-lg font-medium text-card-foreground">Import Data</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Restore your notes and tasks from a backup file.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={importData}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <Upload size={18} />
              <span>Import Backup</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-foreground">Data Management</h2>
        
        <div className="p-6 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800">
          <div className="flex items-center space-x-3 mb-4">
            <FileText size={24} className="text-red-600" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Clear All Data</h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">
            This will permanently delete all your notes, tasks, and settings. 
            Make sure to export your data first!
          </p>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            Clear All Data
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-foreground">Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center border border-border">
            <div className="text-2xl font-bold text-blue-600">{notes.length}</div>
            <div className="text-sm text-blue-800 dark:text-blue-200">Total Notes</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center border border-border">
            <div className="text-2xl font-bold text-green-600">{todos.length}</div>
            <div className="text-sm text-green-800 dark:text-green-200">Total Tasks</div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg text-center border border-border">
            <div className="text-2xl font-bold text-purple-600">
              {todos.filter(t => t.completed).length}
            </div>
            <div className="text-sm text-purple-800 dark:text-purple-200">Completed</div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-center border border-border">
            <div className="text-2xl font-bold text-yellow-600">{focusedTasks.length}</div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">Focused Tasks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportImport;
