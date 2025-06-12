import React from 'react';
import { Star, Check } from 'lucide-react';
import { Todo } from '../types';
import GamificationPanel from './GamificationPanel';

interface TodaysFocusProps {
  todos: Todo[];
  focusedTasks: string[];
  setFocusedTasks: (tasks: string[]) => void;
}

const TodaysFocus = ({ todos, focusedTasks, setFocusedTasks }: TodaysFocusProps) => {
  const focusedTodos = todos.filter(todo => focusedTasks.includes(todo.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4 text-foreground">Today's Focus</h2>
        <div className="space-y-3">
          {focusedTodos.map((todo) => (
            <div
              key={todo.id}
              className={`p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg transition-all duration-300 ${
                todo.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    todo.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-yellow-400 hover:border-yellow-500'
                  }`}
                >
                  {todo.completed && <Check size={12} className="text-white" />}
                </button>
                <span className={`text-sm font-medium ${
                  todo.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'
                }`}>
                  {todo.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {focusedTodos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Star size={32} className="mx-auto mb-2 text-yellow-500" />
            <p className="text-sm">Select up to 3 important tasks to focus on today</p>
          </div>
        )}
      </div>

      <GamificationPanel todos={todos} focusedTasks={focusedTasks} />
    </div>
  );
};

export default TodaysFocus;