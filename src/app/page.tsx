'use client';

import { useData } from '@/contexts/DataContext';
import { LoadingScreen, ErrorScreen } from '@/components/LoadingScreen';

export default function Home() {
  const { isLoading, error, notes, todos } = useData();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to NoteFlow</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Notes ({notes.length})</h2>
          {notes.length === 0 ? (
            <p className="text-muted-foreground">No notes yet. Create your first note!</p>
          ) : (
            <div className="space-y-4">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <h3 className="font-medium mb-2">{note.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Todos ({todos.length})</h2>
          {todos.length === 0 ? (
            <p className="text-muted-foreground">No todos yet. Add your first task!</p>
          ) : (
            <div className="space-y-2">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    className="h-4 w-4"
                    readOnly
                  />
                  <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>
                    {todo.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
} 