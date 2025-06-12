
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
}

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
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
