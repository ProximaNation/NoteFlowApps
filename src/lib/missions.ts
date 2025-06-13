export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: 'notes' | 'todos' | 'daily' | 'general';
  goal: number;
  progress: number; // This will be managed in the main state
  reward?: string; // Optional reward description
  badge?: string; // Optional badge icon name
}

export const missions: Mission[] = [
  // Notes
  { 
    id: 'note_1', 
    title: 'First Note', 
    description: 'Create your first note and begin your journey.', 
    xp: 10, 
    category: 'notes', 
    goal: 1, 
    progress: 0,
    badge: '📝'
  },
  { 
    id: 'note_5', 
    title: 'Note Taker', 
    description: 'Create 5 notes and establish your note-taking habit.', 
    xp: 50, 
    category: 'notes', 
    goal: 5, 
    progress: 0,
    badge: '📚'
  },
  { 
    id: 'note_20', 
    title: 'Scribe', 
    description: 'Create 20 notes and become a master of documentation.', 
    xp: 100, 
    category: 'notes', 
    goal: 20, 
    progress: 0,
    badge: '✍️'
  },
  { 
    id: 'note_50', 
    title: 'Archivist', 
    description: 'Create 50 notes and build your knowledge library.', 
    xp: 250, 
    category: 'notes', 
    goal: 50, 
    progress: 0,
    badge: '🏛️'
  },
  { 
    id: 'note_100', 
    title: 'Loremaster', 
    description: 'Create 100 notes and become a legend of knowledge.', 
    xp: 500, 
    category: 'notes', 
    goal: 100, 
    progress: 0,
    badge: '👑'
  },

  // Todos
  { 
    id: 'todo_1', 
    title: 'First Task', 
    description: 'Create your first to-do item and start your productivity journey.', 
    xp: 10, 
    category: 'todos', 
    goal: 1, 
    progress: 0,
    badge: '✅'
  },
  { 
    id: 'todo_10', 
    title: 'Task Manager', 
    description: 'Complete 10 to-do items and show your organizational skills.', 
    xp: 50, 
    category: 'todos', 
    goal: 10, 
    progress: 0,
    badge: '📋'
  },
  { 
    id: 'todo_50', 
    title: 'Productivity Pro', 
    description: 'Complete 50 to-do items and become a productivity expert.', 
    xp: 100, 
    category: 'todos', 
    goal: 50, 
    progress: 0,
    badge: '⚡'
  },
  { 
    id: 'todo_100', 
    title: 'Get Things Done', 
    description: 'Complete 100 to-do items and master the art of execution.', 
    xp: 250, 
    category: 'todos', 
    goal: 100, 
    progress: 0,
    badge: '🎯'
  },
  { 
    id: 'todo_200', 
    title: 'Master of Productivity', 
    description: 'Complete 200 to-do items and become a productivity legend.', 
    xp: 500, 
    category: 'todos', 
    goal: 200, 
    progress: 0,
    badge: '🏆'
  },

  // Daily Login
  { 
    id: 'login_1', 
    title: 'Welcome Back!', 
    description: 'Log in for the first time and start your journey.', 
    xp: 10, 
    category: 'daily', 
    goal: 1, 
    progress: 0,
    badge: '👋'
  },
  { 
    id: 'login_3', 
    title: 'Consistent User', 
    description: 'Log in 3 days in a row and build your streak.', 
    xp: 30, 
    category: 'daily', 
    goal: 3, 
    progress: 0,
    badge: '🔥'
  },
  { 
    id: 'login_7', 
    title: 'Weekly Habit', 
    description: 'Log in 7 days in a row and establish a strong routine.', 
    xp: 70, 
    category: 'daily', 
    goal: 7, 
    progress: 0,
    badge: '📅'
  },
  { 
    id: 'login_30', 
    title: 'Monthly Dedication', 
    description: 'Log in 30 days in a row and show your commitment.', 
    xp: 300, 
    category: 'daily', 
    goal: 30, 
    progress: 0,
    badge: '🌟'
  },

  // General
  { 
    id: 'dark_mode', 
    title: 'Into the Shadows', 
    description: 'Enable dark mode and protect your eyes.', 
    xp: 5, 
    category: 'general', 
    goal: 1, 
    progress: 0,
    badge: '🌙'
  },
  { 
    id: 'light_mode', 
    title: 'Out of the Cave', 
    description: 'Enable light mode and embrace the day.', 
    xp: 5, 
    category: 'general', 
    goal: 1, 
    progress: 0,
    badge: '☀️'
  },
  { 
    id: 'export_data', 
    title: 'Data Guardian', 
    description: 'Export your data and ensure its safety.', 
    xp: 20, 
    category: 'general', 
    goal: 1, 
    progress: 0,
    badge: '💾'
  },
  { 
    id: 'import_data', 
    title: 'Time Traveler', 
    description: 'Import data and bring your past work to the present.', 
    xp: 20, 
    category: 'general', 
    goal: 1, 
    progress: 0,
    badge: '⏳'
  },
  { 
    id: 'use_search', 
    title: 'Detective', 
    description: 'Use the search bar and find what you need.', 
    xp: 10, 
    category: 'general', 
    goal: 1, 
    progress: 0,
    badge: '🔍'
  },
  { 
    id: 'focus_task', 
    title: 'Focused Mind', 
    description: 'Add a task to Today\'s Focus and prioritize your work.', 
    xp: 15, 
    category: 'general', 
    goal: 1, 
    progress: 0,
    badge: '🎯'
  },

  // Higher Tier Missions
  { 
    id: 'note_200', 
    title: 'Librarian', 
    description: 'Create 200 notes and become a master of organization.', 
    xp: 1000, 
    category: 'notes', 
    goal: 200, 
    progress: 0,
    badge: '📚'
  },
  { 
    id: 'note_500', 
    title: 'Grand Historian', 
    description: 'Create 500 notes and become a legend of knowledge.', 
    xp: 2500, 
    category: 'notes', 
    goal: 500, 
    progress: 0,
    badge: '🏛️'
  },
  { 
    id: 'todo_500', 
    title: 'Execution Expert', 
    description: 'Complete 500 to-do items and become a productivity master.', 
    xp: 1000, 
    category: 'todos', 
    goal: 500, 
    progress: 0,
    badge: '⚡'
  },
  { 
    id: 'todo_1000', 
    title: 'Productivity Legend', 
    description: 'Complete 1000 to-do items and become a legend of productivity.', 
    xp: 2500, 
    category: 'todos', 
    goal: 1000, 
    progress: 0,
    badge: '🏆'
  },
  { 
    id: 'login_90', 
    title: 'Quarterly Check-in', 
    description: 'Log in 90 days in a row and show your dedication.', 
    xp: 1000, 
    category: 'daily', 
    goal: 90, 
    progress: 0,
    badge: '📅'
  },
  { 
    id: 'login_365', 
    title: 'Yearly Dedication', 
    description: 'Log in for a full year and become a true master.', 
    xp: 5000, 
    category: 'daily', 
    goal: 365, 
    progress: 0,
    badge: '👑'
  },

  // New General Missions
  { 
    id: 'add_link', 
    title: 'Link Collector', 
    description: 'Save your first link in the Bookmark Manager.', 
    xp: 15, 
    category: 'general', 
    goal: 1, 
    progress: 0,
    badge: '🔗'
  },
  { 
    id: 'upload_file', 
    title: 'Digital Packer', 
    description: 'Upload a file to the Secure Locker.', 
    xp: 20, 
    category: 'general', 
    goal: 1, 
    progress: 0,
    badge: '📦'
  },
  {
    id: 'share_10',
    title: 'Social Butterfly',
    description: 'Share the app with 10 friends and spread the productivity.',
    xp: 1000,
    category: 'general',
    goal: 10,
    progress: 0,
    badge: '🦋'
  },
  // New Special Missions
  {
    id: 'complete_all_todos',
    title: 'Task Master',
    description: 'Complete all your to-do items in a single day.',
    xp: 500,
    category: 'todos',
    goal: 1,
    progress: 0,
    badge: '🎯',
    reward: 'Special Task Master Badge'
  },
  {
    id: 'focus_3_tasks',
    title: 'Triple Focus',
    description: 'Add 3 tasks to Today\'s Focus.',
    xp: 100,
    category: 'general',
    goal: 1,
    progress: 0,
    badge: '🎯',
    reward: 'Focus Master Badge'
  },
  {
    id: 'note_1000',
    title: 'Knowledge Titan',
    description: 'Create 1000 notes and become a true master of knowledge.',
    xp: 5000,
    category: 'notes',
    goal: 1000,
    progress: 0,
    badge: '👑',
    reward: 'Knowledge Titan Badge'
  }
];
