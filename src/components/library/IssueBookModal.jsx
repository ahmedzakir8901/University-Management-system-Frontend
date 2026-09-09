import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { libraryService } from '../../services/libraryService';
import { toast } from 'react-hot-toast';

function IssueBookModal({ open, onClose, book }) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-library'],
    queryFn: libraryService.getUsers,
  });

  useEffect(() => {
    if (book) {
      setSelectedUser('');
      setDueDate('');
      setError('');
    }
  }, [book]);

  const issueMutation = useMutation({
    mutationFn: (data) => libraryService.issueBook(book.id, data.userId, data.dueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book issued successfully!');
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!selectedUser || !dueDate) {
      setError('Please select a user and a due date');
      return;
    }
    issueMutation.mutate({ userId: selectedUser, dueDate });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Issue Book: {book?.title}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Available Copies: {book?.availableCopies}
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select User</InputLabel>
          <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} label="Select User">
            {users.map(user => (
              <MenuItem key={user.id} value={user.id}>
                {user.rollNumber} - {user.firstName} {user.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Due Date"
          type="date"
          fullWidth
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={issueMutation.isPending}>
          {issueMutation.isPending ? <CircularProgress size={24} /> : 'Issue Book'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IssueBookModal;