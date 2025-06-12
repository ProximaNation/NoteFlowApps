
import React, { useState } from 'react';
import { Plus, Calendar, Flag, Trash2, Edit2, Check, Star, CheckSquare } from 'lucide-react';
import { Todo } from '../types';

interface TodoModuleProps {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  searchQuery: string;
  focusedTasks: string[];
  setFocusedTasks: (tasks: string[]) => void;
}

const TodoModule = ({ todos, setTodos, searchQuery, focusedTasks, setFocusedTasks }: TodoModuleProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444'
  };

  const addTodo = () => {
    if (!newTodoTitle.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      title: newTodoTitle,
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
    };

    setTodos([newTodo, ...todos]);
    setNewTodoTitle('');
  };

  const toggleTodo = (todoId: string) => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (todoId: string) => {
    setTodos(todos.filter(todo => todo.id !== todoId));
    setFocusedTasks(focusedTasks.filter(id => id !== todoId));
  };

  const updateTodoPriority = (todoId: string, priority: 'low' | 'medium' | 'high') => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, priority } : todo
    ));
  };

  const saveEdit = (todoId: string) => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, title: editTitle } : todo
    ));
    setEditingTodo(null);
    setEditTitle('');
  };

  const startEdit = (todo: Todo) => {
    setEditingTodo(todo.id);
    setEditTitle(todo.title);
  };

  const toggleFocus = (todoId: string) => {
    if (focusedTasks.includes(todoId)) {
      setFocusedTasks(focusedTasks.filter(id => id !== todoId));
    } else if (focusedTasks.length < 3) {
      setFocusedTasks([...focusedTasks, todoId]);
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'completed' && todo.completed) ||
                         (filter === 'pending' && !todo.completed);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">To-Do List</h1>
          
          {/* Add new todo */}
          <div className="flex space-x-4 mb-6">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              onClick={addTodo}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Task</span>
            </button>
          </div>

          {/* Filter buttons */}
          <div className="flex space-x-2 mb-6">
            {['all', 'pending', 'completed'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${
                  filter === filterType 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`p-4 bg-white border border-gray-200 rounded-lg transition-all duration-300 hover:shadow-md ${
                todo.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    todo.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {todo.completed && <Check size={14} className="text-white" />}
                </button>

                <div className="flex-1">
                  {editingTodo === todo.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                      onBlur={() => saveEdit(todo.id)}
                      className="w-full font-medium text-gray-800 border-none outline-none bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className={`font-medium text-gray-800 ${
                        todo.completed ? 'line-through' : ''
                      }`}
                    >
                      {todo.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Priority selector */}
                  <select
                    value={todo.priority}
                    onChange={(e) => updateTodoPriority(todo.id, e.target.value as any)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  <Flag 
                    size={16} 
                    style={{ color: priorityColors[todo.priority] }}
                  />

                  {/* Focus toggle */}
                  <button
                    onClick={() => toggleFocus(todo.id)}
                    disabled={!focusedTasks.includes(todo.id) && focusedTasks.length >= 3}
                    className={`p-1 rounded transition-all duration-300 ${
                      focusedTasks.includes(todo.id)
                        ? 'text-yellow-500'
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star size={16} />
                  </button>

                  <button
                    onClick={() => startEdit(todo)}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-300"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {todo.dueDate && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTodos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CheckSquare size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">
              {searchQuery ? 'No tasks match your search' : 'No tasks yet. Add one above!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoModule;
