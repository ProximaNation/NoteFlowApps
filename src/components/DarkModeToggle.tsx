
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from './ui/switch';

interface DarkModeToggleProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const DarkModeToggle = ({ darkMode, setDarkMode }: DarkModeToggleProps) => {
  return (
    <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <Sun size={16} className="text-yellow-500 dark:text-yellow-400" />
      <Switch
        checked={darkMode}
        onCheckedChange={setDarkMode}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
      />
      <Moon size={16} className="text-gray-600 dark:text-gray-300" />
    </div>
  );
};

export default DarkModeToggle;
