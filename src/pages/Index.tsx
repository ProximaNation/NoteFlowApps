
import React, { useState, useEffect } from 'react';
import { StickyNote, CheckSquare, Settings, Search, Download, Upload, Star } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotesModule from '../components/NotesModule';
import TodoModule from '../components/TodoModule';
import SecureLockerModule from '../components/SecureLockerModule';
import BookmarkManager from '../components/BookmarkManager';
import TodaysFocus from '../components/TodaysFocus';
import SearchBar from '../components/SearchBar';
import ExportImport from '../components/ExportImport';
import DarkModeToggle from '../components/DarkModeToggle';
import Auth from '../components/Auth';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { Note, Todo, StoredFile, StoredLink } from '../types';

const AppContent = () => {
  const [activeModule, setActiveModule] = useState<'notes' | 'todos' | 'locker' | 'links' | 'settings'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [links, setLinks] = useState<StoredLink[]>([]);
  const [focusedTasks, setFocusedTasks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const { user, loading } = useAuth();

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('notepad-darkmode');
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('notepad-darkmode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMainContent = () => {
    switch (activeModule) {
      case 'notes':
        return (
          <div className="flex-1 flex">
            <div className="flex-1">
              <NotesModule 
                notes={filteredNotes} 
                setNotes={setNotes} 
                searchQuery={searchQuery}
              />
            </div>
            <div className="w-80 border-l border-border p-6 bg-card">
              <TodaysFocus 
                todos={todos}
                focusedTasks={focusedTasks}
                setFocusedTasks={setFocusedTasks}
              />
            </div>
          </div>
        );
      case 'todos':
        return (
          <TodoModule 
            todos={filteredTodos} 
            setTodos={setTodos}
            searchQuery={searchQuery}
            focusedTasks={focusedTasks}
            setFocusedTasks={setFocusedTasks}
          />
        );
      case 'locker':
        return (
          <SecureLockerModule 
            files={filteredFiles}
            setFiles={setFiles}
          />
        );
      case 'links':
        return <BookmarkManager />;
      case 'settings':
        return (
          <div className="flex-1 p-8 bg-background">
            <h1 className="text-2xl font-bold mb-8 text-foreground">Settings</h1>
            <ExportImport 
              notes={notes}
              todos={todos}
              files={files}
              links={links}
              focusedTasks={focusedTasks}
              setNotes={setNotes}
              setTodos={setTodos}
              setFiles={setFiles}
              setLinks={setLinks}
              setFocusedTasks={setFocusedTasks}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-300">
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-accent rounded-lg transition-colors duration-300"
              >
                <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                  <div className="h-0.5 bg-foreground"></div>
                  <div className="h-0.5 bg-foreground"></div>
                  <div className="h-0.5 bg-foreground"></div>
                </div>
              </button>
              <h1 className="text-xl font-bold text-foreground">NoteFlow</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        {renderMainContent()}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
