import { Note, Todo, DBNote, DBTodo } from '@/types';

const DB_NAME = 'noteflow_db';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';
const TODOS_STORE = 'todos';

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        this.initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB connected successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create notes store with improved indexes
        if (!db.objectStoreNames.contains(NOTES_STORE)) {
          const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
          notesStore.createIndex('createdAt', 'createdAt');
          notesStore.createIndex('updatedAt', 'updatedAt');
          notesStore.createIndex('title', 'title');
          notesStore.createIndex('tags', 'tags', { multiEntry: true });
          notesStore.createIndex('color', 'color');
        }

        // Create todos store with improved indexes
        if (!db.objectStoreNames.contains(TODOS_STORE)) {
          const todosStore = db.createObjectStore(TODOS_STORE, { keyPath: 'id' });
          todosStore.createIndex('createdAt', 'createdAt');
          todosStore.createIndex('updatedAt', 'updatedAt');
          todosStore.createIndex('completed', 'completed');
          todosStore.createIndex('dueDate', 'dueDate');
          todosStore.createIndex('priority', 'priority');
          todosStore.createIndex('tags', 'tags', { multiEntry: true });
        }
      };

      request.onblocked = () => {
        console.warn('IndexedDB blocked - please close other tabs with this app open');
      };
    });

    return this.initPromise;
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  private convertToDBNote(note: Omit<Note, 'id'>): Omit<DBNote, 'id'> {
    return {
      ...note,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: note.tags || [],
    };
  }

  private convertToDBTodo(todo: Omit<Todo, 'id'>): Omit<DBTodo, 'id'> {
    return {
      ...todo,
      dueDate: todo.dueDate ? todo.dueDate.getTime() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: todo.tags || [],
    };
  }

  private convertToNote(dbNote: DBNote): Note {
    return {
      ...dbNote,
      createdAt: new Date(dbNote.createdAt),
      updatedAt: new Date(dbNote.updatedAt),
      tags: dbNote.tags || [],
    };
  }

  private convertToTodo(dbTodo: DBTodo): Todo {
    return {
      ...dbTodo,
      dueDate: dbTodo.dueDate ? new Date(dbTodo.dueDate) : undefined,
      createdAt: new Date(dbTodo.createdAt),
      updatedAt: new Date(dbTodo.updatedAt),
      tags: dbTodo.tags || [],
    };
  }

  // Notes operations with improved error handling
  async addNote(note: Omit<Note, 'id'>): Promise<Note> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);

      const dbNote: DBNote = {
        ...this.convertToDBNote(note),
        id: crypto.randomUUID(),
      };

      const request = store.add(dbNote);

      request.onsuccess = () => resolve(this.convertToNote(dbNote));
      request.onerror = () => {
        console.error('Error adding note:', request.error);
        reject(new Error('Failed to add note: ' + request.error?.message));
      };

      transaction.oncomplete = () => {
        console.log('Note added successfully');
      };

      transaction.onerror = () => {
        console.error('Transaction error:', transaction.error);
        reject(new Error('Transaction failed: ' + transaction.error?.message));
      };
    });
  }

  async updateNote(id: string, note: Partial<Note>): Promise<Note> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);

      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingNote = getRequest.result as DBNote;
        if (!existingNote) {
          reject(new Error('Note not found'));
          return;
        }

        const updatedNote: DBNote = {
          ...existingNote,
          ...this.convertToDBNote(note as Note),
          id,
          createdAt: existingNote.createdAt,
          updatedAt: Date.now(),
        };

        const updateRequest = store.put(updatedNote);
        updateRequest.onsuccess = () => resolve(this.convertToNote(updatedNote));
        updateRequest.onerror = () => {
          console.error('Error updating note:', updateRequest.error);
          reject(new Error('Failed to update note: ' + updateRequest.error?.message));
        };
      };

      getRequest.onerror = () => {
        console.error('Error getting note:', getRequest.error);
        reject(new Error('Failed to get note: ' + getRequest.error?.message));
      };
    });
  }

  async deleteNote(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Error deleting note:', request.error);
        reject(new Error('Failed to delete note: ' + request.error?.message));
      };
    });
  }

  async getAllNotes(): Promise<Note[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const dbNotes = request.result as DBNote[];
        resolve(dbNotes.map(this.convertToNote));
      };
      request.onerror = () => {
        console.error('Error getting notes:', request.error);
        reject(new Error('Failed to get notes: ' + request.error?.message));
      };
    });
  }

  // Todos operations with improved error handling
  async addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TODOS_STORE], 'readwrite');
      const store = transaction.objectStore(TODOS_STORE);

      const dbTodo: DBTodo = {
        ...this.convertToDBTodo(todo),
        id: crypto.randomUUID(),
      };

      const request = store.add(dbTodo);

      request.onsuccess = () => resolve(this.convertToTodo(dbTodo));
      request.onerror = () => {
        console.error('Error adding todo:', request.error);
        reject(new Error('Failed to add todo: ' + request.error?.message));
      };
    });
  }

  async updateTodo(id: string, todo: Partial<Todo>): Promise<Todo> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TODOS_STORE], 'readwrite');
      const store = transaction.objectStore(TODOS_STORE);

      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingTodo = getRequest.result as DBTodo;
        if (!existingTodo) {
          reject(new Error('Todo not found'));
          return;
        }

        const updatedTodo: DBTodo = {
          ...existingTodo,
          ...this.convertToDBTodo(todo as Todo),
          id,
          createdAt: existingTodo.createdAt,
          updatedAt: Date.now(),
        };

        const updateRequest = store.put(updatedTodo);
        updateRequest.onsuccess = () => resolve(this.convertToTodo(updatedTodo));
        updateRequest.onerror = () => {
          console.error('Error updating todo:', updateRequest.error);
          reject(new Error('Failed to update todo: ' + updateRequest.error?.message));
        };
      };

      getRequest.onerror = () => {
        console.error('Error getting todo:', getRequest.error);
        reject(new Error('Failed to get todo: ' + getRequest.error?.message));
      };
    });
  }

  async deleteTodo(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TODOS_STORE], 'readwrite');
      const store = transaction.objectStore(TODOS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Error deleting todo:', request.error);
        reject(new Error('Failed to delete todo: ' + request.error?.message));
      };
    });
  }

  async getAllTodos(): Promise<Todo[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TODOS_STORE], 'readonly');
      const store = transaction.objectStore(TODOS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const dbTodos = request.result as DBTodo[];
        resolve(dbTodos.map(this.convertToTodo));
      };
      request.onerror = () => {
        console.error('Error getting todos:', request.error);
        reject(new Error('Failed to get todos: ' + request.error?.message));
      };
    });
  }

  // Enhanced search functionality
  async searchNotes(query: string): Promise<Note[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const dbNotes = request.result as DBNote[];
        const searchTerm = query.toLowerCase();
        
        const results = dbNotes.filter(note => 
          note.title.toLowerCase().includes(searchTerm) || 
          note.content.toLowerCase().includes(searchTerm) ||
          note.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        resolve(results.map(this.convertToNote));
      };
      request.onerror = () => {
        console.error('Error searching notes:', request.error);
        reject(new Error('Failed to search notes: ' + request.error?.message));
      };
    });
  }

  async searchTodos(query: string): Promise<Todo[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TODOS_STORE], 'readonly');
      const store = transaction.objectStore(TODOS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const dbTodos = request.result as DBTodo[];
        const searchTerm = query.toLowerCase();
        
        const results = dbTodos.filter(todo => 
          todo.title.toLowerCase().includes(searchTerm) || 
          todo.description?.toLowerCase().includes(searchTerm) ||
          todo.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        resolve(results.map(this.convertToTodo));
      };
      request.onerror = () => {
        console.error('Error searching todos:', request.error);
        reject(new Error('Failed to search todos: ' + request.error?.message));
      };
    });
  }

  // New methods for filtering and sorting
  async getNotesByTag(tag: string): Promise<Note[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const index = store.index('tags');
      const request = index.getAll(tag);

      request.onsuccess = () => {
        const dbNotes = request.result as DBNote[];
        resolve(dbNotes.map(this.convertToNote));
      };
      request.onerror = () => {
        console.error('Error getting notes by tag:', request.error);
        reject(new Error('Failed to get notes by tag: ' + request.error?.message));
      };
    });
  }

  async getTodosByPriority(priority: 'low' | 'medium' | 'high'): Promise<Todo[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TODOS_STORE], 'readonly');
      const store = transaction.objectStore(TODOS_STORE);
      const index = store.index('priority');
      const request = index.getAll(priority);

      request.onsuccess = () => {
        const dbTodos = request.result as DBTodo[];
        resolve(dbTodos.map(this.convertToTodo));
      };
      request.onerror = () => {
        console.error('Error getting todos by priority:', request.error);
        reject(new Error('Failed to get todos by priority: ' + request.error?.message));
      };
    });
  }

  async getCompletedTodos(): Promise<Todo[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TODOS_STORE], 'readonly');
      const store = transaction.objectStore(TODOS_STORE);
      const index = store.index('completed');
      const request = index.getAll(true);

      request.onsuccess = () => {
        const dbTodos = request.result as DBTodo[];
        resolve(dbTodos.map(this.convertToTodo));
      };
      request.onerror = () => {
        console.error('Error getting completed todos:', request.error);
        reject(new Error('Failed to get completed todos: ' + request.error?.message));
      };
    });
  }

  // Database maintenance methods
  async clearDatabase(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOTES_STORE, TODOS_STORE], 'readwrite');
      const notesStore = transaction.objectStore(NOTES_STORE);
      const todosStore = transaction.objectStore(TODOS_STORE);

      const notesRequest = notesStore.clear();
      const todosRequest = todosStore.clear();

      Promise.all([
        new Promise((res, rej) => {
          notesRequest.onsuccess = res;
          notesRequest.onerror = () => rej(notesRequest.error);
        }),
        new Promise((res, rej) => {
          todosRequest.onsuccess = res;
          todosRequest.onerror = () => rej(todosRequest.error);
        })
      ])
        .then(() => resolve())
        .catch(error => {
          console.error('Error clearing database:', error);
          reject(new Error('Failed to clear database: ' + error.message));
        });
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

export const db = new IndexedDBService(); 