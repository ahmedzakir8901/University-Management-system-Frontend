import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Box, CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { toast } from 'react-hot-toast';

// Yup Validation Rules
const validationSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  cgpa: yup.number().min(0).max(4).required('CGPA must be between 0 and 4'),
});

function StudentFormModal({ open, onClose, student }) {
  const queryClient = useQueryClient();

  // React Hook Form setup
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema), // Connects Yup to RHF
    defaultValues: { firstName: '', lastName: '', email: '', cgpa: 0 }
  });

  // Pre-fill the form when editing
  useEffect(() => {
    if (student) {
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        cgpa: student.cgpa,
      });
    } else {
      reset({ firstName: '', lastName: '', email: '', cgpa: 0 });
    }
  }, [student, reset]);

  // Mutations for Create and Update
  const createMutation = useMutation({
    mutationFn: studentService.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student added successfully!');
      onClose();
    },
    onError: () => toast.error('Failed to add student')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => studentService.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully!');
      onClose();
    },
    onError: () => toast.error('Failed to update student')
  });

  const onSubmit = (data) => {
    if (student) {
      // If we have a student, we are updating
      updateMutation.mutate({ id: student.id, data });
    } else {
      // If no student, we are creating
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="cgpa"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CGPA"
                    type="number"
                    fullWidth
                    error={!!errors.cgpa}
                    helperText={errors.cgpa?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            student ? 'Update' : 'Add'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StudentFormModal;