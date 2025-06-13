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

  useEffect(() => {
    if (!isInitialized) return;

    const loadData = async () => {
      try {
        const [loadedNotes, loadedTodos] = await Promise.all([
          db.getAllNotes(),
          db.getAllTodos(),
        ]);
        setNotes(loadedNotes);
        setTodos(loadedTodos);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isInitialized, db]);

  const addNote = async (note: Omit<Note, 'id'>) => {
    const newNote = await db.addNote(note);
    setNotes(prev => [...prev, newNote]);
    return newNote;
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    const updatedNote = await db.updateNote(id, note);
    setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
    return updatedNote;
  };

  const deleteNote = async (id: string) => {
    await db.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const addTodo = async (todo: Omit<Todo, 'id'>) => {
    const newTodo = await db.addTodo(todo);
    setTodos(prev => [...prev, newTodo]);
    return newTodo;
  };

  const updateTodo = async (id: string, todo: Partial<Todo>) => {
    const updatedTodo = await db.updateTodo(id, todo);
    setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
    return updatedTodo;
  };

  const deleteTodo = async (id: string) => {
    await db.deleteTodo(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const searchNotes = async (query: string) => {
    return db.searchNotes(query);
  };

  const searchTodos = async (query: string) => {
    return db.searchTodos(query);
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
} 