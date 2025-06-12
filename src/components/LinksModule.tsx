
import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, Link as LinkIcon, Globe, Star, Edit3, Bookmark } from 'lucide-react';
import { StoredLink } from '../types';

interface LinksModuleProps {
  links: StoredLink[];
  setLinks: (links: StoredLink[]) => void;
}

const LinksModule = ({ links, setLinks }: LinksModuleProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' });
  const [filter, setFilter] = useState<'all' | 'bookmarked'>('all');

  const addLink = async () => {
    if (!newLink.url.trim() || !newLink.title.trim()) return;

    let finalUrl = newLink.url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      const domain = new URL(finalUrl).hostname;
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      const link: StoredLink = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: newLink.title,
        url: finalUrl,
        favicon,
        description: newLink.description,
        createdAt: new Date(),
        bookmarked: false
      };

      setLinks([link, ...links]);
      setNewLink({ title: '', url: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      alert('Please enter a valid URL');
    }
  };

  const updateLink = (id: string, updates: Partial<StoredLink>) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, ...updates } : link
    ));
  };

  const toggleBookmark = (id: string) => {
    updateLink(id, { bookmarked: !links.find(l => l.id === id)?.bookmarked });
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const filteredLinks = filter === 'bookmarked' 
    ? links.filter(link => link.bookmarked)
    : links;

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Saved Links</h1>
            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                All Links ({links.length})
              </button>
              <button
                onClick={() => setFilter('bookmarked')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  filter === 'bookmarked' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                <Bookmark size={16} />
                <span>Bookmarks ({links.filter(l => l.bookmarked).length})</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-300"
          >
            <Plus size={20} />
            <span>Add Link</span>
          </button>
        </div>

        {showAddForm && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-lg">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Add New Link</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Link Title"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-background text-foreground"
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-background text-foreground"
              />
              <textarea
                placeholder="Description (optional)"
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-background text-foreground h-24 resize-none"
              />
              <div className="flex space-x-3">
                <button
                  onClick={addLink}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  Save Link
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-secondary hover:bg-accent text-secondary-foreground px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredLinks.length === 0 ? (
          <div className="text-center py-16">
            <Globe size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {filter === 'bookmarked' ? 'No bookmarks yet' : 'No links saved yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filter === 'bookmarked' 
                ? 'Bookmark some links to see them here' 
                : 'Save your important links with beautiful visual previews'
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-300"
              >
                <Plus size={20} />
                <span>Add Your First Link</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link) => (
              <div 
                key={link.id} 
                className="bg-card rounded-xl border border-border p-6 hover:shadow-xl transition-all duration-300 hover:border-yellow-400 hover:-translate-y-1 relative group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {link.favicon ? (
                      <div className="relative">
                        <img
                          src={link.favicon}
                          alt=""
                          className="w-10 h-10 rounded-lg shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <LinkIcon size={40} className="text-yellow-600 hidden p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg" />
                      </div>
                    ) : (
                      <LinkIcon size={40} className="text-yellow-600 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                          {getDomainFromUrl(link.url)}
                        </span>
                        {link.bookmarked && (
                          <Star size={14} className="text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleBookmark(link.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        link.bookmarked 
                          ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900' 
                          : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                      }`}
                    >
                      <Star size={16} className={link.bookmarked ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-card-foreground mb-3 line-clamp-2 text-lg">
                  {link.title}
                </h3>
                
                {link.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {link.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                </div>
                
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm transition-all duration-300 hover:scale-105 font-medium"
                >
                  <ExternalLink size={16} />
                  <span>Visit Link</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinksModule;
