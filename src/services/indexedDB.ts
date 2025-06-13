import { Note, Todo, DBNote, DBTodo } from '@/types';

const DB_NAME = 'noteflow_db';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';
const TODOS_STORE = 'todos';

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB connected successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create notes store
        if (!db.objectStoreNames.contains(NOTES_STORE)) {
          const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
          notesStore.createIndex('createdAt', 'createdAt');
          notesStore.createIndex('updatedAt', 'updatedAt');
          notesStore.createIndex('title', 'title');
        }

        // Create todos store
        if (!db.objectStoreNames.contains(TODOS_STORE)) {
          const todosStore = db.createObjectStore(TODOS_STORE, { keyPath: 'id' });
          todosStore.createIndex('createdAt', 'createdAt');
          todosStore.createIndex('updatedAt', 'updatedAt');
          todosStore.createIndex('completed', 'completed');
          todosStore.createIndex('dueDate', 'dueDate');
        }
      };
    });
  }

  private convertToDBNote(note: Omit<Note, 'id'>): Omit<DBNote, 'id'> {
    return {
      ...note,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  private convertToDBTodo(todo: Omit<Todo, 'id'>): Omit<DBTodo, 'id'> {
    return {
      ...todo,
      dueDate: todo.dueDate ? todo.dueDate.getTime() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  private convertToNote(dbNote: DBNote): Note {
    return {
      ...dbNote,
      createdAt: new Date(dbNote.createdAt),
      updatedAt: new Date(dbNote.updatedAt),
    };
  }

  private convertToTodo(dbTodo: DBTodo): Todo {
    return {
      ...dbTodo,
      dueDate: dbTodo.dueDate ? new Date(dbTodo.dueDate) : undefined,
      createdAt: new Date(dbTodo.createdAt),
      updatedAt: new Date(dbTodo.updatedAt),
    };
  }

  // Notes operations
  async addNote(note: Omit<Note, 'id'>): Promise<Note> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);

      const dbNote: DBNote = {
        ...this.convertToDBNote(note),
        id: crypto.randomUUID(),
      };

      const request = store.add(dbNote);

      request.onsuccess = () => resolve(this.convertToNote(dbNote));
      request.onerror = () => reject(request.error);
    });
  }

  async updateNote(id: string, note: Partial<Note>): Promise<Note> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readwrite');
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
        };

        const updateRequest = store.put(updatedNote);
        updateRequest.onsuccess = () => resolve(this.convertToNote(updatedNote));
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteNote(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllNotes(): Promise<Note[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const dbNotes = request.result as DBNote[];
        resolve(dbNotes.map(this.convertToNote));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Todos operations
  async addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TODOS_STORE], 'readwrite');
      const store = transaction.objectStore(TODOS_STORE);

      const dbTodo: DBTodo = {
        ...this.convertToDBTodo(todo),
        id: crypto.randomUUID(),
      };

      const request = store.add(dbTodo);

      request.onsuccess = () => resolve(this.convertToTodo(dbTodo));
      request.onerror = () => reject(request.error);
    });
  }

  async updateTodo(id: string, todo: Partial<Todo>): Promise<Todo> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TODOS_STORE], 'readwrite');
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
        };

        const updateRequest = store.put(updatedTodo);
        updateRequest.onsuccess = () => resolve(this.convertToTodo(updatedTodo));
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteTodo(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TODOS_STORE], 'readwrite');
      const store = transaction.objectStore(TODOS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTodos(): Promise<Todo[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TODOS_STORE], 'readonly');
      const store = transaction.objectStore(TODOS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const dbTodos = request.result as DBTodo[];
        resolve(dbTodos.map(this.convertToTodo));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async searchNotes(query: string): Promise<Note[]> {
    const notes = await this.getAllNotes();
    const searchTerm = query.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) || 
      note.content.toLowerCase().includes(searchTerm)
    );
  }

  async searchTodos(query: string): Promise<Todo[]> {
    const todos = await this.getAllTodos();
    const searchTerm = query.toLowerCase();
    
    return todos.filter(todo => 
      todo.title.toLowerCase().includes(searchTerm) || 
      (todo.description?.toLowerCase().includes(searchTerm))
    );
  }
}

export const db = new IndexedDBService(); 