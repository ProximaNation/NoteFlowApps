export interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  color?: string;
}

export interface Todo {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
}

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  isProtected?: boolean;
}

export interface StoredLink {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  description?: string;
  createdAt: Date;
  bookmarked?: boolean;
}

export interface AppData {
  notes: Note[];
  todos: Todo[];
  focusedTasks: string[];
  files: StoredFile[];
  links: StoredLink[];
}

// Database specific types
export interface DBNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  color?: string;
}

export interface DBTodo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: number;
  priority?: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}
