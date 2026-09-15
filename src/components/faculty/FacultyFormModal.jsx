import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Box, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../../services/facultyService';
import { toast } from 'react-hot-toast';

// Validation Schema (Designation is required!)
const validationSchema = yup.object().shape({
  employeeId: yup.string().required('Employee ID is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  departmentId: yup.number().required('Please select a department'),
  designation: yup.string().required('Please select a designation'),
});

function FacultyFormModal({ open, onClose, faculty }) {
  const queryClient = useQueryClient();

  // Fetch Departments for the Dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: facultyService.getAllDepartments,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { employeeId: '', firstName: '', lastName: '', email: '', departmentId: '', designation: '', joiningDate: '', officeRoom: '', specialization: '' }
  });

  useEffect(() => {
    if (faculty) {
      reset({
        employeeId: faculty.employeeId,
        firstName: faculty.firstName,
        lastName: faculty.lastName,
        email: faculty.email,
        departmentId: faculty.departmentId,
        designation: faculty.designation,
        joiningDate: faculty.joiningDate,
        officeRoom: faculty.officeRoom,
        specialization: faculty.specialization,
      });
    } else {
      reset({ employeeId: '', firstName: '', lastName: '', email: '', departmentId: '', designation: '', joiningDate: '', officeRoom: '', specialization: '' });
    }
  }, [faculty, reset]);

  const createMutation = useMutation({
    mutationFn: facultyService.createFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      toast.success('Faculty added successfully!');
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => facultyService.updateFaculty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      toast.success('Faculty updated successfully!');
      onClose();
    }
  });

  const onSubmit = (data) => {
    if (faculty) {
      updateMutation.mutate({ id: faculty.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{faculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Employee ID" fullWidth error={!!errors.employeeId} helperText={errors.employeeId?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="designation"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.designation}>
                    <InputLabel>Designation</InputLabel>
                    <Select {...field} label="Designation">
                      <MenuItem value="Professor">Professor</MenuItem>
                      <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                      <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                      <MenuItem value="Lecturer">Lecturer</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="First Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Last Name" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </Grid>

            {/* Dropdown for Department */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.departmentId}>
                    <InputLabel>Department</InputLabel>
                    <Select {...field} label="Department">
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Date Picker */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="joiningDate"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Joining Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="officeRoom"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Office Room" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="specialization"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Specialization" fullWidth />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={24} /> : (faculty ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FacultyFormModal;