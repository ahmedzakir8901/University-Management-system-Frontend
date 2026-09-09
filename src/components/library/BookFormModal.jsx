import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Box, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryService } from '../../services/libraryService';
import { toast } from 'react-hot-toast';

const validationSchema = yup.object().shape({
  isbn: yup.string().required('ISBN is required'),
  title: yup.string().required('Title is required'),
  author: yup.string().required('Author is required'),
  publisher: yup.string().required('Publisher is required'),
  totalCopies: yup.number().min(1).required('Must have at least 1 copy'),
});

function BookFormModal({ open, onClose, book }) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { isbn: '', title: '', author: '', publisher: '', totalCopies: 1 }
  });

  useEffect(() => {
    if (book) {
      reset({ isbn: book.isbn, title: book.title, author: book.author, publisher: book.publisher, totalCopies: book.totalCopies });
    } else {
      reset({ isbn: '', title: '', author: '', publisher: '', totalCopies: 1 });
    }
  }, [book, reset]);

  const createMutation = useMutation({
    mutationFn: libraryService.createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book added successfully!');
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => libraryService.updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book updated successfully!');
      onClose();
    }
  });

  const onSubmit = (data) => {
    if (book) updateMutation.mutate({ id: book.id, data });
    else createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{book ? 'Edit Book' : 'Add New Book'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller name="isbn" control={control} render={({ field }) => (
                <TextField {...field} label="ISBN" fullWidth error={!!errors.isbn} helperText={errors.isbn?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller name="title" control={control} render={({ field }) => (
                <TextField {...field} label="Book Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller name="author" control={control} render={({ field }) => (
                <TextField {...field} label="Author" fullWidth error={!!errors.author} helperText={errors.author?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller name="publisher" control={control} render={({ field }) => (
                <TextField {...field} label="Publisher" fullWidth error={!!errors.publisher} helperText={errors.publisher?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller name="totalCopies" control={control} render={({ field }) => (
                <TextField {...field} label="Total Copies" type="number" fullWidth error={!!errors.totalCopies} helperText={errors.totalCopies?.message} />
              )} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={24} /> : (book ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookFormModal;