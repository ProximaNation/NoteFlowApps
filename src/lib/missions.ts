export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: 'notes' | 'todos' | 'daily' | 'general';
  goal: number;
  progress: number; // This will be managed in the main state
}

export const missions: Mission[] = [
  // Notes
  { id: 'note_1', title: 'First Note', description: 'Create your first note.', xp: 10, category: 'notes', goal: 1, progress: 0 },
  { id: 'note_5', title: 'Note Taker', description: 'Create 5 notes.', xp: 50, category: 'notes', goal: 5, progress: 0 },
  { id: 'note_20', title: 'Scribe', description: 'Create 20 notes.', xp: 100, category: 'notes', goal: 20, progress: 0 },
  { id: 'note_50', title: 'Archivist', description: 'Create 50 notes.', xp: 250, category: 'notes', goal: 50, progress: 0 },
  { id: 'note_100', title: 'Loremaster', description: 'Create 100 notes.', xp: 500, category: 'notes', goal: 100, progress: 0 },

  // Todos
  { id: 'todo_1', title: 'First Task', description: 'Create your first to-do item.', xp: 10, category: 'todos', goal: 1, progress: 0 },
  { id: 'todo_10', title: 'Task Manager', description: 'Complete 10 to-do items.', xp: 50, category: 'todos', goal: 10, progress: 0 },
  { id: 'todo_50', title: 'Productivity Pro', description: 'Complete 50 to-do items.', xp: 100, category: 'todos', goal: 50, progress: 0 },
  { id: 'todo_100', title: 'Get Things Done', description: 'Complete 100 to-do items.', xp: 250, category: 'todos', goal: 100, progress: 0 },
  { id: 'todo_200', title: 'Master of Productivity', description: 'Complete 200 to-do items.', xp: 500, category: 'todos', goal: 200, progress: 0 },

  // Daily Login
  { id: 'login_1', title: 'Welcome Back!', description: 'Log in for the first time.', xp: 10, category: 'daily', goal: 1, progress: 0 },
  { id: 'login_3', title: 'Consistent User', description: 'Log in 3 days in a row.', xp: 30, category: 'daily', goal: 3, progress: 0 },
  { id: 'login_7', title: 'Weekly Habit', description: 'Log in 7 days in a row.', xp: 70, category: 'daily', goal: 7, progress: 0 },
  { id: 'login_30', title: 'Monthly Dedication', description: 'Log in 30 days in a row.', xp: 300, category: 'daily', goal: 30, progress: 0 },

  // General
  { id: 'dark_mode', title: 'Into the Shadows', description: 'Enable dark mode.', xp: 5, category: 'general', goal: 1, progress: 0 },
  { id: 'light_mode', title: 'Out of the Cave', description: 'Enable light mode.', xp: 5, category: 'general', goal: 1, progress: 0 },
  { id: 'export_data', title: 'Data Guardian', description: 'Export your data.', xp: 20, category: 'general', goal: 1, progress: 0 },
  { id: 'import_data', title: 'Time Traveler', description: 'Import data.', xp: 20, category: 'general', goal: 1, progress: 0 },
  { id: 'use_search', title: 'Detective', description: 'Use the search bar.', xp: 10, category: 'general', goal: 1, progress: 0 },
  { id: 'focus_task', title: 'Focused Mind', description: 'Add a task to Today\'s Focus.', xp: 15, category: 'general', goal: 1, progress: 0 },

  // Higher Tier Missions
  { id: 'note_200', title: 'Librarian', description: 'Create 200 notes.', xp: 1000, category: 'notes', goal: 200, progress: 0 },
  { id: 'note_500', title: 'Grand Historian', description: 'Create 500 notes.', xp: 2500, category: 'notes', goal: 500, progress: 0 },
  { id: 'todo_500', title: 'Execution Expert', description: 'Complete 500 to-do items.', xp: 1000, category: 'todos', goal: 500, progress: 0 },
  { id: 'todo_1000', title: 'Productivity Legend', description: 'Complete 1000 to-do items.', xp: 2500, category: 'todos', goal: 1000, progress: 0 },
  { id: 'login_90', title: 'Quarterly Check-in', description: 'Log in 90 days in a row.', xp: 1000, category: 'daily', goal: 90, progress: 0 },
  { id: 'login_365', title: 'Yearly Dedication', description: 'Log in for a full year.', xp: 5000, category: 'daily', goal: 365, progress: 0 },

  // New General Missions
  { id: 'add_link', title: 'Link Collector', description: 'Save your first link in the Bookmark Manager.', xp: 15, category: 'general', goal: 1, progress: 0 },
  { id: 'upload_file', title: 'Digital Packer', description: 'Upload a file to the Secure Locker.', xp: 20, category: 'general', goal: 1, progress: 0 },
  {
    id: 'share_10',
    title: 'Social Butterfly',
    description: 'Share the app with 10 friends.',
    xp: 1000,
    category: 'general',
    goal: 10,
    progress: 0
  },
];
