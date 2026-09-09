import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Grid, CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import { toast } from 'react-hot-toast';

const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Content is required'),
  targetRole: yup.string().required('Please select a target role'),
});

function AnnouncementFormModal({ open, onClose }) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { title: '', content: '', targetRole: 'ALL' }
  });

  useEffect(() => {
    reset({ title: '', content: '', targetRole: 'ALL' });
  }, [reset]);

  const createMutation = useMutation({
    mutationFn: notificationService.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement published!');
      onClose();
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Post New Announcement</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller name="title" control={control} render={({ field }) => (
                <TextField {...field} label="Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller name="content" control={control} render={({ field }) => (
                <TextField {...field} label="Message" fullWidth multiline rows={4} error={!!errors.content} helperText={errors.content?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller name="targetRole" control={control} render={({ field }) => (
                <FormControl fullWidth error={!!errors.targetRole}>
                  <InputLabel>Target Audience</InputLabel>
                  <Select {...field} label="Target Audience">
                    <MenuItem value="ALL">Everyone</MenuItem>
                    <MenuItem value="STUDENT">Students Only</MenuItem>
                    <MenuItem value="FACULTY">Faculty Only</MenuItem>
                    <MenuItem value="ADMIN">Admins Only</MenuItem>
                  </Select>
                </FormControl>
              )} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={createMutation.isPending}>
          {createMutation.isPending ? <CircularProgress size={24} /> : 'Publish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AnnouncementFormModal;