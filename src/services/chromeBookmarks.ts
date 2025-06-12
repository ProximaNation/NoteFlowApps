import { useEffect, useState } from 'react';

export interface ChromeBookmark {
  id: string;
  title: string;
  url?: string;
  dateAdded?: number;
  children?: ChromeBookmark[];
  parentId?: string;
}

export const useChromeBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<ChromeBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        // Check if running in Chrome extension context
        if (typeof chrome === 'undefined' || !chrome.bookmarks) {
          throw new Error('Chrome bookmarks API is not available. Please run this as a Chrome extension.');
        }

        const tree = await chrome.bookmarks.getTree();
        setBookmarks(tree);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks');
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const addBookmark = async (bookmark: Omit<ChromeBookmark, 'id'>) => {
    try {
      if (typeof chrome === 'undefined' || !chrome.bookmarks) {
        throw new Error('Chrome bookmarks API is not available');
      }

      const newBookmark = await chrome.bookmarks.create({
        title: bookmark.title,
        url: bookmark.url,
        parentId: bookmark.parentId,
      });

      setBookmarks(prev => [...prev, newBookmark]);
      return newBookmark;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bookmark');
      throw err;
    }
  };

  const removeBookmark = async (id: string) => {
    try {
      if (typeof chrome === 'undefined' || !chrome.bookmarks) {
        throw new Error('Chrome bookmarks API is not available');
      }

      await chrome.bookmarks.remove(id);
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove bookmark');
      throw err;
    }
  };

  const updateBookmark = async (id: string, changes: Partial<ChromeBookmark>) => {
    try {
      if (typeof chrome === 'undefined' || !chrome.bookmarks) {
        throw new Error('Chrome bookmarks API is not available');
      }

      const updated = await chrome.bookmarks.update(id, changes);
      setBookmarks(prev => 
        prev.map(bookmark => 
          bookmark.id === id ? { ...bookmark, ...updated } : bookmark
        )
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bookmark');
      throw err;
    }
  };

  const moveBookmark = async (id: string, destination: { parentId?: string; index?: number }) => {
    try {
      if (typeof chrome === 'undefined' || !chrome.bookmarks) {
        throw new Error('Chrome bookmarks API is not available');
      }

      const moved = await chrome.bookmarks.move(id, destination);
      setBookmarks(prev => 
        prev.map(bookmark => 
          bookmark.id === id ? { ...bookmark, ...moved } : bookmark
        )
      );
      return moved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move bookmark');
      throw err;
    }
  };

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    updateBookmark,
    moveBookmark,
  };
}; 