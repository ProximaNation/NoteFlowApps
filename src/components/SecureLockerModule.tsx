import React, { useState, useEffect } from 'react';
import { PasswordManager } from '@/services/passwordManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Upload, Download, Trash2, Lock } from 'lucide-react';
import { Note, Todo } from '@/types';
import { db } from '@/services/indexedDB';

interface SecureLockerModuleProps {
  children: React.ReactNode;
}

export function SecureLockerModule({ children }: SecureLockerModuleProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

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

  useEffect(() => {
    if (isUnlocked) {
      loadData();
    }
  }, [isUnlocked]);

  const loadData = async () => {
    try {
      const [loadedNotes, loadedTodos] = await Promise.all([
        db.getAllNotes(),
        db.getAllTodos(),
      ]);
      setNotes(loadedNotes);
      setTodos(loadedTodos);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isUnlocked) {
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
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Notes ({notes.length})</h2>
          {notes.length === 0 ? (
            <p className="text-muted-foreground">No notes yet. Create your first note!</p>
          ) : (
            <div className="space-y-4">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <h3 className="font-medium mb-2">{note.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Todos ({todos.length})</h2>
          {todos.length === 0 ? (
            <p className="text-muted-foreground">No todos yet. Add your first task!</p>
          ) : (
            <div className="space-y-2">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    className="h-4 w-4"
                    readOnly
                  />
                  <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>
                    {todo.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
