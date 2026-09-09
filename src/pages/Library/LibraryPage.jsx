import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, CircularProgress, Alert, Chip, TextField, InputAdornment } from '@mui/material';
import { Add, Edit, Delete, Search, BookmarkAdd, AssignmentReturn } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryService } from '../../services/libraryService';
import BookFormModal from '../../components/library/BookFormModal';
import IssueBookModal from '../../components/library/IssueBookModal';
import RoleGate from '../../components/RoleGate';

function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openBookModal, setOpenBookModal] = useState(false);
  const [openIssueModal, setOpenIssueModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const { data: books, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: libraryService.getBooks,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: libraryService.deleteBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  const returnMutation = useMutation({
    mutationFn: libraryService.returnBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const filteredBooks = (books || []).filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading books: {error.message}</Alert>;

  const handleAdd = () => { setEditingBook(null); setOpenBookModal(true); };
  const handleEdit = (book) => { setEditingBook(book); setOpenBookModal(true); };
  const handleIssue = (book) => { setSelectedBook(book); setOpenIssueModal(true); };
  const handleReturn = (id) => { returnMutation.mutate(id); };
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) deleteMutation.mutate(id);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Library Management</Typography>
        <RoleGate allowedRoles={['ADMIN', 'LIBRARIAN']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Book</Button>
        </RoleGate>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Search by title, ISBN, or author..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ISBN</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Publisher</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBooks.map((book) => (
              <TableRow key={book.id} hover>
                <TableCell>{book.isbn}</TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.publisher}</TableCell>
                <TableCell>
                  <Chip
                    label={`${book.availableCopies} / ${book.totalCopies}`}
                    color={book.availableCopies > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {book.availableCopies > 0 ? (
                    <IconButton color="primary" onClick={() => handleIssue(book)} title="Issue Book">
                      <BookmarkAdd />
                    </IconButton>
                  ) : (
                    <IconButton color="warning" onClick={() => handleReturn(book.id)} title="Return Book">
                      <AssignmentReturn />
                    </IconButton>
                  )}
                  <RoleGate allowedRoles={['ADMIN', 'LIBRARIAN']}>
                    <IconButton color="secondary" onClick={() => handleEdit(book)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(book.id)}><Delete /></IconButton>
                  </RoleGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <BookFormModal open={openBookModal} onClose={() => setOpenBookModal(false)} book={editingBook} />
      <IssueBookModal open={openIssueModal} onClose={() => setOpenIssueModal(false)} book={selectedBook} />
    </Box>
  );
}

export default LibraryPage;