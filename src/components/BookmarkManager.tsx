
import React, { useState, useEffect, useRef } from 'react';
import { Link, Bookmark, BookmarkCheck, Plus, Trash2, Upload, Star, ExternalLink, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BookmarkLink {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  description?: string;
  bookmarked: boolean;
  created_at: string;
}

interface ChromeBookmark {
  name: string;
  url: string;
  type?: string;
  children?: ChromeBookmark[];
}

const BookmarkManager = () => {
  const [links, setLinks] = useState<BookmarkLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'bookmarked'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLink = async () => {
    if (!newLinkUrl.trim() || !user) return;

    try {
      // Try to fetch favicon and title if not provided
      let title = newLinkTitle.trim();
      let favicon = null;

      if (!title) {
        title = new URL(newLinkUrl).hostname;
      }

      try {
        const domain = new URL(newLinkUrl).hostname;
        favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      } catch (e) {
        console.log('Could not generate favicon');
      }

      const { data, error } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          title,
          url: newLinkUrl,
          favicon,
          bookmarked: false
        })
        .select()
        .single();

      if (error) throw error;

      setLinks(prev => [data, ...prev]);
      setNewLinkUrl('');
      setNewLinkTitle('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Failed to add link. Please check the URL and try again.');
    }
  };

  const toggleBookmark = async (linkId: string, currentBookmarked: boolean) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ bookmarked: !currentBookmarked })
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, bookmarked: !currentBookmarked } : link
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const parseChromiumBookmarks = (bookmarks: ChromeBookmark[], parentPath = ''): ChromeBookmark[] => {
    const result: ChromeBookmark[] = [];
    
    bookmarks.forEach(bookmark => {
      if (bookmark.type === 'url' && bookmark.url) {
        result.push({
          name: bookmark.name,
          url: bookmark.url
        });
      } else if (bookmark.children) {
        result.push(...parseChromiumBookmarks(bookmark.children, `${parentPath}/${bookmark.name}`));
      }
    });
    
    return result;
  };

  const importBookmarks = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const text = await file.text();
      let bookmarks: ChromeBookmark[] = [];

      // Try parsing as JSON (Chrome export format)
      try {
        const jsonData = JSON.parse(text);
        if (jsonData.roots) {
          // Chrome bookmark format
          Object.values(jsonData.roots).forEach((root: any) => {
            if (root.children) {
              bookmarks.push(...parseChromiumBookmarks(root.children));
            }
          });
        }
      } catch (e) {
        // Try parsing as HTML (exported bookmarks)
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const anchors = doc.querySelectorAll('a[href]');
        
        anchors.forEach(anchor => {
          bookmarks.push({
            name: anchor.textContent || anchor.getAttribute('href') || '',
            url: anchor.getAttribute('href') || ''
          });
        });
      }

      // Import bookmarks to database
      const linksToImport = bookmarks
        .filter(bookmark => bookmark.url && bookmark.url.startsWith('http'))
        .map(bookmark => {
          const domain = new URL(bookmark.url).hostname;
          return {
            user_id: user.id,
            title: bookmark.name || domain,
            url: bookmark.url,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
            bookmarked: true
          };
        });

      if (linksToImport.length > 0) {
        const { data, error } = await supabase
          .from('links')
          .insert(linksToImport)
          .select();

        if (error) throw error;

        setLinks(prev => [...data, ...prev]);
        alert(`Successfully imported ${linksToImport.length} bookmarks!`);
      }
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      alert('Failed to import bookmarks. Please check the file format.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredLinks = links.filter(link => 
    filter === 'all' || (filter === 'bookmarked' && link.bookmarked)
  );

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Bookmark Manager</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Upload size={18} />
              <span>Import</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={18} />
              <span>Add Link</span>
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={importBookmarks}
          accept=".json,.html"
          className="hidden"
        />

        {/* Filter buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All Links
          </button>
          <button
            onClick={() => setFilter('bookmarked')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'bookmarked' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Bookmarked
          </button>
        </div>

        {/* Add Link Form */}
        {showAddForm && (
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Add New Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">URL</label>
                <input
                  type="url"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Link title"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewLinkUrl('');
                    setNewLinkTitle('');
                  }}
                  className="px-4 py-2 border border-border rounded-lg text-card-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addLink}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredLinks.length === 0 ? (
          <div className="text-center py-16">
            <Globe size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No links yet</h3>
            <p className="text-muted-foreground mb-6">
              Add links manually or import your bookmarks from Chrome
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Add Your First Link
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Import Bookmarks
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link) => (
              <div key={link.id} className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-amber-300 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {link.favicon ? (
                      <img 
                        src={link.favicon} 
                        alt="" 
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe size={32} className="text-amber-600" />
                    )}
                    {link.bookmarked && (
                      <Star size={16} className="text-amber-500 fill-current" />
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => toggleBookmark(link.id, link.bookmarked)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      {link.bookmarked ? (
                        <BookmarkCheck size={16} className="text-amber-500" />
                      ) : (
                        <Bookmark size={16} className="text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-card-foreground mb-2 truncate group-hover:text-amber-600 transition-colors" title={link.title}>
                  {link.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 truncate" title={link.url}>
                  {link.url}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(link.created_at).toLocaleDateString()}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm transition-all duration-300 hover:scale-105"
                  >
                    <ExternalLink size={14} />
                    <span>Visit</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkManager;
