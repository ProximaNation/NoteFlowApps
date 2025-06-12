import React from 'react';
import { Trophy, Star, Target, Award } from 'lucide-react';
import { Todo } from '../types';

interface GamificationPanelProps {
  todos: Todo[];
  focusedTasks: string[];
}

const GamificationPanel = ({ todos, focusedTasks }: GamificationPanelProps) => {
  const completedTasks = todos.filter(todo => todo.completed).length;
  const pendingTasks = todos.filter(todo => !todo.completed).length;
  const focusedCompleted = todos.filter(todo => todo.completed && focusedTasks.includes(todo.id)).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4 text-foreground">Progress</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center border border-border">
            <Trophy size={24} className="mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold text-card-foreground">{completedTasks}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center border border-border">
            <Target size={24} className="mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-bold text-card-foreground">{pendingTasks}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-center border border-border">
            <Star size={24} className="mx-auto mb-2 text-yellow-600" />
            <div className="text-lg font-bold text-card-foreground">{focusedCompleted}</div>
            <div className="text-xs text-muted-foreground">Focus Done</div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg text-center border border-border">
            <Award size={24} className="mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-bold text-card-foreground">{focusedTasks.length}</div>
            <div className="text-xs text-muted-foreground">Focused</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;