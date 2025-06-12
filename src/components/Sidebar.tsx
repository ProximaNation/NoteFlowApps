import React from 'react';
import { StickyNote, CheckSquare, Settings, FolderLock, Link, LogOut, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  activeModule: 'notes' | 'todos' | 'locker' | 'links' | 'settings';
  setActiveModule: (module: 'notes' | 'todos' | 'locker' | 'links' | 'settings') => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ activeModule, setActiveModule, isOpen, setIsOpen }: SidebarProps) => {
  const { signOut, user } = useAuth();

  const menuItems = [
    { id: 'notes', label: 'Notes', icon: StickyNote, color: '#3B82F6' },
    { id: 'todos', label: 'To-Do List', icon: CheckSquare, color: '#10B981' },
    { id: 'locker', label: 'Locker', icon: FolderLock, color: '#8B5CF6' },
    { id: 'links', label: 'Bookmarks', icon: Link, color: '#F59E0B' },
    { id: 'settings', label: 'Settings', icon: Settings, color: '#6B7280' },
  ];

  // Achievements item (separate from main navigation)
  const achievementsItem = { id: 'achievements', label: 'Achievements', icon: Trophy, color: '#EF4444' };

  if (!isOpen) {
    return (
      <div className="w-16 border-r border-border bg-card flex flex-col items-center py-6 space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id as any)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${
              activeModule === item.id ? 'bg-accent shadow-md' : 'hover:bg-accent'
            }`}
          >
            <item.icon 
              size={20} 
              style={{ color: item.color }}
            />
          </button>
        ))}
        
        {/* Achievements button */}
        <button
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-accent"
        >
          <achievementsItem.icon 
            size={20} 
            style={{ color: achievementsItem.color }}
          />
        </button>
        
        <div className="flex-1"></div>
        
        <button
          onClick={signOut}
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-accent text-destructive"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">★</span>
          </div>
          <span className="font-bold text-lg text-foreground">NoteFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveModule(item.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                  activeModule === item.id 
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon 
                  size={18} 
                  style={{ color: activeModule === item.id ? '#3B82F6' : item.color }}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
          
          {/* Achievements item */}
          <li>
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <achievementsItem.icon 
                size={18} 
                style={{ color: achievementsItem.color }}
              />
              <span className="font-medium">{achievementsItem.label}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.email?.split('@')[0]}
            </p>
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          © 2024 NoteFlow
        </div>
      </div>
    </div>
  );
};

export default Sidebar;