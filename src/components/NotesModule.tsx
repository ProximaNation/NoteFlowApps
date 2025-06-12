
import React, { useState } from 'react';
import { Plus, Pin, Edit, Trash2, Copy, Save, StickyNote } from 'lucide-react';
import { Note } from '../types';

interface NotesModuleProps {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  searchQuery: string;
}

const NotesModule = ({ notes, setNotes, searchQuery }: NotesModuleProps) => {
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      pinned: false,
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (activeNote?.id === noteId) {
      setActiveNote(null);
      setIsEditing(false);
    }
  };

  const pinNote = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, pinned: !note.pinned } : note
    ));
  };

  const duplicateNote = (note: Note) => {
    const duplicatedNote: Note = {
      ...note,
      id: Date.now().toString(),
      title: `${note.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([duplicatedNote, ...notes]);
  };

  const saveNote = () => {
    if (activeNote) {
      setNotes(notes.map(note => 
        note.id === activeNote.id 
          ? { ...note, title: editTitle, content: editContent, updatedAt: new Date() }
          : note
      ));
      setActiveNote({ ...activeNote, title: editTitle, content: editContent });
      setIsEditing(false);
    }
  };

  const startEditing = (note: Note) => {
    setActiveNote(note);
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="flex h-full">
      {/* Notes List */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <button
            onClick={createNote}
            className="w-full flex items-center space-x-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02]"
          >
            <Plus size={18} />
            <span>New Note</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`p-4 bg-white rounded-lg border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                activeNote?.id === note.id ? 'ring-2 ring-black' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm truncate flex-1">{note.title}</h3>
                <div className="flex items-center space-x-1 ml-2">
                  {note.pinned && <Pin size={12} style={{ color: '#F59E0B' }} />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      pinNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all duration-300"
                  >
                    <Pin size={12} className={note.pinned ? 'text-yellow-500' : 'text-gray-400'} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {note.content || 'No content'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(note);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-all duration-300"
                  >
                    <Edit size={12} style={{ color: '#3B82F6' }} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateNote(note);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-all duration-300"
                  >
                    <Copy size={12} style={{ color: '#10B981' }} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-all duration-300"
                  >
                    <Trash2 size={12} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 flex flex-col">
        {activeNote ? (
          <>
            <div className="border-b border-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-xl font-bold w-full border-none outline-none"
                      placeholder="Note title..."
                    />
                  ) : (
                    <h1 className="text-xl font-bold">{activeNote.title}</h1>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  {isEditing ? (
                    <button
                      onClick={saveNote}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(activeNote)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 p-6">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full resize-none border-none outline-none text-gray-800 leading-relaxed"
                  placeholder="Start writing your note..."
                />
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {activeNote.content || 'This note is empty. Click Edit to start writing.'}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <StickyNote size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a note to view or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesModule;
