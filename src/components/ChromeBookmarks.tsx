import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useChromeBookmarks, ChromeBookmark } from '../services/chromeBookmarks';

const ChromeBookmarks: React.FC = () => {
  const { bookmarks, loading, error, addBookmark, removeBookmark, updateBookmark } = useChromeBookmarks();
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '' });
  const [editingBookmark, setEditingBookmark] = useState<ChromeBookmark | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddBookmark = async () => {
    try {
      await addBookmark({
        title: newBookmark.title,
        url: newBookmark.url,
      });
      setNewBookmark({ title: '', url: '' });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Failed to add bookmark:', err);
    }
  };

  const handleEditBookmark = async () => {
    if (!editingBookmark) return;
    try {
      await updateBookmark(editingBookmark.id, {
        title: editingBookmark.title,
        url: editingBookmark.url,
      });
      setEditingBookmark(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Failed to update bookmark:', err);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      await removeBookmark(id);
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
    }
  };

  const renderBookmark = (bookmark: ChromeBookmark) => {
    const isFolder = !bookmark.url && bookmark.children;
    
    return (
      <ListItem key={bookmark.id}>
        {isFolder ? <FolderIcon sx={{ mr: 1 }} /> : <LinkIcon sx={{ mr: 1 }} />}
        <ListItemText
          primary={bookmark.title}
          secondary={bookmark.url}
        />
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => {
              setEditingBookmark(bookmark);
              setIsEditDialogOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => handleDeleteBookmark(bookmark.id)}
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Chrome Bookmarks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Add Bookmark
        </Button>
        <List>
          {bookmarks.map(renderBookmark)}
        </List>
      </Paper>

      {/* Add Bookmark Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add New Bookmark</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newBookmark.title}
            onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            value={newBookmark.url}
            onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBookmark} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Bookmark Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Bookmark</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editingBookmark?.title || ''}
            onChange={(e) => setEditingBookmark(prev => prev ? { ...prev, title: e.target.value } : null)}
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            value={editingBookmark?.url || ''}
            onChange={(e) => setEditingBookmark(prev => prev ? { ...prev, url: e.target.value } : null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditBookmark} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChromeBookmarks; 