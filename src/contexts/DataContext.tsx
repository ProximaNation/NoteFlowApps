import React, { createContext, useContext, useEffect, useState } from 'react';
import { Note, Todo } from '@/types';
import { useIndexedDB } from '@/hooks/useIndexedDB';

interface DataContextType {
  notes: Note[];
  todos: Todo[];
  isLoading: boolean;
  error: Error | null;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note>;
  updateNote: (id: string, note: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id'>) => Promise<Todo>;
  updateTodo: (id: string, todo: Partial<Todo>) => Promise<Todo>;
  deleteTodo: (id: string) => Promise<void>;
  searchNotes: (query: string) => Promise<Note[]>;
  searchTodos: (query: string) => Promise<Todo[]>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, error: dbError, db } = useIndexedDB();
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(dbError);

  const loadData = async () => {
    if (!isInitialized || !db) {
      console.error('IndexedDB not initialized');
      return;
    }

    try {
      setIsLoading(true);
      const [loadedNotes, loadedTodos] = await Promise.all([
        db.getAllNotes(),
        db.getAllTodos(),
      ]);
      setNotes(loadedNotes);
      setTodos(loadedTodos);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load data');
      setError(error);
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      loadData();
    }
  }, [isInitialized]);

  const addNote = async (note: Omit<Note, 'id'>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const newNote = await db.addNote(note);
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add note');
      setError(error);
      throw error;
    }
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const updatedNote = await db.updateNote(id, note);
      setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
      return updatedNote;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update note');
      setError(error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    if (!db) throw new Error('Database not initialized');
    try {
      await db.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete note');
      setError(error);
      throw error;
    }
  };

  const addTodo = async (todo: Omit<Todo, 'id'>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const newTodo = await db.addTodo(todo);
      setTodos(prev => [...prev, newTodo]);
      return newTodo;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add todo');
      setError(error);
      throw error;
    }
  };

  const updateTodo = async (id: string, todo: Partial<Todo>) => {
    if (!db) throw new Error('Database not initialized');
    try {
      const updatedTodo = await db.updateTodo(id, todo);
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      return updatedTodo;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update todo');
      setError(error);
      throw error;
    }
  };

  const deleteTodo = async (id: string) => {
    if (!db) throw new Error('Database not initialized');
    try {
      await db.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete todo');
      setError(error);
      throw error;
    }
  };

  const searchNotes = async (query: string) => {
    if (!db) throw new Error('Database not initialized');
    try {
      return await db.searchNotes(query);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to search notes');
      setError(error);
      throw error;
    }
  };

  const searchTodos = async (query: string) => {
    if (!db) throw new Error('Database not initialized');
    try {
      return await db.searchTodos(query);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to search todos');
      setError(error);
      throw error;
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <DataContext.Provider
      value={{
        notes,
        todos,
        isLoading,
        error,
        addNote,
        updateNote,
        deleteNote,
        addTodo,
        updateTodo,
        deleteTodo,
        searchNotes,
        searchTodos,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
} 